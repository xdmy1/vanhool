"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { convertProformaToInvoice, voidInvoice } from "@/lib/panel/invoices/actions";

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

  function convert() {
    if (!confirm(t("proforma_convert_confirm"))) return;
    startTransition(async () => {
      const res = await convertProformaToInvoice(proformaId, {
        paymentMethod: "transfer",
        account_scope: "conta1",
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

  return (
    <div className="flex gap-2">
      <Button type="button" onClick={convert} disabled={pending} className="gap-1.5">
        <CheckCircle2 className="size-4" />
        {pending ? t("sale_processing") : t("proforma_convert_button")}
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
