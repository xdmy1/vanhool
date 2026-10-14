/**
 * Proforma → factură stock rule: the LAST PURCHASE of the part code decides
 * where the goods come from (matched normalized: dots / commas / spaces /
 * case ignored). Run with `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  newResolverCache,
  openLineRemaining,
  receiveFromOpenPurchase,
  resolveSaleLine,
} from "@/lib/panel/invoices/sale-line-resolver";
import { insertMintedProduct } from "@/lib/panel/purchases/mint-product";
import {
  applyStockMovement,
  netDraftReceives,
  reversePurchaseLines,
  settlePurchaseCancelNet,
  type StockDb,
} from "@/lib/stock-ledger";

type Row = Record<string, unknown>;

// ---- tiny in-memory stand-in for the Supabase query builder ---------------
// Only the surface the resolver uses: select/insert/update, eq/is/in/ilike/
// contains, order/limit, single/maybeSingle, the thenable result, the
// `apply_stock_movement` RPC (ledger row + stock update, unique ref) and the
// case-insensitive unique part_code of products (error code 23505).

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** PostgREST ilike: `%` any run, `_` one char, backslash escapes, case-insensitive. */
function ilikeToRegex(pattern: string): RegExp {
  let src = "^";
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === "\\" && i + 1 < pattern.length) src += escapeRe(pattern[++i]);
    else if (ch === "%") src += ".*";
    else if (ch === "_") src += ".";
    else src += escapeRe(ch);
  }
  return new RegExp(src + "$", "i");
}

class FakeDb {
  tables: Record<string, Row[]> = {};
  seq = 0;
  from(table: string): FakeQuery {
    return new FakeQuery(this, table);
  }
  rows(table: string): Row[] {
    return this.tables[table] ?? (this.tables[table] = []);
  }
  /** Mirror of sql/stock-accuracy.sql apply_stock_movement. */
  rpc(name: string, params: Record<string, unknown>): Promise<Result> {
    if (name !== "apply_stock_movement") {
      return Promise.resolve({ data: null, error: { message: `unknown rpc ${name}` } });
    }
    const product = this.rows("products").find((r) => r.id === params.p_product_id);
    if (!product) return Promise.resolve({ data: false, error: null });
    const movements = this.rows("stock_movements");
    if (movements.some((m) => m.ref === params.p_ref)) {
      return Promise.resolve({ data: false, error: null });
    }
    const delta = Math.round(Number(params.p_delta) * 1000) / 1000;
    movements.push({
      id: `mv-${++this.seq}`,
      product_id: params.p_product_id,
      delta,
      reason: params.p_reason,
      ref: params.p_ref,
      order_id: params.p_order_id ?? null,
      purchase_id: params.p_purchase_id ?? null,
      created_at: new Date().toISOString(),
    });
    product.stock_quantity =
      Math.round((Number(product.stock_quantity ?? 0) + delta) * 1000) / 1000;
    return Promise.resolve({ data: true, error: null });
  }
}

type Result = { data: unknown; error: { message: string; code?: string } | null };

class FakeQuery {
  private db: FakeDb;
  private table: string;
  private filters: Array<(r: Row) => boolean> = [];
  private op: "select" | "insert" | "update" = "select";
  private payload: Row | null = null;
  private orderBy: { col: string; asc: boolean } | null = null;
  private max: number | null = null;
  private mode: "many" | "single" | "maybe" = "many";

