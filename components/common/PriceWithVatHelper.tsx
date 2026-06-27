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

  // Keep the displayed text decoupled from the numeric `value` while the
  // operator is mid-typing — otherwise `String(10) === "10"` would clobber
  // a transient "10.0" before they got to "10.02", and the trailing 0 on
  // any "0.0…" → "0.05" sequence would disappear too. We only re-sync from
  // `value` when an EXTERNAL change drifts away from what the text would
  // emit (e.g. the +TVA 20% button multiplied the value behind our back).
  const [text, setText] = useState<string>(value > 0 ? String(value) : "");
  useEffect(() => {
    const fromText = text === "" ? 0 : Number(text);
    if (Number.isFinite(fromText) && fromText === value) return;
    setText(value > 0 ? String(value) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // TVA toggle buttons removed per operator request — they confused
  // everyone and double-counted VAT downstream. unit_price is now the
  // GROSS amount (what the customer pays), and the document's
  // account_scope sets the implicit VAT rate (conta1 = 20%, conta2 =
  // 0%). pickMode + activeMode references stay so external callers
  // that still pass `vatRate` / `onVatChange` don't break, but the
  // UI never surfaces them.
  void pickMode;
  void activeMode;
  void btnBase;
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Input
        // type=text + inputMode=decimal: gives the mobile numeric keypad
        // AND keeps trailing zeros / partial values like "10." intact,
        // unlike type=number which some browsers normalise on each render.
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          // Accept commas as decimal separator (common Romanian habit) and
          // strip everything that isn't a digit or dot.
          let raw = e.target.value.replace(",", ".");
          raw = raw.replace(/[^\d.]/g, "");
          // Allow at most one dot.
          const firstDot = raw.indexOf(".");
          if (firstDot >= 0) {
            raw = raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, "");
          }
          setText(raw);
          if (raw === "" || raw === ".") {
            onChange(0);
            return;
          }
          const n = Number(raw);
          if (Number.isFinite(n) && n >= 0) onChange(n);
        }}
        onBlur={() => {
          // Normalise on blur so a stray trailing dot ("10.") becomes "10".
          if (text.endsWith(".")) setText(text.slice(0, -1));
        }}
        step={step}
        min={min}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("min-w-0 flex-1", inputClassName)}
      />
    </div>
  );
}
