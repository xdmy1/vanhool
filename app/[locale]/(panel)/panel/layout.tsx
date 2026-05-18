import { getTranslations, setRequestLocale } from "next-intl/server";

import { PanelSidebar } from "@/components/panel/PanelSidebar";
import { PanelTopbar } from "@/components/panel/PanelTopbar";
import { requirePanelUser } from "@/lib/panel/auth";
import { getActiveBook } from "@/lib/panel/scope";
import { createClient } from "@/lib/supabase/server";

export default async function PanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requirePanelUser(locale);
  const scope = await getActiveBook(undefined);
  const supabase = await createClient();

  const [tNav, tAuth, tPanel, { count: triagePending }] = await Promise.all([
    getTranslations("nav"),
    getTranslations("auth"),
    getTranslations("panel"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("source", "storefront")
      .is("triaged_at", null)
      .neq("status", "cancelled"),
  ]);

  return (
    <div className="flex min-h-dvh bg-background">
      <PanelSidebar
        locale={locale}
        labels={{
          overview: tPanel("nav_overview"),
          comenziSite: tPanel("nav_comenzi_site"),
          clienti: tPanel("nav_clienti"),
          produse: tPanel("nav_produse"),
          stock: tPanel("nav_stock"),
          vanzareNoua: tPanel("nav_vanzare_noua"),
          achizitii: tPanel("nav_achizitii"),
          proforme: tPanel("nav_proforme"),
          facturi: tPanel("nav_facturi"),
          fiseLivrare: tPanel("nav_fise_livrare"),
          cheltuieli: tPanel("nav_cheltuieli"),
          cheltuieliCash: tPanel("nav_cheltuieli_cash"),
          rapoarte: tPanel("nav_rapoarte"),
          statistici: tPanel("nav_statistici"),
          exportDocumente: tPanel("nav_export_documente"),
          setari: tPanel("nav_setari"),
          back: tPanel("nav_back_to_admin"),
        }}
        badges={{ triagePending: triagePending ?? 0 }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <PanelTopbar
          email={user.email}
          displayName={user.fullName}
          locale={locale}
          scope={scope}
          labels={{
            visitSite: tPanel("visit_site"),
            backToAdmin: tPanel("back_to_admin"),
            account: tNav("account"),
            dashboard: tNav("dashboard"),
            admin: tNav("admin"),
            logout: tAuth("logout"),
            conta1: tPanel("conta1"),
            conta2: tPanel("conta2"),
            lockedHint: tPanel("scope_locked_hint"),
          }}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
