import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/common/Price";
import { Link } from "@/lib/i18n/routing";
import type { Order } from "@/lib/db/orders";
import { cn } from "@/lib/utils/cn";

const STATUS_TONES: Record<string, string> = {
  pending: "border-warning/40 bg-warning/10 text-warning",
  confirmed: "border-primary/40 bg-primary/10 text-primary",
  processing: "border-primary/40 bg-primary/10 text-primary",
  shipped: "border-primary/40 bg-primary/10 text-primary",
  delivered: "border-success/40 bg-success/10 text-success",
  cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
};

type Labels = {
  empty_title: string;
  empty_body: string;
  empty_cta: string;
  number: string;
  date: string;
  status: string;
  total: string;
  items: string;
  view: string;
  status_pending: string;
  status_confirmed: string;
  status_processing: string;
  status_shipped: string;
  status_delivered: string;
  status_cancelled: string;
};

export function OrdersList({
  orders,
  locale,
  labels,
}: {
  orders: Order[];
  locale: string;
  labels: Labels;
}) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-md border border-border bg-surface p-12 text-center">
        <div className="mb-4 grid size-14 place-items-center rounded-full border border-border bg-background text-muted">
          <ShoppingBag className="size-6" />
        </div>
        <h3 className="text-lg font-semibold">{labels.empty_title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-strong">{labels.empty_body}</p>
        <Button asChild size="md" className="mt-5 uppercase tracking-wider">
          <Link href="/catalog" locale={locale}>
            {labels.empty_cta}
          </Link>
        </Button>
      </div>
    );
  }

  const dateLocale =
    locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";

  const statusLabel = (status: string) => {
    const key = `status_${status}` as keyof Labels;
    return (labels[key] as string | undefined) ?? status;
  };

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-md border border-border bg-surface md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-background/40 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              <th className="px-4 py-3">{labels.number}</th>
              <th className="px-4 py-3">{labels.date}</th>
              <th className="px-4 py-3">{labels.items}</th>
              <th className="px-4 py-3">{labels.status}</th>
              <th className="px-4 py-3 text-right">{labels.total}</th>
              <th className="px-4 py-3 text-right" />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3 font-mono text-xs">#{o.shortId}</td>
                <td className="px-4 py-3 text-muted-strong">
                  {new Date(o.createdAt).toLocaleDateString(dateLocale)}
                </td>
                <td className="px-4 py-3 text-muted-strong">
                  {o.items.reduce((acc, i) => acc + i.quantity, 0)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                      STATUS_TONES[o.status] ?? "border-border bg-accent-dark text-muted",
                    )}
                  >
                    {statusLabel(o.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Price value={o.total} size="md" accent={false} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/thank-you?order=${o.id}`}
                    locale={locale}
                    className="font-mono text-xs uppercase tracking-wider text-primary hover:underline"
                  >
                    {labels.view}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/thank-you?order=${o.id}`}
            locale={locale}
            className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4 transition-colors hover:border-border-strong"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm font-bold tracking-wider">
                #{o.shortId}
              </span>
              <span
                className={cn(
                  "rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                  STATUS_TONES[o.status] ?? "border-border bg-accent-dark text-muted",
                )}
              >
                {statusLabel(o.status)}
              </span>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {new Date(o.createdAt).toLocaleDateString(dateLocale)} ·{" "}
                {o.items.reduce((acc, i) => acc + i.quantity, 0)}× {labels.items}
              </div>
              <Price value={o.total} size="md" accent={false} />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
