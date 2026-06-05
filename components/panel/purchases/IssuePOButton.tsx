"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileSignature } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { DateInputEU } from "@/components/common/DateInputEU";
import { issuePurchaseOrder } from "@/lib/panel/purchases/actions";

export function IssuePOButton({
  purchaseId,
  hasLines,
}: {
  purchaseId: string;
  hasLines: boolean;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [expected, setExpected] = useState("");
  const [pending, startTransition] = useTransition();

  function go() {
    if (!hasLines) {
      toast.error(t("po_no_lines"));
      return;
    }
    startTransition(async () => {
      const res = await issuePurchaseOrder(purchaseId, expected || null);
      if (res.ok) {
        toast.success(t("po_issue_success", { number: res.po_number }));
        router.refresh();
        setOpen(false);
      } else {
        toast.error(t("sale_error", { reason: res.reason }));
      }
    });
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} variant="outline" className="gap-1.5">
        <FileSignature className="size-4" />
        {t("po_button_issue")}
      </Button>
    );
  }

  return (
    <div className="rounded-md border border-primary/40 bg-primary/5 p-4">
      <div className="mb-3 text-sm font-semibold">{t("po_section_title")}</div>
      <div className="mb-3 text-xs text-muted-strong">{t("po_section_body")}</div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
            {t("po_expected_delivery")}
          </label>
          <DateInputEU
            value={expected}
            onChange={(iso) => setExpected(iso)}
          />
        </div>
        <Button onClick={go} disabled={pending} className="gap-1.5">
          <FileSignature className="size-4" />
          {pending ? t("sale_processing") : t("po_button_issue")}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
          {t("action_cancel")}
        </Button>
      </div>
    </div>
  );
}
