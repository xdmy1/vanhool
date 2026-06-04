"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPreorder } from "@/lib/panel/preorders/actions";

type SupplierOption = { id: string; name: string };

export function PreorderForm({
  locale,
  suppliers,
}: {
  locale: string;
  suppliers: SupplierOption[];
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [partCode, setPartCode] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [supplierId, setSupplierId] = useState<string>("");
  const [supplierCost, setSupplierCost] = useState<string>("");
  const [marginPct, setMarginPct] = useState<string>("25");
  const [unitPriceManual, setUnitPriceManual] = useState<string>("");
  const [currency, setCurrency] = useState<"MDL" | "EUR" | "USD">("MDL");
  const [eta, setEta] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Auto-derive unit_price from cost + margin unless the operator has
  // explicitly overridden it.
  const derivedPrice = useMemo(() => {
    const c = Number(supplierCost);
    const m = Number(marginPct);
    if (!Number.isFinite(c) || c <= 0) return 0;
    if (!Number.isFinite(m) || m < 0) return c;
    return Number((c * (1 + m / 100)).toFixed(2));
  }, [supplierCost, marginPct]);
  const unitPrice = unitPriceManual.trim() !== ""
    ? Number(unitPriceManual)
    : derivedPrice;

  function submit() {
    if (!customerName.trim()) {
      toast.error(t("preorder_form_customer_required"));
      return;
    }
    if (!description.trim()) {
      toast.error(t("preorder_form_part_required"));
      return;
    }
    if (quantity <= 0) {
      toast.error(t("preorder_form_qty_required"));
      return;
    }
    if (unitPrice <= 0) {
      toast.error(t("preorder_form_price_required"));
      return;
    }
    startTransition(async () => {
      const res = await createPreorder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || null,
        customer_email: customerEmail.trim() || null,
        part_code: partCode.trim() || null,
        description: description.trim(),
        quantity,
        supplier_id: supplierId || null,
        supplier_unit_cost: Number(supplierCost) || 0,
        unit_price: unitPrice,
        currency,
        expected_delivery_date: eta || null,
        notes: notes.trim() || null,
      });
      if (res.ok) {
        toast.success(t("preorder_form_created"));
        router.push(`/${locale}/panel/precomenzi`);
      } else {
        toast.error(t("accountant_send_error", { reason: res.reason }));
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("preorder_form_section_customer")}
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={t("preorder_form_customer_name")} required>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </Field>
          <Field label={t("preorder_form_customer_phone")}>
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              type="tel"
            />
          </Field>
          <Field
            label={t("preorder_form_customer_email")}
            hint={t("preorder_form_customer_email_hint")}
          >
            <Input
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              type="email"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("preorder_form_section_part")}
        </h3>
        <div className="grid gap-3 md:grid-cols-[160px_1fr_140px]">
          <Field label={t("preorder_form_part_code")}>
            <Input
              value={partCode}
              onChange={(e) => setPartCode(e.target.value)}
              className="font-mono"
            />
          </Field>
          <Field label={t("preorder_form_description")} required>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field label={t("preorder_form_quantity")} required>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.trunc(Number(e.target.value || 1))))
              }
            />
          </Field>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("preorder_form_section_supplier")}
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label={t("preorder_form_supplier")}>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="">{t("preorder_form_supplier_placeholder")}</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("preorder_form_supplier_cost")}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min={0}
                value={supplierCost}
                onChange={(e) => setSupplierCost(e.target.value)}
                placeholder="0.00"
              />
              <select
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value as "MDL" | "EUR" | "USD")
                }
                className="h-10 rounded-md border border-border bg-surface px-2 text-sm"
              >
                <option value="MDL">MDL</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </Field>
          <Field
            label={t("preorder_form_margin")}
            hint={t("preorder_form_margin_hint")}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.5"
                min={0}
                value={marginPct}
                onChange={(e) => setMarginPct(e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-muted">%</span>
            </div>
          </Field>
          <Field
            label={t("preorder_form_unit_price")}
            hint={t("preorder_form_unit_price_hint", {
              derived: derivedPrice.toFixed(2),
              currency,
            })}
          >
            <Input
              type="number"
              step="0.01"
              min={0}
              value={unitPriceManual}
              onChange={(e) => setUnitPriceManual(e.target.value)}
              placeholder={derivedPrice > 0 ? derivedPrice.toFixed(2) : "0.00"}
            />
          </Field>
          <Field label={t("preorder_form_eta")}>
            <Input
              type="date"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-3 rounded-md border border-success/30 bg-success/5 px-3 py-2 text-sm text-success">
          {t("preorder_form_total_preview", {
            total: (quantity * unitPrice).toFixed(2),
            currency,
          })}
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <Field label={t("preorder_form_notes")}>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            placeholder={t("preorder_form_notes_placeholder")}
          />
        </Field>
      </section>

      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={pending} className="gap-1.5">
          <Save className="size-4" />
          {pending ? t("preorder_form_saving") : t("preorder_form_submit")}
        </Button>
      </div>
    </div>
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
