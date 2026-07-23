"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPanelUser } from "@/lib/panel/auth";

const r2 = (n: number) => Number(n.toFixed(2));

/** A negative annex line attached to an invoice or a purchase. */
export type DocumentReturn = {
  id: string;
  parent_type: "invoice" | "purchase";
  parent_id: string;
  line_ref: string | null;
  product_id: string | null;
  part_code: string | null;
  name: string | null;
  quantity: number;
  unit_amount: number;
  vat_rate: number;
  net_amount: number;
  vat_amount: number;
  total: number;
  currency: string;
  account_scope: string | null;
  reason: string | null;
  created_at: string;
};

/**
 * Load all return-annexes for a parent document. Uses the service-role client
 * because document_returns is RLS-locked. Best-effort: a missing table (pre-
 * migration) yields an empty list rather than throwing, so detail pages and the
 * accountant email keep working until sql/document-returns.sql is applied.
 */
export async function getReturnsFor(
  parentType: "invoice" | "purchase",
  parentId: string,
): Promise<DocumentReturn[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("document_returns")
      .select(
        "id, parent_type, parent_id, line_ref, product_id, part_code, name, quantity, unit_amount, vat_rate, net_amount, vat_amount, total, currency, account_scope, reason, created_at",
      )
      .eq("parent_type", parentType)
      .eq("parent_id", parentId)
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as DocumentReturn[];
  } catch {
    return [];
  }
}

/** Resolve the catalog product behind an invoice line (id, else part code). */
async function resolveProductId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string | null,
  code: string | null,
): Promise<string | null> {
  if (productId) return productId;
  const c = (code ?? "").trim();
  if (!c) return null;
  const esc = c.replace(/[\\%_]/g, "\\$&");
  for (const col of ["part_code", "supplier_code"] as const) {
    const { data } = await supabase.from("products").select("id").ilike(col, esc).limit(2);
    if (data && data.length === 1) return data[0].id;
  }
  return null;
}

/** Shift a product's stock by delta (never below 0). */
async function adjustStock(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  delta: number,
): Promise<void> {
  const { data: p } = await supabase
    .from("products")
    .select("stock_quantity")
    .eq("id", productId)
    .maybeSingle();
  if (!p) return;
  await supabase
    .from("products")
    .update({ stock_quantity: Math.max(0, Number(p.stock_quantity ?? 0) + delta) })
    .eq("id", productId);
}

/**
 * Customer return: attach a -amount annex to an invoice for one of its lines,
 * and (per the operator's choice) put the returned quantity back into stock.
 * The invoice itself is not modified. `quantity` defaults to the whole line.
 */
export async function createInvoiceLineReturn(
  invoiceId: string,
  lineIndex: number,
  quantity?: number,
  reason?: string,
): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();

  const { data: inv } = await supabase
    .from("invoices")
    .select("id, type, currency, account_scope, items_snapshot")
    .eq("id", invoiceId)
    .maybeSingle();
  if (!inv) return { ok: false, reason: "invoice_not_found" };
  if (inv.type !== "invoice") return { ok: false, reason: "not_an_invoice" };

  const items = Array.isArray(inv.items_snapshot)
    ? (inv.items_snapshot as Array<Record<string, unknown>>)
    : [];
  const line = items[lineIndex];
  if (!line) return { ok: false, reason: "line_not_found" };

  const lineQty = Number((line as { quantity?: number }).quantity ?? 0);
  const qty = Math.min(quantity && quantity > 0 ? quantity : lineQty, lineQty);
  if (qty <= 0) return { ok: false, reason: "bad_quantity" };

  // it.total is the GROSS line amount (what the customer paid). Prorate by qty.
  const lineGross = Number((line as { total?: number }).total ?? 0);
  const returnGross = r2(lineQty > 0 ? (lineGross * qty) / lineQty : 0);
  const scope = (inv.account_scope ?? "conta1") as string;
  const vatRate = Number(
    (line as { vat_rate?: number }).vat_rate ?? (scope === "conta1" ? 20 : 0),
  );
  const net = r2(returnGross / (1 + vatRate / 100));
  const vat = r2(returnGross - net);
  const unitAmount = r2(qty > 0 ? returnGross / qty : 0);

  const productId = await resolveProductId(
    supabase,
    ((line as { productId?: string | null }).productId ?? null) as string | null,
    ((line as { partCode?: string | null }).partCode ?? null) as string | null,
  );
  let stockAdjusted = false;
  if (productId) {
    await adjustStock(supabase, productId, qty); // customer return → +stock
    stockAdjusted = true;
  }

  const { data: row, error } = await getSupabaseAdmin()
    .from("document_returns")
    .insert({
      parent_type: "invoice",
      parent_id: invoiceId,
      line_ref: String(lineIndex),
      product_id: productId,
      part_code: (line as { partCode?: string | null }).partCode ?? null,
      name: (line as { name?: string | null }).name ?? null,
      quantity: qty,
      unit_amount: unitAmount,
      vat_rate: vatRate,
      net_amount: net,
      vat_amount: vat,
      total: returnGross,
      currency: inv.currency ?? "MDL",
      account_scope: scope,
      reason: reason?.trim() || null,
      stock_adjusted: stockAdjusted,
      created_by: user.id,
    } as never)
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/facturi", "page");
  revalidatePath(`/[locale]/panel/facturi/${invoiceId}`, "page");
  return { ok: true, id: (row as { id: string }).id };
}

