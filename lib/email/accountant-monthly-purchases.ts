/**
 * Monthly conta1 purchases export emailed to the bookkeeper.
 * One section per purchase with its line items expanded, plus a
 * per-currency totals strip at the bottom.
 *
 * Triggered from /panel/achizitii by `sendMonthlyPurchasesToAccountant`.
 */

import type { PurchasesForMonth } from "@/lib/panel/purchases/queries";

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

export function accountantMonthlyPurchasesEmail(data: PurchasesForMonth): {
  subject: string;
  html: string;
  text: string;
} {
  const { from, to, count, purchases, totalsByCurrency } = data;
  const rangeStr = fmtRange(from, to);

  const purchasesHtml = purchases
    .map((p, idx) => {
      const itemsHtml = p.items
        .map(
          (it) => `<tr style="border-bottom:1px solid #eee5d2">
        <td style="padding:5px 8px;font-size:11px;color:#2a2622;vertical-align:top">
          ${it.supplier_code ? `<span style="font-family:ui-monospace,monospace;color:#6b6358">${escapeHtml(it.supplier_code)}</span><br/>` : ""}
          ${escapeHtml(it.description)}
        </td>
        <td style="padding:5px 8px;font-size:11px;text-align:right;color:#2a2622;vertical-align:top">${it.quantity}</td>
        <td style="padding:5px 8px;font-size:11px;text-align:right;color:#2a2622;vertical-align:top">${fmtMoney(it.unit_cost, p.currency)}</td>
        <td style="padding:5px 8px;font-size:11px;text-align:right;color:#2a2622;vertical-align:top">${it.vat_rate}%</td>
        <td style="padding:5px 8px;font-size:11px;text-align:right;color:#2a2622;font-weight:600;vertical-align:top">${fmtMoney(it.line_total, p.currency)}</td>
      </tr>`,
        )
        .join("");

      return `<div style="margin-bottom:16px;border:1px solid #d8d2c5;border-radius:6px;overflow:hidden">
        <div style="padding:10px 14px;background:#f4f1ea;border-bottom:1px solid #d8d2c5">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">
            <span>#${idx + 1} · ${fmtDate(p.document_date)}</span>
            <span style="font-weight:600">${escapeHtml(p.status)}</span>
          </div>
          <div style="margin-top:4px;font-size:14px;font-weight:600;color:#2a2622">${escapeHtml(p.supplier_name)}</div>
          ${p.document_number ? `<div style="margin-top:2px;font-family:ui-monospace,monospace;font-size:11px;color:#6b6358">Doc: ${escapeHtml(p.document_number)}</div>` : ""}
        </div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
          <thead>
            <tr style="background:#fafaf6">
              <th align="left" style="padding:5px 8px;font-size:9px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Produs</th>
              <th align="right" style="padding:5px 8px;font-size:9px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Cant.</th>
              <th align="right" style="padding:5px 8px;font-size:9px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Preț unit.</th>
              <th align="right" style="padding:5px 8px;font-size:9px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">TVA</th>
              <th align="right" style="padding:5px 8px;font-size:9px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml || `<tr><td colspan="5" style="padding:8px;text-align:center;color:#6b6358;font-size:11px">— fără linii —</td></tr>`}</tbody>
        </table>
        <div style="padding:8px 14px;background:#fafaf6;border-top:1px solid #d8d2c5;display:flex;justify-content:space-between;font-size:12px">
          <span style="color:#6b6358">Subtotal: <span style="color:#2a2622">${fmtMoney(p.subtotal, p.currency)}</span> · TVA: <span style="color:#2a2622">${fmtMoney(p.vat_amount, p.currency)}</span></span>
          <strong style="color:#2a2622">${fmtMoney(p.total, p.currency)}</strong>
        </div>
      </div>`;
    })
    .join("");

  const totalsHtml = totalsByCurrency
    .map(
      (t) => `<tr>
      <td style="padding:6px 12px;font-size:12px;color:#6b6358">${t.currency}</td>
      <td style="padding:6px 12px;font-size:12px;text-align:right;color:#2a2622">TVA: ${fmtMoney(t.vat_amount, t.currency)}</td>
      <td style="padding:6px 12px;font-size:14px;text-align:right;font-weight:700;color:#2a2622">${fmtMoney(t.total, t.currency)}</td>
    </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="ro">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ece9e2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#2a2622">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="720" style="max-width:720px;background:#ffffff;border-radius:8px;overflow:hidden">

        <tr><td style="padding:20px 24px;background:#f4f1ea;border-bottom:1px solid #d8d2c5">
          <div style="font-size:11px;color:#c0392b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Raport achiziții lunare</div>
          <div style="font-size:22px;font-weight:700;color:#2a2622;margin-top:4px">${escapeHtml(rangeStr)}</div>
          <div style="font-size:12px;color:#6b6358;margin-top:2px">${count} document${count === 1 ? "" : "e"}</div>
        </td></tr>

        <tr><td style="padding:16px 24px;background:#fffbe6;border-bottom:1px solid #f3e8aa">
          <div style="font-size:13px;color:#5a4906;line-height:1.5">
            <strong>Raport achiziții</strong> — vă rugăm să introduceți în evidența contabilă achizițiile listate mai jos pentru perioada ${escapeHtml(rangeStr)}.
          </div>
        </td></tr>

        <tr><td style="padding:20px 24px">
          ${purchasesHtml || `<div style="padding:24px;text-align:center;color:#6b6358;font-size:13px">— nicio achiziție în perioadă —</div>`}
        </td></tr>

        ${
          totalsByCurrency.length > 0
            ? `<tr><td style="padding:0 24px 20px" align="right">
                <table cellpadding="0" cellspacing="0" border="0" style="min-width:320px;border-top:2px solid #2a2622">
                  <thead><tr><th colspan="3" style="padding:8px 12px;font-size:11px;text-align:left;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Total general (pe valută)</th></tr></thead>
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

  const textLines: string[] = [
    `Raport achiziții lunare — ${rangeStr}`,
    `${count} document(e)`,
    "",
  ];
  for (const [i, p] of purchases.entries()) {
    textLines.push(
      `[${i + 1}] ${fmtDate(p.document_date)} · ${p.supplier_name}${p.document_number ? ` · Doc ${p.document_number}` : ""}`,
    );
    for (const it of p.items) {
      const code = it.supplier_code ? `${it.supplier_code} ` : "";
      textLines.push(
        `   • ${code}${it.description}: ${it.quantity} × ${it.unit_cost.toFixed(2)} (${it.vat_rate}%) = ${it.line_total.toFixed(2)} ${p.currency}`,
      );
    }
    textLines.push(
      `   Subtotal ${p.subtotal.toFixed(2)} + TVA ${p.vat_amount.toFixed(2)} = TOTAL ${p.total.toFixed(2)} ${p.currency}`,
    );
    textLines.push("");
  }
  if (totalsByCurrency.length > 0) {
    textLines.push("Total general (pe valută):");
    for (const t of totalsByCurrency) {
      textLines.push(
        `  ${t.currency}: total ${t.total.toFixed(2)} (TVA inclusă ${t.vat_amount.toFixed(2)})`,
      );
    }
  }

  const subject = `Raport achiziții lunare · ${rangeStr} · ${count} document(e)`;

  return { subject, html, text: textLines.join("\n") };
}
