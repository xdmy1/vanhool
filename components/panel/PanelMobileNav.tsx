"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * Hamburger overlay nav for the panel. Renders only below `lg`. The
 * desktop sidebar (`PanelSidebar`) is hidden in that breakpoint so the
 * two never both show.
 *
 * The drawer markup is passed as children — caller renders whatever
 * sidebar component they want inside the drawer.
 */
export function PanelMobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close when the route changes so a tap on a nav link doesn't
  // leave the drawer open over the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll while open so the drawer feels like a modal.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-muted-strong transition-colors hover:border-primary/40 hover:text-primary lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-[79] bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-[80] flex h-dvh w-72 max-w-[85vw] flex-col bg-surface-elevated shadow-2xl lg:hidden",
            )}
          >
            <div className="flex items-center justify-end border-b border-border px-3 py-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-md text-muted hover:bg-surface hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </aside>
        </>
      ) : null}
    </>
  );
}