/**
 * Supplier return: attach a -cost annex to a purchase for one of its lines,
 * and remove the returned quantity from stock (the part leaves for the
 * supplier). The purchase itself is not modified. Uses the line's purchase cost
 * (what it cost at the supplier), gross of VAT. `quantity` defaults to the line.
 */
export async function createPurchaseLineReturn(
  purchaseId: string,
  purchaseItemId: string,
  quantity?: number,
  reason?: string,
): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();

  const { data: it } = await supabase
    .from("purchase_items")
    .select("id, purchase_id, product_id, supplier_code, internal_code, description, quantity, unit_cost, vat_rate")
    .eq("id", purchaseItemId)
    .maybeSingle();
  if (!it || it.purchase_id !== purchaseId) {
    return { ok: false, reason: "line_not_found" };
  }
  const { data: pur } = await supabase
    .from("purchases")
    .select("id, currency, account_scope")
    .eq("id", purchaseId)
    .maybeSingle();
  if (!pur) return { ok: false, reason: "purchase_not_found" };

  const lineQty = Number(it.quantity ?? 0);
  const qty = Math.min(quantity && quantity > 0 ? quantity : lineQty, lineQty);
  if (qty <= 0) return { ok: false, reason: "bad_quantity" };

  const vatRate = Number(it.vat_rate ?? 0);
  const net = r2(Number(it.unit_cost ?? 0) * qty);
  const vat = r2(net * (vatRate / 100));
  const gross = r2(net + vat);
  const unitAmount = r2(qty > 0 ? gross / qty : 0);

  let stockAdjusted = false;
  if (it.product_id) {
    await adjustStock(supabase, it.product_id, -qty); // supplier return → -stock
    stockAdjusted = true;
  }

  const { data: row, error } = await getSupabaseAdmin()
    .from("document_returns")
    .insert({
      parent_type: "purchase",
      parent_id: purchaseId,
      line_ref: it.id,
      product_id: it.product_id,
      part_code: it.internal_code ?? it.supplier_code ?? null,
      name: it.description ?? null,
      quantity: qty,
      unit_amount: unitAmount,
      vat_rate: vatRate,
      net_amount: net,
      vat_amount: vat,
      total: gross,
      currency: pur.currency ?? "MDL",
      account_scope: pur.account_scope ?? "conta1",
      reason: reason?.trim() || null,
      stock_adjusted: stockAdjusted,
      created_by: user.id,
    } as never)
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/achizitii", "page");
  revalidatePath(`/[locale]/panel/achizitii/${purchaseId}`, "page");
  return { ok: true, id: (row as { id: string }).id };
}

/**
 * Undo a return annex: reverse its stock move (if one was made) and delete the
 * row. Invoice returns added stock → remove it; purchase returns removed stock
 * → add it back.
 */
export async function deleteReturn(
  returnId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const admin = getSupabaseAdmin();
  const supabase = await createClient();

  const { data: ret } = await admin
    .from("document_returns")
    .select("id, parent_type, parent_id, product_id, quantity, stock_adjusted")
    .eq("id", returnId)
    .maybeSingle();
  if (!ret) return { ok: false, reason: "not_found" };

  const r = ret as {
    parent_type: "invoice" | "purchase";
    parent_id: string;
    product_id: string | null;
    quantity: number | string | null;
    stock_adjusted: boolean | null;
  };
  if (r.stock_adjusted && r.product_id) {
    const qty = Number(r.quantity ?? 0);
    // Reverse the original move: invoice return had +qty → now -qty; purchase
    // return had -qty → now +qty.
    const delta = r.parent_type === "invoice" ? -qty : qty;
    if (qty > 0) await adjustStock(supabase, r.product_id, delta);
  }

  const { error } = await admin.from("document_returns").delete().eq("id", returnId);
  if (error) return { ok: false, reason: error.message };

  if (r.parent_type === "invoice") {
    revalidatePath("/[locale]/panel/facturi", "page");
    revalidatePath(`/[locale]/panel/facturi/${r.parent_id}`, "page");
  } else {
    revalidatePath("/[locale]/panel/achizitii", "page");
    revalidatePath(`/[locale]/panel/achizitii/${r.parent_id}`, "page");
  }
  return { ok: true };
}
