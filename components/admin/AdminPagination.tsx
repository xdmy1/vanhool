import type { Route } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

/**
 * Pagination controls for admin tables. Generic over the base href so it
 * works for /admin/products, /admin/orders, /admin/customers, etc.
 * Preserves the current query string (search, filters) and just rewrites
 * the `page` param.
 */
export function AdminPagination({
  page,
  totalPages,
  basePath,
  searchParams,
  locale,
}: {
  page: number;
  totalPages: number;
  /** e.g. "/admin/products" */
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  locale: string;
}) {
  if (totalPages <= 1) return null;

  const buildHref = (p: number): Route => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v === undefined || k === "page") continue;
      if (Array.isArray(v)) params.set(k, v.join(","));
      else params.set(k, v);
    }
    if (p !== 1) params.set("page", String(p));
    const qs = params.toString();
    return (qs ? `${basePath}?${qs}` : basePath) as Route;
  };

  const pages = pageRange(page, totalPages);

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
      aria-label="Pagination"
    >
      <span className="text-xs text-muted">
        Pagina {page} din {totalPages}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <Link
          href={buildHref(Math.max(1, page - 1))}
          locale={locale}
          aria-disabled={page === 1}
          className={cn(
            "inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-2.5 text-sm transition-colors",
            page === 1
              ? "pointer-events-none opacity-40"
              : "hover:border-primary/60 hover:text-primary",
          )}
        >
          <ChevronLeft className="size-4" />
        </Link>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-xs text-muted" aria-hidden>
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              locale={locale}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2.5 text-sm tabular-nums transition-colors",
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
            "inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-2.5 text-sm transition-colors",
            page === totalPages
              ? "pointer-events-none opacity-40"
              : "hover:border-primary/60 hover:text-primary",
          )}
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>
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
