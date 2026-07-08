import { XCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";

export const dynamic = "force-dynamic";

/** maib failUrl return page — payment declined/abandoned. No money charged,
 *  stock was never touched; the customer can retry from the cart. */
export default async function CheckoutFailedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, t] = await Promise.all([
    params,
    getTranslations("checkout"),
  ]);
  setRequestLocale(locale);

  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <XCircle className="size-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("pay_failed_title")}
        </h1>
        <p className="mt-2 text-sm text-muted-strong">{t("pay_failed_body")}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/cart" locale={locale}>
              {t("pay_retry")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/" locale={locale}>
              {t("pay_back_home")}
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
