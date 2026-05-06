import { ArrowUpRight } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function VehicleCategoryTile({
  icon: Icon,
  label,
  count,
  brandSlug,
  modelSlug,
  engineSlug,
  categorySlug,
  locale,
  countLabel,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  count: number;
  brandSlug: string;
  modelSlug: string;
  engineSlug: string;
  categorySlug: string;
  locale: string;
  countLabel: string;
}) {
  return (
    <Link
      href={`/piese-auto/${brandSlug}/${modelSlug}/${engineSlug}/${categorySlug}`}
      locale={locale}
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-md border border-border bg-surface p-4 transition-all",
        "hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface-elevated",
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-md border border-border bg-accent-dark text-primary transition-colors group-hover:border-primary/40">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold leading-tight">
          {label}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {count} {countLabel}
        </div>
      </div>
      <ArrowUpRight className="size-4 shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
    </Link>
  );
}
