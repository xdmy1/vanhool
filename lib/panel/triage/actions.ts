"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";
import { verifyAdminPin } from "@/lib/panel/admin-pin";
import type { Json } from "@/lib/supabase/database.types";

const triageSchema = z.object({
  orderId: z.string().uuid(),
  scope: z.enum(["conta1", "conta2"]),
});

/**
 * Move a storefront order into conta1 or conta2.
 *
 * - conta1: marks triaged, sets account_scope=conta1, and (if not already
 *   mirrored) inserts an `invoices` row from existing order data so the
 *   document shows up in /panel/facturi.
 * - conta2: marks triaged, sets account_scope=conta2. If the payment method
 *   is cash, records a cash_register_movement (in) for the order total.
 *
 * Idempotent: if already triaged, just updates the scope (and re-records the
 * derived rows only if missing).
 */
export async function triageOrder(
  raw: unknown,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = triageSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const { orderId, scope } = parsed.data;

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_email, customer_phone, customer_address, total, subtotal, payment_method, account_scope, triaged_at, invoice_id, invoice_url, items",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return { ok: false, reason: "order_not_found" };

  // 1) Mark triaged + set scope
  const { error: updErr } = await supabase
    .from("orders")
    .update({
      account_scope: scope,
      triaged_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (updErr) return { ok: false, reason: updErr.message };

  // 2) conta1: mirror Refrens metadata into invoices table (if not already)
  if (scope === "conta1") {
    const { data: existing } = await supabase
      .from("invoices")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();
    if (!existing) {
      // Pull next invoice number from panel_settings (best-effort).
      const { data: settingsRows } = await supabase
        .from("panel_settings")
        .select("key, value")
        .in("key", ["invoice.series", "invoice.next_number"]);
      let series = "IB";
      let nextNumber = 1;
      for (const r of settingsRows ?? []) {
        if (r.key === "invoice.series") series = String(r.value ?? "IB").replace(/"/g, "");
        if (r.key === "invoice.next_number") nextNumber = Number(r.value ?? 1);
      }
      const numberStr = String(nextNumber).padStart(5, "0");

      // conta1 = fiscal book → the factura MUST carry 20% TVA extracted from
      // the order's GROSS total (storefront prices are VAT-inclusive). net +
      // TVA = gross, using residual rounding like createManualSale so the
      // printed document reconciles.
      const gross = Number(order.total ?? 0);
      const net = Number((gross / 1.2).toFixed(2));
      const vat = Number((gross - net).toFixed(2));
      // Per-line snapshot so the factura table + e-Factura export show 20% TVA
      // per line (was previously null → empty printed table). Storefront order
      // items carry a GROSS unit price in `price`.
      const orderItems = Array.isArray(order.items)
        ? (order.items as Array<Record<string, unknown>>)
        : [];
      const invoiceItemsSnapshot = orderItems.map((it) => {
        const qty = Number((it as { quantity?: number }).quantity ?? 0);
        const unitPrice = Number((it as { price?: number }).price ?? 0);
        return {
          productId: (it as { productId?: string | null }).productId ?? null,
          partCode: (it as { partCode?: string | null }).partCode ?? null,
          name: (it as { name?: string }).name ?? "",
          description: null,
          quantity: qty,
          unit_price: unitPrice,
          discounted_unit_price: null,
          vat_rate: 20,
          total: Number((it as { total?: number }).total ?? qty * unitPrice),
          cost_price: Number((it as { cost_price?: number }).cost_price ?? 0),
        };
      });

      const { error: invErr } = await supabase.from("invoices").insert({
        order_id: orderId,
        account_scope: "conta1",
        series,
        number: numberStr,
        issued_date: new Date().toISOString().slice(0, 10),
        customer_snapshot: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone,
          address: order.customer_address,
        } as unknown as Json,
        items_snapshot: invoiceItemsSnapshot as unknown as Json,
        subtotal: net,
        vat_amount: vat,
        total: gross,
        refrens_invoice_id: order.invoice_id,
        refrens_url: order.invoice_url,
        status: "issued",
      });
      if (!invErr) {
        await supabase
          .from("panel_settings")
          .upsert(
            [
              {
                key: "invoice.next_number",
                value: (nextNumber + 1) as unknown as Json,
                updated_at: new Date().toISOString(),
              },
            ],
            { onConflict: "key" },
          );
      }
    }
  }

  // 3) conta2 + cash: ensure a cash register movement exists for the order
  if (scope === "conta2" && order.payment_method === "cash") {
    const { data: existingMv } = await supabase
      .from("cash_register_movements")
      .select("id")
      .eq("order_id", orderId)
      .eq("reason", "sale")
      .maybeSingle();
    if (!existingMv) {
      await supabase.from("cash_register_movements").insert({
        direction: "in",
        amount: Number(order.total ?? 0),
        reason: "sale",
        order_id: orderId,
        created_by: user.id,
        notes: `Comandă site #${orderId.slice(0, 8)} triată în conta2`,
      });
    }
  }

  revalidatePath("/[locale]/panel/comenzi-site", "page");
  revalidatePath("/[locale]/panel/facturi", "page");
  revalidatePath("/[locale]/panel/cheltuieli-cash", "page");
  return { ok: true };
}

/**
 * Cancel a storefront order straight from the triage tray. Doesn't touch
 * stock, invoices, or delivery notes — cancellation here means "we never
 * fulfilled this, mark it dead and stop showing it as a pending decision."
 * PIN-gated like every other destructive admin action.
 */
export async function cancelStorefrontOrder(
  orderId: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      triaged_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/comenzi-site", "page");
  revalidatePath("/[locale]/admin/orders", "page");
  return { ok: true };
}
