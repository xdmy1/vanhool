"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { setDocumentScope } from "@/lib/panel/invoices/actions";
import { cn } from "@/lib/utils/cn";

/**
 * Two-button book selector for a single invoice / proforma. Moving the
 * document recomputes its VAT to match the book (conta1 = 20%, conta2 = 0%);
 * the gross total is unchanged. This is the only way a document changes book —
 * payment no longer flips it automatically.
 */
export function DocumentScopeSwitcher({
  id,
  scope,
}: {
  id: string;
  scope: "conta1" | "conta2";
}) {
  const t = useTranslations("panel");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function move(next: "conta1" | "conta2") {
    if (next === scope || pending) return;
    startTransition(async () => {
      const res = await setDocumentScope(id, next);
      if (res.ok) {
        toast.success(t("scope_changed", { book: next === "conta1" ? t("conta1") : t("conta2") }));
        router.refresh();
      } else {
        toast.error(t("sale_error", { reason: res.reason }));
      }
    });
  }

  return (
    <div className="inline-flex overflow-hidden rounded-md border border-border">
      {(["conta1", "conta2"] as const).map((b) => {
        const active = b === scope;
        return (
          <button
            key={b}
            type="button"
            onClick={() => move(b)}
            disabled={pending}
            className={cn(
              "px-2.5 py-1 text-xs transition-colors disabled:opacity-50",
              active
                ? "bg-foreground text-background"
                : "bg-surface text-muted-strong hover:text-foreground",
            )}
          >
            {b === "conta1" ? t("conta1") : t("conta2")}
          </button>
        );
      })}
    </div>
  );
}
