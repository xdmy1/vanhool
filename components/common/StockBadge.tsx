import { cn } from "@/lib/utils/cn";

type Status = "in_stock" | "low_stock" | "out_of_stock";

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
  };
  const p = palette[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider",
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
