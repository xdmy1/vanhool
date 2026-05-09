import { getLocale, getTranslations } from "next-intl/server";
import { ShoppingBag, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { SearchBar } from "@/components/layout/SearchBar";
import { CartCount } from "@/components/cart/CartCount";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";

export async function Navbar() {
  const t = await getTranslations("nav");
  const tAuth = await getTranslations("auth");
  const tv = await getTranslations("vehicles");
  const locale = await getLocale();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, full_name")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = !!profile?.is_admin;
    displayName = profile?.full_name ?? user.email ?? null;
  }

  const mobileLinks = [
    { href: "/catalog" as const, label: t("catalog") },
    { href: "/categories" as const, label: t("categories") },
    { href: "/promotions" as const, label: t("promotions") },
    { href: "/piese-auto" as const, label: tv("nav_link") },
    { href: "/about" as const, label: t("about") },
    { href: "/contact" as const, label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-3 md:h-20 md:gap-6">
        <Link
          href="/"
          locale={locale}
          className="flex shrink-0 items-center gap-2"
          aria-label="Inter Bus"
        >
          <Logo className="h-9 w-auto text-foreground transition hover:text-primary md:h-10" />
          <span className="hidden text-base font-semibold tracking-tight md:inline">
            Inter Bus
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBar
            placeholder={t("search_placeholder")}
            buttonLabel={t("search_button")}
            size="md"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2">
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
          {user ? (
            <div className="hidden md:block">
              <AccountMenu
                email={user.email ?? ""}
                displayName={displayName}
                isAdmin={isAdmin}
                locale={locale}
                labels={{
                  account: t("account"),
                  dashboard: t("dashboard"),
                  admin: t("admin"),
                  logout: tAuth("logout"),
                }}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden gap-1.5 md:inline-flex"
            >
              <Link href="/login" locale={locale}>
                <User className="size-4" />
                <span className="hidden lg:inline">{t("login")}</span>
              </Link>
            </Button>
          )}
          <Button variant="primary" size="md" asChild className="gap-1.5">
            <Link href="/cart" locale={locale}>
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">{t("cart")}</span>
              <CartCount />
            </Link>
          </Button>
          <MobileNav
            locale={locale}
            user={user ? { displayName, email: user.email ?? "" } : null}
            isAdmin={isAdmin}
            links={mobileLinks}
            authedLabels={{
              dashboard: t("dashboard"),
              admin: t("admin"),
              logout: tAuth("logout"),
            }}
            guestLabels={{
              login: t("login"),
              register: t("register"),
            }}
          />
        </div>
      </Container>

      <div className="border-t border-border p-3 md:hidden">
        <SearchBar
          placeholder={t("search_placeholder")}
          buttonLabel={t("search_button")}
          size="md"
        />
      </div>
    </header>
  );
}
