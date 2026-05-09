"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/lib/i18n/routing";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type CrossReference,
  type ProductFormValues,
} from "@/lib/admin/products/actions";
import { cn } from "@/lib/utils/cn";
import {
  BusMakesMultiSelect,
  CrossRefEditor,
  ManufacturerCombobox,
  TagInput,
} from "./CodeInputs";

type LookupOption = { id: string; name: string };

type CategoryOption = LookupOption & {
  parentId: string | null;
};

type Labels = {
  // Basic / identification
  field_part_code: string;
  field_manufacturer: string;
  field_manufacturer_none: string;
  field_manufacturer_add: string;
  field_manufacturer_placeholder: string;
  field_slug: string;
  field_slug_hint: string;
  field_condition: string;
  field_condition_new: string;
  field_condition_refurbished: string;
  field_condition_used: string;
  // Pricing & stock
  field_price: string;
  field_cost_price: string;
  field_stock: string;
  field_storage_location: string;
  // Category & status
  field_category: string;
  field_subcategory: string;
  field_category_none: string;
  field_subcategory_none: string;
  field_active: string;
  field_featured: string;
  // Specs
  field_warranty: string;
  field_weight: string;
  field_width: string;
  field_height: string;
  field_image_url: string;
  // Names + descriptions
  field_name_ro: string;
  field_name_en: string;
  field_name_ru: string;
  field_description_ro: string;
  field_description_en: string;
  field_description_ru: string;
  // Codes
  section_codes: string;
  section_codes_hint: string;
  field_oem_codes: string;
  field_oem_placeholder: string;
  field_cross_refs: string;
  field_cross_refs_brand: string;
  field_cross_refs_code: string;
  field_cross_refs_add: string;
  // Bus compatibility
  section_bus: string;
  field_bus_makes: string;
  field_bus_makes_add: string;
  field_bus_makes_placeholder: string;
  field_bus_makes_empty: string;
  // Promo
  section_promo: string;
  field_is_promo: string;
  field_promo_price: string;
  field_promo_starts: string;
  field_promo_ends: string;
  promo_hint: string;
  // Sections / actions
  section_basic: string;
  section_pricing: string;
  section_category: string;
  section_specs: string;
  section_names: string;
  section_descriptions: string;
  save: string;
  saving: string;
  create: string;
  creating: string;
  delete: string;
  confirm_delete: string;
  cancel: string;
  required: string;
  error_generic: string;
};

