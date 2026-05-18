"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createExpense } from "@/lib/panel/expenses/actions";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/panel/expenses/categories";
import type { AccountScope } from "@/lib/panel/scope";

type Props = {
  scope: AccountScope;
  /** When true, payment_method is forced to 'cash'. */
  forceCash?: boolean;
};

export function ExpenseForm({ scope, forceCash = false }: Props) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [category, setCategory] = useState<ExpenseCategory>("supplies");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "card">(
    forceCash ? "cash" : "transfer",
  );

  function submit() {
    if (!description.trim() || amount <= 0) {
      toast.error(t("expenses_form_validation"));
      return;
    }
    startTransition(async () => {
      const res = await createExpense({
        account_scope: scope,
        category,
        description: description.trim(),
        amount,
        paid_at: paidAt,
        payment_method: paymentMethod,
      });
      if (res.ok) {
        toast.success(t("expenses_form_saved"));
        setDescription("");
        setAmount(0);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(t("expenses_form_error", { reason: res.reason }));
      }
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-4" />
        {t("expenses_new_button")}
      </Button>
    );
  }

  return (
    <section className="rounded-md border border-primary/40 bg-primary/5 p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        {t("expenses_form_title")}
      </h3>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label={t("expenses_form_category")}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`cat_${c}` as `cat_${ExpenseCategory}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("expenses_form_amount")} required>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value || 0)))}
          />
        </Field>
        <Field label={t("expenses_form_paid_at")}>
          <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
        </Field>
        <Field label={t("expenses_form_payment_method")}>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as "cash" | "transfer" | "card")}
            disabled={forceCash}
            className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm disabled:opacity-60"
          >
            <option value="cash">{t("pay_cash")}</option>
            <option value="transfer">{t("pay_transfer")}</option>
            <option value="card">{t("pay_card")}</option>
          </select>
        </Field>
        <Field label={t("expenses_form_description")} required>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            placeholder={t("expenses_form_description_placeholder")}
          />
        </Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
          {t("action_cancel")}
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending ? t("action_saving") : t("action_create")}
        </Button>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children}
    </div>
  );
}
