import { ArrowRight, Fuel, Gauge } from "lucide-react";

import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

export function EngineRow({
  brandSlug,
  modelSlug,
  typeSlug,
  name,
  powerKw,
  powerHp,
  capacityCc,
  fuel,
  yearFrom,
  yearTo,
  engineCode,
  locale,
}: {
  brandSlug: string;
  modelSlug: string;
  typeSlug: string;
  name: string;
  powerKw: number | null;
  powerHp: number | null;
  capacityCc: number | null;
  fuel: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  engineCode: string | null;
  locale: string;
}) {
  const yearRange =
    yearFrom && yearTo
      ? `${yearFrom}–${yearTo}`
      : yearFrom
        ? `${yearFrom}+`
        : null;
  return (
    <Link
      href={`/piese-auto/${brandSlug}/${modelSlug}/${typeSlug}`}
      locale={locale}
      className={cn(
        "group flex items-center gap-4 border-b border-border px-4 py-3 transition-colors",
        "hover:bg-surface-elevated",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <span className="text-[15px] font-semibold tracking-tight">{name}</span>
          {engineCode && (
            <span className="text-[11px] text-muted">
              {engineCode}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-strong">
          {(powerKw || powerHp) && (
            <span className="flex items-center gap-1">
              <Gauge className="size-3 text-primary" />
              {powerKw ? `${powerKw} kW` : ""}
              {powerKw && powerHp ? " · " : ""}
              {powerHp ? `${powerHp} HP` : ""}
            </span>
          )}
          {capacityCc && <span>{(capacityCc / 1000).toFixed(1)} L</span>}
          {fuel && (
            <span className="flex items-center gap-1">
              <Fuel className="size-3" /> {fuel}
            </span>
          )}
          {yearRange && <span>{yearRange}</span>}
        </div>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
