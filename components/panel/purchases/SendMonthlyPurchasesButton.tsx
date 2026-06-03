"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Calendar, Send, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { sendConta1PurchasesMonthly } from "@/lib/panel/purchases/actions";
import { cn } from "@/lib/utils/cn";

/**
 * "Trimite contabilului luna" — fires off every conta1 purchase in
 * the chosen month to the bookkeeper. Default month = current. PIN
 * confirmation is required (same `2549` as everywhere else).
 */
export function SendMonthlyPurchasesButton() {
  const t = useTranslations("panel");
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const pinRef = useRef<HTMLInputElement | null>(null);

  // Default to current month — YYYY-MM in Europe/Chisinau, matching the
  // facturi date filter's day boundary convention.
  const defaultMonth = (() => {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Chisinau",
      year: "numeric",
      month: "2-digit",
    }).format(now);
    return fmt.replace("-", "-").slice(0, 7);
  })();
  const [month, setMonth] = useState<string>(defaultMonth);

  useEffect(() => {
    if (open) {
      setError(null);
      setPin("");
      const id = window.setTimeout(() => pinRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function rangeForMonth(m: string): { from: string; to: string } | null {
    if (!/^\d{4}-\d{2}$/.test(m)) return null;
    const [y, mm] = m.split("-").map(Number);
    const first = new Date(Date.UTC(y, mm - 1, 1));
    const last = new Date(Date.UTC(y, mm, 0));
    return {
      from: first.toISOString().slice(0, 10),
      to: last.toISOString().slice(0, 10),
    };
  }

  function submit() {
    const range = rangeForMonth(month);
    if (!range) {
      setError(t("monthly_send_bad_month"));
      return;
    }
    if (pin.trim().length === 0) {
      setError(t("pin_delete_required"));
      return;
    }
    startTransition(async () => {
      const res = await sendConta1PurchasesMonthly(range.from, range.to, pin.trim());
      if (res.ok) {
        toast.success(t("monthly_send_success", { count: res.count }));
        setOpen(false);
      } else if (res.reason === "bad_pin") {
        setError(t("pin_delete_bad_pin"));
        setPin("");
        pinRef.current?.focus();
      } else if (res.reason === "empty_range") {
        setError(t("monthly_send_empty"));
      } else {
        setError(t("accountant_send_error", { reason: res.reason }));
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-success bg-success/15 px-3 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/25"
        title={t("monthly_send_title")}
      >
        <Send className="size-3.5" />
        {t("monthly_send_label")}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {t("monthly_send_title")}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground"
                aria-label={t("action_close")}
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mb-4 text-xs text-muted-strong">
              {t("monthly_send_subtitle")}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="space-y-3"
            >
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
                  {t("monthly_send_month_label")}
                </span>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="block w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
                  {t("pin_delete_subtitle")}
                </span>
                <input
                  ref={pinRef}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••"
                  className={cn(
                    "block w-full rounded-md border border-border bg-background px-3 py-2 text-center text-lg tracking-[0.4em] focus:border-primary focus:outline-none",
                  )}
                  maxLength={12}
                />
              </label>

              {error ? (
                <div className="text-xs text-destructive">{error}</div>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted-strong hover:text-foreground"
                  disabled={pending}
                >
                  {t("action_cancel")}
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-md border border-success bg-success px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-success/90 disabled:opacity-70"
                >
                  <Send className="size-3.5" />
                  {pending ? t("monthly_send_pending") : t("monthly_send_confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
