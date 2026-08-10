"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { dateISO } from "@/lib/datetime";
import { getPanelUser } from "@/lib/panel/auth";
import { verifyAdminPin } from "@/lib/panel/admin-pin";
import {
  isBelowCost,
  blockedBelowCost,
  type BelowCostLine,
} from "@/lib/panel/margin-guard";
import { sendResendEmail } from "@/lib/email/resend";
import { accountantInvoiceEmail } from "@/lib/email/accountant-invoice";
import { accountantMarkEnteredUrl } from "@/lib/panel/accountant-entered";
import type { Json } from "@/lib/supabase/database.types";
import type { InvoiceItemSnapshot } from "@/lib/panel/invoices/queries";
import { getReturnsFor } from "@/lib/panel/returns/actions";
import { roundStock } from "@/lib/stock";
import {
  applyStockMovement,
  getLedgerEpoch,
  getOrderMovements,
  ledgerReady,
  resolveLineProductId,
  reverseOrderStock,
  type StockDb,
} from "@/lib/stock-ledger";

type InvoiceLineWithSupplier = InvoiceItemSnapshot;

// Bookkeeper inbox — single recipient for the "send to accountant" button
// on each invoice / proforma detail page. Per project owner; not stored in
// settings because it's a fixed business address.
// Bookkeeper inbox for all forwarded fiscal documents (e-facturi + monthly
// reports). Override via env if it ever needs to change without a redeploy.
const ACCOUNTANT_EMAIL =
  process.env.ACCOUNTANT_EMAIL || "Accounting-em@mail.ru";

// ---- Schemas ---------------------------------------------------------------

const lineSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  part_code: z.string().nullable().optional(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  quantity: z.number().positive(),
  /** Normal "list" price per unit. */
  unit_price: z.number().nonnegative(),
  /**
   * Optional per-line discounted price. null / >= unit_price → no per-line
   * discount; the line settles at `unit_price`.
   */
  discounted_unit_price: z.number().nonnegative().nullable().optional(),
  vat_rate: z.number().nonnegative().default(0),
  /** Unit of measure shown on the fiscal line (buc / l / m). Default "buc". */
  unit: z.enum(["buc", "l", "m"]).default("buc"),
  /**
   * Internal cost per unit — captured at proforma/invoice creation
   * so admin sees the realised margin on the digital detail view.
   * NEVER rendered on the printable/customer-facing document.
   * Source order: explicit value from the form (autocomplete pulls
   * it from the catalog product or the draft purchase line) → null.
   */
  cost_price: z.number().nonnegative().nullable().optional(),
  /** +30/-15 margin status stamped on the line, so an edit reprices from base. */
  markup_percent: z.number().nonnegative().nullable().optional(),
});

