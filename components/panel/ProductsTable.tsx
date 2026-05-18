import { Edit3 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/routing";
import { Price } from "@/components/common/Price";
import { cn } from "@/lib/utils/cn";
import type { PanelProductRow } from "@/lib/panel/produse/queries";

export async function ProductsTable({
  rows,
  locale,
  emptyLabel,
}: {
  rows: PanelProductRow[];
  locale: string;
  emptyLabel: string;
}) {
  const t = await getTranslations("panel");

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">{t("produse_col_code")}</th>
            <th className="px-4 py-3">{t("produse_col_name")}</th>
            <th className="px-4 py-3">{t("produse_col_brand")}</th>
            <th className="px-4 py-3 text-right">{t("produse_col_price")}</th>
            <th className="px-4 py-3 text-right">{t("produse_col_cost")}</th>
            <th className="px-4 py-3 text-right">{t("produse_col_margin")}</th>
            <th className="px-4 py-3 text-right">{t("produse_col_stock")}</th>
            <th className="px-4 py-3">{t("produse_col_location")}</th>
            <th className="px-4 py-3 text-right">&nbsp;</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((p) => (
            <tr key={p.id} className="transition-colors hover:bg-surface-elevated">
              <td className="px-4 py-3 font-mono text-xs">{p.part_code ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="line-clamp-1 font-medium">
                  {p.name_ro ?? p.name_en ?? "—"}
                </div>
                {!p.is_active ? (
                  <span className="inline-block rounded bg-warning/15 px-1.5 text-[10px] uppercase tracking-wide text-warning">
                    {t("produse_inactive_badge")}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-muted-strong">{p.brand ?? "—"}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {p.price !== null ? <Price value={p.price} size="sm" accent={false} /> : "—"}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-muted">
                {p.cost_price !== null ? <Price value={p.cost_price} size="sm" accent={false} /> : "—"}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {p.margin_pct !== null ? (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5",
                      p.margin_pct < 0
                        ? "bg-destructive/10 text-destructive"
                        : p.margin_pct < 15
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success",
                    )}
                  >
                    {p.margin_pct.toFixed(1)}%
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                <span
                  className={cn(
                    (p.stock_quantity ?? 0) === 0
                      ? "text-destructive"
                      : (p.stock_quantity ?? 0) <= 5
                        ? "text-warning"
                        : "",
                  )}
                >
                  {p.stock_quantity ?? 0}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted">{p.storage_location ?? "—"}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/panel/produse/${p.id}` as "/panel"}
                  locale={locale}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Edit3 className="size-3" />
                  {t("action_edit")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
