"use client";

import { useEffect, useRef, useState } from "react";
import { X, ShieldAlert } from "lucide-react";

/** Shape the server's below-cost guard returns (structurally identical to the
 *  server BelowCostLine — kept here so client code never imports server-only). */
export type BelowCostLine = { label: string; sell: number; cost: number };

/**
 * FORCE-SELL confirmation. Rendered by the parent ONLY when a sale / proforma /
 * invoice has line(s) selling at or below their sinecost (margin ≤ 0) — so each
 * appearance is a fresh mount with an empty PIN. The operator must type the
 * admin PIN (same as destructive deletes) to authorise the loss; the PIN is
 * re-validated server-side, this modal is only UX.
 */
export function ForceSellModal({
  lines,
  pending = false,
  onCancel,
  onConfirm,
}: {
  lines: BelowCostLine[];
  pending?: boolean;
  onCancel: () => void;
  onConfirm: (pin: string) => void;
}) {
  const [pin, setPin] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, []);

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
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <ShieldAlert className="size-4" />
            Vânzare sub cost
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
        <p className="mb-2 text-xs text-muted-strong">
          Aceste linii se vând la sau sub sinecost (marjă ≤ 0). Introdu PIN-ul
          admin ca să forțezi vânzarea:
        </p>
        <ul className="mb-3 space-y-1 rounded-md border border-border bg-background/40 p-2 text-xs">
          {lines.map((l, i) => (
            <li key={i} className="flex items-center justify-between gap-2">
              <span className="line-clamp-1 font-medium">{l.label}</span>
              <span className="shrink-0 tabular-nums text-destructive">
                preț {l.sell} ≤ cost {l.cost}
              </span>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pin.trim()) onConfirm(pin.trim());
          }}
        >
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            className="block w-full rounded-md border border-border bg-background px-3 py-2 text-center text-lg tracking-[0.4em] focus:border-primary focus:outline-none"
            maxLength={12}
          />
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted-strong hover:text-foreground"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={pending || pin.trim().length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-70"
            >
              <ShieldAlert className="size-3.5" />
              {pending ? "Se procesează…" : "FORCE SELL"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
