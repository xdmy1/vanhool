import { setRequestLocale } from "next-intl/server";
import { ArrowRight, LogIn, Mail, Phone, Search, Truck, Tag, Headset } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { BrandsMarquee } from "@/components/home/BrandsMarquee";
import { Link } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getCompanyAndBank } from "@/lib/panel/settings/company";
import { localeAlternates } from "@/lib/seo";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// inter-bus.md is a closed B2B platform — the homepage is a presentation +
// login gate, not a public shop. Text is kept in a local per-locale dict (same
// pattern as the old HOME_META) so it stays self-contained.
const T: Record<
  string,
  {
    metaTitle: string;
    metaDesc: string;
    eyebrow: string;
    title1: string;
    title2: string;
    subtitle: string;
    login: string;
    enterShop: string;
    requestAccount: string;
    brandsTitle: string;
    features: Array<{ title: string; body: string }>;
    b2bTitle: string;
    b2bBody: string;
    contactCta: string;
    callCta: string;
  }
> = {
  ro: {
    metaTitle: "Inter Bus — Platformă B2B de piese pentru autobuze și camioane",
    metaDesc:
      "Platformă B2B pentru piese de autobuze, microbuze și vehicule comerciale. Acces pe bază de cont — contactează operatorul pentru înregistrare.",
    eyebrow: "Platformă B2B",
    title1: "Piese originale pentru",
    title2: "autobuze, microbuze și camioane",
    subtitle:
      "Acces pentru parteneri: catalog complet, căutare după cod OEM, prețuri de contract și livrare rapidă în Moldova și Europa. Accesul se face cu cont.",
    login: "Autentificare",
    enterShop: "Intră în magazin",
    requestAccount: "Solicită cont B2B",
    brandsTitle: "Lucrăm cu branduri de top",
    features: [
      { title: "Căutare după cod OEM", body: "Găsești piesa exactă după codul OEM sau al furnizorului, în secunde." },
      { title: "Livrare MD + Europa", body: "Expediere rapidă în toată Moldova și în Europa, direct la tine." },
      { title: "Prețuri de contract", body: "Prețuri B2B și discount dedicat, vizibile după autentificare." },
      { title: "Operator dedicat", body: "Un operator îți gestionează contul, comenzile și ofertele." },
    ],
    b2bTitle: "Nu ai încă un cont?",
    b2bBody:
      "Accesul la catalog și prețuri este doar pentru partenerii cu cont. Contactează operatorul și îți creăm un cont B2B.",
    contactCta: "Contactează operatorul",
    callCta: "Sună acum",
  },
  en: {
    metaTitle: "Inter Bus — B2B parts platform for buses and trucks",
    metaDesc:
      "B2B platform for bus, minibus and commercial vehicle parts. Account-based access — contact the operator to get registered.",
    eyebrow: "B2B platform",
    title1: "Genuine parts for",
    title2: "buses, minibuses and trucks",
    subtitle:
      "Partner access: full catalog, OEM code search, contract pricing and fast delivery across Moldova and Europe. Access requires an account.",
    login: "Sign in",
    enterShop: "Enter shop",
    requestAccount: "Request a B2B account",
    brandsTitle: "We work with top brands",
    features: [
      { title: "Search by OEM code", body: "Find the exact part by OEM or supplier code, in seconds." },
      { title: "MD + Europe delivery", body: "Fast shipping across Moldova and Europe, straight to you." },
      { title: "Contract pricing", body: "B2B prices and dedicated discounts, visible after sign-in." },
      { title: "Dedicated operator", body: "An operator manages your account, orders and quotes." },
    ],
    b2bTitle: "Don't have an account yet?",
    b2bBody:
      "Catalog and pricing are for account holders only. Contact the operator and we'll set up a B2B account for you.",
    contactCta: "Contact the operator",
    callCta: "Call now",
  },
  ru: {
    metaTitle: "Inter Bus — B2B платформа запчастей для автобусов и грузовиков",
    metaDesc:
      "B2B платформа запчастей для автобусов и коммерческого транспорта. Доступ по аккаунту — свяжитесь с оператором для регистрации.",
    eyebrow: "B2B платформа",
    title1: "Оригинальные запчасти для",
    title2: "автобусов, микроавтобусов и грузовиков",
    subtitle:
      "Доступ для партнёров: полный каталог, поиск по OEM-коду, контрактные цены и быстрая доставка по Молдове и Европе. Доступ по аккаунту.",
    login: "Войти",
    enterShop: "В магазин",
    requestAccount: "Запросить B2B аккаунт",
    brandsTitle: "Работаем с ведущими брендами",
    features: [
      { title: "Поиск по OEM-коду", body: "Находите нужную деталь по OEM или коду поставщика за секунды." },
      { title: "Доставка MD + Европа", body: "Быстрая отправка по Молдове и Европе прямо к вам." },
      { title: "Контрактные цены", body: "B2B цены и персональная скидка — видны после входа." },
      { title: "Персональный оператор", body: "Оператор ведёт ваш аккаунт, заказы и предложения." },
    ],
    b2bTitle: "Ещё нет аккаунта?",
    b2bBody:
      "Каталог и цены доступны только владельцам аккаунтов. Свяжитесь с оператором — мы создадим вам B2B аккаунт.",
    contactCta: "Связаться с оператором",
    callCta: "Позвонить",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = T[locale] ?? T.ro;
  return {
    title: { absolute: t.metaTitle },
    description: t.metaDesc,
    alternates: localeAlternates("", locale),
  };
}

const FEATURE_ICONS = [Search, Truck, Tag, Headset];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = T[locale] ?? T.ro;

  const supabase = await createClient();
  const [{ data: { user } }, { company }] = await Promise.all([
    supabase.auth.getUser(),
    getCompanyAndBank(),
  ]);
  const phoneHref = `tel:${company.phone.replace(/\s/g, "")}`;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <Container className="py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              {t.eyebrow}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {t.title1} <span className="text-primary">{t.title2}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-strong md:text-lg">
              {t.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {user ? (
                <Link
                  href="/catalog"
                  locale={locale}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {t.enterShop}
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  locale={locale}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <LogIn className="size-4" />
                  {t.login}
                </Link>
              )}
              <a
                href="#b2b"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-surface px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {t.requestAccount}
              </a>
            </div>
          </div>
        </Container>
        <div className="border-t border-border/60">
          <BrandsMarquee />
        </div>
      </section>

      {/* Features */}
      <section className="py-14 md:py-16">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i] ?? Search;
              return (
                <div
                  key={f.title}
                  className="rounded-lg border border-border bg-surface p-5"
                >
                  <div className="mb-3 grid size-10 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-strong">{f.body}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* B2B account CTA */}
      <section id="b2b" className="border-t border-border bg-surface py-14 md:py-16">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-primary/30 bg-primary/5 p-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t.b2bTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-strong md:text-base">
              {t.b2bBody}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={phoneHref}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Phone className="size-4" />
                {t.callCta} · {company.phone}
              </a>
              <Link
                href="/contact"
                locale={locale}
                className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-surface px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Mail className="size-4" />
                {t.contactCta}
              </Link>
            </div>
            <div className="mt-4 text-xs text-muted">{company.email}</div>
          </div>
        </Container>
      </section>
    </>
  );
}
