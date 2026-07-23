import { DeleteReturnButton } from "./DeleteReturnButton";

import type { DocumentReturn } from "@/lib/panel/returns/actions";

/**
 * Renders the annex block below an invoice / purchase: every return line as a
 * negative row, plus the net position (original total − returns). Server
 * component — the only interactive bit is the per-row undo button.
 */
export function ReturnsAnnexSection({
  returns,
  originalTotal,
  currency,
  kind,
}: {
  returns: DocumentReturn[];
  originalTotal: number;
  currency: string;
  kind: "invoice" | "purchase";
}) {
  if (!returns.length) return null;
  const returnsTotal = returns.reduce((s, r) => s + Number(r.total ?? 0), 0);
  const net = Number((originalTotal - returnsTotal).toFixed(2));
  const title =
    kind === "invoice" ? "Anexă — retururi client" : "Anexă — retururi furnizor";

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
        <tbody className="divide-y divide-border">
          {returns.map((r) => (
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
                <div>{new Date(r.created_at).toLocaleDateString("ro-RO")}</div>
              </td>
              <td className="px-4 py-2 text-right">
                <DeleteReturnButton returnId={r.id} />
              </td>
            </tr>
          ))}
        </tbody>
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
