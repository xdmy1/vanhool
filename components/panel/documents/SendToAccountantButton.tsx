"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { sendInvoiceToAccountant } from "@/lib/panel/invoices/actions";
import { cn } from "@/lib/utils/cn";

const STORAGE_PREFIX = "panel.accountant_sent.";

export function SendToAccountantButton({
  invoiceId,
  initialSentAt,
  compact = false,
}: {
  invoiceId: string;
  initialSentAt: string | null;
  compact?: boolean;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [sentAt, setSentAt] = useState<string | null>(initialSentAt);
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialSentAt) return;
    if (typeof window === "undefined") return;
    const cached = window.localStorage.getItem(STORAGE_PREFIX + invoiceId);
    if (cached) setSentAt(cached);
  }, [initialSentAt, invoiceId]);

  useEffect(() => {
    if (open) {
      setPin("");
      setError(null);
      const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
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

  const wasSent = !!sentAt;

  function submit() {
    if (pin.trim().length === 0) {
      setError(t("pin_delete_required"));
      return;
    }
    startTransition(async () => {
      const res = await sendInvoiceToAccountant(invoiceId, pin.trim());
      if (res.ok) {
        setSentAt(res.sentAt);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_PREFIX + invoiceId, res.sentAt);
        }
        toast.success(t("accountant_send_success"));
        setOpen(false);
        router.refresh();
      } else if (res.reason === "bad_pin") {
        setError(t("pin_delete_bad_pin"));
        setPin("");
        inputRef.current?.focus();
      } else {
        setError(t("accountant_send_error", { reason: res.reason }));
      }
    });
  }

  const label = wasSent
    ? t("accountant_send_resend_label")
    : t("accountant_send_label");
  const tooltip =
    wasSent && sentAt
      ? t("accountant_send_last", {
          when: new Date(sentAt).toLocaleString("ro-RO"),
        })
      : t("accountant_send_label");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors",
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-xs",
          wasSent
            ? "border-warning bg-warning/15 text-warning hover:bg-warning/25"
            : "border-success bg-success/15 text-success hover:bg-success/25",
        )}
        title={tooltip}
      >
        {wasSent ? <Check className="size-3.5" /> : <Mail className="size-3.5" />}
        {compact
          ? wasSent
            ? t("accountant_send_resend_compact")
            : t("accountant_send_compact")
          : label}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {t("accountant_send_label")}
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
            <p className="mb-3 text-xs text-muted-strong">
              {t("pin_delete_subtitle")}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••"
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-center text-lg tracking-[0.4em] focus:border-primary focus:outline-none"
                maxLength={12}
              />
              {error ? (
                <div className="mt-2 text-xs text-destructive">{error}</div>
              ) : null}
              <div className="mt-4 flex items-center justify-end gap-2">
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
                  <Mail className="size-3.5" />
                  {pending ? t("accountant_send_pending") : t("pin_delete_confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
