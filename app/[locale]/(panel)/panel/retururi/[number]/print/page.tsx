import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  AutoPrintGeneric,
  DownloadPDFButton,
  PrintButton,
} from "@/components/panel/documents/AutoPrintGeneric";
import { DocumentHeader } from "@/components/panel/documents/DocumentHeader";
import { getReturnInvoice } from "@/lib/panel/returns/queries";
import { getCompanyAndBank } from "@/lib/panel/settings/company";
import { TIMEZONE } from "@/lib/datetime";

function fmtMoney(v: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : "";
  const formatted = v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return symbol ? `${symbol}${formatted}` : `${formatted} ${currency}`;
}

export default async function ReturnPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; number: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale, number }, sp] = await Promise.all([params, searchParams]);
  const ret = await getReturnInvoice(Number(number));
  if (!ret) notFound();
  const t = await getTranslations({ locale, namespace: "panel" });
  const { company } = await getCompanyAndBank();
  const filename = `Retur-${ret.label}`;
  const fmtDay = (iso: string | null) =>
    iso
      ? new Intl.DateTimeFormat("ro-RO", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: TIMEZONE,
        }).format(new Date(iso))
      : "—";
  const isPurchase = ret.kind === "purchase";
  const cur = ret.currency;

  return (
    <>
      <AutoPrintGeneric auto={sp.auto === "1"} autoDownload={sp.download === "1"} filename={filename} />
      <main className="doc-sheet mx-auto max-w-[210mm] p-8">
        <div className="doc-watermark" aria-hidden />

        <DocumentHeader
          documentType="invoice"
          documentTitle="Factură de retur"
          documentNumberLabel="Nr."
          documentNumber={ret.label}
          issuedDate={`Data returului: ${fmtDay(ret.date)}`}
          company={company}
        />

        <section className="mb-6 grid grid-cols-2 gap-3">
          <div className="doc-box">
            <div className="mb-2 text-sm font-bold text-black">
              {isPurchase ? "Returnează (cumpărător)" : "Primește returul (vânzător)"}
            </div>
            <div className="font-semibold">{company.legal_name}</div>
            <div className="mt-1 text-xs">{company.address}</div>
            <div className="mt-1 text-xs">
              IDNO: <span className="font-mono">{company.idno}</span>
            </div>
            {company.vat_registration_number ? (
              <div className="text-xs">
                Cod TVA: <span className="font-mono">{company.vat_registration_number}</span>
              </div>
            ) : null}
          </div>
          <div className="doc-box">
            <div className="mb-2 text-sm font-bold text-black">
              {isPurchase ? "Furnizor" : "Client (returnează)"}
            </div>
            <div className="font-semibold">{ret.party.name}</div>
            {ret.party.address ? <div className="text-xs">{ret.party.address}</div> : null}
            {ret.party.idno ? (
              <div className="mt-1 text-xs">
                IDNO: <span className="font-mono">{ret.party.idno}</span>
              </div>
            ) : null}
            {ret.party.vat_code ? (
              <div className="text-xs">
                Cod TVA: <span className="font-mono">{ret.party.vat_code}</span>
              </div>
            ) : null}
          </div>
        </section>

        <div className="mb-3 text-xs text-gray-700">
          Retur la {isPurchase ? "achiziția" : "factura"}{" "}
          <span className="font-mono">{ret.parent_label}</span>
          {ret.parent_date ? ` din ${fmtDay(ret.parent_date)}` : ""}
        </div>

        <table className="items mb-4">
          <thead>
            <tr>
              <th style={{ width: "32px" }}>#</th>
              <th>Produs</th>
              <th className="num" style={{ width: "60px" }}>Cota TVA</th>
              <th className="num" style={{ width: "60px" }}>Cant.</th>
              <th className="num" style={{ width: "90px" }}>Preț unit. cu TVA</th>
              <th className="num" style={{ width: "90px" }}>Net</th>
              <th className="num" style={{ width: "70px" }}>TVA</th>
              <th className="num" style={{ width: "100px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {ret.lines.map((l, i) => (
              <tr key={l.id}>
                <td className="num">{i + 1}.</td>
                <td>
                  <div className="font-medium">
                    {l.part_code ? <span className="font-mono">{l.part_code} </span> : null}
                    {l.name ?? "—"}
                  </div>
                  {l.reason ? <div className="text-[11px] text-gray-600">{l.reason}</div> : null}
                </td>
                <td className="num">{Number(l.vat_rate)}%</td>
                <td className="num">−{Number(l.quantity)}</td>
                <td className="num">{fmtMoney(Number(l.unit_amount), cur)}</td>
                <td className="num">−{fmtMoney(Number(l.net_amount), cur)}</td>
                <td className="num">−{fmtMoney(Number(l.vat_amount), cur)}</td>
                <td className="num font-semibold">−{fmtMoney(Number(l.total), cur)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="flex justify-end text-sm">
          <div className="w-full max-w-[280px]">
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span className="text-gray-600">Retur net</span>
              <span className="font-medium">−{fmtMoney(ret.net, cur)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span className="text-gray-600">TVA</span>
              <span className="font-medium">−{fmtMoney(ret.vat, cur)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-b-2 border-black py-1 text-base font-bold">
              <span>Total retur ({cur})</span>
              <span>−{fmtMoney(ret.total, cur)}</span>
            </div>
          </div>
        </section>

        <section className="mt-16 grid grid-cols-2 gap-10 text-xs text-gray-700">
          <div className="border-t border-gray-400 pt-1">Predat (nume, semnătură)</div>
          <div className="border-t border-gray-400 pt-1">Primit (nume, semnătură)</div>
        </section>
      </main>
      <footer className="no-print mt-6 flex flex-col items-center gap-2 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <PrintButton label={t("action_print")} />
          <DownloadPDFButton filename={filename} label={t("action_download_pdf")} />
        </div>
        <p className="max-w-md text-center text-xs text-gray-500">{t("pdf_save_hint")}</p>
      </footer>
    </>
  );
}
