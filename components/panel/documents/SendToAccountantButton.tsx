"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { sendInvoiceToAccountant } from "@/lib/panel/invoices/actions";
import { cn } from "@/lib/utils/cn";

/**
 * Forwards an invoice / proforma to the bookkeeper. Green when never sent,
 * yellow once dispatched at least once; stays clickable so the operator
 * can re-send after editing or if the first email got lost.
 */
export function SendToAccountantButton({
  invoiceId,
  initialSentAt,
  compact = false,
}: {
  invoiceId: string;
  initialSentAt: string | null;
  /** Smaller form factor for inline use in list rows. */
  compact?: boolean;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [sentAt, setSentAt] = useState<string | null>(initialSentAt);
  const [pending, startTransition] = useTransition();
  const wasSent = !!sentAt;

  function fire() {
    startTransition(async () => {
      const res = await sendInvoiceToAccountant(invoiceId);
      if (res.ok) {
        setSentAt(res.sentAt);
        toast.success(t("accountant_send_success"));
        // Refresh so other parts of the page (e.g. a "last sent" timestamp
        // if we add one later) re-read the row.
        router.refresh();
      } else {
        toast.error(t("accountant_send_error", { reason: res.reason }));
      }
    });
  }

  const label = wasSent
    ? t("accountant_send_resend_label")
    : t("accountant_send_label");
  // Tooltip carries the full text even in compact mode so the operator
  // doesn't lose context when the label is iconified.
  const tooltip =
    wasSent && sentAt
      ? t("accountant_send_last", {
          when: new Date(sentAt).toLocaleString("ro-RO"),
        })
      : t("accountant_send_label");

  return (
    <button
      type="button"
      onClick={fire}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors disabled:cursor-wait disabled:opacity-70",
        compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-xs",
        wasSent
          ? "border-warning bg-warning/15 text-warning hover:bg-warning/25"
          : "border-success bg-success/15 text-success hover:bg-success/25",
      )}
      title={tooltip}
    >
      {wasSent ? <Check className="size-3.5" /> : <Mail className="size-3.5" />}
      {pending
        ? t("accountant_send_pending")
        : compact
          ? wasSent
            ? t("accountant_send_resend_compact")
            : t("accountant_send_compact")
          : label}
    </button>
  );
}
