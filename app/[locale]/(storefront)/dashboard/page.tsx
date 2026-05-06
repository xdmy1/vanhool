import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Calendar, Package, Wallet } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Price } from "@/components/common/Price";
import { createClient } from "@/lib/supabase/server";
import { getMyOrders } from "@/lib/db/orders";
import { routing } from "@/lib/i18n/routing";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { OrdersList } from "@/components/dashboard/OrdersList";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Locale = "ro" | "en" | "ru";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?next=/${locale}/dashboard`);

  const [t, orders, profileRes] = await Promise.all([
    getTranslations("auth"),
    getMyOrders(),
    supabase
      .from("profiles")
      .select("full_name, email, phone, language, created_at")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const profile = profileRes.data ?? null;
  const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);
  const memberSince = profile?.created_at ?? user.created_at;
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";

  const profileInitial = {
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? user.email ?? "",
    phone: profile?.phone ?? "",
    language: ((profile?.language as Locale) ?? (locale as Locale) ?? "ro") as Locale,
  };

  const ordersTab = (
    <OrdersList
      orders={orders}
      locale={locale}
      labels={{
        empty_title: t("dashboard_no_orders"),
        empty_body: t("dashboard_no_orders_body"),
        empty_cta: "Catalog",
        number: t("order_number"),
        date: t("order_date"),
        status: t("order_status"),
        total: t("order_total"),
        items: t("dashboard_orders_count"),
        view: t("dashboard_view_order"),
        status_pending: t("dashboard_status_pending"),
        status_confirmed: t("dashboard_status_confirmed"),
        status_processing: t("dashboard_status_processing"),
        status_shipped: t("dashboard_status_shipped"),
        status_delivered: t("dashboard_status_delivered"),
        status_cancelled: t("dashboard_status_cancelled"),
      }}
    />
  );

  const profileTab = (
    <ProfileForm
      initial={profileInitial}
      labels={{
        fullName: t("first_name") + " / " + t("last_name"),
        email: t("email"),
        phone: t("phone"),
        language: t("language_pref"),
        language_ro: "RO",
        language_en: "EN",
        language_ru: "RU",
        save: t("dashboard_profile_save"),
        saving: "...",
        saved: t("dashboard_profile_saved"),
        required: "*",
        password_section: t("dashboard_password_section"),
        current_password: t("password"),
        new_password: t("dashboard_new_password"),
        confirm_password: t("password_confirm"),
        password_mismatch: t("error_passwords_mismatch"),
        password_too_short: t("dashboard_password_too_short"),
        change_password: t("dashboard_change_password"),
        password_updated: t("dashboard_password_updated"),
        email_locked: t("dashboard_email_locked"),
        error_generic: t("error_unknown"),
      }}
    />
  );

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface/40">
        <Container className="py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-full border border-primary/40 bg-primary/10 font-mono text-base font-bold text-primary">
                {(profile?.full_name ?? user.email ?? "?").charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                  <span className="h-px w-6 bg-primary" />
                  {t("dashboard_title")}
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                  {profile?.full_name ?? user.email}
                </h1>
                <p className="mt-1 font-mono text-xs text-muted">{user.email}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {/* Stats */}
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={Package}
            label={t("dashboard_orders_count")}
            value={String(orders.length)}
          />
          <StatCard
            icon={Wallet}
            label={t("dashboard_total_spent")}
            value={<Price value={totalSpent} size="lg" accent={false} />}
          />
          <StatCard
            icon={Calendar}
            label={t("dashboard_member_since")}
            value={
              memberSince
                ? new Date(memberSince).toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"
            }
          />
        </div>

        <DashboardTabs
          labels={{
            orders: t("dashboard_orders"),
            profile: t("dashboard_profile"),
          }}
          ordersBadge={orders.length}
          ordersTab={ordersTab}
          profileTab={profileTab}
        />
      </Container>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <div className="mb-3 grid size-9 place-items-center rounded-sm border border-primary/30 bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
