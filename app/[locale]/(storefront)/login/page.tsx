import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(sp.next ?? `/${locale}/dashboard`);
  }

  const t = await getTranslations("auth");

  return (
    <AuthShell
      eyebrow="LOGIN"
      title={t("login_title")}
      subtitle={t("login_subtitle")}
    >
      <LoginForm
        labels={{
          email: t("email"),
          password: t("password"),
          submit: t("submit_login"),
          forgotPassword: t("forgot_password"),
          noAccount: t("no_account"),
          registerNow: t("register_now"),
          errorInvalid: t("error_invalid_credentials"),
          errorUnknown: t("error_unknown"),
          errorEmailNotConfirmed: t("error_email_not_confirmed"),
          resend: t("resend_confirmation"),
          resendSending: t("resend_sending"),
          resendSent: t("resend_sent"),
          rateLimited: t("resend_rate_limited"),
        }}
      />
    </AuthShell>
  );
}
