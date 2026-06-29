"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInputEU } from "@/components/common/DateInputEU";
import { CodeGeneratorButton } from "@/components/panel/CodeGeneratorButton";
import { PriceWithVatHelper } from "@/components/common/PriceWithVatHelper";
import { PurchaseFileUpload } from "@/components/panel/purchases/PurchaseFileUpload";
import { cn } from "@/lib/utils/cn";
import {
  createSupplier,
  searchSuppliers,
} from "@/lib/panel/suppliers/actions";
import { createPurchase, updatePurchase } from "@/lib/panel/purchases/actions";
import { searchProducts, type ProductSearchResult } from "@/lib/panel/sales/actions";
import type { AccountScope } from "@/lib/panel/scope";

export type PurchaseFormInitial = {
  id: string;
  supplier: Supplier;
  scope: AccountScope;
  documentNumber: string;
  documentDate: string;
  currency: string;
  fxRate: number | null;
  notes: string;
  /** Storage path inside `purchase-docs/` for the supplier's original
   * invoice. Empty / null = no attachment uploaded. */
  fileUrl: string | null;
  lines: Line[];
};

type Supplier = { id: string; name: string; idno: string | null; contact_phone: string | null };

type Line = {
  supplier_code: string;
  internal_code: string;
  description: string;
  quantity: number;
  unit_cost: number;
  vat_rate: number;
  /** When true, postPurchase creates a product in the catalog from this
   * line (or increments stock if it already exists). Default false —
   * not every purchased part belongs on the storefront. */
  add_to_catalog: boolean;
  /** Link to an existing product when the operator picked one through
   * the internal-code autocomplete. postPurchase increments that product's
   * stock instead of creating a duplicate. */
  product_id: string | null;
};

const EMPTY_LINE: Line = {
  supplier_code: "",
  internal_code: "",
  description: "",
  quantity: 1,
  unit_cost: 0,
  // Start at 0 so a freshly-typed cost shows up as-is in the line total;
  // the operator picks +TVA 20% explicitly when needed.
  vat_rate: 0,
  add_to_catalog: false,
  product_id: null,
};

