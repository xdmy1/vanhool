import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { CartContent } from "@/components/cart/CartContent";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [tNav, tCart] = await Promise.all([
    getTranslations("nav"),
    getTranslations("cart"),
  ]);

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface/40">
        <Container className="py-8">
          <div className="flex items-center gap-2 text-xs text-primary">
            <span className="h-px w-6 bg-primary" />
            {tNav("cart")}
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {tCart("page_title")}
          </h1>
        </Container>
      </section>

      <Container className="py-10">
        <CartContent locale={locale} />
      </Container>
    </div>
  );
}
