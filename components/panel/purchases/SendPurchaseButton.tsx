"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { sendPurchaseToAccountant } from "@/lib/panel/purchases/actions";
import { cn } from "@/lib/utils/cn";

const STORAGE_PREFIX = "panel.purchase_accountant_sent.";

/**
 * "Trimite contabilului" button for a single purchase. Tracks sent
 * state so it flips from green ("Contabilului") to yellow ("Trimis ·
 * re-trimite") after a successful send. Persistence falls back to
 * localStorage when the `accountant_sent_at` column hasn't been
 * migrated yet — the DB timestamp wins once it exists.
 *
 * Sized via `size`: `compact` for inline use in table rows, `default`
 * for the wider button on the detail page header.
 */
export function SendPurchaseButton({
  purchaseId,
  initialSentAt = null,
  size = "compact",
}: {
  purchaseId: string;
  initialSentAt?: string | null;
  size?: "compact" | "default";
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [sentAt, setSentAt] = useState<string | null>(initialSentAt);
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const pinRef = useRef<HTMLInputElement | null>(null);

  // Hydrate from localStorage when the DB hasn't given us a timestamp —
  // happens before the migration is applied, OR when the column write
  // failed but the email already went out.
  useEffect(() => {
    if (initialSentAt) return;
    if (typeof window === "undefined") return;
    const cached = window.localStorage.getItem(STORAGE_PREFIX + purchaseId);
    if (cached) setSentAt(cached);
  }, [initialSentAt, purchaseId]);

  useEffect(() => {
    if (open) {
      setPin("");
      setError(null);
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

  const wasSent = !!sentAt;

  function submit() {
    if (pin.trim().length === 0) {
      setError(t("pin_delete_required"));
      return;
    }
    startTransition(async () => {
      const res = await sendPurchaseToAccountant(purchaseId, pin.trim());
      if (res.ok) {
        setSentAt(res.sentAt);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_PREFIX + purchaseId, res.sentAt);
        }
        toast.success(t("accountant_send_success"));
        setOpen(false);
        router.refresh();
      } else if (res.reason === "bad_pin") {
        setError(t("pin_delete_bad_pin"));
        setPin("");
        pinRef.current?.focus();
      } else {
        setError(t("accountant_send_error", { reason: res.reason }));
      }
    });
  }

  const sizeClasses =
    size === "compact" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-xs";
  const label = wasSent
    ? size === "compact"
      ? t("accountant_send_resend_compact")
      : t("accountant_send_resend_label")
    : size === "compact"
      ? t("accountant_send_compact")
      : t("achizitii_row_send_accountant");
  const tooltip =
    wasSent && sentAt
      ? t("accountant_send_last", {
          when: new Date(sentAt).toLocaleString("ro-RO"),
        })
      : t("achizitii_row_send_accountant");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={tooltip}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors",
          sizeClasses,
          wasSent
            ? "border-warning bg-warning/15 text-warning hover:bg-warning/25"
            : "border-success bg-success/15 text-success hover:bg-success/25",
        )}
      >
        {wasSent ? <Check className="size-3.5" /> : <Mail className="size-3.5" />}
        {label}
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
                {t("achizitii_row_send_accountant")}
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
              {t("pin_confirm_subtitle")}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
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
                  {pending ? t("accountant_send_pending") : t("accountant_send_confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
