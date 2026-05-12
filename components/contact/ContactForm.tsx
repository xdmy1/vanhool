"use client";

import { useState, useTransition, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitContact } from "@/lib/contact/actions";
import { sendWeb3FormsNotification } from "@/lib/notifications/web3forms";
import { cn } from "@/lib/utils/cn";

type Labels = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  message_placeholder: string;
  topic: string;
  topic_general: string;
  topic_part_id: string;
  topic_order: string;
  topic_warranty: string;
  topic_other: string;
  submit: string;
  submitting: string;
  required: string;
  invalid_email: string;
  success_title: string;
  success_body: string;
  error_generic: string;
};

type Topic = "general" | "part_id" | "order" | "warranty" | "other";

export function ContactForm({
  labels,
  initial,
}: {
  labels: Labels;
  initial?: { name?: string; email?: string; phone?: string };
}) {
  const router = useRouter();
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topic, setTopic] = useState<Topic>("general");
  const [success, setSuccess] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      subject: String(fd.get("subject") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
      topic,
    };

    const errs: Record<string, string> = {};
    if (!payload.name || payload.name.length < 2) errs.name = labels.required;
    if (!payload.email.includes("@")) errs.email = labels.invalid_email;
    if (!payload.message || payload.message.length < 5) errs.message = labels.required;
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    startTransition(async () => {
      const res = await submitContact(payload);
      if (!res.ok) {
        toast.error(labels.error_generic);
        setErrors({ root: res.message ?? labels.error_generic });
        return;
      }
      toast.success(labels.success_title);
      (e.target as HTMLFormElement).reset();
      // Fire-and-forget admin email — the message is already saved to
      // contact_messages, so a notification failure must not block the
      // redirect to the thank-you page.
      sendWeb3FormsNotification({
        subject: `[Inter Bus] Mesaj contact — ${payload.topic}`,
        fromName: payload.name,
        replyTo: payload.email,
        message: payload.message,
        fields: {
          Nume: payload.name,
          Email: payload.email,
          Telefon: payload.phone || "—",
          Topic: payload.topic,
          Subiect: payload.subject || "—",
        },
      }).catch(() => {});
      router.push(`/${locale}/thank-you?form=contact`);
    });
  };

  if (success) {
    return (
      <div className="flex flex-col items-center rounded-md border border-success/40 bg-success/5 p-10 text-center">
        <div className="grid size-14 place-items-center rounded-full border border-success/40 bg-success/10 text-success">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold tracking-tight">
          {labels.success_title}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-strong">{labels.success_body}</p>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => setSuccess(false)}
          className="mt-5"
        >
          {labels.submit}
        </Button>
      </div>
    );
  }

  const topics: { id: Topic; label: string }[] = [
    { id: "general", label: labels.topic_general },
    { id: "part_id", label: labels.topic_part_id },
    { id: "order", label: labels.topic_order },
    { id: "warranty", label: labels.topic_warranty },
    { id: "other", label: labels.topic_other },
  ];

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {/* Topic chips */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted">
          {labels.topic}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTopic(t.id)}
              className={cn(
                "rounded-sm border px-3 py-1.5 text-xs transition-colors",
                topic === t.id
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface text-muted-strong hover:border-border-strong",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={labels.name} error={errors.name}>
          <Input name="name" defaultValue={initial?.name ?? ""} required />
        </Field>
        <Field label={labels.email} error={errors.email}>
          <Input
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
            required
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={labels.phone}>
          <Input
            name="phone"
            type="tel"
            placeholder="+373 ..."
            defaultValue={initial?.phone ?? ""}
          />
        </Field>
        <Field label={labels.subject}>
          <Input name="subject" />
        </Field>
      </div>

      <Field label={labels.message} error={errors.message}>
        <textarea
          name="message"
          rows={6}
          required
          minLength={5}
          placeholder={labels.message_placeholder}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary"
        />
      </Field>

      {errors.root ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {errors.root}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full sm:w-auto"
        disabled={pending}
      >
        <Send className="size-4" />
        {pending ? labels.submitting : labels.submit}
      </Button>
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
        {label}
        {error ? <span className="ml-1 text-destructive">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}
