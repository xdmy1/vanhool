import { getTranslations, setRequestLocale } from "next-intl/server";
import { AlertTriangle, CheckCircle2, ExternalLink, Printer, X } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { MarkInvoicePaidButton } from "@/components/panel/documents/MarkInvoicePaidButton";
import { SendToAccountantButton } from "@/components/panel/documents/SendToAccountantButton";
import { SendMonthlyDocsButton } from "@/components/panel/documents/SendMonthlyDocsButton";
import { PinDeleteButton } from "@/components/panel/documents/PinDeleteButton";
import {
  deleteInvoiceWithPin,
  sendConta1InvoicesMonthly,
} from "@/lib/panel/invoices/actions";
import { Link } from "@/lib/i18n/routing";
import { listInvoices } from "@/lib/panel/invoices/queries";
import { cn } from "@/lib/utils/cn";

// Day boundaries in Europe/Chisinau (where the user operates).
// `Intl` with `en-CA` gives YYYY-MM-DD; comparing as strings is enough since
// `issued_date` is a DATE column.
function chisinauToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Chisinau",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function shiftDays(yyyymmdd: string, days: number): string {
  const d = new Date(`${yyyymmdd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Monday-based week (RO convention).
function startOfWeekMonday(yyyymmdd: string): string {
  const d = new Date(`${yyyymmdd}T00:00:00Z`);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const delta = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function startOfMonth(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 7)}-01`;
}

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted/20 text-muted-strong",
  issued: "bg-primary/10 text-primary",
  overdue: "bg-destructive/10 text-destructive",
  paid: "bg-success/10 text-success",
  void: "bg-destructive/10 text-destructive",
};

function isOverdue(row: { status: string; due_date: string | null }): boolean {
  if (row.status !== "issued" || !row.due_date) return false;
  return new Date(row.due_date) < new Date(new Date().toISOString().slice(0, 10));
}

