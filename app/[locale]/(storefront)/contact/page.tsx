import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Mail, MapPin, MessageSquare, Phone, Truck } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [tn, tf, tc] = await Promise.all([
    getTranslations("nav"),
    getTranslations("footer"),
    getTranslations("contact"),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let initial: { name?: string; email?: string; phone?: string } | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle();
    initial = {
      name: profile?.full_name ?? undefined,
      email: profile?.email ?? user.email ?? undefined,
      phone: profile?.phone ?? undefined,
    };
  }

  const phone = tf("contact_phone");
  const email = tf("contact_email");
  const address = tf("contact_address");
  const hours = tf("contact_hours");

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-border bg-surface/40">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid-dim opacity-30" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_-20%,rgba(208,73,65,0.15),transparent_60%)]"
        />
        <Container className="py-14 md:py-20">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              <span className="h-px w-6 bg-primary" />
              {tn("contact")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {tc("hero_title")}
            </h1>
            <p className="max-w-2xl text-base text-muted-strong md:text-lg">
              {tc("hero_subtitle")}
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* Form card */}
          <section className="rounded-md border border-border bg-surface p-6 md:p-8">
            <header className="mb-6 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                <MessageSquare className="size-4" />
              </span>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  {tc("form_eyebrow")}
                </div>
                <h2 className="text-xl font-semibold tracking-tight">
                  {tc("form_title")}
                </h2>
              </div>
            </header>
            <ContactForm
              initial={initial}
              labels={{
                name: tc("name"),
                email: tc("email"),
                phone: tc("phone"),
                subject: tc("subject"),
                message: tc("message"),
                message_placeholder: tc("message_placeholder"),
                topic: tc("topic"),
                topic_general: tc("topic_general"),
                topic_part_id: tc("topic_part_id"),
                topic_order: tc("topic_order"),
                topic_warranty: tc("topic_warranty"),
                topic_other: tc("topic_other"),
                submit: tc("submit"),
                submitting: tc("submitting"),
                required: tc("required"),
                invalid_email: tc("invalid_email"),
                success_title: tc("success_title"),
                success_body: tc("success_body"),
                error_generic: tc("error_generic"),
              }}
            />
          </section>

          {/* Contact details */}
          <aside className="flex flex-col gap-4">
            <ContactCard
              icon={Phone}
              eyebrow={tc("phone_label")}
              title={phone}
              subtitle={tc("phone_hint")}
              href={`tel:${phone.replace(/\s/g, "")}`}
            />
            <ContactCard
              icon={Mail}
              eyebrow={tc("email_label")}
              title={email}
              subtitle={tc("email_hint")}
              href={`mailto:${email}`}
            />
            <ContactCard
              icon={MapPin}
              eyebrow={tc("address_label")}
              title={address}
              subtitle={tc("address_hint")}
            />
            <ContactCard
              icon={Clock}
              eyebrow={tc("hours_label")}
              title={hours}
              subtitle={tc("hours_hint")}
            />

            <div className="rounded-md border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
                  <Truck className="size-4" />
                </span>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    {tc("delivery_eyebrow")}
                  </div>
                  <h3 className="mt-1 text-sm font-semibold tracking-tight">
                    {tc("delivery_title")}
                  </h3>
                  <p className="mt-1 text-xs text-muted-strong">
                    {tc("delivery_body")}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  href,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  eyebrow: string;
  title: string;
  subtitle: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-background text-primary transition-colors group-hover:border-primary/40 group-hover:bg-primary/10">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {eyebrow}
        </div>
        <div className="mt-0.5 truncate text-base font-semibold text-foreground">
          {title}
        </div>
        <div className="mt-0.5 text-xs text-muted-strong">{subtitle}</div>
      </div>
    </>
  );

  const className =
    "group flex items-start gap-3 rounded-md border border-border bg-surface p-4 transition-colors hover:border-border-strong";

  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }
  return <div className={className}>{inner}</div>;
}
