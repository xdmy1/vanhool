"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

/**
 * Price input that ships with two one-click VAT helpers: "+TVA 0%" leaves the
 * entered amount untouched and "+TVA 20%" multiplies it by 1.20. Lets the
 * operator type a NET amount and convert it to a GROSS amount inline — the
 * stored value is always the result.
 *
 * The component is currency-agnostic: storage and rendering of the currency
 * symbol is the caller's job. `step`/`min`/`disabled` pass through to the
 * underlying number input.
 */
export function PriceWithVatHelper({
  value,
  onChange,
  className,
  inputClassName,
  step = "0.01",
  min = 0,
  placeholder,
  disabled,
  size = "md",
}: {
  value: number | "";
  onChange: (next: number) => void;
  className?: string;
  inputClassName?: string;
  step?: number | string;
  min?: number;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const numericValue = typeof value === "number" ? value : Number(value) || 0;

  const apply = (vatPct: 0 | 20) => {
    if (disabled || numericValue <= 0) return;
    const next =
      vatPct === 0
        ? numericValue
        : Math.round(numericValue * 1.2 * 100) / 100;
    onChange(next);
  };

  const btnBase =
    size === "sm"
      ? "px-1.5 py-1 text-[9px]"
      : "px-2 py-1 text-[10px]";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
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
          onClick={() => apply(0)}
          disabled={disabled || numericValue <= 0}
          title="Lasă suma fără TVA (TVA 0%)"
          className={cn(
            "bg-surface font-semibold text-muted-strong transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50",
            btnBase,
          )}
        >
          TVA 0%
        </button>
        <button
          type="button"
          onClick={() => apply(20)}
          disabled={disabled || numericValue <= 0}
          title="Adaugă 20% TVA (multiplică × 1.20)"
          className={cn(
            "border-l border-border bg-surface font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
            btnBase,
          )}
        >
          +TVA 20%
        </button>
      </div>
    </div>
  );
}
