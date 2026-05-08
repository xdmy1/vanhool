"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ORDER_STATUSES, type OrderStatus, updateOrderStatus } from "@/lib/admin/orders/actions";
import { cn } from "@/lib/utils/cn";

const STATUS_TONES: Record<string, string> = {
  pending: "border-warning/40 bg-warning/10 text-warning",
  confirmed: "border-primary/40 bg-primary/10 text-primary",
  processing: "border-primary/40 bg-primary/10 text-primary",
  shipped: "border-primary/40 bg-primary/10 text-primary",
  delivered: "border-success/40 bg-success/10 text-success",
  cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
};

export function OrderStatusSelect({
  orderId,
  initialStatus,
  labels,
  size = "md",
}: {
  orderId: string;
  initialStatus: OrderStatus;
  labels: Record<OrderStatus, string> & { update: string; updated: string; error: string };
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  const onPick = (next: OrderStatus) => {
    if (next === status) return;
    const prev = status;
    setStatus(next);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, next);
      if (!res.ok) {
        toast.error(res.message ?? labels.error);
        setStatus(prev);
        return;
      }
      toast.success(labels.updated);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs transition-opacity",
            STATUS_TONES[status] ?? "border-border bg-accent-dark text-muted",
            pending && "opacity-60",
            size === "sm" && "px-1.5 py-0.5",
          )}
        >
          {labels[status]}
          <ChevronDown className="size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{labels.update}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ORDER_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            onSelect={(e) => {
              e.preventDefault();
              onPick(s);
            }}
            className={cn(
              "flex items-center justify-between gap-2",
              s === status && "bg-primary/10 text-primary",
            )}
          >
            <span>{labels[s]}</span>
            {s === status ? (
              <span className="text-xs text-muted">●</span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
