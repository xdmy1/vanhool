"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { convertProformaToInvoice, voidInvoice } from "@/lib/panel/invoices/actions";
import { cn } from "@/lib/utils/cn";

type PaymentMethod = "cash" | "card" | "transfer";
type PaymentStatus = "paid" | "deferred";
type Scope = "conta1" | "conta2";

/**
 * Opens a small inline confirmation panel before converting the proforma —
 * asks the admin to confirm the payment was received, which method was used,
 * and which set of books the resulting invoice should land in. Also supports
 * `deferred` payments (issue the invoice now, client pays within X days).
 */
export function ConvertProformaButton({
  proformaId,
  locale,
  alreadyConverted,
  variant = "full",
}: {
  proformaId: string;
  locale: string;
  alreadyConverted: boolean;
  /** "full" — both Convert + Void buttons. "compact" — just the Convert trigger (for the list). */
  variant?: "full" | "compact";
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [dueDays, setDueDays] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transfer");
  const [accountScope, setAccountScope] = useState<Scope>("conta1");

  function submit() {
    startTransition(async () => {
      const res = await convertProformaToInvoice(proformaId, {
        paymentMethod,
        account_scope: accountScope,
        payment_status: paymentStatus,
        due_in_days: dueDays,
      });
      if (res.ok) {
        toast.success(t("proforma_convert_success", { number: res.number }));
        router.push(`/${locale}/panel/facturi/${res.invoiceId}`);
      } else {
        toast.error(t("sale_error", { reason: res.reason }));
      }
    });
  }

  function discard() {
    if (!confirm(t("proforma_void_confirm"))) return;
    startTransition(async () => {
      const res = await voidInvoice(proformaId);
      if (res.ok) {
        toast.success(t("proforma_voided"));
        router.refresh();
      } else {
        toast.error(t("sale_error", { reason: res.reason }));
      }
    });
  }

  if (alreadyConverted) return null;

  // Lock background scroll while the modal is open and close on Escape.
  useEffect(() => {
    if (!confirming) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setConfirming(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [confirming, pending]);

  return (
    <>
      <div className={cn("flex gap-2", variant === "compact" && "justify-end")}>
        <Button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={pending}
          size={variant === "compact" ? "sm" : "md"}
          className="gap-1.5"
        >
          <CheckCircle2 className="size-4" />
          {variant === "compact"
            ? t("proforma_convert_button_short")
            : t("proforma_convert_button")}
        </Button>
        {variant === "full" ? (
          <Button
            type="button"
            variant="outline"
            onClick={discard}
            disabled={pending}
            className="gap-1.5"
          >
            <X className="size-4" />
            {t("proforma_void_button")}
          </Button>
        ) : null}
      </div>

      {confirming ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !pending && setConfirming(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden />
          <div
            className="relative w-full max-w-md rounded-lg border border-border bg-surface shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold">
                  {t("proforma_convert_panel_title")}
                </h3>
                <p className="mt-0.5 text-xs text-muted">
                  {t("proforma_convert_panel_hint")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !pending && setConfirming(false)}
                className="rounded p-1 text-muted hover:bg-surface-elevated hover:text-foreground"
                aria-label={t("proforma_convert_cancel")}
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="flex flex-col gap-4 px-5 py-4">
              <Row label={t("proforma_convert_payment_status")}>
                <Segmented
                  value={paymentStatus}
                  onChange={(v) => setPaymentStatus(v as PaymentStatus)}
                  options={[
                    { value: "paid", label: t("proforma_convert_payment_status_paid") },
                    { value: "deferred", label: t("proforma_convert_payment_status_deferred") },
                  ]}
                />
              </Row>

              {paymentStatus === "deferred" ? (
                <Row label={t("proforma_convert_deferred_days_label")}>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={7}
                      step={1}
                      value={dueDays}
                      onChange={(e) =>
                        setDueDays(
                          Math.max(1, Math.min(7, Math.trunc(Number(e.target.value || 7)))),
                        )
                      }
                      className="h-9 w-20 text-right"
                    />
                    <span className="text-xs text-muted">
                      {t("proforma_convert_deferred_days_unit")}
                    </span>
                  </div>
                </Row>
              ) : null}

              <Row label={t("proforma_convert_payment_method")}>
                <Segmented
                  value={paymentMethod}
                  onChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  options={[
                    { value: "cash", label: t("payment_cash") },
                    { value: "transfer", label: t("payment_transfer") },
                    { value: "card", label: t("payment_card") },
                  ]}
                />
              </Row>

              <Row label={t("proforma_convert_scope")}>
                <Segmented
                  value={accountScope}
                  onChange={(v) => setAccountScope(v as Scope)}
                  options={[
                    { value: "conta1", label: t("scope_conta1") },
                    { value: "conta2", label: t("scope_conta2") },
                  ]}
                />
              </Row>
            </div>

            <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={pending}
              >
                {t("proforma_convert_cancel")}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={submit}
                disabled={pending}
              >
                {pending ? t("sale_processing") : t("proforma_convert_confirm_action")}
              </Button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3">
      <span className="text-xs text-muted">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex w-full rounded-md border border-border bg-surface p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded px-3 py-1.5 text-xs transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-strong hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
