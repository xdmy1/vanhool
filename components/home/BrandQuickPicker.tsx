"use client";

import { useState } from "react";
import { ChevronRight, Car } from "lucide-react";

import { useRouter } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/routing";

export type BrandOption = {
  slug: string;
  name: string;
  isPopular: boolean;
};

export function BrandQuickPicker({
  brands,
  locale,
  label,
  placeholder,
  ctaLabel,
  allLabel,
  popularGroup,
  otherGroup,
}: {
  brands: BrandOption[];
  locale: Locale;
  label: string;
  placeholder: string;
  ctaLabel: string;
  allLabel: string;
  popularGroup: string;
  otherGroup: string;
}) {
  const [slug, setSlug] = useState("");
  const router = useRouter();

  const popular = brands.filter((b) => b.isPopular);
  const others = brands.filter((b) => !b.isPopular);

  const go = (target?: string) => {
    const next = target ?? slug;
    if (!next) {
      router.push("/piese-auto");
      return;
    }
    router.push(`/piese-auto/${next}` as "/piese-auto");
  };

  return (
    <div className="mx-auto mt-6 flex w-full max-w-2xl flex-col gap-2 rounded-md border border-border bg-surface-elevated p-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-2 px-1 text-sm font-medium text-muted-strong">
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
        className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
      >
        <option value="">{placeholder}</option>
        {popular.length > 0 ? (
          <optgroup label={popularGroup}>
            {popular.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </optgroup>
        ) : null}
        {others.length > 0 ? (
          <optgroup label={otherGroup}>
            {others.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </optgroup>
        ) : null}
      </select>
      <button
        type="button"
        onClick={() => go()}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[color:var(--primary-hover)]"
      >
        {slug ? ctaLabel : allLabel}
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
