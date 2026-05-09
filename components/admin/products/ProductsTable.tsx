"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Edit, Star, StarOff, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/lib/i18n/routing";
import { PartImage } from "@/components/common/PartImage";
import { Price } from "@/components/common/Price";
import { illustrationFor } from "@/lib/db/types";
import {
  deleteProduct,
  toggleProductActive,
  toggleProductFeatured,
} from "@/lib/admin/products/actions";
import type { AdminProductRow } from "@/lib/admin/queries";
import { cn } from "@/lib/utils/cn";

type Labels = {
  empty: string;
  name: string;
  code: string;
  category: string;
  price: string;
  stock: string;
  status: string;
  active: string;
  inactive: string;
  featured: string;
  edit: string;
  delete: string;
  confirm_delete: string;
  toggle_featured: string;
  toggle_active: string;
};

export function ProductsTable({
  rows,
  categories,
  locale,
  labels,
}: {
  rows: AdminProductRow[];
  categories: Map<string, { name: string; slug: string | null }>;
  locale: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onDelete = (id: string) => {
    if (!confirm(labels.confirm_delete)) return;
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (!res.ok) {
        toast.error(res.message ?? "error");
        return;
      }
      toast.success("✓");
      router.refresh();
    });
  };

  const onToggleActive = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleProductActive(id, !current);
      if (!res.ok) {
        toast.error(res.message ?? "error");
        return;
      }
      router.refresh();
    });
  };

  const onToggleFeatured = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleProductFeatured(id, !current);
      if (!res.ok) {
        toast.error(res.message ?? "error");
        return;
      }
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-md border border-border bg-surface px-6 py-16 text-sm text-muted">
        {labels.empty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-background/40 text-xs text-muted">
            <th className="w-14 px-3 py-3" />
            <th className="px-3 py-3">{labels.name}</th>
            <th className="px-3 py-3">{labels.code}</th>
            <th className="hidden px-3 py-3 lg:table-cell">{labels.category}</th>
            <th className="px-3 py-3 text-right">{labels.price}</th>
            <th className="px-3 py-3 text-right">{labels.stock}</th>
            <th className="hidden px-3 py-3 md:table-cell">{labels.status}</th>
            <th className="px-3 py-3 text-right" />
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const cat = p.category_id ? categories.get(p.category_id) : null;
            const variant = illustrationFor(cat?.slug ?? "");
            const name = p.name_ro ?? p.name_en ?? p.slug ?? p.id;
            return (
              <tr
                key={p.id}
                className={cn(
                  "border-b border-border last:border-b-0 transition-colors hover:bg-background/30",
                  pending && "opacity-60",
                )}
              >
                <td className="px-3 py-2.5">
                  <div className="size-10 overflow-hidden rounded-sm border border-border bg-surface">
                    <PartImage
                      variant={variant}
                      imageUrl={p.image_url}
                      alt={name}
                    />
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/admin/products/${p.id}` as "/admin/products"}
                    locale={locale}
                    className="line-clamp-1 font-semibold transition-colors hover:text-primary"
                  >
                    {name}
                  </Link>
                  <div className="text-xs text-muted">
                    {p.brand ?? "—"}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-strong">
                  {p.part_code ?? "—"}
                </td>
                <td className="hidden px-3 py-2.5 lg:table-cell">
                  {cat?.name ?? <span className="text-muted">—</span>}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Price value={Number(p.price ?? 0)} size="sm" accent={false} />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span
                    className={cn(
                      "rounded-sm border px-2 py-0.5 text-[10px] tabular-nums",
                      (p.stock_quantity ?? 0) === 0
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : (p.stock_quantity ?? 0) <= 5
                          ? "border-warning/40 bg-warning/10 text-warning"
                          : "border-border bg-accent-dark text-muted-strong",
                    )}
                  >
                    {p.stock_quantity ?? 0}
                  </span>
                </td>
                <td className="hidden px-3 py-2.5 md:table-cell">
                  <div className="flex items-center gap-1">
                    {p.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-sm border border-success/40 bg-success/10 px-1.5 py-0.5 text-xs text-success">
                        <CheckCircle2 className="size-3" />
                        {labels.active}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-accent-dark px-1.5 py-0.5 text-xs text-muted">
                        <XCircle className="size-3" />
                        {labels.inactive}
                      </span>
                    )}
                    {p.is_featured ? (
                      <span className="inline-flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                        <Star className="size-3" />
                        {labels.featured}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <IconBtn
                      title={labels.toggle_featured}
                      onClick={() => onToggleFeatured(p.id, !!p.is_featured)}
                      icon={p.is_featured ? Star : StarOff}
                      tone={p.is_featured ? "primary" : "muted"}
                    />
                    <IconBtn
                      title={labels.toggle_active}
                      onClick={() => onToggleActive(p.id, !!p.is_active)}
                      icon={p.is_active ? CheckCircle2 : XCircle}
                      tone={p.is_active ? "success" : "muted"}
                    />
                    <Link
                      href={`/admin/products/${p.id}` as "/admin/products"}
                      locale={locale}
                      title={labels.edit}
                      className="grid size-8 place-items-center rounded-md border border-border bg-surface text-muted-strong transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="size-3.5" />
                    </Link>
                    <IconBtn
                      title={labels.delete}
                      onClick={() => onDelete(p.id)}
                      icon={Trash2}
                      tone="destructive"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function IconBtn({
  title,
  onClick,
  icon: Icon,
  tone,
}: {
  title: string;
  onClick: () => void;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tone: "primary" | "success" | "muted" | "destructive";
}) {
  const tones: Record<typeof tone, string> = {
    primary: "hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-primary",
    success: "hover:border-success/40 hover:bg-success/10 hover:text-success text-success",
    muted: "hover:border-border-strong hover:text-foreground text-muted",
    destructive:
      "hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive text-muted",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "grid size-8 place-items-center rounded-md border border-border bg-surface transition-colors",
        tones[tone],
      )}
    >
      <Icon className="size-3.5" />
    </button>
  );
}
