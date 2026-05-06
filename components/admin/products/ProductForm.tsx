"use client";

import { useState, useTransition, type FormEvent } from "react";
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
  type ProductFormValues,
} from "@/lib/admin/products/actions";
import { cn } from "@/lib/utils/cn";

type Labels = {
  field_part_code: string;
  field_brand: string;
  field_slug: string;
  field_slug_hint: string;
  field_price: string;
  field_stock: string;
  field_category: string;
  field_category_none: string;
  field_warranty: string;
  field_weight: string;
  field_width: string;
  field_height: string;
  field_image_url: string;
  field_active: string;
  field_featured: string;
  field_name_ro: string;
  field_name_en: string;
  field_name_ru: string;
  field_description_ro: string;
  field_description_en: string;
  field_description_ru: string;
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
  locale,
  labels,
}: {
  productId?: string;
  initial?: Partial<ProductFormValues>;
  categories: { id: string; name: string }[];
  locale: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [delPending, startDelTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [categoryId, setCategoryId] = useState<string | null>(initial?.categoryId ?? null);

  const isEdit = !!productId;

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

    const payload: ProductFormValues = {
      partCode: String(fd.get("partCode") ?? ""),
      brand: String(fd.get("brand") ?? ""),
      slug: String(fd.get("slug") ?? ""),
      price: num("price") ?? 0,
      stockQuantity: num("stockQuantity") ?? 0,
      categoryId: categoryId || null,
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
    };

    const errs: Record<string, string> = {};
    if (!payload.nameRo && !payload.nameEn && !payload.nameRu) {
      errs.nameRo = labels.required;
    }
    if (payload.price < 0 || !Number.isFinite(payload.price)) errs.price = labels.required;
    if (payload.stockQuantity < 0) errs.stockQuantity = labels.required;
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
        {/* Basic */}
        <Card title="Basic">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={labels.field_part_code}>
              <Input name="partCode" defaultValue={initial?.partCode ?? ""} />
            </Field>
            <Field label={labels.field_brand}>
              <Input name="brand" defaultValue={initial?.brand ?? ""} />
            </Field>
          </div>
          <Field label={labels.field_slug} hint={labels.field_slug_hint}>
            <Input
              name="slug"
              defaultValue={initial?.slug ?? ""}
              placeholder="my-product-slug"
              className="font-mono"
            />
          </Field>
        </Card>

        {/* Names */}
        <Card title="Names (3 locales)">
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
        <Card title="Descriptions (3 locales)">
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

        {/* Specs */}
        <Card title="Specifications">
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
        <Card title="Pricing & stock">
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
        </Card>

        <Card title="Category & status">
          <Field label={labels.field_category}>
            <select
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary"
            >
              <option value="">{labels.field_category_none}</option>
              {categories.map((c) => (
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
            className="w-full uppercase tracking-wider"
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
            className="w-full uppercase tracking-wider"
          >
            <Link href={"/admin/products" as "/admin/products"} locale={locale}>
              {labels.cancel}
            </Link>
          </Button>
          {isEdit ? (
            <Button
              type="button"
              size="md"
              variant="destructive"
              className="mt-4 w-full uppercase tracking-wider"
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-surface p-5 md:p-6">
      <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
        {title}
      </h3>
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
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {label}
        {error ? <span className="ml-1 text-destructive">*</span> : null}
      </span>
      {children}
      {hint && !error ? (
        <span className="font-mono text-[10px] text-muted">{hint}</span>
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
