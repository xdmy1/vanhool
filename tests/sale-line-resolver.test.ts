/**
 * Proforma → factură stock rule: the LAST PURCHASE of the part code decides
 * where the goods come from (matched normalized: dots / commas / spaces /
 * case ignored). Run with `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  newResolverCache,
  resolveSaleLine,
} from "@/lib/panel/invoices/sale-line-resolver";
import type { StockDb } from "@/lib/stock-ledger";

type Row = Record<string, unknown>;

// ---- tiny in-memory stand-in for the Supabase query builder ---------------
// Only the surface the resolver uses: select/insert/update, eq/is/in/ilike/
// contains, order/limit, single/maybeSingle, and the thenable result.

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
}

type Result = { data: unknown; error: { message: string } | null };

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
