import Link from "next/link";

import type { ProductAlternativeCodes } from "@/lib/db/products";
import { cn } from "@/lib/utils/cn";

export function ProductAlternatives({
  data,
  locale,
  labels,
}: {
  data: ProductAlternativeCodes;
  locale: string;
  labels: {
    title: string;
    oem: string;
    cross: string;
    empty: string;
  };
}) {
  const hasOem = data.oemCodes.length > 0;
  const hasCross = data.crossReferences.length > 0;

  return (
    <section className="rounded-md border border-border bg-surface">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
          {labels.title}
        </h3>
      </div>
      <div className="flex flex-col gap-4 p-5">
        {!hasOem && !hasCross ? (
          <p className="text-sm text-muted-strong">{labels.empty}</p>
        ) : null}

        {hasOem ? (
          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              {labels.oem}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.oemCodes.map((code) => (
                <CodeChip key={code} code={code} locale={locale} />
              ))}
            </div>
          </div>
        ) : null}

        {hasCross ? (
          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              {labels.cross}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.crossReferences.map((cr, i) => (
                <CodeChip
                  key={`${cr.brand}-${cr.code}-${i}`}
                  brand={cr.brand}
                  code={cr.code}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CodeChip({
  brand,
  code,
  locale,
}: {
  brand?: string;
  code: string;
  locale: string;
}) {
  const href = `/${locale}/catalog?q=${encodeURIComponent(code)}`;
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-border bg-background/40 px-2 py-1 transition-colors hover:border-primary/40 hover:bg-primary/5",
      )}
    >
      {brand ? (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          {brand}
        </span>
      ) : null}
      <span className="font-mono text-xs text-foreground">{code}</span>
    </Link>
  );
}
