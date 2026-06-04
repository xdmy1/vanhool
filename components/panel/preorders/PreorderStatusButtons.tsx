"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, MailCheck, PackageCheck, Send, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  resendPreorderConfirmation,
  setPreorderStatus,
} from "@/lib/panel/preorders/actions";
import type { PreorderStatus } from "@/lib/panel/preorders/queries";
import { cn } from "@/lib/utils/cn";

/**
 * Inline status-transition controls for a preorder row. Renders only the
 * transitions valid from the current status (see `statusTransitions` in
 * the action). When transitioning to "confirmed" the server also sends
 * the brand-styled confirmation email — toast feedback signals whether
 * the email actually went out.
 */
export function PreorderStatusButtons({
  preorderId,
  status,
  hasEmail,
  confirmationSent,
}: {
  preorderId: string;
  status: PreorderStatus;
  hasEmail: boolean;
  confirmationSent: boolean;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function transition(next: PreorderStatus, successKey: string) {
    startTransition(async () => {
      const res = await setPreorderStatus(preorderId, next);
      if (res.ok) {
        toast.success(
          res.emailSent
            ? t("preorder_status_confirmed_email_sent")
            : t(successKey as "preorder_status_pending"),
        );
        router.refresh();
      } else {
        toast.error(t("accountant_send_error", { reason: res.reason }));
      }
    });
  }

  function resend() {
    startTransition(async () => {
      const res = await resendPreorderConfirmation(preorderId);
      if (res.ok) {
        toast.success(t("preorder_resend_success"));
        router.refresh();
      } else {
        toast.error(t("accountant_send_error", { reason: res.reason }));
      }
    });
  }

  const btn = (
    onClick: () => void,
    label: string,
    icon: React.ReactNode,
    tone: "primary" | "success" | "warning" | "destructive",
  ) => (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60",
        tone === "primary" && "border-primary bg-primary/10 text-primary hover:bg-primary/15",
        tone === "success" && "border-success bg-success/15 text-success hover:bg-success/25",
        tone === "warning" && "border-warning bg-warning/15 text-warning hover:bg-warning/25",
        tone === "destructive" && "border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20",
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {status === "pending" ? (
        <>
          {btn(
            () => transition("confirmed", "preorder_status_confirmed"),
            t("preorder_action_confirm"),
            <Check className="size-3.5" />,
            "success",
          )}
          {btn(
            () => transition("cancelled", "preorder_status_cancelled"),
            t("preorder_action_cancel"),
            <X className="size-3.5" />,
            "destructive",
          )}
        </>
      ) : null}
      {status === "confirmed" ? (
        <>
          {btn(
            () => transition("ordered", "preorder_status_ordered"),
            t("preorder_action_mark_ordered"),
            <Send className="size-3.5" />,
            "primary",
          )}
          {btn(
            () => transition("arrived", "preorder_status_arrived"),
            t("preorder_action_mark_arrived"),
            <PackageCheck className="size-3.5" />,
            "warning",
          )}
          {hasEmail && !confirmationSent
            ? btn(
                resend,
                t("preorder_action_resend"),
                <MailCheck className="size-3.5" />,
                "primary",
              )
            : null}
        </>
      ) : null}
      {status === "ordered"
        ? btn(
            () => transition("arrived", "preorder_status_arrived"),
            t("preorder_action_mark_arrived"),
            <PackageCheck className="size-3.5" />,
            "warning",
          )
        : null}
      {status === "arrived"
        ? btn(
            () => transition("delivered", "preorder_status_delivered"),
            t("preorder_action_mark_delivered"),
            <Truck className="size-3.5" />,
            "success",
          )
        : null}
    </div>
  );
}
