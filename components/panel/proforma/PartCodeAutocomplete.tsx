"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import {
  type ProductSearchResult,
  searchProducts,
} from "@/lib/panel/sales/actions";
import { cn } from "@/lib/utils/cn";

export type ProformaPartMatch = {
  code: string;
  name: string;
  unit_price: number;
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
  const [open, setOpen] = useState(false);
  const [pending, startSearch] = useTransition();
  const timer = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Debounced lookup whenever the input value changes and we still have focus.
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = window.setTimeout(() => {
      startSearch(async () => {
        const r = await searchProducts(value.trim());
        setResults(r);
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
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => pick(p)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left text-xs hover:bg-surface-elevated",
                    )}
                  >
                    <span className="font-mono text-[11px] text-muted">
                      {p.part_code ?? "—"}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{p.name_ro ?? "—"}</span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {p.price.toFixed(2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
