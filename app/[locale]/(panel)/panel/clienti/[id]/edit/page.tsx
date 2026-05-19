import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ClientForm } from "@/components/panel/clienti/ClientForm";
import { getPanelClient } from "@/lib/panel/clienti/queries";
import { getActiveBook } from "@/lib/panel/scope";

export default async function PanelClientEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale, id }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  const scope = await getActiveBook(sp);
  const client = await getPanelClient(id, scope);
  if (!client) notFound();

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        back={{
          href: `/panel/clienti/${id}`,
          label: t("clienti_detail_back"),
          locale,
        }}
        title={t("client_edit_title")}
        subtitle={
          client.company_name ?? client.full_name ?? client.email ?? id
        }
      />
      <div className="mt-8">
        <ClientForm locale={locale} initial={client} />
      </div>
    </div>
  );
}
