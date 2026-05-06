import { ArrowUpRight } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function CategoryTile({
  icon: Icon,
  label,
  count,
  slug,
  locale,
  countLabel,
  accent = false,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  count: number;
  slug: string;
  locale: string;
  countLabel: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={`/catalog?category=${slug}`}
      locale={locale}
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-md border bg-surface p-4 transition-all",
        accent
          ? "border-primary/50 bg-gradient-to-br from-primary/10 via-surface to-surface"
          : "border-border hover:border-primary/60",
        "hover:-translate-y-0.5 hover:bg-surface-elevated",
      )}
    >
      <span
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-md border transition-colors",
          accent
            ? "border-primary/40 bg-primary/15 text-primary"
            : "border-border bg-accent-dark text-primary group-hover:border-primary/40",
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold leading-tight text-foreground">
          {label}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {count.toLocaleString("ro-RO")} {countLabel}
        </div>
      </div>
      <ArrowUpRight className="size-4 shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
    </Link>
  );
}
