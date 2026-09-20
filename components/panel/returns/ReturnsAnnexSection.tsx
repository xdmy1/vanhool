import { FileText } from "lucide-react";

import { SendToAccountantButton } from "@/components/panel/documents/SendToAccountantButton";
import { Link } from "@/lib/i18n/routing";
import { formatReturnNumber } from "@/lib/panel/returns/format";
import { sendReturnToAccountant } from "@/lib/panel/returns/actions";
import { TIMEZONE } from "@/lib/datetime";

import { DeleteReturnButton } from "./DeleteReturnButton";

import type { DocumentReturn } from "@/lib/panel/returns/actions";

/**
 * Renders the annex block below an invoice / purchase: every return line as a
 * negative row, grouped under its factură de retur, plus the net position
 * (original total − returns). Each return invoice carries its own «Contabilului»
 * button — the parent document has usually been sent long before the goods came
 * back, so the return travels to the bookkeeper on its own. Server component —
 * the interactive bits are the send button and the per-row undo.
 */
export function ReturnsAnnexSection({
  returns,
  originalTotal,
  currency,
  kind,
  locale,
  canSend = true,
}: {
  returns: DocumentReturn[];
  originalTotal: number;
  currency: string;
  kind: "invoice" | "purchase";
  locale: string;
  /** False where the parent itself never goes to the accountant (conta2 purchase). */
  canSend?: boolean;
}) {
  if (!returns.length) return null;
  const returnsTotal = returns.reduce((s, r) => s + Number(r.total ?? 0), 0);
  const net = Number((originalTotal - returnsTotal).toFixed(2));
  const title =
    kind === "invoice" ? "Anexă — retururi client" : "Anexă — retururi furnizor";

  // One group per factură de retur, oldest first. Lines without a number
  // (sql/return-invoices.sql not applied yet) render as one unnumbered group.
  const groups = new Map<number | null, DocumentReturn[]>();
  for (const r of returns) {
    const key = r.return_number != null ? Number(r.return_number) : null;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }

  return (
    <section className="overflow-x-auto rounded-md border border-destructive/30 bg-destructive/5">
      <div className="border-b border-destructive/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-destructive">
        {title} · atașată permanent, merge cu documentul la contabil
      </div>
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-2">Cod</th>
            <th className="px-4 py-2">Denumire</th>
            <th className="px-4 py-2 text-right">Cant.</th>
            <th className="px-4 py-2 text-right">Valoare</th>
            <th className="px-4 py-2">Motiv / Dată</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        {[...groups.entries()].map(([number, lines]) => {
          const sentAt = lines.every((l) => l.accountant_sent_at)
            ? (lines[lines.length - 1].accountant_sent_at ?? null)
            : null;
          const enteredAt = lines.every((l) => l.accountant_entered_at)
            ? (lines[lines.length - 1].accountant_entered_at ?? null)
            : null;
          return (
            <tbody key={number ?? "unnumbered"} className="divide-y divide-border">
              {number != null ? (
                <tr className="bg-destructive/5">
                  <td colSpan={4} className="px-4 py-2">
                    <Link
                      href={`/panel/retururi/${number}` as "/panel"}
                      locale={locale}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
                    >
                      <FileText className="size-3.5" />
                      Factură de retur <span className="font-mono">{formatReturnNumber(number)}</span>
                    </Link>
                    <span className="ml-2 text-[11px] text-muted">
                      {new Date(lines[0].created_at).toLocaleDateString("ro-RO", { timeZone: TIMEZONE })}
                    </span>
                  </td>
                  <td colSpan={2} className="px-4 py-2 text-right">
                    {canSend ? (
                      <SendToAccountantButton
                        invoiceId={String(number)}
                        initialSentAt={sentAt}
                        enteredAt={enteredAt}
                        action={sendReturnToAccountant}
                        localFallback={false}
                        compact
                      />
                    ) : null}
                  </td>
                </tr>
              ) : null}
              {lines.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 font-mono text-xs">{r.part_code ?? "—"}</td>
                  <td className="px-4 py-2">{r.name ?? "—"}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{Number(r.quantity)}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold text-destructive">
                    −{Number(r.total).toFixed(2)} {r.currency ?? currency}
                    {Number(r.vat_amount) > 0 ? (
                      <div className="text-[10px] font-normal text-muted">
                        din care TVA −{Number(r.vat_amount).toFixed(2)}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted">
                    {r.reason ? <div>{r.reason}</div> : null}
                    <div>{new Date(r.created_at).toLocaleDateString("ro-RO", { timeZone: TIMEZONE })}</div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <DeleteReturnButton returnId={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          );
        })}
        <tfoot>
          <tr className="border-t border-destructive/20">
            <td colSpan={3} className="px-4 py-2 text-right text-xs uppercase tracking-wide text-muted">
              Total retururi
            </td>
            <td className="px-4 py-2 text-right tabular-nums font-semibold text-destructive">
              −{returnsTotal.toFixed(2)} {currency}
            </td>
            <td colSpan={2} className="px-4 py-2" />
          </tr>
          <tr className="bg-surface-elevated">
            <td colSpan={3} className="px-4 py-2 text-right text-xs uppercase tracking-wide text-muted">
              Net după retururi
            </td>
            <td className="px-4 py-2 text-right tabular-nums text-base font-bold">
              {net.toFixed(2)} {currency}
            </td>
            <td colSpan={2} className="px-4 py-2" />
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
