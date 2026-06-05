"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { Calendar } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

/**
 * Text-based date input that ALWAYS displays in DD/MM/YYYY regardless of
 * the OS/browser locale (native `<input type="date">` falls back to MM/DD/YYYY
 * on US-locale machines).
 *
 * Internally stores ISO `YYYY-MM-DD` — matches what the server expects and
 * what PostgREST returns on date columns. The visible value is a text
 * field with auto-`/`-insertion as the operator types digits; on blur or
 * once the field reaches 8 digits we parse + emit the ISO value.
 *
 * A tiny calendar icon on the right toggles a hidden native `<input
 * type="date">` so power users still have a picker — its value flips back
 * through us on change so the visible text stays DD/MM/YYYY.
 */
export type DateInputEUProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "defaultValue"
> & {
  /** ISO YYYY-MM-DD or empty. */
  value?: string | null;
  /** Emits ISO YYYY-MM-DD (or empty string when cleared). */
  onChange?: (iso: string) => void;
  name?: string;
};

function isoToDmy(iso: string | null | undefined): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function dmyToIso(dmy: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dmy);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (
    !Number.isFinite(day) ||
    !Number.isFinite(month) ||
    !Number.isFinite(year)
  ) {
    return null;
  }
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2999) return null;
  // Construct via UTC to dodge DST surprises; just want the date parts back.
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** Auto-insert `/` after positions 2 and 5 as the user types digits. */
function formatTyping(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let out = digits;
  if (digits.length > 4) out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  else if (digits.length > 2) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return out;
}

export const DateInputEU = forwardRef<HTMLInputElement, DateInputEUProps>(
  function DateInputEU({ value, onChange, name, className, ...rest }, ref) {
    const [text, setText] = useState(() => isoToDmy(value ?? ""));
    const textInputRef = useRef<HTMLInputElement | null>(null);
    const pickerRef = useRef<HTMLInputElement | null>(null);

    // Expose the text input through the forwarded ref so external focus()
    // / form-association calls work as expected.
    useImperativeHandle(ref, () => textInputRef.current as HTMLInputElement, []);

    // Reflect outside-driven changes to `value`.
    useEffect(() => {
      const next = isoToDmy(value ?? "");
      setText((prev) => (prev === next ? prev : next));
    }, [value]);

    function emitIso(maybeDmy: string) {
      if (maybeDmy === "") {
        onChange?.("");
        return;
      }
      const iso = dmyToIso(maybeDmy);
      if (iso) onChange?.(iso);
    }

    function onTextChange(e: React.ChangeEvent<HTMLInputElement>) {
      const next = formatTyping(e.target.value);
      setText(next);
      // Emit only when the field is fully populated or cleared. Partial input
      // stays internal so we don't spam the parent with invalid values.
      if (next === "" || next.length === 10) emitIso(next);
    }

    function onPickerChange(e: React.ChangeEvent<HTMLInputElement>) {
      const iso = e.target.value;
      setText(isoToDmy(iso));
      onChange?.(iso);
    }

    return (
      <div className={cn("relative flex items-center", className)}>
        <Input
          ref={textInputRef}
          {...rest}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="DD/MM/YYYY"
          value={text}
          onChange={onTextChange}
          onBlur={() => emitIso(text)}
          className="pr-9"
        />
        {/* Hidden native picker — clicking the calendar icon below opens it. */}
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          aria-hidden
          value={value ?? ""}
          onChange={onPickerChange}
          className="pointer-events-none absolute right-0 top-0 size-px opacity-0"
        />
        <button
          type="button"
          onClick={() => {
            const el = pickerRef.current as
              | (HTMLInputElement & { showPicker?: () => void })
              | null;
            if (!el) return;
            if (typeof el.showPicker === "function") el.showPicker();
            else el.focus();
          }}
          className="absolute right-2 grid size-6 place-items-center text-muted transition-colors hover:text-foreground"
          aria-label="Open calendar"
          tabIndex={-1}
        >
          <Calendar className="size-4" />
        </button>
        {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      </div>
    );
  },
);
