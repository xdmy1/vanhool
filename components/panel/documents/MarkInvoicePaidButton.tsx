"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CheckCircle2, CreditCard, FileText, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markInvoicePaid } from "@/lib/panel/invoices/actions";
import { cn } from "@/lib/utils/cn";

type PaymentMethod = "cash" | "transfer" | "card" | "other";

function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Opens an inline panel to mark a deferred (issued, unpaid) invoice as
 * paid. Captures the payment date, amount, currency and method. Amount
 * and currency are prefilled with the invoice's own values — owner can
 * tweak them if the customer over/under-paid or settled in a different
 * currency.
 */
export function MarkInvoicePaidButton({
  invoiceId,
  defaultAmount,
  defaultCurrency,
  variant = "full",
}: {
  invoiceId: string;
  defaultAmount: number;
  defaultCurrency: string;
  /** "full" — opens with a labelled trigger. "compact" — small list button. */
  variant?: "full" | "compact";
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  const [paidAt, setPaidAt] = useState<string>(todayIso());
  const [amount, setAmount] = useState<string>(defaultAmount.toFixed(2));
  const [currency, setCurrency] = useState<"MDL" | "EUR" | "USD">(
    (defaultCurrency as "MDL" | "EUR" | "USD") || "MDL",
  );
  const [method, setMethod] = useState<PaymentMethod>("transfer");

  function submit() {
    start(async () => {
      const res = await markInvoicePaid(invoiceId, {
        paid_at: paidAt,
        amount: Math.max(0, Number(amount) || 0),
        currency,
        method,
      });
      if (res.ok) {
        toast.success(t("invoice_mark_paid_success"));
        router.refresh();
      } else {
        toast.error(t("sale_error", { reason: res.reason }));
      }
    });
  }

  if (!open) {
    return (
      <Button
        type="button"
        onClick={() => setOpen(true)}
        size={variant === "compact" ? "sm" : "md"}
        className="gap-1.5"
        disabled={pending}
      >
        <HandCoins className="size-4" />
        {variant === "compact"
          ? t("invoice_mark_paid_button_short")
          : t("invoice_mark_paid_button")}
      </Button>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-4 rounded-md border border-primary/30 bg-primary/5 p-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {t("invoice_mark_paid_panel_title")}
        </h3>
        <p className="mt-1 text-xs text-muted-strong">
          {t("invoice_mark_paid_panel_hint")}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t("invoice_mark_paid_date")}
          </span>
          <Input
            type="date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            max={todayIso()}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t("invoice_mark_paid_amount")}
          </span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "MDL" | "EUR" | "USD")}
              className="h-10 rounded-md border border-border bg-surface px-2 text-sm"
            >
              <option value="MDL">MDL</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </label>
      </div>

      <div>
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-muted">
          {t("invoice_mark_paid_method")}
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              { v: "cash", label: t("payment_cash"), icon: Banknote },
              { v: "card", label: t("payment_card"), icon: CreditCard },
              { v: "transfer", label: t("payment_transfer"), icon: FileText },
              { v: "other", label: t("payment_other"), icon: HandCoins },
            ] as const
          ).map((opt) => {
            const active = opt.v === method;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => setMethod(opt.v)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-surface text-muted-strong hover:border-primary/40 hover:text-foreground",
                )}
              >
                <opt.icon className="size-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="button" onClick={submit} disabled={pending} className="gap-1.5">
          <CheckCircle2 className="size-4" />
          {pending
            ? t("sale_processing")
            : t("invoice_mark_paid_confirm")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={pending}
        >
          {t("proforma_convert_cancel")}
        </Button>
      </div>
    </div>
  );
}
