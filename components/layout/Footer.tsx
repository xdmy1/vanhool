import { getLocale, getTranslations } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { Link } from "@/lib/i18n/routing";
import { maibConfigured } from "@/lib/payments/maib/client";

export async function Footer() {
  // Card scheme logos + legal line appear only once maib is live — until then
  // the footer is unchanged. (maib requires these displayed when accepting cards.)
  const showPayment = maibConfigured();
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tv = await getTranslations("vehicles");
  const tc = await getTranslations("categories_list");
  const locale = await getLocale();
  const year = new Date().getFullYear();

  const shopLinks = [
    { href: "/catalog" as const, label: tn("catalog") },
    { href: "/categories" as const, label: tn("categories") },
    { href: "/promotions" as const, label: tn("promotions") },
    { href: "/piese-auto" as const, label: tv("nav_link") },
    { href: "/cart" as const, label: tn("cart") },
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
    { href: "/informatii/livrare" as const, label: t("delivery") },
    { href: "/informatii/garantie-si-retur" as const, label: t("warranty") },
  ];
  const legalLinks = [
    { href: "/informatii/termeni-si-conditii" as const, label: t("terms") },
    { href: "/informatii/confidentialitate" as const, label: t("privacy") },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-6 border-b border-border py-8 md:grid-cols-4">
        <ContactBlock icon={MapPin} value={t("contact_address")} />
        <ContactBlock
          icon={Phone}
          value={t("contact_phone")}
          href={`tel:${t("contact_phone").replace(/\s/g, "")}`}
        />
        <ContactBlock
          icon={Mail}
          value={t("contact_email")}
          href={`mailto:${t("contact_email")}`}
        />
        <ContactBlock icon={Clock} value={t("contact_hours")} />
      </Container>

      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link
              href="/"
              locale={locale}
              className="inline-flex items-center gap-3 text-foreground"
              aria-label="Inter Bus"
            >
              <Logo className="h-10 w-auto text-foreground" />
              <span className="text-base font-semibold">Inter Bus</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-strong">{t("tagline")}</p>
          </div>

          <FooterColumn title={t("section_shop")} links={shopLinks} locale={locale} />
          <FooterColumn title={t("section_support")} links={supportLinks} locale={locale} />

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
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

        <div className="mt-10 border-t border-border pt-6">
          {/* Accepted card schemes + legal line — shown only once maib is live.
              maib requires the maib + international payment system logos + the
              legal identity (IDNO / legal name) to be displayed. Replace the
              placeholder SVGs in /public/payment with the official brand kit. */}
          {showPayment ? (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-muted">
                {t("secure_payment")}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/payment/visa.svg" alt="Visa" width={40} height={26} className="h-6 w-auto rounded" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/payment/mastercard.svg" alt="Mastercard" width={40} height={26} className="h-6 w-auto rounded" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/payment/maib.svg" alt="maib" width={40} height={26} className="h-6 w-auto rounded" />
            </div>
          ) : null}
          <div className="flex flex-col gap-3 text-xs text-muted md:flex-row md:items-center md:justify-between">
            <div>
              <div>
                © {year} {t("brand")}. {t("rights")}
              </div>
              {showPayment ? (
                <div className="mt-1">
                  {t("legal_name")} · {t("idno")} · {t("contact_address")}
                </div>
              ) : null}
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
              <span className="text-muted">inter-bus.md</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function ContactBlock({
  icon: Icon,
  value,
  href,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 truncate text-sm text-foreground">{value}</div>
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
  links: {
    href:
      | "/catalog"
      | "/categories"
      | "/cart"
      | "/about"
      | "/contact"
      | "/login"
      | "/piese-auto"
      | "/promotions"
      | "/informatii/confidentialitate"
      | "/informatii/termeni-si-conditii"
      | "/informatii/garantie-si-retur"
      | "/informatii/livrare";
    label: string;
  }[];
  locale: string;
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-foreground">{title}</h4>
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
