import { ArrowUpRight } from "lucide-react";

import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function BrandTile({
  slug,
  name,
  modelCount,
  locale,
  countLabel,
  popular = false,
}: {
  slug: string;
  name: string;
  modelCount: number;
  locale: string;
  countLabel: string;
  popular?: boolean;
}) {
  return (
    <Link
      href={`/piese-auto/${slug}`}
      locale={locale}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-md border bg-surface p-3 transition-all",
        popular
          ? "border-primary/40 hover:border-primary/70 hover:bg-surface-elevated"
          : "border-border hover:border-primary/60 hover:bg-surface-elevated",
        "hover:-translate-y-0.5",
      )}
      aria-label={name}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-md border font-mono text-xs font-bold uppercase tracking-tight",
          popular
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-border bg-accent-dark text-foreground/80 group-hover:border-primary/40 group-hover:text-primary",
        )}
      >
        {name.slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold leading-tight">
          {name}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {modelCount} {countLabel}
        </div>
      </div>
      <ArrowUpRight className="size-3.5 shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
    </Link>
  );
}
