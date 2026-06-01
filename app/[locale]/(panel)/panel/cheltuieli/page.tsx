import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { ExpenseForm } from "@/components/panel/expenses/ExpenseForm";
import { listExpenses } from "@/lib/panel/expenses/queries";
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from "@/lib/panel/expenses/categories";

export default async function PanelCheltuieliPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  const q = typeof sp.q === "string" ? sp.q : undefined;
  const category = typeof sp.category === "string" ? sp.category : "all";
  const from = typeof sp.from === "string" ? sp.from : undefined;
  const to = typeof sp.to === "string" ? sp.to : undefined;
  const rows = await listExpenses({ scope: "conta1", q, category, from, to });
  // Group expenses by their own currency rather than summing into MDL — a
  // EUR receipt should stay EUR on the dashboard, not be silently converted.
  const totalByCurrency: Record<string, number> = {};
  for (const r of rows) {
    const c = (r.currency ?? "MDL").toUpperCase();
    totalByCurrency[c] = (totalByCurrency[c] ?? 0) + (r.amount ?? 0);
  }
  const totalMonthLabel = Object.entries(totalByCurrency)
    .filter(([, n]) => Math.abs(n) > 0.005)
    .map(([c, n]) => `${n.toFixed(2)} ${c}`)
    .join(", ") || "0.00 MDL";
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("conta1_eyebrow")}
        title={t("expenses_title")}
        subtitle={t("expenses_subtitle")}
        actions={<ExpenseForm scope="conta1" />}
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchInput placeholder={t("expenses_search_placeholder")} className="max-w-md flex-1" />
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all" as const, label: t("expenses_filter_all") },
            ...EXPENSE_CATEGORIES.map((c) => ({
              id: c,
              label: t(`cat_${c}` as `cat_${ExpenseCategory}`),
            })),
          ].map((c) => {
            const next = new URLSearchParams();
            for (const [k, v] of Object.entries(sp)) {
              if (k === "category" || v === undefined) continue;
              next.set(k, Array.isArray(v) ? v.join(",") : v);
            }
            if (c.id !== "all") next.set("category", c.id);
            const active = category === c.id;
            return (
              <a
                key={c.id}
                href={`?${next.toString()}`}
                className={`inline-flex h-8 items-center rounded-md border px-2.5 text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface hover:border-primary/40"
                }`}
              >
                {c.label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card label={t("expenses_card_total")} value={totalMonthLabel} />
        <Card label={t("expenses_card_count")} value={String(rows.length)} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border border-border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">{t("expenses_col_date")}</th>
              <th className="px-4 py-3">{t("expenses_col_category")}</th>
              <th className="px-4 py-3">{t("expenses_col_description")}</th>
              <th className="px-4 py-3">{t("expenses_col_supplier")}</th>
              <th className="px-4 py-3">{t("expenses_col_payment")}</th>
              <th className="px-4 py-3 text-right">{t("expenses_col_amount")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                  {t("expenses_empty")}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface-elevated">
                  <td className="px-4 py-2 text-muted-strong">
                    {new Date(r.paid_at).toLocaleDateString(dateLocale)}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
                      {t(`cat_${r.category as ExpenseCategory}` as `cat_${ExpenseCategory}`)}
                    </span>
                  </td>
                  <td className="px-4 py-2">{r.description}</td>
                  <td className="px-4 py-2 text-xs text-muted">{r.supplier_name ?? "—"}</td>
                  <td className="px-4 py-2 text-xs uppercase">
                    {r.payment_method ? t(`pay_${r.payment_method}` as "pay_cash") : "—"}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold">
                    {r.amount.toFixed(2)} {r.currency}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
