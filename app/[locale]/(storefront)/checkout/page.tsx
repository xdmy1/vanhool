import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { CheckoutContent } from "@/components/checkout/CheckoutContent";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login?next=/${locale}/checkout`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .maybeSingle();

  const t = await getTranslations("checkout");

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface/40">
        <Container className="py-8">
          <div className="flex items-center gap-2 text-xs text-primary">
            <span className="h-px w-6 bg-primary" />
            CHECKOUT
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {t("page_title")}
          </h1>
        </Container>
      </section>

      <Container className="py-10">
        <CheckoutContent
          locale={locale}
          user={{
            email: profile?.email ?? user.email ?? null,
            fullName: profile?.full_name ?? null,
            phone: profile?.phone ?? null,
          }}
        />
      </Container>
    </div>
  );
}
