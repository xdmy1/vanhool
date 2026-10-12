import { getSupabaseAdmin } from "@/lib/supabase/admin";

const r2 = (n: number) => Number(n.toFixed(2));

/**
 * What the customer still owes on one invoice:
 *
 *     total − returned (credit-note annexes) − paid_amount, floored at 0.
 *
 * A return settles part of the receivable exactly like a payment does: an
 * invoice of 3833 with 1880 returned and 2000 paid is fully settled, not
 * "partial, 1833 due". Every place that shows or compares a balance — detail
 * page, list prefill, dashboard, client balance, receivables aging, bank
 * matching, and the paid/partial flip itself — goes through here so they can
 * never disagree.
 */
export function invoiceBalanceDue(
  inv: { total: number | string | null; paid_amount: number | string | null },
  returned: number | null | undefined = 0,
): number {
  return Math.max(
    0,
    r2(Number(inv.total ?? 0) - Number(returned ?? 0) - Number(inv.paid_amount ?? 0)),
  );
}

/**
 * Gross amount returned per invoice (Σ document_returns.total) for the ids
 * given. Best-effort: before sql/document-returns.sql there is no table and
 * nothing is subtracted; ids without returns are simply absent from the map.
 */
export async function returnedTotalsByInvoice(
  ids: string[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return out;
  try {
    const admin = getSupabaseAdmin();
    // Chunked — `.in()` rides the request URL; a thousand uuids would blow it.
    for (let i = 0; i < unique.length; i += 150) {
      const { data, error } = await admin
        .from("document_returns")
        .select("parent_id, total")
        .eq("parent_type", "invoice")
        .in("parent_id", unique.slice(i, i + 150));
      if (error) return out;
      for (const r of (data ?? []) as Array<{
        parent_id: string;
        total: number | string | null;
      }>) {
        out.set(r.parent_id, r2((out.get(r.parent_id) ?? 0) + Number(r.total ?? 0)));
      }
    }
  } catch {
    /* pre-migration → nothing returned */
  }
  return out;
}
