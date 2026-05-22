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
import { issueProforma, updateProforma } from "@/lib/panel/invoices/actions";
import { PartCodeAutocomplete } from "@/components/panel/proforma/PartCodeAutocomplete";
import {
  type ClientSearchResult,
  listAllPanelClients,
} from "@/lib/panel/sales/actions";

type Line = {
  part_code: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
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

const EMPTY_LINE: Line = {
  part_code: "",
  name: "",
  description: "",
  quantity: 1,
  unit_price: 0,
  // Prices are entered VAT-inclusive (Moldova: standard 20% TVA on conta1).
  // The totals computation extracts the net + VAT components from the gross.
  vat_rate: 20,
};

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
};

export function NewProformaForm({
  locale,
  initial,
}: {
  locale: string;
  initial?: ProformaInitial;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const isEdit = !!initial;

  const [scope, setScopeState] = useState<"conta1" | "conta2">(initial?.scope ?? "conta1");
  const [client, setClient] = useState<ClientSearchResult | null>(null);
  const [walkinMode, setWalkinMode] = useState(true);
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

  // Switching books flips every line's VAT to the new default — conta 2 is
  // always 0%, conta 1 defaults back to 20%. Operator can still tweak per
  // line afterwards in the TVA column.
  function setScope(next: "conta1" | "conta2") {
    setScopeState(next);
    const vat = defaultVatFor(next);
    setLines((prev) => prev.map((l) => ({ ...l, vat_rate: vat })));
  }

  const totals = useMemo(() => {
    // unit_price is VAT-inclusive — break the gross back into net + vat so the
    // proforma still itemizes TVA on the printed document.
    let net = 0;
    let vat = 0;
    let gross = 0;
    for (const l of lines) {
      const lineGross = l.quantity * l.unit_price;
      const factor = 1 + l.vat_rate / 100;
      const lineNet = factor > 0 ? lineGross / factor : lineGross;
      gross += lineGross;
      net += lineNet;
      vat += lineGross - lineNet;
    }
    return {
      subtotal: Number(net.toFixed(2)),
      vat: Number(vat.toFixed(2)),
      total: Number(gross.toFixed(2)),
    };
  }, [lines]);

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
        email: client.email,
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
        unit_price: l.unit_price,
        vat_rate: l.vat_rate,
      })),
      due_days: dueDays,
      currency,
      account_scope: scope,
      output_locale: outputLocale,
      notes: notes || null,
    };

    startSubmit(async () => {
      if (isEdit && initial) {
        const res = await updateProforma(initial.id, payload);
        if (res.ok) {
          toast.success(t("proforma_updated_success"));
          router.push(`/${locale}/panel/proforme/${initial.id}`);
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
                <th className="px-2 py-2 text-right">{t("proforma_form_line_qty")}</th>
                <th className="px-2 py-2 text-right">{t("proforma_form_line_price")}</th>
                <th className="px-2 py-2 text-right">{t("proforma_form_line_vat")}</th>
                <th className="px-2 py-2 text-right">{t("proforma_form_line_total")}</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines.map((l, idx) => (
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
                          unit_price: m.unit_price,
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
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Input
                      type="number"
                      step={1}
                      min={1}
                      value={l.quantity}
                      onChange={(e) =>
                        setLine(idx, {
                          quantity: Math.max(0, Math.trunc(Number(e.target.value || 0))),
                        })
                      }
                      className="h-9 w-20 text-right"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Input
                      type="number"
                      step="0.01"
                      value={l.unit_price}
                      onChange={(e) =>
                        setLine(idx, { unit_price: Math.max(0, Number(e.target.value || 0)) })
                      }
                      className="h-9 w-24 text-right"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Input
                      type="number"
                      step={1}
                      min={0}
                      value={l.vat_rate}
                      onChange={(e) =>
                        setLine(idx, {
                          vat_rate: Math.max(0, Math.trunc(Number(e.target.value || 0))),
                        })
                      }
                      disabled={scope === "conta2"}
                      title={
                        scope === "conta2"
                          ? "Conta 2 — TVA forțată la 0%"
                          : undefined
                      }
                      className="h-9 w-16 text-right disabled:cursor-not-allowed disabled:bg-surface-elevated disabled:text-muted"
                    />
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums font-semibold">
                    {(l.quantity * l.unit_price).toFixed(2)}
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
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface-elevated text-xs">
                <td colSpan={5} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
                  {t("achizitii_subtotal")}
                </td>
                <td colSpan={2} className="px-2 py-2 text-right tabular-nums">
                  {totals.subtotal.toFixed(2)}
                </td>
              </tr>
              <tr className="text-xs">
                <td colSpan={5} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
                  {t("achizitii_vat_total")}
                </td>
                <td colSpan={2} className="px-2 py-2 text-right tabular-nums">
                  {totals.vat.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-surface-elevated text-sm font-bold">
                <td colSpan={5} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
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
            <p className="mt-1 text-[11px] text-muted">
              {scope === "conta2"
                ? t("proforma_form_scope_hint_conta2")
                : t("proforma_form_scope_hint_conta1")}
            </p>
          </Field>
          <Field label={t("proforma_form_currency")}>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "MDL" | "EUR" | "USD")}
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
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children}
    </div>
  );
}
