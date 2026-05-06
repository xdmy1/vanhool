import { ChevronLeft, ChevronRight } from "lucide-react";

import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function Pagination({
  page,
  totalPages,
  searchParams,
  labels,
  locale,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
  labels: { prev: string; next: string; page: string; of: string };
  locale: string;
}) {
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v === undefined) continue;
      if (Array.isArray(v)) params.set(k, v.join(","));
      else params.set(k, v);
    }
    if (p === 1) params.delete("page");
    else params.set("page", String(p));
    const qs = params.toString();
    return `/catalog${qs ? `?${qs}` : ""}` as `/catalog` | `/catalog?${string}`;
  };

  const pages = pageRange(page, totalPages);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <Link
        
        href={buildHref(Math.max(1, page - 1))}
        locale={locale}
        aria-disabled={page === 1}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-md border border-border bg-surface px-3 text-sm transition-colors",
          page === 1
            ? "pointer-events-none opacity-40"
            : "hover:border-primary/60 hover:text-primary",
        )}
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">{labels.prev}</span>
      </Link>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-muted"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            
            href={buildHref(p)}
            locale={locale}
            className={cn(
              "inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 font-mono text-sm tabular-nums transition-colors",
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-strong hover:border-primary/60 hover:text-primary",
            )}
          >
            {p}
          </Link>
        ),
      )}

      <Link
        
        href={buildHref(Math.min(totalPages, page + 1))}
        locale={locale}
        aria-disabled={page === totalPages}
        className={cn(
          "inline-flex h-10 items-center gap-1 rounded-md border border-border bg-surface px-3 text-sm transition-colors",
          page === totalPages
            ? "pointer-events-none opacity-40"
            : "hover:border-primary/60 hover:text-primary",
        )}
      >
        <span className="hidden sm:inline">{labels.next}</span>
        <ChevronRight className="size-4" />
      </Link>

      <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-muted">
        {labels.page} {page} {labels.of} {totalPages}
      </span>
    </nav>
  );
}

function pageRange(current: number, total: number): (number | "…")[] {
  const pages: (number | "…")[] = [];
  const push = (v: number | "…") => {
    if (pages[pages.length - 1] !== v) pages.push(v);
  };
  const around = 1;
  push(1);
  if (current - around > 2) push("…");
  for (let p = Math.max(2, current - around); p <= Math.min(total - 1, current + around); p++) {
    push(p);
  }
  if (current + around < total - 1) push("…");
  if (total > 1) push(total);
  return pages;
}
