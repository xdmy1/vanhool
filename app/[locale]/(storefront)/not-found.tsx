import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { PlaceholderPage } from "@/components/common/PlaceholderPage";

export default async function NotFound() {
  const locale = await getLocale();
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <PlaceholderPage
      eyebrow="404"
      title="Pagina nu a fost gasita"
      description="Linkul accesat nu exista sau a fost mutat."
      locale={locale}
      homeLabel={t("home")}
    />
  );
}
