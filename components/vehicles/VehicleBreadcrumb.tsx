import { ChevronRight, Home } from "lucide-react";

import { Link } from "@/lib/i18n/routing";

type Crumb = {
  label: string;
  /** Pre-built URL path (without locale prefix). Omit to render as the leaf (current page). */
  href?: string;
};

export function VehicleBreadcrumb({
  crumbs,
  locale,
  rootLabel,
}: {
  crumbs: Crumb[];
  locale: string;
  rootLabel: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-xs text-muted"
    >
      <Link
        href="/"
        locale={locale}
        className="flex items-center gap-1 transition-colors hover:text-primary"
      >
        <Home className="size-3" />
      </Link>
      <ChevronRight className="size-3 shrink-0" />
      <Link
        href="/piese-auto"
        locale={locale}
        className="transition-colors hover:text-primary"
      >
        {rootLabel}
      </Link>
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="size-3 shrink-0" />
          {c.href ? (
            <Link
              href={c.href}
              locale={locale}
              className="transition-colors hover:text-primary"
            >
              {c.label}
            </Link>
          ) : (
            <span className="text-foreground">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
