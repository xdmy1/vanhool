"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recordCashMovement } from "@/lib/panel/cash/actions";

export function CashMovementForm() {
  const t = useTranslations("panel");
  const router = useRouter();
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState<"top_up" | "withdrawal" | "adjustment">("top_up");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (amount <= 0) {
      toast.error(t("cash_form_invalid_amount"));
      return;
    }
    startTransition(async () => {
      const res = await recordCashMovement({
        direction,
        amount,
        reason,
        notes: notes || null,
        drawer: "main",
      });
      if (res.ok) {
        toast.success(t("cash_form_saved"));
        setAmount(0);
        setNotes("");
        router.refresh();
      } else {
        toast.error(t("settings_generate_error", { reason: res.reason }));
      }
    });
  }

  return (
    <section className="rounded-md border border-border bg-surface p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("cash_form_title")}
      </h3>

      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setDirection("in");
            setReason("top_up");
          }}
          className={`flex items-center gap-2 rounded-md border-2 px-4 py-2.5 text-sm transition-colors ${
            direction === "in"
              ? "border-success bg-success/10 text-success"
              : "border-border bg-surface hover:border-success/40"
          }`}
        >
          <ArrowDown className="size-4" />
          {t("cash_form_in_button")}
        </button>
        <button
          type="button"
          onClick={() => {
            setDirection("out");
            setReason("withdrawal");
          }}
          className={`flex items-center gap-2 rounded-md border-2 px-4 py-2.5 text-sm transition-colors ${
            direction === "out"
              ? "border-warning bg-warning/10 text-warning"
              : "border-border bg-surface hover:border-warning/40"
          }`}
        >
          <ArrowUp className="size-4" />
          {t("cash_form_out_button")}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Field label={t("cash_form_amount")}>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value || 0)))}
          />
        </Field>
        <Field label={t("cash_form_reason")}>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as "top_up" | "withdrawal" | "adjustment")}
            className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
          >
            {direction === "in" ? (
              <>
                <option value="top_up">{t("cash_reason_top_up")}</option>
                <option value="adjustment">{t("cash_reason_adjustment")}</option>
              </>
            ) : (
              <>
                <option value="withdrawal">{t("cash_reason_withdrawal")}</option>
                <option value="adjustment">{t("cash_reason_adjustment")}</option>
              </>
            )}
          </select>
        </Field>
        <Field label={t("cash_form_notes")}>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={submit} disabled={pending}>
          {pending ? t("action_saving") : t("cash_form_save")}
        </Button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
