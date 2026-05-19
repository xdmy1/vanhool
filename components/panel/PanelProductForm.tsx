"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeGeneratorButton } from "@/components/panel/CodeGeneratorButton";
import {
  createPanelProduct,
  updatePanelProduct,
  type PanelProductInput,
} from "@/lib/panel/produse/actions";
import type { PanelProductDetail } from "@/lib/panel/produse/queries";

type Option = { id: string; name: string };
type CatOption = Option & { parent_id: string | null };

export type ProductPrefill = {
  lineId: string;
  purchaseId: string;
  document_number: string | null;
  supplier_id: string | null;
  supplier_name: string;
  supplier_code: string | null;
  internal_code: string | null;
  description: string;
  unit_cost: number;
  currency: string;
  fx_rate: number | null;
};

/**
 * Fixed reference rates used when a purchase doesn't carry an explicit
 * `fx_rate`. Owner asked for a predictable 20 MDL/EUR — no live rate lookups,
 * no surprises.
 */
const DEFAULT_FX_TO_MDL: Record<string, number> = {
  MDL: 1,
  EUR: 20,
  USD: 17,
};

function costInMdl(prefill: ProductPrefill): number {
  const cur = (prefill.currency || "MDL").toUpperCase();
  if (cur === "MDL") return prefill.unit_cost;
  const rate = prefill.fx_rate ?? DEFAULT_FX_TO_MDL[cur] ?? 1;
  return prefill.unit_cost * rate;
}

type Props = {
  locale: string;
  initial?: PanelProductDetail | null;
  prefill?: ProductPrefill | null;
  categories: CatOption[];
  manufacturers: Option[];
  suppliers: Option[];
};

const EMPTY: PanelProductInput = {
  part_code: "",
  name_ro: "",
  name_en: "",
  name_ru: "",
  description_ro: "",
  brand: "",
  manufacturer_id: null,
  category_id: null,
  subcategory_id: null,
  price: 0,
  cost_price: 0,
  stock_quantity: 0,
  storage_location: "",
  is_active: true,
  supplier_id: null,
  supplier_code: "",
  condition: "new",
  warranty_months: 12,
};