const customerSchema = z.object({
  user_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  idno: z.string().nullable().optional(),
  vat_number: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

const proformaInputSchema = z.object({
  order_id: z.string().uuid().nullable().optional(),
  customer: customerSchema,
  items: z.array(lineSchema).min(1),
  due_days: z.number().int().min(0).default(7),
  currency: z.enum(["MDL", "EUR", "USD"]).default("MDL"),
  /** Which set of books the proforma (and later invoice) lives in. Conta 2
   * tracks non-fiscal cash flow — TVA is always 0 there, no extraction. */
  account_scope: z.enum(["conta1", "conta2"]).default("conta1"),
  /** Language the proforma is printed in — independent of the admin's UI. */
  output_locale: z.enum(["ro", "en", "ru"]).default("ro"),
  notes: z.string().nullable().optional(),
  /** Commercial discount in percent (0..100) applied on the gross total. */
  discount_percent: z.number().min(0).max(100).optional(),
  /** Admin PIN authorising line(s) at/below cost ("FORCE SELL"). */
  force_sell_pin: z.string().optional(),
  /** conta2 documents are 0% TVA by default; set true to bill a conta2
   *  document WITH 20% TVA (conta1 is always 20% regardless of this). */
  conta2_with_vat: z.boolean().optional().default(false),
});

export type ProformaInput = z.infer<typeof proformaInputSchema>;

// ---- Helpers ---------------------------------------------------------------

function totals(
  items: Array<{
    quantity: number;
    unit_price: number;
    discounted_unit_price?: number | null;
    vat_rate: number;
  }>,
) {
  // `unit_price` is treated as VAT-inclusive (gross). Break it back into
  // net + VAT so the printed document still itemizes TVA. Per-line discount
  // uses the discounted price when it's set AND lower than the list price.
  let net = 0;
  let gross = 0;
  let grossBeforeDiscount = 0;
  for (const i of items) {
    const eff =
      i.discounted_unit_price != null &&
      i.discounted_unit_price >= 0 &&
      i.discounted_unit_price < i.unit_price
        ? i.discounted_unit_price
        : i.unit_price;
    const lineGross = i.quantity * eff;
    const lineGrossBefore = i.quantity * i.unit_price;
    const factor = 1 + i.vat_rate / 100;
    const lineNet = factor > 0 ? lineGross / factor : lineGross;
    gross += lineGross;
    grossBeforeDiscount += lineGrossBefore;
    net += lineNet;
  }
  const finalTotal = Number(gross.toFixed(2));
  const roundedNet = Number(net.toFixed(2));
  const grossBeforeRounded = Number(grossBeforeDiscount.toFixed(2));
  const discountAmount = Number((grossBeforeRounded - finalTotal).toFixed(2));
  const pct =
    grossBeforeRounded > 0 && discountAmount > 0
      ? Math.min(
          100,
          Number(((discountAmount / grossBeforeRounded) * 100).toFixed(2)),
        )
      : 0;
  return {
    subtotal: roundedNet,
    // Derive VAT as the residual (total − net) so subtotal + vat_amount ALWAYS
    // equals total. Rounding net and VAT independently drifts by a cent on
    // ~5.7% of amounts, which would make the printed fiscal footer not
    // reconcile (e-Factura-invalid). Mirrors createManualSale's residual math.
    vat_amount: Number((finalTotal - roundedNet).toFixed(2)),
    total: finalTotal,
    discount_percent: pct,
    discount_amount: discountAmount,
    subtotal_before_discount: grossBeforeRounded,
  };
}

async function takeNextNumber(
  client: Awaited<ReturnType<typeof createClient>>,
  seriesKey: string,
  counterKey: string,
  fallbackSeries: string,
  fallbackCounter: number,
): Promise<{ series: string; number: string }> {
  const { data } = await client
    .from("panel_settings")
    .select("key, value")
    .in("key", [seriesKey, counterKey]);
  let series = fallbackSeries;
  let counter = fallbackCounter;
  for (const r of data ?? []) {
    const raw = r.value;
    if (r.key === seriesKey) {
      series = typeof raw === "string" ? raw : String(raw ?? "").replace(/^"|"$/g, "");
    }
    if (r.key === counterKey) {
      counter = typeof raw === "number" ? raw : Number(raw);
    }
  }
  await client.from("panel_settings").upsert(
    [
      {
        key: counterKey,
        value: (counter + 1) as unknown as Json,
        updated_at: new Date().toISOString(),
      },
    ],
    { onConflict: "key" },
  );
  const padded = String(counter).padStart(4, "0");
  return { series, number: padded };
}

// Product resolution + every stock mutation live in lib/stock-ledger.ts — the
// decrement (conversion), the restore (void / delete) and the returns flow all
// share the same resolver and the same idempotent ledger, so they can never
// disagree about which product moved.

/**
 * Resolve each invoice line's SUPPLIER part code (from purchase_items) so the
 * accountant email can show internal code + supplier code side by side. Matches
 * by product_id first, then by internal_code == the line's partCode. Most-recent
 * purchase wins. Best-effort — lines keep their fields; supplier_code is added
 * where a purchase is found (null otherwise).
 */
async function attachSupplierCodes(
  lines: InvoiceLineWithSupplier[],
): Promise<InvoiceLineWithSupplier[]> {
  if (!Array.isArray(lines) || lines.length === 0) return lines;
  const supabase = await createClient();
  const productIds = Array.from(
    new Set(lines.map((l) => l.productId).filter((s): s is string => !!s)),
  );
  const partCodes = Array.from(
    new Set(lines.map((l) => l.partCode).filter((s): s is string => !!s)),
  );

  const byProduct = new Map<string, string>();
  const byCode = new Map<string, string>();

  if (productIds.length > 0) {
    const { data } = await supabase
      .from("purchase_items")
      .select("product_id, internal_code, supplier_code, created_at")
      .in("product_id", productIds)
      .order("created_at", { ascending: false });
    for (const r of (data ?? []) as Array<{
      product_id: string | null;
      internal_code: string | null;
      supplier_code: string | null;
    }>) {
      if (!r.supplier_code) continue;
      if (r.product_id && !byProduct.has(r.product_id)) byProduct.set(r.product_id, r.supplier_code);
      if (r.internal_code && !byCode.has(r.internal_code)) byCode.set(r.internal_code, r.supplier_code);
    }
  }
  if (partCodes.length > 0) {
    const { data } = await supabase
      .from("purchase_items")
      .select("internal_code, supplier_code, created_at")
      .in("internal_code", partCodes)
      .order("created_at", { ascending: false });
    for (const r of (data ?? []) as Array<{
      internal_code: string | null;
      supplier_code: string | null;
    }>) {
      if (r.supplier_code && r.internal_code && !byCode.has(r.internal_code)) {
        byCode.set(r.internal_code, r.supplier_code);
      }
    }
  }

  return lines.map((l) => ({
    ...l,
    supplier_code:
      (l.productId ? byProduct.get(l.productId) : undefined) ??
      (l.partCode ? byCode.get(l.partCode) : undefined) ??
      null,
  }));
}

// ---- Public actions --------------------------------------------------------

/**
 * Issue a proforma invoice. Either from an existing order (storefront/panel)
 * or ad-hoc (no order_id). Returns the new proforma id.
 */
/**
 * Fetch authoritative product costs (products.cost_price is GROSS) and return
 * the below-cost lines that must BLOCK unless a valid FORCE-SELL PIN is given.
 * `unit_price` is GROSS; freeform lines (no product_id) fall back to the cost
 * captured on the line.
 */
async function collectBelowCost(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: ProformaInput["items"],
  currency: "MDL" | "EUR" | "USD",
  forceSellPin: unknown,
): Promise<BelowCostLine[]> {
  // cost_price is stored in MDL; convert to the document currency to compare.
  const rate =
    ({ MDL: 1, EUR: 20, USD: 17 } as Record<string, number>)[currency] ?? 1;
  const ids = items
    .map((i) => i.product_id)
    .filter((s): s is string => !!s);
  const costById = new Map<string, number>();
  if (ids.length > 0) {
    const { data } = await supabase
      .from("products")
      .select("id, cost_price")
      .in("id", ids);
    for (const p of data ?? [])
      costById.set(
        p.id as string,
        Number((p as { cost_price: number | null }).cost_price ?? 0),
      );
  }
  const below: BelowCostLine[] = [];
  for (const i of items) {
    const dp = i.discounted_unit_price;
    const eff = dp != null && dp >= 0 && dp < i.unit_price ? dp : i.unit_price;
    const costMdl = i.product_id
      ? costById.get(i.product_id) ?? Number(i.cost_price ?? 0)
      : Number(i.cost_price ?? 0);
    const cost = rate === 1 ? costMdl : Number((costMdl / rate).toFixed(2));
    if (isBelowCost(eff, cost)) {
      below.push({ label: i.part_code ?? i.name ?? "linie", sell: eff, cost });
    }
  }
  return blockedBelowCost(below, forceSellPin);
}

export async function issueProforma(
  raw: unknown,
): Promise<
  | { ok: true; id: string; number: string }
  | { ok: false; reason: string; belowCost?: BelowCostLine[] }
> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = proformaInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const v = parsed.data;
  const supabase = await createClient();

  const proformaBlocked = await collectBelowCost(supabase, v.items, v.currency, v.force_sell_pin);
  if (proformaBlocked.length > 0) {
    return { ok: false, reason: "below_cost", belowCost: proformaBlocked };
  }

  // VAT is driven purely by the book (account_scope), never by the form:
  //   conta1 → every line 20%, conta2 → every line 0%.
  // Forcing both directions (not just zeroing conta2) closes the hole where
  // a conta1 line could ship 0% TVA if the form sent 0.
  const lineVatRate = v.account_scope === "conta1" || v.conta2_with_vat ? 20 : 0;
  const items = v.items.map((i) => ({
    ...i,
    vat_rate: lineVatRate,
  }));

  const itemsForTotals = items.map((i) => ({
    quantity: i.quantity,
    unit_price: i.unit_price,
    discounted_unit_price: i.discounted_unit_price ?? null,
    vat_rate: i.vat_rate,
  }));
  const { subtotal, vat_amount, total, discount_percent } = totals(itemsForTotals);

  const itemsSnapshot = items.map((i) => {
    const dp = i.discounted_unit_price;
    const eff =
      dp != null && dp >= 0 && dp < i.unit_price ? dp : i.unit_price;
    return {
      productId: i.product_id ?? null,
      partCode: i.part_code ?? null,
      name: i.name,
      description: i.description ?? null,
      quantity: i.quantity,
      unit: i.unit,
      // Snapshot the LIST price as `unit_price`. The effective price the
      // customer actually pays lives in `discounted_unit_price`. Older
      // snapshots without `discounted_unit_price` render unchanged.
      unit_price: i.unit_price,
      discounted_unit_price: eff < i.unit_price ? eff : null,
      vat_rate: i.vat_rate,
      total: Number((i.quantity * eff).toFixed(2)),
      // Admin-only metadata — never rendered on the printable / customer
      // copy. Captures the catalog or draft-purchase cost so the digital
      // detail view can show margin per line.
      cost_price:
        i.cost_price != null && i.cost_price >= 0
          ? Number(i.cost_price)
          : null,
      // +30/-15 margin status, so editing reprices from the base.
      markup_percent:
        i.markup_percent != null && i.markup_percent > 0
          ? Number(i.markup_percent)
          : null,
    };
  });

  const { series, number } = await takeNextNumber(
    supabase,
    "proforma.series",
    "proforma.next_number",
    "M",
    1,
  );

  const today = new Date();
  const due = new Date(today.getTime() + (v.due_days ?? 7) * 86_400_000);

  // Cast: `output_locale` lives on the table at runtime (sql migration);
  // the generated TS types are stale until they're regenerated.
  const { data: row, error } = await supabase
    .from("invoices")
    .insert({
      order_id: v.order_id ?? null,
      account_scope: v.account_scope,
      type: "proforma",
      series,
      number,
      issued_date: dateISO(today),
      due_date: dateISO(due),
      currency: v.currency,
      customer_snapshot: v.customer as unknown as Json,
      items_snapshot: itemsSnapshot as unknown as Json,
      subtotal,
      vat_amount,
      total,
      status: "sent",
      notes: v.notes ?? null,
      // discount_percent column only exists after the panel discount migration
      // runs. Omitting it when 0 keeps the insert working against legacy
      // schemas while still persisting real discounts when the operator
      // actually applies one.
      ...({
        output_locale: v.output_locale,
        created_by: user.id,
        created_by_name: user.fullName ?? user.email,
        ...(discount_percent > 0 ? { discount_percent } : {}),
      } as object),
    })
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/proforme", "page");
  return { ok: true, id: row.id, number: `${series}${number}` };
}

/**
 * Convert a paid proforma into a fiscal invoice. Creates a new `invoices` row
 * with type='invoice' status='paid', sets proforma.status='converted' and
 * cross-links the two rows. Records cash_register_movement if conta2 + cash.
 */
export async function convertProformaToInvoice(
  proformaId: string,
  options?: {
    paymentMethod?: "cash" | "transfer" | "card";
    account_scope?: "conta1" | "conta2";
    /**
     * `paid` — money already in (default). Closes the originating order
     * and any delivery note.
     * `deferred` — invoice is issued but unpaid; the client pays later.
     * `due_in_days` controls the new due date (clamped to 0..7).
     */
    payment_status?: "paid" | "deferred";
    due_in_days?: number;
  },
): Promise<{ ok: true; invoiceId: string; number: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const supabase = await createClient();
  // The ledger is mandatory: converting IS the sale, and a conversion that
  // can't record its stock movements must refuse up front, not half-run.
  if (!(await ledgerReady(supabase as unknown as StockDb))) {
    return { ok: false, reason: "stock_ledger_missing — rulează sql/stock-accuracy.sql" };
  }
  const { data: pf, error: pfErr } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", proformaId)
    .maybeSingle();
  if (pfErr || !pf) return { ok: false, reason: "proforma_not_found" };
  if (pf.type !== "proforma") return { ok: false, reason: "not_a_proforma" };
  if (pf.converted_to_invoice_id) {
    return { ok: false, reason: "already_converted" };
  }

  // The invoice inherits the PROFORMA's book — no automatic flip to conta1
  // when the conversion is paid. A conta2 proforma becomes a conta2 invoice;
  // the operator moves a document deliberately with the scope editor.
  // `options.account_scope` still lets the caller force a book explicitly.
  const paymentStatus = options?.payment_status ?? "paid";
  const proformaScope =
    (pf as { account_scope?: "conta1" | "conta2" }).account_scope ?? "conta1";
  const orderScope: "conta1" | "conta2" =
    options?.account_scope ?? proformaScope;
  const invoiceScope: "conta1" | "conta2" =
    options?.account_scope ?? proformaScope;
  // Legacy alias so the rest of this function — which currently writes
  // `scope` into the order insert — picks up orderScope without further
  // edits.
  const scope = orderScope;
  const dueInDays = Math.max(
    0,
    Math.min(7, Math.trunc(options?.due_in_days ?? 7)),
  );
  const { series, number } = await takeNextNumber(
    supabase,
    "invoice.series",
    "invoice.next_number",
    "M",
    1,
  );
  const now = new Date();

  // If the proforma was ad-hoc (no linked order), create a synthetic order
  // out of its snapshot so the resulting sale flows into /admin/orders and
  // every report/stat that's keyed off `orders`. Status reflects whether
  // payment is in or pending.
  //
  // Captured BEFORE orderId is synthesized: an ad-hoc proforma is the sale
  // itself, so the invoice is what takes the goods out of stock. A proforma
  // raised FROM an existing order (storefront → triage) must NOT decrement —
  // `finalizeOrder` already did it at checkout / on the maib paid callback.
  const wasAdHoc = !pf.order_id;
  let orderId: string | null = pf.order_id;
  if (!orderId) {
    const cs = (pf.customer_snapshot ?? {}) as {
      user_id?: string | null;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
    };
    const snapshot = Array.isArray(pf.items_snapshot)
      ? (pf.items_snapshot as Array<Record<string, unknown>>)
      : [];
    const items = snapshot.map((it) => ({
      productId: (it as { productId?: string | null }).productId ?? null,
      partCode: (it as { partCode?: string | null }).partCode ?? null,
      name: (it as { name?: string }).name ?? "",
      quantity: Number((it as { quantity?: number }).quantity ?? 0),
      price: Number((it as { unit_price?: number }).unit_price ?? 0),
      cost_price: 0,
      total: Number((it as { total?: number }).total ?? 0),
    }));
    const paidNow = paymentStatus === "paid";
    const pm =
      paidNow && options?.paymentMethod === "cash"
        ? "cash"
        : paidNow
          ? "already_paid"
          : "transfer";
    const { data: o, error: oErr } = await supabase
      .from("orders")
      .insert({
        user_id: cs.user_id ?? null,
        customer_name: cs.name ?? "Client",
        customer_email: cs.email ?? null,
        customer_phone: cs.phone ?? null,
        customer_address: cs.address ?? null,
        items: items as unknown as Json,
        // orders.subtotal is GROSS by storefront convention (the net/TVA split
        // lives on the invoice row). pf.subtotal is NET, so use the gross total.
        subtotal: Number(pf.total ?? 0),
        discount_amount: 0,
        shipping_cost: 0,
        total: Number(pf.total ?? 0),
        status: paidNow ? "confirmed" : "pending",
        payment_method: pm,
        account_scope: scope,
        // pf.total is in the proforma's OWN currency — persist it so reports +
        // the void/delete cash reversal convert EUR/USD → MDL correctly instead
        // of the NOT NULL 'MDL' default silently understating it 20x/17x.
        currency: pf.currency ?? "MDL",
        source: "panel",
        notes: `Generat din pro-formă ${pf.series ?? ""}${pf.number ?? ""}`,
      })
      .select("id")
      .single();
    // HARD FAIL: without the synthetic order there is nowhere to hang the
    // stock movements or the later void/cancel restore — continuing would
    // create an invoice whose decrement could never be reversed.
    if (oErr || !o) {
      return { ok: false, reason: `order_create_failed: ${oErr?.message ?? "?"}` };
    }
    orderId = o.id;
  }
  const deferredDue =
    paymentStatus === "deferred"
      ? dateISO(new Date(now.getTime() + dueInDays * 86_400_000))
      : null;

  // The fiscal invoice may land in a DIFFERENT book than the proforma — a
  // paid conta2 proforma becomes a conta1 factură. TVA must follow the
  // INVOICE's book, not the proforma's, or a conta1 factură could ship with
  // 0% TVA. Recompute net/TVA/total + per-line vat_rate from invoiceScope off
  // the proforma's GROSS line snapshot. Gross total is unchanged (gross is
  // gross); only the net/TVA split moves.
  const pfSnapshot = Array.isArray(pf.items_snapshot)
    ? (pf.items_snapshot as Array<Record<string, unknown>>)
    : [];
  // conta2 proformas can carry 20% TVA (explicit conta2-with-vat) — keep it on
  // conversion to a conta2 invoice. A paid conta2 → conta1 still gets 20% via
  // invoiceScope. Detect the proforma's VAT from its stored line snapshot.
  const pfHadVat = pfSnapshot.some(
    (it) => Number((it as { vat_rate?: number }).vat_rate ?? 0) > 0,
  );
  const convLineVat = invoiceScope === "conta1" || pfHadVat ? 20 : 0;
  const convItemsSnapshot = pfSnapshot.map((it) => ({
    ...it,
    vat_rate: convLineVat,
  }));
  const convTotals = totals(
    pfSnapshot.map((it) => ({
      quantity: Number((it as { quantity?: number }).quantity ?? 0),
      unit_price: Number((it as { unit_price?: number }).unit_price ?? 0),
      discounted_unit_price:
        (it as { discounted_unit_price?: number | null }).discounted_unit_price ??
        null,
      vat_rate: convLineVat,
    })),
  );

  const { data: inv, error: insErr } = await supabase
    .from("invoices")
    .insert({
      order_id: orderId,
      account_scope: invoiceScope,
      type: "invoice",
      series,
      number,
      issued_date: dateISO(now),
      // Only mark paid_at when the client actually paid. Deferred payments
      // get filled in later when the cash/transfer arrives.
      paid_at: paymentStatus === "paid" ? now.toISOString() : null,
      due_date: deferredDue,
      currency: pf.currency,
      customer_snapshot: pf.customer_snapshot,
      items_snapshot: convItemsSnapshot as unknown as Json,
      subtotal: convTotals.subtotal,
      vat_amount: convTotals.vat_amount,
      total: convTotals.total,
      notes: pf.notes,
      status: paymentStatus === "paid" ? "paid" : "issued",
      proforma_id: pf.id,
      // Carry the language across the conversion so the fiscal invoice
      // matches the proforma's recipient language.
      ...({
        output_locale: (pf as { output_locale?: string }).output_locale ?? "ro",
        // Origin marker — distinguishes converted-from-proforma invoices
        // from over-the-counter sales and directly-issued invoices.
        source: "proforma_conv",
        created_by: user.id,
        created_by_name: user.fullName ?? user.email,
      } as object),
    })
    .select("id")
    .single();
  if (insErr || !inv) return { ok: false, reason: insErr?.message ?? "insert_failed" };

  // CLAIM the conversion atomically BEFORE anything moves stock: only the
  // caller whose conditional update lands gets to keep its invoice. The loser
  // of a double-click deletes its own just-created rows and reports
  // already_converted — two invoices / a double decrement are impossible.
  // (The loser burns an invoice number; harmless, the sequence stays unique.)
  const { data: claimedPf } = await supabase
    .from("invoices")
    .update({
      status: "converted",
      converted_to_invoice_id: inv.id,
      updated_at: now.toISOString(),
    })
    .eq("id", pf.id)
    .is("converted_to_invoice_id", null)
    .neq("status", "converted")
    .select("id");
  if (!claimedPf || claimedPf.length === 0) {
    await supabase.from("invoices").delete().eq("id", inv.id);
    if (wasAdHoc && orderId) {
      await supabase.from("orders").delete().eq("id", orderId);
    }
    return { ok: false, reason: "already_converted" };
  }

  // Order-linked proforma: normally the checkout already took the goods
  // (finalizeOrder wrote `sale:` movements) and we must NOT decrement again.
  // But an order with ZERO ledger take whose invoice is being cut — a card
  // order that never got its paid callback, or any post-epoch order whose
  // finalize failed — is handing the goods over NOW. Decrement with exactly
  // the refs finalizeOrder would use, so a late paid callback collides into
  // no-ops instead of double-taking. Pre-epoch non-card orders decremented
  // off-ledger at checkout → skip (their take is real, just invisible).
  if (!wasAdHoc && orderId) {
    const cdb = supabase as unknown as StockDb;
    const ordMv = await getOrderMovements(cdb, orderId);
    if (!ordMv.ok) {
      return {
        ok: false,
        reason: `${ordMv.reason} — factura ${series}${number} a fost creată dar stocul nu s-a verificat; anuleaz-o (Void) și emite din nou`,
      };
    }
    if (!ordMv.rows.some((r) => r.reason === "sale")) {
      const linkCols = "id, created_at, payment_method";
      let linkRes = await supabase
        .from("orders")
        .select(`${linkCols}, payment_status` as typeof linkCols)
        .eq("id", orderId)
        .maybeSingle();
      if (linkRes.error && /payment_status/i.test(linkRes.error.message)) {
        linkRes = await supabase.from("orders").select(linkCols).eq("id", orderId).maybeSingle();
      }
      const linkOrd = linkRes.data as
        | { created_at?: string | null; payment_method?: string | null; payment_status?: string | null }
        | null;
      const epoch = await getLedgerEpoch(cdb);
      const pm = (linkOrd?.payment_method ?? "").toLowerCase();
      const unpaidCard =
        (pm === "card" || pm === "maib") && (linkOrd?.payment_status ?? null) !== "paid";
      const preEpoch =
        !!epoch &&
        !!linkOrd?.created_at &&
        new Date(linkOrd.created_at).getTime() < new Date(epoch).getTime();
      if (!preEpoch || unpaidCard) {
        const linkTake = new Map<string, number>();
        for (const it of pfSnapshot) {
          const qty = Number((it as { quantity?: number }).quantity ?? 0);
          if (qty <= 0) continue;
          const pid = await resolveLineProductId(cdb, it);
          if (!pid) continue;
          linkTake.set(pid, roundStock((linkTake.get(pid) ?? 0) + qty));
        }
        for (const [pid, qty] of linkTake) {
          const moved = await applyStockMovement(cdb, {
            productId: pid,
            delta: -qty,
            reason: "sale",
            ref: `sale:${orderId}:${pid}`,
            orderId,
            invoiceId: inv.id,
            createdBy: user.id,
          });
          if (!moved.ok) {
            return {
              ok: false,
              reason: `${moved.reason} — factura ${series}${number} a fost creată dar stocul nu s-a mișcat complet; anuleaz-o (Void) și emite din nou`,
            };
          }
        }
      }
    }
  }

  // The goods leave stock on the INVOICE, not on the proforma and not on
  // payment: the client takes the part when the factură is cut, whether he
  // settles now or on the deferred due date. So this runs for both
  // `paid` and `deferred`. Ledger refs (`sale:<order>:<product>`) make it
  // idempotent on top of the claim, and quantities are aggregated per
  // product so the same part on two proforma lines decrements in full.
  if (wasAdHoc && orderId) {
    const take = new Map<string, number>();
    const unresolvedIdx: number[] = [];
    for (let i = 0; i < pfSnapshot.length; i++) {
      const it = pfSnapshot[i];
      const qty = Number((it as { quantity?: number }).quantity ?? 0);
      if (qty <= 0) continue;
      const productId = await resolveLineProductId(
        supabase as unknown as StockDb,
        it,
      );
      if (!productId) {
        // Part not cataloged yet (purchase not entered). Mark the order line
        // like a draft-purchase sale: the void/cancel restore skips it, and
        // settleDraftPurchaseSales decrements it when the purchase posts.
        unresolvedIdx.push(i);
        continue;
      }
      take.set(productId, roundStock((take.get(productId) ?? 0) + qty));
    }
    for (const [productId, qty] of take) {
      const moved = await applyStockMovement(supabase as unknown as StockDb, {
        productId,
        delta: -qty,
        reason: "sale",
        ref: `sale:${orderId}:${productId}`,
        orderId,
        invoiceId: inv.id,
        createdBy: user.id,
      });
      if (!moved.ok) {
        return {
          ok: false,
          reason: `${moved.reason} — factura ${series}${number} a fost creată dar stocul nu s-a mișcat complet; anuleaz-o (Void) și emite din nou`,
        };
      }
    }
    if (unresolvedIdx.length > 0) {
      const { data: ordRow } = await supabase
        .from("orders")
        .select("items")
        .eq("id", orderId)
        .maybeSingle();
      const ordItems = Array.isArray(ordRow?.items)
        ? [...(ordRow!.items as Array<Record<string, unknown>>)]
        : [];
      for (const i of unresolvedIdx) {
        if (ordItems[i]) {
          ordItems[i] = { ...ordItems[i], from_draft_purchase: true };
        }
      }
      await supabase
        .from("orders")
        .update({ items: ordItems as unknown as Json })
        .eq("id", orderId);
    }
  }

  // Cash inflow only when the money actually came in. Deferred payments
  // get recorded when the customer pays.
  if (
    paymentStatus === "paid" &&
    scope === "conta2" &&
    options?.paymentMethod === "cash" &&
    orderId
  ) {
    const fxRate = pf.currency === "EUR" ? 20 : pf.currency === "USD" ? 17 : 1;
    await supabase.from("cash_register_movements").insert({
      direction: "in",
      amount: Number(pf.total),
      reason: "sale",
      order_id: orderId,
      created_by: user.id,
      notes: `Conversie proformă ${pf.series}${pf.number} → factură ${series}${number}`,
      ...({
        currency: pf.currency,
        fx_rate: fxRate,
        amount_mdl: Number((Number(pf.total) * fxRate).toFixed(2)),
      } as object),
    });
  }

  // For paid conversions, also close the originating order + delivery note.
  // Deferred conversions leave them in their current state — payment is
  // pending and so is the "delivered" semantics.
  if (paymentStatus === "paid" && orderId) {
    await supabase
      .from("orders")
      .update({ status: "delivered", updated_at: now.toISOString() })
      .eq("id", orderId);

    await supabase
      .from("delivery_notes")
      .update({ status: "delivered", updated_at: now.toISOString() })
      .eq("order_id", orderId)
      .neq("status", "returned");
  }

  revalidatePath("/[locale]/panel/proforme", "page");
  revalidatePath(`/[locale]/panel/proforme/${pf.id}`, "page");
  revalidatePath("/[locale]/panel/facturi", "page");
  revalidatePath("/[locale]/panel/fisa-de-livrare", "page");
  revalidatePath("/[locale]/admin/orders", "page");
  return { ok: true, invoiceId: inv.id, number: `${series}${number}` };
}

/**
 * Update an existing proforma — customer details, line items, currency,
 * output language, due days, notes. Series + number stay fixed. Once the
 * proforma is converted into a fiscal invoice or voided it can no longer
 * be edited.
 */
export async function updateProforma(
  id: string,
  raw: unknown,
): Promise<
  { ok: true } | { ok: false; reason: string; belowCost?: BelowCostLine[] }
> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = proformaInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const v = parsed.data;
  // Same scope-driven TVA rule as the create path: conta1 → 20% every line,
  // conta2 → 0% every line. Forced both ways; the form cannot override it.
  const updProformaVatRate =
    v.account_scope === "conta1" || v.conta2_with_vat ? 20 : 0;
  const itemsNormalized = v.items.map((i) => ({
    ...i,
    vat_rate: updProformaVatRate,
  }));
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("invoices")
    .select("id, type, status, issued_date, converted_to_invoice_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, reason: "proforma_not_found" };
  if (existing.type !== "proforma") return { ok: false, reason: "not_a_proforma" };
  if (existing.converted_to_invoice_id) return { ok: false, reason: "already_converted" };
  if (existing.status === "void") return { ok: false, reason: "voided" };

  const updProformaBlocked = await collectBelowCost(supabase, v.items, v.currency, v.force_sell_pin);
  if (updProformaBlocked.length > 0) {
    return { ok: false, reason: "below_cost", belowCost: updProformaBlocked };
  }

  const { subtotal, vat_amount, total, discount_percent } = totals(
    itemsNormalized.map((i) => ({
      quantity: i.quantity,
      unit_price: i.unit_price,
      discounted_unit_price: i.discounted_unit_price ?? null,
      vat_rate: i.vat_rate,
    })),
  );
  const itemsSnapshot = itemsNormalized.map((i) => {
    const dp = i.discounted_unit_price;
    const eff =
      dp != null && dp >= 0 && dp < i.unit_price ? dp : i.unit_price;
    return {
      productId: i.product_id ?? null,
      partCode: i.part_code ?? null,
      name: i.name,
      description: i.description ?? null,
      quantity: i.quantity,
      unit: i.unit,
      unit_price: i.unit_price,
      discounted_unit_price: eff < i.unit_price ? eff : null,
      vat_rate: i.vat_rate,
      total: Number((i.quantity * eff).toFixed(2)),
      // Admin-only metadata — never rendered on the printable / customer
      // copy. Captures the catalog or draft-purchase cost so the digital
      // detail view can show margin per line.
      cost_price:
        i.cost_price != null && i.cost_price >= 0
          ? Number(i.cost_price)
          : null,
      markup_percent:
        i.markup_percent != null && i.markup_percent > 0
          ? Number(i.markup_percent)
          : null,
    };
  });

  // Recompute due_date relative to the original issued_date so editing the
  // proforma doesn't accidentally shift the maturity window.
  const issued = new Date(existing.issued_date);
  const due = new Date(issued.getTime() + (v.due_days ?? 7) * 86_400_000);

  const { error } = await supabase
    .from("invoices")
    .update({
      account_scope: v.account_scope,
      currency: v.currency,
      customer_snapshot: v.customer as unknown as Json,
      items_snapshot: itemsSnapshot as unknown as Json,
      subtotal,
      vat_amount,
      total,
      due_date: due.toISOString().slice(0, 10),
      notes: v.notes ?? null,
      updated_at: new Date().toISOString(),
      ...({
        output_locale: v.output_locale,
        ...(discount_percent > 0 ? { discount_percent } : {}),
      } as object),
    })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/proforme", "page");
  revalidatePath(`/[locale]/panel/proforme/${id}`, "page");
  return { ok: true };
}

/**
 * Edit an existing fiscal invoice. Same shape as updateProforma but
 * gated to type='invoice' and rejected once the invoice is paid, void,
 * or converted — those states are accounting-locked. Series + number
 * stay fixed; only mutable detail (customer, items, totals, notes,
 * scope, due window) gets rewritten.
 */
export async function updateInvoice(
  id: string,
  raw: unknown,
): Promise<
  { ok: true } | { ok: false; reason: string; belowCost?: BelowCostLine[] }
> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = proformaInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const v = parsed.data;
  // Scope-driven TVA, forced both ways (conta1 → 20%, conta2 → 0%). An edited
  // fiscal invoice can never be flipped to a wrong per-line rate by the form.
  const updInvoiceVatRate =
    v.account_scope === "conta1" || v.conta2_with_vat ? 20 : 0;
  const itemsNormalized = v.items.map((i) => ({
    ...i,
    vat_rate: updInvoiceVatRate,
  }));
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("invoices")
    .select("id, type, status, issued_date, order_id, items_snapshot")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, reason: "invoice_not_found" };
  if (existing.type !== "invoice") return { ok: false, reason: "not_an_invoice" };
  // Accounting-locked states. Anything else (draft / issued / sent) is
  // still editable — typos in customer details, fixing a wrong item.
  if (existing.status === "paid") return { ok: false, reason: "already_paid" };
  if (existing.status === "void") return { ok: false, reason: "voided" };

  // An invoice with return annexes is line-locked: returns reference lines by
  // index and cap against them — reordering/removing lines would let the same
  // goods be credited twice (or block a legitimate return). Undo the returns
  // first if the lines really must change.
  const invReturns = await getReturnsFor("invoice", id);
  if (invReturns.length > 0) {
    return { ok: false, reason: "has_returns" };
  }

  // Read the ledger BEFORE writing anything: if the read fails we refuse the
  // edit rather than saving new quantities whose stock diff can't be applied.
  const updDb = supabase as unknown as StockDb;
  let saleMovements: Awaited<ReturnType<typeof getOrderMovements>> | null = null;
  if (existing.order_id) {
    saleMovements = await getOrderMovements(updDb, existing.order_id);
    if (!saleMovements.ok) {
      return { ok: false, reason: saleMovements.reason };
    }
  }

  const updInvoiceBlocked = await collectBelowCost(supabase, v.items, v.currency, v.force_sell_pin);
  if (updInvoiceBlocked.length > 0) {
    return { ok: false, reason: "below_cost", belowCost: updInvoiceBlocked };
  }

  const { subtotal, vat_amount, total, discount_percent } = totals(
    itemsNormalized.map((i) => ({
      quantity: i.quantity,
      unit_price: i.unit_price,
      discounted_unit_price: i.discounted_unit_price ?? null,
      vat_rate: i.vat_rate,
    })),
  );
  const itemsSnapshot = itemsNormalized.map((i) => {
    const dp = i.discounted_unit_price;
    const eff =
      dp != null && dp >= 0 && dp < i.unit_price ? dp : i.unit_price;
    return {
      productId: i.product_id ?? null,
      partCode: i.part_code ?? null,
      name: i.name,
      description: i.description ?? null,
      quantity: i.quantity,
      unit: i.unit,
      unit_price: i.unit_price,
      discounted_unit_price: eff < i.unit_price ? eff : null,
      vat_rate: i.vat_rate,
      total: Number((i.quantity * eff).toFixed(2)),
      // Admin-only metadata — never rendered on the printable / customer
      // copy. Captures the catalog or draft-purchase cost so the digital
      // detail view can show margin per line.
      cost_price:
        i.cost_price != null && i.cost_price >= 0
          ? Number(i.cost_price)
          : null,
      markup_percent:
        i.markup_percent != null && i.markup_percent > 0
          ? Number(i.markup_percent)
          : null,
    };
  });

  const issued = new Date(existing.issued_date);
  const due = new Date(issued.getTime() + (v.due_days ?? 7) * 86_400_000);

  const { error } = await supabase
    .from("invoices")
    .update({
      account_scope: v.account_scope,
      currency: v.currency,
      customer_snapshot: v.customer as unknown as Json,
      items_snapshot: itemsSnapshot as unknown as Json,
      subtotal,
      vat_amount,
      total,
      due_date: due.toISOString().slice(0, 10),
      notes: v.notes ?? null,
      updated_at: new Date().toISOString(),
      ...({
        output_locale: v.output_locale,
        ...(discount_percent > 0 ? { discount_percent } : {}),
      } as object),
    })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };

  // Quantity edits move stock too — this invoice IS the sale, so changing a
  // line from 1 to 5 must take 4 more out (and 5→1 must put 4 back). Diff the
  // old vs new snapshot per RESOLVED product and apply the difference through
  // the ledger. Applies only to orders whose decrement lives in the ledger;
  // pre-ledger invoices keep the old no-move behavior rather than guessing.
  if (existing.order_id && saleMovements?.ok) {
    const db = updDb;
    const movements = saleMovements.rows;
    if (movements.some((m) => m.reason === "sale")) {
      const aggregate = async (snap: Array<Record<string, unknown>>) => {
        const m = new Map<string, number>();
        for (const it of snap) {
          const qty = Number((it as { quantity?: number }).quantity ?? 0);
          if (qty <= 0) continue;
          const pid = await resolveLineProductId(db, it);
          if (!pid) continue;
          m.set(pid, roundStock((m.get(pid) ?? 0) + qty));
        }
        return m;
      };
      const before = await aggregate(
        Array.isArray(existing.items_snapshot)
          ? (existing.items_snapshot as Array<Record<string, unknown>>)
          : [],
      );
      const after = await aggregate(
        itemsSnapshot as unknown as Array<Record<string, unknown>>,
      );
      for (const pid of new Set([...before.keys(), ...after.keys()])) {
        const delta = roundStock((before.get(pid) ?? 0) - (after.get(pid) ?? 0));
        if (delta === 0) continue;
        const seq = movements.filter(
          (m) => m.product_id === pid && m.reason === "invoice_edit",
        ).length;
        const moved = await applyStockMovement(db, {
          productId: pid,
          delta,
          reason: "invoice_edit",
          ref: `invoice_edit:${id}:${pid}:${seq}`,
          orderId: existing.order_id,
          invoiceId: id,
          createdBy: user.id,
        });
        if (!moved.ok) {
          return {
            ok: false,
            reason: `${moved.reason} — factura e salvată dar stocul NU s-a ajustat; redeschide editarea și salvează din nou`,
          };
        }
        // `applied: false` = the seq ref was taken by a CONCURRENT edit. Do
        // NOT walk the seq forward (that could stack two edits' deltas on a
        // snapshot only one of them owns) — abort; re-opening the invoice
        // diffs against the latest saved state and converges correctly.
        if (!moved.applied) {
          return {
            ok: false,
            reason: "stock_edit_conflict — altă editare a rulat în paralel; redeschide factura, verifică liniile și salvează din nou",
          };
        }
      }
    }
  }

  revalidatePath("/[locale]/panel/facturi", "page");
  revalidatePath(`/[locale]/panel/facturi/${id}`, "page");
  return { ok: true };
}

