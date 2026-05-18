"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Below the `lg` breakpoint the catalog filters are collapsed behind a
 * button (closed by default). At `lg` and up the toggle is hidden and the
 * filters render inline as a permanent sidebar.
 */
export function CatalogFiltersMobileToggle({
  label,
  activeCount,
  children,
}: {
  label: string;
  activeCount: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="catalog-filters-panel"
        className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm font-medium text-foreground shadow-[var(--shadow-card)] transition-colors hover:border-border-strong lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" />
          {label}
          {activeCount > 0 ? (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold tabular-nums text-primary-foreground">
              {activeCount}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        id="catalog-filters-panel"
        className={cn(
          "mt-3 w-full min-w-0 lg:mt-0 lg:!block",
          open ? "block" : "hidden",
        )}
      >
        {children}
      </div>
    </div>
  );
}
