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
  /** Language the proforma is printed in — independent of the admin's UI. */
  output_locale: z.enum(["ro", "en", "ru"]).default("ro"),
  notes: z.string().nullable().optional(),
});

export type ProformaInput = z.infer<typeof proformaInputSchema>;

// ---- Helpers ---------------------------------------------------------------

function totals(items: Array<{ quantity: number; unit_price: number; vat_rate: number }>) {
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
  return {
    subtotal: Number(net.toFixed(2)),
    vat_amount: Number(vat.toFixed(2)),
    total: Number(gross.toFixed(2)),
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

  const itemsForTotals = v.items.map((i) => ({
    quantity: i.quantity,
    unit_price: i.unit_price,
    vat_rate: i.vat_rate ?? 0,
  }));
  const { subtotal, vat_amount, total } = totals(itemsForTotals);

  const itemsSnapshot = v.items.map((i) => ({
    productId: i.product_id ?? null,
    partCode: i.part_code ?? null,
    name: i.name,
    description: i.description ?? null,
    quantity: i.quantity,
    unit_price: i.unit_price,
    vat_rate: i.vat_rate ?? 0,
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
      account_scope: "conta1",
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
      ...({ output_locale: v.output_locale } as object),
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
  options?: { paymentMethod?: "cash" | "transfer" | "card"; account_scope?: "conta1" | "conta2" },
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

  const scope = options?.account_scope ?? "conta1";
  const { series, number } = await takeNextNumber(
    supabase,
    "invoice.series",
    "invoice.next_number",
    "M",
    1,
  );
  const now = new Date();

  const { data: inv, error: insErr } = await supabase
    .from("invoices")
    .insert({
      order_id: pf.order_id,
      account_scope: scope,
      type: "invoice",
      series,
      number,
      issued_date: now.toISOString().slice(0, 10),
      paid_at: now.toISOString(),
      currency: pf.currency,
      customer_snapshot: pf.customer_snapshot,
      items_snapshot: pf.items_snapshot,
      subtotal: pf.subtotal,
      vat_amount: pf.vat_amount,
      total: pf.total,
      notes: pf.notes,
      status: "paid",
      proforma_id: pf.id,
      // Carry the language across the conversion so the fiscal invoice
      // matches the proforma's recipient language.
      ...({ output_locale: (pf as { output_locale?: string }).output_locale ?? "ro" } as object),
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

  // If conta2 + cash, record the inflow.
  if (scope === "conta2" && options?.paymentMethod === "cash" && pf.order_id) {
    await supabase.from("cash_register_movements").insert({
      direction: "in",
      amount: Number(pf.total),
      reason: "sale",
      order_id: pf.order_id,
      created_by: user.id,
      notes: `Conversie proformă ${pf.series}${pf.number} → factură ${series}${number}`,
    });
  }

  revalidatePath("/[locale]/panel/proforme", "page");
  revalidatePath(`/[locale]/panel/proforme/${pf.id}`, "page");
  revalidatePath("/[locale]/panel/facturi", "page");
  return { ok: true, invoiceId: inv.id, number: `${series}${number}` };
}

/** Void any invoice (proforma or fiscal). Non-reversible for fiscal compliance. */
export async function voidInvoice(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status: "void", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/proforme", "page");
  revalidatePath("/[locale]/panel/facturi", "page");
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