  constructor(db: FakeDb, table: string) {
    this.db = db;
    this.table = table;
  }
  select(): this {
    return this;
  }
  insert(row: Row): this {
    this.op = "insert";
    this.payload = row;
    return this;
  }
  update(patch: Row): this {
    this.op = "update";
    this.payload = patch;
    return this;
  }
  eq(col: string, val: unknown): this {
    this.filters.push((r) => r[col] === val);
    return this;
  }
  is(col: string, val: unknown): this {
    this.filters.push((r) => (val === null ? r[col] == null : r[col] === val));
    return this;
  }
  in(col: string, vals: unknown[]): this {
    const set = new Set(vals);
    this.filters.push((r) => set.has(r[col]));
    return this;
  }
  ilike(col: string, pattern: string): this {
    const re = ilikeToRegex(pattern);
    this.filters.push((r) => typeof r[col] === "string" && re.test(r[col] as string));
    return this;
  }
  contains(col: string, vals: unknown[]): this {
    this.filters.push(
      (r) => Array.isArray(r[col]) && vals.every((v) => (r[col] as unknown[]).includes(v)),
    );
    return this;
  }
  order(col: string, o?: { ascending?: boolean }): this {
    this.orderBy = { col, asc: o?.ascending ?? true };
    return this;
  }
  limit(n: number): this {
    this.max = n;
    return this;
  }
  single(): this {
    this.mode = "single";
    return this;
  }
  maybeSingle(): this {
    this.mode = "maybe";
    return this;
  }
  private run(): Result {
    const rows = this.db.rows(this.table);
    if (this.op === "insert") {
      if (this.table === "products") {
        const code = String(this.payload?.part_code ?? "").toLowerCase();
        const slug = this.payload?.slug;
        const taken = rows.some(
          (r) =>
            String(r.part_code ?? "").toLowerCase() === code ||
            (slug != null && r.slug === slug),
        );
        if (taken) {
          return {
            data: null,
            error: {
              code: "23505",
              message:
                'duplicate key value violates unique constraint "products_part_code_unique_idx"',
            },
          };
        }
      }
      const row: Row = {
        id: `gen-${++this.db.seq}`,
        created_at: new Date().toISOString(),
        ...(this.payload ?? {}),
      };
      rows.push(row);
      return this.finish([row]);
    }
    let out = rows.filter((r) => this.filters.every((f) => f(r)));
    if (this.op === "update") {
      for (const r of out) Object.assign(r, this.payload ?? {});
      return { data: null, error: null };
    }
    if (this.orderBy) {
      const { col, asc } = this.orderBy;
      out = [...out].sort(
        (a, b) => String(a[col] ?? "").localeCompare(String(b[col] ?? "")) * (asc ? 1 : -1),
      );
    }
    if (this.max != null) out = out.slice(0, this.max);
    return this.finish(out);
  }
  private finish(out: Row[]): Result {
    if (this.mode === "single") {
      return out.length === 1
        ? { data: out[0], error: null }
        : { data: null, error: { message: `expected 1 row, got ${out.length}` } };
    }
    if (this.mode === "maybe") return { data: out[0] ?? null, error: null };
    return { data: out, error: null };
  }
  then<T>(resolve: (v: Result) => T, reject?: (e: unknown) => T): Promise<T> {
    return Promise.resolve(this.run()).then(resolve, reject);
  }
}

const asDb = (db: FakeDb) => db as unknown as StockDb;

function seedPurchase(
  db: FakeDb,
  head: Row,
  lines: Row[],
): void {
  db.rows("purchases").push({ fx_rate: null, document_number: null, ...head });
  for (const l of lines) {
    db.rows("purchase_items").push({
      product_id: null,
      internal_code: null,
      vat_rate: 20,
      created_at: head.created_at,
      ...l,
      purchase_id: head.id,
    });
  }
}

// ---- tests -----------------------------------------------------------------