/**
 * Mark a previously-issued fiscal invoice as paid. Captures when the money
 * came in, the amount and currency the customer actually settled in (may
 * differ from the invoice's own currency), and how it was paid. Closes the
 * originating order + delivery note and — for conta2 + cash — records the
 * cash inflow that was skipped at conversion time.
 */

/**
 * Move a document (invoice OR proforma) to the other accounting book.
 *
 * Changes ONLY `account_scope` — the reclassification the accountant cares
 * about. The issued figures (subtotal, VAT, total, line snapshot) are left
 * EXACTLY as the document went out; reclassifying which book it's counted in
 * must never silently rewrite what the customer already received. There is no
 * longer any automatic conta2 → conta1 flip on payment; this is the only way a
 * document changes book, and it does so deliberately.
 */
export async function setDocumentScope(
  id: string,
  newScope: "conta1" | "conta2",
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (newScope !== "conta1" && newScope !== "conta2") {
    return { ok: false, reason: "invalid_scope" };
  }
  const supabase = await createClient();

  const { data: doc, error: loadErr } = await supabase
    .from("invoices")
    .select("id, account_scope")
    .eq("id", id)
    .maybeSingle();
  if (loadErr || !doc) return { ok: false, reason: "not_found" };
  if (doc.account_scope === newScope) return { ok: true };

  const { error } = await supabase
    .from("invoices")
    .update({ account_scope: newScope, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/facturi", "page");
  revalidatePath(`/[locale]/panel/facturi/${id}`, "page");
  revalidatePath("/[locale]/panel/proforme", "page");
  revalidatePath(`/[locale]/panel/proforme/${id}`, "page");
  return { ok: true };
}

const markPaidSchema = z.object({
  /** ISO date (YYYY-MM-DD) when the payment hit. Defaults to today. */
  paid_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().nonnegative(),
  currency: z.enum(["MDL", "EUR", "USD"]),
  method: z.enum(["cash", "transfer", "card", "other"]),
});

export async function markInvoicePaid(
  invoiceId: string,
  raw: unknown,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = markPaidSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const v = parsed.data;
  const supabase = await createClient();

  // `paid_amount` isn't in the generated types yet, so the typed select would
  // collapse to an error type — cast the row to the shape we actually read.
  const invQuery = await supabase
    .from("invoices")
    .select("id, type, status, account_scope, order_id, total, currency, paid_amount, series, number")
    .eq("id", invoiceId)
    .maybeSingle();
  const inv = invQuery.data as unknown as {
    type: string | null;
    status: string | null;
    account_scope: string | null;
    order_id: string | null;
    total: number | null;
    currency: "MDL" | "EUR" | "USD" | null;
    paid_amount: number | null;
    series: string | null;
    number: string | null;
  } | null;
  if (!inv) return { ok: false, reason: "invoice_not_found" };
  if (inv.type !== "invoice") return { ok: false, reason: "not_an_invoice" };
  if (inv.status === "paid") return { ok: false, reason: "already_paid" };
  if (inv.status === "void") return { ok: false, reason: "voided" };

  const nowIso = new Date().toISOString();
  // Treat the user-supplied date as the actual payment moment.
  const paidAt = new Date(`${v.paid_at}T12:00:00Z`).toISOString();

  // Partial payments: accumulate every payment in the INVOICE's currency. The
  // invoice stays "partial" (with a running paid_amount) until the total is
  // covered, then flips to "paid". The customer who pays 600 € of a 1200 €
  // invoice now leaves it half-paid instead of fully settled.
  const invCurrency = (inv.currency ?? "MDL") as "MDL" | "EUR" | "USD";
  const rateOf = (c: string) => (c === "EUR" ? 20 : c === "USD" ? 17 : 1);
  const paymentInInvCur =
    invCurrency === v.currency
      ? v.amount
      : Number(((v.amount * rateOf(v.currency)) / rateOf(invCurrency)).toFixed(2));
  const alreadyPaid = Number(inv.paid_amount ?? 0);
  const runningPaid = Number((alreadyPaid + paymentInInvCur).toFixed(2));
  const isFullyPaid = runningPaid >= Number(inv.total ?? 0) - 0.01;

  // The invoice STAYS in the book it was issued in. Marking it paid records
  // the payment; it does NOT move the document between conta1 and conta2.
  // (The old rule auto-flipped paid invoices to conta1 — the operator does not
  // want that: a conta2 invoice paid in cash is still a conta2 document.
  // Use the scope editor to move a document deliberately.)
  const { error } = await supabase
    .from("invoices")
    .update({
      // paid_at marks FULL settlement; a partial leaves it open.
      paid_at: isFullyPaid ? paidAt : null,
      updated_at: nowIso,
      // status "partial" + paid_* aren't in the generated types yet.
      ...({
        status: isFullyPaid ? "paid" : "partial",
        paid_amount: runningPaid,
        paid_currency: invCurrency,
        paid_method: v.method,
      } as object),
    })
    .eq("id", invoiceId);
  if (error) return { ok: false, reason: error.message };

  // Cash drawer entry uses the ORIGINAL scope (inv was read before the
  // update), so a conta2/cash invoice still records the inflow into the
  // cash register even though the invoice itself now reads as conta1.
  if (inv.account_scope === "conta2" && v.method === "cash" && inv.order_id) {
    const fxRate = v.currency === "EUR" ? 20 : v.currency === "USD" ? 17 : 1;
    await supabase.from("cash_register_movements").insert({
      direction: "in",
      amount: v.amount,
      reason: "sale",
      order_id: inv.order_id,
      created_by: user.id,
      notes: `Plată ulterioară factură ${inv.series}${inv.number}`,
      ...({
        currency: v.currency,
        fx_rate: fxRate,
        amount_mdl: Number((v.amount * fxRate).toFixed(2)),
      } as object),
    });
  }

  if (inv.order_id) {
    await supabase
      .from("orders")
      .update({ status: "delivered", updated_at: nowIso })
      .eq("id", inv.order_id);
    await supabase
      .from("delivery_notes")
      .update({ status: "delivered", updated_at: nowIso })
      .eq("order_id", inv.order_id)
      .neq("status", "returned");
  }

  revalidatePath("/[locale]/panel/facturi", "page");
  revalidatePath(`/[locale]/panel/facturi/${invoiceId}`, "page");
  revalidatePath("/[locale]/admin/orders", "page");
  return { ok: true };
}

/**
 * Void any invoice (proforma or fiscal). For fiscal invoices linked to an
 * order whose stock has already been decremented (panel sales,
 * proforma→invoice conversions), this also:
 *   • restores stock for every catalog-linked item in the order's snapshot,
 *   • flips the order to status='cancelled',
 *   • flips any non-returned delivery note to status='returned',
 *   • records a reverse cash_register_movement when the void cancels a
 *     conta2/cash inflow.
 * All restoration steps are best-effort and idempotent: voiding an already-
 * cancelled order is a no-op for stock.
 */
export async function voidInvoice(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();

  // Read the invoice first so we know what to clean up.
  // Cast select string: paid_method lives on the table at runtime (sql
  // migration) but the generated TS types are stale.
  const { data: invRaw } = await supabase
    .from("invoices")
    .select(
      "id, type, status, order_id, account_scope, total, series, number, paid_method" as
        "id, type, status, order_id, account_scope, total, series, number",
    )
    .eq("id", id)
    .maybeSingle();
  const inv = invRaw as
    | (typeof invRaw & { paid_method?: string | null })
    | null;
  if (!inv) return { ok: false, reason: "invoice_not_found" };
  if (inv.status === "void") return { ok: true };

  const nowIso = new Date().toISOString();

  // Cleanup FIRST, void-flip LAST: if the stock restore fails, the invoice
  // stays live and the operator can simply retry — a voided invoice whose
  // restore silently died would be unrecoverable from the UI. All cleanup
  // steps are idempotent (ledger refs / conditional updates), so a concurrent
  // double-void converges instead of doubling.
  if (inv.type === "invoice" && inv.order_id) {
    const ordCols = "id, status, items, account_scope, total, currency, payment_method, created_at";
    let ordRes = await supabase
      .from("orders")
      .select(`${ordCols}, payment_status` as typeof ordCols)
      .eq("id", inv.order_id)
      .maybeSingle();
    if (ordRes.error && /payment_status/i.test(ordRes.error.message)) {
      ordRes = await supabase
        .from("orders")
        .select(ordCols)
        .eq("id", inv.order_id)
        .maybeSingle();
    }
    const ord = ordRes.data;

    if (ord && ord.status !== "cancelled") {
      // Restore EXACTLY what the ledger recorded for this order (sales,
      // draft settles, invoice edits, minus returns already credited back) —
      // never a re-guess from the item snapshot. Pre-ledger orders fall back
      // to the snapshot once; unpaid card orders restore nothing. A failed
      // restore ABORTS the void — nothing has been flipped yet.
      const restored = await reverseOrderStock(
        supabase as unknown as StockDb,
        {
          id: ord.id,
          items: ord.items,
          payment_method:
            (ord as { payment_method?: string | null }).payment_method ?? null,
          payment_status:
            (ord as { payment_status?: string | null }).payment_status ?? null,
          created_at:
            (ord as { created_at?: string | null }).created_at ?? null,
        },
        user.id,
      );
      if (!restored.ok) return restored;

      await supabase
        .from("orders")
        .update({ status: "cancelled", updated_at: nowIso })
        .eq("id", inv.order_id);

      await supabase
        .from("delivery_notes")
        .update({ status: "returned", updated_at: nowIso })
        .eq("order_id", inv.order_id)
        .neq("status", "returned");

      // If the invoice had recorded a conta2 cash inflow, log a reversal.
      const wasCashIn =
        inv.account_scope === "conta2" &&
        (inv.paid_method === "cash" || inv.paid_method === null);
      if (wasCashIn && Number(ord.total ?? 0) > 0) {
        const ordCurrency = (ord as { currency?: string | null }).currency ?? "MDL";
        const fxRate = ordCurrency === "EUR" ? 20 : ordCurrency === "USD" ? 17 : 1;
        const amt = Number(ord.total);
        await supabase.from("cash_register_movements").insert({
          direction: "out",
          amount: amt,
          reason: "adjustment",
          order_id: inv.order_id,
          created_by: user.id,
          notes: `Anulare factură ${inv.series ?? ""}${inv.number ?? ""}`,
          ...({
            currency: ordCurrency,
            fx_rate: fxRate,
            amount_mdl: Number((amt * fxRate).toFixed(2)),
          } as object),
        });
      }
    }
  }

  const { error } = await supabase
    .from("invoices")
    .update({ status: "void", updated_at: nowIso })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/proforme", "page");
  revalidatePath("/[locale]/panel/facturi", "page");
  revalidatePath("/[locale]/panel/fisa-de-livrare", "page");
  revalidatePath("/[locale]/admin/orders", "page");
  return { ok: true };
}

/**
 * Bulk-forward conta1 invoices in a date range to the bookkeeper.
 * PIN-gated. Conta 2 documents are excluded — only the fiscal book
 * goes out.
 */
export async function sendConta1InvoicesMonthly(
  from: string,
  to: string,
  pin: string,
): Promise<
  | { ok: true; count: number; sentAt: string }
  | { ok: false; reason: string }
> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return { ok: false, reason: "bad_range" };
  }
  const { getDocumentsForRange } = await import("@/lib/panel/invoices/queries");
  const { accountantMonthlyDocumentsEmail } = await import(
    "@/lib/email/accountant-monthly-documents"
  );
  const data = await getDocumentsForRange({
    type: "invoice",
    from,
    to,
    scope: "conta1",
  });
  if (data.count === 0) return { ok: false, reason: "empty_range" };

  const { subject, html, text } = accountantMonthlyDocumentsEmail({
    type: "invoice",
    ...data,
  });
  const result = await sendResendEmail({
    to: ACCOUNTANT_EMAIL,
    subject,
    html,
    text,
    replyTo: user.email ? { email: user.email } : undefined,
  });
  if (!result.ok) return { ok: false, reason: result.reason };
  return { ok: true, count: data.count, sentAt: new Date().toISOString() };
}

