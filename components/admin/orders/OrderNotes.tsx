"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateOrderNotes } from "@/lib/admin/orders/actions";

export function OrderNotes({
  orderId,
  initialNotes,
  labels,
}: {
  orderId: string;
  initialNotes: string;
  labels: { title: string; placeholder: string; save: string; saved: string; error: string };
}) {
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initialNotes);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateOrderNotes(orderId, notes);
      if (!res.ok) {
        toast.error(res.message ?? labels.error);
        return;
      }
      toast.success(labels.saved);
    });
  };

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-border bg-surface p-5">
      <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
        {labels.title}
      </h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={labels.placeholder}
        rows={4}
        className="w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary"
      />
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        className="mt-3 uppercase tracking-wider"
        disabled={pending}
      >
        <Save className="size-3.5" />
        {labels.save}
      </Button>
    </form>
  );
}
