import { getLocale, getTranslations } from "next-intl/server";
import { Clock, Phone, ShoppingBag, User, Truck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { SearchBar } from "@/components/layout/SearchBar";
import { CartCount } from "@/components/cart/CartCount";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

export async function Navbar() {
  const t = await getTranslations("nav");
  const tAuth = await getTranslations("auth");
  const tf = await getTranslations("footer");
  const th = await getTranslations("home");
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

  const links = [
    { href: "/piese-auto" as const, label: tv("nav_link") },
    { href: "/catalog" as const, label: t("catalog") },
    { href: "/categories" as const, label: t("categories") },
    { href: "/about" as const, label: t("about") },
    { href: "/contact" as const, label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 flex flex-col border-b-2 border-primary/80 bg-background/95 backdrop-blur">
      {/* Top strip — trust & contact */}
      <div className="hidden border-b border-border bg-surface/60 md:block">
        <Container className="flex h-9 items-center justify-between text-[11px] text-muted-strong">
          <div className="flex items-center gap-5 font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3 text-primary" /> {th("trust_fast")}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-primary" /> {th("trust_warranty")}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3 text-primary" /> {tf("contact_hours")}
            </span>
          </div>
          <a
            href={`tel:${tf("contact_phone").replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-muted transition-colors hover:text-primary"
          >
            <Phone className="size-3" />
            <span className="hidden lg:inline">{t("phone_label")}:</span>
            <span className="text-foreground">{tf("contact_phone")}</span>
          </a>
        </Container>
      </div>

      {/* Main bar — logo, search, cart */}
      <Container className="flex h-20 items-center gap-4 md:gap-6">
        <Link
          href="/"
          locale={locale}
          className="group flex shrink-0 items-center gap-3"
          aria-label="Inter Bus"
        >
          <Logo className="h-10 w-auto text-foreground transition group-hover:text-primary md:h-11" />
          <span className="hidden flex-col leading-tight xl:flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
              Piese auto
            </span>
            <span className="text-base font-semibold tracking-tight">Inter Bus</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBar
            placeholder={t("search_placeholder")}
            buttonLabel={t("search_button")}
            size="md"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <LocaleSwitcher />
          <div className="hidden h-8 w-px bg-border sm:block" />
          {user ? (
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
          ) : (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden gap-1.5 font-mono text-xs uppercase tracking-wider sm:inline-flex"
            >
              <Link href="/login" locale={locale}>
                <User className="size-4" />
                <span className="hidden lg:inline">{t("login")}</span>
              </Link>
            </Button>
          )}
          <Button variant="primary" size="md" asChild className="gap-1.5 font-semibold uppercase tracking-wider">
            <Link href="/cart" locale={locale}>
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">{t("cart")}</span>
              <CartCount />
            </Link>
          </Button>
        </div>
      </Container>

      {/* Categories sub-nav */}
      <nav className="hidden border-t border-border bg-surface/60 lg:block">
        <Container className="flex h-11 items-center">
          <ul className="flex items-center gap-0">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  locale={locale}
                  className={cn(
                    "relative flex h-11 items-center px-4 font-mono text-[12px] font-semibold uppercase tracking-[0.15em]",
                    "text-muted-strong transition-colors hover:text-foreground",
                    "after:pointer-events-none after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      {/* Mobile search */}
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