/**
 * Bulk-forward proformas in a date range. By design includes both
 * books — proformas aren't fiscal so the conta split is less load-
 * bearing here.
 */
export async function sendProformasMonthly(
  from: string,
  to: string,
  pin: string,
): Promise<
  | { ok: true; count: number; sentAt: string }
  | { ok: false; reason: string }
> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return { ok: false, reason: "bad_range" };
  }
  const { getDocumentsForRange } = await import("@/lib/panel/invoices/queries");
  const { accountantMonthlyDocumentsEmail } = await import(
    "@/lib/email/accountant-monthly-documents"
  );
  const data = await getDocumentsForRange({ type: "proforma", from, to });
  if (data.count === 0) return { ok: false, reason: "empty_range" };

  const { subject, html, text } = accountantMonthlyDocumentsEmail({
    type: "proforma",
    ...data,
  });
  const result = await sendResendEmail({
    to: ACCOUNTANT_EMAIL,
    subject,
    html,
    text,
    replyTo: user.email ? { email: user.email } : undefined,
  });
  if (!result.ok) return { ok: false, reason: result.reason };
  return { ok: true, count: data.count, sentAt: new Date().toISOString() };
}

/**
 * Hard-delete an invoice or proforma row. Used by the admin "Șterge"
 * action on /panel/facturi and /panel/proforme — gated by the admin PIN.
 * Unlinks references first so FK constraints don't block the delete.
 */
