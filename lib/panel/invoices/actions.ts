"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";
import { verifyAdminPin } from "@/lib/panel/admin-pin";
import { sendResendEmail } from "@/lib/email/resend";
import { accountantInvoiceEmail } from "@/lib/email/accountant-invoice";
import type { Json } from "@/lib/supabase/database.types";

// Bookkeeper inbox — single recipient for the "send to accountant" button
// on each invoice / proforma detail page. Per project owner; not stored in
// settings because it's a fixed business address.
// Bookkeeper inbox for all forwarded fiscal documents (e-facturi + monthly
// reports). Override via env if it ever needs to change without a redeploy.
const ACCOUNTANT_EMAIL =
  process.env.ACCOUNTANT_EMAIL || "bobernagadamianw2312@gmail.com";

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
  /**
   * Internal cost per unit — captured at proforma/invoice creation
   * so admin sees the realised margin on the digital detail view.
   * NEVER rendered on the printable/customer-facing document.
   * Source order: explicit value from the form (autocomplete pulls
   * it from the catalog product or the draft purchase line) → null.
   */
  cost_price: z.number().nonnegative().nullable().optional(),
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

// ---- Public actions --------------------------------------------------------

/**
 * Issue a proforma invoice. Either from an existing order (storefront/panel)
 * or ad-hoc (no order_id). Returns the new proforma id.
 */
