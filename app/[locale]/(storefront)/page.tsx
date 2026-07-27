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
  Check,
  type LucideIcon,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { BrandsMarquee } from "@/components/home/BrandsMarquee";
import { CountUp } from "@/components/home/CountUp";
import { Link } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { localeAlternates } from "@/lib/seo";
import type { Locale } from "@/lib/db/types";

// inter-bus.md is a closed B2B platform — the homepage is a rich presentation +
// login gate. Copy lives in a local per-locale dict so the page is self-contained.
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
  catalogEyebrow: string;
  catalogTitle: string;
  catalogBody: string;
  catalogPoints: string[];
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
    catalogEyebrow: "Catalog electronic",
    catalogTitle: "Mii de referințe în catalogul tău electronic",
    catalogBody:
      "Cel mai bun instrument pentru service-ul și flota ta: căutare rapidă după cod OEM, disponibilitate în timp real, prețurile tale de contract și comandă în câteva clickuri.",
    catalogPoints: [
      "Căutare după cod OEM, denumire sau marca vehiculului",
      "Prețuri de contract și discount pe cont",
      "Comandă online, livrare MD + Europa",
    ],
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
    catalogEyebrow: "Electronic catalog",
    catalogTitle: "Thousands of references in your electronic catalog",
    catalogBody:
      "The best tool for your workshop and fleet: fast OEM code search, real-time availability, your contract prices and ordering in a few clicks.",
    catalogPoints: [
      "Search by OEM code, name or vehicle make",
      "Contract prices and account discounts",
      "Order online, delivery MD + Europe",
    ],
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
    catalogEyebrow: "Электронный каталог",
    catalogTitle: "Тысячи артикулов в вашем электронном каталоге",
    catalogBody:
      "Лучший инструмент для сервиса и автопарка: быстрый поиск по OEM-коду, наличие в реальном времени, ваши контрактные цены и заказ в пару кликов.",
    catalogPoints: [
      "Поиск по OEM-коду, названию или марке техники",
      "Контрактные цены и скидка на аккаунт",
      "Заказ онлайн, доставка MD + Европа",
    ],
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

function nameFor(
  row: { name_ro: string | null; name_en: string | null; name_ru: string | null },
  loc: Locale,
): string {
  if (loc === "en") return row.name_en ?? row.name_ro ?? "";
  if (loc === "ru") return row.name_ru ?? row.name_ro ?? "";
  return row.name_ro ?? row.name_en ?? "";
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
  // Public sales contact = footer message keys (single source of truth). Real
  // category photos + product images drive the visual sections.
  const [{ data: { user } }, tf, catRes, prodRes] = await Promise.all([
    supabase.auth.getUser(),
    getTranslations("footer"),
    supabase
      .from("categories")
      .select("slug, name_ro, name_en, name_ru, image_url")
      .not("image_url", "is", null)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(8),
    supabase
      .from("products")
      .select("name_ro, name_en, name_ru, image_url")
      .not("image_url", "is", null)
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .limit(6),
  ]);

  const salesPhone = tf("contact_phone");
  const salesEmail = tf("contact_email");
  const phoneHref = `tel:${salesPhone.replace(/\s/g, "")}`;
  const catTiles = (catRes.data ?? []).map((c) => ({
    slug: c.slug as string,
    name: nameFor(c, loc),
    image: c.image_url as string,
  }));
  const showcase = (prodRes.data ?? [])
    .map((p) => p.image_url as string)
    .filter(Boolean)
    .slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-surface via-surface to-background">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-6rem] -z-0 h-[26rem] w-[52rem] max-w-full -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 opacity-[0.15] [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]"
        />
        <Container className="relative py-16 md:py-24">
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
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  {t.enterShop}
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  locale={locale}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
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

        {/* Stats band with count-up */}
        <div className="relative border-t border-border/60 bg-gradient-to-b from-background to-surface/40">
          <Container>
            <dl className="grid grid-cols-2 divide-x divide-border/60 md:grid-cols-4">
              {t.stats.map((s, i) => (
                <div
                  key={s.label}
                  className={`px-4 py-6 text-center ${i >= 2 ? "border-t border-border/60 md:border-t-0" : ""}`}
                >
                  <dt>
                    <CountUp
                      value={s.value}
                      className="bg-gradient-to-br from-foreground to-primary bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-4xl"
                    />
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

      {/* Category photo tiles */}
      {catTiles.length > 0 ? (
        <section className="py-14 md:py-16">
          <Container>
            <SectionHead title={t.categoriesTitle} sub={t.categoriesSub} />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {catTiles.map((cat, i) => (
                <Link
                  key={cat.slug}
                  href={`/catalog?category=${cat.slug}`}
                  locale={locale}
                  style={{ animationDelay: `${i * 55}ms` }}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-primary/40 motion-safe:animate-[ib-fade-up_0.5s_ease-out_backwards]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-[650ms] ease-out group-hover:scale-110"
                  />
                  {/* readability gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/0" />
                  {/* brand tint on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5">
                    <span className="text-sm font-semibold leading-tight text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
                      {cat.name}
                    </span>
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-primary">
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
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
      ) : null}

      {/* Electronic catalog feature card */}
      <section className="border-t border-border bg-surface py-14 md:py-16">
        <Container>
          <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#1f2733] to-[#0f1620] shadow-md">
            <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <span className="h-px w-6 bg-primary" />
                  {t.catalogEyebrow}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {t.catalogTitle}
                </h2>
                <p className="mt-3 text-sm text-white/70 md:text-base">{t.catalogBody}</p>
                <ul className="mt-5 space-y-2">
                  {t.catalogPoints.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-white/85">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                        <Check className="size-3.5" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <Link
                    href={user ? "/catalog" : "/login"}
                    locale={locale}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  >
                    {user ? t.enterShop : t.login}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>

              {/* Real product images as the visual */}
              {showcase.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {showcase.map((src, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="size-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      {/* Services / why us */}
      <section className="py-14 md:py-16">
        <Container>
          <SectionHead title={t.servicesTitle} sub={t.servicesSub} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.services.map((f, i) => {
              const Icon = SERVICE_ICONS[i] ?? Search;
              return (
                <div
                  key={f.title}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md motion-safe:animate-[ib-fade-up_0.5s_ease-out_backwards]"
                >
                  <div className="mb-3 grid size-11 place-items-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-sm transition-transform group-hover:scale-105">
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
      <section className="border-t border-border bg-surface py-14 md:py-16">
        <Container>
          <SectionHead title={t.howTitle} sub={t.howSub} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {t.steps.map((s, i) => {
              const Icon = STEP_ICONS[i] ?? UserPlus;
              return (
                <div
                  key={s.title}
                  className="relative overflow-hidden rounded-xl border border-border bg-background p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="absolute right-3 top-2 text-6xl font-bold text-primary/10">
                    {i + 1}
                  </div>
                  <div className="mb-3 grid size-11 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-sm">
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
      <section className="py-14 md:py-16">
        <Container>
          <SectionHead title={t.brandsTitle} sub={t.brandsSub} center />
        </Container>
        <div className="mt-8">
          <BrandsMarquee />
        </div>
      </section>

      {/* B2B account CTA */}
      <section id="b2b" className="border-t border-border bg-surface py-14 md:py-16">
        <Container>
          <div className="mx-auto max-w-2xl rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/[0.03] p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t.b2bTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-strong md:text-base">
              {t.b2bBody}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={phoneHref}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
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
