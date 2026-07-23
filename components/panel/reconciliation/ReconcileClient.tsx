"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Upload, Banknote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import {
  previewBankStatement,
  applyBankReconciliation,
  type ReconcileTxn,
} from "@/lib/panel/reconciliation/actions";

type Edit = { checked: boolean; amount: string };

const money = (n: number) =>
  n.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const key = (ref: string, invId: string) => `${ref}::${invId}`;

export function ReconcileClient() {
  const router = useRouter();
  const [xml, setXml] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    account: string;
    currency: string;
    incoming: ReconcileTxn[];
    skippedOutgoing: number;
  } | null>(null);
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [analyzing, startAnalyze] = useTransition();
  const [applying, startApply] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => setXml(String(reader.result ?? ""));
    reader.readAsText(f);
  }

  function analyze() {
    if (!xml.trim()) {
      toast.error("Încarcă sau lipește extrasul bancar (XML).");
      return;
    }
    startAnalyze(async () => {
      const res = await previewBankStatement(xml);
      if (!res.ok) {
        toast.error(
          res.reason === "invalid_xml"
            ? "Fișierul nu pare a fi un extras XML valid."
            : "Nu am putut analiza extrasul.",
        );
        return;
      }
      // Seed edits from the FIFO suggestion.
      const seeded: Record<string, Edit> = {};
      for (const t of res.incoming) {
        if (t.alreadyApplied) continue;
        for (const c of t.candidates) {
          seeded[key(t.reference, c.invoiceId)] = {
            checked: c.suggested > 0,
            amount: c.suggested > 0 ? c.suggested.toFixed(2) : c.outstanding.toFixed(2),
          };
        }
      }
      setEdits(seeded);
      setPreview({
        account: res.account,
        currency: res.currency,
        incoming: res.incoming,
        skippedOutgoing: res.skippedOutgoing,
      });
      if (res.incoming.length === 0) {
        toast.message("Extras analizat — nicio încasare de la clienți în el.");
      }
    });
  }

  const totals = useMemo(() => {
    if (!preview) return { txns: 0, invoices: 0, sum: 0 };
    let txns = 0;
    let invoices = 0;
    let sum = 0;
    for (const t of preview.incoming) {
      if (t.alreadyApplied) continue;
      let any = false;
      for (const c of t.candidates) {
        const e = edits[key(t.reference, c.invoiceId)];
        if (e?.checked && Number(e.amount) > 0) {
          any = true;
          invoices += 1;
          sum += Number(e.amount) || 0;
        }
      }
      if (any) txns += 1;
    }
    return { txns, invoices, sum };
  }, [preview, edits]);

  function apply() {
    if (!preview) return;
    const transactions = preview.incoming
      .filter((t) => !t.alreadyApplied)
      .map((t) => ({
        reference: t.reference,
        date: t.date,
        amount: t.amount,
        currency: t.currency,
        counterpartyName: t.counterpartyName,
        counterpartyFiscal: t.counterpartyFiscal,
        account: preview.account,
        allocations: t.candidates
          .map((c) => {
            const e = edits[key(t.reference, c.invoiceId)];
            const amt = e?.checked ? Number(e.amount) || 0 : 0;
            return {
              invoiceId: c.invoiceId,
              series: c.series,
              number: c.number,
              amount: Number(amt.toFixed(2)),
            };
          })
          .filter((a) => a.amount > 0),
      }))
      .filter((t) => t.allocations.length > 0);

    if (transactions.length === 0) {
      toast.error("Nimic bifat de marcat.");
      return;
    }
    startApply(async () => {
      const res = await applyBankReconciliation({ transactions });
      if (!res.ok) {
        toast.error("Nu am putut aplica reconcilierea.");
        return;
      }
      toast.success(
        `Marcate ${res.appliedInvoices} facturi din ${res.appliedTxns} încasări.` +
          (res.skipped.length ? ` ${res.skipped.length} deja procesate.` : ""),
      );
      setPreview(null);
      setEdits({});
      setXml("");
      setFileName(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Import */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-elevated px-3 text-sm transition-colors hover:border-primary/40 hover:text-primary">
            <Upload className="size-4" />
            {fileName ?? "Alege fișier .xml"}
            <input type="file" accept=".xml,text/xml,application/xml" className="hidden" onChange={onFile} />
          </label>
          <span className="text-xs text-muted">sau lipește XML-ul mai jos</span>
          <div className="ml-auto">
            <Button onClick={analyze} disabled={analyzing}>
              {analyzing ? "Se analizează…" : "Analizează extrasul"}
            </Button>
          </div>
        </div>
        <textarea
          value={xml}
          onChange={(e) => setXml(e.target.value)}
          placeholder="<Extras> … </Extras>"
          className="mt-3 h-24 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 font-mono text-xs text-muted-strong outline-none focus:border-primary/40"
        />
      </div>

      {/* Results */}
      {preview ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>Cont: <span className="font-mono text-muted-strong">{preview.account}</span></span>
            <span>Valută: <span className="text-muted-strong">{preview.currency}</span></span>
            {preview.skippedOutgoing > 0 ? (
              <span>{preview.skippedOutgoing} plăți ieșite ignorate (nu ating facturile)</span>
            ) : null}
          </div>

          {preview.incoming.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
              Nicio încasare de la clienți în acest extras.
            </div>
          ) : (
            preview.incoming.map((t) => {
              const allocated = t.candidates.reduce((s, c) => {
                const e = edits[key(t.reference, c.invoiceId)];
                return s + (e?.checked ? Number(e.amount) || 0 : 0);
              }, 0);
              const leftover = Number((t.amount - allocated).toFixed(2));
              return (
                <div key={t.reference} className="rounded-lg border border-border bg-surface">
                  <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                    <Banknote className="size-4 text-success" />
                    <div className="font-medium">{t.counterpartyName || "—"}</div>
                    <div className="text-xs text-muted">
                      cod fiscal {t.counterpartyFiscal || "—"} · {t.date}
                    </div>
                    <div className="ml-auto text-right">
                      <div className="tabular-nums font-semibold text-success">
                        +{money(t.amount)} {t.currency}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    {t.alreadyApplied ? (
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <CheckCircle2 className="size-4 text-success" />
                        Deja reconciliat într-un import anterior — sărit.
                      </div>
                    ) : !t.clientMatched ? (
                      <div className="flex items-center gap-2 text-sm text-warning">
                        <AlertTriangle className="size-4" />
                        Niciun client cu factură deschisă pentru codul fiscal {t.counterpartyFiscal || "necunoscut"}.
                      </div>
                    ) : (
                      <>
                        <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">
                          Facturi deschise ale clientului (cele mai vechi primele)
                        </div>
                        <div className="space-y-1.5">
                          {t.candidates.map((c) => {
                            const k = key(t.reference, c.invoiceId);
                            const e = edits[k] ?? { checked: false, amount: c.outstanding.toFixed(2) };
                            return (
                              <div
                                key={c.invoiceId}
                                className={cn(
                                  "flex flex-wrap items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                                  e.checked ? "border-primary/40 bg-primary/5" : "border-border",
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={e.checked}
                                  onChange={(ev) =>
                                    setEdits((prev) => ({
                                      ...prev,
                                      [k]: { ...e, checked: ev.target.checked },
                                    }))
                                  }
                                  className="size-4"
                                />
                                <span className="font-mono text-xs">
                                  {c.series}-{c.number}
                                </span>
                                <span className="text-xs text-muted">{c.issuedDate}</span>
                                <span className="text-xs text-muted">
                                  rest {money(c.outstanding)} din {money(c.total)}
                                </span>
                                <span
                                  className={cn(
                                    "rounded px-1.5 py-0.5 text-[10px] uppercase",
                                    c.scope === "conta1"
                                      ? "bg-primary/10 text-primary"
                                      : "bg-warning/10 text-warning",
                                  )}
                                >
                                  {c.scope}
                                </span>
                                <div className="ml-auto flex items-center gap-1">
                                  <Input
                                    value={e.amount}
                                    onChange={(ev) =>
                                      setEdits((prev) => ({
                                        ...prev,
                                        [k]: { ...e, amount: ev.target.value, checked: true },
                                      }))
                                    }
                                    inputMode="decimal"
                                    className="h-8 w-28 text-right tabular-nums"
                                  />
                                  <span className="text-xs text-muted">{t.currency}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-4 text-xs">
                          <span className="text-muted">
                            Alocat: <span className="tabular-nums text-muted-strong">{money(allocated)}</span>
                          </span>
                          <span className={cn(leftover > 0.01 ? "text-warning" : "text-muted")}>
                            Neasignat: <span className="tabular-nums">{money(leftover)}</span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Apply bar */}
          {preview.incoming.some((t) => !t.alreadyApplied && t.clientMatched) ? (
            <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-elevated px-4 py-3">
              <div className="text-sm text-muted-strong">
                Vei marca <span className="font-semibold">{totals.invoices}</span> facturi
                din <span className="font-semibold">{totals.txns}</span> încasări ·
                total <span className="tabular-nums font-semibold">{money(totals.sum)} {preview.currency}</span>
              </div>
              <div className="ml-auto">
                <Button onClick={apply} disabled={applying || totals.invoices === 0}>
                  {applying ? "Se marchează…" : "Confirmă și marchează achitat"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
