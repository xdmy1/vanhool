"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { CrossReference } from "@/lib/admin/products/actions";
import { createManufacturer } from "@/lib/admin/manufacturers/actions";
import { createVehicleMake } from "@/lib/admin/vehicle-makes/actions";

type Option = { id: string; name: string; slug?: string };

// ---------------------------------------------------------------------------
// TagInput — chip-style input for plain string lists (OEM codes).
// Press Enter or comma to commit a chip. Backspace on empty input removes last.
// ---------------------------------------------------------------------------
export function TagInput({
  values,
  onChange,
  placeholder,
  uppercase = false,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  uppercase?: boolean;
}) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    const formatted = uppercase ? v.toUpperCase() : v;
    const exists = values.some(
      (x) => x.toUpperCase() === formatted.toUpperCase(),
    );
    if (exists) {
      setDraft("");
      return;
    }
    onChange([...values, formatted]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="rounded-md border border-border bg-surface px-2 py-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[11px] text-primary"
          >
            {v}
            <button
              type="button"
              className="grid size-3.5 place-items-center rounded-sm text-primary/70 transition-colors hover:bg-primary/20 hover:text-primary"
              onClick={() => onChange(values.filter((x) => x !== v))}
              aria-label="Șterge"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) =>
            setDraft(uppercase ? e.target.value.toUpperCase() : e.target.value)
          }
          onKeyDown={onKeyDown}
          onBlur={() => commit(draft)}
          placeholder={values.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CrossRefEditor — repeatable {brand, code} rows with autocomplete on brand.
// ---------------------------------------------------------------------------
export function CrossRefEditor({
  values,
  onChange,
  brandSuggestions,
  labels,
}: {
  values: CrossReference[];
  onChange: (next: CrossReference[]) => void;
  brandSuggestions: string[];
  labels: { brand: string; code: string; add: string };
}) {
  const update = (idx: number, patch: Partial<CrossReference>) => {
    const next = values.map((v, i) => (i === idx ? { ...v, ...patch } : v));
    onChange(next);
  };
  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx));
  const add = () => onChange([...values, { brand: "", code: "" }]);

  return (
    <div className="flex flex-col gap-2">
      {values.length === 0 ? null : (
        <div className="flex flex-col gap-1.5">
          {values.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1.5fr_auto] items-center gap-2"
            >
              <Input
                list="cross-ref-brands"
                placeholder={labels.brand}
                value={row.brand}
                onChange={(e) => update(i, { brand: e.target.value })}
                className="text-sm"
              />
              <Input
                placeholder={labels.code}
                value={row.code}
                onChange={(e) => update(i, { code: e.target.value })}
                className="font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="grid size-9 place-items-center rounded-md border border-border bg-surface text-muted transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                aria-label="Șterge"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <datalist id="cross-ref-brands">
        {brandSuggestions.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={add}
        className="self-start"
      >
        <Plus className="size-3.5" /> {labels.add}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CustomSpecsEditor — repeatable {label, value} rows for free-form specs.
// Admin types the spec name AND value (e.g. "Dinți" / "36").
// ---------------------------------------------------------------------------
type CustomSpecRow = { label: string; value: string };

export function CustomSpecsEditor({
  values,
  onChange,
  labels,
}: {
  values: CustomSpecRow[];
  onChange: (next: CustomSpecRow[]) => void;
  labels: { label: string; value: string; add: string };
}) {
  const update = (idx: number, patch: Partial<CustomSpecRow>) => {
    onChange(values.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };
  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx));
  const add = () => onChange([...values, { label: "", value: "" }]);

  return (
    <div className="flex flex-col gap-2">
      {values.length === 0 ? null : (
        <div className="flex flex-col gap-1.5">
          {values.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1.5fr_auto] items-center gap-2"
            >
              <Input
                placeholder={labels.label}
                value={row.label}
                onChange={(e) => update(i, { label: e.target.value })}
                className="text-sm"
              />
              <Input
                placeholder={labels.value}
                value={row.value}
                onChange={(e) => update(i, { value: e.target.value })}
                className="text-sm"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="grid size-9 place-items-center rounded-md border border-border bg-surface text-muted transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                aria-label="Șterge"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={add}
        className="self-start"
      >
        <Plus className="size-3.5" /> {labels.add}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ManufacturerCombobox — select with inline "+ adaugă nou" via server action.
// ---------------------------------------------------------------------------
export function ManufacturerCombobox({
  options,
  value,
  onChange,
  labels,
}: {
  options: Option[];
  value: string | null;
  onChange: (id: string | null, name: string | null) => void;
  labels: { none: string; add: string; placeholder: string };
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<Option[]>(options);

  const submitNew = () => {
    const name = draft.trim();
    if (!name) return;
    startTransition(async () => {
      const res = await createManufacturer({ name });
      if (res.ok) {
        const inserted = { id: res.id, name: res.name, slug: res.slug };
        setItems((prev) =>
          prev.some((p) => p.id === inserted.id) ? prev : [...prev, inserted].sort((a, b) => a.name.localeCompare(b.name)),
        );
        onChange(res.id, res.name);
        setDraft("");
        setAdding(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={value ?? ""}
        onChange={(e) => {
          const id = e.target.value || null;
          const found = items.find((o) => o.id === id);
          onChange(id, found?.name ?? null);
        }}
        className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary"
      >
        <option value="">{labels.none}</option>
        {items.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {adding ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            placeholder={labels.placeholder}
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
          onClick={() => setAdding(true)}
          className="self-start text-xs text-primary hover:underline"
        >
          + {labels.add}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BusMakesMultiSelect — multi-select chip picker with inline "+ adaugă nou".
// ---------------------------------------------------------------------------
export function BusMakesMultiSelect({
  options,
  selectedIds,
  onChange,
  labels,
}: {
  options: Option[];
  selectedIds: string[];
  onChange: (next: string[]) => void;
  labels: { add: string; placeholder: string; empty: string };
}) {
  const [items, setItems] = useState<Option[]>(options);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  const selected = items.filter((o) => selectedIds.includes(o.id));
  const available = items.filter((o) => !selectedIds.includes(o.id));

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const submitNew = () => {
    const name = draft.trim();
    if (!name) return;
    startTransition(async () => {
      const res = await createVehicleMake({ name });
      if (res.ok) {
        const inserted = { id: res.id, name: res.name, slug: res.slug };
        setItems((prev) =>
          prev.some((p) => p.id === inserted.id) ? prev : [...prev, inserted].sort((a, b) => a.name.localeCompare(b.name)),
        );
        if (!selectedIds.includes(inserted.id)) onChange([...selectedIds, inserted.id]);
        setDraft("");
        setAdding(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex min-h-[2.25rem] flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1.5",
        )}
      >
        {selected.length === 0 ? (
          <span className="px-1 text-xs text-muted">{labels.empty}</span>
        ) : (
          selected.map((o) => (
            <span
              key={o.id}
              className="inline-flex items-center gap-1 rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
            >
              {o.name}
              <button
                type="button"
                onClick={() => toggle(o.id)}
                className="grid size-3.5 place-items-center rounded-sm text-primary/70 hover:bg-primary/20 hover:text-primary"
                aria-label="Șterge"
              >
                <X className="size-3" />
              </button>
            </span>
          ))
        )}
      </div>

      {available.length > 0 ? (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) toggle(e.target.value);
          }}
          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary"
        >
          <option value="">— + adaugă din listă —</option>
          {available.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      ) : null}

      {adding ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            placeholder={labels.placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitNew();
              } else if (e.key === "Escape") {
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
          onClick={() => setAdding(true)}
          className="self-start text-xs text-primary hover:underline"
        >
          + {labels.add}
        </button>
      )}
    </div>
  );
}
