import { ArrowUpRight } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { Link } from "@/lib/i18n/routing";

export function CategoryTile({
  icon: Icon,
  label,
  count,
  slug,
  locale,
  countLabel,
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
      className="group relative flex items-center gap-4 rounded-md border border-border bg-surface-elevated p-4 transition-shadow hover:shadow-[var(--shadow-card)]"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold leading-tight text-foreground">
          {label}
        </div>
        <div className="mt-0.5 text-xs text-muted">
          {count.toLocaleString("ro-RO")} {countLabel}
        </div>
      </div>
      <ArrowUpRight className="size-4 shrink-0 text-muted transition-colors group-hover:text-primary" />
    </Link>
  );
}
