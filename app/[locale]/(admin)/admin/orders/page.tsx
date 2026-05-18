import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Link } from "@/lib/i18n/routing";
import { Price } from "@/components/common/Price";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterChips } from "@/components/admin/FilterChips";
import { OrderStatusSelect } from "@/components/admin/orders/OrderStatusSelect";
import { adminListOrders } from "@/lib/admin/queries";
import type { OrderStatus } from "@/lib/admin/orders/constants";

const STATUS_VALUES = [
  "all",
  "active",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type StatusFilter = (typeof STATUS_VALUES)[number];

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const status: StatusFilter = STATUS_VALUES.includes(sp.status as StatusFilter)
    ? (sp.status as StatusFilter)
    : "all";

  const [t, tAuth] = await Promise.all([
    getTranslations("admin"),
    getTranslations("auth"),
  ]);

  const page = Number(sp.page ?? 1);
  const { rows, total } = await adminListOrders({ q: sp.q, status, page, perPage: 30 });

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";

  const statusLabels = {
    pending: tAuth("dashboard_status_pending"),
    confirmed: tAuth("dashboard_status_confirmed"),
    processing: tAuth("dashboard_status_processing"),
    shipped: tAuth("dashboard_status_shipped"),
    delivered: tAuth("dashboard_status_delivered"),
    cancelled: tAuth("dashboard_status_cancelled"),
    update: t("order_detail_change_status"),
    updated: t("order_detail_status_updated"),
    error: t("common_error"),
  };

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("nav_orders")}
        title={t("orders_title")}
        subtitle={`${total} · ${total === 1 ? "1 order" : `${total} orders`}`}
      />

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchInput
          placeholder={t("orders_search_placeholder")}
          className="md:max-w-md md:flex-1"
        />
        <FilterChips
          paramName="status"
          options={[
            { value: "all", label: t("orders_filter_all") },
            { value: "active", label: t("orders_filter_active") },
            { value: "pending", label: tAuth("dashboard_status_pending") },
            { value: "confirmed", label: tAuth("dashboard_status_confirmed") },
            { value: "processing", label: tAuth("dashboard_status_processing") },
            { value: "shipped", label: tAuth("dashboard_status_shipped") },
            { value: "delivered", label: tAuth("dashboard_status_delivered") },
            { value: "cancelled", label: tAuth("dashboard_status_cancelled") },
          ]}
        />
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-border bg-surface px-6 py-16 text-sm text-muted">
            {t("orders_empty")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background/40 text-xs text-muted">
                  <th className="px-3 py-3">{t("orders_col_number")}</th>
                  <th className="px-3 py-3">{t("orders_col_date")}</th>
                  <th className="px-3 py-3">{t("orders_col_customer")}</th>
                  <th className="hidden px-3 py-3 lg:table-cell">{t("orders_col_payment")}</th>
                  <th className="px-3 py-3">{t("orders_col_status")}</th>
                  <th className="px-3 py-3 text-right">{t("orders_col_total")}</th>
                  <th className="px-3 py-3 text-right" />
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-background/30"
                  >
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/admin/orders/${o.id}` as "/admin/orders"}
                        locale={locale}
                        className="text-xs font-bold transition-colors hover:text-primary"
                      >
                        #{o.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-strong">
                      {o.created_at
                        ? new Date(o.created_at).toLocaleString(dateLocale, {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold">{o.customer_name ?? "—"}</div>
                      <div className="text-[10px] text-muted">
                        {o.customer_email ?? ""}
                      </div>
                    </td>
                    <td className="hidden px-3 py-2.5 lg:table-cell">
                      <span className="text-xs text-muted-strong">
                        {o.payment_method ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <OrderStatusSelect
                        orderId={o.id}
                        initialStatus={(o.status as OrderStatus) ?? "pending"}
                        labels={statusLabels}
                        size="sm"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Price value={Number(o.total ?? 0)} size="sm" accent={false} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/admin/orders/${o.id}` as "/admin/orders"}
                        locale={locale}
                        className="text-xs text-primary hover:underline"
                      >
                        {t("common_view")} →
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
