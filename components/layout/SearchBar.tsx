"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

import { useRouter } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function SearchBar({
  placeholder,
  buttonLabel,
  size = "md",
  className,
}: {
  placeholder: string;
  buttonLabel: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(
      trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : "/catalog",
    );
  };

  const heights = {
    md: "h-11",
    lg: "h-14",
  } as const;

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={cn(
        "group relative flex items-stretch overflow-hidden rounded-md border border-border bg-surface",
        "transition-all focus-within:border-primary focus-within:shadow-[0_0_0_1px_rgba(208,73,65,0.35)]",
        heights[size],
        className,
      )}
    >
      <span className="pointer-events-none grid aspect-square place-items-center text-muted">
        <Search className={cn(size === "lg" ? "size-5" : "size-4")} />
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted outline-none",
          size === "lg" ? "text-base" : "text-sm",
          "pr-3",
        )}
        type="search"
        inputMode="search"
        aria-label={placeholder}
      />
      <Button
        type="submit"
        variant="primary"
        size={size === "lg" ? "lg" : "md"}
        className={cn(
          "shrink-0 rounded-none px-5 font-semibold uppercase tracking-wider",
          size === "lg" ? "text-sm" : "text-xs",
        )}
      >
        <Search className="size-4 md:hidden" />
        <span className="hidden md:inline">{buttonLabel}</span>
      </Button>
    </form>
  );
}
