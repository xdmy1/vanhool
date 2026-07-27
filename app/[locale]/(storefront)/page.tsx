import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  LogIn,
  Mail,
  Phone,
  Search,
  Truck,
  Tag,
  Headset,
  ShieldCheck,
  PackageCheck,
  UserPlus,
  ClipboardList,
  Cog,
  Disc,
  Wrench,
  Zap,
  Gauge,
  Wind,
  Filter,
  Sofa,
  type LucideIcon,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { BrandsMarquee } from "@/components/home/BrandsMarquee";
import { Link } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getCategoryTree } from "@/lib/db/categories";
import { localeAlternates } from "@/lib/seo";
import type { Category, Locale } from "@/lib/db/types";

// inter-bus.md is a closed B2B platform — the homepage is a rich presentation +
// login gate, not a public shop. Copy lives in a local per-locale dict (same
// pattern as the old HOME_META) so the page stays self-contained.
type Copy = {
  metaTitle: string;
  metaDesc: string;
  eyebrow: string;
  title1: string;
  title2: string;
  subtitle: string;
  trust: string[];
  login: string;
  enterShop: string;
  requestAccount: string;
  stats: Array<{ value: string; label: string }>;
  categoriesTitle: string;
  categoriesSub: string;
  categoriesAll: string;
  servicesTitle: string;
  servicesSub: string;
  services: Array<{ title: string; body: string }>;
  howTitle: string;
  howSub: string;
  steps: Array<{ title: string; body: string }>;
  brandsTitle: string;
  brandsSub: string;
  b2bTitle: string;
  b2bBody: string;
  contactCta: string;
  callCta: string;
  hours: string;
};

