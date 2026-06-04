import { Building2, User } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n/routing";
import { Price } from "@/components/common/Price";
import { PinDeleteButton } from "@/components/panel/documents/PinDeleteButton";
import { deleteClientWithPin } from "@/lib/panel/clienti/actions";
import { cn } from "@/lib/utils/cn";
import type { PanelClientRow } from "@/lib/panel/clienti/queries";

export async function ClientsTable({
  rows,
  locale,
  emptyLabel,
}: {
  rows: PanelClientRow[];
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
            <th className="px-4 py-3">{t("clienti_col_client")}</th>
            <th className="px-4 py-3">{t("clienti_col_contact")}</th>
            <th className="px-4 py-3">{t("clienti_col_type")}</th>
            <th className="px-4 py-3 text-right">{t("clienti_col_discount")}</th>
            <th className="px-4 py-3 text-right">{t("clienti_col_orders")}</th>
            <th className="px-4 py-3 text-right">{t("clienti_col_total")}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-surface">
          {rows.map((r) => {
            const isBusiness = r.account_type === "business";
            return (
              <tr key={r.id} className="transition-colors hover:bg-surface-elevated">
                <td className="px-4 py-3">
                  <Link
                    href={`/panel/clienti/${r.id}` as "/panel"}
                    locale={locale}
                    className="flex items-center gap-2 font-medium text-foreground hover:text-primary"
                  >
                    <span
                      className={cn(
                        "grid size-8 place-items-center rounded-full",
                        isBusiness ? "bg-primary/10 text-primary" : "bg-surface-elevated text-muted",
                      )}
                    >
                      {isBusiness ? <Building2 className="size-4" /> : <User className="size-4" />}
                    </span>
                    <span className="flex flex-col">
                      <span>
                        {isBusiness
                          ? r.company_name ?? r.full_name ?? r.email ?? "—"
                          : r.full_name ?? r.email ?? "—"}
                      </span>
                      {r.idno ? (
                        <span className="text-xs text-muted">IDNO {r.idno}</span>
                      ) : null}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-strong">
                  <div className="text-sm">{r.email ?? "—"}</div>
                  <div className="text-xs text-muted">{r.phone ?? ""}</div>
                </td>
                <td className="px-4 py-3 text-muted-strong">
                  {isBusiness ? t("clienti_type_b2b") : t("clienti_type_b2c")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {r.discount_percent ? `${r.discount_percent}%` : "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{r.orders_count}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {r.orders_count > 0 ? (
                    <Price value={r.total_spent} size="sm" accent={false} />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <PinDeleteButton
                    action={deleteClientWithPin}
                    entityId={r.id}
                    compact
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