export function PanelProductForm({
  locale,
  initial,
  prefill,
  categories,
  manufacturers,
  suppliers,
}: Props) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<PanelProductInput>(() => ({
    ...EMPTY,
    ...(initial
      ? {
          part_code: initial.part_code ?? "",
          name_ro: initial.name_ro ?? "",
          name_en: initial.name_en ?? "",
          name_ru: initial.name_ru ?? "",
          description_ro: initial.description_ro ?? "",
          brand: initial.brand ?? "",
          manufacturer_id: initial.manufacturer_id,
          category_id: initial.category_id,
          subcategory_id: initial.subcategory_id,
          price: Number(initial.price ?? 0),
          cost_price: Number(initial.cost_price ?? 0),
          stock_quantity: Number(initial.stock_quantity ?? 0),
          storage_location: initial.storage_location ?? "",
          is_active: initial.is_active ?? true,
          supplier_id: initial.supplier_id,
          supplier_code: initial.supplier_code ?? "",
          condition: initial.condition ?? "new",
          warranty_months: initial.warranty_months ?? 12,
        }
      : prefill
        ? (() => {
            // Purchases can be in MDL/EUR/USD; products are stored in MDL.
            // Convert at the purchase's fx_rate when set, otherwise fall
            // back to the fixed 20 MDL/EUR reference rate.
            const costMdl = Number(costInMdl(prefill).toFixed(2));
            return {
              part_code: prefill.internal_code ?? prefill.supplier_code ?? "",
              supplier_code: prefill.supplier_code ?? "",
              supplier_id: prefill.supplier_id,
              name_ro: prefill.description.slice(0, 200),
              cost_price: costMdl,
              // Suggest 30% markup as starting price — owner can edit.
              price: Number((costMdl * 1.3).toFixed(2)),
              stock_quantity: 0,
              is_active: false,
            };
          })()
        : {}),
  }));

  const rootCategories = categories.filter((c) => c.parent_id === null);
  const subcategories = state.category_id
    ? categories.filter((c) => c.parent_id === state.category_id)
    : [];

  function set<K extends keyof PanelProductInput>(k: K, v: PanelProductInput[K]) {
    setState((s) => ({ ...s, [k]: v }));
  }

  function submit() {
    startTransition(async () => {
      const payload: Record<string, unknown> = {
        ...state,
        manufacturer_id: state.manufacturer_id || null,
        category_id: state.category_id || null,
        subcategory_id: state.subcategory_id || null,
        supplier_id: state.supplier_id || null,
      };
      // Carry the purchase-line link through so the server action can attach
      // the new product back to it. Ignored by Zod (unknown key).
      if (prefill?.lineId && !initial) {
        payload.linkLineId = prefill.lineId;
      }
      const res = initial
        ? await updatePanelProduct(initial.id, payload)
        : await createPanelProduct(payload);

      if (res.ok) {
        toast.success(initial ? t("product_update_toast") : t("product_create_toast"));
        if (!initial && "id" in res) {
          // From a purchase line → return to the purchase so the user can see
          // the line linked and continue with the next one. Otherwise go to
          // the product edit page.
          const next = prefill
            ? `/${locale}/panel/achizitii/${prefill.purchaseId}`
            : `/${locale}/panel/produse/${res.id}`;
          router.push(next);
        } else {
          router.refresh();
        }
      } else {
        toast.error(t("product_error", { reason: res.reason }));
      }
    });
  }

  return (
    <div className="space-y-6">
      {prefill && !initial ? (
        <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-4 text-sm">
          <div className="font-semibold text-primary">
            {t("product_prefill_banner", {
              supplier: prefill.supplier_name,
              doc: prefill.document_number ?? prefill.lineId.slice(0, 8).toUpperCase(),
            })}
          </div>
          <div className="mt-1 text-xs text-muted-strong">
            {t("product_prefill_help")}
          </div>
        </div>
      ) : null}

      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("product_form_section_id")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("product_form_internal_code")} required>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={state.part_code}
                onChange={(e) => set("part_code", e.target.value.toUpperCase())}
                placeholder={t("product_form_internal_code_placeholder")}
                className="font-mono"
              />
              <CodeGeneratorButton
                onGenerated={(code) => set("part_code", code)}
                categorySlug={
                  rootCategories.find((c) => c.id === state.category_id)?.name
                }
              />
            </div>
            <p className="mt-1 text-xs text-muted">{t("product_form_internal_code_helper")}</p>
          </Field>

          <Field label={t("product_form_supplier_code")}>
            <Input
              value={state.supplier_code ?? ""}
              onChange={(e) => set("supplier_code", e.target.value)}
              placeholder="ex. 2400282"
              className="font-mono"
            />
            <p className="mt-1 text-xs text-muted">{t("product_form_supplier_code_helper")}</p>
          </Field>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label={t("product_form_name_ro")} required>
            <Input
              value={state.name_ro}
              onChange={(e) => set("name_ro", e.target.value)}
              placeholder="Magneetventiel 4/2 16-32V"
            />
          </Field>
          <Field label={t("product_form_name_en")}>
            <Input
              value={state.name_en ?? ""}
              onChange={(e) => set("name_en", e.target.value)}
            />
          </Field>
          <Field label={t("product_form_name_ru")}>
            <Input
              value={state.name_ru ?? ""}
              onChange={(e) => set("name_ru", e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label={t("product_form_description_ro")}>
            <textarea
              value={state.description_ro ?? ""}
              onChange={(e) => set("description_ro", e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("product_form_section_pricing")}
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label={t("product_form_price")} required>
            <Input
              type="number"
              step="0.01"
              value={state.price}
              onChange={(e) => set("price", Number(e.target.value || 0))}
            />
          </Field>
          <Field label={t("product_form_cost")}>
            <Input
              type="number"
              step="0.01"
              value={state.cost_price ?? 0}
              onChange={(e) => set("cost_price", Number(e.target.value || 0))}
            />
            <p className="mt-1 text-xs text-muted">{t("product_form_cost_helper")}</p>
          </Field>
          <Field label={t("product_form_stock")}>
            <Input
              type="number"
              value={state.stock_quantity}
              onChange={(e) => set("stock_quantity", Number(e.target.value || 0))}
            />
          </Field>
          <Field label={t("product_form_location")}>
            <Input
              value={state.storage_location ?? ""}
              onChange={(e) => set("storage_location", e.target.value)}
              placeholder="ex. R3-B2"
              className="font-mono"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          {t("product_form_section_classification")}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={t("product_form_brand")}>
            <Input
              value={state.brand ?? ""}
              onChange={(e) => set("brand", e.target.value)}
            />
          </Field>
          <Field label={t("product_form_manufacturer")}>
            <Select
              value={state.manufacturer_id ?? ""}
              onChange={(v) => set("manufacturer_id", v || null)}
              placeholder="—"
              options={manufacturers}
            />
          </Field>
          <Field label={t("product_form_supplier")}>
            <Select
              value={state.supplier_id ?? ""}
              onChange={(v) => set("supplier_id", v || null)}
              placeholder="—"
              options={suppliers}
            />
          </Field>
          <Field label={t("product_form_category")}>
            <Select
              value={state.category_id ?? ""}
              onChange={(v) => {
                set("category_id", v || null);
                set("subcategory_id", null);
              }}
              placeholder="—"
              options={rootCategories}
            />
          </Field>
          <Field label={t("product_form_subcategory")}>
            <Select
              value={state.subcategory_id ?? ""}
              onChange={(v) => set("subcategory_id", v || null)}
              placeholder={
                state.category_id ? "—" : t("product_form_subcategory_pick_first")
              }
              options={subcategories}
              disabled={!state.category_id}
            />
          </Field>
          <Field label={t("product_form_condition")}>
            <Select
              value={state.condition ?? "new"}
              onChange={(v) => set("condition", (v as PanelProductInput["condition"]) ?? null)}
              placeholder="—"
              options={[
                { id: "new", name: t("product_form_condition_new") },
                { id: "refurbished", name: t("product_form_condition_refurbished") },
                { id: "used", name: t("product_form_condition_used") },
              ]}
            />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
            />
            {t("product_form_active")}
          </label>
          <Field label={t("product_form_warranty")}>
            <Input
              type="number"
              value={state.warranty_months ?? 0}
              onChange={(e) => set("warranty_months", Number(e.target.value || 0))}
              className="w-24"
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" onClick={submit} disabled={pending} className="gap-1.5">
          <Save className="size-4" />
          {pending
            ? t("action_saving")
            : initial
              ? t("action_save")
              : t("product_form_create")}
        </Button>
      </div>
    </div>
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

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ id: string; name: string }>;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:border-primary focus-visible:outline-none disabled:opacity-50"
    >
      <option value="">{placeholder ?? "—"}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
