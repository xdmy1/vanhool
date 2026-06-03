import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MapPin, Phone, User as UserIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PinDeleteButton } from "@/components/panel/documents/PinDeleteButton";
import { deleteOrderWithPin } from "@/lib/admin/orders/actions";
import { Price } from "@/components/common/Price";
import { OrderStatusSelect } from "@/components/admin/orders/OrderStatusSelect";
import { OrderNotes } from "@/components/admin/orders/OrderNotes";
import { adminGetOrder } from "@/lib/admin/queries";
import type { OrderItem } from "@/lib/db/orders";
import type { OrderStatus } from "@/lib/admin/orders/constants";
import { cn } from "@/lib/utils/cn";

function parseItems(raw: unknown): OrderItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
    .map((r) => ({
      productId: String(r.productId ?? r.product_id ?? r.id ?? ""),
      slug: String(r.slug ?? ""),
      name: String(r.name ?? ""),
      partCode: String(r.partCode ?? r.part_code ?? ""),
      brand: String(r.brand ?? ""),
      price: Number(r.price ?? r.unit_price ?? 0),
      quantity: Number(r.quantity ?? 1),
    }));
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [t, tAuth, tCart, order] = await Promise.all([
    getTranslations("admin"),
    getTranslations("auth"),
    getTranslations("cart"),
    adminGetOrder(id),
  ]);

  if (!order) notFound();

  const items = parseItems(order.items);
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString(dateLocale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

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
        title={`#${order.id.slice(0, 8).toUpperCase()}`}
        subtitle={formattedDate}
        back={{ href: "/admin/orders", label: t("order_detail_back"), locale }}
        actions={
          <div className="flex items-center gap-2">
            <OrderStatusSelect
              orderId={order.id}
              initialStatus={(order.status as OrderStatus) ?? "pending"}
              labels={statusLabels}
            />
            <PinDeleteButton
              action={deleteOrderWithPin}
              entityId={order.id}
              redirectTo={`/${locale}/admin/orders`}
            />
          </div>
        }
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* Items */}
          <section className="overflow-hidden rounded-md border border-border bg-surface">
            <header className="border-b border-border bg-background/40 px-5 py-3">
              <h2 className="text-[10px] font-semibold text-muted">
                {t("order_detail_items")}
              </h2>
            </header>
            <ul className="divide-y divide-border">
              {items.map((item, i) => (
                <li
                  key={`${item.productId}-${i}`}
                  className="flex items-start gap-3 px-5 py-3"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-accent-dark text-xs text-muted">
                    {(item.partCode || item.brand).slice(0, 3) || "—"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">
                        {item.brand}
                      </span>
                      {item.partCode ? (
                        <span className="rounded-sm border border-border bg-accent-dark px-1.5 py-0.5 text-[10px] text-muted-strong">
                          {item.partCode}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-sm font-semibold">
                      {item.name}
                    </div>
                    <div className="mt-0.5 text-xs text-muted">
                      {item.quantity} × {item.price.toFixed(2)} lei
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold tabular-nums">
                    {(item.price * item.quantity).toFixed(2)} lei
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Customer */}
          <section className="rounded-md border border-border bg-surface p-5">
            <h2 className="mb-4 text-[10px] font-semibold text-muted">
              {t("order_detail_customer")}
            </h2>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <DefRow icon={UserIcon} label="Name" value={order.customer_name ?? "—"} />
              <DefRow icon={Mail} label="Email" value={order.customer_email ?? "—"} />
              <DefRow icon={Phone} label="Phone" value={order.customer_phone ?? "—"} />
              <DefRow
                icon={MapPin}
                label="Address"
                value={order.customer_address ?? "—"}
                className="sm:col-span-2"
              />
            </dl>
          </section>

          {/* Notes */}
          <OrderNotes
            orderId={order.id}
            initialNotes={order.notes ?? ""}
            labels={{
              title: t("order_detail_notes"),
              placeholder: t("order_detail_no_notes"),
              save: t("common_save"),
              saved: t("common_saved"),
              error: t("common_error"),
            }}
          />
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded-md border border-border bg-surface p-5">
            <h2 className="mb-4 text-[10px] font-semibold text-muted">
              {t("order_detail_summary")}
            </h2>
            <dl className="space-y-2 text-sm">
              <Row label={tCart("subtotal")} value={`${Number(order.subtotal ?? 0).toFixed(2)} lei`} />
              {Number(order.discount_amount ?? 0) > 0 ? (
                <Row
                  label={tCart("discount")}
                  value={`-${Number(order.discount_amount).toFixed(2)} lei`}
                  tone="success"
                />
              ) : null}
              <Row
                label={tCart("shipping")}
                value={
                  Number(order.shipping_cost ?? 0) === 0 ? (
                    <span className="text-success">{tCart("free")}</span>
                  ) : (
                    `${Number(order.shipping_cost).toFixed(2)} lei`
                  )
                }
              />
            </dl>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
              <span className="text-[11px] font-semibold">
                {tCart("total")}
              </span>
              <Price value={Number(order.total ?? 0)} size="xl" />
            </div>
          </section>

          <section className="rounded-md border border-border bg-surface p-5">
            <h2 className="mb-3 text-[10px] font-semibold text-muted">
              {t("order_detail_payment")}
            </h2>
            <div className="text-sm">
              {order.payment_method ?? "—"}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "default" | "success";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd
        className={cn(
          "tabular-nums",
          tone === "success" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function DefRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm border border-border bg-background text-primary">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}
