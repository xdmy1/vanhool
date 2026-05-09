import { cn } from "@/lib/utils/cn";

/**
 * Display a price using Moldova's leu (MDL). Default currency is MDL —
 * rendered as `123.45 lei`. Pass currency="EUR" to fall back to legacy `€`
 * formatting where strictly needed.
 */
export function Price({
  value,
  currency = "MDL",
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
  const isMDL = currency === "MDL";
  const symbol = isMDL ? "lei" : currency === "EUR" ? "€" : currency;
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

  const symbolClass = cn(
    "font-medium",
    size === "xl" || size === "lg" ? "text-xs" : "text-[0.7em]",
  );
  const centsClass = cn("text-[0.55em]", accent ? "text-primary/80" : "text-muted");

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-0.5 font-semibold tabular-nums",
        accent ? "text-primary" : "text-foreground",
        sizes[size],
        className,
      )}
    >
      {!isMDL ? <span className={symbolClass}>{symbol}</span> : null}
      <span>{whole}</span>
      <span className={centsClass}>.{cents}</span>
      {isMDL ? <span className={cn(symbolClass, "ml-1")}>{symbol}</span> : null}
    </span>
  );
}

/**
 * Plain string formatter for places where we render the price inside text
 * (toast notifications, alt attributes). Mirrors Price component formatting.
 */
export function formatPrice(value: number, currency: string = "MDL"): string {
  const formatted = `${Math.floor(value)}.${Math.round((value - Math.floor(value)) * 100).toString().padStart(2, "0")}`;
  if (currency === "MDL") return `${formatted} lei`;
  if (currency === "EUR") return `€${formatted}`;
  return `${formatted} ${currency}`;
}
