"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import {
  type ProductSearchMeta,
  type ProductSearchResult,
  searchProductsWithMeta,
} from "@/lib/panel/sales/actions";
import { cn } from "@/lib/utils/cn";

export type ProformaPartMatch = {
  code: string;
  name: string;
  unit_price: number;
  /** Catalog cost — passed through so the line can show the realised
   * markup % once the operator edits the selling price. */
  cost_price: number;
};

/**
 * Part code input that searches existing catalog products (case-insensitive,
 * by code or name). Selecting a match prefills the line with its code, name,
 * and the suggested sell price. If nothing matches, the operator just keeps
 * typing — proformas can list off-catalog parts.
 */
export function PartCodeAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  emptyHint,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (match: ProformaPartMatch) => void;
  placeholder?: string;
  emptyHint?: string;
}) {
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [meta, setMeta] = useState<ProductSearchMeta | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startSearch] = useTransition();
  const timer = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Debounced lookup whenever the input value changes and we still have focus.
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults([]);
      setMeta(null);
      return;
    }
    timer.current = window.setTimeout(() => {
      startSearch(async () => {
        const { results: r, meta: m } = await searchProductsWithMeta(
          value.trim(),
        );
        setResults(r);
        setMeta(m);
      });
    }, 250);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [value]);

  // Click-outside dismiss.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function pick(p: ProductSearchResult) {
    onSelect({
      code: p.part_code ?? "",
      name: p.name_ro ?? "",
      unit_price: p.price,
      cost_price: p.cost_price ?? 0,
    });
    setOpen(false);
  }

  const showList = open && value.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="h-9 font-mono text-xs"
        autoComplete="off"
      />
      {pending ? (
        <span className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 animate-spin rounded-full border-2 border-border border-t-primary" />
      ) : null}
      {showList ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-border bg-surface shadow-lg">
          {results.length === 0 ? (
            <div className="px-3 py-2 text-[11px] text-muted">
              {pending ? "..." : (emptyHint ?? "—")}
              {/* Server diagnostic — temporary, lets us see WHY 0 hits */}
              {!pending && meta ? (
                <div className="mt-1 space-y-0.5 font-mono text-[10px] text-warning">
                  <div>
                    [debug-v4] catalog={meta.catalog_count} · drafts={meta.draft_count}
                  </div>
                  <div>
                    purchases(draft)={meta.draft_purchase_total} · items_in_drafts={meta.draft_items_total} · ilike_global={meta.items_match_total}
                  </div>
                  <div>sample_supplier_code=&quot;{meta.sample ?? "—"}&quot;</div>
                  <div>draftIds=[{(meta.draft_ids_seen ?? []).join(", ")}]</div>
                  <div>matchPurchaseIds=[{(meta.match_purchase_ids ?? []).join(", ")}]</div>
                  {meta.draft_error ? <div>err={meta.draft_error}</div> : null}
                </div>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(() => {
                // Group by source so the operator sees a clear divider
                // between "Catalog" (live stock) and "Achiziții draft"
                // (in the shop but not yet fiscally posted). Drafts go
                // last but always render — there's no "limit hides
                // them" problem because both lists have their own
                // limit on the server.
                const catalog = results.filter(
                  (p) => p.source !== "draft_purchase",
                );
                const drafts = results.filter(
                  (p) => p.source === "draft_purchase",
                );
                const rows: Array<
                  | { kind: "header"; label: string; tone: "muted" | "warning" }
                  | { kind: "item"; p: ProductSearchResult }
                > = [];
                if (catalog.length > 0) {
                  rows.push({ kind: "header", label: "Din catalog", tone: "muted" });
                  for (const p of catalog) rows.push({ kind: "item", p });
                }
                if (drafts.length > 0) {
                  rows.push({
                    kind: "header",
                    label: "Din achiziții draft",
                    tone: "warning",
                  });
                  for (const p of drafts) rows.push({ kind: "item", p });
                }
                return rows.map((row, idx) => {
                  if (row.kind === "header") {
                    return (
                      <li
                        key={`h-${idx}`}
                        className={cn(
                          "sticky top-0 z-10 border-b border-border bg-surface px-3 py-1 text-[9px] font-semibold uppercase tracking-wider",
                          row.tone === "warning" ? "text-warning" : "text-muted",
                        )}
                      >
                        {row.label}
                      </li>
                    );
                  }
                  const p = row.p;
                  const isDraft = p.source === "draft_purchase";
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => pick(p)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-surface-elevated",
                          isDraft && "bg-warning/5",
                        )}
                      >
                        <span className="font-mono text-[11px] text-muted">
                          {p.part_code ?? "—"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{p.name_ro ?? "—"}</span>
                          {isDraft ? (
                            <span className="mt-0.5 block text-[10px] text-muted">
                              {p.draft_purchase_label}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted">
                          {p.price.toFixed(2)}
                        </span>
                      </button>
                    </li>
                  );
                });
              })()}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
