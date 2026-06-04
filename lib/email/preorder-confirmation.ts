/**
 * Confirmation email to the customer when their preorder is locked in.
 * Tells them the price the operator agreed on, the lead time, and that
 * we'll dispatch as soon as the supplier delivers.
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

export function preorderConfirmationEmail(args: {
  customerName: string;
  partCode: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  expectedDeliveryDate: string | null;
  notes?: string | null;
}): { subject: string; html: string; text: string } {
  const {
    customerName,
    partCode,
    description,
    quantity,
    unitPrice,
    currency,
    expectedDeliveryDate,
    notes,
  } = args;
  const total = quantity * unitPrice;
  const partLabel = partCode ? `${partCode} · ${description}` : description;
  const etaLine = expectedDeliveryDate
    ? `Termen de livrare estimat: <strong>${fmtDate(expectedDeliveryDate)}</strong>`
    : "Vă vom anunța imediat ce piesa ajunge la noi.";

  const html = `<!doctype html>
<html lang="ro">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ece9e2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#2a2622">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td align="center" style="padding:32px 12px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden">

        <tr><td style="padding:24px 32px;background:#f4f1ea;border-bottom:1px solid #d8d2c5">
          <div style="font-size:11px;color:#c0392b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Precomandă confirmată</div>
          <div style="font-size:22px;font-weight:700;color:#2a2622;margin-top:4px">Comanda dvs. este înregistrată</div>
        </td></tr>

        <tr><td style="padding:28px 32px 8px">
          <p style="margin:0 0 16px 0;font-size:14px;line-height:1.55;color:#2a2622">
            Bună ziua, <strong>${escapeHtml(customerName)}</strong>,
          </p>
          <p style="margin:0 0 16px 0;font-size:14px;line-height:1.55;color:#2a2622">
            Vă confirmăm că am preluat comanda dvs. și am stabilit prețul + termenul de livrare împreună. Vom contacta furnizorul și vă vom livra piesa imediat ce ajunge la depozitul nostru.
          </p>
        </td></tr>

        <tr><td style="padding:8px 32px 16px">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #d8d2c5;border-radius:6px;overflow:hidden">
            <tr style="background:#f4f1ea">
              <td style="padding:10px 14px;font-size:11px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Piesă</td>
            </tr>
            <tr>
              <td style="padding:12px 14px;font-size:14px;color:#2a2622">
                <div style="font-weight:600">${escapeHtml(partLabel)}</div>
              </td>
            </tr>
            <tr style="border-top:1px solid #eee5d2">
              <td style="padding:12px 14px;font-size:13px;color:#2a2622;display:flex;justify-content:space-between">
                <span style="color:#6b6358">Cantitate</span>
                <strong>${quantity}</strong>
              </td>
            </tr>
            <tr style="border-top:1px solid #eee5d2">
              <td style="padding:12px 14px;font-size:13px;color:#2a2622;display:flex;justify-content:space-between">
                <span style="color:#6b6358">Preț unitar</span>
                <strong>${fmtMoney(unitPrice, currency)}</strong>
              </td>
            </tr>
            <tr style="border-top:2px solid #2a2622;background:#fafaf6">
              <td style="padding:14px;font-size:15px;color:#2a2622;display:flex;justify-content:space-between;font-weight:700">
                <span>Total</span>
                <span>${fmtMoney(total, currency)}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:8px 32px 24px">
          <div style="padding:14px 16px;background:#fffbe6;border:1px solid #f3e8aa;border-radius:6px;font-size:13px;color:#5a4906;line-height:1.5">
            ${etaLine}
          </div>
        </td></tr>

        ${
          notes
            ? `<tr><td style="padding:0 32px 24px"><div style="font-size:11px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;margin-bottom:6px">Note</div><div style="font-size:13px;color:#2a2622;line-height:1.5;white-space:pre-wrap">${escapeHtml(notes)}</div></td></tr>`
            : ""
        }

        <tr><td style="padding:0 32px 28px">
          <p style="margin:0;font-size:13px;color:#6b6358;line-height:1.55">
            Vă mulțumim pentru încredere! Pentru orice întrebări, ne puteți contacta răspunzând la acest email sau la <a href="tel:+37368059005" style="color:#c0392b">+373 68 059 005</a>.
          </p>
        </td></tr>

        <tr><td style="padding:16px 32px;background:#f4f1ea;border-top:1px solid #d8d2c5;font-size:12px;color:#6b6358;line-height:1.5">
          Inter Bus Parts S.R.L. · str. Dimo 9, Durlești, Chișinău · sales@inter-bus.md · +373 68 059 005
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `Bună ziua, ${customerName},`,
    "",
    "Vă confirmăm că am preluat comanda dvs. și am stabilit prețul + termenul de livrare împreună.",
    "",
    `Piesă: ${partLabel}`,
    `Cantitate: ${quantity}`,
    `Preț unitar: ${fmtMoney(unitPrice, currency)}`,
    `Total: ${fmtMoney(total, currency)}`,
    "",
    expectedDeliveryDate
      ? `Termen de livrare estimat: ${fmtDate(expectedDeliveryDate)}`
      : "Vă vom anunța imediat ce piesa ajunge la noi.",
    "",
    notes ? `Note: ${notes}\n` : "",
    "Inter Bus Parts S.R.L. · +373 68 059 005 · sales@inter-bus.md",
  ].join("\n");

  const subject = `Comandă confirmată — ${partLabel}`;
  return { subject, html, text };
}
