/**
 * Bulk export of invoices or proformas for a calendar range, emailed to
 * the bookkeeper. Mirrors the single-document accountant template so the
 * bookkeeper sees the same layout per row (with discount strikethrough
 * + per-line saving) and a per-currency totals strip at the bottom.
 */

import type {
  CustomerSnapshot,
  InvoiceDetail,
  InvoiceItemSnapshot,
} from "@/lib/panel/invoices/queries";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtMoney(v: number, currency: string): string {
  const x = Number.isFinite(v) ? v : 0;
  const sym = currency === "EUR" ? "€" : currency === "USD" ? "$" : "";
  const formatted = x.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return sym ? `${sym}${formatted}` : `${formatted} ${currency}`;
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
}

function fmtRange(from: string, to: string): string {
  return `${fmtDate(from)} → ${fmtDate(to)}`;
}

export function accountantMonthlyDocumentsEmail(args: {
  type: "invoice" | "proforma";
  from: string;
  to: string;
  count: number;
  totalsByCurrency: Array<{ currency: string; total: number; vat_amount: number }>;
  documents: InvoiceDetail[];
}): { subject: string; html: string; text: string } {
  const { type, from, to, count, totalsByCurrency, documents } = args;
  const isProforma = type === "proforma";
  const headTitle = isProforma ? "Raport proforme lunare" : "Raport facturi lunare";
  const requestLine = isProforma
    ? "Vă rugăm să luați în evidență proformele de mai jos."
    : "Solicitare e-factură — vă rugăm să procesați emiterea facturilor fiscale electronice pentru documentele de mai jos.";
  const rangeStr = fmtRange(from, to);

  const docsHtml = documents
    .map((d, idx) => {
      const customer = d.customer_snapshot as CustomerSnapshot;
      const items = d.items_snapshot as InvoiceItemSnapshot[];
      const number = `${d.series ?? ""}${d.number ?? ""}`;

      // Revised per bookkeeper feedback: split per-line totals into
      // Net + TVA + Gross columns and surface the unit of measure
      // (buc / litri / metru) when the sale was tagged with one.
      // Older invoice rows that don't have items_snapshot.unit fall
      // back to "buc".
      const vatRate =
        Number(d.subtotal) > 0 ? Number(d.vat_amount) / Number(d.subtotal) : 0;
      const rowsHtml = items
        .map((it) => {
          const qty = Number(it.quantity ?? 0);
          const list = Number(it.unit_price ?? 0);
          const dp =
            it.discounted_unit_price != null ? Number(it.discounted_unit_price) : null;
          const hasDiscount = dp != null && dp >= 0 && dp < list;
          const eff = hasDiscount ? (dp as number) : list;
          const linePct = hasDiscount && list > 0
            ? Math.round((1 - eff / list) * 100)
            : 0;
          const lineNet = Number((it.total ?? qty * eff).toFixed(2));
          const lineVat = Number((lineNet * vatRate).toFixed(2));
          const lineGross = Number((lineNet + lineVat).toFixed(2));
          const priceCell = hasDiscount
            ? `<div style="font-size:10px;color:#6b6358;text-decoration:line-through">${fmtMoney(list, d.currency)}</div>
               <div style="color:#15803d;font-weight:600">${fmtMoney(eff, d.currency)}</div>
               <div style="font-size:10px;color:#15803d;font-weight:600">-${linePct}%</div>`
            : fmtMoney(eff, d.currency);
          const unit = ((it as { unit?: string }).unit ?? "buc").toString();
          return `<tr style="border-bottom:1px solid #eee5d2">
            <td style="padding:4px 8px;font-size:11px;color:#2a2622;vertical-align:top">
              ${it.partCode ? `<div style="font-family:ui-monospace,monospace;font-size:10px;color:#6b6358">${escapeHtml(String(it.partCode))}</div>` : ""}
              <div>${escapeHtml(String(it.name ?? "—"))}</div>
            </td>
            <td style="padding:4px 8px;font-size:11px;text-align:right;color:#2a2622;vertical-align:top;white-space:nowrap">${qty} ${escapeHtml(unit)}</td>
            <td style="padding:4px 8px;font-size:11px;text-align:right;color:#2a2622;vertical-align:top">${priceCell}</td>
            <td style="padding:4px 8px;font-size:11px;text-align:right;color:#2a2622;vertical-align:top">${fmtMoney(lineNet, d.currency)}</td>
            <td style="padding:4px 8px;font-size:11px;text-align:right;color:#2a2622;vertical-align:top">${fmtMoney(lineVat, d.currency)}</td>
            <td style="padding:4px 8px;font-size:11px;text-align:right;color:#2a2622;font-weight:600;vertical-align:top">${fmtMoney(lineGross, d.currency)}</td>
          </tr>`;
        })
        .join("");

      const scopeChip = d.account_scope === "conta1" ? "" : "";

      return `<div style="margin-bottom:16px;border:1px solid #d8d2c5;border-radius:6px;overflow:hidden">
        <div style="padding:10px 14px;background:#f4f1ea;border-bottom:1px solid #d8d2c5">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">
            <span>#${idx + 1} · ${fmtDate(d.issued_date)}${scopeChip}</span>
            <span style="font-weight:600">${escapeHtml(d.status)}</span>
          </div>
          <div style="margin-top:4px;font-size:14px;font-weight:600;color:#2a2622">${escapeHtml(number)} · ${escapeHtml(customer?.name ?? "—")}</div>
          ${customer?.idno ? `<div style="margin-top:2px;font-size:11px;color:#6b6358">IDNO ${escapeHtml(customer.idno)}</div>` : ""}
        </div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
          <thead>
            <tr style="background:#fafaf6">
              <th align="left" style="padding:5px 8px;font-size:9px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Produs</th>
              <th align="right" style="padding:5px 8px;font-size:9px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Cant. + U.M.</th>
              <th align="right" style="padding:5px 8px;font-size:9px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Preț unit. net</th>
              <th align="right" style="padding:5px 8px;font-size:9px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Preț net</th>
              <th align="right" style="padding:5px 8px;font-size:9px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">TVA</th>
              <th align="right" style="padding:5px 8px;font-size:9px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Total cu TVA</th>
            </tr>
          </thead>
          <tbody>${rowsHtml || `<tr><td colspan="6" style="padding:8px;text-align:center;color:#6b6358;font-size:11px">— fără linii —</td></tr>`}</tbody>
        </table>
        <div style="padding:6px 14px;background:#fafaf6;border-top:1px solid #d8d2c5;font-size:11px;color:#2a2622">
          <div style="display:flex;justify-content:space-between;color:#6b6358"><span>Subtotal net</span><span style="color:#2a2622">${fmtMoney(d.subtotal, d.currency)}</span></div>
          <div style="display:flex;justify-content:space-between;color:#6b6358"><span>TVA</span><span style="color:#2a2622">${fmtMoney(d.vat_amount, d.currency)}</span></div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid #d8d2c5;margin-top:4px;padding-top:4px;font-weight:700"><span style="text-transform:uppercase">Total cu TVA</span><span>${fmtMoney(d.total, d.currency)}</span></div>
        </div>
      </div>`;
    })
    .join("");

  // Net + TVA + Gross per currency (revised request — bookkeeper
  // wants all three figures so they can match line by line in the
  // books without back-computing VAT).
  const totalsHtml = totalsByCurrency
    .map((t) => {
      const net = Number((t.total - t.vat_amount).toFixed(2));
      return `<tr>
      <td style="padding:6px 12px;font-size:12px;color:#6b6358">${t.currency}</td>
      <td style="padding:6px 12px;font-size:12px;text-align:right;color:#2a2622">Net: ${fmtMoney(net, t.currency)}</td>
      <td style="padding:6px 12px;font-size:12px;text-align:right;color:#2a2622">TVA: ${fmtMoney(t.vat_amount, t.currency)}</td>
      <td style="padding:6px 12px;font-size:14px;text-align:right;font-weight:700;color:#2a2622">${fmtMoney(t.total, t.currency)}</td>
    </tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="ro">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ece9e2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#2a2622">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="720" style="max-width:720px;background:#ffffff;border-radius:8px;overflow:hidden">
        <tr><td style="padding:20px 24px;background:#f4f1ea;border-bottom:1px solid #d8d2c5">
          <div style="font-size:11px;color:#c0392b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">${escapeHtml(headTitle)}</div>
          <div style="font-size:22px;font-weight:700;color:#2a2622;margin-top:4px">${escapeHtml(rangeStr)}</div>
          <div style="font-size:12px;color:#6b6358;margin-top:2px">${count} document${count === 1 ? "" : "e"}</div>
        </td></tr>

        <tr><td style="padding:16px 24px;background:#fffbe6;border-bottom:1px solid #f3e8aa">
          <div style="font-size:13px;color:#5a4906;line-height:1.5">${escapeHtml(requestLine)}</div>
        </td></tr>

        <tr><td style="padding:20px 24px">
          ${docsHtml || `<div style="padding:24px;text-align:center;color:#6b6358;font-size:13px">— niciun document în perioadă —</div>`}
        </td></tr>

        ${
          totalsByCurrency.length > 0
            ? `<tr><td style="padding:0 24px 20px" align="right">
                <table cellpadding="0" cellspacing="0" border="0" style="min-width:320px;border-top:2px solid #2a2622">
                  <thead><tr><th colspan="4" style="padding:8px 12px;font-size:11px;text-align:left;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Total general — net · TVA · cu TVA (pe valută)</th></tr></thead>
                  <tbody>${totalsHtml}</tbody>
                </table>
              </td></tr>`
            : ""
        }

        <tr><td style="padding:14px 24px;background:#f4f1ea;border-top:1px solid #d8d2c5;font-size:11px;color:#6b6358;line-height:1.5">
          Inter Bus Parts S.R.L. · Generat automat din panel.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `${headTitle} — ${rangeStr}\n${count} document(e)\n\n${documents
    .map((d, i) => {
      const customer = d.customer_snapshot as CustomerSnapshot;
      const number = `${d.series ?? ""}${d.number ?? ""}`;
      return `[${i + 1}] ${fmtDate(d.issued_date)} · ${number} · ${customer?.name ?? "—"} · ${d.total.toFixed(2)} ${d.currency}`;
    })
    .join("\n")}`;

  const subject = `${headTitle} · ${rangeStr} · ${count} document(e)`;
  return { subject, html, text };
}
