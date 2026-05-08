"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Mail, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { resendSignupConfirmation } from "@/lib/auth/actions";

type Labels = {
  title: string;
  body_prefix: string;
  body_suffix: string;
  spam_hint: string;
  resend: string;
  resend_sending: string;
  resend_sent: string;
  rate_limited: string;
  back_to_login: string;
  generic_error: string;
};

export function CheckEmailPanel({
  email,
  locale,
  labels,
}: {
  email: string;
  locale: string;
  labels: Labels;
}) {
  const [pending, startTransition] = useTransition();
  const [sentAt, setSentAt] = useState<number | null>(null);

  const onResend = () => {
    startTransition(async () => {
      const res = await resendSignupConfirmation(email);
      if (!res.ok) {
        toast.error(
          res.code === "rate_limited" ? labels.rate_limited : labels.generic_error,
        );
        return;
      }
      toast.success(labels.resend_sent);
      setSentAt(Date.now());
    });
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="grid size-14 place-items-center rounded-full border border-success/40 bg-success/10 text-success">
        <Mail className="size-6" />
      </div>
      <h2 className="mt-4 text-xl font-bold tracking-tight">{labels.title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-strong">
        {labels.body_prefix}{" "}
        <span className="font-semibold text-foreground">{email}</span>
        {" "}
        {labels.body_suffix}
      </p>
      <p className="mt-2 text-xs text-muted">
        {labels.spam_hint}
      </p>

      <Button
        type="button"
        size="md"
        variant="secondary"
        className="mt-6"
        onClick={onResend}
        disabled={pending}
      >
        {sentAt ? <CheckCircle2 className="size-4" /> : <RefreshCcw className="size-4" />}
        {pending ? labels.resend_sending : labels.resend}
      </Button>

      <Link
        href="/login"
        locale={locale}
        className="mt-6 text-xs text-muted transition-colors hover:text-primary"
      >
        ← {labels.back_to_login}
      </Link>
    </div>
  );
}
