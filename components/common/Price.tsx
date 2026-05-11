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
  eurRate,
  showVat = false,
  vatLabels,
}: {
  value: number;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  accent?: boolean;
  /**
   * If provided AND currency is MDL, render a small `≈ €X.YY` line below the
   * main price. The value is `MDL per 1 EUR` (BNM-style). Omit on admin /
   * order-history views where the EUR equivalent would be misleading (it's
   * computed at render time, not at sale time).
   */
  eurRate?: number | null;
  /**
   * If true, label the main price as "CU TVA" and render the without-VAT
   * value below as `value / 1.20`. The entered price is the gross /
   * with-VAT amount (TVA 20%, standard MD rate); the without-VAT line is
   * the net amount, computed so that net × 1.20 reconciles back to gross
   * (which a simple -20% would not — see SFS / accounting rules).
   */
  showVat?: boolean;
  vatLabels?: { withVat: string; withoutVat: string };
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

  const showEur = isMDL && typeof eurRate === "number" && eurRate > 0;
  const eurValue = showEur ? value / eurRate! : 0;
  const eurWhole = Math.floor(eurValue);
  const eurCents = Math.round((eurValue - eurWhole) * 100)
    .toString()
    .padStart(2, "0");

  const vatIncluded = vatLabels?.withVat ?? "CU TVA";
  const vatExcludedLabel = vatLabels?.withoutVat ?? "fără TVA";
  const withoutVatValue = value / 1.2;
  const withoutVatWhole = Math.floor(withoutVatValue);
  const withoutVatCents = Math.round((withoutVatValue - withoutVatWhole) * 100)
    .toString()
    .padStart(2, "0");

  const main = (
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

  if (!showEur && !showVat) return main;

  return (
    <span className="inline-flex flex-col items-start leading-tight">
      <span className="inline-flex items-baseline gap-1.5">
        {main}
        {showVat ? (
          <span className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary/80">
            {vatIncluded}
          </span>
        ) : null}
      </span>
      {showVat && isMDL ? (
        <span className="text-[11px] font-medium tabular-nums text-muted">
          {vatExcludedLabel}: {withoutVatWhole}.{withoutVatCents} {symbol}
        </span>
      ) : null}
      {showEur ? (
        <span className="text-[11px] font-medium tabular-nums text-muted">
          ≈ €{eurWhole}.{eurCents}
        </span>
      ) : null}
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
