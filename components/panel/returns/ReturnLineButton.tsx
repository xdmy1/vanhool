"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Undo2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createInvoiceLineReturn,
  createPurchaseLineReturn,
} from "@/lib/panel/returns/actions";
import { cn } from "@/lib/utils/cn";

/**
 * Per-line "Retur" button. On an invoice line it credits the customer (annex
 * -amount, restocks); on a purchase line it returns to the supplier (annex
 * -cost, de-stocks). Opens a tiny inline form for quantity + reason.
 */
export function ReturnLineButton({
  kind,
  parentId,
  lineIndex,
  purchaseItemId,
  maxQty,
  label,
  compact = true,
}: {
  kind: "invoice" | "purchase";
  parentId: string;
  /** invoice: index of the line in items_snapshot. */
  lineIndex?: number;
  /** purchase: purchase_items.id. */
  purchaseItemId?: string;
  maxQty: number;
  label?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState<string>(String(maxQty));
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    const q = Math.min(Math.max(0, Number(qty) || 0), maxQty);
    if (q <= 0) {
      toast.error("Cantitate invalidă.");
      return;
    }
    start(async () => {
      const res =
        kind === "invoice"
          ? await createInvoiceLineReturn(parentId, lineIndex ?? 0, q, reason)
          : await createPurchaseLineReturn(parentId, purchaseItemId ?? "", q, reason);
      if (!res.ok) {
        toast.error(`Nu am putut crea returul (${res.reason}).`);
        return;
      }
      toast.success(
        kind === "invoice"
          ? "Anexă de retur adăugată la factură (+stoc)."
          : "Anexă de retur furnizor adăugată (−stoc).",
      );
      setOpen(false);
      setReason("");
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-muted-strong transition-colors hover:border-destructive/40 hover:text-destructive",
          compact ? "" : "px-3 py-1.5",
        )}
        title="Creează anexă de retur pentru această linie"
      >
        <Undo2 className="size-3.5" />
        {label ?? "Retur"}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1">
      <Input
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        inputMode="decimal"
        className="h-7 w-16 text-right text-xs"
        title="Cantitate returnată"
      />
      <Input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="motiv (opțional)"
        className="h-7 w-32 text-xs"
      />
      <Button onClick={submit} disabled={pending} size="sm" variant="destructive" className="h-7 px-2 text-xs">
        {pending ? "…" : `Retur (max ${maxQty})`}
      </Button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex size-6 items-center justify-center rounded text-muted hover:text-foreground"
        title="Renunță"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
