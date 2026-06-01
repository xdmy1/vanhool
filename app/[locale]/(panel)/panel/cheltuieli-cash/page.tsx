import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExpenseForm } from "@/components/panel/expenses/ExpenseForm";
import { CashMovementForm } from "@/components/panel/expenses/CashMovementForm";
import { listExpenses } from "@/lib/panel/expenses/queries";
import { getCashBalance, listCashMovements } from "@/lib/panel/cash/actions";
import { type ExpenseCategory } from "@/lib/panel/expenses/categories";
import { cn } from "@/lib/utils/cn";

export default async function PanelCheltuieliCashPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  const [expenses, balance, movements] = await Promise.all([
    listExpenses({ scope: "conta2" }),
    getCashBalance("main"),
    listCashMovements(30, "main"),
  ]);
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("conta2_eyebrow")}
        title={t("cash_title")}
        subtitle={t("cash_subtitle")}
        actions={<ExpenseForm scope="conta2" forceCash />}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <BalanceCard label={t("cash_balance_label")} value={balance.balance.toFixed(2)} />
        <Card label={t("cash_movements_count")} value={String(balance.movements_count)} />
        <Card
          label={t("cash_expenses_total")}
          value={(() => {
            const by: Record<string, number> = {};
            for (const e of expenses) {
              const c = ((e as { currency?: string | null }).currency ?? "MDL").toUpperCase();
              by[c] = (by[c] ?? 0) + (e.amount ?? 0);
            }
            return (
              Object.entries(by)
                .filter(([, n]) => Math.abs(n) > 0.005)
                .map(([c, n]) => `${n.toFixed(2)} ${c}`)
                .join(", ") || "0.00 MDL"
            );
          })()}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-2 text-sm font-semibold">{t("cash_expenses_section")}</h3>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2">{t("expenses_col_date")}</th>
                  <th className="px-3 py-2">{t("expenses_col_category")}</th>
                  <th className="px-3 py-2">{t("expenses_col_description")}</th>
                  <th className="px-3 py-2 text-right">{t("expenses_col_amount")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-xs text-muted">
                      {t("expenses_empty")}
                    </td>
                  </tr>
                ) : (
                  expenses.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 text-xs text-muted-strong">
                        {new Date(r.paid_at).toLocaleDateString(dateLocale)}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {t(`cat_${r.category as ExpenseCategory}` as `cat_${ExpenseCategory}`)}
                      </td>
                      <td className="px-3 py-2">{r.description}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {r.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">{t("cash_movements_section")}</h3>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2">{t("cash_movements_col_date")}</th>
                  <th className="px-3 py-2">{t("cash_movements_col_direction")}</th>
                  <th className="px-3 py-2">{t("cash_movements_col_reason")}</th>
                  <th className="px-3 py-2">{t("cash_movements_col_notes")}</th>
                  <th className="px-3 py-2 text-right">{t("cash_movements_col_amount")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-xs text-muted">
                      {t("cash_movements_empty")}
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id}>
                      <td className="px-3 py-2 text-xs text-muted-strong">
                        {new Date(m.occurred_at).toLocaleString(dateLocale)}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
                            m.direction === "in"
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning",
                          )}
                        >
                          {m.direction === "in" ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}
                          {m.direction}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {t(`cash_reason_${m.reason}` as "cash_reason_sale")}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted">{m.notes ?? "—"}</td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right tabular-nums",
                          m.direction === "in" ? "text-success" : "text-warning",
                        )}
                      >
                        {m.direction === "in" ? "+" : "−"}
                        {m.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-8">
        <CashMovementForm />
      </div>
    </div>
  );
}

function BalanceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
        <Wallet className="size-3.5" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-primary">{value} MDL</div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