export default async function PanelFacturiPage({
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
  const scopeParam =
    typeof sp.scope === "string" && (sp.scope === "conta1" || sp.scope === "conta2")
      ? (sp.scope as "conta1" | "conta2")
      : undefined;
  const fromParam = typeof sp.from === "string" && sp.from ? sp.from : undefined;
  const toParam = typeof sp.to === "string" && sp.to ? sp.to : undefined;
  const overdueOnly = sp.overdue === "1";

  const rows = await listInvoices({
    q,
    type: "invoice",
    scope: scopeParam,
    from: fromParam,
    to: toParam,
    overdueOnly,
  });
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const statusLabel = (s: string) =>
    t(`facturi_status_${s}` as "facturi_status_draft");

  const chips: Array<{ id: "all" | "conta1" | "conta2"; label: string }> = [
    { id: "all", label: t("facturi_filter_all") },
    { id: "conta1", label: t("conta1") },
    { id: "conta2", label: t("conta2") },
  ];
  const activeChip: "all" | "conta1" | "conta2" = scopeParam ?? "all";

  // Date-range presets — anchored in Europe/Chisinau so "azi" matches the
  // operator's local calendar day, not UTC.
  const today = chisinauToday();
  const presets: Array<{ id: string; label: string; from?: string; to?: string }> = [
    { id: "today", label: t("facturi_date_today"), from: today, to: today },
    {
      id: "yesterday",
      label: t("facturi_date_yesterday"),
      from: shiftDays(today, -1),
      to: shiftDays(today, -1),
    },
    {
      id: "week",
      label: t("facturi_date_week"),
      from: startOfWeekMonday(today),
      to: today,
    },
    {
      id: "month",
      label: t("facturi_date_month"),
      from: startOfMonth(today),
      to: today,
    },
  ];
  const activePresetId = (() => {
    if (!fromParam && !toParam) return null;
    for (const p of presets) {
      if (p.from === fromParam && p.to === toParam) return p.id;
    }
    return "custom";
  })();

  // Build a base href that preserves every param except date filters — used by
  // both the preset chips (which then re-add from/to) and the reset link.
  const baseParams = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "from" || k === "to" || v === undefined) continue;
    baseParams.set(k, Array.isArray(v) ? v.join(",") : v);
  }
  const baseDateHref = baseParams.toString() ? `?${baseParams}` : "?";

  // Hidden inputs for the custom-range form — preserves scope, q, overdue etc.
  // so the form GET doesn't drop them when the operator picks an interval.
  const hiddenParams: Array<[string, string]> = [];
  for (const [k, v] of Object.entries(sp)) {
    if (k === "from" || k === "to" || v === undefined) continue;
    hiddenParams.push([k, Array.isArray(v) ? v.join(",") : v]);
  }

  const overdueHref = (() => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "overdue" || v === undefined) continue;
      next.set(k, Array.isArray(v) ? v.join(",") : v);
    }
    if (!overdueOnly) next.set("overdue", "1");
    return next.toString() ? `?${next}` : "?";
  })();

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("conta1_eyebrow")}
        title={t("facturi_title")}
        subtitle={t("facturi_subtitle")}
        actions={
          <SendMonthlyDocsButton
            action={sendConta1InvoicesMonthly}
            title={t("monthly_invoices_title")}
            label={t("monthly_invoices_label")}
          />
        }
      />

      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            placeholder={t("facturi_search_placeholder")}
            className="w-full max-w-md"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            {chips.map((c) => {
              const next = new URLSearchParams();
              for (const [k, v] of Object.entries(sp)) {
                if (k === "scope" || v === undefined) continue;
                next.set(k, Array.isArray(v) ? v.join(",") : v);
              }
              if (c.id !== "all") next.set("scope", c.id);
              const href = next.toString() ? `?${next.toString()}` : "?";
              const active = activeChip === c.id;
              return (
                <a
                  key={c.id}
                  href={href}
                  className={cn(
                    "inline-flex h-9 items-center rounded-md border px-3 text-xs transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface hover:border-primary/40 hover:text-primary",
                  )}
                >
                  {c.label}
                </a>
              );
            })}
            <a
              href={overdueHref}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs transition-colors",
                overdueOnly
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border bg-surface hover:border-destructive/40 hover:text-destructive",
              )}
            >
              <AlertTriangle className="size-3.5" />
              {t("facturi_status_overdue")}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((p) => {
            const next = new URLSearchParams(baseParams);
            if (p.from) next.set("from", p.from);
            if (p.to) next.set("to", p.to);
            const href = next.toString() ? `?${next}` : "?";
            const active = activePresetId === p.id;
            return (
              <a
                key={p.id}
                href={href}
                className={cn(
                  "inline-flex h-9 items-center rounded-md border px-3 text-xs transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface hover:border-primary/40 hover:text-primary",
                )}
              >
                {p.label}
              </a>
            );
          })}

          <form
            method="GET"
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md border px-2 text-xs",
              activePresetId === "custom"
                ? "border-primary bg-primary/10"
                : "border-border bg-surface",
            )}
          >
            {hiddenParams.map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <input
              type="date"
              name="from"
              defaultValue={fromParam ?? ""}
              className="h-7 rounded-sm border border-border bg-surface px-1 text-xs text-foreground"
            />
            <span className="text-muted">—</span>
            <input
              type="date"
              name="to"
              defaultValue={toParam ?? ""}
              className="h-7 rounded-sm border border-border bg-surface px-1 text-xs text-foreground"
            />
            <button
              type="submit"
              className="inline-flex h-7 items-center rounded-sm border border-primary/40 bg-primary/10 px-2 text-xs text-primary transition-colors hover:bg-primary/15"
            >
              {t("facturi_date_custom_apply")}
            </button>
          </form>

          {(fromParam || toParam) ? (
            <a
              href={baseDateHref}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-2.5 text-xs text-muted-strong transition-colors hover:border-destructive/40 hover:text-destructive"
            >
              <X className="size-3" />
              {t("facturi_date_reset")}
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
            {t("facturi_empty")}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-elevated text-left text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">{t("facturi_col_number")}</th>
                  <th className="px-4 py-3">{t("facturi_col_date")}</th>
                  <th className="px-4 py-3">{t("facturi_col_client")}</th>
                  <th className="px-4 py-3">{t("facturi_col_source")}</th>
                  <th className="px-4 py-3">{t("facturi_col_scope")}</th>
                  <th className="px-4 py-3">{t("facturi_col_status")}</th>
                  <th className="px-4 py-3 text-right">{t("facturi_col_total")}</th>
                  <th className="px-4 py-3">{t("facturi_col_refrens")}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-elevated">
                    <td className="px-4 py-3 font-mono text-xs">
                      {r.series ?? ""}-{r.number ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-strong">
                      {new Date(r.issued_date).toLocaleDateString(dateLocale)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{r.customer_snapshot?.name ?? "—"}</div>
                      {r.customer_snapshot?.idno ? (
                        <div className="text-xs text-muted">IDNO {r.customer_snapshot.idno}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {r.proforma_id ? (
                        <span className="inline-flex items-center gap-1 rounded bg-info/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-info">
                          {t("facturi_source_proforma")}
                        </span>
                      ) : r.order_id ? (
                        <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-success">
                          {t("facturi_source_sale")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-muted/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-strong">
                          {t("facturi_source_manual")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] uppercase tracking-wide",
                          r.account_scope === "conta1"
                            ? "bg-primary/10 text-primary"
                            : "bg-warning/10 text-warning",
                        )}
                      >
                        {r.account_scope === "conta1" ? t("conta1") : t("conta2")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] uppercase tracking-wide",
                          isOverdue(r) ? STATUS_TONE.overdue : STATUS_TONE[r.status],
                        )}
                      >
                        {isOverdue(r)
                          ? t("facturi_status_overdue")
                          : statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {r.total.toFixed(2)} {r.currency}
                    </td>
                    <td className="px-4 py-3">
                      {r.refrens_url ? (
                        <a
                          href={r.refrens_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="size-3" />
                          PDF
                        </a>
                      ) : r.refrens_invoice_id ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success">
                          <CheckCircle2 className="size-3" />
                          {r.refrens_invoice_id.slice(0, 8)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={`/panel/facturi/${r.id}/print` as "/panel"}
                          locale={locale}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted-strong transition-colors hover:border-primary/40 hover:text-primary"
                          title={t("action_print")}
                        >
                          <Printer className="size-3.5" />
                          {t("action_print")}
                        </Link>
                        <SendToAccountantButton
                          invoiceId={r.id}
                          initialSentAt={r.accountant_sent_at}
                          compact
                        />
                        <PinDeleteButton
                          action={deleteInvoiceWithPin}
                          entityId={r.id}
                          compact
                        />
                        {r.status === "issued" ? (
                          <MarkInvoicePaidButton
                            invoiceId={r.id}
                            defaultAmount={r.total}
                            defaultCurrency={r.currency}
                            variant="compact"
                          />
                        ) : null}
                        {r.order_id ? (
                          <Link
                            href={`/admin/orders/${r.order_id}` as "/admin"}
                            locale={locale}
                            className="text-xs text-primary hover:underline"
                          >
                            {t("facturi_col_order")}
                          </Link>
                        ) : null}
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
