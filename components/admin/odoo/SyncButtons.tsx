"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, Loader2, RefreshCcw, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  adminGenerateInvoice,
  adminPullProducts,
  adminRefreshStock,
  adminRetryOrderPush,
} from "@/lib/admin/odoo/actions";
import { cn } from "@/lib/utils/cn";

type Labels = {
  pull_products: string;
  refresh_stock: string;
  retry_push: string;
  generate_invoice: string;
  pulling: string;
  refreshing: string;
  retrying: string;
  generating: string;
  not_configured: string;
  done: string;
};

export function PullProductsButton({ enabled, labels }: { enabled: boolean; labels: Labels }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="md"
      variant="primary"
      className=""
      disabled={!enabled || pending}
      onClick={() =>
        start(async () => {
          const res = await adminPullProducts();
          if (!res.ok) {
            toast.error(
              res.code === "not_configured" ? labels.not_configured : (res.message ?? "error"),
            );
            return;
          }
          const p = res.payload as { fetched: number; upserted: number };
          toast.success(`${labels.done}: ${p.upserted}/${p.fetched}`);
          router.refresh();
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {pending ? labels.pulling : labels.pull_products}
    </Button>
  );
}

export function RefreshStockButton({ enabled, labels }: { enabled: boolean; labels: Labels }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="md"
      variant="secondary"
      className=""
      disabled={!enabled || pending}
      onClick={() =>
        start(async () => {
          const res = await adminRefreshStock();
          if (!res.ok) {
            toast.error(
              res.code === "not_configured" ? labels.not_configured : (res.message ?? "error"),
            );
            return;
          }
          const p = res.payload as { updated: number };
          toast.success(`${labels.done}: ${p.updated}`);
          router.refresh();
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
      {pending ? labels.refreshing : labels.refresh_stock}
    </Button>
  );
}

export function RetryPushButton({
  orderId,
  labels,
  className,
}: {
  orderId: string;
  labels: Labels;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-muted-strong transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
        pending && "opacity-60",
        className,
      )}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await adminRetryOrderPush(orderId);
          if (!res.ok) {
            toast.error(res.message ?? "error");
            return;
          }
          toast.success(labels.done);
          router.refresh();
        })
      }
    >
      {pending ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
      {pending ? labels.retrying : labels.retry_push}
    </button>
  );
}

export function GenerateInvoiceButton({
  orderId,
  labels,
}: {
  orderId: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      className=""
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await adminGenerateInvoice(orderId);
          if (!res.ok) {
            toast.error(res.message ?? "error");
            return;
          }
          const p = res.payload as { invoiceId: number; pdfUrl: string };
          toast.success(`${labels.done} #${p.invoiceId}`);
          window.open(p.pdfUrl, "_blank", "noopener");
          router.refresh();
        })
      }
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
      {pending ? labels.generating : labels.generate_invoice}
    </Button>
  );
}
