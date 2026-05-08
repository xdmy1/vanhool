import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  Package,
  Phone,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Price } from "@/components/common/Price";
import { Link } from "@/lib/i18n/routing";
import { getOrderById } from "@/lib/db/orders";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/lib/i18n/routing";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { cn } from "@/lib/utils/cn";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const PAYMENT_ICONS = {
  paynet: CreditCard,
  cash: Banknote,
  transfer: FileText,
} as const;

export default async function ThankYouPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  if (!sp.order) redirect(`/${locale}/catalog`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?next=/${locale}/thank-you?order=${sp.order}`);

  const order = await getOrderById(sp.order);
  if (!order || (order.userId && order.userId !== user.id)) {
    redirect(`/${locale}/dashboard`);
  }

  const [t, tCart] = await Promise.all([
    getTranslations("checkout"),
    getTranslations("cart"),
  ]);

  const paymentKey = (order.paymentMethod ?? "cash") as keyof typeof PAYMENT_ICONS;
  const PaymentIcon = PAYMENT_ICONS[paymentKey] ?? Banknote;
  const paymentLabel = t(`payment_${paymentKey}` as "payment_cash");
  const paymentHint = t(`success_payment_${paymentKey}` as "success_payment_cash");

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const formattedDate = new Date(order.createdAt).toLocaleString(dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-background">
      <ClearCartOnMount />
      <section className="relative overflow-hidden border-b border-border bg-surface/40">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.18),transparent_60%)]"
        />
        <Container className="py-14 md:py-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="mb-6 grid size-16 place-items-center rounded-full border border-success/40 bg-success/10 text-success">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="text-xs text-success">
              {t("success_subtitle")}
            </div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
              {t("success_title")}
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-strong">
              {t("success_email_hint", { email: order.customerEmail })}
            </p>

            <div className="mt-6 flex flex-col items-center gap-1 rounded-md border border-border bg-surface px-6 py-4">
              <span className="text-xs text-muted">
                {t("success_order_number")}
              </span>
              <span className="text-2xl font-bold text-foreground">
                #{order.shortId}
              </span>
              <span className="text-xs text-muted">
                {formattedDate}
              </span>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-5">
            {/* Items */}
            <section className="rounded-md border border-border bg-surface p-5 md:p-6">
              <header className="mb-5 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                  <Package className="size-4" />
                </span>
                <div>
                  <div className="text-xs text-muted">
                    {t("section_review")}
                  </div>
                  <h2 className="text-base font-semibold tracking-tight">
                    {t("summary_title")}
                  </h2>
                </div>
              </header>

              <ul className="divide-y divide-border">
                {order.items.map((item) => (
                  <li
                    key={`${item.productId}-${item.partCode}`}
                    className="flex items-start gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="grid size-12 shrink-0 place-items-center rounded-sm border border-border bg-accent-dark text-xs text-muted">
                      {item.partCode.slice(0, 3) || item.brand.slice(0, 3) || "—"}
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
                      <div className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">
                        {item.name}
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        {item.quantity} × €{item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold tabular-nums">
                      €{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Delivery info */}
            <section className="rounded-md border border-border bg-surface p-5 md:p-6">
              <header className="mb-5 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                  <Truck className="size-4" />
                </span>
                <div>
                  <div className="text-xs text-muted">
                    {t("section_delivery")}
                  </div>
                  <h2 className="text-base font-semibold tracking-tight">
                    {order.customerName}
                  </h2>
                </div>
              </header>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <DefRow icon={Mail} label={t("email")} value={order.customerEmail} />
                <DefRow icon={Phone} label={t("phone")} value={order.customerPhone} />
                <DefRow
                  icon={Truck}
                  label={t("address")}
                  value={order.customerAddress}
                  className="sm:col-span-2"
                />
                {order.notes ? (
                  <DefRow
                    icon={FileText}
                    label={t("notes")}
                    value={order.notes}
                    className="sm:col-span-2"
                  />
                ) : null}
              </dl>
            </section>

            {/* Payment */}
            <section className="rounded-md border border-border bg-surface p-5 md:p-6">
              <header className="mb-4 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                  <PaymentIcon className="size-4" />
                </span>
                <div>
                  <div className="text-xs text-muted">
                    {t("section_payment")}
                  </div>
                  <h2 className="text-base font-semibold tracking-tight">{paymentLabel}</h2>
                </div>
              </header>
              <p className="rounded-sm border border-primary/30 bg-primary/5 p-3 text-sm text-muted-strong">
                {paymentHint}
              </p>
            </section>
          </div>

          {/* Summary */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-md border border-border bg-surface p-5">
              <h3 className="mb-4 text-[11px] font-semibold">
                {t("summary_title")}
              </h3>
              <dl className="space-y-2 text-sm">
                <Row label={tCart("subtotal")} value={`€${order.subtotal.toFixed(2)}`} />
                {order.discount > 0 ? (
                  <Row
                    label={tCart("discount")}
                    value={`-€${order.discount.toFixed(2)}`}
                    tone="success"
                  />
                ) : null}
                <Row
                  label={tCart("shipping")}
                  value={
                    order.shipping === 0 ? (
                      <span className="text-success">{tCart("free")}</span>
                    ) : (
                      `€${order.shipping.toFixed(2)}`
                    )
                  }
                />
              </dl>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                <span className="text-[11px] font-semibold">
                  {tCart("total")}
                </span>
                <Price value={order.total} size="xl" />
              </div>
            </div>

            <Button asChild size="lg" className="w-full">
              <Link href="/dashboard" locale={locale}>
                <ShoppingBag className="size-4" />
                {t("success_dashboard")}
              </Link>
            </Button>
            <Button
              asChild
              size="md"
              variant="secondary"
              className="w-full"
            >
              <Link href="/catalog" locale={locale}>
                <ArrowLeft className="size-4" />
                {t("success_continue")}
              </Link>
            </Button>
          </aside>
        </div>
      </Container>
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
        <dt className="text-xs text-muted">
          {label}
        </dt>
        <dd className="mt-0.5 break-words text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}
