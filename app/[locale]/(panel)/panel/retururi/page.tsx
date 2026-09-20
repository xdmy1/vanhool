import { getTranslations, setRequestLocale } from "next-intl/server";
import { Printer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { SendToAccountantButton } from "@/components/panel/documents/SendToAccountantButton";
import { Link } from "@/lib/i18n/routing";
import { sendReturnToAccountant } from "@/lib/panel/returns/actions";
import { listReturnInvoices } from "@/lib/panel/returns/queries";
import { getActiveBook } from "@/lib/panel/scope";
import { cn } from "@/lib/utils/cn";
import { TIMEZONE } from "@/lib/datetime";

const KIND_TONE: Record<"invoice" | "purchase", string> = {
  invoice: "bg-primary/10 text-primary",
  purchase: "bg-warning/15 text-warning",
};

/**
 * Facturi retur — every return made with the «Retur» button on an invoice or
 * purchase line shows up here as a numbered document, ready to print and to
 * forward to the bookkeeper. Nothing is created on this page: returns are made
 * on the parent document, this is their register.
 */
export default async function PanelRetururiPage({
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

  const scope = await getActiveBook(sp);
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const kindParam =
    sp.kind === "invoice" || sp.kind === "purchase" ? sp.kind : undefined;
  const { migrated, rows } = await listReturnInvoices({ scope, kind: kindParam, q });
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";

  function kindHref(id: "invoice" | "purchase" | null): string {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "kind" || v === undefined) continue;
      next.set(k, Array.isArray(v) ? v.join(",") : v);
    }
    if (id) next.set("kind", id);
    return next.toString() ? `?${next}` : "?";
  }
  const kindChips: Array<{ id: "invoice" | "purchase" | null; label: string }> = [
    { id: null, label: t("facturi_filter_all") },
    { id: "invoice", label: "Retur client" },
    { id: "purchase", label: "Retur furnizor" },
  ];

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={scope === "conta1" ? t("conta1_eyebrow") : t("conta2_eyebrow")}
        title={t("nav_retururi")}
        subtitle="Se generează automat la fiecare retur făcut pe o factură sau pe o achiziție."
      />

      <div className="mt-6 max-w-md">
        <SearchInput placeholder="Caută după număr, partener, document sau cod…" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {kindChips.map((c) => (
          <a
            key={c.id ?? "all"}
            href={kindHref(c.id)}
            className={cn(
              "inline-flex h-8 items-center rounded-md border px-3 text-[11px] uppercase tracking-wide transition-colors",
              (kindParam ?? null) === c.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface hover:border-primary/40 hover:text-primary",
            )}
          >
            {c.label}
          </a>
        ))}
      </div>

      <div className="mt-6">
        {!migrated ? (
          <div className="rounded-md border border-warning/40 bg-warning/10 p-6 text-sm text-warning">
            Facturile de retur nu sunt încă activate — rulează{" "}
            <span className="font-mono">sql/return-invoices.sql</span> în Supabase Studio.
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
            Nicio factură de retur. Returul se face cu butonul «Retur» de pe linia unei
            facturi sau a unei achiziții.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Nr.</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Tip</th>
                  <th className="px-4 py-3">Partener</th>
                  <th className="px-4 py-3">Document inițial</th>
                  <th className="px-4 py-3 text-right">Linii</th>
                  <th className="px-4 py-3 text-right">Total retur</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {rows.map((r) => (
                  <tr key={r.number} className="hover:bg-surface-elevated">
                    <td className="px-4 py-3 font-mono text-xs">{r.label}</td>
                    <td className="px-4 py-3 text-muted-strong">
                      {new Date(r.date).toLocaleDateString(dateLocale, { timeZone: TIMEZONE })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] uppercase tracking-wide",
                          KIND_TONE[r.kind],
                        )}
                      >
                        {r.kind === "invoice" ? "Retur client" : "Retur furnizor"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{r.party.name}</div>
                      {r.party.idno ? (
                        <div className="text-xs text-muted">IDNO {r.party.idno}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={
                          (r.kind === "invoice"
                            ? `/panel/facturi/${r.parent_id}`
                            : `/panel/achizitii/${r.parent_id}`) as "/panel"
                        }
                        locale={locale}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {r.parent_label}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.lines.length}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-destructive">
                      −{r.total.toFixed(2)} {r.currency}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/panel/retururi/${r.number}/print` as "/panel"}
                          locale={locale}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted-strong transition-colors hover:border-primary/40 hover:text-primary"
                          title={t("action_print")}
                        >
                          <Printer className="size-3.5" />
                          {t("action_print")}
                        </Link>
                        {r.kind === "invoice" || r.account_scope === "conta1" ? (
                          <SendToAccountantButton
                            invoiceId={String(r.number)}
                            initialSentAt={r.accountant_sent_at}
                            enteredAt={r.accountant_entered_at}
                            action={sendReturnToAccountant}
                            localFallback={false}
                            compact
                          />
                        ) : null}
                        <Link
                          href={`/panel/retururi/${r.number}` as "/panel"}
                          locale={locale}
                          className="text-xs text-primary hover:underline"
                        >
                          {t("action_open")}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
