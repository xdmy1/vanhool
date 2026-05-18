"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { type AccountScope } from "@/lib/panel/scope";
import { setActiveBook } from "@/lib/panel/scope-actions";

const SCOPE_LOCKED_CONTA1: readonly string[] = [
  "/panel/facturi",
  "/panel/cheltuieli",
  "/panel/export-documente",
  "/panel/statistici",
];
const SCOPE_LOCKED_CONTA2: readonly string[] = ["/panel/cheltuieli-cash"];

function lockedScope(stripped: string): AccountScope | null {
  if (SCOPE_LOCKED_CONTA1.some((p) => stripped === p || stripped.startsWith(`${p}/`))) {
    return "conta1";
  }
  if (SCOPE_LOCKED_CONTA2.some((p) => stripped === p || stripped.startsWith(`${p}/`))) {
    return "conta2";
  }
  return null;
}

export function BookScopeSwitcher({
  locale,
  current,
  labels,
}: {
  locale: string;
  current: AccountScope;
  labels: { conta1: string; conta2: string; lockedHint: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const stripped = pathname.replace(new RegExp(`^/${locale}`), "");
  const forced = lockedScope(stripped);
  const effective: AccountScope = forced ?? current;

  function pick(next: AccountScope) {
    if (forced) return;
    if (next === effective) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("book", next);
    startTransition(async () => {
      await setActiveBook(next);
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div
      className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5"
      title={forced ? labels.lockedHint : undefined}
      aria-disabled={!!forced}
    >
      {(["conta1", "conta2"] as const).map((scope) => {
        const active = scope === effective;
        const disabled = !!forced && scope !== forced;
        return (
          <button
            key={scope}
            type="button"
            onClick={() => pick(scope)}
            disabled={disabled || pending}
            className={cn(
              "rounded-[5px] px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-strong hover:text-foreground",
              disabled ? "cursor-not-allowed opacity-50 hover:text-muted-strong" : "",
              pending && active ? "opacity-70" : "",
            )}
          >
            {scope === "conta1" ? labels.conta1 : labels.conta2}
          </button>
        );
      })}
    </div>
  );
}
