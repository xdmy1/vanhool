import { createClient } from "@/lib/supabase/server";

import type { Category, Locale } from "./types";
import { illustrationFor } from "./types";
import { demo } from "./demo-data";
import { USE_DEMO_DATA } from "./flags";

export type CategoryTreeNode = Category & { children: CategoryTreeNode[] };

async function fetchCategories(): Promise<
  {
    id: string;
    slug: string | null;
    name_ro: string | null;
    name_en: string | null;
    name_ru: string | null;
    parent_id: string | null;
    sort_order: number | null;
    image_url: string | null;
  }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_ro, name_en, name_ru, parent_id, sort_order, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return data ?? [];
}

async function fetchCategoryCounts(): Promise<Map<string, number>> {
  const supabase = await createClient();
  // Group-by via RPC would be ideal; for now, count in SQL via rpc or fallback.
  // Simpler: select category_id and count client-side.
  const { data } = await supabase
    .from("products")
    .select("category_id")
    .eq("is_active", true);
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const id = row.category_id;
    if (!id) continue;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

function nameForLocale(
  row: Awaited<ReturnType<typeof fetchCategories>>[number],
  locale: Locale,
) {
  return (
    (locale === "ro"
      ? row.name_ro
      : locale === "en"
        ? row.name_en
        : row.name_ru) ??
    row.name_en ??
    row.name_ro ??
    row.slug ??
    ""
  );
}

export async function getCategories(locale: Locale): Promise<Category[]> {
  if (USE_DEMO_DATA) return demo.categories(locale);

  const [rows, counts] = await Promise.all([
    fetchCategories(),
    fetchCategoryCounts(),
  ]);

  if (rows.length === 0) return demo.categories(locale);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug ?? row.id,
    name: nameForLocale(row, locale),
    parentId: row.parent_id,
    sortOrder: row.sort_order ?? 0,
    productCount: counts.get(row.id) ?? 0,
    iconKey: illustrationFor(row.slug ?? ""),
    imageUrl: row.image_url ?? null,
  }));
}

export async function getRootCategories(locale: Locale): Promise<Category[]> {
  const all = await getCategories(locale);
  const roots = all.filter((c) => !c.parentId);
  // Aggregate descendants' counts into parents
  const childCounts = new Map<string, number>();
  for (const c of all) {
    if (c.parentId) {
      childCounts.set(c.parentId, (childCounts.get(c.parentId) ?? 0) + c.productCount);
    }
  }
  return roots.map((r) => ({
    ...r,
    productCount: Math.max(r.productCount, childCounts.get(r.id) ?? 0),
  }));
}

export async function getCategoryTree(locale: Locale): Promise<CategoryTreeNode[]> {
  const all = await getCategories(locale);
  const byId = new Map<string, CategoryTreeNode>();
  for (const c of all) byId.set(c.id, { ...c, children: [] });
  const roots: CategoryTreeNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const bySortOrder = (a: CategoryTreeNode, b: CategoryTreeNode) =>
    a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
  roots.sort(bySortOrder);
  for (const r of roots) r.children.sort(bySortOrder);
  return roots;
}

export async function getCategoryBySlug(
  slug: string,
  locale: Locale,
): Promise<Category | null> {
  const cats = await getCategories(locale);
  return cats.find((c) => c.slug === slug) ?? null;
}
