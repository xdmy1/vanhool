"use client";

import { useState, type FormEvent } from "react";
import { Tag, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart/store";
import { applyPromoCode } from "@/lib/cart/actions";

export function PromoInput({
  labels,
}: {
  labels: {
    title: string;
    placeholder: string;
    apply: string;
    remove: string;
    invalid: string;
    applied: string;
    minOrder: string;
  };
}) {
  const promo = useCart((s) => s.promo);
  const setPromo = useCart((s) => s.setPromo);
  const subtotal = useCart((s) =>
    s.items.reduce((acc, i) => acc + i.price * i.quantity, 0),
  );
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setPending(true);
    try {
      const result = await applyPromoCode(code.trim(), subtotal);
      if (!result.ok) {
        toast.error(result.reason === "min_order" ? labels.minOrder : labels.invalid);
        return;
      }
      setPromo(result.promo);
      setCode("");
      toast.success(labels.applied);
    } finally {
      setPending(false);
    }
  };

  if (promo) {
    return (
      <div className="rounded-md border border-success/40 bg-success/10 p-3">
        <div className="flex items-center gap-2 text-xs text-success">
          <Tag className="size-3" /> {labels.applied}
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">
            {promo.code}
          </span>
          <button
            type="button"
            onClick={() => setPromo(null)}
            className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-destructive"
            title={labels.remove}
          >
            <X className="size-3" /> {labels.remove}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <Tag className="size-3" /> {labels.title}
      </div>
      <div className="flex items-stretch gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={labels.placeholder}
          className=""
        />
        <Button type="submit" variant="secondary" size="md" disabled={pending || !code}>
          {labels.apply}
        </Button>
      </div>
    </form>
  );
}
