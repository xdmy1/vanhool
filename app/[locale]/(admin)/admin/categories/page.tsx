import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChevronRight, Edit, Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import {
  adminCategoryProductCounts,
  adminListCategories,
} from "@/lib/admin/queries";
import type { Locale } from "@/lib/db/types";
import { cn } from "@/lib/utils/cn";

function nameFor(
  cat: { name_ro: string | null; name_en: string | null; name_ru: string | null; slug: string | null },
  locale: Locale,
): string {
  return (
    (locale === "ro" ? cat.name_ro : locale === "en" ? cat.name_en : cat.name_ru) ??
    cat.name_en ??
    cat.name_ro ??
    cat.slug ??
    ""
  );
}

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, cats, counts] = await Promise.all([
    getTranslations("admin"),
    adminListCategories(),
    adminCategoryProductCounts(),
  ]);

  // Build tree
  const byParent = new Map<string | null, typeof cats>();
  for (const c of cats) {
    const key = c.parent_id ?? null;
    const arr = byParent.get(key) ?? [];
    arr.push(c);
    byParent.set(key, arr);
  }

  const roots = byParent.get(null) ?? [];

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("nav_categories")}
        title={t("categories_title")}
        actions={
          <Button asChild size="md" className="">
            <Link href={"/admin/categories/new" as "/admin/categories"} locale={locale}>
              <Plus className="size-4" />
              {t("categories_new")}
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        {cats.length === 0 ? (
          <div className="flex items-center justify-center rounded-md border border-border bg-surface px-6 py-16 text-sm text-muted">
            {t("categories_empty")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-surface">
            <header className="grid grid-cols-[1fr_140px_120px_80px_44px] items-center gap-3 border-b border-border bg-background/40 px-4 py-3 text-xs text-muted">
              <span>{t("categories_col_name")}</span>
              <span>{t("categories_col_slug")}</span>
              <span className="text-right">{t("categories_col_products")}</span>
              <span className="text-right">{t("categories_col_order")}</span>
              <span />
            </header>
            <ul className="divide-y divide-border">
              {roots.map((root) => (
                <Row
                  key={root.id}
                  category={root}
                  byParent={byParent}
                  counts={counts}
                  depth={0}
                  locale={locale as Locale}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  category,
  byParent,
  counts,
  depth,
  locale,
}: {
  category: {
    id: string;
    slug: string | null;
    name_ro: string | null;
    name_en: string | null;
    name_ru: string | null;
    is_active: boolean | null;
    sort_order: number | null;
    parent_id: string | null;
  };
  byParent: Map<
    string | null,
    {
      id: string;
      slug: string | null;
      name_ro: string | null;
      name_en: string | null;
      name_ru: string | null;
      is_active: boolean | null;
      sort_order: number | null;
      parent_id: string | null;
    }[]
  >;
  counts: Map<string, number>;
  depth: number;
  locale: Locale;
}) {
  const children = byParent.get(category.id) ?? [];

  return (
    <>
      <li className="grid grid-cols-[1fr_140px_120px_80px_44px] items-center gap-3 px-4 py-3 transition-colors hover:bg-background/30">
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
          {counts.get(category.id) ?? 0}
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
        <Row
          key={child.id}
          category={child}
          byParent={byParent}
          counts={counts}
          depth={depth + 1}
          locale={locale}
        />
      ))}
    </>
  );
}