export function PurchaseForm({
  locale,
  defaultScope,
  initial,
}: {
  locale: string;
  defaultScope: AccountScope;
  /** When set, the form runs in EDIT mode against the existing purchase. */
  initial?: PurchaseFormInitial;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const isEdit = !!initial;
  const [supplier, setSupplier] = useState<Supplier | null>(
    initial?.supplier ?? null,
  );
  const [scope, setScope] = useState<AccountScope>(initial?.scope ?? defaultScope);
  const [documentNumber, setDocumentNumber] = useState(
    initial?.documentNumber ?? "",
  );
  const [documentDate, setDocumentDate] = useState(
    initial?.documentDate ?? new Date().toISOString().slice(0, 10),
  );
  const [currency, setCurrency] = useState(initial?.currency ?? "MDL");
  const [fxRate, setFxRate] = useState<number | null>(initial?.fxRate ?? null);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [fileUrl, setFileUrl] = useState<string | null>(initial?.fileUrl ?? null);
  const [lines, setLines] = useState<Line[]>(
    initial?.lines && initial.lines.length > 0
      ? initial.lines
      : [{ ...EMPTY_LINE, vat_rate: 20 }],
  );
  // Document-level VAT switch — replaces the removed per-line TVA toggle that
  // left purchases with NO way to set VAT (so every purchase silently recorded
  // 0% input VAT). A purchase is either fully with TVA 20% or fully without,
  // matching how a supplier invoice arrives. Drives every line's vat_rate; new
  // purchases default to "cu TVA" so input VAT is recorded by default.
  const [vatEnabled, setVatEnabled] = useState<boolean>(
    initial?.lines && initial.lines.length > 0
      ? initial.lines.some((l) => (l.vat_rate ?? 0) > 0)
      : true,
  );
  function setVat(enabled: boolean) {
    setVatEnabled(enabled);
    const rate = enabled ? 20 : 0;
    setLines((prev) => prev.map((l) => ({ ...l, vat_rate: rate })));
  }
  const [pending, startSave] = useTransition();

  const totals = useMemo(() => {
    let subtotal = 0;
    let vat = 0;
    for (const l of lines) {
      const net = l.quantity * l.unit_cost;
      subtotal += net;
      vat += net * (l.vat_rate / 100);
    }
    return {
      subtotal: Number(subtotal.toFixed(2)),
      vat: Number(vat.toFixed(2)),
      total: Number((subtotal + vat).toFixed(2)),
    };
  }, [lines]);

  function setLine(idx: number, patch: Partial<Line>) {
    setLines(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines([...lines, { ...EMPTY_LINE, vat_rate: vatEnabled ? 20 : 0 }]);
  }
  function removeLine(idx: number) {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  }

  function submit() {
    if (!supplier) {
      toast.error(t("achizitii_supplier_missing"));
      return;
    }
    const valid = lines.filter((l) => l.description.trim().length > 0 && l.quantity > 0);
    if (valid.length === 0) {
      toast.error(t("achizitii_lines_missing"));
      return;
    }
    startSave(async () => {
      const payload = {
        supplier_id: supplier.id,
        account_scope: scope,
        document_number: documentNumber || null,
        document_date: documentDate,
        currency,
        fx_rate: fxRate,
        notes: notes || null,
        file_url: fileUrl,
        items: valid.map((l) => ({
          supplier_code: l.supplier_code || null,
          internal_code: l.internal_code || null,
          description: l.description.trim(),
          quantity: l.quantity,
          unit_cost: l.unit_cost,
          vat_rate: l.vat_rate,
          add_to_catalog: !!l.add_to_catalog,
          product_id: l.product_id ?? null,
        })),
      };
      const res = isEdit
        ? await updatePurchase(initial!.id, payload)
        : await createPurchase(payload);
      if (res.ok) {
        toast.success(t("achizitii_saved"));
        const targetId = "id" in res ? res.id : initial!.id;
        router.push(`/${locale}/panel/achizitii/${targetId}`);
      } else {
        toast.error(t("achizitii_save_error", { reason: res.reason }));
      }
    });
  }

  return (
    <div className="space-y-6">
      <SupplierPicker supplier={supplier} setSupplier={setSupplier} />

      <section className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("achizitii_doc_section")}
        </h3>
        <div className="grid gap-3 md:grid-cols-4">
          <Field label={t("achizitii_doc_book")}>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as AccountScope)}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="conta1">{t("achizitii_doc_book_conta1")}</option>
              <option value="conta2">{t("achizitii_doc_book_conta2")}</option>
            </select>
          </Field>
          <Field label="TVA">
            <div className="inline-flex h-10 w-full rounded-md border border-border bg-surface p-0.5">
              <button
                type="button"
                onClick={() => setVat(true)}
                className={cn(
                  "flex-1 rounded text-xs font-semibold transition-colors",
                  vatEnabled
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-strong hover:text-foreground",
                )}
              >
                TVA 20%
              </button>
              <button
                type="button"
                onClick={() => setVat(false)}
                className={cn(
                  "flex-1 rounded text-xs font-semibold transition-colors",
                  !vatEnabled
                    ? "bg-foreground text-background"
                    : "text-muted-strong hover:text-foreground",
                )}
              >
                Fără TVA
              </button>
            </div>
          </Field>
          <Field label={t("achizitii_doc_number")}>
            <Input
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder={t("achizitii_doc_number_placeholder")}
            />
          </Field>
          <Field label={t("achizitii_doc_date")} required>
            <DateInputEU
              value={documentDate}
              onChange={(iso) => setDocumentDate(iso)}
            />
          </Field>
          <Field label={t("achizitii_doc_currency")}>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="MDL">MDL</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </Field>
          {currency !== "MDL" ? (
            <Field label={t("achizitii_doc_fx_rate")}>
              <Input
                type="number"
                step="0.0001"
                value={fxRate ?? ""}
                onChange={(e) => setFxRate(Number(e.target.value) || null)}
                placeholder={t("achizitii_doc_fx_placeholder")}
              />
            </Field>
          ) : null}
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("achizitii_lines_section", { count: lines.length })}
          </h3>
          <Button type="button" variant="ghost" size="sm" onClick={addLine}>
            <Plus className="size-4" />
            {t("achizitii_lines_add")}
          </Button>
        </header>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-2 py-2">{t("achizitii_line_supplier_code")}</th>
                <th className="px-2 py-2">{t("achizitii_line_internal_code")}</th>
                <th className="px-2 py-2">{t("achizitii_line_description")}</th>
                <th className="px-2 py-2 text-right">{t("achizitii_line_qty")}</th>
                <th className="px-2 py-2 text-right">Cost fără TVA</th>
                <th className="px-2 py-2 text-right">TVA</th>
                <th className="px-2 py-2 text-right">Cost cu TVA</th>
                <th className="px-2 py-2 text-right">{t("achizitii_line_total")}</th>
                <th className="px-2 py-2 text-center" title={t("achizitii_line_catalog_hint")}>
                  {t("achizitii_line_catalog")}
                </th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines.map((l, idx) => (
                <tr key={idx}>
                  <td className="px-2 py-2">
                    <Input
                      value={l.supplier_code}
                      onChange={(e) => setLine(idx, { supplier_code: e.target.value })}
                      className="h-9 font-mono text-xs"
                      placeholder={t("achizitii_line_supplier_code_placeholder")}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <InternalCodeAutocomplete
                        value={l.internal_code}
                        linkedProductId={l.product_id}
                        onChange={(code) =>
                          setLine(idx, {
                            internal_code: code.toUpperCase(),
                            // Typing manually breaks any prior link.
                            product_id: null,
                          })
                        }
                        onPickProduct={(p) =>
                          setLine(idx, {
                            internal_code: (p.part_code ?? "").toUpperCase(),
                            description: l.description.trim()
                              ? l.description
                              : p.name_ro ?? "",
                            product_id: p.id,
                            // Linking to an existing catalog product
                            // implicitly means the catalog already knows
                            // about it — keep the checkbox in sync.
                            add_to_catalog: true,
                          })
                        }
                      />
                      <CodeGeneratorButton
                        size="sm"
                        label={t("achizitii_gen_short")}
                        onGenerated={(code) =>
                          setLine(idx, { internal_code: code, product_id: null })
                        }
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <Input
                      value={l.description}
                      onChange={(e) => setLine(idx, { description: e.target.value })}
                      className="h-9 text-xs"
                      placeholder={t("achizitii_line_description_placeholder")}
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Input
                      type="number"
                      step={1}
                      min={1}
                      value={l.quantity > 0 ? l.quantity : ""}
                      onChange={(e) =>
                        setLine(idx, {
                          quantity: Math.max(1, Math.trunc(Number(e.target.value) || 0)),
                        })
                      }
                      placeholder="1"
                      className="h-9 w-20 text-right"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <PriceWithVatHelper
                      value={l.unit_cost}
                      onChange={(v) => setLine(idx, { unit_cost: v })}
                      step="0.01"
                      size="sm"
                      inputClassName="h-9 w-24 text-right"
                    />
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted">
                    {l.vat_rate || 0}%
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted">
                    {(l.unit_cost * (1 + (l.vat_rate || 0) / 100)).toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {(l.quantity * l.unit_cost * (1 + (l.vat_rate || 0) / 100)).toFixed(2)}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={l.add_to_catalog}
                      onChange={(e) =>
                        setLine(idx, { add_to_catalog: e.target.checked })
                      }
                      className="size-4 cursor-pointer accent-primary"
                      title={t("achizitii_line_catalog_hint")}
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface-elevated text-xs">
                <td colSpan={7} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
                  {t("achizitii_subtotal")}
                </td>
                <td colSpan={2} className="px-2 py-2 text-right tabular-nums">
                  {totals.subtotal.toFixed(2)}
                </td>
              </tr>
              <tr className="text-xs">
                <td colSpan={7} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
                  {t("achizitii_vat_total")}
                </td>
                <td colSpan={2} className="px-2 py-2 text-right tabular-nums">
                  {totals.vat.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-surface-elevated text-sm font-bold">
                <td colSpan={7} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
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
        <Field label={t("achizitii_notes")}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
        </Field>
        <div className="mt-4">
          <PurchaseFileUpload value={fileUrl} onChange={setFileUrl} />
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={pending} className="gap-1.5">
          <Save className="size-4" />
          {pending ? t("action_saving") : t("achizitii_save_draft")}
        </Button>
      </div>
    </div>
  );
}

function SupplierPicker({
  supplier,
  setSupplier,
}: {
  supplier: Supplier | null;
  setSupplier: (s: Supplier | null) => void;
}) {
  const t = useTranslations("panel");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Supplier[]>([]);
  const [searching, startSearch] = useTransition();
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIdno, setNewIdno] = useState("");
  const [newVatCode, setNewVatCode] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [creating, startCreate] = useTransition();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (supplier) return;
    if (!q.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    timer.current = window.setTimeout(() => {
      startSearch(async () => {
        const r = await searchSuppliers(q);
        setResults(r as Supplier[]);
      });
    }, 300);
  }, [q, supplier]);

  function create() {
    if (!newName.trim()) return;
    startCreate(async () => {
      const res = await createSupplier({
        name: newName.trim(),
        idno: newIdno || null,
        vat_code: newVatCode || null,
        contact_phone: newPhone || null,
        contact_email: newEmail || null,
        address: newAddress || null,
        is_active: true,
      });
      if (res.ok) {
        toast.success(t("achizitii_supplier_created"));
        setSupplier({ id: res.id, name: newName.trim(), idno: newIdno || null, contact_phone: newPhone || null });
        setNewOpen(false);
        setNewName("");
        setNewIdno("");
        setNewVatCode("");
        setNewPhone("");
        setNewEmail("");
        setNewAddress("");
      } else {
        toast.error(t("achizitii_save_error", { reason: res.reason }));
      }
    });
  }

  if (supplier) {
    return (
      <section className="rounded-md border border-primary/30 bg-primary/5 p-5">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("achizitii_supplier_section")}
          </h3>
          <button
            type="button"
            onClick={() => setSupplier(null)}
            className="text-xs text-primary hover:underline"
          >
            {t("achizitii_supplier_change")}
          </button>
        </header>
        <div className="font-semibold">{supplier.name}</div>
        <div className="mt-1 text-xs text-muted-strong">
          {supplier.idno ? `IDNO ${supplier.idno}` : null}
          {supplier.contact_phone ? ` · ${supplier.contact_phone}` : null}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-border bg-surface p-5">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {t("achizitii_supplier_search_title")}
        </h3>
        <button
          type="button"
          onClick={() => setNewOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Plus className="size-3.5" />
          {t("achizitii_supplier_new_button")}
        </button>
      </header>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("achizitii_supplier_search_placeholder")}
          className="pl-9"
        />
        {searching ? (
          <span className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 animate-spin rounded-full border-2 border-border border-t-primary" />
        ) : null}
      </div>

      {results.length > 0 ? (
        <ul className="mt-3 divide-y divide-border rounded-md border border-border">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setSupplier(r)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-elevated"
              >
                <span className="font-semibold">{r.name}</span>
                {r.idno ? <span className="text-xs text-muted">IDNO {r.idno}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {newOpen ? (
        <div className={cn("mt-4 grid gap-3 rounded-md border border-border bg-background p-4 md:grid-cols-2")}>
          <Field label={t("achizitii_supplier_field_name")} required>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
          </Field>
          <Field label={t("achizitii_supplier_field_idno")}>
            <Input value={newIdno} onChange={(e) => setNewIdno(e.target.value)} />
          </Field>
          <Field label={t("achizitii_supplier_field_vat_code")}>
            <Input
              value={newVatCode}
              onChange={(e) => setNewVatCode(e.target.value)}
              className="font-mono"
            />
          </Field>
          <Field label={t("achizitii_supplier_field_phone")}>
            <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          </Field>
          <Field label={t("achizitii_supplier_field_email")}>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </Field>
          <Field label={t("achizitii_supplier_field_address")}>
            <Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button type="button" onClick={create} disabled={creating} size="sm" className="gap-1.5">
              <Plus className="size-4" />
              {creating ? t("achizitii_supplier_creating") : t("achizitii_supplier_create")}
            </Button>
          </div>
        </div>
      ) : null}
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

/**
 * Internal-code input with a suggestion dropdown. While the operator
 * types, `searchProducts` looks the term up against the catalog
 * (normalized search_codes + part_code/name ilike). Picking a suggestion
 * links the line to the existing product (so postPurchase reuses it
 * instead of creating a duplicate) and pre-fills the description.
 */
function InternalCodeAutocomplete({
  value,
  linkedProductId,
  onChange,
  onPickProduct,
}: {
  value: string;
  linkedProductId: string | null;
  onChange: (next: string) => void;
  onPickProduct: (product: ProductSearchResult) => void;
}) {
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // 250 ms debounce; bail on short / linked inputs.
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (linkedProductId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setOpen(false);
      return;
    }
    const term = value.trim();
    if (term.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setSearching(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const rows = await searchProducts(term);
        setResults(rows);
        setOpen(rows.length > 0);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [value, linkedProductId]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        className={cn(
          "h-9 font-mono text-xs",
          linkedProductId ? "border-success/50 bg-success/5" : "",
        )}
        placeholder="Cod intern…"
      />
      {linkedProductId ? (
        <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-success">
          ✓ Legat de produs existent
        </div>
      ) : null}
      {open && results.length > 0 ? (
        <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-surface shadow-lg">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  // mousedown — fires before the input's blur, so the
                  // value sticks on the line being edited.
                  e.preventDefault();
                  onPickProduct(p);
                  setOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left text-xs hover:bg-surface-elevated"
              >
                <div className="font-mono font-semibold text-foreground">
                  {p.part_code ?? "—"}
                </div>
                <div className="truncate text-[11px] text-muted-strong">
                  {p.name_ro ?? p.brand ?? "—"}
                </div>
                <div className="text-[10px] text-muted">
                  stoc {p.stock_quantity} · cost {Number(p.cost_price).toFixed(2)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {searching ? (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted">
          …
        </div>
      ) : null}
    </div>
  );
}
