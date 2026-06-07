"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileSignature, Wallet, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  cancelStorefrontOrder,
  triageOrder,
} from "@/lib/panel/triage/actions";
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

  // PIN modal state for the cancel action — kept inline so the button
  // can sit next to the conta1/conta2/proforma triad without dragging in
  // the shared PinDeleteButton (which would visually scream "delete").
  const [cancelOpen, setCancelOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const pinRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!cancelOpen) return;
    setPin("");
    setPinError(null);
    const id = window.setTimeout(() => pinRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCancelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [cancelOpen]);

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

  function submitCancel() {
    if (pin.trim().length === 0) {
      setPinError(t("pin_delete_required"));
      return;
    }
    startTransition(async () => {
      const res = await cancelStorefrontOrder(orderId, pin.trim());
      if (res.ok) {
        toast.success(t("triage_cancel_success"));
        setCancelOpen(false);
        router.refresh();
      } else if (res.reason === "bad_pin") {
        setPinError(t("pin_delete_bad_pin"));
        setPin("");
        pinRef.current?.focus();
      } else {
        setPinError(t("sale_error", { reason: res.reason }));
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
      <button
        type="button"
        onClick={() => setCancelOpen(true)}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-surface px-2.5 py-1 text-[11px] uppercase tracking-wide text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
      >
        <XCircle className="size-3" />
        {t("triage_cancel_button")}
      </button>

      {cancelOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCancelOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {t("triage_cancel_title")}
              </h3>
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                className="text-muted hover:text-foreground"
                aria-label={t("action_close")}
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mb-3 text-xs text-muted-strong">
              {t("triage_cancel_subtitle")}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitCancel();
              }}
            >
              <input
                ref={pinRef}
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (pinError) setPinError(null);
                }}
                placeholder="••••"
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-center text-lg tracking-[0.4em] focus:border-primary focus:outline-none"
                maxLength={12}
              />
              {pinError ? (
                <div className="mt-2 text-xs text-destructive">{pinError}</div>
              ) : null}
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelOpen(false)}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted-strong hover:text-foreground"
                  disabled={pending}
                >
                  {t("action_cancel")}
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-md border border-destructive bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-70"
                >
                  <XCircle className="size-3.5" />
                  {pending ? t("pin_delete_pending") : t("triage_cancel_confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
