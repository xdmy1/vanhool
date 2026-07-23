"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Gift, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { issueStoreCredit } from "@/lib/panel/credits/actions";

/** Panel button to grant a store credit to a client (amount + currency + reason). */
export function IssueCreditButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"MDL" | "EUR" | "USD">("MDL");
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    const amt = Number(amount);
    if (!(amt > 0)) {
      toast.error("Sumă invalidă.");
      return;
    }
    start(async () => {
      const res = await issueStoreCredit({
        client_id: clientId,
        amount: amt,
        currency,
        reason,
      });
      if (!res.ok) {
        toast.error(`Nu am putut emite creditul (${res.reason}).`);
        return;
      }
      toast.success(`Credit ${res.serial} emis.`);
      setOpen(false);
      setAmount("");
      setReason("");
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Gift className="size-4" />
        Emite credit
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 p-2">
      <Input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        inputMode="decimal"
        placeholder="Sumă"
        className="h-8 w-24 text-right"
      />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as "MDL" | "EUR" | "USD")}
        className="h-8 rounded-md border border-border bg-surface px-2 text-sm"
      >
        <option value="MDL">Lei</option>
        <option value="EUR">EUR</option>
        <option value="USD">USD</option>
      </select>
      <Input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="motiv (ex: comandă site nereturnabilă)"
        className="h-8 w-64 text-sm"
      />
      <Button onClick={submit} disabled={pending} size="sm">
        {pending ? "…" : "Emite"}
      </Button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex size-7 items-center justify-center rounded text-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
