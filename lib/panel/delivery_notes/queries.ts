import { createClient } from "@/lib/supabase/server";
import type { AccountScope } from "@/lib/panel/scope";

export type DeliveryNoteListRow = {
  id: string;
  series: string | null;
  number: string | null;
  issued_at: string;
  customer_name: string;
  delivery_address: string;
  payment_method: string | null;
  status: "draft" | "dispatched" | "delivered" | "returned";
  account_scope: AccountScope;
  printed_at: string | null;
  total: number | null;
  currency: string;
};

export type DeliveryNoteItemSnapshot = {
  productId?: string;
  partCode?: string | null;
  name?: string | null;
  brand?: string | null;
  storage_location?: string | null;
  quantity?: number;
  /** Effective per-unit price (what was actually charged). */
  price?: number;
  /** List per-unit price (pre-discount). Older snapshots may omit it. */
  original_unit_price?: number | null;
  /** Per-unit saving = original_unit_price - price (snapshot-time copy). */
  unit_discount?: number | null;
  total?: number;
};

export type DeliveryNoteDetail = {
  id: string;
  order_id: string | null;
  account_scope: AccountScope;
  series: string | null;
  number: string | null;
  issued_at: string;
  driver_name: string | null;
  vehicle_plate: string | null;
  customer_name: string;
  customer_idno: string | null;
  customer_phone: string | null;
  delivery_address: string;
  payment_method: string | null;
  notes: string | null;
  status: "draft" | "dispatched" | "delivered" | "returned";
  items_snapshot: DeliveryNoteItemSnapshot[];
  printed_at: string | null;
  total: number;
  currency: string;
};

export async function listDeliveryNotes(args: {
  scope: AccountScope;
  q?: string;
}): Promise<DeliveryNoteListRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("delivery_notes")
    // Cast: currency column exists at runtime (sql migration) but generated
    // TS types are stale until they're regenerated.
    .select(
      "id, series, number, issued_at, customer_name, delivery_address, payment_method, status, account_scope, printed_at, items_snapshot, currency" as
        "id, series, number, issued_at, customer_name, delivery_address, payment_method, status, account_scope, printed_at, items_snapshot",
    )
    .eq("account_scope", args.scope)
    .order("issued_at", { ascending: false })
    .limit(150);
  if (args.q) {
    const q = `%${args.q.replace(/[%_]/g, "")}%`;
    query = query.or(`number.ilike.${q},customer_name.ilike.${q}`);
  }
  const { data } = await query;
  return (data ?? []).map((r) => {
    const snapshot = (Array.isArray(r.items_snapshot)
      ? r.items_snapshot
      : []) as DeliveryNoteItemSnapshot[];
    const total = snapshot.reduce((s, it) => s + Number(it.total ?? 0), 0);
    return {
      id: r.id,
      series: r.series,
      number: r.number,
      issued_at: r.issued_at,
      customer_name: r.customer_name,
      delivery_address: r.delivery_address,
      payment_method: r.payment_method,
      status: r.status,
      account_scope: r.account_scope,
      printed_at: r.printed_at,
      total: total > 0 ? total : null,
      currency: (r as { currency?: string }).currency ?? "MDL",
    };
  });
}

export async function getDeliveryNote(id: string): Promise<DeliveryNoteDetail | null> {
  const supabase = await createClient();
  const { data: r } = await supabase
    .from("delivery_notes")
    // Cast: currency column added via migration, generated types stale.
    .select(
      "id, order_id, account_scope, series, number, issued_at, driver_name, vehicle_plate, customer_name, customer_idno, customer_phone, delivery_address, payment_method, notes, status, items_snapshot, printed_at, currency" as
        "id, order_id, account_scope, series, number, issued_at, driver_name, vehicle_plate, customer_name, customer_idno, customer_phone, delivery_address, payment_method, notes, status, items_snapshot, printed_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!r) return null;
  const items = (Array.isArray(r.items_snapshot)
    ? r.items_snapshot
    : []) as DeliveryNoteItemSnapshot[];
  const total = items.reduce((s, it) => s + Number(it.total ?? 0), 0);
  return {
    id: r.id,
    order_id: r.order_id,
    account_scope: r.account_scope,
    series: r.series,
    number: r.number,
    issued_at: r.issued_at,
    driver_name: r.driver_name,
    vehicle_plate: r.vehicle_plate,
    customer_name: r.customer_name,
    customer_idno: r.customer_idno,
    customer_phone: r.customer_phone,
    delivery_address: r.delivery_address,
    payment_method: r.payment_method,
    notes: r.notes,
    status: r.status,
    items_snapshot: items,
    printed_at: r.printed_at,
    total,
    currency: (r as { currency?: string }).currency ?? "MDL",
  };
}
