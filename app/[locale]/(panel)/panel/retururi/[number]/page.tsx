import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Printer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SendToAccountantButton } from "@/components/panel/documents/SendToAccountantButton";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/routing";
import { sendReturnToAccountant } from "@/lib/panel/returns/actions";
import { getReturnInvoice } from "@/lib/panel/returns/queries";
import { TIMEZONE } from "@/lib/datetime";

export default async function PanelReturDetailPage({
  params,
}: {
  params: Promise<{ locale: string; number: string }>;
}) {
  const [{ locale, number }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  const ret = await getReturnInvoice(Number(number));
  if (!ret) notFound();

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const fmtDay = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(dateLocale, { timeZone: TIMEZONE }) : "—";
  const isPurchase = ret.kind === "purchase";
  const kindLabel = isPurchase ? "Retur către furnizor" : "Retur de la client";
  const parentHref = isPurchase
    ? `/panel/achizitii/${ret.parent_id}`
    : `/panel/facturi/${ret.parent_id}`;
  const canSend = ret.kind === "invoice" || ret.account_scope === "conta1";

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{ href: "/panel/retururi", label: t("clienti_detail_back"), locale }}
        title={`Factură de retur ${ret.label}`}
        subtitle={`${kindLabel} · ${ret.party.name} · ${fmtDay(ret.date)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="gap-1.5">
              <Link href={`/panel/retururi/${ret.number}/print` as "/panel"} locale={locale}>
                <Printer className="size-4" />
                {t("action_print")}
              </Link>
            </Button>
            {canSend ? (
              <SendToAccountantButton
                invoiceId={String(ret.number)}
                initialSentAt={ret.accountant_sent_at}
                enteredAt={ret.accountant_entered_at}
                action={sendReturnToAccountant}
                localFallback={false}
              />
            ) : null}
          </div>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-md border border-border bg-surface p-5 lg:col-span-1">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            {isPurchase ? "Furnizor" : "Client"}
          </h3>
          <p className="font-semibold">{ret.party.name}</p>
          {ret.party.idno ? <p className="text-xs text-muted">IDNO {ret.party.idno}</p> : null}
          {ret.party.vat_code ? <p className="text-xs">Cod TVA: {ret.party.vat_code}</p> : null}
          {ret.party.address ? <p className="mt-2 text-sm">{ret.party.address}</p> : null}

          <dl className="mt-5 grid grid-cols-2 gap-2 text-xs">
            <dt className="text-muted">Data returului</dt>
            <dd>{fmtDay(ret.date)}</dd>
            <dt className="text-muted">Document inițial</dt>
            <dd>
              <Link
                href={parentHref as "/panel"}
                locale={locale}
                className="font-mono text-primary hover:underline"
              >
                {ret.parent_label}
              </Link>
              {ret.parent_date ? (
                <span className="text-muted"> · {fmtDay(ret.parent_date)}</span>
              ) : null}
            </dd>
            <dt className="text-muted">{t("scope_label")}</dt>
            <dd>{ret.account_scope === "conta1" ? t("conta1") : t("conta2")}</dd>
          </dl>
          <p className="mt-4 text-[11px] text-muted">
            Liniile se anulează din anexa documentului inițial.
          </p>
        </section>

        <section className="overflow-x-auto rounded-md border border-border bg-surface lg:col-span-2">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Cod</th>
                <th className="px-4 py-3">Denumire</th>
                <th className="px-4 py-3 text-right">Cant.</th>
                <th className="px-4 py-3 text-right">Net</th>
                <th className="px-4 py-3 text-right">TVA</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ret.lines.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 font-mono text-xs">{l.part_code ?? "—"}</td>
                  <td className="px-4 py-2">
                    <div>{l.name ?? "—"}</div>
                    {l.reason ? <div className="text-xs text-muted">{l.reason}</div> : null}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{Number(l.quantity)}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-destructive">
                    −{Number(l.net_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-destructive">
                    −{Number(l.vat_amount).toFixed(2)}
                    <div className="text-[10px] text-muted">{Number(l.vat_rate)}%</div>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-semibold text-destructive">
                    −{Number(l.total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-surface-elevated">
                <td colSpan={3} className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted">
                  Total retur
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-destructive">
                  −{ret.net.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-destructive">
                  −{ret.vat.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-base font-bold text-destructive">
                  −{ret.total.toFixed(2)} {ret.currency}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>
      </div>
    </div>
  );
}
