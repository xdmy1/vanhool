"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronRight, Edit, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";
import { reorderCategories } from "@/lib/admin/categories/actions";
import type { Locale } from "@/lib/db/types";

export type TreeCategory = {
  id: string;
  slug: string | null;
  name_ro: string | null;
  name_en: string | null;
  name_ru: string | null;
  is_active: boolean | null;
  sort_order: number | null;
  parent_id: string | null;
};

function nameFor(cat: TreeCategory, locale: Locale): string {
  return (
    (locale === "ro" ? cat.name_ro : locale === "en" ? cat.name_en : cat.name_ru) ??
    cat.name_en ??
    cat.name_ro ??
    cat.slug ??
    ""
  );
}

/**
 * Draggable category tree. Rows can be dragged to reorder them AMONG THEIR
 * SIBLINGS (same parent) — dropping persists the new sort_order, which drives
 * the on-site order. Dragging a parent carries its whole subtree. Cross-parent
 * moves are ignored (edit the category to change its parent).
 */
export function CategoryTree({
  categories,
  counts,
  locale,
}: {
  categories: TreeCategory[];
  counts: Record<string, number>;
  locale: Locale;
}) {
  const t = useTranslations("admin");
  const [items, setItems] = useState<TreeCategory[]>(categories);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [, startSave] = useTransition();

  const byParent = useMemo(() => {
    const m = new Map<string | null, TreeCategory[]>();
    for (const c of items) {
      const k = c.parent_id ?? null;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(c);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }
    return m;
  }, [items]);

  function handleDrop(targetId: string) {
    const dragId = draggingId;
    setDraggingId(null);
    setOverId(null);
    if (!dragId || dragId === targetId) return;
    const drag = items.find((c) => c.id === dragId);
    const target = items.find((c) => c.id === targetId);
    if (!drag || !target) return;
    // Only reorder within the same parent (siblings).
    if ((drag.parent_id ?? null) !== (target.parent_id ?? null)) return;
    const siblings = [...(byParent.get(drag.parent_id ?? null) ?? [])];
    const from = siblings.findIndex((c) => c.id === dragId);
    const to = siblings.findIndex((c) => c.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = siblings.splice(from, 1);
    siblings.splice(to, 0, moved);
    const orderedIds = siblings.map((c) => c.id);
    const orderMap = new Map(orderedIds.map((id, i) => [id, i] as const));
    // Optimistic: apply the new sort_order locally so the tree re-sorts.
    setItems((prev) =>
      prev.map((c) =>
        orderMap.has(c.id) ? { ...c, sort_order: orderMap.get(c.id)! } : c,
      ),
    );
    startSave(async () => {
      await reorderCategories(orderedIds);
    });
  }

  const roots = byParent.get(null) ?? [];

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="border-b border-border bg-background/40 px-4 py-2 text-[11px] text-muted">
        Trage rândurile de mânerul ⠿ ca să schimbi ordinea pe site (în cadrul
        aceleiași categorii-părinte).
      </div>
      <header className="grid grid-cols-[24px_1fr_140px_120px_80px_44px] items-center gap-3 border-b border-border bg-background/40 px-4 py-3 text-xs text-muted">
        <span />
        <span>{t("categories_col_name")}</span>
        <span>{t("categories_col_slug")}</span>
        <span className="text-right">{t("categories_col_products")}</span>
        <span className="text-right">{t("categories_col_order")}</span>
        <span />
      </header>
      <ul className="divide-y divide-border">
        {roots.map((root) => (
          <TreeRow
            key={root.id}
            category={root}
            byParent={byParent}
            counts={counts}
            depth={0}
            locale={locale}
            draggingId={draggingId}
            overId={overId}
            onDragStart={setDraggingId}
            onDragEnterRow={setOverId}
            onDropRow={handleDrop}
            onDragEnd={() => {
              setDraggingId(null);
              setOverId(null);
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function TreeRow({
  category,
  byParent,
  counts,
  depth,
  locale,
  draggingId,
  overId,
  onDragStart,
  onDragEnterRow,
  onDropRow,
  onDragEnd,
}: {
  category: TreeCategory;
  byParent: Map<string | null, TreeCategory[]>;
  counts: Record<string, number>;
  depth: number;
  locale: Locale;
  draggingId: string | null;
  overId: string | null;
  onDragStart: (id: string) => void;
  onDragEnterRow: (id: string) => void;
  onDropRow: (id: string) => void;
  onDragEnd: () => void;
}) {
  const children = byParent.get(category.id) ?? [];
  const isDragging = draggingId === category.id;
  const isOver = overId === category.id && draggingId !== null && draggingId !== category.id;

  return (
    <>
      <li
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          onDragStart(category.id);
        }}
        onDragEnter={() => onDragEnterRow(category.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onDropRow(category.id);
        }}
        onDragEnd={onDragEnd}
        className={cn(
          "grid grid-cols-[24px_1fr_140px_120px_80px_44px] items-center gap-3 px-4 py-3 transition-colors",
          isDragging ? "opacity-40" : "hover:bg-background/30",
          isOver ? "border-t-2 border-primary" : "border-t-2 border-transparent",
        )}
      >
        <span className="cursor-grab text-muted active:cursor-grabbing" aria-label="drag">
          <GripVertical className="size-4" />
        </span>
        <div
          className={cn("flex items-center gap-2", depth > 0 && "pl-6")}
          style={depth > 1 ? { paddingLeft: `${depth * 1.5}rem` } : undefined}
        >
          {depth > 0 ? (
            <ChevronRight className="size-3.5 shrink-0 text-muted" />
          ) : null}
          <Link
            href={`/admin/categories/${category.id}` as "/admin/categories"}
            locale={locale}
            className="line-clamp-1 font-semibold transition-colors hover:text-primary"
          >
            {nameFor(category, locale)}
          </Link>
          {!category.is_active ? (
            <span className="rounded-sm border border-border bg-accent-dark px-1.5 py-0.5 text-[9px] text-muted">
              inactive
            </span>
          ) : null}
        </div>
        <span className="text-xs text-muted-strong">{category.slug ?? "—"}</span>
        <span className="text-right text-sm tabular-nums text-muted-strong">
          {counts[category.id] ?? 0}
        </span>
        <span className="text-right text-xs tabular-nums text-muted">
          {category.sort_order ?? 0}
        </span>
        <Link
          href={`/admin/categories/${category.id}` as "/admin/categories"}
          locale={locale}
          className="grid size-8 place-items-center rounded-md border border-border bg-surface text-muted-strong transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
          <Edit className="size-3.5" />
        </Link>
      </li>
      {children.map((child) => (
        <TreeRow
          key={child.id}
          category={child}
          byParent={byParent}
          counts={counts}
          depth={depth + 1}
          locale={locale}
          draggingId={draggingId}
          overId={overId}
          onDragStart={onDragStart}
          onDragEnterRow={onDragEnterRow}
          onDropRow={onDropRow}
          onDragEnd={onDragEnd}
        />
      ))}
    </>
  );
}
