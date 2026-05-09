"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Percent, ShieldCheck, ShieldOff, User as UserIcon, X } from "lucide-react";
import { toast } from "sonner";

import { Price } from "@/components/common/Price";
import {
  setCustomerAdmin,
  setCustomerDiscount,
} from "@/lib/admin/customers/actions";
import type { AdminCustomerRow } from "@/lib/admin/queries";
import { cn } from "@/lib/utils/cn";

type Labels = {
  empty: string;
  name: string;
  email: string;
  phone: string;
  orders: string;
  spent: string;
  role: string;
  role_admin: string;
  role_customer: string;
  promote: string;
  demote: string;
  discount: string;
  discount_save: string;
  discount_clear: string;
};

export function CustomersTable({
  rows,
  currentUserId,
  locale,
  labels,
}: {
  rows: AdminCustomerRow[];
  currentUserId: string;
  locale: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);
  const [discountDraft, setDiscountDraft] = useState<string>("");

  const onSaveDiscount = (userId: string) => {
    const pct = Number(discountDraft);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      toast.error("0–100");
      return;
    }
    startTransition(async () => {
      const res = await setCustomerDiscount(userId, pct);
      if (!res.ok) {
        toast.error(res.message ?? "error");
        return;
      }
      toast.success("✓");
      setEditingDiscount(null);
      setDiscountDraft("");
      router.refresh();
    });
  };

  const onClearDiscount = (userId: string) => {
    startTransition(async () => {
      const res = await setCustomerDiscount(userId, 0);
      if (!res.ok) {
        toast.error(res.message ?? "error");
        return;
      }
      toast.success("✓");
      router.refresh();
    });
  };

  const onToggle = (userId: string, currentlyAdmin: boolean) => {
    if (userId === currentUserId && currentlyAdmin) {
      toast.error("Cannot revoke your own admin role");
      return;
    }
    startTransition(async () => {
      const res = await setCustomerAdmin(userId, !currentlyAdmin);
      if (!res.ok) {
        toast.error(res.message ?? "error");
        return;
      }
      toast.success("✓");
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

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-background/40 text-xs text-muted">
            <th className="px-3 py-3">{labels.name}</th>
            <th className="hidden px-3 py-3 md:table-cell">{labels.phone}</th>
            <th className="px-3 py-3 text-right">{labels.orders}</th>
            <th className="px-3 py-3 text-right">{labels.spent}</th>
            <th className="px-3 py-3">{labels.discount}</th>
            <th className="px-3 py-3">{labels.role}</th>
            <th className="px-3 py-3 text-right" />
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const isSelf = c.id === currentUserId;
            const initial = (c.full_name || c.email || "?").charAt(0).toUpperCase();
            return (
              <tr
                key={c.id}
                className={cn(
                  "border-b border-border last:border-b-0 transition-colors hover:bg-background/30",
                  pending && "opacity-60",
                )}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-full border text-xs font-bold",
                        c.is_admin
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-accent-dark text-muted-strong",
                      )}
                    >
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {c.full_name ?? "—"}
                        {isSelf ? (
                          <span className="ml-2 text-xs text-muted">
                            (you)
                          </span>
                        ) : null}
                      </div>
                      <div className="truncate text-[11px] text-muted">
                        {c.email ?? "—"}
                      </div>
                      {c.created_at ? (
                        <div className="text-xs text-muted">
                          {new Date(c.created_at).toLocaleDateString(dateLocale)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="hidden px-3 py-2.5 text-xs text-muted-strong md:table-cell">
                  {c.phone ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                  {c.orders_count}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Price value={c.orders_total} size="sm" accent={false} />
                </td>
                <td className="px-3 py-2.5">
                  {editingDiscount === c.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={discountDraft}
                        onChange={(e) => setDiscountDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            onSaveDiscount(c.id);
                          } else if (e.key === "Escape") {
                            setEditingDiscount(null);
                            setDiscountDraft("");
                          }
                        }}
                        autoFocus
                        className="h-7 w-16 rounded-sm border border-border bg-surface px-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => onSaveDiscount(c.id)}
                        className="rounded-sm border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-xs text-primary hover:bg-primary/15"
                        title={labels.discount_save}
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDiscount(null);
                          setDiscountDraft("");
                        }}
                        className="rounded-sm border border-border bg-surface p-1 text-muted hover:text-foreground"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : c.discount_percent && Number(c.discount_percent) > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDiscount(c.id);
                          setDiscountDraft(String(c.discount_percent ?? ""));
                        }}
                        className="inline-flex items-center gap-1 rounded-sm border border-success/40 bg-success/10 px-1.5 py-0.5 text-xs font-semibold text-success hover:bg-success/15"
                      >
                        <Percent className="size-3" />
                        {Number(c.discount_percent).toFixed(
                          Number.isInteger(Number(c.discount_percent)) ? 0 : 1,
                        )}
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => onClearDiscount(c.id)}
                        className="text-[10px] text-muted hover:text-destructive"
                        title={labels.discount_clear}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDiscount(c.id);
                        setDiscountDraft("0");
                      }}
                      className="inline-flex items-center gap-1 rounded-sm border border-border bg-surface px-1.5 py-0.5 text-xs text-muted hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                      title={labels.discount}
                    >
                      <Percent className="size-3" />
                      +
                    </button>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {c.is_admin ? (
                    <span className="inline-flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                      <ShieldCheck className="size-3" />
                      {labels.role_admin}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-accent-dark px-1.5 py-0.5 text-xs text-muted">
                      <UserIcon className="size-3" />
                      {labels.role_customer}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => onToggle(c.id, !!c.is_admin)}
                    disabled={isSelf && !!c.is_admin}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors",
                      "border-border bg-surface text-muted-strong",
                      "hover:border-border-strong hover:text-foreground",
                      "disabled:cursor-not-allowed disabled:opacity-40",
                    )}
                  >
                    {c.is_admin ? (
                      <>
                        <ShieldOff className="size-3" />
                        {labels.demote}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-3" />
                        {labels.promote}
                      </>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