test("draft achiziție, code with dots vs spaces → product minted from the last purchase, line linked, cost in gross MDL", async () => {
  const db = new FakeDb();
  seedPurchase(
    db,
    { id: "p1", status: "draft", supplier_id: "s1", currency: "EUR", created_at: "2026-09-24T10:00:00Z" },
    [{ id: "l1", supplier_code: "0.986.435.123", description: "Pompa apa", quantity: 1, unit_cost: 100 }],
  );
  const line = { productId: null, partCode: "0 986 435 123", name: "Pompa apa", quantity: 1, unit: "buc" };

  const r = await resolveSaleLine(asDb(db), line, {
    createFromDraft: true,
    markupFactor: 1.3,
    cache: newResolverCache(),
  });

  assert.equal(r.via, "purchase_new_product");
  assert.ok(r.productId, "a product id is returned");
  assert.equal(r.costMdl, 2400, "100 net × 1.2 TVA × 20 MDL/EUR");
  assert.equal(r.purchase?.lineId, "l1");
  assert.equal(r.purchase?.status, "draft");

  const products = db.rows("products");
  assert.equal(products.length, 1, "exactly one product minted");
  const p = products[0];
  assert.equal(p.id, r.productId);
  assert.equal(p.part_code, "0.986.435.123");
  assert.equal(p.supplier_code, "0.986.435.123");
  assert.equal(p.name_ro, "Pompa apa");
  assert.equal(p.cost_price, 2400);
  assert.equal(p.price, 3120);
  assert.equal(p.stock_quantity, 0, "stock starts at 0; the sale's ledger movement takes it to −1, the post brings it to 0");
  assert.equal(p.is_active, false);
  assert.equal(p.internal_only, true);
  assert.equal(p.supplier_id, "s1");
  assert.equal(db.rows("purchase_items")[0].product_id, r.productId, "draft line linked → the post lands +1 on the same product");

  // Second pass for the same line (retry / double-click) must reuse, never re-mint.
  const again = await resolveSaleLine(asDb(db), line, { createFromDraft: true, markupFactor: 1.3 });
  assert.equal(again.via, "purchase");
  assert.equal(again.productId, r.productId);
  assert.equal(db.rows("products").length, 1);
});

test("posted achiziție + existing product, line without productId, spacing/case differs → that purchase's product, nothing minted", async () => {
  const db = new FakeDb();
  db.rows("products").push({
    id: "prodA",
    part_code: "HU 7010 Z",
    supplier_code: "69911",
    search_codes: ["HU7010Z", "69911"],
    stock_quantity: 10,
    created_at: "2026-08-12T09:00:00Z",
  });
  seedPurchase(
    db,
    { id: "p2", status: "posted", supplier_id: "s1", currency: "MDL", document_number: "AAZ5630236", created_at: "2026-08-12T09:00:00Z" },
    [{ id: "l2", product_id: "prodA", supplier_code: "69911", internal_code: "HU 7010 Z", description: "Filtru ulei", quantity: 10, unit_cost: 150 }],
  );
  const line = { productId: null, partCode: "hu7010z", quantity: 1 };

  const r = await resolveSaleLine(asDb(db), line, { createFromDraft: true, markupFactor: 1.3 });

  assert.equal(r.via, "purchase");
  assert.equal(r.productId, "prodA");
  assert.equal(r.costMdl, 180, "150 net × 1.2 TVA, MDL");
  assert.equal(r.purchase?.documentNumber, "AAZ5630236");
  assert.equal(db.rows("products").length, 1, "no duplicate product");
  assert.equal(db.rows("purchase_items")[0].product_id, "prodA", "line untouched");
});

test("two purchases for the same code → the MOST RECENT one's product wins; cancelled ignored; frozen productId still wins", async () => {
  const db = new FakeDb();
  db.rows("products").push(
    { id: "prodOld", part_code: "K035675XS", search_codes: ["K035675XS"], created_at: "2026-07-01T00:00:00Z" },
    { id: "prodNew", part_code: "K 035675 XS", search_codes: ["K035675XS"], created_at: "2026-09-01T00:00:00Z" },
  );
  seedPurchase(
    db,
    { id: "pOld", status: "posted", supplier_id: "s1", currency: "MDL", created_at: "2026-07-01T00:00:00Z" },
    [{ id: "lOld", product_id: "prodOld", supplier_code: "K035675XS", quantity: 1, unit_cost: 500 }],
  );
  seedPurchase(
    db,
    { id: "pNew", status: "posted", supplier_id: "s2", currency: "MDL", created_at: "2026-09-01T00:00:00Z" },
    [{ id: "lNew", product_id: "prodNew", supplier_code: "K 035675 XS", quantity: 1, unit_cost: 600 }],
  );
  seedPurchase(
    db,
    { id: "pCancelled", status: "cancelled", supplier_id: "s1", currency: "MDL", created_at: "2026-10-01T00:00:00Z" },
    [{ id: "lCancelled", product_id: "prodOld", supplier_code: "K035675XS", quantity: 1, unit_cost: 900 }],
  );

  const byCode = await resolveSaleLine(asDb(db), { partCode: "K035675XS", quantity: 1 }, { createFromDraft: true });
  assert.equal(byCode.via, "purchase");
  assert.equal(byCode.productId, "prodNew", "last purchase (Sept) wins over the older one (July)");
  assert.equal(byCode.costMdl, 720, "cost comes from that last purchase, not the cancelled one");
  assert.equal(byCode.purchase?.lineId, "lNew");

  const frozen = await resolveSaleLine(asDb(db), { productId: "prodOld", partCode: "K035675XS", quantity: 1 }, { createFromDraft: true });
  assert.equal(frozen.via, "frozen");
  assert.equal(frozen.productId, "prodOld", "the operator's explicit catalog pick is kept");
  assert.equal(frozen.costMdl, 720, "…but the cost still reflects the last purchase");
  assert.equal(db.rows("products").length, 2, "nothing minted");
});

