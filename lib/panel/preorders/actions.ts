"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";
import { verifyAdminPin } from "@/lib/panel/admin-pin";
import { sendResendEmail } from "@/lib/email/resend";
import { preorderConfirmationEmail } from "@/lib/email/preorder-confirmation";
import { preorderReceiptEmail } from "@/lib/email/preorder-receipt";
import type { PreorderStatus } from "@/lib/panel/preorders/queries";

// Per-line schema for the multi-item form. The customer + supplier + ETA
// + currency live on the wrapper and are shared across all rows.
const itemSchema = z.object({
  product_id: z.string().uuid().nullable().optional(),
  part_code: z.string().nullable().optional(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  supplier_unit_cost: z.number().nonnegative().default(0),
  unit_price: z.number().nonnegative(),
});

const preorderSchema = z.object({
  customer_id: z.string().uuid().nullable().optional(),
  customer_name: z.string().min(1),
  customer_phone: z.string().nullable().optional(),
  customer_email: z.string().email().nullable().optional().or(z.literal("")),
  supplier_id: z.string().uuid().nullable().optional(),
  currency: z.enum(["MDL", "EUR", "USD"]).default("MDL"),
  expected_delivery_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  notes: z.string().nullable().optional(),
  /**
   * One or more parts requested in the same preorder. When `items.length >
   * 1`, all rows are stamped with the same `preorder_group_id` so we can
   * later collapse a batch into a single visible card on the list.
   *
   * Backwards-compatible: callers that still send the flat single-part
   * shape (part_code / description / quantity / supplier_unit_cost /
   * unit_price at the top level) get wrapped into a 1-element items
   * array before validation — see `createPreorder` below.
   */
  items: z.array(itemSchema).min(1),
});

export type PreorderInput = z.infer<typeof preorderSchema>;

/** Legacy single-item callers: accept the flat shape and rewrite. */
function normalizeLegacyInput(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.items)) return raw;
  // Flat shape — only present in older callers / fixtures.
  if (typeof r.description === "string" && typeof r.quantity === "number") {
    return {
      ...r,
      items: [
        {
          product_id: r.product_id ?? null,
          part_code: r.part_code ?? null,
          description: r.description,
          quantity: r.quantity,
          supplier_unit_cost: r.supplier_unit_cost ?? 0,
          unit_price: r.unit_price ?? 0,
        },
      ],
    };
  }
  return raw;
}

export async function createPreorder(
  raw: unknown,
): Promise<
  | { ok: true; id: string; ids: string[]; groupId: string | null }
  | { ok: false; reason: string }
> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const parsed = preorderSchema.safeParse(normalizeLegacyInput(raw));
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const v = parsed.data;
  const supabase = await createClient();
  // Multi-item batches share a UUID stamped on every row. Single-item
  // preorders keep group_id null so the listing logic doesn't need to
  // change for that common case.
  const groupId = v.items.length > 1 ? crypto.randomUUID() : null;

  const rows = v.items.map((item) => ({
    customer_id: v.customer_id ?? null,
    customer_name: v.customer_name,
    customer_phone: v.customer_phone || null,
    customer_email: v.customer_email || null,
    product_id: item.product_id ?? null,
    part_code: item.part_code || null,
    description: item.description,
    quantity: item.quantity,
    supplier_id: v.supplier_id ?? null,
    supplier_unit_cost: item.supplier_unit_cost,
    unit_price: item.unit_price,
    currency: v.currency,
    expected_delivery_date: v.expected_delivery_date || null,
    notes: v.notes || null,
    preorder_group_id: groupId,
    created_by: user.id,
  }));

  // `preorders` is a new table; the generated TS types are stale until
  // they're regenerated, hence the cast.
  const { data, error } = await (supabase as unknown as {
    from: (t: string) => {
      insert: (v: unknown) => {
        select: (cols: string) => Promise<{
          data: { id: string }[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  })
    .from("preorders")
    .insert(rows)
    .select("id");
  if (error || !data || data.length === 0) {
    return { ok: false, reason: error?.message ?? "insert_failed" };
  }
  const ids = data.map((r) => r.id);
  revalidatePath("/[locale]/panel/precomenzi", "page");
  return { ok: true, id: ids[0], ids, groupId };
}

/**
 * Receipt email — operator clicks "Trimite confirmare primire" on a freshly
 * created preorder, customer gets a "we got your request, checking with
 * suppliers" email. Independent of the later "confirmed" email which goes
 * out once price + ETA are locked in.
 *
 * Tracks `receipt_sent_at` so a double-click doesn't double-send. Pass
 * `force: true` from a UI re-send button to bypass that guard.
 */
export async function sendPreorderReceipt(
  id: string,
  options?: { force?: boolean },
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();
  const { data: dataRaw } = await supabase
    .from("preorders" as never)
    .select(
      "id, status, customer_name, customer_email, part_code, description, quantity, receipt_sent_at",
    )
    .eq("id", id)
    .maybeSingle();
  const data = dataRaw as
    | {
        status: PreorderStatus;
        customer_name: string;
        customer_email: string | null;
        part_code: string | null;
        description: string;
        quantity: number;
        receipt_sent_at: string | null;
      }
    | null;
  if (!data) return { ok: false, reason: "preorder_not_found" };
  if (data.status === "cancelled") return { ok: false, reason: "cancelled" };
  if (!data.customer_email) return { ok: false, reason: "no_customer_email" };
  if (/^panel-[a-f0-9-]+@inter-bus\.md$/i.test(data.customer_email)) {
    return { ok: false, reason: "synthetic_email" };
  }
  if (data.receipt_sent_at && !options?.force) {
    return { ok: false, reason: "already_sent" };
  }

  const { subject, html, text } = preorderReceiptEmail({
    customerName: data.customer_name,
    partCode: data.part_code,
    description: data.description,
    quantity: Number(data.quantity ?? 0),
  });
  const r = await sendResendEmail({ to: data.customer_email, subject, html, text });
  if (!r.ok) return { ok: false, reason: r.reason };
  await supabase
    .from("preorders" as never)
    .update({ receipt_sent_at: new Date().toISOString() } as never)
    .eq("id", id);
  revalidatePath("/[locale]/panel/precomenzi", "page");
  return { ok: true };
}

const statusTransitions: Record<PreorderStatus, PreorderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["ordered", "arrived", "cancelled"],
  ordered: ["arrived", "cancelled"],
  arrived: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function setPreorderStatus(
  id: string,
  next: PreorderStatus,
): Promise<
  | { ok: true; emailSent?: boolean }
  | { ok: false; reason: string }
> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const supabase = await createClient();
  const { data: currentRaw } = await supabase
    .from("preorders" as never)
    .select(
      "id, status, customer_name, customer_email, part_code, description, quantity, unit_price, currency, expected_delivery_date, notes, confirmation_sent_at",
    )
    .eq("id", id)
    .maybeSingle();
  const current = currentRaw as
    | {
        status: PreorderStatus;
        customer_name: string;
        customer_email: string | null;
        part_code: string | null;
        description: string;
        quantity: number;
        unit_price: number;
        currency: string;
        expected_delivery_date: string | null;
        notes: string | null;
        confirmation_sent_at: string | null;
      }
    | null;
  if (!current) return { ok: false, reason: "preorder_not_found" };

  const validNext = statusTransitions[current.status] ?? [];
  if (!validNext.includes(next)) {
    return { ok: false, reason: `invalid_transition:${current.status}→${next}` };
  }

  const update: Record<string, unknown> = {
    status: next,
    updated_at: new Date().toISOString(),
  };
  if (next === "confirmed" && !current.confirmation_sent_at) {
    update.confirmed_at = new Date().toISOString();
  } else if (next === "confirmed") {
    update.confirmed_at = new Date().toISOString();
  }
  if (next === "arrived") update.arrived_at = new Date().toISOString();
  if (next === "delivered") update.delivered_at = new Date().toISOString();

  // Side effect: when transitioning to `confirmed` AND the customer has an
  // email AND we haven't sent the confirmation yet, fire the brand-styled
  // confirmation email.
  let emailSent = false;
  if (
    next === "confirmed" &&
    current.customer_email &&
    !current.confirmation_sent_at &&
    !/^panel-[a-f0-9-]+@inter-bus\.md$/i.test(current.customer_email)
  ) {
    const { subject, html, text } = preorderConfirmationEmail({
      customerName: current.customer_name,
      partCode: current.part_code,
      description: current.description,
      quantity: Number(current.quantity ?? 0),
      unitPrice: Number(current.unit_price ?? 0),
      currency: current.currency ?? "MDL",
      expectedDeliveryDate: current.expected_delivery_date,
      notes: current.notes,
    });
    const r = await sendResendEmail({
      to: current.customer_email,
      subject,
      html,
      text,
    });
    if (r.ok) {
      emailSent = true;
      update.confirmation_sent_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("preorders" as never)
    .update(update as never)
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/precomenzi", "page");
  return { ok: true, emailSent };
}

export async function resendPreorderConfirmation(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  const supabase = await createClient();
  const { data: dataRaw } = await supabase
    .from("preorders" as never)
    .select(
      "id, status, customer_name, customer_email, part_code, description, quantity, unit_price, currency, expected_delivery_date, notes",
    )
    .eq("id", id)
    .maybeSingle();
  const data = dataRaw as
    | {
        status: PreorderStatus;
        customer_name: string;
        customer_email: string | null;
        part_code: string | null;
        description: string;
        quantity: number;
        unit_price: number;
        currency: string;
        expected_delivery_date: string | null;
        notes: string | null;
      }
    | null;
  if (!data) return { ok: false, reason: "preorder_not_found" };
  if (data.status === "cancelled") return { ok: false, reason: "cancelled" };
  if (!data.customer_email) return { ok: false, reason: "no_customer_email" };

  const { subject, html, text } = preorderConfirmationEmail({
    customerName: data.customer_name,
    partCode: data.part_code,
    description: data.description,
    quantity: Number(data.quantity ?? 0),
    unitPrice: Number(data.unit_price ?? 0),
    currency: data.currency ?? "MDL",
    expectedDeliveryDate: data.expected_delivery_date,
    notes: data.notes,
  });
  const r = await sendResendEmail({ to: data.customer_email, subject, html, text });
  if (!r.ok) return { ok: false, reason: r.reason };
  await supabase
    .from("preorders" as never)
    .update({ confirmation_sent_at: new Date().toISOString() } as never)
    .eq("id", id);
  revalidatePath("/[locale]/panel/precomenzi", "page");
  return { ok: true };
}

export async function deletePreorderWithPin(
  id: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("preorders" as never)
    .delete()
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/[locale]/panel/precomenzi", "page");
  return { ok: true };
}
