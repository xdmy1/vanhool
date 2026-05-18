import { cn } from "@/lib/utils/cn";

type Status = "in_stock" | "low_stock" | "out_of_stock" | "on_order";

export function StockBadge({
  status,
  label,
  className,
}: {
  status: Status;
  label: string;
  className?: string;
}) {
  const palette: Record<Status, { dot: string; text: string; bg: string }> = {
    in_stock: {
      dot: "bg-success",
      text: "text-success",
      bg: "bg-success/10 border-success/30",
    },
    low_stock: {
      dot: "bg-warning",
      text: "text-warning",
      bg: "bg-warning/10 border-warning/30",
    },
    out_of_stock: {
      dot: "bg-muted",
      text: "text-muted",
      bg: "bg-accent-dark border-border",
    },
    // Distinct from in-stock (won't ship today, no green) but actionable —
    // the user can still order it, so we don't grey it out.
    on_order: {
      dot: "bg-primary",
      text: "text-primary",
      bg: "bg-primary/10 border-primary/30",
    },
  };
  const p = palette[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs",
        p.bg,
        p.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", p.dot, status === "in_stock" ? "animate-pulse" : "")} />
      {label}
    </span>
  );
}
