import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { ClientsTable } from "@/components/panel/ClientsTable";
import { listPanelClients } from "@/lib/panel/clienti/queries";
import { getActiveBook } from "@/lib/panel/scope";

export default async function PanelClientiPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, sp, t] = await Promise.all([
    params,
    searchParams,
    getTranslations("panel"),
  ]);
  setRequestLocale(locale);

  const scope = await getActiveBook(sp);
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const onlyWithTx = sp.with_tx === "1";
  const page = sp.page ? Math.max(1, parseInt(String(sp.page), 10)) : 1;

  const { rows, total, pageSize } = await listPanelClients({
    q,
    scope,
    onlyWithTransactions: onlyWithTx,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const bookLabel = scope === "conta1" ? t("conta1") : t("conta2");

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <AdminPageHeader
        eyebrow={scope === "conta1" ? t("conta1_eyebrow") : t("conta2_eyebrow")}
        title={t("clienti_title")}
        subtitle={t("clienti_subtitle")}
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <SearchInput placeholder={t("clienti_search_placeholder")} className="w-full max-w-md" />
        <a
          href={`?${new URLSearchParams({
            ...Object.fromEntries(
              Object.entries(sp).filter(([k]) => k !== "with_tx" && k !== "page"),
            ),
            ...(onlyWithTx ? {} : { with_tx: "1" }),
          } as Record<string, string>).toString()}`}
          className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm transition-colors ${
            onlyWithTx
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-surface hover:border-primary/40 hover:text-primary"
          }`}
        >
          {t("clienti_only_with_tx", { book: bookLabel })}
        </a>
      </div>

      <div className="mt-6">
        <ClientsTable
          rows={rows}
          locale={locale}
          emptyLabel={q ? t("clienti_empty_no_results") : t("clienti_empty_no_clients")}
        />
        <AdminPagination
          page={page}
          totalPages={totalPages}
          basePath="/panel/clienti"
          searchParams={sp}
          locale={locale}
        />
      </div>
    </div>
  );
}
