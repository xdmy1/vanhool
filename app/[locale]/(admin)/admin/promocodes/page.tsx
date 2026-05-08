import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, Edit, Plus, XCircle } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { adminListPromos } from "@/lib/admin/queries";
import { cn } from "@/lib/utils/cn";

export default async function AdminPromosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, promos] = await Promise.all([
    getTranslations("admin"),
    adminListPromos(),
  ]);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("nav_promocodes")}
        title={t("promocodes_title")}
        actions={
          <Button asChild size="md" className="">
            <Link href={"/admin/promocodes/new" as "/admin/promocodes"} locale={locale}>
              <Plus className="size-4" />
              {t("promocodes_new")}
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        {promos.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-border bg-surface px-6 py-16 text-sm text-muted">
            {t("promocodes_empty")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background/40 text-xs text-muted">
                  <th className="px-3 py-3">{t("promocodes_col_code")}</th>
                  <th className="px-3 py-3">{t("promocodes_col_type")}</th>
                  <th className="px-3 py-3 text-right">{t("promocodes_col_value")}</th>
                  <th className="hidden px-3 py-3 text-right md:table-cell">
                    {t("promocodes_col_min")}
                  </th>
                  <th className="px-3 py-3 text-right">{t("promocodes_col_uses")}</th>
                  <th className="px-3 py-3">{t("promocodes_col_status")}</th>
                  <th className="px-3 py-3 text-right" />
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-background/30"
                  >
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/admin/promocodes/${p.id}` as "/admin/promocodes"}
                        locale={locale}
                        className="text-sm font-bold transition-colors hover:text-primary"
                      >
                        {p.code}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="rounded-sm border border-border bg-accent-dark px-1.5 py-0.5 text-xs text-muted-strong">
                        {p.discount_type === "percentage" ? "%" : "€"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                      {p.discount_type === "percentage"
                        ? `${p.discount_value}%`
                        : `€${Number(p.discount_value ?? 0).toFixed(2)}`}
                    </td>
                    <td className="hidden px-3 py-2.5 text-right text-sm tabular-nums md:table-cell">
                      {p.min_order_amount
                        ? `€${Number(p.min_order_amount).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs tabular-nums">
                      {(p.current_uses ?? 0)}
                      {p.max_uses ? ` / ${p.max_uses}` : ""}
                    </td>
                    <td className="px-3 py-2.5">
                      {p.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-sm border border-success/40 bg-success/10 px-1.5 py-0.5 text-xs text-success">
                          <CheckCircle2 className="size-3" />
                          {t("products_status_active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-accent-dark px-1.5 py-0.5 text-xs text-muted">
                          <XCircle className="size-3" />
                          {t("products_status_inactive")}
                        </span>
                      )}
                    </td>
                    <td className={cn("px-3 py-2.5 text-right")}>
                      <Link
                        href={`/admin/promocodes/${p.id}` as "/admin/promocodes"}
                        locale={locale}
                        className="inline-grid size-8 place-items-center rounded-md border border-border bg-surface text-muted-strong transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
