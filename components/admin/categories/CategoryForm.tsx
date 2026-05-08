"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/lib/i18n/routing";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type CategoryFormValues,
} from "@/lib/admin/categories/actions";
import { cn } from "@/lib/utils/cn";

type Labels = {
  slug: string;
  name_ro: string;
  name_en: string;
  name_ru: string;
  parent: string;
  parent_none: string;
  sort_order: string;
  active: string;
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

export function CategoryForm({
  categoryId,
  initial,
  parents,
  locale,
  labels,
}: {
  categoryId?: string;
  initial?: Partial<CategoryFormValues>;
  parents: { id: string; name: string }[];
  locale: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [delPending, startDelTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [parentId, setParentId] = useState<string | null>(initial?.parentId ?? null);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const isEdit = !!categoryId;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const payload: CategoryFormValues = {
      slug: String(fd.get("slug") ?? "").trim(),
      parentId: parentId || null,
      sortOrder: Number(fd.get("sortOrder") ?? 0) || 0,
      isActive,
      nameRo: String(fd.get("nameRo") ?? ""),
      nameEn: String(fd.get("nameEn") ?? ""),
      nameRu: String(fd.get("nameRu") ?? ""),
    };
    const errs: Record<string, string> = {};
    if (!payload.slug) errs.slug = labels.required;
    if (!payload.nameRo && !payload.nameEn && !payload.nameRu) errs.nameRo = labels.required;
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    startTransition(async () => {
      const res = isEdit
        ? await updateCategory(categoryId!, payload)
        : await createCategory(payload);
      if (!res.ok) {
        toast.error(res.message ?? labels.error_generic);
        setErrors({ root: res.message ?? labels.error_generic });
        return;
      }
      toast.success("✓");
      if (isEdit) router.refresh();
      else router.replace(`/${locale}/admin/categories`);
    });
  };

  const onDelete = () => {
    if (!categoryId) return;
    if (!confirm(labels.confirm_delete)) return;
    startDelTransition(async () => {
      const res = await deleteCategory(categoryId);
      if (!res.ok) {
        toast.error(res.message ?? labels.error_generic);
        return;
      }
      toast.success("✓");
      router.replace(`/${locale}/admin/categories`);
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="grid max-w-3xl gap-5 rounded-md border border-border bg-surface p-6"
      noValidate
    >
      <Field label={labels.slug} error={errors.slug}>
        <Input
          name="slug"
          defaultValue={initial?.slug ?? ""}
          placeholder="my-category"
          className=""
          required
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={labels.name_ro} error={errors.nameRo}>
          <Input name="nameRo" defaultValue={initial?.nameRo ?? ""} />
        </Field>
        <Field label={labels.name_en}>
          <Input name="nameEn" defaultValue={initial?.nameEn ?? ""} />
        </Field>
        <Field label={labels.name_ru}>
          <Input name="nameRu" defaultValue={initial?.nameRu ?? ""} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={labels.parent}>
          <select
            value={parentId ?? ""}
            onChange={(e) => setParentId(e.target.value || null)}
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-primary"
          >
            <option value="">{labels.parent_none}</option>
            {parents
              .filter((p) => p.id !== categoryId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label={labels.sort_order}>
          <Input
            name="sortOrder"
            type="number"
            min={0}
            step={1}
            defaultValue={initial?.sortOrder ?? 0}
          />
        </Field>
      </div>

      <Toggle label={labels.active} checked={isActive} onChange={setIsActive} />

      {errors.root ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {errors.root}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="md" className="" disabled={pending || delPending}>
          <Save className="size-4" />
          {pending ? (isEdit ? labels.saving : labels.creating) : isEdit ? labels.save : labels.create}
        </Button>
        <Button asChild type="button" size="md" variant="ghost" className="">
          <Link href={"/admin/categories" as "/admin/categories"} locale={locale}>
            {labels.cancel}
          </Link>
        </Button>
        {isEdit ? (
          <Button
            type="button"
            size="md"
            variant="destructive"
            className="ml-auto"
            onClick={onDelete}
            disabled={delPending || pending}
          >
            <Trash2 className="size-4" />
            {labels.delete}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">
        {label}
        {error ? <span className="ml-1 text-destructive">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
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
