import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { ProductsTable } from "@/components/panel/ProductsTable";
import { listPanelProducts } from "@/lib/panel/produse/queries";

export default async function PanelProduseListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  const q = typeof sp.q === "string" ? sp.q : undefined;
  const status =
    typeof sp.status === "string" && ["all", "active", "inactive", "low_stock"].includes(sp.status)
      ? (sp.status as "all" | "active" | "inactive" | "low_stock")
      : "all";
  const page = sp.page ? Math.max(1, parseInt(String(sp.page), 10)) : 1;

  const { rows, total, pageSize } = await listPanelProducts({ q, status, page });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const chips = [
    { id: "all", label: t("produse_filter_all") },
    { id: "active", label: t("produse_filter_active") },
    { id: "inactive", label: t("produse_filter_inactive") },
    { id: "low_stock", label: t("produse_filter_low_stock") },
  ];

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        title={t("produse_title")}
        subtitle={t("produse_subtitle")}
        actions={
          <Button asChild className="gap-1.5">
            <Link href={"/panel/produse/new" as "/panel"} locale={locale}>
              <Plus className="size-4" />
              {t("produse_new_button")}
            </Link>
          </Button>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder={t("produse_search_placeholder")}
          className="w-full max-w-md"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => {
            const next = new URLSearchParams();
            for (const [k, v] of Object.entries(sp)) {
              if (k === "status" || k === "page" || v === undefined) continue;
              next.set(k, Array.isArray(v) ? v.join(",") : v);
            }
            if (c.id !== "all") next.set("status", c.id);
            const href = `?${next.toString()}` || "?";
            const active = status === c.id;
            return (
              <a
                key={c.id}
                href={href}
                className={`inline-flex h-9 items-center rounded-md border px-3 text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface hover:border-primary/40 hover:text-primary"
                }`}
              >
                {c.label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <ProductsTable
          rows={rows}
          locale={locale}
          emptyLabel={q ? t("produse_empty_no_results") : t("produse_empty_no_products")}
        />
        <AdminPagination
          page={page}
          totalPages={totalPages}
          basePath="/panel/produse"
          searchParams={sp}
          locale={locale}
        />
      </div>
    </div>
  );
}
