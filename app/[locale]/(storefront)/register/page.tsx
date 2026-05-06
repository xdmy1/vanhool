import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/lib/i18n/routing";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RegisterPage({
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
  if (user) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("auth");

  return (
    <AuthShell
      eyebrow="SIGN UP"
      title={t("register_title")}
      subtitle={t("register_subtitle")}
    >
      <RegisterForm
        labels={{
          firstName: t("first_name"),
          lastName: t("last_name"),
          email: t("email"),
          phone: t("phone"),
          company: t("company"),
          password: t("password"),
          passwordConfirm: t("password_confirm"),
          submit: t("submit_register"),
          haveAccount: t("have_account"),
          loginNow: t("login_now"),
          termsAccept: t("terms_accept"),
          marketingAccept: t("marketing_accept"),
          errorEmailExists: t("error_email_exists"),
          errorPasswordsMismatch: t("error_passwords_mismatch"),
          errorUnknown: t("error_unknown"),
          registerCheckEmail: t("register_check_email"),
          checkEmailTitle: t("check_email_title"),
          checkEmailBodyPrefix: t("check_email_body_prefix"),
          checkEmailBodySuffix: t("check_email_body_suffix"),
          checkEmailSpamHint: t("check_email_spam_hint"),
          resend: t("resend_confirmation"),
          resendSending: t("resend_sending"),
          resendSent: t("resend_sent"),
          rateLimited: t("resend_rate_limited"),
          backToLogin: t("back_to_login"),
        }}
      />
    </AuthShell>
  );
}