const T: Record<string, Copy> = {
  ro: {
    metaTitle: "Inter Bus — Platformă B2B de piese pentru autobuze și camioane",
    metaDesc:
      "Platformă B2B pentru piese de autobuze, microbuze și vehicule comerciale. Catalog cu 127 mărci de vehicule, căutare după cod OEM, livrare rapidă MD + Europa. Acces pe bază de cont.",
    eyebrow: "Platformă B2B · piese comerciale",
    title1: "Piese originale pentru",
    title2: "autobuze, microbuze și camioane",
    subtitle:
      "Partenerul tău pentru piese de vehicule comerciale: catalog extins, căutare după cod OEM, prețuri de contract și livrare rapidă în Moldova și Europa.",
    trust: ["Calitate OEM & aftermarket premium", "Livrare MD + Europa", "Suport tehnic dedicat"],
    login: "Autentificare",
    enterShop: "Intră în magazin",
    requestAccount: "Solicită cont B2B",
    stats: [
      { value: "127", label: "mărci de vehicule" },
      { value: "439", label: "categorii de piese" },
      { value: "60+", label: "branduri premium" },
      { value: "24–72h", label: "livrare MD + Europa" },
    ],
    categoriesTitle: "Game complete de piese",
    categoriesSub: "De la frânare și motor la direcție, electrică și caroserie — pentru toată flota.",
    categoriesAll: "Vezi tot catalogul",
    servicesTitle: "De ce Inter Bus",
    servicesSub: "Tot ce are nevoie un service sau o flotă profesionistă, într-un singur loc.",
    services: [
      { title: "Căutare după cod OEM", body: "Găsești piesa exactă după codul OEM sau al furnizorului, cu mii de cross-references." },
      { title: "Prețuri de contract", body: "Prețuri B2B și discount dedicat pe cont, vizibile după autentificare." },
      { title: "Livrare MD + Europa", body: "Expediere rapidă în toată Moldova și în Europa, direct la tine în service." },
      { title: "Branduri originale", body: "Knorr-Bremse, Wabco, Bosch, Van Hool, SAF, BPW și zeci de alte branduri." },
      { title: "Operator dedicat", body: "Un operator îți gestionează contul, comenzile, ofertele și retururile." },
      { title: "Suport tehnic", body: "Te ajutăm să identifici piesa corectă după vehicul, VIN sau cod." },
    ],
    howTitle: "Cum funcționează",
    howSub: "Trei pași până la prima comandă.",
    steps: [
      { title: "Deschizi cont B2B", body: "Contactezi operatorul și îți creăm un cont cu prețurile tale." },
      { title: "Cauți piesa", body: "După cod OEM, denumire sau marca vehiculului — în secunde." },
      { title: "Comanzi și primești", body: "Plasezi comanda, iar noi o livrăm rapid în MD sau Europa." },
    ],
    brandsTitle: "Branduri cu care lucrăm",
    brandsSub: "Piese de la producători consacrați, echipare originală și aftermarket premium.",
    b2bTitle: "Nu ai încă un cont?",
    b2bBody:
      "Accesul la catalog și prețuri este doar pentru partenerii cu cont. Contactează operatorul și îți creăm un cont B2B.",
    contactCta: "Contactează operatorul",
    callCta: "Sună acum",
    hours: "Luni–Vineri, 09:00–18:00",
  },
  en: {
    metaTitle: "Inter Bus — B2B parts platform for buses and trucks",
    metaDesc:
      "B2B platform for bus, minibus and commercial vehicle parts. Catalog covering 127 vehicle makes, OEM code search, fast delivery across Moldova and Europe. Account-based access.",
    eyebrow: "B2B platform · commercial parts",
    title1: "Genuine parts for",
    title2: "buses, minibuses and trucks",
    subtitle:
      "Your partner for commercial vehicle parts: a wide catalog, OEM code search, contract pricing and fast delivery across Moldova and Europe.",
    trust: ["OEM & premium aftermarket", "MD + Europe delivery", "Dedicated technical support"],
    login: "Sign in",
    enterShop: "Enter shop",
    requestAccount: "Request a B2B account",
    stats: [
      { value: "127", label: "vehicle makes" },
      { value: "439", label: "part categories" },
      { value: "60+", label: "premium brands" },
      { value: "24–72h", label: "delivery MD + Europe" },
    ],
    categoriesTitle: "Full parts range",
    categoriesSub: "From braking and engine to steering, electrics and body — for the whole fleet.",
    categoriesAll: "See the full catalog",
    servicesTitle: "Why Inter Bus",
    servicesSub: "Everything a professional workshop or fleet needs, in one place.",
    services: [
      { title: "Search by OEM code", body: "Find the exact part by OEM or supplier code, with thousands of cross-references." },
      { title: "Contract pricing", body: "B2B prices and account discounts, visible after sign-in." },
      { title: "MD + Europe delivery", body: "Fast shipping across Moldova and Europe, straight to your workshop." },
      { title: "Genuine brands", body: "Knorr-Bremse, Wabco, Bosch, Van Hool, SAF, BPW and dozens more." },
      { title: "Dedicated operator", body: "An operator manages your account, orders, quotes and returns." },
      { title: "Technical support", body: "We help you identify the right part by vehicle, VIN or code." },
    ],
    howTitle: "How it works",
    howSub: "Three steps to your first order.",
    steps: [
      { title: "Open a B2B account", body: "Contact the operator and we set up an account with your pricing." },
      { title: "Search the part", body: "By OEM code, name or vehicle make — in seconds." },
      { title: "Order & receive", body: "Place the order and we deliver fast across MD or Europe." },
    ],
    brandsTitle: "Brands we work with",
    brandsSub: "Parts from established manufacturers, original equipment and premium aftermarket.",
    b2bTitle: "Don't have an account yet?",
    b2bBody:
      "Catalog and pricing are for account holders only. Contact the operator and we'll set up a B2B account for you.",
    contactCta: "Contact the operator",
    callCta: "Call now",
    hours: "Mon–Fri, 09:00–18:00",
  },
  ru: {
    metaTitle: "Inter Bus — B2B платформа запчастей для автобусов и грузовиков",
    metaDesc:
      "B2B платформа запчастей для автобусов и коммерческого транспорта. Каталог по 127 маркам, поиск по OEM-коду, быстрая доставка по Молдове и Европе. Доступ по аккаунту.",
    eyebrow: "B2B платформа · коммерческие запчасти",
    title1: "Оригинальные запчасти для",
    title2: "автобусов, микроавтобусов и грузовиков",
    subtitle:
      "Ваш партнёр по запчастям для коммерческого транспорта: широкий каталог, поиск по OEM-коду, контрактные цены и быстрая доставка по Молдове и Европе.",
    trust: ["OEM и премиум aftermarket", "Доставка MD + Европа", "Техническая поддержка"],
    login: "Войти",
    enterShop: "В магазин",
    requestAccount: "Запросить B2B аккаунт",
    stats: [
      { value: "127", label: "марок техники" },
      { value: "439", label: "категорий запчастей" },
      { value: "60+", label: "премиум брендов" },
      { value: "24–72ч", label: "доставка MD + Европа" },
    ],
    categoriesTitle: "Полный ассортимент",
    categoriesSub: "От тормозов и двигателя до рулевого, электрики и кузова — для всего парка.",
    categoriesAll: "Весь каталог",
    servicesTitle: "Почему Inter Bus",
    servicesSub: "Всё, что нужно профессиональному сервису или автопарку, в одном месте.",
    services: [
      { title: "Поиск по OEM-коду", body: "Находите нужную деталь по OEM или коду поставщика, тысячи кросс-номеров." },
      { title: "Контрактные цены", body: "B2B цены и персональная скидка — видны после входа." },
      { title: "Доставка MD + Европа", body: "Быстрая отправка по Молдове и Европе прямо в ваш сервис." },
      { title: "Оригинальные бренды", body: "Knorr-Bremse, Wabco, Bosch, Van Hool, SAF, BPW и десятки других." },
      { title: "Персональный оператор", body: "Оператор ведёт ваш аккаунт, заказы, предложения и возвраты." },
      { title: "Техподдержка", body: "Поможем подобрать нужную деталь по машине, VIN или коду." },
    ],
    howTitle: "Как это работает",
    howSub: "Три шага до первого заказа.",
    steps: [
      { title: "Открываете B2B аккаунт", body: "Свяжитесь с оператором — создадим аккаунт с вашими ценами." },
      { title: "Ищете деталь", body: "По OEM-коду, названию или марке техники — за секунды." },
      { title: "Заказываете", body: "Оформляете заказ, мы быстро доставляем по MD или Европе." },
    ],
    brandsTitle: "Бренды, с которыми мы работаем",
    brandsSub: "Запчасти от известных производителей, оригинал и премиум aftermarket.",
    b2bTitle: "Ещё нет аккаунта?",
    b2bBody:
      "Каталог и цены доступны только владельцам аккаунтов. Свяжитесь с оператором — создадим B2B аккаунт.",
    contactCta: "Связаться с оператором",
    callCta: "Позвонить",
    hours: "Пн–Пт, 09:00–18:00",
  },
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

const SERVICE_ICONS: LucideIcon[] = [Search, Tag, Truck, ShieldCheck, Headset, PackageCheck];
const STEP_ICONS: LucideIcon[] = [UserPlus, Search, ClipboardList];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  brakes: Disc,
  engine: Cog,
  chassis: Wrench,
  electro: Zap,
  air: Gauge,
  "air-pressure": Gauge,
  couplings: Filter,
  clutch: Cog,
  steering: Wrench,
  cooling: Wind,
  body: ShieldCheck,
  bodywork: ShieldCheck,
  interior: Sofa,
  hoses: Wind,
  filter: Filter,
};

