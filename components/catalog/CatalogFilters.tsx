"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronDown, X, Tag, Wallet, Boxes, Star, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { CategoryTreeNode } from "@/lib/db/categories";
import type { VehicleMakeForFilter } from "@/lib/db/vehicles";

type Labels = {
  filters: string;
  apply: string;
  reset: string;
  category: string;
  vehicleMake: string;
  priceRange: string;
  from: string;
  to: string;
  inStock: string;
  featured: string;
  searchHint: string;
};

export function CatalogFilters({
  categoryTree,
  vehicleMakes,
  labels,
}: {
  categoryTree: CategoryTreeNode[];
  vehicleMakes: VehicleMakeForFilter[];
  labels: Labels;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const initial = useMemo(() => {
    const cats = searchParams.get("category")?.split(",").filter(Boolean) ?? [];
    const makes = searchParams.get("vehicleMake")?.split(",").filter(Boolean) ?? [];
    return {
      q: searchParams.get("q") ?? "",
      categories: new Set(cats),
      vehicleMakes: new Set(makes),
      minPrice: searchParams.get("minPrice") ?? "",
      maxPrice: searchParams.get("maxPrice") ?? "",
      inStock: searchParams.get("inStock") === "1",
      featured: searchParams.get("featured") === "1",
    };
  }, [searchParams]);

  const [q, setQ] = useState(initial.q);
  const [selected, setSelected] = useState<Set<string>>(new Set(initial.categories));
  const [selectedMakes, setSelectedMakes] = useState<Set<string>>(
    new Set(initial.vehicleMakes),
  );
  const [minPrice, setMinPrice] = useState(initial.minPrice);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice);
  const [inStock, setInStock] = useState(initial.inStock);
  const [featured, setFeatured] = useState(initial.featured);

  // Auto-expand any root that contains a currently-selected subcategory, plus
  // the root that IS selected. Persist user's manual toggles via local state.
  const initiallyExpanded = useMemo(() => {
    const open = new Set<string>();
    for (const root of categoryTree) {
      if (initial.categories.has(root.slug)) {
        open.add(root.slug);
        continue;
      }
      if (root.children.some((c) => initial.categories.has(c.slug))) {
        open.add(root.slug);
      }
    }
    return open;
  }, [categoryTree, initial.categories]);

  const [expanded, setExpanded] = useState<Set<string>>(initiallyExpanded);
  const [, startTransition] = useTransition();

  // Push URL whenever a filter toggles — operator never has to click Apply.
  // Debounced for the free-text search box and the price range inputs so
  // every keystroke doesn't trigger a navigation.
  function pushNow(
    nextQ: string,
    nextSelected: Set<string>,
    nextMakes: Set<string>,
    nextMinPrice: string,
    nextMaxPrice: string,
    nextInStock: boolean,
    nextFeatured: boolean,
  ) {
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextSelected.size > 0) params.set("category", [...nextSelected].join(","));
    if (nextMakes.size > 0) params.set("vehicleMake", [...nextMakes].join(","));
    if (nextMinPrice) params.set("minPrice", nextMinPrice);
    if (nextMaxPrice) params.set("maxPrice", nextMaxPrice);
    if (nextInStock) params.set("inStock", "1");
    if (nextFeatured) params.set("featured", "1");
    const qs = params.toString();
    startTransition(() => {
      router.push(`/${locale}/catalog${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  }

  // Free-text + price inputs: 350ms debounce. Skip the very first render
  // (loaded from URL → mirrors current state).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      pushNow(q, selected, selectedMakes, minPrice, maxPrice, inStock, featured);
    }, 350);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, minPrice, maxPrice]);

  const toggleCategory = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelected(next);
    pushNow(q, next, selectedMakes, minPrice, maxPrice, inStock, featured);
  };

  const toggleMake = (slug: string) => {
    const next = new Set(selectedMakes);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelectedMakes(next);
    pushNow(q, selected, next, minPrice, maxPrice, inStock, featured);
  };

  const toggleInStock = () => {
    const next = !inStock;
    setInStock(next);
    pushNow(q, selected, selectedMakes, minPrice, maxPrice, next, featured);
  };

  const toggleFeatured = () => {
    const next = !featured;
    setFeatured(next);
    pushNow(q, selected, selectedMakes, minPrice, maxPrice, inStock, next);
  };

  const toggleExpand = (slug: string) => {
    setExpanded((prev) => {
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
    if (selectedMakes.size > 0)
      params.set("vehicleMake", [...selectedMakes].join(","));
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
    setSelectedMakes(new Set());
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setFeatured(false);
    router.push(`/${locale}/catalog`);
  };

  const hasAny =
    q ||
    selected.size > 0 ||
    selectedMakes.size > 0 ||
    minPrice ||
    maxPrice ||
    inStock ||
    featured;

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full min-w-0 max-w-full flex-col gap-5 rounded-md border border-border bg-surface p-4 lg:p-5"
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
        {/* Inner scroll only on lg+ (sidebar sticky, finite height). On
            mobile/tablet the panel uses the page's scroll so toggling a
            checkbox doesn't trap the user inside an inner scroll context. */}
        <ul className="-mx-1 space-y-0.5 pr-1 lg:max-h-96 lg:overflow-y-auto">
          {categoryTree.map((root) => {
            const isExpanded = expanded.has(root.slug);
            const rootChecked = selected.has(root.slug);
            const hasChildren = root.children.length > 0;
            return (
              <li key={root.slug}>
                {/* Root row: checkbox + name + chevron expander */}
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-sm pr-1 transition-colors",
                    rootChecked ? "bg-primary/10" : "hover:bg-surface-elevated",
                  )}
                >
                  <label
                    className={cn(
                      "relative flex flex-1 cursor-pointer items-center gap-2 px-2 py-1.5 text-sm",
                      rootChecked ? "text-foreground" : "text-muted-strong hover:text-foreground",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={rootChecked}
                      onChange={() => toggleCategory(root.slug)}
                      className="peer absolute inset-0 cursor-pointer opacity-0"
                    />
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-sm border transition-colors",
                        rootChecked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface",
                      )}
                    >
                      {rootChecked ? (
                        <svg
                          viewBox="0 0 10 8"
                          className="size-2.5 fill-none stroke-current stroke-2"
                        >
                          <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : null}
                    </span>
                    <span className="flex-1 truncate font-semibold">{root.name}</span>
                    <span className="text-[10px] text-muted">{root.productCount}</span>
                  </label>
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggleExpand(root.slug)}
                      aria-label={isExpanded ? "Restrânge" : "Extinde"}
                      className="grid size-6 shrink-0 place-items-center rounded-sm text-muted transition-all hover:bg-surface hover:text-foreground"
                    >
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform",
                          isExpanded ? "rotate-0" : "-rotate-90",
                        )}
                      />
                    </button>
                  ) : null}
                </div>

                {/* Subcategories (indented) */}
                {hasChildren && isExpanded ? (
                  <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                    {root.children.map((sub) => {
                      const subChecked = selected.has(sub.slug);
                      return (
                        <li key={sub.slug}>
                          <label
                            className={cn(
                              "relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1 text-[13px] transition-colors",
                              subChecked
                                ? "bg-primary/10 text-foreground"
                                : "text-muted-strong hover:bg-surface-elevated hover:text-foreground",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={subChecked}
                              onChange={() => toggleCategory(sub.slug)}
                              className="peer absolute inset-0 cursor-pointer opacity-0"
                            />
                            <span
                              className={cn(
                                "grid size-3.5 shrink-0 place-items-center rounded-sm border transition-colors",
                                subChecked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-surface",
                              )}
                            >
                              {subChecked ? (
                                <svg
                                  viewBox="0 0 10 8"
                                  className="size-2.5 fill-none stroke-current stroke-2"
                                >
                                  <path
                                    d="M1 4l2.5 2.5L9 1"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              ) : null}
                            </span>
                            <span className="flex-1 truncate">{sub.name}</span>
                            <span className="text-[10px] text-muted">
                              {sub.productCount}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      {vehicleMakes.length > 0 ? (
        <FilterGroup icon={Truck} title={labels.vehicleMake}>
          <ul className="-mx-1 space-y-0.5 pr-1 lg:max-h-72 lg:overflow-y-auto">
            {vehicleMakes.map((make) => {
              const checked = selectedMakes.has(make.slug);
              return (
                <li key={make.slug}>
                  <label
                    className={cn(
                      "relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                      checked
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-strong hover:bg-surface-elevated hover:text-foreground",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMake(make.slug)}
                      className="peer absolute inset-0 cursor-pointer opacity-0"
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
                        <svg
                          viewBox="0 0 10 8"
                          className="size-2.5 fill-none stroke-current stroke-2"
                        >
                          <path
                            d="M1 4l2.5 2.5L9 1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </span>
                    <span className="flex-1 truncate">{make.name}</span>
                    <span className="text-[10px] text-muted">
                      {make.productCount}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      ) : null}

      <FilterGroup icon={Wallet} title={labels.priceRange}>
        <div className="flex w-full min-w-0 items-center gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder={labels.from}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="min-w-0 flex-1"
          />
          <span className="shrink-0 text-muted">–</span>
          <Input
            type="number"
            inputMode="decimal"
            placeholder={labels.to}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="min-w-0 flex-1"
          />
        </div>
      </FilterGroup>

      <FilterGroup icon={Star} title="">
        <div className="flex flex-col gap-2 text-sm">
          <Toggle
            label={labels.inStock}
            checked={inStock}
            onChange={() => toggleInStock()}
          />
          <Toggle
            label={labels.featured}
            checked={featured}
            onChange={() => toggleFeatured()}
          />
        </div>
      </FilterGroup>

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
