/**
 * The ONE way a purchase line becomes a catalog product — shared by the
 * posting (applyPostedLines) and by the sale-time resolver (a line of a
 * still-draft achiziție sold before the post).
 *
 * `products.part_code` is unique (case-insensitive, see
 * sql/supabase-product-part-code-unique.sql). The operator may type the same
 * internal code on two different lines ("CAP DE BARA" on NI-ES-14847 AND on
 * NI-ES-14848 — IB0293): the first line takes the code, the second must NOT
 * fail (that left the line unresolved and its stock untouched). Codes are
 * tried in order: internal code → supplier code → IB-<line id>; a unique
 * violation moves to the next candidate, any other error stops.
 */
import type { StockDb } from "@/lib/stock-ledger";
import { normalizeCode } from "@/lib/utils/normalize-code";

export type MintableLine = {
  id: string;
  internal_code?: string | null;
  supplier_code?: string | null;
  description?: string | null;
  unit?: string | null;
};

export type MintProductArgs = {
  line: MintableLine;
  /** Product name; falls back to the line description, then to the code. */
  name?: string | null;
  /** GROSS MDL unit cost (project rule: cost is VAT-inclusive cash-out). */
  costMdl: number;
  /** 1 + markup%/100 for the list price. */
  markupFactor: number;
  supplierId: string | null;
  /** true → panel-only product (not on the storefront). */
  internalOnly: boolean;
};

export type MintProductResult =
  | { ok: true; id: string; code: string }
  | { ok: false; reason: string };

/** Codes a minted product may take, in order of preference, deduped. */
export function mintCodeCandidates(line: MintableLine): string[] {
  const out: string[] = [];
  for (const c of [
    (line.internal_code ?? "").trim(),
    (line.supplier_code ?? "").trim(),
    `IB-${line.id.slice(0, 8).toUpperCase()}`,
  ]) {
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

export function isUniqueViolation(
  err: { code?: string; message?: string } | null | undefined,
): boolean {
  if (!err) return false;
  if (err.code === "23505") return true;
  return /duplicate key|unique constraint|already exists/i.test(err.message ?? "");
}

export async function insertMintedProduct(
  db: StockDb,
  args: MintProductArgs,
): Promise<MintProductResult> {
  const { line } = args;
  const supplierCode = (line.supplier_code ?? "").trim();
  const unit = (line.unit ?? "").trim() || "buc";
  let lastError = "no code";
  for (const code of mintCodeCandidates(line)) {
    const name = (
      (args.name ?? "").trim() ||
      (line.description ?? "").trim() ||
      code
    ).slice(0, 200);
    const slug = `${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${line.id.slice(0, 6)}`;
    const base = {
      part_code: code,
      name_ro: name,
      slug,
      price: Number((args.costMdl * args.markupFactor).toFixed(2)),
      cost_price: args.costMdl,
      stock_quantity: 0,
      unit,
      is_active: false,
      supplier_id: args.supplierId,
      supplier_code: supplierCode || null,
    };
    let res = await db
      .from("products")
      .insert({ ...base, internal_only: args.internalOnly })
      .select("id")
      .single();
    // sql/products-internal-only.sql not applied yet — create it anyway.
    if (res.error && /internal_only/i.test(res.error.message)) {
      res = await db.from("products").insert(base).select("id").single();
    }
    if (!res.error && res.data) {
      return { ok: true, id: (res.data as { id: string }).id, code };
    }
    lastError = res.error?.message ?? "no row";
    if (!isUniqueViolation(res.error)) break;
    // part_code already taken. If the product holding it carries THIS line's
    // supplier code it is this very part — minted a moment ago by a racing
    // sale of the same open line — so reuse it; a second row would split the
    // part's stock. A different supplier code is the IB0293 case (two parts
    // typed under one internal code) → the next candidate.
    const twin = await productHoldingCode(db, code);
    if (
      twin &&
      supplierCode &&
      normalizeCode(twin.supplier_code) === normalizeCode(supplierCode)
    ) {
      return { ok: true, id: twin.id, code };
    }
  }
  return { ok: false, reason: lastError };
}

async function productHoldingCode(
  db: StockDb,
  code: string,
): Promise<{ id: string; supplier_code: string | null } | null> {
  const escaped = code.replace(/[\\%_]/g, "\\$&");
  const { data } = await db
    .from("products")
    .select("id, supplier_code")
    .ilike("part_code", escaped)
    .limit(1);
  const row = ((data ?? []) as Array<{ id: string; supplier_code: string | null }>)[0];
  return row ?? null;
}
