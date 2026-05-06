import { getLocale, getTranslations } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { Link } from "@/lib/i18n/routing";

export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("categories_list");
  const locale = await getLocale();
  const year = new Date().getFullYear();

  const shopLinks = [
    { href: "/catalog" as const, label: tn("catalog") },
    { href: "/categories" as const, label: tn("categories") },
    { href: "/cart" as const, label: tn("cart") },
    { href: "/login" as const, label: tn("login") },
  ];
  const categoryLinks = [
    { slug: "brakes", label: tc("brakes") },
    { slug: "engine", label: tc("engine") },
    { slug: "chassis", label: tc("chassis") },
    { slug: "electro", label: tc("electro") },
    { slug: "air-pressure", label: tc("air") },
    { slug: "cooling", label: tc("cooling") },
  ];
  const supportLinks = [
    { href: "/contact" as const, label: tn("contact") },
    { href: "/about" as const, label: t("delivery") },
    { href: "/about" as const, label: t("warranty") },
    { href: "/about" as const, label: t("returns") },
  ];
  const legalLinks = [
    { href: "/about" as const, label: t("terms") },
    { href: "/about" as const, label: t("privacy") },
    { href: "/about" as const, label: t("cookies") },
  ];
  const payments = ["VISA", "MASTERCARD", "PAYNET", "TRANSFER"];

  return (
    <footer className="border-t border-border bg-background">
      {/* Top info strip */}
      <div className="border-b border-border bg-surface/60">
        <Container className="grid gap-4 py-8 md:grid-cols-4 md:gap-6">
          <ContactBlock icon={MapPin} label="LOCAȚIE" value={t("contact_address")} />
          <ContactBlock
            icon={Phone}
            label="TELEFON"
            value={t("contact_phone")}
            href={`tel:${t("contact_phone").replace(/\s/g, "")}`}
          />
          <ContactBlock
            icon={Mail}
            label="EMAIL"
            value={t("contact_email")}
            href={`mailto:${t("contact_email")}`}
          />
          <ContactBlock icon={Clock} label="PROGRAM" value={t("contact_hours")} />
        </Container>
      </div>

      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand + tagline */}
          <div className="md:col-span-2">
            <Link
              href="/"
              locale={locale}
              className="inline-flex items-center gap-3 text-foreground"
              aria-label="Inter Bus"
            >
              <Logo className="h-10 w-auto text-foreground" />
              <span className="flex flex-col leading-tight">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
                  Inter Bus
                </span>
                <span className="text-base font-semibold">piese-auto</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm text-muted-strong">{t("tagline")}</p>

            {/* Payment methods */}
            <div className="mt-6">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                {t("payment_methods")}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {payments.map((p) => (
                  <span
                    key={p}
                    className="rounded-sm border border-border bg-surface px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-muted-strong"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <FooterColumn title={t("section_shop")} links={shopLinks} locale={locale} />
          <FooterColumn title={t("section_support")} links={supportLinks} locale={locale} />

          {/* Categories list */}
          <div>
            <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              {tn("categories")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-strong">
              {categoryLinks.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/catalog?category=${cat.slug}`}
                    locale={locale}
                    className="transition-colors hover:text-foreground"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <div>
            © {year} {t("brand")}. {t("rights")}
          </div>
          <div className="flex items-center gap-4">
            {legalLinks.map((l, i) => (
              <Link
                key={`${l.href}-${i}`}
                href={l.href}
                locale={locale}
                className="transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <span className="font-mono uppercase tracking-[0.25em] text-muted">
              interbus.md
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function ContactBlock({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-background text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          {label}
        </div>
        <div className="mt-0.5 truncate text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="transition-colors hover:text-primary">
        {content}
      </a>
    );
  }
  return content;
}

function FooterColumn({
  title,
  links,
  locale,
}: {
  title: string;
  links: { href: "/catalog" | "/categories" | "/cart" | "/about" | "/contact" | "/login"; label: string }[];
  locale: string;
}) {
  return (
    <div>
      <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-muted-strong">
        {links.map((l, i) => (
          <li key={`${l.href}-${i}`}>
            <Link
              href={l.href}
              locale={locale}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
