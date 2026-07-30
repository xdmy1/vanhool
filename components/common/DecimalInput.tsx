"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

/**
 * Robust numeric input for money & quantities.
 *
 * `<input type="number" value={someNumber}>` re-formats the numeric value on
 * every render, which — while the operator is mid-typing — drops trailing
 * digits/zeros ("78.7" + "9" landing as "8"), fights the cursor, and rounds a
 * cent early. This holds the RAW text the operator types and only turns it into
 * a number for the parent; it never re-formats mid-type. Normalisation (min
 * clamp, integer trunc, trailing-dot cleanup) happens on blur, so nothing ever
 * "forces" a value while you're still typing.
 *
 * - Accepts comma OR dot as decimal separator (Romanian habit).
 * - `integer` forbids decimals (whole-number quantities like "buc").
 * - `allowEmpty` lets the field be blank → emits `null` (e.g. optional
 *   discounted price); otherwise a blank field emits 0.
 */
export function DecimalInput({
  value,
  onChange,
  integer = false,
  min,
  max,
  allowEmpty = false,
  placeholder,
  className,
  disabled,
  title,
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  integer?: boolean;
  min?: number;
  /** Upper bound clamped on BLUR only (e.g. can't sell more than stock). */
  max?: number;
  allowEmpty?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const display = (v: number | null) => (v != null && v !== 0 ? String(v) : "");
  const [text, setText] = useState<string>(display(value));

  // Re-sync ONLY when the external value diverges from what our text represents
  // (e.g. a markup shortcut or +TVA button set the value behind our back). This
  // guard is what keeps typing from being clobbered by the numeric round-trip.
  useEffect(() => {
    const parsed = text.trim() === "" ? null : Number(text.replace(",", "."));
    const asNum = Number.isFinite(parsed as number) ? (parsed as number) : null;
    const norm = asNum === null ? null : asNum;
    if (norm === value) return;
    setText(display(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      // text + inputMode=decimal → numeric keypad on mobile, but no browser
      // re-normalisation of the string on each render.
      type="text"
      inputMode="decimal"
      value={text}
      placeholder={placeholder}
      disabled={disabled}
      title={title}
      className={className}
      onChange={(e) => {
        let raw = e.target.value.replace(",", ".");
        raw = raw.replace(integer ? /[^\d]/g : /[^\d.]/g, "");
        if (!integer) {
          const firstDot = raw.indexOf(".");
          if (firstDot >= 0) {
            raw =
              raw.slice(0, firstDot + 1) +
              raw.slice(firstDot + 1).replace(/\./g, "");
          }
        }
        setText(raw);
        if (raw === "" || raw === ".") {
          onChange(allowEmpty ? null : 0);
          return;
        }
        const n = Number(raw);
        // Emit exactly what's typed — no clamping/rounding mid-type.
        if (Number.isFinite(n)) onChange(n);
      }}
      onBlur={() => {
        let raw = text.replace(",", ".");
        if (raw.endsWith(".")) raw = raw.slice(0, -1);
        if (raw === "") {
          onChange(allowEmpty ? null : 0);
          setText("");
          return;
        }
        let n = Number(raw);
        if (!Number.isFinite(n)) {
          onChange(allowEmpty ? null : 0);
          setText("");
          return;
        }
        if (integer) n = Math.trunc(n);
        if (min != null && n < min) n = min;
        if (max != null && n > max) n = max;
        // Snap off float dust (3 decimals is the app's stock/price precision).
        n = Math.round(n * 1000) / 1000;
        onChange(n);
        setText(display(n));
      }}
    />
  );
}
