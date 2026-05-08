"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { X, Tag, Wallet, Boxes, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/lib/db/types";

type Labels = {
  filters: string;
  apply: string;
  reset: string;
  category: string;
  priceRange: string;
  from: string;
  to: string;
  inStock: string;
  featured: string;
  searchHint: string;
};

export function CatalogFilters({
  categories,
  labels,
}: {
  categories: Category[];
  labels: Labels;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const initial = useMemo(() => {
    const cats = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
    return {
      q: searchParams.get("q") ?? "",
      categories: new Set(cats),
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      inStock: searchParams.get("inStock") === "1",
      featured: searchParams.get("featured") === "1",
    };
  }, [searchParams]);

  const [q, setQ] = useState(initial.q);
  const [selected, setSelected] = useState<Set<string>>(new Set(initial.categories));
  const [minPrice, setMinPrice] = useState(initial.minPrice);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice);
  const [inStock, setInStock] = useState(initial.inStock);
  const [featured, setFeatured] = useState(initial.featured);

  const toggleCategory = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    if (q.trim()) params.set("q", q.trim());
    if (selected.size > 0) params.set("category", [...selected].join(","));
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock) params.set("inStock", "1");
    if (featured) params.set("featured", "1");
    const qs = params.toString();
    router.push(`/${locale}/catalog${qs ? `?${qs}` : ""}`);
  };

  const onReset = () => {
    setQ("");
    setSelected(new Set());
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setFeatured(false);
    router.push(`/${locale}/catalog`);
  };

  const hasAny =
    q || selected.size > 0 || minPrice || maxPrice || inStock || featured;

  return (
    <form
      onSubmit={onSubmit}
      className="sticky top-32 flex flex-col gap-5 rounded-md border border-border bg-surface p-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold text-foreground">
          {labels.filters}
        </h2>
        {hasAny ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-primary"
          >
            <X className="size-3" /> {labels.reset}
          </button>
        ) : null}
      </div>

      <FilterGroup icon={Tag} title={labels.searchHint}>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={labels.searchHint}
          type="search"
        />
      </FilterGroup>

      <FilterGroup icon={Boxes} title={labels.category}>
        <ul className="-mx-1 max-h-72 space-y-0.5 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const checked = selected.has(cat.slug);
            return (
              <li key={cat.slug}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                    checked
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-strong hover:bg-surface-elevated hover:text-foreground",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(cat.slug)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded-sm border transition-colors",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface",
                    )}
                  >
                    {checked ? (
                      <svg viewBox="0 0 10 8" className="size-2.5 fill-none stroke-current stroke-2">
                        <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </span>
                  <span className="flex-1 truncate">{cat.name}</span>
                  <span className="text-[10px] text-muted">
                    {cat.productCount}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup icon={Wallet} title={labels.priceRange}>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder={labels.from}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className=""
          />
          <span className="text-muted">–</span>
          <Input
            type="number"
            inputMode="decimal"
            placeholder={labels.to}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className=""
          />
        </div>
      </FilterGroup>

      <FilterGroup icon={Star} title="">
        <div className="flex flex-col gap-2 text-sm">
          <Toggle
            label={labels.inStock}
            checked={inStock}
            onChange={setInStock}
          />
          <Toggle
            label={labels.featured}
            checked={featured}
            onChange={setFeatured}
          />
        </div>
      </FilterGroup>

      <Button type="submit" variant="primary" size="md" className="">
        {labels.apply}
      </Button>
    </form>
  );
}

function FilterGroup({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {title ? (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted">
          <Icon className="size-3" />
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-muted-strong">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={cn(
          "grid size-4 place-items-center rounded-sm border transition-colors",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-surface",
        )}
      >
        {checked ? (
          <svg viewBox="0 0 10 8" className="size-2.5 fill-none stroke-current stroke-2">
            <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      <span>{label}</span>
    </label>
  );
}
