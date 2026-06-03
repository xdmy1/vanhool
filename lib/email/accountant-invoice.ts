/**
 * Email forwarded to the bookkeeper when the operator clicks "Trimite
 * contabilului" on a /panel/facturi or /panel/proforme detail page.
 *
 * Keeps it intentionally dense: a header strip with the document number
 * and date, the customer block, an itemised table with per-line discount,
 * and a totals stack reflecting Subtotal · Discount · VAT · Total. The
 * accountant copies values straight from the email into their book — no
 * round trip to the panel needed.
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

export function accountantInvoiceEmail(invoice: InvoiceDetail): {
  subject: string;
  html: string;
  text: string;
} {
  const isProforma = invoice.type === "proforma";
  const docLabel = isProforma ? "Proformă" : "Factură";
  const requestLabel = "Solicitare e-factură";
  const number = `${invoice.series ?? ""}${invoice.number ?? "—"}`;
  const customer = invoice.customer_snapshot as CustomerSnapshot;
  const items = invoice.items_snapshot as InvoiceItemSnapshot[];

  // Pre-discount gross — sum of qty × list price across items.
  let beforeDiscount = 0;
  let afterDiscount = 0;
  for (const it of items) {
    const qty = Number(it.quantity ?? 0);
    const list = Number(it.unit_price ?? 0);
    const dp =
      it.discounted_unit_price != null ? Number(it.discounted_unit_price) : null;
    const eff = dp != null && dp >= 0 && dp < list ? dp : list;
    beforeDiscount += qty * list;
    afterDiscount += qty * eff;
  }
  const discountAmount = Number((beforeDiscount - afterDiscount).toFixed(2));
  const discountPct =
    beforeDiscount > 0 && discountAmount > 0
      ? Math.round((discountAmount / beforeDiscount) * 100)
      : 0;

  const ROW_BORDER = "border-bottom:1px solid #e5e1d8";
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
      const priceCell = hasDiscount
        ? `<div style="font-size:11px;color:#6b6358;text-decoration:line-through">${fmtMoney(list, invoice.currency)}</div>
           <div style="color:#15803d;font-weight:600">${fmtMoney(eff, invoice.currency)}</div>
           <div style="font-size:11px;color:#15803d;font-weight:600">-${linePct}%</div>`
        : fmtMoney(eff, invoice.currency);
      return `<tr style="${ROW_BORDER}">
        <td style="padding:6px 8px;font-size:13px;color:#2a2622">
          ${it.partCode ? `<div style="font-family:ui-monospace,monospace;font-size:11px;color:#6b6358">${escapeHtml(String(it.partCode))}</div>` : ""}
          <div>${escapeHtml(String(it.name ?? "—"))}</div>
        </td>
        <td style="padding:6px 8px;font-size:13px;text-align:right;color:#2a2622">${qty}</td>
        <td style="padding:6px 8px;font-size:13px;text-align:right;color:#2a2622">${priceCell}</td>
        <td style="padding:6px 8px;font-size:13px;text-align:right;font-weight:600;color:#2a2622">${fmtMoney(Number(it.total ?? qty * eff), invoice.currency)}</td>
      </tr>`;
    })
    .join("");

  const totalsRows: string[] = [];
  if (discountAmount > 0) {
    totalsRows.push(
      `<tr><td style="padding:4px 8px;font-size:12px;text-align:right;color:#6b6358">Subtotal fără reducere</td><td style="padding:4px 8px;font-size:12px;text-align:right;color:#6b6358;text-decoration:line-through">${fmtMoney(beforeDiscount, invoice.currency)}</td></tr>`,
    );
    totalsRows.push(
      `<tr><td style="padding:4px 8px;font-size:12px;text-align:right;color:#15803d">Reducere (-${discountPct}%)</td><td style="padding:4px 8px;font-size:12px;text-align:right;color:#15803d;font-weight:600">-${fmtMoney(discountAmount, invoice.currency)}</td></tr>`,
    );
  }
  totalsRows.push(
    `<tr><td style="padding:4px 8px;font-size:13px;text-align:right;color:#6b6358">Subtotal</td><td style="padding:4px 8px;font-size:13px;text-align:right;color:#2a2622">${fmtMoney(invoice.subtotal, invoice.currency)}</td></tr>`,
  );
  totalsRows.push(
    `<tr><td style="padding:4px 8px;font-size:13px;text-align:right;color:#6b6358">TVA</td><td style="padding:4px 8px;font-size:13px;text-align:right;color:#2a2622">${fmtMoney(invoice.vat_amount, invoice.currency)}</td></tr>`,
  );
  totalsRows.push(
    `<tr style="border-top:2px solid #2a2622"><td style="padding:8px;font-size:15px;text-align:right;font-weight:700;color:#2a2622">Total (${invoice.currency})</td><td style="padding:8px;font-size:15px;text-align:right;font-weight:700;color:#2a2622">${fmtMoney(invoice.total, invoice.currency)}</td></tr>`,
  );

  const scopeLabel = invoice.account_scope === "conta1" ? "Conta 1 — fiscal" : "Conta 2 — cash";

  const html = `<!doctype html>
<html lang="ro">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ece9e2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#2a2622">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;background:#ffffff;border-radius:8px;overflow:hidden">

        <tr><td style="padding:20px 24px;background:#f4f1ea;border-bottom:1px solid #d8d2c5">
          <div style="font-size:11px;color:#c0392b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">${escapeHtml(requestLabel)}</div>
          <div style="font-size:22px;font-weight:700;color:#2a2622;margin-top:4px">${docLabel} ${escapeHtml(number)}</div>
          <div style="font-size:12px;color:#6b6358;margin-top:2px">${escapeHtml(scopeLabel)} · Emisă: ${fmtDate(invoice.issued_date)}${invoice.due_date ? ` · Scadență: ${fmtDate(invoice.due_date)}` : ""}</div>
        </td></tr>

        <tr><td style="padding:16px 24px;background:#fffbe6;border-bottom:1px solid #f3e8aa">
          <div style="font-size:13px;color:#5a4906;line-height:1.5">
            <strong>Solicitare e-factură</strong> — vă rugăm să procesați emiterea facturii fiscale electronice pentru documentul de mai jos.
          </div>
        </td></tr>

        <tr><td style="padding:20px 24px">
          <div style="font-size:11px;color:#6b6358;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">Client</div>
          <div style="font-size:15px;font-weight:600;color:#2a2622;margin-top:4px">${escapeHtml(customer?.name ?? "—")}</div>
          ${customer?.idno ? `<div style="font-size:12px;color:#6b6358;margin-top:2px">IDNO: <span style="font-family:ui-monospace,monospace">${escapeHtml(customer.idno)}</span></div>` : ""}
          ${customer?.vat_number ? `<div style="font-size:12px;color:#6b6358">TVA: <span style="font-family:ui-monospace,monospace">${escapeHtml(customer.vat_number)}</span></div>` : ""}
          ${customer?.address ? `<div style="font-size:12px;color:#6b6358;margin-top:4px">${escapeHtml(customer.address)}</div>` : ""}
        </td></tr>

        <tr><td style="padding:0 24px 16px">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
            <thead>
              <tr style="background:#f4f1ea;border-bottom:2px solid #d8d2c5">
                <th align="left" style="padding:8px;font-size:10px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Produs</th>
                <th align="right" style="padding:8px;font-size:10px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Cant.</th>
                <th align="right" style="padding:8px;font-size:10px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Preț</th>
                <th align="right" style="padding:8px;font-size:10px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Total</th>
              </tr>
            </thead>
            <tbody>${rowsHtml || `<tr><td colspan="4" style="padding:12px;text-align:center;color:#6b6358;font-size:12px">— fără linii —</td></tr>`}</tbody>
          </table>
        </td></tr>

        <tr><td style="padding:0 24px 24px" align="right">
          <table cellpadding="0" cellspacing="0" border="0" style="min-width:280px">
            ${totalsRows.join("")}
          </table>
        </td></tr>

        ${invoice.notes ? `<tr><td style="padding:0 24px 20px"><div style="font-size:11px;color:#6b6358;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:4px">Note</div><div style="font-size:13px;color:#2a2622;white-space:pre-wrap">${escapeHtml(invoice.notes)}</div></td></tr>` : ""}

        <tr><td style="padding:14px 24px;background:#f4f1ea;border-top:1px solid #d8d2c5;font-size:11px;color:#6b6358;line-height:1.5">
          Inter Bus Parts S.R.L. · Forwarded automat din panel.<br/>
          ID document: <span style="font-family:ui-monospace,monospace">${escapeHtml(invoice.id)}</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const textLines: string[] = [
    `${requestLabel}`,
    `${docLabel} ${number}`,
    `Vă rugăm să procesați emiterea facturii fiscale electronice pentru documentul de mai jos.`,
    ``,
    `Emisă: ${fmtDate(invoice.issued_date)}`,
    `Client: ${customer?.name ?? "—"}`,
  ];
  if (customer?.idno) textLines.push(`IDNO: ${customer.idno}`);
  textLines.push("");
  for (const it of items) {
    const qty = Number(it.quantity ?? 0);
    const list = Number(it.unit_price ?? 0);
    const dp =
      it.discounted_unit_price != null ? Number(it.discounted_unit_price) : null;
    const eff = dp != null && dp >= 0 && dp < list ? dp : list;
    const total = Number(it.total ?? qty * eff);
    const discNote = eff < list ? `  [Reducere de la ${list.toFixed(2)}]` : "";
    textLines.push(
      `  ${it.partCode ? it.partCode + " " : ""}${it.name ?? ""}: ${qty} × ${eff.toFixed(2)} = ${total.toFixed(2)} ${invoice.currency}${discNote}`,
    );
  }
  textLines.push("");
  if (discountAmount > 0) {
    textLines.push(`Subtotal fără reducere: ${beforeDiscount.toFixed(2)} ${invoice.currency}`);
    textLines.push(`Reducere (-${discountPct}%): -${discountAmount.toFixed(2)} ${invoice.currency}`);
  }
  textLines.push(`Subtotal: ${invoice.subtotal.toFixed(2)} ${invoice.currency}`);
  textLines.push(`TVA: ${invoice.vat_amount.toFixed(2)} ${invoice.currency}`);
  textLines.push(`TOTAL: ${invoice.total.toFixed(2)} ${invoice.currency}`);

  const subject = `Solicitare e-factură · ${docLabel} ${number} — ${customer?.name ?? "Client"} — ${invoice.total.toFixed(2)} ${invoice.currency}`;

  return { subject, html, text: textLines.join("\n") };
}
