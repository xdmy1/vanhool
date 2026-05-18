import { getTranslations, setRequestLocale } from "next-intl/server";

import { SettingsEditor } from "@/components/panel/SettingsEditor";
import { getPanelSettings } from "@/lib/panel/settings/actions";

export default async function PanelSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, t] = await Promise.all([
    getPanelSettings(),
    getTranslations("panel"),
  ]);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <header className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("settings_title")}</h1>
        <p className="text-sm text-muted-strong md:text-base">{t("settings_subtitle")}</p>
      </header>

      <SettingsEditor initial={settings} />
    </div>
  );
}
