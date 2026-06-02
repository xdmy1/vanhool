import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AutoPrint, PrintButton } from "@/components/panel/delivery/AutoPrint";
import { DownloadPDFButton } from "@/components/panel/documents/AutoPrintGeneric";
import { Logo } from "@/components/layout/Logo";
import { getDeliveryNote } from "@/lib/panel/delivery_notes/queries";
import { getCompanyAndBank } from "@/lib/panel/settings/company";

export default async function DeliveryNotePrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale, id }, sp] = await Promise.all([params, searchParams]);
  const [note, { company }] = await Promise.all([
    getDeliveryNote(id),
    getCompanyAndBank(),
  ]);
  if (!note) notFound();

  const auto = sp.auto === "1";
  const t = await getTranslations("panel");
  const dateLocale = locale === "ru" ? "ru-RU" : locale === "en" ? "en-GB" : "ro-RO";
  const today = new Date(note.issued_at).toLocaleDateString(dateLocale);
  const PAY: Record<string, string> = {
    cash: t("delivery_pay_cash"),
    transfer: t("delivery_pay_transfer"),
    already_paid: t("delivery_pay_already"),
  };

  return (
    <main className="delivery-sheet mx-auto max-w-[210mm] p-8">
      <AutoPrint noteId={id} auto={auto} />
      <div className="delivery-watermark" aria-hidden />

      <header className="mb-6 flex items-start justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <Logo className="h-12 w-auto text-black" />
          <div>
            <div className="text-xl font-bold">{company.legal_name}</div>
            <div className="text-xs">{t("delivery_company_tagline")}</div>
            <div className="text-xs text-gray-700">{company.website ?? "inter-bus.md"}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold uppercase">{t("delivery_doc_title")}</div>
          <div className="mt-1 text-sm">
            {t("delivery_number_label")}{" "}
            <span className="font-mono">{note.series}-{note.number ?? "—"}</span>
          </div>
          <div className="text-xs">{t("delivery_date_label")}: {today}</div>
        </div>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-6">
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wide">{t("delivery_client")}</div>
          <div className="text-sm font-semibold">{note.customer_name}</div>
          {note.customer_idno ? <div className="text-xs">IDNO: {note.customer_idno}</div> : null}
          {note.customer_phone ? <div className="text-xs">{t("delivery_phone")}: {note.customer_phone}</div> : null}
          <div className="mt-2 text-[10px] uppercase tracking-wide">{t("delivery_address_label")}</div>
          <div className="text-sm">{note.delivery_address}</div>
        </div>
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wide">{t("delivery_payment_label")}</div>
          <div className="text-sm font-semibold">
            {PAY[note.payment_method ?? ""] ?? note.payment_method ?? "—"}
          </div>
          {note.driver_name || note.vehicle_plate ? (
            <>
              <div className="mt-2 text-[10px] uppercase tracking-wide">{t("delivery_driver_vehicle")}</div>
              <div className="text-sm">
                {note.driver_name ?? "—"}
                {note.vehicle_plate ? ` · ${note.vehicle_plate}` : ""}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <table className="mb-4">
        <thead>
          <tr>
            <th>#</th>
            <th>{t("delivery_col_internal_code")}</th>
            <th>{t("delivery_col_product")}</th>
            <th>{t("delivery_col_location")}</th>
            <th className="num">{t("delivery_col_qty")}</th>
            <th className="num">{t("delivery_col_price")}</th>
            <th className="num">{t("delivery_col_total")}</th>
          </tr>
        </thead>
        <tbody>
          {note.items_snapshot.map((it, i) => {
            const price = Number(it.price ?? 0);
            const orig = Number(it.original_unit_price ?? 0);
            const hasDiscount = orig > 0 && orig > price;
            const pct = hasDiscount ? Math.max(0, (1 - price / orig) * 100) : 0;
            return (
              <tr key={i}>
                <td className="num">{i + 1}</td>
                <td className="font-mono">{it.partCode ?? "—"}</td>
                <td>
                  {it.name ?? "—"}
                  {hasDiscount ? (
                    <div style={{ fontSize: 10, color: "#15803d", fontWeight: 600 }}>
                      {t("delivery_discount_label", { percent: Math.round(pct) })}
                    </div>
                  ) : null}
                </td>
                <td className="font-mono">{it.storage_location ?? "—"}</td>
                <td className="num">{it.quantity ?? 0}</td>
                <td className="num">
                  {hasDiscount ? (
                    <>
                      <div style={{ fontSize: 10, color: "#6b7280", textDecoration: "line-through" }}>
                        {orig.toFixed(2)}
                      </div>
                      <div style={{ color: "#15803d", fontWeight: 600 }}>{price.toFixed(2)}</div>
                    </>
                  ) : (
                    price.toFixed(2)
                  )}
                </td>
                <td className="num">{(it.total ?? 0).toFixed(2)}</td>
              </tr>
            );
          })}
          {(() => {
            let before = 0;
            let after = 0;
            for (const it of note.items_snapshot) {
              const qty = Number(it.quantity ?? 0);
              const price = Number(it.price ?? 0);
              const orig = Number(it.original_unit_price ?? 0);
              const list = orig > 0 ? orig : price;
              before += qty * list;
              after += qty * price;
            }
            const discountAmount = Number((before - after).toFixed(2));
            const discountPct =
              before > 0 && discountAmount > 0
                ? Math.min(100, Number(((discountAmount / before) * 100).toFixed(2)))
                : 0;
            if (discountAmount <= 0) return null;
            return (
              <>
                <tr>
                  <td colSpan={6} className="num" style={{ color: "#6b7280" }}>
                    {t("delivery_subtotal_before_discount")}
                  </td>
                  <td className="num" style={{ color: "#6b7280", textDecoration: "line-through" }}>
                    {before.toFixed(2)} {note.currency}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="num" style={{ color: "#15803d", fontWeight: 600 }}>
                    {t("delivery_discount_label", { percent: Math.round(discountPct) })}
                  </td>
                  <td className="num" style={{ color: "#15803d", fontWeight: 600 }}>
                    -{discountAmount.toFixed(2)} {note.currency}
                  </td>
                </tr>
              </>
            );
          })()}
          <tr>
            <td colSpan={6} className="num" style={{ fontWeight: 600 }}>
              {t("delivery_total_label")}
            </td>
            <td className="num" style={{ fontWeight: 700, fontSize: 14 }}>
              {note.total.toFixed(2)} {note.currency}
            </td>
          </tr>
        </tbody>
      </table>

      {note.notes ? (
        <section className="mb-6 border border-black p-3 text-xs">
          <div className="mb-1 font-semibold uppercase tracking-wide">{t("delivery_notes_label")}</div>
          <div className="whitespace-pre-wrap">{note.notes}</div>
        </section>
      ) : null}

      <section className="mt-8 grid grid-cols-2 gap-12">
        <div>
          <div className="border-b border-black pb-10 text-center text-xs">&nbsp;</div>
          <div className="mt-1 text-center text-[10px] uppercase tracking-wide">
            {t("delivery_signature_warehouse")}
          </div>
        </div>
        <div>
          <div className="border-b border-black pb-10 text-center text-xs">&nbsp;</div>
          <div className="mt-1 text-center text-[10px] uppercase tracking-wide">
            {t("delivery_signature_client")}
          </div>
        </div>
      </section>

      {(() => {
        const terms = t.raw("invoice_print_terms") as string[] | undefined;
        if (!Array.isArray(terms) || terms.length === 0) return null;
        return (
          <section
            className="mt-4 break-inside-avoid border-t border-gray-300 pt-2 text-[7.5px] leading-[1.25] text-gray-700"
            style={{ pageBreakInside: "avoid" }}
          >
            <div className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-black">
              {t("invoice_print_terms_title")}
            </div>
            <ol
              className="grid list-decimal grid-cols-2 gap-x-3 gap-y-0.5 pl-3 marker:font-semibold marker:text-gray-600"
              style={{ columnGap: "12px" }}
            >
              {terms.map((term, i) => (
                <li key={i} className="break-inside-avoid">
                  {term}
                </li>
              ))}
            </ol>
          </section>
        );
      })()}

      <footer className="no-print mt-10 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <PrintButton />
          <DownloadPDFButton
            filename={`Fisa-livrare-${note.series ?? ""}${note.number ?? id.slice(0, 8)}`}
            label={t("action_download_pdf")}
          />
        </div>
        <p className="text-xs text-gray-500">{t("delivery_print_hint")}</p>
      </footer>
    </main>
  );
}
