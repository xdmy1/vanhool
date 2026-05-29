"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeGeneratorButton } from "@/components/panel/CodeGeneratorButton";
import { PriceWithVatHelper } from "@/components/common/PriceWithVatHelper";
import { cn } from "@/lib/utils/cn";
import {
  createSupplier,
  searchSuppliers,
} from "@/lib/panel/suppliers/actions";
import { createPurchase } from "@/lib/panel/purchases/actions";
import type { AccountScope } from "@/lib/panel/scope";

type Supplier = { id: string; name: string; idno: string | null; contact_phone: string | null };

type Line = {
  supplier_code: string;
  internal_code: string;
  description: string;
  quantity: number;
  unit_cost: number;
  vat_rate: number;
};

const EMPTY_LINE: Line = {
  supplier_code: "",
  internal_code: "",
  description: "",
  quantity: 1,
  unit_cost: 0,
  vat_rate: 20,
};

export function PurchaseForm({
  locale,
  defaultScope,
}: {
  locale: string;
  defaultScope: AccountScope;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [scope, setScope] = useState<AccountScope>(defaultScope);
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [currency, setCurrency] = useState("MDL");
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([{ ...EMPTY_LINE }]);
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
    setLines([...lines, { ...EMPTY_LINE }]);
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
      const res = await createPurchase({
        supplier_id: supplier.id,
        account_scope: scope,
        document_number: documentNumber || null,
        document_date: documentDate,
        currency,
        fx_rate: fxRate,
        notes: notes || null,
        items: valid.map((l) => ({
          supplier_code: l.supplier_code || null,
          internal_code: l.internal_code || null,
          description: l.description.trim(),
          quantity: l.quantity,
          unit_cost: l.unit_cost,
          vat_rate: l.vat_rate,
        })),
      });
      if (res.ok) {
        toast.success(t("achizitii_saved"));
        router.push(`/${locale}/panel/achizitii/${res.id}`);
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
          <Field label={t("achizitii_doc_number")}>
            <Input
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder={t("achizitii_doc_number_placeholder")}
            />
          </Field>
          <Field label={t("achizitii_doc_date")} required>
            <Input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
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
                <th className="px-2 py-2 text-right">{t("achizitii_line_cost")}</th>
                <th className="px-2 py-2 text-right">{t("achizitii_line_vat")}</th>
                <th className="px-2 py-2 text-right">{t("achizitii_line_total")}</th>
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
                      <Input
                        value={l.internal_code}
                        onChange={(e) =>
                          setLine(idx, {
                            internal_code: e.target.value.toUpperCase(),
                          })
                        }
                        className="h-9 font-mono text-xs"
                        placeholder={t("achizitii_line_internal_code_placeholder")}
                      />
                      <CodeGeneratorButton
                        size="sm"
                        label={t("achizitii_gen_short")}
                        onGenerated={(code) => setLine(idx, { internal_code: code })}
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
                      step="0.001"
                      value={l.quantity}
                      onChange={(e) =>
                        setLine(idx, { quantity: Math.max(0, Number(e.target.value || 0)) })
                      }
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
                  <td className="px-2 py-2 text-right">
                    <Input
                      type="number"
                      step="0.5"
                      value={l.vat_rate}
                      onChange={(e) =>
                        setLine(idx, { vat_rate: Math.max(0, Number(e.target.value || 0)) })
                      }
                      className="h-9 w-16 text-right"
                    />
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {(l.quantity * l.unit_cost).toFixed(2)}
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
                <td colSpan={6} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
                  {t("achizitii_subtotal")}
                </td>
                <td colSpan={2} className="px-2 py-2 text-right tabular-nums">
                  {totals.subtotal.toFixed(2)}
                </td>
              </tr>
              <tr className="text-xs">
                <td colSpan={6} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
                  {t("achizitii_vat_total")}
                </td>
                <td colSpan={2} className="px-2 py-2 text-right tabular-nums">
                  {totals.vat.toFixed(2)}
                </td>
              </tr>
              <tr className="bg-surface-elevated text-sm font-bold">
                <td colSpan={6} className="px-2 py-2 text-right uppercase tracking-wide text-muted">
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
