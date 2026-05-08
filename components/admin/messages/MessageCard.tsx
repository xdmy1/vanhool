"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, BookOpen, CheckCheck, Mail, Phone, Reply, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import {
  updateMessageStatus,
  type MessageStatus,
} from "@/lib/admin/messages/actions";
import type { AdminMessageRow } from "@/lib/admin/queries";
import { cn } from "@/lib/utils/cn";

const STATUS_TONES: Record<string, string> = {
  new: "border-primary/40 bg-primary/10 text-primary",
  reading: "border-warning/40 bg-warning/10 text-warning",
  replied: "border-success/40 bg-success/10 text-success",
  archived: "border-border bg-accent-dark text-muted",
};

type Labels = {
  status_new: string;
  status_reading: string;
  status_replied: string;
  status_archived: string;
  topic: string;
  reply_email: string;
  mark_read: string;
  mark_replied: string;
  archive: string;
  reopen: string;
  error: string;
};

export function MessageCard({
  message,
  locale,
  labels,
}: {
  message: AdminMessageRow;
  locale: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<MessageStatus>(
    (message.status as MessageStatus) ?? "new",
  );

  const setStatusOptimistic = (next: MessageStatus) => {
    const prev = status;
    setStatus(next);
    startTransition(async () => {
      const res = await updateMessageStatus(message.id, next);
      if (!res.ok) {
        toast.error(res.message ?? labels.error);
        setStatus(prev);
        return;
      }
      router.refresh();
    });
  };

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const formatted = message.created_at
    ? new Date(message.created_at).toLocaleString(dateLocale, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const statusLabel = (s: MessageStatus): string => {
    switch (s) {
      case "new":
        return labels.status_new;
      case "reading":
        return labels.status_reading;
      case "replied":
        return labels.status_replied;
      case "archived":
        return labels.status_archived;
    }
  };

  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(
    message.subject ? `Re: ${message.subject}` : `Re: Inter Bus contact`,
  )}`;

  return (
    <article
      className={cn(
        "rounded-md border bg-surface p-5 transition-opacity",
        status === "new" ? "border-primary/40" : "border-border",
        pending && "opacity-60",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{formatted}</span>
            <span className="rounded-sm border border-border bg-accent-dark px-1.5 py-0.5 text-[9px] text-muted-strong">
              {message.topic ?? "general"}
            </span>
          </div>
          <h3 className="mt-1 truncate text-base font-semibold tracking-tight">
            {message.name}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-strong">
            <a
              href={`mailto:${message.email}`}
              className="inline-flex items-center gap-1 hover:text-primary"
            >
              <Mail className="size-3" />
              {message.email}
            </a>
            {message.phone ? (
              <a
                href={`tel:${message.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                <Phone className="size-3" />
                {message.phone}
              </a>
            ) : null}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-sm border px-2 py-0.5 text-xs",
            STATUS_TONES[status] ?? "border-border bg-accent-dark text-muted",
          )}
        >
          {statusLabel(status)}
        </span>
      </header>

      {message.subject ? (
        <div className="mt-3 text-xs text-muted">
          {message.subject}
        </div>
      ) : null}

      <p className="mt-3 whitespace-pre-wrap text-sm text-muted-strong">{message.message}</p>

      <footer className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={replyHref}
          className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/20"
        >
          <Reply className="size-3" />
          {labels.reply_email}
        </a>
        {status === "new" ? (
          <ActionBtn
            icon={BookOpen}
            label={labels.mark_read}
            onClick={() => setStatusOptimistic("reading")}
          />
        ) : null}
        {status !== "replied" ? (
          <ActionBtn
            icon={CheckCheck}
            label={labels.mark_replied}
            onClick={() => setStatusOptimistic("replied")}
          />
        ) : null}
        {status !== "archived" ? (
          <ActionBtn
            icon={Archive}
            label={labels.archive}
            onClick={() => setStatusOptimistic("archived")}
          />
        ) : (
          <ActionBtn
            icon={RotateCcw}
            label={labels.reopen}
            onClick={() => setStatusOptimistic("new")}
          />
        )}
      </footer>
    </article>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted-strong transition-colors hover:border-border-strong hover:text-foreground"
    >
      <Icon className="size-3" />
      {label}
    </button>
  );
}
