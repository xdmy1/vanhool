import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  back,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  back?: { href: string; label: string; locale: string };
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="flex flex-col gap-1.5">
        {back ? (
          <Link
            href={back.href as "/admin"}
            locale={back.locale}
            className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            {back.label}
          </Link>
        ) : eyebrow ? (
          <div className="text-xs font-medium text-primary">{eyebrow}</div>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-strong">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
