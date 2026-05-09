"use client";

import { useEffect, useState, useTransition } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quickCreateCategory } from "@/lib/admin/categories/actions";

type Option = { id: string; name: string; parentId: string | null };

/**
 * Dropdown for picking a category (root or sub) with an inline "+ adaugă"
 * row underneath. When `parentId` is provided, new entries created here
 * are inserted as children of that parent (i.e. subcategories).
 */
export function CategoryComboboxAdd({
  options,
  value,
  onChange,
  onCreated,
  parentId,
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
  disabled?: boolean;
  noneLabel: string;
  addLabel: string;
  placeholder: string;
  emptyHint?: string;
}) {
  const [items, setItems] = useState<Option[]>(options);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(options);
  }, [options]);

  const submitNew = () => {
    const name = draft.trim();
    if (!name) return;
    startTransition(async () => {
      const res = await quickCreateCategory({
        name,
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
      setDraft("");
      setAdding(false);
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
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitNew();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setAdding(false);
                setDraft("");
              }
            }}
            className="text-sm"
          />
          <Button type="button" size="sm" onClick={submitNew} disabled={pending}>
            {pending ? "..." : "✓"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setAdding(false);
              setDraft("");
            }}
          >
            <X className="size-3.5" />
          </Button>
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
