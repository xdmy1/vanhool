"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban } from "lucide-react";

import { voidStoreCredit } from "@/lib/panel/credits/actions";

/** Void a store credit (customer no longer has it). */
export function VoidCreditButton({ creditId }: { creditId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await voidStoreCredit(creditId);
          if (!res.ok) {
            toast.error("Nu am putut anula creditul.");
            return;
          }
          toast.success("Credit anulat.");
          router.refresh();
        })
      }
      className="inline-flex items-center gap-1 rounded border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-strong transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
      title="Anulează creditul"
    >
      <Ban className="size-3" />
      Anulează
    </button>
  );
}
