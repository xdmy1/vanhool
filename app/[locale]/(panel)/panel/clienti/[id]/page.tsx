import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Building2, Edit3, User } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { Price } from "@/components/common/Price";
import { PinDeleteButton } from "@/components/panel/documents/PinDeleteButton";
import { deleteClientWithPin } from "@/lib/panel/clienti/actions";
import { getPanelClient } from "@/lib/panel/clienti/queries";
import { getActiveBook } from "@/lib/panel/scope";
import { cn } from "@/lib/utils/cn";

export default async function PanelClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale, id }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  const scope = await getActiveBook(sp);
  const client = await getPanelClient(id, scope);
  if (!client) notFound();

  const isBusiness = client.account_type === "business";
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(dateLocale) : "—";
  const bookLabel = scope === "conta1" ? t("conta1") : t("conta2");

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/clienti", label: t("clienti_detail_back"), locale }}
        title={
          isBusiness
            ? client.company_name ?? client.full_name ?? client.email ?? id
            : client.full_name ?? client.email ?? id
        }
        subtitle={
          isBusiness && client.idno
            ? t("clienti_detail_company", { idno: client.idno })
            : t("clienti_detail_individual")
        }
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="gap-1.5">
              <Link
                href={`/panel/clienti/${id}/edit` as "/panel"}
                locale={locale}
              >
                <Edit3 className="size-4" />
                {t("action_edit")}
              </Link>
            </Button>
            <PinDeleteButton
              action={deleteClientWithPin}
              entityId={id}
              redirectTo={`/${locale}/panel/clienti`}
            />
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-md border border-border bg-surface p-5 lg:col-span-1">
          <div className="mb-4 flex items-center gap-3">
            <span
              className={cn(
                "grid size-12 place-items-center rounded-full",
                isBusiness ? "bg-primary/10 text-primary" : "bg-surface-elevated text-muted",
              )}
            >
              {isBusiness ? <Building2 className="size-5" /> : <User className="size-5" />}
            </span>
            <div>
              <div className="text-sm font-semibold">{client.email ?? "—"}</div>
              <div className="text-xs text-muted">{client.phone ?? ""}</div>
            </div>
          </div>

          <dl className="space-y-2 text-sm">
            <Row label={t("clienti_detail_label_discount")}>
              {client.discount_percent ? `${client.discount_percent}%` : "—"}
            </Row>
            <Row label={t("clienti_detail_label_type")}>
              {isBusiness ? t("clienti_type_b2b") : t("clienti_type_b2c")}
            </Row>
            {isBusiness ? (
              <>
                <Row label={t("clienti_detail_label_legal_form")}>{client.legal_form ?? "—"}</Row>
                <Row label={t("clienti_detail_label_vat")}>{client.vat_code ?? "—"}</Row>
              </>
            ) : null}
            <Row label={t("clienti_detail_label_member_since")}>{fmtDate(client.created_at)}</Row>
          </dl>

          {(client.billing_country || client.billing_city) ? (
            <div className="mt-4 border-t border-border pt-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                {t("clienti_detail_billing_address")}
              </div>
              <div className="mt-1 text-sm text-muted-strong">
                {[client.billing_street, client.billing_city, client.billing_district, client.billing_postal, client.billing_country]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-md border border-border bg-surface p-5 lg:col-span-2">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {t("clienti_detail_activity", { book: bookLabel })}
            </h2>
          </header>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label={t("clienti_detail_total_orders")} value={String(client.orders_count)} />
            <Stat
              label={t("clienti_detail_total_spent")}
              value={<Price value={client.total_spent} size="lg" accent={false} />}
            />
          </div>

          <div className="mt-6">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              {t("clienti_detail_recent_orders")}
            </div>
            {client.recent_orders.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted">
                {t("clienti_detail_no_orders")}
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border">
                {client.recent_orders.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/admin/orders/${o.id}` as "/admin"}
                      locale={locale}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface-elevated"
                    >
                      <span className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</span>
                      <span
                        className={cn(
                          "rounded px-1.5 text-[10px] uppercase tracking-wide",
                          o.account_scope === "conta1"
                            ? "bg-primary/10 text-primary"
                            : "bg-warning/15 text-warning",
                        )}
                      >
                        {o.account_scope === "conta1" ? t("conta1") : t("conta2")}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-muted">
                        {o.source}
                      </span>
                      <span className="ml-auto text-xs text-muted-strong">
                        {fmtDate(o.created_at)}
                      </span>
                      <span className="w-28 text-right tabular-nums">
                        {o.total !== null ? (
                          <Price value={Number(o.total)} size="sm" accent={false} />
                        ) : (
                          "—"
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-1.5 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
