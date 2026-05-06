import { ArrowUpRight, Calendar } from "lucide-react";

import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function ModelTile({
  brandSlug,
  modelSlug,
  name,
  yearFrom,
  yearTo,
  bodyType,
  typeCount,
  locale,
  countLabel,
}: {
  brandSlug: string;
  modelSlug: string;
  name: string;
  yearFrom: number | null;
  yearTo: number | null;
  bodyType: string | null;
  typeCount: number;
  locale: string;
  countLabel: string;
}) {
  const yearRange =
    yearFrom && yearTo
      ? `${yearFrom}–${yearTo}`
      : yearFrom
        ? `${yearFrom}+`
        : null;
  return (
    <Link
      href={`/piese-auto/${brandSlug}/${modelSlug}`}
      locale={locale}
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-md border border-border bg-surface p-4 transition-all",
        "hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface-elevated",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold leading-tight">
          {name}
        </div>
        <div className="mt-1 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {yearRange && (
            <span className="flex items-center gap-1">
              <Calendar className="size-3" /> {yearRange}
            </span>
          )}
          {bodyType && <span>{bodyType}</span>}
          <span className="ml-auto text-primary/80">
            {typeCount} {countLabel}
          </span>
        </div>
      </div>
      <ArrowUpRight className="size-4 shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
    </Link>
  );
}
