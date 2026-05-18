"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cancelPurchase, postPurchase } from "@/lib/panel/purchases/actions";

export function PostPurchaseButton({
  purchaseId,
  disabled,
}: {
  purchaseId: string;
  disabled: boolean;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function post() {
    if (!confirm(t("achizitii_detail_post_confirm"))) return;
    startTransition(async () => {
      const res = await postPurchase(purchaseId);
      if (res.ok) {
        toast.success(t("achizitii_post_success"));
        router.refresh();
      } else {
        toast.error(t("achizitii_save_error", { reason: res.reason }));
      }
    });
  }

  function cancel() {
    if (!confirm(t("achizitii_detail_cancel_confirm"))) return;
    startTransition(async () => {
      const res = await cancelPurchase(purchaseId);
      if (res.ok) {
        toast.success(t("achizitii_cancel_success"));
        router.refresh();
      } else {
        toast.error(t("achizitii_save_error", { reason: res.reason }));
      }
    });
  }

  if (disabled) return null;

  return (
    <div className="flex gap-2">
      <Button type="button" onClick={post} disabled={pending} className="gap-1.5">
        <CheckCircle2 className="size-4" />
        {pending ? t("sale_processing") : t("achizitii_detail_post_button")}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={cancel}
        disabled={pending}
        className="gap-1.5"
      >
        <X className="size-4" />
        {t("achizitii_detail_cancel_button")}
      </Button>
    </div>
  );
}
