"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useTranslations } from "next-intl";

import type { CostMismatch } from "@/lib/panel/purchases/actions";

const fmt = (n: number) =>
  new Intl.NumberFormat("ro-MD", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

/**
 * Shown when the server refused a purchase save with reason "cost_mismatch":
 * at least one line's cost is ≥4× off what the catalog knows for that part —
 * almost always a EUR invoice typed on an MDL document (or the reverse). The
 * operator either goes back to fix the currency, or confirms and the form
 * re-submits with confirm_cost_mismatch = true.
 */
export function CostMismatchModal({
  mismatches,
  currency,
  pending = false,
  onCancel,
  onConfirm,
}: {
  mismatches: CostMismatch[];
  currency: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("panel");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-2xl rounded-lg border border-destructive/40 bg-surface p-5 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <AlertTriangle className="size-4" />
            {t("achizitii_cost_modal_title")}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-muted hover:text-foreground"
            aria-label="Închide"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mb-3 text-xs text-muted-strong">
          {t("achizitii_cost_modal_body", { currency })}
        </p>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="min-w-full text-xs">
            <thead className="bg-surface-elevated text-left text-[10px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2">{t("achizitii_line_description")}</th>
                <th className="px-3 py-2 text-right">{t("achizitii_cost_modal_known")}</th>
                <th className="px-3 py-2 text-right">{t("achizitii_cost_modal_entered")}</th>
                <th className="px-3 py-2 text-right">×</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mismatches.map((m) => (
                <tr key={m.line}>
                  <td className="px-3 py-2">
                    <div className="font-mono font-semibold">{m.code}</div>
                    <div className="truncate text-muted-strong">{m.description}</div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    <div className="font-semibold">{fmt(m.knownCostMdl)} MDL</div>
                    {currency !== "MDL" ? (
                      <div className="text-[10px] text-muted">≈ {fmt(m.knownCostDoc)} {currency}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-destructive">
                    <div className="font-semibold">{fmt(m.enteredCostDoc)} {currency}</div>
                    {currency !== "MDL" ? (
                      <div className="text-[10px]">≈ {fmt(m.enteredCostMdl)} MDL</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-bold text-destructive">
                    {m.factor}×
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
          >
            {t("achizitii_cost_modal_fix")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted-strong hover:text-foreground disabled:opacity-70"
          >
            {pending ? t("action_saving") : t("achizitii_cost_modal_force")}
          </button>
        </div>
      </div>
    </div>
  );
}
