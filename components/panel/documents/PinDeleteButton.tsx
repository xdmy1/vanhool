"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils/cn";

export type PinDeleteResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * Destructive button that asks for the admin PIN every time before
 * dispatching the delete server action. The PIN is verified server-side;
 * the modal is just UX. Closes on success + optionally redirects.
 */
export function PinDeleteButton({
  action,
  entityId,
  redirectTo,
  label,
  compact = false,
}: {
  action: (id: string, pin: string) => Promise<PinDeleteResult>;
  entityId: string;
  redirectTo?: string;
  /** Override the default "Șterge" label. */
  label?: string;
  /** Smaller variant for use in table rows. */
  compact?: boolean;
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setPin("");
      setError(null);
      const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  // Close on Esc when modal open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submit() {
    if (pin.trim().length === 0) {
      setError(t("pin_delete_required"));
      return;
    }
    startTransition(async () => {
      const res = await action(entityId, pin.trim());
      if (res.ok) {
        toast.success(t("pin_delete_success"));
        setOpen(false);
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else if (res.reason === "bad_pin") {
        setError(t("pin_delete_bad_pin"));
        setPin("");
        inputRef.current?.focus();
      } else {
        setError(t("pin_delete_error", { reason: res.reason }));
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-destructive bg-destructive/10 font-medium text-destructive transition-colors hover:bg-destructive/20",
          compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-xs",
        )}
        title={label ?? t("action_delete")}
      >
        <Trash2 className="size-3.5" />
        {label ?? t("action_delete")}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {t("pin_delete_title")}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground"
                aria-label={t("action_close")}
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mb-3 text-xs text-muted-strong">
              {t("pin_delete_subtitle")}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••"
                className="block w-full rounded-md border border-border bg-background px-3 py-2 text-center text-lg tracking-[0.4em] focus:border-primary focus:outline-none"
                maxLength={12}
              />
              {error ? (
                <div className="mt-2 text-xs text-destructive">{error}</div>
              ) : null}
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted-strong hover:text-foreground"
                  disabled={pending}
                >
                  {t("action_cancel")}
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-md border border-destructive bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-70"
                >
                  <Trash2 className="size-3.5" />
                  {pending ? t("pin_delete_pending") : t("pin_delete_confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