function iconFor(cat: Category): LucideIcon {
  return CATEGORY_ICONS[cat.slug] ?? CATEGORY_ICONS[cat.iconKey as string] ?? Cog;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const t = T[locale] ?? T.ro;

  const supabase = await createClient();
  // Public sales contact = the footer message keys (single source of truth),
  // NOT the fiscal/company settings.
  const [{ data: { user } }, tf, categoryTree] = await Promise.all([
    supabase.auth.getUser(),
    getTranslations("footer"),
    getCategoryTree(loc),
  ]);
  const salesPhone = tf("contact_phone");
  const salesEmail = tf("contact_email");
  const phoneHref = `tel:${salesPhone.replace(/\s/g, "")}`;
  const topCategories = categoryTree.slice(0, 12);

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
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted">
              {t.trust.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Container>

        {/* Stats band */}
        <div className="border-t border-border/60 bg-background">
          <Container>
            <dl className="grid grid-cols-2 divide-x divide-border/60 md:grid-cols-4">
              {t.stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`px-4 py-6 text-center ${i >= 2 ? "border-t border-border/60 md:border-t-0" : ""}`}
                >
                  <dt className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-xs uppercase tracking-wide text-muted">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </div>
      </section>

      {/* Categories showcase */}
      <section className="py-14 md:py-16">
        <Container>
          <SectionHead title={t.categoriesTitle} sub={t.categoriesSub} />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {topCategories.map((cat) => {
              const Icon = iconFor(cat);
              return (
                <Link
                  key={cat.id}
                  href={`/catalog?category=${cat.slug}`}
                  locale={locale}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-foreground group-hover:text-primary">
                    {cat.name}
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href={user ? "/categories" : "/login"}
              locale={locale}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {t.categoriesAll}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Services / why us */}
      <section className="border-t border-border bg-surface py-14 md:py-16">
        <Container>
          <SectionHead title={t.servicesTitle} sub={t.servicesSub} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.services.map((f, i) => {
              const Icon = SERVICE_ICONS[i] ?? Search;
              return (
                <div key={f.title} className="rounded-lg border border-border bg-background p-5">
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

      {/* How it works */}
      <section className="py-14 md:py-16">
        <Container>
          <SectionHead title={t.howTitle} sub={t.howSub} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {t.steps.map((s, i) => {
              const Icon = STEP_ICONS[i] ?? UserPlus;
              return (
                <div key={s.title} className="relative rounded-lg border border-border bg-surface p-6">
                  <div className="absolute right-4 top-4 text-4xl font-bold text-border">
                    {i + 1}
                  </div>
                  <div className="mb-3 grid size-11 place-items-center rounded-md bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-strong">{s.body}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Brands */}
      <section className="border-t border-border bg-surface py-14 md:py-16">
        <Container>
          <SectionHead title={t.brandsTitle} sub={t.brandsSub} center />
        </Container>
        <div className="mt-8">
          <BrandsMarquee />
        </div>
      </section>

      {/* B2B account CTA */}
      <section id="b2b" className="border-t border-border py-14 md:py-16">
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
                {t.callCta} · {salesPhone}
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
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
              <span>{salesEmail}</span>
              <span className="hidden sm:inline">·</span>
              <span>{t.hours}</span>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function SectionHead({
  title,
  sub,
  center = false,
}: {
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : "max-w-2xl"}>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {title}
      </h2>
      {sub ? (
        <p className={`mt-1.5 text-sm text-muted-strong md:text-base ${center ? "mx-auto max-w-2xl" : ""}`}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}
