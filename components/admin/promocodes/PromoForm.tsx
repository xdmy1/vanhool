"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/lib/i18n/routing";
import { PinDeleteButton } from "@/components/panel/documents/PinDeleteButton";
import {
  createPromo,
  deletePromoWithPin,
  updatePromo,
  type PromoFormValues,
} from "@/lib/admin/promocodes/actions";
import { cn } from "@/lib/utils/cn";

type Labels = {
  code: string;
  discount_type: string;
  type_percentage: string;
  type_fixed: string;
  discount_value: string;
  min_order: string;
  max_uses: string;
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

export function PromoForm({
  promoId,
  initial,
  locale,
  labels,
}: {
  promoId?: string;
  initial?: Partial<PromoFormValues>;
  locale: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    initial?.discountType ?? "percentage",
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const isEdit = !!promoId;

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

    const payload: PromoFormValues = {
      code: String(fd.get("code") ?? "").trim().toUpperCase(),
      discountType,
      discountValue: num("discountValue") ?? 0,
      minOrderAmount: num("minOrderAmount"),
      maxUses: num("maxUses"),
      isActive,
    };

    const errs: Record<string, string> = {};
    if (!payload.code || payload.code.length < 2) errs.code = labels.required;
    if (!Number.isFinite(payload.discountValue) || payload.discountValue < 0) {
      errs.discountValue = labels.required;
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    startTransition(async () => {
      const res = isEdit
        ? await updatePromo(promoId!, payload)
        : await createPromo(payload);
      if (!res.ok) {
        toast.error(res.message ?? labels.error_generic);
        setErrors({ root: res.message ?? labels.error_generic });
        return;
      }
      toast.success("✓");
      if (isEdit) router.refresh();
      else router.replace(`/${locale}/admin/promocodes`);
    });
  };


  return (
    <form
      onSubmit={onSubmit}
      className="grid max-w-3xl gap-5 rounded-md border border-border bg-surface p-6"
      noValidate
    >
      <Field label={labels.code} error={errors.code}>
        <Input
          name="code"
          defaultValue={initial?.code ?? ""}
          placeholder="WELCOME10"
          className=""
          required
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={labels.discount_type}>
          <div className="grid grid-cols-2 overflow-hidden rounded-md border border-border">
            <button
              type="button"
              onClick={() => setDiscountType("percentage")}
              className={cn(
                "px-3 py-2 text-xs transition-colors",
                discountType === "percentage"
                  ? "bg-primary/15 text-primary"
                  : "bg-surface text-muted-strong hover:text-foreground",
              )}
            >
              {labels.type_percentage}
            </button>
            <button
              type="button"
              onClick={() => setDiscountType("fixed")}
              className={cn(
                "px-3 py-2 text-xs transition-colors",
                discountType === "fixed"
                  ? "bg-primary/15 text-primary"
                  : "bg-surface text-muted-strong hover:text-foreground",
              )}
            >
              {labels.type_fixed}
            </button>
          </div>
        </Field>
        <Field label={labels.discount_value} error={errors.discountValue}>
          <Input
            name="discountValue"
            type="number"
            min={0}
            max={discountType === "percentage" ? 100 : undefined}
            step={discountType === "percentage" ? 1 : "0.01"}
            defaultValue={initial?.discountValue ?? 0}
            required
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={labels.min_order}>
          <Input
            name="minOrderAmount"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initial?.minOrderAmount ?? ""}
          />
        </Field>
        <Field label={labels.max_uses}>
          <Input
            name="maxUses"
            type="number"
            min={0}
            step={1}
            defaultValue={initial?.maxUses ?? ""}
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
        <Button
          type="submit"
          size="md"
          className=""
          disabled={pending}
        >
          <Save className="size-4" />
          {pending ? (isEdit ? labels.saving : labels.creating) : isEdit ? labels.save : labels.create}
        </Button>
        <Button
          asChild
          type="button"
          size="md"
          variant="ghost"
          className=""
        >
          <Link href={"/admin/promocodes" as "/admin/promocodes"} locale={locale}>
            {labels.cancel}
          </Link>
        </Button>
        {isEdit && promoId ? (
          <div className="ml-auto">
            <PinDeleteButton
              action={deletePromoWithPin}
              entityId={promoId}
              redirectTo={`/${locale}/admin/promocodes`}
              label={labels.delete}
            />
          </div>
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
