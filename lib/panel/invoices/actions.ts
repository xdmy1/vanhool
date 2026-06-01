"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";
import type { Json } from "@/lib/supabase/database.types";

// ---- Schemas ---------------------------------------------------------------

const lineSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  part_code: z.string().nullable().optional(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  quantity: z.number().positive(),
  unit_price: z.number().nonnegative(),
  vat_rate: z.number().nonnegative().default(0),
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
  items: Array<{ quantity: number; unit_price: number; vat_rate: number }>,
  discountPercent = 0,
) {
  // `unit_price` is treated as VAT-inclusive (gross). Break it back into
  // net + VAT so the printed document still itemizes TVA.
  let net = 0;
  let vat = 0;
  let gross = 0;
  for (const i of items) {
    const lineGross = i.quantity * i.unit_price;
    const factor = 1 + i.vat_rate / 100;
    const lineNet = factor > 0 ? lineGross / factor : lineGross;
    gross += lineGross;
    net += lineNet;
    vat += lineGross - lineNet;
  }
  // Discount is the final step: comes off the gross. subtotal + vat_amount
  // stay as the pre-discount net + tax so the line-by-line breakdown remains
  // auditable on the printed document.
  const pct = Math.min(100, Math.max(0, discountPercent));
  const discountAmount = Number(((gross * pct) / 100).toFixed(2));
  const finalTotal = Number((gross - discountAmount).toFixed(2));
  return {
    subtotal: Number(net.toFixed(2)),
    vat_amount: Number(vat.toFixed(2)),
    total: finalTotal,
    discount_percent: pct,
    discount_amount: discountAmount,
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

  // Conta 2 = no-fiscal book → TVA is forced to 0 regardless of what the
  // form sent. The price the operator typed is the price.
  const items = v.items.map((i) => ({
    ...i,
    vat_rate: v.account_scope === "conta2" ? 0 : (i.vat_rate ?? 0),
  }));

  const itemsForTotals = items.map((i) => ({
    quantity: i.quantity,
    unit_price: i.unit_price,
    vat_rate: i.vat_rate,
  }));
  const { subtotal, vat_amount, total, discount_percent } = totals(
    itemsForTotals,
    v.discount_percent,
  );

  const itemsSnapshot = items.map((i) => ({
    productId: i.product_id ?? null,
    partCode: i.part_code ?? null,
    name: i.name,
    description: i.description ?? null,
    quantity: i.quantity,
    unit_price: i.unit_price,
    vat_rate: i.vat_rate,
    total: Number((i.quantity * i.unit_price).toFixed(2)),
  }));

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
      ...({ output_locale: v.output_locale, discount_percent } as object),
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

  // Default to the proforma's own scope so converting a conta2 proforma
  // doesn't accidentally land the fiscal invoice in conta1.
  const scope =
    options?.account_scope ??
    ((pf as { account_scope?: "conta1" | "conta2" }).account_scope ?? "conta1");
  const paymentStatus = options?.payment_status ?? "paid";
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
        subtotal: Number(pf.subtotal ?? 0),
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

  const { data: inv, error: insErr } = await supabase
    .from("invoices")
    .insert({
      order_id: orderId,
      account_scope: scope,
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
      items_snapshot: pf.items_snapshot,
      subtotal: pf.subtotal,
      vat_amount: pf.vat_amount,
      total: pf.total,
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
  // Same conta2 → 0% TVA rule as the create path.
  const itemsNormalized = v.items.map((i) => ({
    ...i,
    vat_rate: v.account_scope === "conta2" ? 0 : (i.vat_rate ?? 0),
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
      vat_rate: i.vat_rate,
    })),
    v.discount_percent,
  );
  const itemsSnapshot = itemsNormalized.map((i) => ({
    productId: i.product_id ?? null,
    partCode: i.part_code ?? null,
    name: i.name,
    description: i.description ?? null,
    quantity: i.quantity,
    unit_price: i.unit_price,
    vat_rate: i.vat_rate,
    total: Number((i.quantity * i.unit_price).toFixed(2)),
  }));

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
      ...({ output_locale: v.output_locale, discount_percent } as object),
    })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/proforme", "page");
  revalidatePath(`/[locale]/panel/proforme/${id}`, "page");
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

  const { error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_at: paidAt,
      updated_at: nowIso,
      ...({ paid_amount: v.amount, paid_currency: v.currency, paid_method: v.method } as object),
    })
    .eq("id", invoiceId);
  if (error) return { ok: false, reason: error.message };

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
      .select("idno, vat_number")
      .eq("id", order.user_id)
      .maybeSingle();
    idno = profile?.idno ?? null;
    vat_number = profile?.vat_number ?? null;
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
