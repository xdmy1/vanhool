"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  downloadReportCsv,
  type ReportKind,
} from "@/lib/panel/reports/actions";

type Props = {
  kind: ReportKind;
  defaultFrom?: string;
  defaultTo?: string;
  defaultScope?: "all" | "conta1" | "conta2";
  showScope?: boolean;
  label?: string;
};

export function ReportControls({
  kind,
  defaultFrom,
  defaultTo,
  defaultScope = "all",
  showScope = true,
  label,
}: Props) {
  const t = useTranslations("panel");
  // eslint-disable-next-line react-hooks/purity
  const today = new Date().toISOString().slice(0, 10);
  // eslint-disable-next-line react-hooks/purity
  const thirtyAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);

  const [from, setFrom] = useState(defaultFrom ?? thirtyAgo);
  const [to, setTo] = useState(defaultTo ?? today);
  const [scope, setScope] = useState<"all" | "conta1" | "conta2">(defaultScope);
  const [pending, startTransition] = useTransition();

  const kindLabel = label ?? t(`reports_kind_${kind}` as "reports_kind_sales_by_day");

  function go() {
    startTransition(async () => {
      const res = await downloadReportCsv({
        kind,
        from,
        to,
        scope: scope === "all" ? undefined : scope,
      });
      if (!res.ok) {
        toast.error(t("reports_download_error", { reason: res.reason }));
        return;
      }
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(t("reports_downloaded"));
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface p-4">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
          {t("reports_controls_report")}
        </label>
        <div className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm">
          {kindLabel}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
          {t("reports_controls_from")}
        </label>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
          {t("reports_controls_to")}
        </label>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {showScope && kind !== "invoices" ? (
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-muted">
            {t("reports_controls_book")}
          </label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as "all" | "conta1" | "conta2")}
            className="flex h-10 rounded-md border border-border bg-surface px-3 text-sm"
          >
            <option value="all">{t("reports_controls_book_all")}</option>
            <option value="conta1">{t("conta1")}</option>
            <option value="conta2">{t("conta2")}</option>
          </select>
        </div>
      ) : null}
      <Button onClick={go} disabled={pending} className="gap-1.5">
        <Download className="size-4" />
        {pending ? t("action_generating") : t("action_download_csv")}
      </Button>
    </div>
  );
}
