"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ArrowDownUp } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const SORTS = ["featured", "name-asc", "price-asc", "price-desc", "newest"] as const;
type Sort = (typeof SORTS)[number];

export function CatalogSort({
  labels,
}: {
  labels: Record<"sort" | Sort, string>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const current = (searchParams.get("sort") ?? "featured") as Sort;

  const onChange = (sort: Sort) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "featured") params.delete("sort");
    else params.set("sort", sort);
    params.delete("page");
    const qs = params.toString();
    router.push(`/${locale}/catalog${qs ? `?${qs}` : ""}`);
  };

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm">
      <ArrowDownUp className="size-3.5 text-muted" />
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted md:inline">
        {labels.sort}
      </span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value as Sort)}
        className={cn(
          "cursor-pointer bg-transparent pr-5 text-sm outline-none",
          "[&>option]:bg-surface-elevated [&>option]:text-foreground",
        )}
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {labels[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