export async function deleteInvoiceWithPin(
  invoiceId: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };
  const supabase = await createClient();

  // Run the same restoration steps `voidInvoice` does BEFORE removing
  // the row — operator's complaint was that deleting a fiscal invoice
  // left the stock decremented (the sale path bumped it down at
  // post-sale time, hard-delete never bumped it back). Hard-delete is
  // logically a void + remove: restore stock, cancel the order, return
  // the delivery note, reverse the conta2/cash inflow.
  const { data: invRaw } = await supabase
    .from("invoices")
    .select(
      "id, type, order_id, account_scope, total, series, number, paid_method" as
        "id, type, order_id, account_scope, total, series, number",
    )
    .eq("id", invoiceId)
    .maybeSingle();
  const inv = invRaw as
    | (typeof invRaw & { paid_method?: string | null })
    | null;

  const nowIso = new Date().toISOString();

  if (inv && inv.type === "invoice" && inv.order_id) {
    const delOrdCols = "id, status, items, account_scope, total, currency, payment_method, created_at";
    let delOrdRes = await supabase
      .from("orders")
      .select(`${delOrdCols}, payment_status` as typeof delOrdCols)
      .eq("id", inv.order_id)
      .maybeSingle();
    if (delOrdRes.error && /payment_status/i.test(delOrdRes.error.message)) {
      delOrdRes = await supabase
        .from("orders")
        .select(delOrdCols)
        .eq("id", inv.order_id)
        .maybeSingle();
    }
    const ord = delOrdRes.data;

    if (ord && ord.status !== "cancelled") {
      // Same ledger-based restore as voidInvoice — undo what actually moved.
      // A failed restore aborts the delete: the document must not vanish
      // while its stock stays out.
      const restored = await reverseOrderStock(
        supabase as unknown as StockDb,
        {
          id: ord.id,
          items: ord.items,
          payment_method:
            (ord as { payment_method?: string | null }).payment_method ?? null,
          payment_status:
            (ord as { payment_status?: string | null }).payment_status ?? null,
          created_at:
            (ord as { created_at?: string | null }).created_at ?? null,
        },
        user.id,
      );
      if (!restored.ok) return restored;

      await supabase
        .from("orders")
        .update({ status: "cancelled", updated_at: nowIso })
        .eq("id", inv.order_id);

      await supabase
        .from("delivery_notes")
        .update({ status: "returned", updated_at: nowIso })
        .eq("order_id", inv.order_id)
        .neq("status", "returned");

      const wasCashIn =
        inv.account_scope === "conta2" &&
        (inv.paid_method === "cash" || inv.paid_method === null);
      if (wasCashIn && Number(ord.total ?? 0) > 0) {
        const ordCurrency = (ord as { currency?: string | null }).currency ?? "MDL";
        const fxRate = ordCurrency === "EUR" ? 20 : ordCurrency === "USD" ? 17 : 1;
        const amt = Number(ord.total);
        await supabase.from("cash_register_movements").insert({
          direction: "out",
          amount: amt,
          reason: "adjustment",
          order_id: inv.order_id,
          created_by: user.id,
          notes: `Ștergere factură ${inv.series ?? ""}${inv.number ?? ""}`,
          ...({
            currency: ordCurrency,
            fx_rate: fxRate,
            amount_mdl: Number((amt * fxRate).toFixed(2)),
          } as object),
        });
      }
    }
  }

  // Clear back-links so the FK on orders.invoice_id / invoices.* doesn't
  // block the delete. Other invoices that point at this one (proforma_id
  // or converted_to_invoice_id) get their links cleared too.
  await supabase.from("orders").update({ invoice_id: null }).eq("invoice_id", invoiceId);
  await supabase
    .from("invoices")
    .update({ proforma_id: null })
    .eq("proforma_id", invoiceId);
  await supabase
    .from("invoices")
    .update({ converted_to_invoice_id: null })
    .eq("converted_to_invoice_id", invoiceId);

  const { error } = await supabase.from("invoices").delete().eq("id", invoiceId);
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/facturi", "page");
  revalidatePath("/[locale]/panel/proforme", "page");
  revalidatePath("/[locale]/panel/fisa-de-livrare", "page");
  revalidatePath("/[locale]/admin/orders", "page");
  return { ok: true };
}