test("no purchase and no catalog product → null, nothing minted (no phantom product)", async () => {
  const db = new FakeDb();
  seedPurchase(
    db,
    { id: "pX", status: "draft", supplier_id: "s1", currency: "MDL", created_at: "2026-10-01T00:00:00Z" },
    [{ id: "lX", supplier_code: "OTHER-CODE", quantity: 1, unit_cost: 10 }],
  );
  const r = await resolveSaleLine(asDb(db), { partCode: "ZZZ-999", quantity: 1 }, { createFromDraft: true });
  assert.equal(r.via, "none");
  assert.equal(r.productId, null);
  assert.equal(r.purchase, null);
  assert.equal(db.rows("products").length, 0);
  assert.equal(db.rows("purchase_items")[0].product_id, null);
});

test("same internal code typed on two draft lines (different supplier codes) → two products, the second takes the supplier code; both lines linked", async () => {
  // IB0293: "CAP DE BARA" on NI-ES-14847 AND on NI-ES-14848 — the second
  // mint hit the unique part_code and the line stayed unresolved (no stock).
  const db = new FakeDb();
  seedPurchase(
    db,
    { id: "P-draft", status: "draft", created_at: "2026-10-13T15:01:38Z", supplier_id: "SUP", currency: "MDL" },
    [
      { id: "L-47", supplier_code: "NI-ES-14847", internal_code: "CAP DE BARA", description: "Cap de bara", quantity: 1, unit_cost: 172.9 },
      { id: "L-48", supplier_code: "NI-ES-14848", internal_code: "CAP DE BARA", description: "Cap de bara", quantity: 1, unit_cost: 172.9 },
    ],
  );
  const cache = newResolverCache();
  const a = await resolveSaleLine(asDb(db), { partCode: "NI-ES-14847", quantity: 1 }, { createFromDraft: true, markupFactor: 1.3, cache });
  const b = await resolveSaleLine(asDb(db), { partCode: "NI-ES-14848", quantity: 1 }, { createFromDraft: true, markupFactor: 1.3, cache });
  assert.equal(a.via, "purchase_new_product");
  assert.equal(b.via, "purchase_new_product");
  assert.ok(a.productId && b.productId && a.productId !== b.productId);
  const products = db.rows("products");
  assert.equal(products.length, 2);
  const pa = products.find((p) => p.id === a.productId)!;
  const pb = products.find((p) => p.id === b.productId)!;
  assert.equal(pa.part_code, "CAP DE BARA");
  assert.equal(pb.part_code, "NI-ES-14848");
  assert.equal(pb.supplier_code, "NI-ES-14848");
  assert.equal(pb.cost_price, 207.48); // 172.9 × 1.2, MDL
  assert.equal(pb.slug, "ni-es-14848-L-48"); // code slug + line id prefix (uuid hex in prod)
  const lines = db.rows("purchase_items");
  assert.equal(lines.find((l) => l.id === "L-47")!.product_id, a.productId);
  assert.equal(lines.find((l) => l.id === "L-48")!.product_id, b.productId);
  assert.deepEqual(a.openLine, { lineId: "L-47", purchaseId: "P-draft", productId: a.productId, quantity: 1 });
  assert.deepEqual(b.openLine, { lineId: "L-48", purchaseId: "P-draft", productId: b.productId, quantity: 1 });
});

