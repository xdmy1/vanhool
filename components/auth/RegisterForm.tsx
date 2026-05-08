"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/lib/i18n/routing";
import { signUp } from "@/lib/auth/actions";
import type { Locale } from "@/lib/i18n/routing";
import { CheckEmailPanel } from "./CheckEmailPanel";

type Labels = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
  passwordConfirm: string;
  submit: string;
  haveAccount: string;
  loginNow: string;
  termsAccept: string;
  marketingAccept: string;
  errorEmailExists: string;
  errorPasswordsMismatch: string;
  errorUnknown: string;
  registerCheckEmail: string;
  checkEmailTitle: string;
  checkEmailBodyPrefix: string;
  checkEmailBodySuffix: string;
  checkEmailSpamHint: string;
  resend: string;
  resendSending: string;
  resendSent: string;
  rateLimited: string;
  backToLogin: string;
};

export function RegisterForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  if (pendingEmail) {
    return (
      <CheckEmailPanel
        email={pendingEmail}
        locale={locale}
        labels={{
          title: labels.checkEmailTitle,
          body_prefix: labels.checkEmailBodyPrefix,
          body_suffix: labels.checkEmailBodySuffix,
          spam_hint: labels.checkEmailSpamHint,
          resend: labels.resend,
          resend_sending: labels.resendSending,
          resend_sent: labels.resendSent,
          rate_limited: labels.rateLimited,
          back_to_login: labels.backToLogin,
          generic_error: labels.errorUnknown,
        }}
      />
    );
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const data = {
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      company: String(fd.get("company") ?? "").trim(),
      password: String(fd.get("password") ?? ""),
      passwordConfirm: String(fd.get("passwordConfirm") ?? ""),
      terms: fd.get("terms") === "on",
      marketingOptIn: fd.get("marketing") === "on",
    };

    const errs: Record<string, string> = {};
    if (!data.firstName) errs.firstName = "*";
    if (!data.lastName) errs.lastName = "*";
    if (!data.email || !data.email.includes("@")) errs.email = "*";
    if (data.password.length < 8) errs.password = "≥ 8";
    if (data.password !== data.passwordConfirm) errs.passwordConfirm = labels.errorPasswordsMismatch;
    if (!data.terms) errs.terms = "*";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    startTransition(async () => {
      const result = await signUp({
        ...data,
        language: locale,
      });
      if (!result.ok) {
        const msg =
          result.code === "email_exists"
            ? labels.errorEmailExists
            : labels.errorUnknown;
        setErrors({ root: msg });
        toast.error(msg);
        return;
      }
      if (result.requiresEmailConfirmation) {
        setPendingEmail(data.email);
        toast.success(labels.registerCheckEmail);
        return;
      }
      toast.success(labels.registerCheckEmail);
      router.replace(`/${locale}/dashboard`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <Field label={labels.firstName} error={errors.firstName}>
          <Input name="firstName" autoComplete="given-name" required />
        </Field>
        <Field label={labels.lastName} error={errors.lastName}>
          <Input name="lastName" autoComplete="family-name" required />
        </Field>
      </div>

      <Field label={labels.email} error={errors.email}>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>

      <Field label={labels.phone}>
        <Input name="phone" type="tel" autoComplete="tel" placeholder="+373 ..." />
      </Field>

      <Field label={labels.company}>
        <Input name="company" autoComplete="organization" />
      </Field>

      <Field label={labels.password} error={errors.password}>
        <div className="relative">
          <Input
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            tabIndex={-1}
            aria-label="toggle password"
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      <Field label={labels.passwordConfirm} error={errors.passwordConfirm}>
        <Input
          name="passwordConfirm"
          type={showPw ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-strong">
        <input
          type="checkbox"
          name="terms"
          required
          className="mt-0.5 size-4 accent-primary"
        />
        <span>
          {labels.termsAccept}
          {errors.terms ? <span className="ml-1 text-destructive">*</span> : null}
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-strong">
        <input type="checkbox" name="marketing" className="mt-0.5 size-4 accent-primary" />
        <span>{labels.marketingAccept}</span>
      </label>

      {errors.root ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {errors.root}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-2" disabled={pending}>
        {pending ? "…" : labels.submit}
      </Button>

      <p className="text-center text-xs text-muted">
        {labels.haveAccount}{" "}
        <Link href="/login" locale={locale} className="font-semibold text-primary hover:underline">
          {labels.loginNow}
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">
        {label} {error ? <span className="text-destructive">{error}</span> : null}
      </span>
      {children}
    </label>
  );
}
