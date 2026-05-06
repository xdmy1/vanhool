import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?next=/${locale}/admin`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) redirect(`/${locale}/dashboard`);

  const [tNav, tAuth, tAdmin] = await Promise.all([
    getTranslations("nav"),
    getTranslations("auth"),
    getTranslations("admin"),
  ]);

  // Pre-compute badges (pending orders + new messages + failed Odoo pushes)
  const [
    { count: pendingOrders },
    { count: newMessages },
    { count: odooFailed },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("odoo_sync_error", "is", null)
      .is("odoo_order_id", null),
  ]);

  return (
    <div className="flex min-h-dvh bg-background">
      <AdminSidebar
        locale={locale}
        labels={{
          overview: tAdmin("nav_overview"),
          products: tAdmin("nav_products"),
          categories: tAdmin("nav_categories"),
          orders: tAdmin("nav_orders"),
          promocodes: tAdmin("nav_promocodes"),
          messages: tAdmin("nav_messages"),
          customers: tAdmin("nav_customers"),
          odoo: tAdmin("nav_odoo"),
          back: tAdmin("nav_back_to_site"),
        }}
        badges={{
          orders: pendingOrders ?? 0,
          messages: newMessages ?? 0,
          odooFailed: odooFailed ?? 0,
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          email={user.email ?? ""}
          displayName={profile?.full_name ?? null}
          locale={locale}
          labels={{
            visitSite: tAdmin("visit_site"),
            account: tNav("account"),
            dashboard: tNav("dashboard"),
            admin: tNav("admin"),
            logout: tAuth("logout"),
          }}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
