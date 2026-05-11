"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quickCreateCategory } from "@/lib/admin/categories/actions";

type Option = { id: string; name: string; parentId: string | null };
type Lang = "ro" | "en" | "ru";

/**
 * Dropdown for picking a category (root or sub) with an inline "+ adaugă"
 * row underneath.
 *
 * The admin types the name in the language they're currently using — the
 * server auto-translates into the other two locales so a single row is
 * inserted with name_ro / name_en / name_ru all filled. The storefront
 * shows the right column based on the visitor's locale.
 */
export function CategoryComboboxAdd({
  options,
  value,
  onChange,
  onCreated,
  parentId,
  sourceLocale,
  disabled,
  noneLabel,
  addLabel,
  placeholder,
  emptyHint,
}: {
  options: Option[];
  value: string | null;
  onChange: (id: string | null) => void;
  /** Called after a new category is inserted, so the parent form can
   * append it to its in-memory list. */
  onCreated?: (created: Option) => void;
  parentId?: string | null;
  /** Locale the admin is typing in — used by the server to translate
   * into the other two columns. */
  sourceLocale: Lang;
  disabled?: boolean;
  noneLabel: string;
  addLabel: string;
  placeholder: string;
  emptyHint?: string;
}) {
  const [items, setItems] = useState<Option[]>(options);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(options);
  }, [options]);

  const reset = () => {
    setAdding(false);
    setName("");
  };

  const submitNew = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const res = await quickCreateCategory({
        name: trimmed,
        sourceLocale,
        parentId: parentId ?? null,
      });
      if (!res.ok) {
        toast.error(res.message ?? "error");
        return;
      }
      const inserted: Option = {
        id: res.id,
        name: res.name,
        parentId: res.parentId,
      };
      setItems((prev) =>
        prev.some((p) => p.id === inserted.id)
          ? prev
          : [...prev, inserted].sort((a, b) => a.name.localeCompare(b.name)),
      );
      onChange(res.id);
      onCreated?.(inserted);
      reset();
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">{noneLabel}</option>
        {items.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>

      {disabled && emptyHint ? (
        <span className="text-[10px] text-muted">{emptyHint}</span>
      ) : adding ? (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-elevated p-3">
          <div className="text-xs font-medium text-muted-strong">
            {placeholder}
          </div>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitNew();
              } else if (e.key === "Escape") {
                e.preventDefault();
                reset();
              }
            }}
            placeholder={placeholder}
            className="text-sm"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-muted">
              Se traduce automat ({sourceLocale.toUpperCase()} → restul)
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={reset}
                disabled={pending}
                className="gap-1"
              >
                <X className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={submitNew}
                disabled={pending || !name.trim()}
                className="gap-1"
              >
                <Check className="size-3.5" />
                {pending ? "…" : addLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setAdding(true)}
          className="self-start text-xs text-primary transition-opacity hover:underline disabled:opacity-40"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}
