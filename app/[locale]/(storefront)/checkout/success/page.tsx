import { CheckCircle2, Clock } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { getPaymentInfo } from "@/lib/payments/maib/client";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";

export const dynamic = "force-dynamic";

/** maib okUrl return page. maib appends ?orderId=…&payId=…. We verify the real
 *  status via pay-info (never trust the redirect alone) and clear the cart. */
export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string; payId?: string }>;
}) {
  const [{ locale }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("checkout"),
  ]);
  setRequestLocale(locale);

  let paid = false;
  let amount: number | null = null;
  let currency = "MDL";
  if (sp.payId) {
    try {
      const info = await getPaymentInfo(sp.payId);
      paid = String(info.status) === "OK";
      if (info.amount != null) amount = Number(info.amount);
      if (info.currency) currency = String(info.currency);
    } catch {
      // Callback may still be in flight — show the pending state.
    }
  }
  const shortId = sp.orderId ? sp.orderId.slice(0, 8).toUpperCase() : null;

  return (
    <Container className="py-16 md:py-24">
      <ClearCartOnMount />
      <div className="mx-auto max-w-md text-center">
        <div
          className={
            "mx-auto mb-5 flex size-16 items-center justify-center rounded-full " +
            (paid ? "bg-success/15 text-success" : "bg-warning/15 text-warning")
          }
        >
          {paid ? (
            <CheckCircle2 className="size-8" />
          ) : (
            <Clock className="size-8" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {paid ? t("pay_ok_title") : t("pay_pending_title")}
        </h1>
        <p className="mt-2 text-sm text-muted-strong">
          {paid ? t("pay_ok_body") : t("pay_pending_body")}
        </p>
        {shortId ? (
          <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-sm">
            <div className="text-muted">
              {t("pay_order_ref")} <span className="font-mono">#{shortId}</span>
            </div>
            {amount != null ? (
              <div className="mt-1 text-lg font-bold text-foreground">
                {amount.toFixed(2)} {currency}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="mt-8">
          <Button asChild>
            <Link href="/" locale={locale}>
              {t("pay_back_home")}
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
