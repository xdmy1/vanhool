import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Public self-registration is disabled: inter-bus.md is a closed B2B platform
 * and accounts are provisioned by the operator. Anyone hitting /register is
 * sent to the login page (which carries the "contact operator for a B2B
 * account" note).
 */
export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/login`);
}
