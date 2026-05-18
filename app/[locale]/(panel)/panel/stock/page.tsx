import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle, MapPin } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Link } from "@/lib/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

const LOW_STOCK_THRESHOLD = 5;
const PAGE_LIMIT = 100;

export default async function PanelStockPage({
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

  const filter =
    typeof sp.filter === "string" && ["low", "out", "all"].includes(sp.filter)
      ? sp.filter
      : "low";

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, part_code, name_ro, stock_quantity, storage_location, price, is_active",
      { count: "exact" },
    )
    .eq("is_active", true)
    .order("stock_quantity", { ascending: true })
    .limit(PAGE_LIMIT);

  if (filter === "out") query = query.eq("stock_quantity", 0);
  else if (filter === "low") query = query.lte("stock_quantity", LOW_STOCK_THRESHOLD);

  const { data, count } = await query;

  const chips = [
    { id: "low", label: t("stock_filter_low", { threshold: LOW_STOCK_THRESHOLD }) },
    { id: "out", label: t("stock_filter_out") },
    { id: "all", label: t("stock_filter_all") },
  ];

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader title={t("stock_title")} subtitle={t("stock_subtitle")} />

      <div className="mt-6 flex flex-wrap items-center gap-1.5">
        {chips.map((c) => (
          <a
            key={c.id}
            href={`?filter=${c.id}`}
            className={cn(
              "inline-flex h-9 items-center rounded-md border px-3 text-xs transition-colors",
              filter === c.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface hover:border-primary/40 hover:text-primary",
            )}
          >
            {c.label}
          </a>
        ))}
        <span className="ml-auto text-xs text-muted">
          {count !== null && count > PAGE_LIMIT
            ? t("stock_count_capped", { count, limit: PAGE_LIMIT })
            : t("stock_count", { count: count ?? 0 })}
        </span>
      </div>

      <div className="mt-6">
        {!data || data.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
            {t("stock_empty")}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">{t("stock_col_code")}</th>
                  <th className="px-4 py-3">{t("stock_col_name")}</th>
                  <th className="px-4 py-3">{t("stock_col_location")}</th>
                  <th className="px-4 py-3 text-right">{t("stock_col_qty")}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {data.map((p) => {
                  const qty = p.stock_quantity ?? 0;
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-mono text-xs">{p.part_code ?? "—"}</td>
                      <td className="px-4 py-3">{p.name_ro ?? "—"}</td>
                      <td className="px-4 py-3">
                        {p.storage_location ? (
                          <span className="inline-flex items-center gap-1 rounded bg-background px-1.5 py-0.5 font-mono text-xs">
                            <MapPin className="size-3 text-muted" />
                            {p.storage_location}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">{t("stock_no_location")}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs tabular-nums",
                            qty === 0
                              ? "bg-destructive/10 text-destructive"
                              : qty <= LOW_STOCK_THRESHOLD
                                ? "bg-warning/10 text-warning"
                                : "bg-success/10 text-success",
                          )}
                        >
                          {qty <= LOW_STOCK_THRESHOLD ? <AlertTriangle className="size-3" /> : null}
                          {qty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/panel/produse/${p.id}` as "/panel"}
                          locale={locale}
                          className="text-xs text-primary hover:underline"
                        >
                          {t("action_edit")}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
