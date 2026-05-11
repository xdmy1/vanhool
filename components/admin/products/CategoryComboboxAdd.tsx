"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quickCreateCategory } from "@/lib/admin/categories/actions";

type Option = { id: string; name: string; parentId: string | null };

/**
 * Dropdown for picking a category (root or sub) with an inline "+ adaugă"
 * row underneath. When `parentId` is provided, new entries created here
 * are inserted as children of that parent (i.e. subcategories).
 *
 * The inline form captures all three languages (RO, EN, RU). RO is
 * required — empty EN/RU fall back to the RO name on insert.
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
  const [nameRo, setNameRo] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(options);
  }, [options]);

  const reset = () => {
    setAdding(false);
    setNameRo("");
    setNameEn("");
    setNameRu("");
  };

  const submitNew = () => {
    const trimmedRo = nameRo.trim();
    if (!trimmedRo) return;
    startTransition(async () => {
      const res = await quickCreateCategory({
        nameRo: trimmedRo,
        nameEn: nameEn.trim() || undefined,
        nameRu: nameRu.trim() || undefined,
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
          <div className="text-xs font-medium text-muted-strong">{placeholder}</div>
          <LangField
            code="RO"
            value={nameRo}
            onChange={setNameRo}
            required
            autoFocus
            onEnter={submitNew}
            onEscape={reset}
          />
          <LangField
            code="EN"
            value={nameEn}
            onChange={setNameEn}
            onEnter={submitNew}
            onEscape={reset}
          />
          <LangField
            code="RU"
            value={nameRu}
            onChange={setNameRu}
            onEnter={submitNew}
            onEscape={reset}
          />
          <div className="mt-1 flex items-center justify-end gap-2">
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
              disabled={pending || !nameRo.trim()}
              className="gap-1"
            >
              <Check className="size-3.5" />
              {pending ? "…" : addLabel}
            </Button>
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

function LangField({
  code,
  value,
  onChange,
  required,
  autoFocus,
  onEnter,
  onEscape,
}: {
  code: "RO" | "EN" | "RU";
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoFocus?: boolean;
  onEnter: () => void;
  onEscape: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 shrink-0 rounded-sm border border-border bg-surface px-1.5 py-1 text-center text-[10px] font-semibold text-muted-strong">
        {code}
      </span>
      <Input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onEscape();
          }
        }}
        placeholder={required ? "Nume obligatoriu" : "Opțional — preia RO"}
        className="text-sm"
      />
    </div>
  );
}
