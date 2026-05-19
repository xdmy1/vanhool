"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CheckCircle2, CreditCard, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { convertProformaToInvoice, voidInvoice } from "@/lib/panel/invoices/actions";
import { cn } from "@/lib/utils/cn";

type PaymentMethod = "cash" | "card" | "transfer";
type Scope = "conta1" | "conta2";

/**
 * Opens a small inline confirmation panel before converting the proforma —
 * asks the admin to confirm the payment was received, which method was used,
 * and which set of books the resulting invoice should land in.
 */
export function ConvertProformaButton({
  proformaId,
  locale,
  alreadyConverted,
}: {
  proformaId: string;
  locale: string;
  alreadyConverted: boolean;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transfer");
  const [accountScope, setAccountScope] = useState<Scope>("conta1");

  function submit() {
    startTransition(async () => {
      const res = await convertProformaToInvoice(proformaId, {
        paymentMethod,
        account_scope: accountScope,
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

  if (!confirming) {
    return (
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={pending}
          className="gap-1.5"
        >
          <CheckCircle2 className="size-4" />
          {t("proforma_convert_button")}
        </Button>
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
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-4 rounded-md border border-primary/30 bg-primary/5 p-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {t("proforma_convert_panel_title")}
        </h3>
        <p className="mt-1 text-xs text-muted-strong">
          {t("proforma_convert_panel_hint")}
        </p>
      </div>

      <Choice
        label={t("proforma_convert_payment_method")}
        value={paymentMethod}
        onChange={(v) => setPaymentMethod(v as PaymentMethod)}
        options={[
          {
            value: "cash",
            label: t("payment_cash"),
            icon: Banknote,
          },
          {
            value: "card",
            label: t("payment_card"),
            icon: CreditCard,
          },
          {
            value: "transfer",
            label: t("payment_transfer"),
            icon: FileText,
          },
        ]}
      />

      <Choice
        label={t("proforma_convert_scope")}
        value={accountScope}
        onChange={(v) => setAccountScope(v as Scope)}
        options={[
          { value: "conta1", label: t("scope_conta1") },
          { value: "conta2", label: t("scope_conta2") },
        ]}
      />

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          onClick={submit}
          disabled={pending}
          className="gap-1.5"
        >
          <CheckCircle2 className="size-4" />
          {pending
            ? t("sale_processing")
            : t("proforma_convert_confirm_action")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirming(false)}
          disabled={pending}
        >
          {t("proforma_convert_cancel")}
        </Button>
      </div>
    </div>
  );
}

function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: {
    value: T;
    label: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const active = opt.value === value;
          const Icon = opt.icon;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface text-muted-strong hover:border-primary/40 hover:text-foreground",
              )}
            >
              {Icon ? <Icon className="size-4" /> : null}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
