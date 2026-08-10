"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { deleteReturn } from "@/lib/panel/returns/actions";

/** Undo a return annex (reverses its stock move, then removes the row). */
export function DeleteReturnButton({ returnId }: { returnId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await deleteReturn(returnId);
          if (!res.ok) {
            toast.error("Nu am putut anula anexa.");
            return;
          }
          // Copy stays honest: on a cancelled/voided parent the stock move is
          // deliberately skipped (the cancel already netted it), so we don't
          // claim a reversal that may not have happened.
          toast.success("Anexă anulată.");
          router.refresh();
        })
      }
      className="inline-flex items-center gap-1 rounded border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-strong transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
      title="Anulează această anexă de retur"
    >
      <Trash2 className="size-3" />
      Anulează
    </button>
  );
}
