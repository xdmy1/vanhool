/**
 * Single-line purchase item forwarded to the bookkeeper. Used by the
 * per-row "Trimite contabilului" button on /panel/achizitii/[id] when
 * the operator wants to break out one specific item from a larger
 * purchase document.
 */

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
    month: "long",
    year: "numeric",
  }).format(dt);
}

export function accountantPurchaseLineEmail(args: {
  supplierName: string;
  documentNumber: string | null;
  documentDate: string;
  currency: string;
  line: {
    supplier_code: string | null;
    internal_code: string | null;
    description: string;
    quantity: number;
    unit_cost: number;
    vat_rate: number;
    line_total: number;
  };
}): { subject: string; html: string; text: string } {
  const { supplierName, documentNumber, documentDate, currency, line } = args;
  const lineTotalGross = Number(
    (line.line_total * (1 + (line.vat_rate || 0) / 100)).toFixed(2),
  );
  const docLabel = documentNumber
    ? `${supplierName} · ${documentNumber}`
    : supplierName;

  const html = `<!doctype html>
<html lang="ro">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ece9e2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#2a2622">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden">

        <tr><td style="padding:20px 24px;background:#f4f1ea;border-bottom:1px solid #d8d2c5">
          <div style="font-size:11px;color:#c0392b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Achiziție · rând individual</div>
          <div style="font-size:18px;font-weight:700;color:#2a2622;margin-top:4px">${escapeHtml(docLabel)}</div>
          <div style="font-size:12px;color:#6b6358;margin-top:2px">${fmtDate(documentDate)}</div>
        </td></tr>

        <tr><td style="padding:16px 24px;background:#fffbe6;border-bottom:1px solid #f3e8aa">
          <div style="font-size:13px;color:#5a4906;line-height:1.5">
            <strong>Solicitare contabilitate</strong> — vă rugăm să luați în evidență linia de mai jos din achiziția respectivă.
          </div>
        </td></tr>

        <tr><td style="padding:20px 24px">
          <div style="font-size:11px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em;font-weight:600">Piesă</div>
          ${line.supplier_code ? `<div style="margin-top:4px;font-family:ui-monospace,monospace;font-size:12px;color:#6b6358">Cod furnizor: ${escapeHtml(line.supplier_code)}</div>` : ""}
          ${line.internal_code ? `<div style="font-family:ui-monospace,monospace;font-size:12px;color:#6b6358">Cod intern: ${escapeHtml(line.internal_code)}</div>` : ""}
          <div style="margin-top:6px;font-size:15px;font-weight:600;color:#2a2622">${escapeHtml(line.description)}</div>
        </td></tr>

        <tr><td style="padding:0 24px 20px">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #d8d2c5;border-radius:6px;border-collapse:separate;overflow:hidden">
            <tr style="background:#fafaf6"><td style="padding:8px 12px;font-size:11px;color:#6b6358">Cantitate</td><td style="padding:8px 12px;font-size:13px;text-align:right;color:#2a2622">${line.quantity}</td></tr>
            <tr style="border-top:1px solid #eee5d2"><td style="padding:8px 12px;font-size:11px;color:#6b6358">Preț unitar</td><td style="padding:8px 12px;font-size:13px;text-align:right;color:#2a2622">${fmtMoney(line.unit_cost, currency)}</td></tr>
            <tr style="border-top:1px solid #eee5d2"><td style="padding:8px 12px;font-size:11px;color:#6b6358">Subtotal (net)</td><td style="padding:8px 12px;font-size:13px;text-align:right;color:#2a2622">${fmtMoney(line.line_total, currency)}</td></tr>
            <tr style="border-top:1px solid #eee5d2"><td style="padding:8px 12px;font-size:11px;color:#6b6358">TVA (${line.vat_rate}%)</td><td style="padding:8px 12px;font-size:13px;text-align:right;color:#2a2622">${fmtMoney(line.line_total * (line.vat_rate / 100), currency)}</td></tr>
            <tr style="border-top:2px solid #2a2622;background:#fafaf6"><td style="padding:10px 12px;font-size:14px;font-weight:700;color:#2a2622">Total brut</td><td style="padding:10px 12px;font-size:14px;text-align:right;font-weight:700;color:#2a2622">${fmtMoney(lineTotalGross, currency)}</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:14px 24px;background:#f4f1ea;border-top:1px solid #d8d2c5;font-size:11px;color:#6b6358;line-height:1.5">
          Inter Bus Parts S.R.L. · Forwarded automat din panel.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const subject = `Achiziție rând · ${supplierName}${documentNumber ? ` · ${documentNumber}` : ""} · ${line.description.slice(0, 60)}`;
  const text = [
    `Achiziție · rând individual`,
    `Furnizor: ${supplierName}`,
    documentNumber ? `Document: ${documentNumber}` : "",
    `Data: ${fmtDate(documentDate)}`,
    "",
    line.supplier_code ? `Cod furnizor: ${line.supplier_code}` : "",
    line.internal_code ? `Cod intern: ${line.internal_code}` : "",
    `Descriere: ${line.description}`,
    `Cantitate: ${line.quantity}`,
    `Preț unitar: ${fmtMoney(line.unit_cost, currency)}`,
    `Subtotal: ${fmtMoney(line.line_total, currency)}`,
    `TVA ${line.vat_rate}%: ${fmtMoney(line.line_total * (line.vat_rate / 100), currency)}`,
    `Total brut: ${fmtMoney(lineTotalGross, currency)}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
