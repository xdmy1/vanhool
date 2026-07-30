"use client";

import { useEffect, useRef, useState } from "react";
import { Split, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRODUCT_UNITS } from "@/lib/stock";
import { cn } from "@/lib/utils/cn";

/**
 * "Desparte" — split a purchased package into its sellable sub-units.
 *
 * A line bought as a PACKAGE (1 butoi de 200 L, 1 cutie de 12 buc, 3 cutii ×
 * 12) is converted so stock is tracked in the sub-unit and the cost is
 * per-sub-unit, keeping the line total unchanged:
 *
 *   1 butoi @ 30000 lei  →  desparte în 200 litri  →  200 litri @ 150 lei/litru
 *   3 cutii @ 600 lei    →  desparte în 12 buc      →  36 buc  @ 50 lei/buc
 *
 * newQty     = currentQty × perPackage
 * newUnitCost= lineTotal / newQty   (= currentUnitCost / perPackage)
 *
 * Pure UI: it just rewrites quantity / unit_cost / unit on the line, so the
 * existing post/stock/cost math stays correct with no special casing.
 */
export function SplitLineControl({
  quantity,
  unitCost,
  vatRate,
  currentUnit,
  onApply,
}: {
  quantity: number;
  /** NET unit cost (before VAT) — what's stored on the line. */
  unitCost: number;
  /** VAT % on the line (0 or 20) — the split preview divides the GROSS total. */
  vatRate: number;
  currentUnit: string;
  onApply: (next: {
    quantity: number;
    unit_cost: number;
    unit: string;
    pack_note: string;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [per, setPer] = useState("");
  const [unit, setUnit] = useState<string>(
    currentUnit && currentUnit !== "buc" ? currentUnit : "litru",
  );
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const perN = Number(per.replace(",", ".")) || 0;
  const vatFactor = 1 + (Number(vatRate) || 0) / 100;
  // GROSS (with VAT) is what the split divides + shows — the actual cash out.
  const grossTotal = Number((quantity * unitCost * vatFactor).toFixed(2));
  const netTotal = Number((quantity * unitCost).toFixed(2));
  const newQty = perN > 0 ? Number((quantity * perN).toFixed(3)) : 0;
  // Per-sub-unit GROSS (shown) + NET (stored on the line; VAT re-applied later).
  const newGross = newQty > 0 ? Number((grossTotal / newQty).toFixed(2)) : 0;
  const newCost = newQty > 0 ? Number((netTotal / newQty).toFixed(2)) : 0;
  const hasVat = vatFactor > 1;
  const valid = perN > 1 && newQty > 0 && grossTotal > 0;

  function apply() {
    if (!valid) return;
    // Human-readable trace for the bookkeeper: what was bought vs. how it split.
    const pack_note = `${quantity} ${currentUnit} → ${newQty} ${unit}`;
    onApply({ quantity: newQty, unit_cost: newCost, unit, pack_note });
    setOpen(false);
    setPer("");
  }

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Desparte pachetul (butoi/cutie) în sub-unități"
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md border text-muted-strong transition-colors",
          open
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-surface hover:border-primary/40 hover:text-primary",
        )}
      >
        <Split className="size-3.5" />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-1 w-72 rounded-lg border border-border bg-surface-elevated p-3 text-left shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Desparte în sub-unități
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-6 place-items-center rounded text-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <p className="mb-2 text-[11px] leading-snug text-muted">
            Câte sub-unități conține fiecare {quantity === 1 ? "pachet" : "pachet"}?
            (ex: butoi = 200 litri, cutie = 12 buc)
          </p>

          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={2}
              step="any"
              value={per}
              onChange={(e) => setPer(e.target.value)}
              placeholder="ex. 200"
              className="h-9 w-24 text-right"
              autoFocus
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-9 flex-1 rounded-md border border-border bg-surface px-2 text-xs"
            >
              {PRODUCT_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* live preview — divides the GROSS (with-VAT) total */}
          <div className="mt-2 rounded-md border border-border bg-background p-2 text-[11px]">
            {valid ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted">Cantitate</span>
                  <span className="font-semibold tabular-nums">
                    {quantity} × {perN} = {newQty} {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">
                    Cost {hasVat ? "cu TVA" : ""} / {unit}
                  </span>
                  <span className="font-semibold tabular-nums text-primary">
                    {newGross.toFixed(2)} lei
                  </span>
                </div>
                {hasVat ? (
                  <div className="flex justify-between text-muted">
                    <span>din care net / {unit}</span>
                    <span className="tabular-nums">{newCost.toFixed(2)} lei</span>
                  </div>
                ) : null}
                <div className="mt-1 flex justify-between border-t border-border/60 pt-1 text-muted">
                  <span>Total {hasVat ? "cu TVA" : ""} (neschimbat)</span>
                  <span className="tabular-nums font-medium text-foreground">
                    {grossTotal.toFixed(2)} lei
                  </span>
                </div>
                {hasVat ? (
                  <div className="flex justify-between text-muted">
                    <span>Total net</span>
                    <span className="tabular-nums">{netTotal.toFixed(2)} lei</span>
                  </div>
                ) : null}
              </>
            ) : (
              <span className="text-muted">
                Introdu câte sub-unități are pachetul (mai mult de 1).
              </span>
            )}
          </div>

          <Button
            type="button"
            onClick={apply}
            disabled={!valid}
            size="sm"
            className="mt-2 w-full"
          >
            Desparte
          </Button>
        </div>
      ) : null}
    </div>
  );
}
