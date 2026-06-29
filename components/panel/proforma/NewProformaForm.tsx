"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Save,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import {
  issueProforma,
  updateInvoice,
  updateProforma,
} from "@/lib/panel/invoices/actions";
import { PartCodeAutocomplete } from "@/components/panel/proforma/PartCodeAutocomplete";
import { PriceWithVatHelper } from "@/components/common/PriceWithVatHelper";
import { MarkupShortcuts } from "@/components/panel/sales/MarkupShortcuts";
import {
  type ClientSearchResult,
  listAllPanelClients,
} from "@/lib/panel/sales/actions";

type Line = {
  part_code: string;
  name: string;
  description: string;
  quantity: number;
  /** Unit of measure shown on the fiscal line (buc / l / m). */
  unit: "buc" | "l" | "m";
  /** Normal "list" price per unit, VAT-inclusive (conta1) or net (conta2). */
  unit_price: number;
  /**
   * Optional per-line discounted price. null / >= unit_price → no discount
   * on this line.
   */
  discounted_unit_price: number | null;
  vat_rate: number;
  /**
   * Cost from the catalog (MDL). Stays on the wizard side only — never
   * sent to the server — and powers the "Marja X%" indicator next to the
   * unit price so the operator sees the realised margin while pricing.
   */
  cost_price: number;
  /** Catalog list price (products.price). Shown small + yellow next to the
   * part as a stable reference, even after the operator overrides the price. */
  catalog_price: number;
};

type WalkIn = {
  name: string;
  company_name: string;
  email: string;
  phone: string;
  idno: string;
  vat_number: string;
  address: string;
};

// Default VAT rate per book — conta 2 is non-fiscal, so the price stays
// the price.
function defaultVatFor(scope: "conta1" | "conta2"): number {
  return scope === "conta2" ? 0 : 20;
}

// Fixed conversion rates (owner uses a predictable 20/17, not the live rate).
// Catalog prices are stored in MDL; when the proforma runs in EUR/USD every
// price is converted so the document totals are REAL EUR/USD — not MDL numbers
// wearing a EUR label (which billed a 4000-lei part as 4000 €).
const RATES_TO_MDL: Record<"MDL" | "EUR" | "USD", number> = {
  MDL: 1,
  EUR: 20,
  USD: 17,
};
function convertPrice(
  value: number,
  from: "MDL" | "EUR" | "USD",
  to: "MDL" | "EUR" | "USD",
): number {
  if (from === to) return value;
  const inMdl = value * RATES_TO_MDL[from];
  return Math.round((inMdl / RATES_TO_MDL[to]) * 100) / 100;
}

const EMPTY_LINE: Line = {
  part_code: "",
  name: "",
  description: "",
  quantity: 1,
  unit: "buc",
  unit_price: 0,
  discounted_unit_price: null,
  // Prices are entered VAT-inclusive (Moldova: standard 20% TVA on conta1).
  // The totals computation extracts the net + VAT components from the gross.
  vat_rate: 20,
  cost_price: 0,
  catalog_price: 0,
};

// Synthetic placeholder used when a client is created without a real email.
// Not the customer's address, so don't propagate it onto documents.
const PLACEHOLDER_EMAIL_RE = /^panel-[a-f0-9-]+@inter-bus\.md$/i;
function realEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return PLACEHOLDER_EMAIL_RE.test(email) ? null : email;
}

const EMPTY_WALKIN: WalkIn = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  idno: "",
  vat_number: "",
  address: "",
};

export type ProformaInitial = {
  id: string;
  walkin: WalkIn;
  lines: Line[];
  scope: "conta1" | "conta2";
  currency: "MDL" | "EUR" | "USD";
  outputLocale: "ro" | "en" | "ru";
  dueDays: number;
  notes: string;
  discountPercent?: number;
};

