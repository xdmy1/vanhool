import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Award,
  CheckCircle2,
  Clock,
  Headphones,
  Mail,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [tn, ta, tf] = await Promise.all([
    getTranslations("nav"),
    getTranslations("about"),
    getTranslations("footer"),
  ]);

  const stats = [
    { value: "5000+", label: ta("stat_parts") },
    { value: "10+", label: ta("stat_years") },
    { value: "24h", label: ta("stat_delivery") },
    { value: "12", label: ta("stat_warranty_months") },
  ];

  const values = [
    {
      icon: Package,
      title: ta("value_stock_title"),
      body: ta("value_stock_body"),
    },
    {
      icon: ShieldCheck,
      title: ta("value_genuine_title"),
      body: ta("value_genuine_body"),
    },
    {
      icon: Headphones,
      title: ta("value_support_title"),
      body: ta("value_support_body"),
    },
    {
      icon: Wrench,
      title: ta("value_expertise_title"),
      body: ta("value_expertise_body"),
    },
  ];

  const policies = [
    {
      id: "delivery",
      icon: Truck,
      eyebrow: ta("policy_delivery_eyebrow"),
      title: ta("policy_delivery_title"),
      points: [
        ta("policy_delivery_point_1"),
        ta("policy_delivery_point_2"),
        ta("policy_delivery_point_3"),
        ta("policy_delivery_point_4"),
      ],
    },
    {
      id: "warranty",
      icon: ShieldCheck,
      eyebrow: ta("policy_warranty_eyebrow"),
      title: ta("policy_warranty_title"),
      points: [
        ta("policy_warranty_point_1"),
        ta("policy_warranty_point_2"),
        ta("policy_warranty_point_3"),
      ],
    },
    {
      id: "returns",
      icon: RotateCcw,
      eyebrow: ta("policy_returns_eyebrow"),
      title: ta("policy_returns_title"),
      points: [
        ta("policy_returns_point_1"),
        ta("policy_returns_point_2"),
        ta("policy_returns_point_3"),
      ],
    },
  ];

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="border-b border-border bg-surface">
        <Container className="py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="flex items-center gap-2 text-xs text-primary">
                <span className="h-px w-6 bg-primary" />
                {tn("about")}
              </div>
              <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                {ta("hero_title")}
              </h1>
              <p className="mt-5 max-w-2xl text-base text-muted-strong md:text-lg">
                {ta("hero_subtitle")}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg" className="">
                  <Link href="/catalog" locale={locale}>
                    {ta("cta_catalog")}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="">
                  <Link href="/contact" locale={locale}>
                    {ta("cta_contact")}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stat block */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col rounded-md border border-border bg-surface p-5"
                >
                  <span className="text-3xl font-bold tabular-nums tracking-tight text-primary">
                    {s.value}
                  </span>
                  <span className="mt-1 text-xs text-muted">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* VALUES */}
      <section className="border-b border-border">
        <Container className="py-14 md:py-20">
          <div className="mb-10">
            <div className="text-xs text-primary">
              {ta("values_eyebrow")}
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              {ta("values_title")}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-strong">{ta("values_subtitle")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="flex flex-col rounded-md border border-border bg-surface p-6"
              >
                <span className="grid size-10 place-items-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                  <v.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm text-muted-strong">{v.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* STORY */}
      <section className="border-b border-border bg-surface/30">
        <Container className="py-14 md:py-20">
          <div className="grid gap-12 md:grid-cols-[1fr_1.3fr]">
            <div>
              <div className="text-xs text-primary">
                {ta("story_eyebrow")}
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {ta("story_title")}
              </h2>
              <div className="mt-6 flex items-start gap-3 rounded-md border border-border bg-surface p-4 text-sm text-muted-strong">
                <Award className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{ta("story_quote")}</span>
              </div>
            </div>
            <div className="space-y-4 text-base text-muted-strong">
              <p>{ta("story_p1")}</p>
              <p>{ta("story_p2")}</p>
              <p>{ta("story_p3")}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* POLICIES */}
      <section className="border-b border-border">
        <Container className="py-14 md:py-20">
          <div className="mb-10 flex flex-col gap-2">
            <div className="text-xs text-primary">
              {ta("policies_eyebrow")}
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {ta("policies_title")}
            </h2>
            <p className="max-w-2xl text-muted-strong">{ta("policies_subtitle")}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {policies.map((p) => (
              <article
                key={p.id}
                id={p.id}
                className="flex flex-col rounded-md border border-border bg-surface p-6"
              >
                <span className="grid size-10 place-items-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                  <p.icon className="size-5" />
                </span>
                <div className="mt-4 text-xs text-muted">
                  {p.eyebrow}
                </div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">{p.title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-strong">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* CONTACT CTA */}
      <section className="border-b border-border bg-surface/30">
        <Container className="py-14 md:py-20">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="text-xs text-primary">
                {ta("contact_eyebrow")}
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {ta("contact_title")}
              </h2>
              <p className="mt-3 max-w-xl text-muted-strong">{ta("contact_subtitle")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="">
                  <Link href="/contact" locale={locale}>
                    {ta("cta_contact")}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className=""
                >
                  <a href={`tel:${tf("contact_phone").replace(/\s/g, "")}`}>
                    <Phone className="size-4" />
                    {tf("contact_phone")}
                  </a>
                </Button>
              </div>
            </div>
            <ul className="space-y-3 self-center">
              <ContactRow icon={Phone} label={tf("contact_phone")} hint={tn("phone_label")} />
              <ContactRow icon={Mail} label={tf("contact_email")} hint="Email" />
              <ContactRow icon={MapPin} label={tf("contact_address")} hint="HQ" />
              <ContactRow icon={Clock} label={tf("contact_hours")} hint="Program" />
            </ul>
          </div>
        </Container>
      </section>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  hint,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  hint: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-md border border-border bg-surface p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-background text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-xs text-muted">
          {hint}
        </div>
        <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{label}</div>
      </div>
    </li>
  );
}