/**
 * Forward an invoice / proforma to the bookkeeper's inbox. Records the
 * timestamp on the row so the button can flip from "trimite" (green) to
 * "trimis · re-trimite" (yellow). Re-sends are allowed — every click
 * pushes a new email and bumps the timestamp.
 */
export async function sendInvoiceToAccountant(
  invoiceId: string,
  pin: string,
): Promise<
  | { ok: true; sentAt: string }
  | { ok: false; reason: string }
> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };

  const { getInvoice } = await import("@/lib/panel/invoices/queries");
  const invoice = await getInvoice(invoiceId);
  if (!invoice) return { ok: false, reason: "invoice_not_found" };

  // Enrich each line with the supplier's own part code (from the purchase) so
  // the bookkeeper sees BOTH the internal code and the supplier code.
  invoice.items_snapshot = await attachSupplierCodes(invoice.items_snapshot);

  // Attach any return annexes so the bookkeeper gets invoice + credit note
  // together (net position = invoice total − returns).
  const { getReturnsFor } = await import("@/lib/panel/returns/actions");
  const returns = await getReturnsFor("invoice", invoiceId);

  const { subject, html, text } = accountantInvoiceEmail(
    invoice,
    accountantMarkEnteredUrl("invoice", invoiceId),
    returns,
  );

  const result = await sendResendEmail({
    to: ACCOUNTANT_EMAIL,
    subject,
    html,
    text,
    replyTo: user.email ? { email: user.email } : undefined,
  });
  if (!result.ok) {
    return { ok: false, reason: result.reason };
  }

  const supabase = await createClient();
  const sentAt = new Date().toISOString();
  // Defensive write: omit accountant_sent_at if the migration hasn't been
  // applied yet — the email already went out, the UI just won't persist
  // the "sent" indicator across reloads in that case.
  const { error: updateError } = await supabase
    .from("invoices")
    .update(({ accountant_sent_at: sentAt } as never))
    .eq("id", invoiceId);
  if (updateError && /accountant_sent_at/i.test(updateError.message)) {
    console.warn(
      "[panel.invoices] accountant_sent_at column missing — apply sql/invoices-accountant-sent.sql",
    );
  }

  revalidatePath(`/[locale]/panel/facturi/${invoiceId}`, "page");
  revalidatePath(`/[locale]/panel/proforme/${invoiceId}`, "page");
  return { ok: true, sentAt };
}