test("sold from a draft achiziție: its quantity enters stock at sale time (bought 2, sold 2 → 0, not −2); the post nets the receipt (0, not 2)", async () => {
  const db = new FakeDb();
  seedPurchase(
    db,
    { id: "P-draft", status: "draft", created_at: "2026-10-13T15:01:38Z", supplier_id: "SUP", currency: "MDL" },
    [{ id: "L-1", supplier_code: "CTRCB0332", description: "Pivot axa fata", quantity: 2, unit_cost: 158.31 }],
  );
  const r = await resolveSaleLine(asDb(db), { partCode: "CTRCB0332", quantity: 2 }, { createFromDraft: true, markupFactor: 1.3 });
  assert.equal(r.via, "purchase_new_product");
  const pid = r.productId!;
  assert.deepEqual(r.openLine, { lineId: "L-1", purchaseId: "P-draft", productId: pid, quantity: 2 });
  const stock = () => db.rows("products").find((p) => p.id === pid)!.stock_quantity;

  // Conversion: receive from the open line, then the sale takes 2.
  assert.deepEqual(await receiveFromOpenPurchase(asDb(db), r.openLine, 2, "u1"), { ok: true, received: 2 });
  await applyStockMovement(asDb(db), { productId: pid, delta: -2, reason: "sale", ref: `sale:O1:${pid}`, orderId: "O1" });
  assert.equal(stock(), 0);

  // A second sale before the post: the line was already received in full →
  // nothing more comes in, stock goes negative honestly.
  assert.deepEqual(await receiveFromOpenPurchase(asDb(db), r.openLine, 1, "u1"), { ok: true, received: 0 });

  // The post: +2 lands through purchase_post, the provisional receipt leaves.
  await applyStockMovement(asDb(db), { productId: pid, delta: 2, reason: "purchase_post", ref: "purchase_post:L-1", purchaseId: "P-draft" });
  assert.equal(stock(), 2);
  assert.deepEqual(await netDraftReceives(asDb(db), "P-draft", "u1"), { ok: true });
  assert.equal(stock(), 0);
  assert.deepEqual(await netDraftReceives(asDb(db), "P-draft", "u1"), { ok: true }); // idempotent
  assert.equal(stock(), 0);
  assert.deepEqual(
    db.rows("stock_movements").map((m) => m.ref),
    [`draft_receive:P-draft:${pid}:0`, `sale:O1:${pid}`, "purchase_post:L-1", `draft_receive_net:P-draft:${pid}:0`],
  );
});