export function NewProformaForm({
  locale,
  initial,
  /**
   * What kind of document this form is editing. Default "proforma"
   * keeps existing callers behaving exactly as before; "invoice"
   * switches the EDIT path to updateInvoice and bounces back to
   * /panel/facturi instead of /panel/proforme on success. Only
   * relevant when `initial` is set — there is no create-flow for
   * fiscal invoices from this form.
   */
  documentType = "proforma",
}: {
  locale: string;
  initial?: ProformaInitial;
  documentType?: "proforma" | "invoice";
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const isEdit = !!initial;

  const [scope, setScopeState] = useState<"conta1" | "conta2">(initial?.scope ?? "conta1");
  const [client, setClient] = useState<ClientSearchResult | null>(null);
  // Default to the existing-clients picker (matches the new-sale wizard).
  // Walk-in mode is one tab click away — but the common case is selling to
  // a registered customer, so don't make the operator switch every time.
  const [walkinMode, setWalkinMode] = useState(false);
  const [walkin, setWalkin] = useState<WalkIn>(initial?.walkin ?? EMPTY_WALKIN);
  const [lines, setLines] = useState<Line[]>(
    initial?.lines ?? [{ ...EMPTY_LINE, vat_rate: defaultVatFor(initial?.scope ?? "conta1") }],
  );
  const [currency, setCurrency] = useState<"MDL" | "EUR" | "USD">(initial?.currency ?? "MDL");
  const [outputLocale, setOutputLocale] = useState<"ro" | "en" | "ru">(
    initial?.outputLocale ?? "ro",
  );
  const [dueDays, setDueDays] = useState(initial?.dueDays ?? 7);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [pending, startSubmit] = useTransition();

  // Switching books flips every line's VAT — conta 2 is always 0%, conta 1
  // always 20%. The per-line TVA column is read-only (scope-driven); the
  // operator cannot tweak it.
  function setScope(next: "conta1" | "conta2") {
    setScopeState(next);
    const vat = defaultVatFor(next);
    setLines((prev) => prev.map((l) => ({ ...l, vat_rate: vat })));
  }

  // Flipping the document currency rescales every already-entered price so the
  // operator doesn't re-type them — and so the totals stay in the real
  // currency instead of MDL numbers labelled EUR.
  function changeCurrency(next: "MDL" | "EUR" | "USD") {
    if (next === currency) return;
    setLines((prev) =>
      prev.map((l) => ({
        ...l,
        unit_price: convertPrice(l.unit_price, currency, next),
        discounted_unit_price:
          l.discounted_unit_price != null
            ? convertPrice(l.discounted_unit_price, currency, next)
            : null,
      })),
    );
    setCurrency(next);
  }

  const totals = useMemo(() => {
    // unit_price is VAT-inclusive — break the gross back into net + vat so the
    // proforma still itemizes TVA on the printed document. The "effective"
    // gross per line uses the discounted price when one is set; the
    // "before discount" gross uses the list price so the print stack can
    // surface both numbers.
    let net = 0;
    let gross = 0;
    let grossBeforeDiscount = 0;
    // TVA is driven purely by the book, never per line — keeps the footer in
    // sync with the read-only per-line breakdown and with the server (which
    // forces the same rate). conta1 → 20%, conta2 → 0%.
    const docVatRate = scope === "conta1" ? 20 : 0;
    for (const l of lines) {
      const eff =
        l.discounted_unit_price != null && l.discounted_unit_price < l.unit_price
          ? l.discounted_unit_price
          : l.unit_price;
      const lineGross = l.quantity * eff;
      const lineGrossBefore = l.quantity * l.unit_price;
      const factor = 1 + docVatRate / 100;
      const lineNet = factor > 0 ? lineGross / factor : lineGross;
      gross += lineGross;
      grossBeforeDiscount += lineGrossBefore;
      net += lineNet;
    }
    const grossRounded = Number(gross.toFixed(2));
    const subtotalRounded = Number(net.toFixed(2));
    const grossBeforeRounded = Number(grossBeforeDiscount.toFixed(2));
    const discountAmount = Number((grossBeforeRounded - grossRounded).toFixed(2));
    const pct =
      grossBeforeRounded > 0 && discountAmount > 0
        ? Math.min(
            100,
            Number(((discountAmount / grossBeforeRounded) * 100).toFixed(2)),
          )
        : 0;
    return {
      subtotal: subtotalRounded,
      // Residual so subtotal + vat === total (matches the server's totals()).
      vat: Number((grossRounded - subtotalRounded).toFixed(2)),
      grossBeforeDiscount: grossBeforeRounded,
      discountPercent: pct,
      discountAmount,
      total: grossRounded,
    };
  }, [lines, scope]);

  function setLine(idx: number, patch: Partial<Line>) {
    setLines(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines([...lines, { ...EMPTY_LINE, vat_rate: defaultVatFor(scope) }]);
  }
  function removeLine(idx: number) {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  }

  function submit() {
    const validLines = lines.filter(
      (l) => l.name.trim().length > 0 && l.quantity > 0,
    );
    if (validLines.length === 0) {
      toast.error(t("proforma_form_lines_validation"));
      return;
    }

    // Build customer payload from client OR walk-in.
    let customer:
      | {
          user_id?: string | null;
          name: string;
          email?: string | null;
          phone?: string | null;
          idno?: string | null;
          vat_number?: string | null;
          address?: string | null;
        }
      | null = null;
    if (client) {
      customer = {
        user_id: client.id,
        name:
          client.account_type === "business"
            ? client.company_name ?? client.full_name ?? client.email ?? "Client"
            : client.full_name ?? client.email ?? "Client",
        email: realEmail(client.email),
        phone: client.phone,
        idno: client.idno,
        address: client.billing_address,
      };
    } else {
      if (!walkin.name.trim() && !walkin.company_name.trim()) {
        toast.error(t("proforma_form_customer_validation"));
        return;
      }
      customer = {
        name: walkin.company_name.trim() || walkin.name.trim(),
        email: walkin.email || null,
        phone: walkin.phone || null,
        idno: walkin.idno || null,
        vat_number: walkin.vat_number || null,
        address: walkin.address || null,
      };
    }

    const payload = {
      order_id: null,
      customer,
      items: validLines.map((l) => ({
        product_id: null,
        part_code: l.part_code || null,
        name: l.name.trim(),
        description: l.description || null,
        quantity: l.quantity,
        unit: l.unit,
        unit_price: l.unit_price,
        discounted_unit_price:
          l.discounted_unit_price != null && l.discounted_unit_price < l.unit_price
            ? l.discounted_unit_price
            : null,
        vat_rate: l.vat_rate,
        // Carry the cost forward so the digital detail page shows
        // margin. Form gets cost_price from PartCodeAutocomplete on
        // selection — both for catalog rows and for draft-purchase
        // matches. Manual entries pass 0; null = unknown source.
        cost_price: l.cost_price > 0 ? l.cost_price : null,
      })),
      due_days: dueDays,
      currency,
      account_scope: scope,
      output_locale: outputLocale,
      notes: notes || null,
    };

    startSubmit(async () => {
      if (isEdit && initial) {
        const res =
          documentType === "invoice"
            ? await updateInvoice(initial.id, payload)
            : await updateProforma(initial.id, payload);
        if (res.ok) {
          toast.success(t("proforma_updated_success"));
          const base =
            documentType === "invoice"
              ? `/${locale}/panel/facturi`
              : `/${locale}/panel/proforme`;
          router.push(`${base}/${initial.id}`);
        } else {
          toast.error(t("sale_error", { reason: res.reason }));
        }
        return;
      }
      const res = await issueProforma(payload);
      if (res.ok) {
        toast.success(t("proforma_created_success", { number: res.number }));
        router.push(`/${locale}/panel/proforme/${res.id}`);
      } else {
        toast.error(t("sale_error", { reason: res.reason }));
      }
    });
  }

  return (
    <div className="space-y-6">
      <CustomerSection
        client={client}
        setClient={(c) => {
          setClient(c);
          if (c) setWalkinMode(false);
        }}
        walkinMode={walkinMode}
        setWalkinMode={(v) => {
          setWalkinMode(v);
          if (v) setClient(null);
        }}
        walkin={walkin}
        setWalkin={setWalkin}
      />

      <section className="rounded-md border border-border bg-surface p-5">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("proforma_form_lines_section")}
          </h3>
          <Button type="button" variant="ghost" size="sm" onClick={addLine}>
            <Plus className="size-4" />
            {t("proforma_form_line_add")}
          </Button>
        </header>

        <p className="mb-3 text-xs text-muted-strong">
          {t("proforma_form_lines_help")}
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-2 py-2">{t("proforma_form_line_partcode")}</th>
                <th className="px-2 py-2">{t("proforma_form_line_name")}</th>
                <th className="px-2 py-2">U.M.</th>
                <th className="px-2 py-2 text-right">{t("proforma_form_line_qty")}</th>
                <th className="px-2 py-2 text-right">Preț fără TVA</th>
                <th className="px-2 py-2 text-right">{t("proforma_form_line_vat")}</th>
                <th className="px-2 py-2 text-right">Preț cu TVA</th>
                <th className="px-2 py-2 text-right">{t("sale_line_col_discount_price")}</th>
                <th className="px-2 py-2 text-right">{t("proforma_form_line_total")}</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines.map((l, idx) => {
                const hasDiscount =
                  l.discounted_unit_price != null &&
                  l.discounted_unit_price < l.unit_price;
                const eff = hasDiscount
                  ? (l.discounted_unit_price as number)
                  : l.unit_price;
                const linePct = hasDiscount
                  ? Math.max(0, (1 - eff / l.unit_price) * 100)
                  : 0;
                // Fiscal breakdown is driven purely by the book (scope), shown
                // read-only: conta1 extracts 20% out of the gross unit price,
                // conta2 is 0%. The operator only ever sets the gross price.
                const vatRate = scope === "conta1" ? 20 : 0;
                const netUnit =
                  vatRate > 0 ? l.unit_price / (1 + vatRate / 100) : l.unit_price;
                return (
                  <tr key={idx}>
                    <td className="px-2 py-2">
                      <PartCodeAutocomplete
                        value={l.part_code}
                        onChange={(v) => setLine(idx, { part_code: v })}
                        onSelect={(m) =>
                          setLine(idx, {
                            part_code: m.code,
                            // Only overwrite name when the operator hasn't typed
                            // a custom one yet — keeps manual edits intact.
                            name: l.name.trim() ? l.name : m.name,
                            // Catalog price is MDL — convert into the document
                            // currency so a 4000-lei part isn't seeded as 4000 €.
                            unit_price: convertPrice(m.unit_price, "MDL", currency),
                            cost_price: m.cost_price,
                            catalog_price: m.catalog_price,
                          })
                        }
                        placeholder={t("proforma_form_line_partcode_placeholder")}
                        emptyHint={t("proforma_form_line_partcode_empty")}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={l.name}
                        onChange={(e) => setLine(idx, { name: e.target.value })}
                        placeholder={t("proforma_form_line_name_placeholder")}
                        className="h-9 text-xs"
                      />
                      <Input
                        value={l.description}
                        onChange={(e) => setLine(idx, { description: e.target.value })}
                        placeholder={t("proforma_form_line_desc_placeholder")}
                        className="mt-1 h-8 text-[11px]"
                      />
                      {l.catalog_price > 0 ? (
                        <div className="mt-0.5 text-[10px] font-semibold text-yellow-500">
                          Preț piesă: {l.catalog_price.toFixed(2)} lei
                        </div>
                      ) : null}
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={l.unit}
                        onChange={(e) =>
                          setLine(idx, { unit: e.target.value as "buc" | "l" | "m" })
                        }
                        className="h-9 rounded-md border border-border bg-surface px-2 text-xs"
                      >
                        <option value="buc">buc</option>
                        <option value="l">l</option>
                        <option value="m">m</option>
                      </select>
                    </td>
                    <td className="px-2 py-2 text-right">
                      <Input
                        type="number"
                        step={l.unit === "buc" ? 1 : 0.001}
                        min={l.unit === "buc" ? 1 : 0.001}
                        value={l.quantity}
                        onChange={(e) => {
                          const raw = Number(e.target.value || 0);
                          setLine(idx, {
                            quantity:
                              l.unit === "buc"
                                ? Math.max(0, Math.trunc(raw))
                                : Math.max(0, raw),
                          });
                        }}
                        className="ml-auto h-9 w-20 text-right"
                      />
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted">
                      {netUnit.toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-muted">
                      {vatRate}%
                    </td>
                    <td className="px-2 py-2 text-right">
                      <PriceWithVatHelper
                        value={l.unit_price}
                        onChange={(v) => setLine(idx, { unit_price: v })}
                        step="0.01"
                        size="sm"
                        inputClassName="ml-auto h-9 w-24 text-right"
                      />
                      <div className="mt-0.5 flex items-center justify-end gap-1.5">
                        <MarkupShortcuts
                          cost={convertPrice(l.cost_price, "MDL", currency)}
                          unitPrice={l.unit_price}
                          onPick={(v) => setLine(idx, { unit_price: v })}
                        />
                        {l.cost_price > 0 ? (() => {
                          // Margin badge derived from the typed price — kept
                          // next to the shortcuts so the operator can
                          // double-check the figure. Cost is MDL, price is in
                          // the doc currency → convert before comparing.
                          const costInCur = convertPrice(l.cost_price, "MDL", currency);
                          const markup = ((l.unit_price - costInCur) / costInCur) * 100;
                          const sign = markup >= 0 ? "+" : "";
                          return (
                            <div
                              className={cn(
                                "text-[10px] font-semibold tabular-nums",
                                markup < 0
                                  ? "text-destructive"
                                  : markup < 10
                                    ? "text-warning"
                                    : "text-success",
                              )}
                              title={`Cost: ${costInCur.toFixed(2)} ${currency}`}
                            >
                              {sign}{markup.toFixed(0)}%
                            </div>
                          );
                        })() : null}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={l.discounted_unit_price ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setLine(idx, {
                            discounted_unit_price:
                              raw === "" ? null : Math.max(0, Number(raw)),
                          });
                        }}
                        placeholder={l.unit_price > 0 ? l.unit_price.toFixed(2) : "—"}
                        className="ml-auto h-9 w-24 text-right"
                      />
                      {hasDiscount ? (
                        <div className="mt-0.5 text-[10px] font-semibold text-success">
                          -{Math.round(linePct)}%
                        </div>
                      ) : null}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums font-semibold">
                      {hasDiscount ? (
                        <div className="text-[10px] text-muted line-through">
                          {(l.quantity * l.unit_price).toFixed(2)}
                        </div>
                      ) : null}
                      {(l.quantity * eff).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="text-destructive hover:text-destructive/80"
                        disabled={lines.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {totals.discountPercent > 0 ? (
                <>
                  <tr className="text-xs">
                    <td colSpan={8} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
                      {t("sale_review_subtotal_before_discount")}
                    </td>
                    <td colSpan={2} className="px-2 py-2 text-right tabular-nums text-muted line-through">
                      {totals.grossBeforeDiscount.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="text-xs text-success">
                    <td colSpan={8} className="px-2 py-2 text-right uppercase tracking-wide">
                      {t("sale_discount_line_label", { percent: Math.round(totals.discountPercent) })}
                    </td>
                    <td colSpan={2} className="px-2 py-2 text-right tabular-nums">
                      -{totals.discountAmount.toFixed(2)}
                    </td>
                  </tr>
                </>
              ) : null}
              <tr className="bg-surface-elevated text-xs">
                <td colSpan={8} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
                  {t("achizitii_subtotal")}
                </td>
                <td colSpan={2} className="px-2 py-2 text-right tabular-nums">
                  {totals.subtotal.toFixed(2)}
                </td>
              </tr>
              <tr className="text-xs">
                <td colSpan={8} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
                  {t("achizitii_vat_total")}
                </td>
                <td colSpan={2} className="px-2 py-2 text-right tabular-nums">
                  {totals.vat.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-surface-elevated text-sm font-bold">
                <td colSpan={8} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
                  {t("achizitii_total")}
                </td>
                <td colSpan={2} className="px-2 py-2 text-right tabular-nums">
                  {totals.total.toFixed(2)} {currency}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("proforma_form_settings_section")}
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={t("proforma_form_scope")}>
            <div className="inline-flex w-full rounded-md border border-border bg-surface p-0.5">
              {(["conta1", "conta2"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={cn(
                    "flex-1 rounded px-3 py-1.5 text-xs transition-colors",
                    scope === s
                      ? "bg-foreground text-background"
                      : "text-muted-strong hover:text-foreground",
                  )}
                >
                  {s === "conta1" ? t("conta1") : t("conta2")}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[11px] font-semibold">
              {scope === "conta1" ? (
                <span className="text-primary">= cu TVA 20%</span>
              ) : (
                <span className="text-warning">= fără TVA (0%)</span>
              )}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              {scope === "conta2"
                ? t("proforma_form_scope_hint_conta2")
                : t("proforma_form_scope_hint_conta1")}
            </p>
          </Field>
          <Field label={t("proforma_form_currency")}>
            <select
              value={currency}
              onChange={(e) => changeCurrency(e.target.value as "MDL" | "EUR" | "USD")}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="MDL">MDL</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </Field>
          <Field label={t("proforma_form_language")}>
            <select
              value={outputLocale}
              onChange={(e) => setOutputLocale(e.target.value as "ro" | "en" | "ru")}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="ro">Română</option>
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </Field>
          <Field label={t("proforma_form_due_days")}>
            <Input
              type="number"
              min={0}
              max={90}
              value={dueDays}
              onChange={(e) => setDueDays(Math.max(0, Number(e.target.value || 0)))}
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label={t("proforma_form_notes")}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
              placeholder={t("proforma_form_notes_placeholder")}
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={pending} className="gap-1.5">
          <Save className="size-4" />
          {pending
            ? t("sale_processing")
            : isEdit
              ? t("proforma_form_save_changes")
              : t("proforma_form_submit")}
        </Button>
      </div>
    </div>
  );
}

function CustomerSection({
  client,
  setClient,
  walkinMode,
  setWalkinMode,
  walkin,
  setWalkin,
}: {
  client: ClientSearchResult | null;
  setClient: (c: ClientSearchResult | null) => void;
  walkinMode: boolean;
  setWalkinMode: (v: boolean) => void;
  walkin: WalkIn;
  setWalkin: (w: WalkIn) => void;
}) {
  const t = useTranslations("panel");
  const [allClients, setAllClients] = useState<ClientSearchResult[]>([]);
  const [filter, setFilter] = useState("");
  const [loadingList, startLoad] = useTransition();

  useEffect(() => {
    if (client || walkinMode || allClients.length > 0) return;
    startLoad(async () => {
      const r = await listAllPanelClients();
      setAllClients(r);
    });
  }, [client, walkinMode, allClients.length]);

  const visibleClients = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return allClients;
    return allClients.filter((c) => {
      const fields = [c.company_name, c.full_name, c.email, c.phone, c.idno];
      return fields.some((f) => f?.toLowerCase().includes(term));
    });
  }, [allClients, filter]);

  if (client) {
    return (
      <section className="rounded-md border border-primary/30 bg-primary/5 p-5">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("sale_client_selected")}
          </h3>
          <button
            type="button"
            onClick={() => setClient(null)}
            className="text-xs text-primary hover:underline"
          >
            {t("sale_client_change")}
          </button>
        </header>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
            {client.account_type === "business" ? (
              <Building2 className="size-5" />
            ) : (
              <User className="size-5" />
            )}
          </span>
          <div>
            <div className="font-semibold">
              {client.account_type === "business"
                ? client.company_name ?? client.full_name ?? client.email
                : client.full_name ?? client.email}
            </div>
            <div className="text-xs text-muted-strong">
              {client.email} {client.phone ? `· ${client.phone}` : ""}
              {client.idno ? ` · IDNO ${client.idno}` : ""}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-border bg-surface p-5">
      <header className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setWalkinMode(false)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium",
            !walkinMode
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-strong hover:text-foreground",
          )}
        >
          {t("sale_client_search_existing")}
        </button>
        <button
          type="button"
          onClick={() => setWalkinMode(true)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium",
            walkinMode
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-strong hover:text-foreground",
          )}
        >
          {t("proforma_form_customer_manual")}
        </button>
      </header>

      {walkinMode ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={t("sale_client_walkin_name")} required>
            <Input
              value={walkin.name}
              onChange={(e) => setWalkin({ ...walkin, name: e.target.value })}
            />
          </Field>
          <Field label={t("sale_client_walkin_company")}>
            <Input
              value={walkin.company_name}
              onChange={(e) => setWalkin({ ...walkin, company_name: e.target.value })}
              placeholder="ex. MITS Automotive bv"
            />
          </Field>
          <Field label={t("sale_client_walkin_email")}>
            <Input
              type="email"
              value={walkin.email}
              onChange={(e) => setWalkin({ ...walkin, email: e.target.value })}
            />
          </Field>
          <Field label={t("sale_client_walkin_phone")}>
            <Input
              value={walkin.phone}
              onChange={(e) => setWalkin({ ...walkin, phone: e.target.value })}
            />
          </Field>
          <Field label={t("sale_client_walkin_idno")}>
            <Input
              value={walkin.idno}
              onChange={(e) => setWalkin({ ...walkin, idno: e.target.value })}
              placeholder="ex. 8601124"
            />
          </Field>
          <Field label={t("proforma_form_customer_vat")}>
            <Input
              value={walkin.vat_number}
              onChange={(e) => setWalkin({ ...walkin, vat_number: e.target.value })}
              placeholder="ex. BE 0776.852.808"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label={t("proforma_form_customer_address")}>
              <textarea
                value={walkin.address}
                onChange={(e) => setWalkin({ ...walkin, address: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                placeholder="Vaartkaai 52C Unit B2, B-2170 MERKSEM"
              />
            </Field>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t("sale_client_filter_placeholder")}
              className="pl-9"
            />
          </div>
          <ul className="mt-3 max-h-[420px] divide-y divide-border overflow-y-auto rounded-md border border-border">
            {loadingList && allClients.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted">{t("sale_client_loading")}</li>
            ) : visibleClients.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted">{t("sale_client_no_results")}</li>
            ) : (
              visibleClients.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setClient(r)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-elevated"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-surface-elevated text-muted">
                      {r.account_type === "business" ? (
                        <Building2 className="size-4" />
                      ) : (
                        <User className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-sm font-medium">
                        {r.account_type === "business"
                          ? r.company_name ?? r.full_name ?? r.email
                          : r.full_name ?? r.email}
                      </div>
                      <div className="line-clamp-1 text-xs text-muted">
                        {r.email}
                        {r.phone ? ` · ${r.phone}` : ""}
                        {r.idno ? ` · IDNO ${r.idno}` : ""}
                      </div>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}