export function ProductForm({
  productId,
  initial,
  categories,
  manufacturers,
  vehicleMakes,
  brandSuggestions,
  initialVehicleMakeIds,
  locale,
  labels,
}: {
  productId?: string;
  initial?: Partial<ProductFormValues>;
  categories: CategoryOption[];
  manufacturers: LookupOption[];
  vehicleMakes: LookupOption[];
  brandSuggestions: string[];
  initialVehicleMakeIds?: string[];
  locale: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [delPending, startDelTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [categoryId, setCategoryId] = useState<string | null>(
    initial?.categoryId ?? null,
  );
  const [subcategoryId, setSubcategoryId] = useState<string | null>(
    initial?.subcategoryId ?? null,
  );
  const [manufacturerId, setManufacturerId] = useState<string | null>(
    initial?.manufacturerId ?? null,
  );
  const [condition, setCondition] = useState<"new" | "refurbished" | "used">(
    initial?.condition ?? "new",
  );
  const [oemCodes, setOemCodes] = useState<string[]>(initial?.oemCodes ?? []);
  const [crossRefs, setCrossRefs] = useState<CrossReference[]>(
    initial?.crossReferences ?? [],
  );
  const [busMakeIds, setBusMakeIds] = useState<string[]>(
    initialVehicleMakeIds ?? [],
  );
  const [isPromo, setIsPromo] = useState(initial?.isPromo ?? false);

  // Convert ISO timestamps to <input type="datetime-local"> format (YYYY-MM-DDTHH:mm)
  const toLocalDt = (iso: string | null | undefined): string => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const isEdit = !!productId;

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );
  const subcategories = useMemo(() => {
    if (!categoryId) return [];
    return categories.filter((c) => c.parentId === categoryId);
  }, [categories, categoryId]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const num = (key: string): number | null => {
      const v = String(fd.get(key) ?? "").trim();
      if (!v) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const cleanedCrossRefs = crossRefs
      .map((c) => ({ brand: c.brand.trim(), code: c.code.trim() }))
      .filter((c) => c.brand.length > 0 && c.code.length > 0);

    const payload: ProductFormValues = {
      partCode: String(fd.get("partCode") ?? ""),
      brand: "",
      manufacturerId,
      slug: String(fd.get("slug") ?? ""),
      price: num("price") ?? 0,
      costPrice: num("costPrice"),
      stockQuantity: num("stockQuantity") ?? 0,
      storageLocation: String(fd.get("storageLocation") ?? ""),
      condition,
      categoryId: categoryId || null,
      subcategoryId: subcategoryId || null,
      warrantyMonths: num("warrantyMonths"),
      weight: num("weight"),
      width: num("width"),
      height: num("height"),
      imageUrl: String(fd.get("imageUrl") ?? ""),
      isActive,
      isFeatured,
      nameRo: String(fd.get("nameRo") ?? ""),
      nameEn: String(fd.get("nameEn") ?? ""),
      nameRu: String(fd.get("nameRu") ?? ""),
      descriptionRo: String(fd.get("descriptionRo") ?? ""),
      descriptionEn: String(fd.get("descriptionEn") ?? ""),
      descriptionRu: String(fd.get("descriptionRu") ?? ""),
      oemCodes,
      crossReferences: cleanedCrossRefs,
      vehicleMakeIds: busMakeIds,
      isPromo,
      promoPrice: isPromo ? num("promoPrice") : null,
      promoStartsAt: isPromo
        ? (() => {
            const v = String(fd.get("promoStartsAt") ?? "").trim();
            return v ? new Date(v).toISOString() : null;
          })()
        : null,
      promoEndsAt: isPromo
        ? (() => {
            const v = String(fd.get("promoEndsAt") ?? "").trim();
            return v ? new Date(v).toISOString() : null;
          })()
        : null,
    };

    const errs: Record<string, string> = {};
    if (!payload.nameRo && !payload.nameEn && !payload.nameRu) {
      errs.nameRo = labels.required;
    }
    if (payload.price < 0 || !Number.isFinite(payload.price)) errs.price = labels.required;
    if (payload.stockQuantity < 0) errs.stockQuantity = labels.required;
    if (isPromo) {
      const pp = payload.promoPrice ?? null;
      if (pp == null || pp <= 0) {
        errs.promoPrice = labels.required;
      } else if (pp >= payload.price) {
        errs.promoPrice = labels.required;
      }
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    startTransition(async () => {
      const res = isEdit
        ? await updateProduct(productId!, payload)
        : await createProduct(payload);
      if (!res.ok) {
        toast.error(res.message ?? labels.error_generic);
        setErrors({ root: res.message ?? labels.error_generic });
        return;
      }
      toast.success("✓");
      if (isEdit) {
        router.refresh();
      } else {
        router.replace(`/${locale}/admin/products/${res.id}`);
      }
    });
  };

  const onDelete = () => {
    if (!productId) return;
    if (!confirm(labels.confirm_delete)) return;
    startDelTransition(async () => {
      const res = await deleteProduct(productId);
      if (!res.ok) {
        toast.error(res.message ?? labels.error_generic);
        return;
      }
      toast.success("✓");
      router.replace(`/${locale}/admin/products`);
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.6fr_1fr]" noValidate>
      <div className="flex flex-col gap-5">
        {/* Identification */}
        <Card title={labels.section_basic}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={labels.field_part_code}>
              <Input
                name="partCode"
                defaultValue={initial?.partCode ?? ""}
                className="font-mono"
              />
            </Field>
            <Field label={labels.field_manufacturer}>
              <ManufacturerCombobox
                options={manufacturers}
                value={manufacturerId}
                onChange={(id) => setManufacturerId(id)}
                labels={{
                  none: labels.field_manufacturer_none,
                  add: labels.field_manufacturer_add,
                  placeholder: labels.field_manufacturer_placeholder,
                }}
              />
            </Field>
          </div>
          <Field label={labels.field_slug} hint={labels.field_slug_hint}>
            <Input
              name="slug"
              defaultValue={initial?.slug ?? ""}
              placeholder="my-product-slug"
            />
          </Field>
          <Field label={labels.field_condition}>
            <div className="flex flex-wrap gap-2">
              {(["new", "refurbished", "used"] as const).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCondition(c)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs transition-colors",
                    condition === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-surface text-muted-strong hover:border-border-strong",
                  )}
                >
                  {c === "new"
                    ? labels.field_condition_new
                    : c === "refurbished"
                      ? labels.field_condition_refurbished
                      : labels.field_condition_used}
                </button>
              ))}
            </div>
          </Field>
        </Card>

        {/* Codes — OEM + Cross-references */}
        <Card title={labels.section_codes} subtitle={labels.section_codes_hint}>
          <Field label={labels.field_oem_codes}>
            <TagInput
              values={oemCodes}
              onChange={setOemCodes}
              placeholder={labels.field_oem_placeholder}
              uppercase={false}
            />
          </Field>
          <Field label={labels.field_cross_refs}>
            <CrossRefEditor
              values={crossRefs}
              onChange={setCrossRefs}
              brandSuggestions={brandSuggestions}
              labels={{
                brand: labels.field_cross_refs_brand,
                code: labels.field_cross_refs_code,
                add: labels.field_cross_refs_add,
              }}
            />
          </Field>
        </Card>

        {/* Bus compatibility */}
        <Card title={labels.section_bus}>
          <Field label={labels.field_bus_makes}>
            <BusMakesMultiSelect
              options={vehicleMakes}
              selectedIds={busMakeIds}
              onChange={setBusMakeIds}
              labels={{
                add: labels.field_bus_makes_add,
                placeholder: labels.field_bus_makes_placeholder,
                empty: labels.field_bus_makes_empty,
              }}
            />
          </Field>
        </Card>

        {/* Names */}
        <Card title={labels.section_names}>
          <Field label={labels.field_name_ro} error={errors.nameRo}>
            <Input name="nameRo" defaultValue={initial?.nameRo ?? ""} />
          </Field>
          <Field label={labels.field_name_en}>
            <Input name="nameEn" defaultValue={initial?.nameEn ?? ""} />
          </Field>
          <Field label={labels.field_name_ru}>
            <Input name="nameRu" defaultValue={initial?.nameRu ?? ""} />
          </Field>
        </Card>

        {/* Descriptions */}
        <Card title={labels.section_descriptions}>
          <Field label={labels.field_description_ro}>
            <Textarea name="descriptionRo" defaultValue={initial?.descriptionRo ?? ""} />
          </Field>
          <Field label={labels.field_description_en}>
            <Textarea name="descriptionEn" defaultValue={initial?.descriptionEn ?? ""} />
          </Field>
          <Field label={labels.field_description_ru}>
            <Textarea name="descriptionRu" defaultValue={initial?.descriptionRu ?? ""} />
          </Field>
        </Card>

        {/* Promotion */}
        <Card title={labels.section_promo} subtitle={labels.promo_hint}>
          <Toggle
            label={labels.field_is_promo}
            checked={isPromo}
            onChange={setIsPromo}
          />
          {isPromo ? (
            <>
              <Field label={labels.field_promo_price} error={errors.promoPrice}>
                <Input
                  name="promoPrice"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={initial?.promoPrice ?? ""}
                  required
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={labels.field_promo_starts}>
                  <Input
                    name="promoStartsAt"
                    type="datetime-local"
                    defaultValue={toLocalDt(initial?.promoStartsAt)}
                  />
                </Field>
                <Field label={labels.field_promo_ends}>
                  <Input
                    name="promoEndsAt"
                    type="datetime-local"
                    defaultValue={toLocalDt(initial?.promoEndsAt)}
                  />
                </Field>
              </div>
            </>
          ) : null}
        </Card>

        {/* Specs */}
        <Card title={labels.section_specs}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={labels.field_warranty}>
              <Input
                name="warrantyMonths"
                type="number"
                min={0}
                step={1}
                defaultValue={initial?.warrantyMonths ?? 12}
              />
            </Field>
            <Field label={labels.field_weight}>
              <Input
                name="weight"
                type="number"
                step="0.001"
                min={0}
                defaultValue={initial?.weight ?? ""}
              />
            </Field>
            <Field label={labels.field_image_url}>
              <Input name="imageUrl" defaultValue={initial?.imageUrl ?? ""} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={labels.field_width}>
              <Input
                name="width"
                type="number"
                step="0.01"
                min={0}
                defaultValue={initial?.width ?? ""}
              />
            </Field>
            <Field label={labels.field_height}>
              <Input
                name="height"
                type="number"
                step="0.01"
                min={0}
                defaultValue={initial?.height ?? ""}
              />
            </Field>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <aside className="flex flex-col gap-5">
        <Card title={labels.section_pricing}>
          <Field label={labels.field_price} error={errors.price}>
            <Input
              name="price"
              type="number"
              step="0.01"
              min={0}
              defaultValue={initial?.price ?? 0}
              required
            />
          </Field>
          <Field label={labels.field_cost_price}>
            <Input
              name="costPrice"
              type="number"
              step="0.01"
              min={0}
              defaultValue={initial?.costPrice ?? ""}
            />
          </Field>
          <Field label={labels.field_stock} error={errors.stockQuantity}>
            <Input
              name="stockQuantity"
              type="number"
              min={0}
              step={1}
              defaultValue={initial?.stockQuantity ?? 0}
              required
            />
          </Field>
          <Field label={labels.field_storage_location}>
            <Input
              name="storageLocation"
              defaultValue={initial?.storageLocation ?? ""}
              placeholder="A-12-3"
              className="font-mono"
            />
          </Field>
        </Card>

        <Card title={labels.section_category}>
          <Field label={labels.field_category}>
            <select
              value={categoryId ?? ""}
              onChange={(e) => {
                const next = e.target.value || null;
                setCategoryId(next);
                setSubcategoryId(null);
              }}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary"
            >
              <option value="">{labels.field_category_none}</option>
              {rootCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={labels.field_subcategory}>
            <select
              value={subcategoryId ?? ""}
              onChange={(e) => setSubcategoryId(e.target.value || null)}
              disabled={subcategories.length === 0}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">{labels.field_subcategory_none}</option>
              {subcategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Toggle
            label={labels.field_active}
            checked={isActive}
            onChange={setIsActive}
          />
          <Toggle
            label={labels.field_featured}
            checked={isFeatured}
            onChange={setIsFeatured}
          />
        </Card>

        {errors.root ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
            {errors.root}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={pending || delPending}
          >
            <Save className="size-4" />
            {pending
              ? isEdit
                ? labels.saving
                : labels.creating
              : isEdit
                ? labels.save
                : labels.create}
          </Button>
          <Button
            asChild
            type="button"
            size="md"
            variant="ghost"
            className="w-full"
          >
            <Link href={"/admin/products" as const} locale={locale}>
              {labels.cancel}
            </Link>
          </Button>
          {isEdit ? (
            <Button
              type="button"
              size="md"
              variant="destructive"
              className="mt-4 w-full"
              onClick={onDelete}
              disabled={delPending || pending}
            >
              <Trash2 className="size-4" />
              {labels.delete}
            </Button>
          ) : null}
        </div>
      </aside>
    </form>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-5 md:p-6">
      <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        {title}
      </h3>
      {subtitle ? (
        <p className="mb-4 text-xs text-muted-strong">{subtitle}</p>
      ) : (
        <div className="mb-3" />
      )}
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">
        {label}
        {error ? <span className="ml-1 text-destructive">*</span> : null}
      </span>
      {children}
      {hint && !error ? (
        <span className="text-[10px] text-muted">{hint}</span>
      ) : null}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      rows={4}
      {...props}
      className={cn(
        "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary",
        props.className,
      )}
    />
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-background/40 px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-accent-dark-strong",
        )}
      >
        <span
          className={cn(
            "inline-block size-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}
