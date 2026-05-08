"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword, updateProfile } from "@/lib/profile/actions";
import { cn } from "@/lib/utils/cn";

type Locale = "ro" | "en" | "ru";

type Labels = {
  fullName: string;
  email: string;
  phone: string;
  language: string;
  language_ro: string;
  language_en: string;
  language_ru: string;
  save: string;
  saving: string;
  saved: string;
  required: string;
  password_section: string;
  current_password: string;
  new_password: string;
  confirm_password: string;
  password_mismatch: string;
  password_too_short: string;
  change_password: string;
  password_updated: string;
  email_locked: string;
  error_generic: string;
};

export function ProfileForm({
  initial,
  labels,
}: {
  initial: {
    fullName: string;
    email: string;
    phone: string;
    language: Locale;
  };
  labels: Labels;
}) {
  const [pending, startTransition] = useTransition();
  const [pwPending, startPwTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [language, setLanguage] = useState<Locale>(initial.language);

  const onSaveProfile = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      language,
    };
    if (!payload.fullName || payload.fullName.length < 2) {
      setErrors({ fullName: labels.required });
      return;
    }
    startTransition(async () => {
      const res = await updateProfile(payload);
      if (!res.ok) {
        toast.error(labels.error_generic);
        setErrors({ root: res.message ?? labels.error_generic });
        return;
      }
      toast.success(labels.saved);
    });
  };

  const onChangePw = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwErrors({});
    const fd = new FormData(e.currentTarget);
    const payload = {
      newPassword: String(fd.get("newPassword") ?? ""),
      confirm: String(fd.get("confirm") ?? ""),
    };
    const errs: Record<string, string> = {};
    if (payload.newPassword.length < 8) errs.newPassword = labels.password_too_short;
    if (payload.newPassword !== payload.confirm) errs.confirm = labels.password_mismatch;
    if (Object.keys(errs).length > 0) {
      setPwErrors(errs);
      return;
    }
    startPwTransition(async () => {
      const res = await changePassword(payload);
      if (!res.ok) {
        toast.error(labels.error_generic);
        setPwErrors({ root: res.message ?? labels.error_generic });
        return;
      }
      toast.success(labels.password_updated);
      (e.target as HTMLFormElement).reset();
    });
  };

  const langs: { code: Locale; label: string }[] = [
    { code: "ro", label: labels.language_ro },
    { code: "en", label: labels.language_en },
    { code: "ru", label: labels.language_ru },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Profile section */}
      <form
        onSubmit={onSaveProfile}
        className="flex flex-col gap-4 rounded-md border border-border bg-surface p-6"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={labels.fullName} error={errors.fullName}>
            <Input name="fullName" defaultValue={initial.fullName} required />
          </Field>
          <Field label={labels.phone}>
            <Input name="phone" type="tel" defaultValue={initial.phone} />
          </Field>
        </div>

        <Field label={labels.email}>
          <Input
            value={initial.email}
            disabled
            className="cursor-not-allowed bg-accent-dark"
          />
          <span className="text-xs text-muted">
            {labels.email_locked}
          </span>
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-muted">
            {labels.language}
          </span>
          <div className="flex gap-1.5">
            {langs.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs transition-colors",
                  language === l.code
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-strong hover:border-border-strong",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {errors.root ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
            {errors.root}
          </p>
        ) : null}

        <Button
          type="submit"
          size="md"
          className="self-start"
          disabled={pending}
        >
          <Save className="size-4" />
          {pending ? labels.saving : labels.save}
        </Button>
      </form>

      {/* Password section */}
      <form
        onSubmit={onChangePw}
        className="flex flex-col gap-4 rounded-md border border-border bg-surface p-6"
      >
        <div>
          <h3 className="text-[11px] font-semibold">
            {labels.password_section}
          </h3>
        </div>

        <Field label={labels.new_password} error={pwErrors.newPassword}>
          <div className="relative">
            <Input
              name="newPassword"
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

        <Field label={labels.confirm_password} error={pwErrors.confirm}>
          <Input
            name="confirm"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
          />
        </Field>

        {pwErrors.root ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
            {pwErrors.root}
          </p>
        ) : null}

        <Button
          type="submit"
          size="md"
          variant="secondary"
          className="self-start"
          disabled={pwPending}
        >
          {pwPending ? labels.saving : labels.change_password}
        </Button>
      </form>
    </div>
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
        {label}
        {error ? <span className="ml-1 text-destructive">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
