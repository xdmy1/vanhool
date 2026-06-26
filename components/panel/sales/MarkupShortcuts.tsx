"use client";

import { cn } from "@/lib/utils/cn";

/**
 * Two-button shortcut pair for setting the line's selling price as a
 * markup over the (purchase) cost. Both buttons compute from `cost`,
 * NOT from the current `unit_price` — they're mutually exclusive,
 * clicking one replaces whatever was there before.
 *
 *   +30%  →  unit_price = cost × 1.30   (price shown to client)
 *   -15%  →  unit_price = cost × 1.15   (real money received after the
 *                                        service partner keeps their cut;
 *                                        label is "-15%" relative to the
 *                                        +30% case, even though the math
 *                                        still adds 15% on top of cost.)
 *
 * Hidden when cost ≤ 0 — there's nothing to mark up from.
 * Active state highlights whichever value matches the current
 * unit_price (within 1 cent tolerance) so the operator sees at a
 * glance which one is currently applied.
 *
 * Designed as a small inline chip next to (or under) the price
 * input — does not push the row layout.
 */
export function MarkupShortcuts({
  cost,
  unitPrice,
  onPick,
  className,
}: {
  cost: number;
  unitPrice: number;
  onPick: (next: number) => void;
  className?: string;
}) {
  if (!Number.isFinite(cost) || cost <= 0) return null;
  const at30 = Number((cost * 1.3).toFixed(2));
  const at15 = Number((cost * 1.15).toFixed(2));
  const bare = Number(cost.toFixed(2));
  const active30 = Math.abs(unitPrice - at30) < 0.01;
  const active15 = Math.abs(unitPrice - at15) < 0.01;
  return (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded border border-border",
        className,
      )}
      role="group"
      aria-label="Markup pe cost"
    >
      <button
        type="button"
        // Click on the ACTIVE button reverts the price back to plain
        // cost (toggles off). Click on the inactive button sets cost
        // × 1.30. Lets the operator un-do a misclick without typing.
        onClick={() => onPick(active30 ? bare : at30)}
        title={
          active30
            ? `Deselectează — revino la cost (${bare.toFixed(2)})`
            : `+30% pe cost (${cost.toFixed(2)} → ${at30.toFixed(2)})`
        }
        aria-pressed={active30}
        className={cn(
          "px-1.5 py-0.5 text-[9px] font-semibold tabular-nums transition-colors",
          active30
            ? "bg-primary text-primary-foreground"
            : "bg-surface text-primary hover:bg-primary/10",
        )}
      >
        +30%
      </button>
      <button
        type="button"
        onClick={() => onPick(active15 ? bare : at15)}
        title={
          active15
            ? `Deselectează — revino la cost (${bare.toFixed(2)})`
            : `-15% (înlocuiește cu +15% pe cost: ${cost.toFixed(2)} → ${at15.toFixed(2)})`
        }
        aria-pressed={active15}
        className={cn(
          "border-l border-border px-1.5 py-0.5 text-[9px] font-semibold tabular-nums transition-colors",
          active15
            ? "bg-foreground text-background"
            : "bg-surface text-muted-strong hover:bg-surface-elevated",
        )}
      >
        -15%
      </button>
    </div>
  );
}
