import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReportControls } from "@/components/panel/reports/ReportControls";

export default async function PanelExportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, t] = await Promise.all([params, getTranslations("panel")]);
  setRequestLocale(locale);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={t("conta1_eyebrow")}
        title={t("export_title")}
        subtitle={t("export_subtitle")}
      />

      <div className="mt-8 space-y-6">
        <ReportControls kind="invoices" label={t("export_kind_invoices")} showScope={false} />
        <div className="rounded-md border border-dashed border-border bg-surface p-6 text-sm">
          <p className="font-medium">{t("export_notes_title")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-strong">
            <li>{t("export_note_scope")}</li>
            <li>{t("export_note_zip")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
