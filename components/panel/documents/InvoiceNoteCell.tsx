"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { setInvoiceQuickNote } from "@/lib/panel/invoices/actions";
import { cn } from "@/lib/utils/cn";

/**
 * Inline-editable "notă" cell for the proforme + facturi lists.
 * Click anywhere on the cell → small text input expands in place.
 * Enter saves, Escape cancels, blur saves. Optimistic update keeps
 * the cell responsive even on a slow server round-trip.
 *
 * Default state shows the saved note, or a faded `+ adaugă notă`
 * placeholder so operators can find the affordance at a glance.
 */
export function InvoiceNoteCell({
  invoiceId,
  initial,
}: {
  invoiceId: string;
  initial: string | null;
}) {
  const [value, setValue] = useState(initial ?? "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pending, startSave] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // External revalidation (router.refresh) replaces `initial`; sync
  // local state so a re-render doesn't display a stale value after
  // someone else edited the same row.
  useEffect(() => {
    if (!editing) setValue(initial ?? "");
  }, [initial, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commit() {
    const next = draft.trim();
    if (next === value) {
      setEditing(false);
      return;
    }
    setValue(next);
    setEditing(false);
    startSave(async () => {
      const res = await setInvoiceQuickNote(invoiceId, next);
      if (!res.ok) {
        toast.error(`Nota nu s-a salvat: ${res.reason}`);
        // Roll back optimistic value on failure.
        setValue(initial ?? "");
      }
    });
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
        }}
        maxLength={200}
        placeholder="ex: bus Mercedes E213"
        className="h-7 w-full min-w-[180px] rounded border border-primary/40 bg-surface px-2 text-xs outline-none focus:border-primary"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={cn(
        "group inline-flex w-full min-w-[120px] items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs transition-colors hover:bg-surface-elevated",
        pending && "opacity-50",
      )}
      title="Click pentru editare"
    >
      {value ? (
        <span className="truncate text-muted-strong">{value}</span>
      ) : (
        <span className="text-muted italic">+ notă</span>
      )}
      <Pencil className="size-3 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
