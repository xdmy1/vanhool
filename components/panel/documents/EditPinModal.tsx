"use client";

import { useEffect, useRef, useState } from "react";
import { KeyRound, X } from "lucide-react";

/**
 * PIN prompt for editing a proforma that is ALREADY converted into a fiscal
 * invoice. Rewriting it rewrites the invoice too — stock, totals and the cash
 * drawer move with it — so the operator has to type the admin PIN first. The
 * PIN is re-validated server-side; this modal is only UX.
 */
export function EditPinModal({
  invoiceLabel,
  pending = false,
  onCancel,
  onConfirm,
}: {
  /** Series+number of the linked invoice, e.g. "M123". */
  invoiceLabel: string;
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
          <h3 className="flex items-center gap-2 text-sm font-semibold text-warning">
            <KeyRound className="size-4" />
            Proformă convertită
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
          Această proformă e deja convertită în factura{" "}
          <strong className="font-semibold text-foreground">
            {invoiceLabel || "—"}
          </strong>
          . Modificarea se aplică <strong>automat și pe factură</strong> —
          liniile, totalul, stocul și casa. Introdu PIN-ul admin ca să confirmi:
        </p>
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
              className="inline-flex items-center gap-1.5 rounded-md border border-warning bg-warning px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-warning/90 disabled:opacity-70"
            >
              <KeyRound className="size-3.5" />
              {pending ? "Se salvează…" : "Editează ambele"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
