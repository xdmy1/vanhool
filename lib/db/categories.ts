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
    is_active: boolean | null;
  }[]
> {
  const supabase = await createClient();
  // Intentionally NOT filtering on is_active here: a root category may be
  // marked inactive while its children (and the products under them) are
  // active. We need the full hierarchy so the tree builder can attach those
  // active leaves to their real parent instead of promoting them to roots.
  // Empty branches are pruned at the tree level via productCount rollup.
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_ro, name_en, name_ru, parent_id, sort_order, image_url, is_active")
    .order("sort_order", { ascending: true });

  if (error) return [];
  return data ?? [];
}

async function fetchCategoryCounts(): Promise<Map<string, number>> {
  const supabase = await createClient();
  // Count products at their LEAF category — products are tagged with both
  // parent (`category_id`) and leaf (`subcategory_id`); using the leaf gives
  // each product a single home so tree rollup doesn't double-count.
  const { data } = await supabase
    .from("products")
    .select("category_id, subcategory_id")
    .eq("is_active", true);
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const leafId = row.subcategory_id ?? row.category_id;
    if (!leafId) continue;
    counts.set(leafId, (counts.get(leafId) ?? 0) + 1);
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
  // Recursively sum each root's subtree. Counts come in keyed by LEAF, so a
  // single pass child→parent isn't enough when the hierarchy is deeper than
  // one level.
  const childrenByParent = new Map<string, Category[]>();
  for (const c of all) {
    if (!c.parentId) continue;
    const arr = childrenByParent.get(c.parentId) ?? [];
    arr.push(c);
    childrenByParent.set(c.parentId, arr);
  }
  function subtreeCount(c: Category): number {
    let total = c.productCount;
    for (const child of childrenByParent.get(c.id) ?? []) total += subtreeCount(child);
    return total;
  }
  return all
    .filter((c) => !c.parentId)
    .map((r) => ({ ...r, productCount: subtreeCount(r) }))
    .filter((r) => r.productCount > 0);
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

  // Roll descendant productCounts up so a parent reflects its subtree total.
  // Counts come in keyed by LEAF category; this propagates them upward so the
  // "Filtre (14)" header reflects every leaf-tagged product under it.
  function rollUp(node: CategoryTreeNode): number {
    for (const child of node.children) {
      node.productCount += rollUp(child);
    }
    return node.productCount;
  }
  for (const r of roots) rollUp(r);

  // Prune any branch with zero products — keeps soft-archived roots ("Lighting"
  // with no parts yet) out of the filter sidebar while still letting an
  // inactive root that still holds active descendants render normally.
  function prune(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
    return nodes
      .map((n) => ({ ...n, children: prune(n.children) }))
      .filter((n) => n.productCount > 0);
  }
  const pruned = prune(roots);

  pruned.sort(bySortOrder);
  for (const r of pruned) r.children.sort(bySortOrder);
  return pruned;
}

export async function getCategoryBySlug(
  slug: string,
  locale: Locale,
): Promise<Category | null> {
  const cats = await getCategories(locale);
  return cats.find((c) => c.slug === slug) ?? null;
}