/**
 * Issue a proforma straight from a storefront order — pulls customer + items
 * from `orders` and creates the proforma. Returns the new proforma id.
 */
export async function issueProformaFromOrder(
  orderId: string,
  dueDays = 7,
  currency: "MDL" | "EUR" | "USD" = "MDL",
): Promise<{ ok: true; id: string; number: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_email, customer_phone, customer_address, items, total, user_id",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, reason: "order_not_found" };

  let idno: string | null = null;
  let vat_number: string | null = null;
  if (order.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("idno, vat_code, vat_number")
      .eq("id", order.user_id)
      .maybeSingle();
    idno = profile?.idno ?? null;
    // Panel-created clients store their VAT registration in `vat_code`;
    // auth-signup business accounts use `vat_number`. Coalesce so the buyer
    // nr.TVA lands on the fiscal document regardless of which path created
    // the client.
    vat_number =
      (profile as { vat_code?: string | null } | null)?.vat_code ??
      profile?.vat_number ??
      null;
  }

  const items = (Array.isArray(order.items) ? order.items : []) as Array<{
    productId?: string;
    partCode?: string | null;
    name?: string;
    quantity?: number;
    price?: number;
  }>;
  if (items.length === 0) return { ok: false, reason: "no_items" };

  return issueProforma({
    order_id: order.id,
    customer: {
      user_id: order.user_id,
      name: order.customer_name ?? order.customer_email ?? "Client",
      email: order.customer_email,
      phone: order.customer_phone,
      idno,
      vat_number,
      address: order.customer_address,
    },
    items: items.map((it) => ({
      product_id: it.productId ?? null,
      part_code: it.partCode ?? null,
      name: it.name ?? "—",
      quantity: Number(it.quantity ?? 1),
      unit_price: Number(it.price ?? 0),
      vat_rate: 0,
    })),
    due_days: dueDays,
    currency,
    notes: null,
  });
}

/**
 * Light-touch update for the inline "notă" cell on the proforme +
 * facturi lists. Operator wants to scrawl a vehicle plate / bus
 * identifier without going through the full edit page — this writes
 * ONLY the notes column and revalidates both lists so the new label
 * shows up instantly.
 *
 * Available on any non-deleted invoice / proforma, regardless of
 * status. The notes field is informational and never feeds the
 * bookkeeper email totals.
 */
export async function setInvoiceQuickNote(
  invoiceId: string,
  note: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const trimmed = (note ?? "").trim();
  // Cap at 200 chars — anything longer probably belongs in the
  // full notes textarea on the edit page anyway, and we want the
  // list cell to stay scannable.
  const value = trimmed.length === 0 ? null : trimmed.slice(0, 200);

  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ notes: value, updated_at: new Date().toISOString() })
    .eq("id", invoiceId);
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/proforme", "page");
  revalidatePath("/[locale]/panel/facturi", "page");
  revalidatePath(`/[locale]/panel/proforme/${invoiceId}`, "page");
  revalidatePath(`/[locale]/panel/facturi/${invoiceId}`, "page");
  return { ok: true };
}
