"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPanelUser } from "@/lib/panel/auth";
import { roundStock } from "@/lib/stock";
import {
  applyStockMovement,
  getMovementByRef,
  ledgerReady,
  resolveLineProductId,
  type StockDb,
} from "@/lib/stock-ledger";

const r2 = (n: number) => Number(n.toFixed(2));

/**
 * Total quantity already returned against one line of a parent document.
 * The cap for a new return is line quantity − this sum: the same line can
 * never be returned past what was actually sold/bought, no matter how many
 * times the button is pressed.
 */
async function alreadyReturnedQty(
  parentType: "invoice" | "purchase",
  parentId: string,
  lineRef: string,
): Promise<number> {
  const { data } = await getSupabaseAdmin()
    .from("document_returns")
    .select("quantity")
    .eq("parent_type", parentType)
    .eq("parent_id", parentId)
    .eq("line_ref", lineRef);
  return roundStock(
    ((data ?? []) as Array<{ quantity: number | string | null }>).reduce(
      (s, r) => s + Number(r.quantity ?? 0),
      0,
    ),
  );
}

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

// Product resolution and stock movement are shared with the sale/void paths
// via lib/stock-ledger.ts — the return MUST resolve a line to the same product
// its sale decremented, and every move goes through the idempotent ledger.

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

  // Money path: a return annex whose stock move can't be recorded must not be
  // created at all — it would travel to the accountant while stock stands still.
  if (!(await ledgerReady(supabase as unknown as StockDb))) {
    return { ok: false, reason: "stock_ledger_missing — rulează sql/stock-accuracy.sql" };
  }

  const { data: inv } = await supabase
    .from("invoices")
    .select("id, type, status, order_id, currency, account_scope, items_snapshot")
    .eq("id", invoiceId)
    .maybeSingle();
  if (!inv) return { ok: false, reason: "invoice_not_found" };
  if (inv.type !== "invoice") return { ok: false, reason: "not_an_invoice" };
  // A voided invoice already restored its stock — a return annex on top of it
  // would credit the goods (and the money) twice. Same for a CANCELLED order:
  // the cancel restored everything, so a return would be a second credit.
  if (inv.status === "void") return { ok: false, reason: "invoice_void" };
  const parentOrderId = (inv as { order_id?: string | null }).order_id ?? null;
  if (parentOrderId) {
    const { data: parentOrd } = await supabase
      .from("orders")
      .select("status")
      .eq("id", parentOrderId)
      .maybeSingle();
    if (parentOrd?.status === "cancelled") {
      return { ok: false, reason: "order_cancelled" };
    }
  }

  const items = Array.isArray(inv.items_snapshot)
    ? (inv.items_snapshot as Array<Record<string, unknown>>)
    : [];
  const line = items[lineIndex];
  if (!line) return { ok: false, reason: "line_not_found" };

  const lineQty = Number((line as { quantity?: number }).quantity ?? 0);
  // Cap at what's LEFT of the line across all prior returns — pressing Retur
  // twice can never credit more than was sold.
  const prevReturned = await alreadyReturnedQty("invoice", invoiceId, String(lineIndex));
  const remaining = roundStock(lineQty - prevReturned);
  if (remaining <= 0) return { ok: false, reason: "already_returned" };
  const qty = Math.min(quantity && quantity > 0 ? quantity : remaining, remaining);
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

  // Same resolver the sale-side uses (normalized code tiers) — the return
  // must land on the SAME product the sale decremented.
  const productId = await resolveLineProductId(
    supabase as unknown as StockDb,
    line,
  );

  // Row first, stock second: the movement's ref is keyed by the row id, so a
  // crash between the two leaves an annex with stock_adjusted=false (visible,
  // re-creatable) instead of untracked stock.
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
      stock_adjusted: false,
      created_by: user.id,
    } as never)
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };
  const returnId = (row as { id: string }).id;

  if (productId) {
    // Carries the invoice's order_id so a later void/cancel of the whole
    // order nets this credit out instead of restoring on top of it.
    const moved = await applyStockMovement(supabase as unknown as StockDb, {
      productId,
      delta: qty, // customer return → +stock
      reason: "return",
      ref: `return:${returnId}`,
      orderId: (inv as { order_id?: string | null }).order_id ?? null,
      invoiceId,
      returnId,
      createdBy: user.id,
    });
    if (!moved.ok) {
      // No annex without its stock effect: remove the row and surface the
      // error — a retry recreates both together.
      await getSupabaseAdmin().from("document_returns").delete().eq("id", returnId);
      return { ok: false, reason: moved.reason };
    }
    await getSupabaseAdmin()
      .from("document_returns")
      .update({ stock_adjusted: true } as never)
      .eq("id", returnId);
  }

  revalidatePath("/[locale]/panel/facturi", "page");
  revalidatePath(`/[locale]/panel/facturi/${invoiceId}`, "page");
  return { ok: true, id: returnId };
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

  // Same ledger gate as the invoice-side return — no annex without its move.
  if (!(await ledgerReady(supabase as unknown as StockDb))) {
    return { ok: false, reason: "stock_ledger_missing — rulează sql/stock-accuracy.sql" };
  }

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
    .select("id, status, currency, account_scope")
    .eq("id", purchaseId)
    .maybeSingle();
  if (!pur) return { ok: false, reason: "purchase_not_found" };
  // Only POSTED purchases hold stock to give back to the supplier. A draft
  // never added stock (the −qty would be pure phantom removal); a cancelled
  // one already reversed everything (a return here would double-drain, and
  // deleteReturn deliberately skips reversal for cancelled parents).
  const purStatus = (pur as { status?: string | null }).status ?? null;
  if (purStatus !== "posted") {
    return {
      ok: false,
      reason: purStatus === "cancelled" ? "purchase_cancelled" : "purchase_not_posted",
    };
  }

  const lineQty = Number(it.quantity ?? 0);
  // Cap on a STABLE identity. Purchase edits regenerate line ids (insert-new,
  // delete-old), so a line-id cap would reset after every edit and allow a
  // second full credit. The product is what physically exists, so cap at
  // (total purchased qty of this product on the document) − (already returned
  // for this product). Lines without a product fall back to the line-id cap.
  let remaining: number;
  if (it.product_id) {
    const { data: sameProduct } = await supabase
      .from("purchase_items")
      .select("quantity")
      .eq("purchase_id", purchaseId)
      .eq("product_id", it.product_id);
    const purchasedQty = roundStock(
      ((sameProduct ?? []) as Array<{ quantity: number | string | null }>).reduce(
        (s, r) => s + Number(r.quantity ?? 0),
        0,
      ),
    );
    const { data: prev } = await getSupabaseAdmin()
      .from("document_returns")
      .select("quantity")
      .eq("parent_type", "purchase")
      .eq("parent_id", purchaseId)
      .eq("product_id", it.product_id);
    const returned = roundStock(
      ((prev ?? []) as Array<{ quantity: number | string | null }>).reduce(
        (s, r) => s + Number(r.quantity ?? 0),
        0,
      ),
    );
    remaining = roundStock(purchasedQty - returned);
  } else {
    const prevReturned = await alreadyReturnedQty("purchase", purchaseId, it.id);
    remaining = roundStock(lineQty - prevReturned);
  }
  if (remaining <= 0) return { ok: false, reason: "already_returned" };
  const qty = Math.min(
    quantity && quantity > 0 ? quantity : Math.min(lineQty, remaining),
    remaining,
  );
  if (qty <= 0) return { ok: false, reason: "bad_quantity" };

  const vatRate = Number(it.vat_rate ?? 0);
  const net = r2(Number(it.unit_cost ?? 0) * qty);
  const vat = r2(net * (vatRate / 100));
  const gross = r2(net + vat);
  const unitAmount = r2(qty > 0 ? gross / qty : 0);

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
      stock_adjusted: false,
      created_by: user.id,
    } as never)
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };
  const returnId = (row as { id: string }).id;

  if (it.product_id) {
    const moved = await applyStockMovement(supabase as unknown as StockDb, {
      productId: it.product_id,
      delta: -qty, // supplier return → -stock
      reason: "return",
      ref: `return:${returnId}`,
      purchaseId,
      returnId,
      createdBy: user.id,
    });
    if (!moved.ok) {
      // No annex without its stock effect — remove the row, surface, retry-safe.
      await getSupabaseAdmin().from("document_returns").delete().eq("id", returnId);
      return { ok: false, reason: moved.reason };
    }
    await getSupabaseAdmin()
      .from("document_returns")
      .update({ stock_adjusted: true } as never)
      .eq("id", returnId);
  }

  revalidatePath("/[locale]/panel/achizitii", "page");
  revalidatePath(`/[locale]/panel/achizitii/${purchaseId}`, "page");
  return { ok: true, id: returnId };
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
    const db = supabase as unknown as StockDb;
    // If the parent document was since cancelled/voided, its reversal already
    // netted this return out — reversing again would drain stock the cancel
    // accounted for. Skip the move, just remove the row. (Symmetric for both
    // parents: invoice → order cancelled/void, purchase → cancelled.)
    let orderCancelled = false;
    if (r.parent_type === "invoice") {
      const { data: parentInv } = await supabase
        .from("invoices")
        .select("order_id, status")
        .eq("id", r.parent_id)
        .maybeSingle();
      if (parentInv?.status === "void") orderCancelled = true;
      if (!orderCancelled && parentInv?.order_id) {
        const { data: parentOrd } = await supabase
          .from("orders")
          .select("status")
          .eq("id", parentInv.order_id)
          .maybeSingle();
        orderCancelled = parentOrd?.status === "cancelled";
      }
    } else {
      const { data: parentPur } = await supabase
        .from("purchases")
        .select("status")
        .eq("id", r.parent_id)
        .maybeSingle();
      orderCancelled = parentPur?.status === "cancelled";
    }

    if (!orderCancelled) {
      // Ledger-first: negate the recorded movement (exact product + delta).
      // Pre-ledger returns fall back to the stored product_id × quantity.
      // Either way the `reverse:` ref makes a repeated undo a no-op. A failed
      // read or a failed reversal ABORTS the delete — removing the row while
      // the stock credit stays would also reset the cumulative return cap
      // (rows are the cap's source), opening a second full credit.
      const mvRes = await getMovementByRef(db, `return:${returnId}`);
      if (!mvRes.ok) return mvRes;
      const mv = mvRes.row;
      const qty = Number(r.quantity ?? 0);
      const legacyDelta = r.parent_type === "invoice" ? -qty : qty;
      const delta = mv ? -Number(mv.delta) : legacyDelta;
      const productId = mv ? mv.product_id : r.product_id;
      if (delta !== 0) {
        const moved = await applyStockMovement(db, {
          productId,
          delta,
          reason: "return_reverse",
          ref: `reverse:return:${returnId}`,
          orderId: mv?.order_id ?? null,
          returnId,
          createdBy: user.id,
        });
        if (!moved.ok) return moved;
      }
    }
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
