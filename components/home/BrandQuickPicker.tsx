"use client";

import { useState } from "react";
import { Car, ChevronRight } from "lucide-react";

import { useRouter } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/routing";

export type BrandOption = {
  slug: string;
  name: string;
  productCount: number;
};

/**
 * Hero brand picker: select a make, jump straight to /catalog filtered
 * by that vehicle make. Only makes that have at least one linked active
 * product are passed in (see listVehicleMakesForFilter), so the dropdown
 * never leads to a dead-end empty grid.
 */
export function BrandQuickPicker({
  brands,
  locale,
  label,
  placeholder,
  ctaLabel,
  allLabel,
}: {
  brands: BrandOption[];
  locale: Locale;
  label: string;
  placeholder: string;
  ctaLabel: string;
  allLabel: string;
}) {
  const [slug, setSlug] = useState("");
  const router = useRouter();

  const go = (target?: string) => {
    const next = target ?? slug;
    if (!next) {
      router.push("/piese-auto");
      return;
    }
    router.push(
      `/catalog?vehicleMake=${encodeURIComponent(next)}` as "/catalog",
    );
  };

  return (
    <div className="mt-2 flex w-full flex-col gap-1.5 rounded-md border border-border bg-surface-elevated p-1.5 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:gap-2">
      <div className="flex items-center gap-2 px-2 text-sm font-medium text-muted-strong">
        <Car className="size-4 text-primary" />
        <span>{label}</span>
      </div>
      <select
        value={slug}
        onChange={(e) => {
          const v = e.target.value;
          setSlug(v);
          if (v) go(v);
        }}
        className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none transition-colors focus:border-primary"
      >
        <option value="">{placeholder}</option>
        {brands.map((b) => (
          <option key={b.slug} value={b.slug}>
            {b.name} ({b.productCount})
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => go()}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[color:var(--primary-hover)]"
      >
        {slug ? ctaLabel : allLabel}
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
