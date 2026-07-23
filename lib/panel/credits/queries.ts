import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ClientDocument } from "@/lib/panel/clienti/queries";

export type StoreCredit = {
  id: string;
  client_id: string;
  serial: string | null;
  amount: number;
  used_amount: number;
  currency: string;
  reason: string | null;
  order_id: string | null;
  status: "active" | "used" | "void";
  created_at: string;
};

const CREDIT_COLS =
  "id, client_id, serial, amount, used_amount, currency, reason, order_id, status, created_at";

function normalize(rows: unknown[]): StoreCredit[] {
  return (rows as Array<Record<string, unknown>>).map((r) => ({
    id: r.id as string,
    client_id: r.client_id as string,
    serial: (r.serial as string | null) ?? null,
    amount: Number(r.amount ?? 0),
    used_amount: Number(r.used_amount ?? 0),
    currency: (r.currency as string | null) ?? "MDL",
    reason: (r.reason as string | null) ?? null,
    order_id: (r.order_id as string | null) ?? null,
    status: (r.status as StoreCredit["status"]) ?? "active",
    created_at: r.created_at as string,
  }));
}

/** All store credits for one client (newest first). Empty if table missing. */
export async function getClientCredits(clientId: string): Promise<StoreCredit[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("store_credits")
      .select(CREDIT_COLS)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return normalize(data ?? []);
  } catch {
    return [];
  }
}

/** A single credit by id (for the PDF voucher). */
export async function getCreditById(id: string): Promise<StoreCredit | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("store_credits")
      .select(CREDIT_COLS)
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return normalize([data])[0] ?? null;
  } catch {
    return null;
  }
}

/** Credits for the logged-in customer (dashboard + nav). Same as by-client. */
export async function getMyCredits(userId: string): Promise<StoreCredit[]> {
  return getClientCredits(userId);
}

/**
 * Available credit per currency (only 'active' credits, amount − used). Never
 * sums across currencies — returns { MDL: x, EUR: y }.
 */
export function creditBalanceByCurrency(
  credits: StoreCredit[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const c of credits) {
    if (c.status !== "active") continue;
    const avail = Number((c.amount - c.used_amount).toFixed(2));
    if (avail <= 0) continue;
    out[c.currency] = Number(((out[c.currency] ?? 0) + avail).toFixed(2));
  }
  return out;
}

/**
 * What the client still OWES us, per currency: open invoices (issued / sent /
 * partial — not paid / void / converted). Proformas are excluded (not a
 * receivable). Never sums across currencies.
 */
export function owedByCurrency(
  documents: ClientDocument[],
): Record<string, number> {
  const open = new Set(["issued", "sent", "partial"]);
  const out: Record<string, number> = {};
  for (const d of documents) {
    if (d.type !== "invoice") continue;
    if (d.paid_at) continue;
    if (!open.has(d.status)) continue;
    const cur = d.currency || "MDL";
    out[cur] = Number(((out[cur] ?? 0) + Number(d.total ?? 0)).toFixed(2));
  }
  return out;
}