test("a product that covers the sale receives nothing from a pending purchase (no phantom stock); once the shelf is empty the open line comes in, and a raised line tops up only the difference; a posted purchase is never an open line", async () => {
  const db = new FakeDb();
  db.rows("products").push({ id: "prodA", part_code: "HU 7010 Z", supplier_code: null, search_codes: ["HU7010Z"], stock_quantity: 5, created_at: "2026-01-01T00:00:00Z" });
  db.rows("products").push({ id: "prodB", part_code: "VAL715820", supplier_code: null, search_codes: ["VAL715820"], stock_quantity: 0, created_at: "2026-01-01T00:00:00Z" });
  seedPurchase(
    db,
    { id: "P-open", status: "ordered", created_at: "2026-10-10T00:00:00Z", supplier_id: "SUP", currency: "MDL" },
    [{ id: "L-1", supplier_code: "HU 7010 Z", description: "Filtru", quantity: 10, unit_cost: 100, product_id: "prodA" }],
  );
  seedPurchase(
    db,
    { id: "P-posted", status: "posted", created_at: "2026-10-01T00:00:00Z", supplier_id: "SUP", currency: "MDL" },
    [{ id: "L-9", supplier_code: "VAL715820", description: "Filtru habitaclu", quantity: 1, unit_cost: 100, product_id: "prodB" }],
  );
  const stockA = () => db.rows("products").find((p) => p.id === "prodA")!.stock_quantity;

  const r = await resolveSaleLine(asDb(db), { partCode: "hu7010z", quantity: 1 }, { createFromDraft: true });
  assert.equal(r.via, "purchase");
  assert.equal(r.productId, "prodA");
  assert.deepEqual(r.openLine, { lineId: "L-1", purchaseId: "P-open", productId: "prodA", quantity: 10 });
  assert.deepEqual(await receiveFromOpenPurchase(asDb(db), r.openLine, 1), { ok: true, received: 0 });
  assert.equal(stockA(), 5);
  assert.equal(db.rows("stock_movements").length, 0);

  // Shelf runs out: the next sale is served by the open purchase → its 10 come in.
  db.rows("products").find((p) => p.id === "prodA")!.stock_quantity = 0;
  assert.deepEqual(await receiveFromOpenPurchase(asDb(db), r.openLine, 1), { ok: true, received: 10 });
  assert.equal(stockA(), 10);

  // Draft re-saved with 12 (new line id, same product) and a sale of 11 → only the 2 missing come in.
  assert.deepEqual(await receiveFromOpenPurchase(asDb(db), { ...r.openLine!, lineId: "L-1b", quantity: 12 }, 11), { ok: true, received: 2 });
  assert.equal(stockA(), 12);

  // Frozen productId on the line (operator picked the catalog product): same open line found through the product.
  const frozen = await resolveSaleLine(asDb(db), { productId: "prodA", partCode: "", quantity: 1 }, { createFromDraft: true });
  assert.equal(frozen.via, "frozen");
  assert.deepEqual(frozen.openLine, { lineId: "L-1", purchaseId: "P-open", productId: "prodA", quantity: 10 });

  // Posted purchase → no open line, nothing to receive.
  const posted = await resolveSaleLine(asDb(db), { partCode: "VAL715820", quantity: 1 }, { createFromDraft: true });
  assert.equal(posted.via, "purchase");
  assert.equal(posted.productId, "prodB");
  assert.equal(posted.openLine, null);
});

test("openLineRemaining: the wizard's stock check counts only what the open line can STILL bring in (0 once received; the raise after a re-save)", async () => {
  const db = new FakeDb();
  db.rows("products").push({ id: "prodA", part_code: "X1", supplier_code: null, search_codes: ["X1"], stock_quantity: 0, created_at: "2026-01-01T00:00:00Z" });
  const open = { lineId: "L-1", purchaseId: "P-open", productId: "prodA", quantity: 2 };
  assert.deepEqual(await openLineRemaining(asDb(db), open), { ok: true, remaining: 2, seq: 0 });
  await applyStockMovement(asDb(db), { productId: "prodA", delta: 2, reason: "draft_receive", ref: "draft_receive:P-open:prodA:0", purchaseId: "P-open" });
  assert.deepEqual(await openLineRemaining(asDb(db), open), { ok: true, remaining: 0, seq: 1 });
  assert.deepEqual(await openLineRemaining(asDb(db), { ...open, quantity: 5 }), { ok: true, remaining: 3, seq: 1 });
  await applyStockMovement(asDb(db), { productId: "prodA", delta: -2, reason: "draft_receive_net", ref: "draft_receive_net:P-open:prodA:0", purchaseId: "P-open" });
  assert.deepEqual(await openLineRemaining(asDb(db), open), { ok: true, remaining: 2, seq: 1 });
});

