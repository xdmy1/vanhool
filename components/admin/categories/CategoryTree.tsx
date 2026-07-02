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
 * Category tree with an explicit "Reordonează" mode. Normal view shows the full
 * tree, static (no drag handles) so it's clean to read. Reorder mode HIDES the
 * subcategories and shows only the root categories as draggable rows, so the
 * operator can arrange the on-site order without the subtree getting in the way.
 * Dropping persists sort_order (storefront lists categories by sort_order).
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
  const [reorderMode, setReorderMode] = useState(false);
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
      <div className="flex items-center justify-between gap-3 border-b border-border bg-background/40 px-4 py-2">
        <span className="text-[11px] text-muted">
          {reorderMode
            ? "Mod reordonare — trage categoriile-rădăcină în ordinea dorită. Subcategoriile sunt ascunse temporar; ordinea se salvează pe loc."
            : "Apasă „Reordonează” ca să aranjezi ordinea categoriilor pe site."}
        </span>
        <button
          type="button"
          onClick={() => {
            setReorderMode((v) => !v);
            setDraggingId(null);
            setOverId(null);
          }}
          className={cn(
            "shrink-0 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors",
            reorderMode
              ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
              : "border-border bg-surface text-muted-strong hover:border-primary/40 hover:text-primary",
          )}
        >
          {reorderMode ? "Gata" : "Reordonează"}
        </button>
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
        {reorderMode
          ? roots.map((root) => (
              <TreeRow
                key={root.id}
                category={root}
                byParent={byParent}
                counts={counts}
                depth={0}
                locale={locale}
                reorderMode
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
            ))
          : roots.map((root) => (
              <TreeRow
                key={root.id}
                category={root}
                byParent={byParent}
                counts={counts}
                depth={0}
                locale={locale}
                reorderMode={false}
                draggingId={null}
                overId={null}
                onDragStart={() => {}}
                onDragEnterRow={() => {}}
                onDropRow={() => {}}
                onDragEnd={() => {}}
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
  reorderMode,
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
  reorderMode: boolean;
  draggingId: string | null;
  overId: string | null;
  onDragStart: (id: string) => void;
  onDragEnterRow: (id: string) => void;
  onDropRow: (id: string) => void;
  onDragEnd: () => void;
}) {
  const children = byParent.get(category.id) ?? [];
  const isDragging = draggingId === category.id;
  const isOver =
    overId === category.id && draggingId !== null && draggingId !== category.id;

  return (
    <>
      <li
        draggable={reorderMode}
        onDragStart={
          reorderMode
            ? (e) => {
                e.dataTransfer.effectAllowed = "move";
                onDragStart(category.id);
              }
            : undefined
        }
        onDragEnter={reorderMode ? () => onDragEnterRow(category.id) : undefined}
        onDragOver={reorderMode ? (e) => e.preventDefault() : undefined}
        onDrop={
          reorderMode
            ? (e) => {
                e.preventDefault();
                onDropRow(category.id);
              }
            : undefined
        }
        onDragEnd={reorderMode ? onDragEnd : undefined}
        className={cn(
          "grid grid-cols-[24px_1fr_140px_120px_80px_44px] items-center gap-3 px-4 py-3 transition-colors",
          reorderMode && isDragging ? "opacity-40" : "hover:bg-background/30",
          reorderMode ? "cursor-grab border-t-2 active:cursor-grabbing" : "",
          reorderMode && isOver ? "border-primary" : "border-transparent",
        )}
      >
        <span className="text-muted">
          {reorderMode ? <GripVertical className="size-4" /> : null}
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
      {!reorderMode &&
        children.map((child) => (
          <TreeRow
            key={child.id}
            category={child}
            byParent={byParent}
            counts={counts}
            depth={depth + 1}
            locale={locale}
            reorderMode={false}
            draggingId={null}
            overId={null}
            onDragStart={() => {}}
            onDragEnterRow={() => {}}
            onDropRow={() => {}}
            onDragEnd={() => {}}
          />
        ))}
    </>
  );
}
