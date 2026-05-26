"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { voidInvoice } from "@/lib/panel/invoices/actions";

/**
 * Cancels a fiscal invoice. The action restores stock for catalog-linked
 * items, marks the originating order as cancelled, and reverses any
 * conta2/cash inflow. Used on /panel/facturi/[id] for issued/paid invoices.
 */
export function VoidInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, start] = useTransition();

  function onClick() {
    if (!window.confirm(t("invoice_void_confirm"))) return;
    start(async () => {
      const res = await voidInvoice(invoiceId);
      if (res.ok) {
        toast.success(t("invoice_void_success"));
        router.refresh();
      } else {
        toast.error(t("sale_error", { reason: res.reason }));
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={onClick}
      disabled={pending}
      className="gap-1.5"
    >
      <X className="size-4" />
      {pending ? t("invoice_void_pending") : t("invoice_void_button")}
    </Button>
  );
}
