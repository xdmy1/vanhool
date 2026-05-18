"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileSignature, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { triageOrder } from "@/lib/panel/triage/actions";
import { issueProformaFromOrder } from "@/lib/panel/invoices/actions";

export function TriageButtons({
  orderId,
  currentScope,
  triaged,
  locale,
}: {
  orderId: string;
  currentScope: "conta1" | "conta2";
  triaged: boolean;
  locale: string;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function go(scope: "conta1" | "conta2") {
    startTransition(async () => {
      const res = await triageOrder({ orderId, scope });
      if (res.ok) {
        toast.success(
          scope === "conta1" ? t("triage_done_conta1") : t("triage_done_conta2"),
        );
        router.refresh();
      } else {
        toast.error(t("sale_error", { reason: res.reason }));
      }
    });
  }

  function proforma() {
    if (!confirm(t("triage_to_proforma") + "?")) return;
    startTransition(async () => {
      const res = await issueProformaFromOrder(orderId, 7, "MDL");
      if (res.ok) {
        toast.success(t("triage_done_proforma"));
        router.push(`/${locale}/panel/proforme/${res.id}`);
      } else {
        toast.error(t("sale_error", { reason: res.reason }));
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => go("conta1")}
        disabled={pending}
        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] uppercase tracking-wide transition-colors ${
          triaged && currentScope === "conta1"
            ? "border-primary bg-primary/15 text-primary"
            : "border-primary/40 bg-surface text-primary hover:bg-primary/10"
        } disabled:opacity-50`}
      >
        <CheckCircle2 className="size-3" />
        {t("triage_to_conta1")}
      </button>
      <button
        type="button"
        onClick={() => go("conta2")}
        disabled={pending}
        className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] uppercase tracking-wide transition-colors ${
          triaged && currentScope === "conta2"
            ? "border-warning bg-warning/15 text-warning"
            : "border-warning/40 bg-surface text-warning hover:bg-warning/10"
        } disabled:opacity-50`}
      >
        <Wallet className="size-3" />
        {t("triage_to_conta2")}
      </button>
      <button
        type="button"
        onClick={proforma}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md border border-purple-500/40 bg-surface px-2.5 py-1 text-[11px] uppercase tracking-wide text-purple-600 transition-colors hover:bg-purple-500/10 disabled:opacity-50"
      >
        <FileSignature className="size-3" />
        {t("triage_to_proforma")}
      </button>
    </div>
  );
}
