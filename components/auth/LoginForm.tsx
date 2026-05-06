"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { AlertCircle, Eye, EyeOff, Mail, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/lib/i18n/routing";
import { resendSignupConfirmation, signIn } from "@/lib/auth/actions";

type Labels = {
  email: string;
  password: string;
  submit: string;
  forgotPassword: string;
  noAccount: string;
  registerNow: string;
  errorInvalid: string;
  errorUnknown: string;
  errorEmailNotConfirmed: string;
  resend: string;
  resendSending: string;
  resendSent: string;
  rateLimited: string;
};

export function LoginForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [resendPending, startResendTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; root?: string }>({});
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setUnconfirmedEmail(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const next = searchParams.get("next") ?? `/${locale}/dashboard`;

    const fieldErrors: typeof errors = {};
    if (!email) fieldErrors.email = labels.errorUnknown;
    if (!password || password.length < 6) fieldErrors.password = labels.errorUnknown;
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      const result = await signIn({ email, password });
      if (!result.ok) {
        if (result.code === "email_not_confirmed") {
          setUnconfirmedEmail(email);
          toast.error(labels.errorEmailNotConfirmed);
          return;
        }
        const message =
          result.code === "invalid_credentials" ? labels.errorInvalid : labels.errorUnknown;
        setErrors({ root: message });
        toast.error(message);
        return;
      }
      toast.success("✓");
      router.replace(next);
      router.refresh();
    });
  };

  const onResend = () => {
    if (!unconfirmedEmail) return;
    startResendTransition(async () => {
      const res = await resendSignupConfirmation(unconfirmedEmail);
      if (!res.ok) {
        toast.error(
          res.code === "rate_limited" ? labels.rateLimited : labels.errorUnknown,
        );
        return;
      }
      toast.success(labels.resendSent);
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field label={labels.email} error={errors.email}>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>

      <Field label={labels.password} error={errors.password}>
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            tabIndex={-1}
            aria-label="toggle password"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </Field>

      {unconfirmedEmail ? (
        <div className="flex flex-col gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p className="text-foreground">
              {labels.errorEmailNotConfirmed}{" "}
              <span className="font-mono font-semibold">{unconfirmedEmail}</span>
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="self-start uppercase tracking-wider"
            onClick={onResend}
            disabled={resendPending}
          >
            {resendPending ? (
              <RefreshCcw className="size-3.5 animate-spin" />
            ) : (
              <Mail className="size-3.5" />
            )}
            {resendPending ? labels.resendSending : labels.resend}
          </Button>
        </div>
      ) : errors.root ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {errors.root}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-2 uppercase tracking-wider" disabled={pending}>
        {pending ? "…" : labels.submit}
      </Button>

      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <Link href="/contact" locale={locale} className="hover:text-primary">
          {labels.forgotPassword}
        </Link>
        <span>
          {labels.noAccount}{" "}
          <Link href="/register" locale={locale} className="font-semibold text-primary hover:underline">
            {labels.registerNow}
          </Link>
        </span>
      </div>
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
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : null}
    </label>
  );
}
