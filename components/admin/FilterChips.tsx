"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils/cn";

export function FilterChips({
  paramName,
  options,
}: {
  paramName: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? options[0]?.value;

  const onSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === options[0]?.value) params.delete(paramName);
    else params.set(paramName, value);
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onSelect(o.value)}
          className={cn(
            "rounded-sm border px-3 py-1.5 text-xs transition-colors",
            current === o.value
              ? "border-primary bg-primary/15 text-primary"
              : "border-border bg-surface text-muted-strong hover:border-border-strong",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
