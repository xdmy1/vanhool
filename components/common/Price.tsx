import { cn } from "@/lib/utils/cn";

export function Price({
  value,
  currency = "EUR",
  className,
  size = "md",
  accent = true,
}: {
  value: number;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  accent?: boolean;
}) {
  const symbol = currency === "EUR" ? "€" : currency;
  const whole = Math.floor(value);
  const cents = Math.round((value - whole) * 100)
    .toString()
    .padStart(2, "0");

  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-0.5 font-semibold tabular-nums",
        accent ? "text-primary" : "text-foreground",
        sizes[size],
        className,
      )}
    >
      <span className={cn("font-medium", size === "xl" || size === "lg" ? "text-xs" : "text-[0.7em]")}>
        {symbol}
      </span>
      <span>{whole}</span>
      <span className={cn("text-[0.55em]", accent ? "text-primary/80" : "text-muted")}>
        .{cents}
      </span>
    </span>
  );
}
