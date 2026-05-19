import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/layout/Logo";
import {
  AutoPrintGeneric,
  DownloadPDFButton,
  PrintButton,
} from "@/components/panel/documents/AutoPrintGeneric";
import { getPurchase } from "@/lib/panel/purchases/queries";
import { getCompanyAndBank } from "@/lib/panel/settings/company";
import { createClient } from "@/lib/supabase/server";

export default async function POPrintPage({
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
  const purchase = await getPurchase(id);
  if (!purchase) notFound();
  const auto = sp.auto === "1";
  const { company, banks } = await getCompanyAndBank();

  // Fetch supplier full info (we only have name in the purchase detail).
  const supabase = await createClient();
  const { data: supplier } = await supabase
    .from("suppliers")
    .select("name, idno, address, contact_phone, contact_email")
    .eq("id", purchase.supplier_id)
    .maybeSingle();

  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const docDate = purchase.po_issued_at
    ? new Date(purchase.po_issued_at).toLocaleDateString(dateLocale)
    : new Date(purchase.document_date).toLocaleDateString(dateLocale);
  const expected = purchase.expected_delivery_date
    ? new Date(purchase.expected_delivery_date).toLocaleDateString(dateLocale)
    : null;

  return (
    <main className="doc-sheet mx-auto max-w-[210mm] p-8">
      <AutoPrintGeneric
        auto={auto}
        autoDownload={sp.download === "1"}
        filename={`PO-${purchase.po_number ?? id.slice(0, 8)}`}
      />
      <div className="doc-watermark" aria-hidden />

      <header className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Logo className="h-12 w-auto text-black" />
          <div className="text-[11px] leading-tight">
            <div className="text-xl font-bold">{company.name}</div>
            <div className="text-xs text-gray-700">{company.legal_name}</div>
            <div className="mt-1">{company.address}</div>
            <div className="mt-1">Tel: {company.phone}</div>
            <div>Email: {company.email}</div>
            {company.website ? <div>Web: {company.website}</div> : null}
            <div className="mt-1">
              IDNO: <span className="font-mono">{company.idno}</span>
            </div>
            {company.vat_registration_number ? (
              <div>
                TVA: <span className="font-mono">{company.vat_registration_number}</span>
              </div>
            ) : null}
            {banks.length > 0 ? (
              <div className="mt-2 border-t border-gray-300 pt-1">
                {banks.map((b) => (
                  <div key={b.currency} className="font-mono">
                    {b.currency}: {b.iban}
                  </div>
                ))}
                <div className="font-mono">SWIFT: {banks[0]?.swift ?? ""}</div>
                <div>{banks[0]?.bank_name ?? ""}</div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="text-[10px] uppercase tracking-wide text-gray-500">
            {t("po_print_supplier_block")}
          </div>
          <div className="mt-1 font-semibold">{supplier?.name ?? purchase.supplier_name}</div>
          {supplier?.address ? <div>{supplier.address}</div> : null}
          {supplier?.idno ? (
            <div className="mt-1">
              IDNO/VAT: <span className="font-mono">{supplier.idno}</span>
            </div>
          ) : null}
          {supplier?.contact_phone ? <div>Tel: {supplier.contact_phone}</div> : null}
          {supplier?.contact_email ? <div>Email: {supplier.contact_email}</div> : null}
        </div>
      </header>

      <div className="mb-4 text-sm">{docDate}</div>

      <div className="mb-4 flex items-center justify-between border-y border-black py-3">
        <div className="text-2xl font-bold uppercase tracking-tight">{t("po_title")}</div>
        <div className="font-mono text-2xl font-bold">{purchase.po_number ?? "—"}</div>
        <div className="text-xs text-gray-600">please mention in all correspondence</div>
      </div>

      <table className="items mb-6">
        <thead>
          <tr>
            <th>{t("po_print_col_part")}</th>
            <th>{t("po_print_col_description")}</th>
            <th className="num" style={{ width: "70px" }}>{t("po_print_col_qty")}</th>
            <th className="num" style={{ width: "100px" }}>{t("po_print_col_unit_price")}</th>
            <th className="num" style={{ width: "100px" }}>{t("po_print_col_total")}</th>
          </tr>
        </thead>
        <tbody>
          {purchase.items.map((it) => (
            <tr key={it.id}>
              <td className="font-mono text-xs">{it.supplier_code ?? "—"}</td>
              <td>
                {it.description}
                {it.internal_code ? (
                  <div className="text-[10px] text-gray-600">
                    Internal: <span className="font-mono">{it.internal_code}</span>
                  </div>
                ) : null}
              </td>
              <td className="num">{it.quantity}</td>
              <td className="num">{it.unit_cost.toFixed(2)}</td>
              <td className="num">{it.line_total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-6 grid grid-cols-2 gap-3 border-t border-black pt-3 text-xs">
        <div>
          <div className="font-semibold uppercase tracking-wide">
            {t("po_print_please_notify")}
          </div>
          {expected ? (
            <div className="mt-2">
              {t("po_expected_delivery")}: <span className="font-semibold">{expected}</span>
            </div>
          ) : null}
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wide text-gray-500">
            {t("po_print_total_value")}
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {purchase.total.toFixed(2)} {purchase.currency}
          </div>
        </div>
      </section>

      <section className="mt-6 border border-black px-3 py-2 text-xs">
        <div className="text-[10px] uppercase tracking-wide text-gray-500">
          {t("po_print_billing_address")}
        </div>
        <div className="mt-1">{company.address}</div>
      </section>

      <section className="mt-3 border-t border-black pt-2 text-xs">
        <div className="text-[10px] uppercase tracking-wide text-gray-500">
          {t("po_print_orderer")}
        </div>
        <div className="mt-1 font-semibold">{company.legal_name}</div>
        {company.administrator ? (
          <div className="text-[10px] text-gray-700">{company.administrator}</div>
        ) : null}
      </section>

      <footer className="no-print mt-10 flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-3">
          <PrintButton label={t("po_action_print")} />
          <DownloadPDFButton
            filename={`PO-${purchase.po_number ?? id.slice(0, 8)}`}
            label={t("action_download_pdf")}
          />
        </div>
        <p className="max-w-md text-center text-xs text-gray-500">{t("pdf_save_hint")}</p>
      </footer>
    </main>
  );
}