export async function issueProforma(
  raw: unknown,
): Promise<{ ok: true; id: string; number: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = proformaInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const v = parsed.data;
  const supabase = await createClient();

  // VAT is driven purely by the book (account_scope), never by the form:
  //   conta1 → every line 20%, conta2 → every line 0%.
  // Forcing both directions (not just zeroing conta2) closes the hole where
  // a conta1 line could ship 0% TVA if the form sent 0.
  const lineVatRate = v.account_scope === "conta1" ? 20 : 0;
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
      issued_date: today.toISOString().slice(0, 10),
      due_date: due.toISOString().slice(0, 10),
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

  // Two-track scope. The proforma → invoice conversion produces a
  // synthetic ORDER (the sale itself) and a fiscal INVOICE, and the
  // operator wants them to live in different books when payment is
  // already in:
  //   • orderScope — the SALE's scope. A paid conta2 proforma was paid in
  //     cash → the cash hit the conta2 drawer; the order keeps conta2
  //     so the cash drawer/movement still ties to that informal sale.
  //   • invoiceScope — the fiscal document. A paid proforma becomes a
  //     real factură; once the document is fiscal, it lives in conta1
  //     regardless of where the sale itself sat. Deferred conversion
  //     stays on orderScope because no money has hit yet.
  // `options.account_scope` overrides both — keeps the door open for a
  // manual force if we ever need it.
  const paymentStatus = options?.payment_status ?? "paid";
  const proformaScope =
    (pf as { account_scope?: "conta1" | "conta2" }).account_scope ?? "conta1";
  const orderScope: "conta1" | "conta2" =
    options?.account_scope ?? proformaScope;
  const invoiceScope: "conta1" | "conta2" =
    options?.account_scope ??
    (paymentStatus === "paid" ? "conta1" : proformaScope);
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
        source: "panel",
        notes: `Generat din pro-formă ${pf.series ?? ""}${pf.number ?? ""}`,
      })
      .select("id")
      .single();
    if (!oErr && o) {
      orderId = o.id;
    }
  }
  const deferredDue =
    paymentStatus === "deferred"
      ? new Date(now.getTime() + dueInDays * 86_400_000).toISOString().slice(0, 10)
      : null;

  // The fiscal invoice may land in a DIFFERENT book than the proforma — a
  // paid conta2 proforma becomes a conta1 factură. TVA must follow the
  // INVOICE's book, not the proforma's, or a conta1 factură could ship with
  // 0% TVA. Recompute net/TVA/total + per-line vat_rate from invoiceScope off
  // the proforma's GROSS line snapshot. Gross total is unchanged (gross is
  // gross); only the net/TVA split moves.
  const convLineVat = invoiceScope === "conta1" ? 20 : 0;
  const pfSnapshot = Array.isArray(pf.items_snapshot)
    ? (pf.items_snapshot as Array<Record<string, unknown>>)
    : [];
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
      issued_date: now.toISOString().slice(0, 10),
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
      } as object),
    })
    .select("id")
    .single();
  if (insErr || !inv) return { ok: false, reason: insErr?.message ?? "insert_failed" };

  await supabase
    .from("invoices")
    .update({
      status: "converted",
      converted_to_invoice_id: inv.id,
      updated_at: now.toISOString(),
    })
    .eq("id", pf.id);

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
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = proformaInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const v = parsed.data;
  // Same scope-driven TVA rule as the create path: conta1 → 20% every line,
  // conta2 → 0% every line. Forced both ways; the form cannot override it.
  const updProformaVatRate = v.account_scope === "conta1" ? 20 : 0;
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
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = proformaInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const v = parsed.data;
  // Scope-driven TVA, forced both ways (conta1 → 20%, conta2 → 0%). An edited
  // fiscal invoice can never be flipped to a wrong per-line rate by the form.
  const updInvoiceVatRate = v.account_scope === "conta1" ? 20 : 0;
  const itemsNormalized = v.items.map((i) => ({
    ...i,
    vat_rate: updInvoiceVatRate,
  }));
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("invoices")
    .select("id, type, status, issued_date")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, reason: "invoice_not_found" };
  if (existing.type !== "invoice") return { ok: false, reason: "not_an_invoice" };
  // Accounting-locked states. Anything else (draft / issued / sent) is
  // still editable — typos in customer details, fixing a wrong item.
  if (existing.status === "paid") return { ok: false, reason: "already_paid" };
  if (existing.status === "void") return { ok: false, reason: "voided" };

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

  const { data: inv } = await supabase
    .from("invoices")
    .select("id, type, status, account_scope, order_id, total, series, number")
    .eq("id", invoiceId)
    .maybeSingle();
  if (!inv) return { ok: false, reason: "invoice_not_found" };
  if (inv.type !== "invoice") return { ok: false, reason: "not_an_invoice" };
  if (inv.status === "paid") return { ok: false, reason: "already_paid" };
  if (inv.status === "void") return { ok: false, reason: "voided" };

  const nowIso = new Date().toISOString();
  // Treat the user-supplied date as the actual payment moment.
  const paidAt = new Date(`${v.paid_at}T12:00:00Z`).toISOString();

  // Operator's rule: once payment hits, the fiscal record moves to the
  // official book. A conta2 invoice that gets paid (cash, transfer, card —
  // doesn't matter) is no longer an informal sale, it's a fiscal document,
  // so it belongs in conta1. The originating order and the cash_register
  // movement keep their conta2 scope — that's where the actual money was
  // received. Only the invoice line flips.
  const { error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: paidAt,
      updated_at: nowIso,
      account_scope: "conta1",
      ...({ paid_amount: v.amount, paid_currency: v.currency, paid_method: v.method } as object),
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
  const { error } = await supabase
    .from("invoices")
    .update({ status: "void", updated_at: nowIso })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };

  // Stock + order cleanup only for fiscal invoices with a linked order.
  if (inv.type === "invoice" && inv.order_id) {
    const { data: ord } = await supabase
      .from("orders")
      .select("id, status, items, account_scope, total, currency")
      .eq("id", inv.order_id)
      .maybeSingle();

    if (ord && ord.status !== "cancelled") {
      const items = Array.isArray(ord.items)
        ? (ord.items as Array<Record<string, unknown>>)
        : [];
      // Restore stock for each catalog-linked line.
      for (const it of items) {
        const productId =
          (it as { productId?: string | null }).productId ??
          (it as { product_id?: string | null }).product_id ??
          null;
        const qty = Number((it as { quantity?: number }).quantity ?? 0);
        if (!productId || qty <= 0) continue;
        const { data: p } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", productId)
          .maybeSingle();
        if (!p) continue;
        await supabase
          .from("products")
          .update({ stock_quantity: Number(p.stock_quantity ?? 0) + qty })
          .eq("id", productId);
      }

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
    const { data: ord } = await supabase
      .from("orders")
      .select("id, status, items, account_scope, total, currency")
      .eq("id", inv.order_id)
      .maybeSingle();

    if (ord && ord.status !== "cancelled") {
      const items = Array.isArray(ord.items)
        ? (ord.items as Array<Record<string, unknown>>)
        : [];
      for (const it of items) {
        const productId =
          (it as { productId?: string | null }).productId ??
          (it as { product_id?: string | null }).product_id ??
          null;
        const qty = Number((it as { quantity?: number }).quantity ?? 0);
        if (!productId || qty <= 0) continue;
        const { data: p } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", productId)
          .maybeSingle();
        if (!p) continue;
        await supabase
          .from("products")
          .update({ stock_quantity: Number(p.stock_quantity ?? 0) + qty })
          .eq("id", productId);
      }

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

  const { subject, html, text } = accountantInvoiceEmail(invoice);

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
