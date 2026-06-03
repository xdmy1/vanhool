import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { PanelSidebar } from "@/components/panel/PanelSidebar";
import { PanelTopbar } from "@/components/panel/PanelTopbar";
import { PanelMobileNav } from "@/components/panel/PanelMobileNav";
import { requirePanelUser } from "@/lib/panel/auth";
import { getActiveBook } from "@/lib/panel/scope";
import { createClient } from "@/lib/supabase/server";

/**
 * Standalone document routes (print preview / printable PO). These bypass
 * the panel chrome (sidebar + topbar) so the page renders edge-to-edge —
 * matches the @page margin: 0 rule in the print stylesheet and avoids the
 * watermarked panel layout being captured by html2canvas during PDF export.
 */
function isStandaloneDocRoute(pathname: string): boolean {
  const segments = pathname.split("?")[0].split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return last === "print" || last === "po";
}

export default async function PanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";
  const standalone = isStandaloneDocRoute(pathname);

  // Auth gate runs in both modes; we just skip the chrome on standalone docs.
  const user = await requirePanelUser(locale);

  if (standalone) {
    return <main className="min-h-dvh bg-background">{children}</main>;
  }

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

  const sidebarLabels = {
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
  };

  return (
    <div className="flex min-h-dvh bg-background">
      <PanelSidebar
        locale={locale}
        labels={sidebarLabels}
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
          mobileNav={
            <PanelMobileNav>
              <PanelSidebar
                locale={locale}
                labels={sidebarLabels}
                badges={{ triagePending: triagePending ?? 0 }}
                compact
              />
            </PanelMobileNav>
          }
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
