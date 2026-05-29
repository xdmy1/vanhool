"use client";

import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type VatMode = 0 | 20 | null;

/**
 * Price input that ships with two VAT helper "modes": `TVA 0%` (leave amount
 * untouched) and `+TVA 20%` (multiply current amount by 1.20). The buttons
 * behave like a segmented selector — clicking once applies the math and
 * highlights the chosen mode; clicking the SAME button again is a no-op,
 * clicking the OTHER button reverses the previous transformation and applies
 * the new one. Editing the input clears the selection so further VAT clicks
 * start from the typed value.
 *
 * The blank-out trick on `value === 0` keeps the field empty (showing the
 * placeholder) instead of a stubborn leading `0` while the operator types.
 */
export function PriceWithVatHelper({
  value,
  onChange,
  className,
  inputClassName,
  step = "0.01",
  min = 0,
  placeholder = "0.00",
  disabled,
  size = "md",
  vatRate,
  onVatChange,
}: {
  value: number;
  onChange: (next: number) => void;
  className?: string;
  inputClassName?: string;
  step?: number | string;
  min?: number;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  /** External VAT % — when provided, selected state is driven by it and
   * clicking a button just fires `onVatChange` (no math on `value`). Used by
   * the purchase form where the entered cost is always treated as net and a
   * separate vat_rate column drives the totals math. */
  vatRate?: number | null;
  /** Callback for the externally-controlled VAT selector. */
  onVatChange?: (next: 0 | 20) => void;
}) {
  const external = typeof vatRate === "number" && onVatChange !== undefined;
  const [mode, setMode] = useState<VatMode>(null);
  // Track when an internal click triggered the value change so an external
  // onChange echo doesn't blow away the just-set mode.
  const internalChange = useRef(false);
  useEffect(() => {
    if (external) return;
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }
    setMode(null);
  }, [value, external]);

  const externalMode: VatMode = external
    ? vatRate === 0
      ? 0
      : vatRate === 20
        ? 20
        : null
    : mode;
  const activeMode = external ? externalMode : mode;

  const pickMode = (next: 0 | 20) => {
    if (disabled || value <= 0) return;
    if (external) {
      onVatChange!(next);
      return;
    }
    let nextValue = value;
    if (mode === 20 && next === 0) {
      nextValue = Math.round((value / 1.2) * 100) / 100;
    } else if ((mode === 0 || mode === null) && next === 20) {
      nextValue = Math.round(value * 1.2 * 100) / 100;
    }
    internalChange.current = true;
    setMode(next);
    if (nextValue !== value) onChange(nextValue);
  };

  const btnBase =
    size === "sm" ? "px-1.5 py-1 text-[9px]" : "px-2 py-1 text-[10px]";
  const display = value > 0 ? String(value) : "";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Input
        type="number"
        inputMode="decimal"
        value={display}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") onChange(0);
          else onChange(Math.max(0, Number(v) || 0));
        }}
        step={step}
        min={min}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("min-w-0 flex-1", inputClassName)}
      />
      <div className="flex shrink-0 overflow-hidden rounded-md border border-border">
        <button
          type="button"
          onClick={() => pickMode(0)}
          disabled={disabled || value <= 0}
          aria-pressed={activeMode === 0}
          title="Marchează ca TVA 0%"
          className={cn(
            "font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            btnBase,
            activeMode === 0
              ? "bg-foreground text-background"
              : "bg-surface text-muted-strong hover:bg-surface-elevated",
          )}
        >
          TVA 0%
        </button>
        <button
          type="button"
          onClick={() => pickMode(20)}
          disabled={disabled || value <= 0}
          aria-pressed={activeMode === 20}
          title={external ? "Marchează ca TVA 20%" : "Adaugă 20% TVA (× 1.20)"}
          className={cn(
            "border-l border-border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            btnBase,
            activeMode === 20
              ? "bg-primary text-primary-foreground"
              : "bg-surface text-primary hover:bg-primary/10",
          )}
        >
          {external ? "TVA 20%" : "+TVA 20%"}
        </button>
      </div>
    </div>
  );
}