test("sale racing a cancel: the receipt written after the purchase closed is withdrawn by the sale itself (no orphan +qty)", async () => {
  const db = new FakeDb();
  seedPurchase(
    db,
    { id: "P-draft", status: "draft", created_at: "2026-10-13T15:01:38Z", supplier_id: "SUP", currency: "MDL" },
    [{ id: "L-1", supplier_code: "CTRCB0332", description: "Pivot", quantity: 2, unit_cost: 100 }],
  );
  const r = await resolveSaleLine(asDb(db), { partCode: "CTRCB0332", quantity: 2 }, { createFromDraft: true });
  const pid = r.productId!;
  // cancelPurchase lands between the resolve and the receipt (status flips first).
  db.rows("purchases").find((p) => p.id === "P-draft")!.status = "cancelled";
  assert.deepEqual(await receiveFromOpenPurchase(asDb(db), r.openLine, 2, "u1"), { ok: true, received: 0 });
  const stock = db.rows("products").find((p) => p.id === pid)!.stock_quantity;
  assert.equal(stock, 0);
  assert.deepEqual(
    db.rows("stock_movements").map((m) => [m.ref, m.delta]),
    [[`draft_receive:P-draft:${pid}:0`, 2], [`draft_receive_net:P-draft:${pid}:0`, -2]],
  );
  // The cancel's own net afterwards finds the sum at zero — nothing more.
  assert.deepEqual(await netDraftReceives(asDb(db), "P-draft", "u1"), { ok: true });
  assert.equal(db.rows("stock_movements").length, 2);
});

test("cancelling a posted purchase does not put back goods the customer already took (draft_settle rows stay out of the cancel net)", async () => {
  const db = new FakeDb();
  db.rows("products").push({ id: "prodA", part_code: "X1", supplier_code: null, search_codes: ["X1"], stock_quantity: 0, created_at: "2026-01-01T00:00:00Z" });
  seedPurchase(db, { id: "P", status: "posted", created_at: "2026-10-01T00:00:00Z", supplier_id: "SUP", currency: "MDL" }, [
    { id: "L-1", supplier_code: "X1", description: "x", quantity: 2, unit_cost: 100, product_id: "prodA" },
  ]);
  await applyStockMovement(asDb(db), { productId: "prodA", delta: 2, reason: "purchase_post", ref: "purchase_post:L-1", purchaseId: "P" });
  // Sold from the draft, settled at post time: cites the purchase, belongs to the order.
  await applyStockMovement(asDb(db), { productId: "prodA", delta: -2, reason: "sale", ref: "draft_settle:O1:prodA:0", orderId: "O1", purchaseId: "P" });
  assert.equal(db.rows("products")[0].stock_quantity, 0);
  assert.deepEqual(await reversePurchaseLines(asDb(db), "P", [{ id: "L-1", product_id: "prodA", quantity: 2 }], "u1"), { ok: true });
  assert.deepEqual(await settlePurchaseCancelNet(asDb(db), "P", "u1"), { ok: true });
  assert.equal(db.rows("products")[0].stock_quantity, -2); // bought 0 (cancelled), sold 2
  assert.ok(!db.rows("stock_movements").some((m) => String(m.ref).startsWith("purchase_cancel_net:")));
  // A supplier return is still netted (the documented case): +10 post, −2 return, cancel → net 0.
  await applyStockMovement(asDb(db), { productId: "prodA", delta: -1, reason: "return", ref: "return:R1:prodA", purchaseId: "P" });
  assert.deepEqual(await settlePurchaseCancelNet(asDb(db), "P", "u1"), { ok: true });
  assert.equal(db.rows("products")[0].stock_quantity, -2);
});

test("two racing mints of the SAME open line converge on one product; two different parts under one internal code still get two", async () => {
  const db = new FakeDb();
  const line = { id: "L-1", supplier_code: "NI-ES-14847", internal_code: "CAP DE BARA", description: "Cap de bara" };
  const a = await insertMintedProduct(asDb(db), { line, costMdl: 207.48, markupFactor: 1.3, supplierId: "SUP", internalOnly: true });
  const b = await insertMintedProduct(asDb(db), { line, costMdl: 207.48, markupFactor: 1.3, supplierId: "SUP", internalOnly: true });
  assert.ok(a.ok && b.ok);
  assert.equal(b.ok && b.id, a.ok && a.id);
  assert.equal(db.rows("products").length, 1);
  const c = await insertMintedProduct(asDb(db), { line: { ...line, id: "L-2", supplier_code: "NI-ES-14848" }, costMdl: 207.48, markupFactor: 1.3, supplierId: "SUP", internalOnly: true });
  assert.ok(c.ok && c.code === "NI-ES-14848");
  assert.equal(db.rows("products").length, 2);
});
