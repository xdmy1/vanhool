"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Below the `lg` breakpoint the filters live behind a button that opens
 * them as a full-screen sheet on top of the page. The trigger button is
 * sticky to the top of the viewport so the operator can re-open the
 * panel from anywhere on the page without scrolling back up. At `lg` and
 * up both this trigger and the modal disappear — the filters render
 * inline as a permanent sidebar.
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

  // Lock body scroll while the sheet is open and close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 mb-4 px-4 pb-2 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm font-medium text-foreground shadow-[var(--shadow-card)] transition-colors hover:border-border-strong"
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
        </button>
      </div>

      {/* Full-screen modal sheet on mobile/tablet. */}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="ml-auto flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="size-4 text-primary" />
                {label}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </div>
        </div>
      ) : null}

      {/* Desktop: filters render inline as the page sidebar. */}
      <div className={cn("hidden lg:block")}>{children}</div>
    </>
  );
}
