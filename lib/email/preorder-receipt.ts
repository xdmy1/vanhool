/**
 * Receipt email — fired by the operator from /panel/precomenzi right after
 * a preorder is registered, to let the customer know the request landed and
 * we're now checking with suppliers. Separate from the "confirmed" email
 * which goes out later, once price + ETA are locked in.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function preorderReceiptEmail(args: {
  customerName: string;
  partCode: string | null;
  description: string;
  quantity: number;
}): { subject: string; html: string; text: string } {
  const { customerName, partCode, description, quantity } = args;
  const partLabel = partCode ? `${partCode} · ${description}` : description;

  const html = `<!doctype html>
<html lang="ro">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ece9e2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#2a2622">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td align="center" style="padding:32px 12px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden">

        <tr><td style="padding:24px 32px;background:#f4f1ea;border-bottom:1px solid #d8d2c5">
          <div style="font-size:11px;color:#c0392b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Cerere primită</div>
          <div style="font-size:22px;font-weight:700;color:#2a2622;margin-top:4px">Am înregistrat precomanda dvs.</div>
        </td></tr>

        <tr><td style="padding:28px 32px 8px">
          <p style="margin:0 0 16px 0;font-size:14px;line-height:1.55;color:#2a2622">
            Bună ziua, <strong>${escapeHtml(customerName)}</strong>,
          </p>
          <p style="margin:0 0 16px 0;font-size:14px;line-height:1.55;color:#2a2622">
            Vă mulțumim pentru cererea de precomandă. Am preluat-o și verificăm disponibilitatea cu furnizorii noștri.
            Revenim cu prețul final și termenul de livrare în maxim <strong>1 zi lucrătoare</strong>.
          </p>
        </td></tr>

        <tr><td style="padding:8px 32px 16px">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #d8d2c5;border-radius:6px;overflow:hidden">
            <tr style="background:#f4f1ea">
              <td style="padding:10px 14px;font-size:11px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">Piesă solicitată</td>
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
          </table>
        </td></tr>

        <tr><td style="padding:8px 32px 28px">
          <p style="margin:0;font-size:13px;color:#6b6358;line-height:1.55">
            Veți primi un al doilea email cu prețul confirmat și data estimată de livrare imediat ce furnizorul ne dă disponibilitatea.
            Dacă aveți între timp întrebări, ne puteți răspunde la acest email sau ne sunați la <a href="tel:+37368059005" style="color:#c0392b">+373 68 059 005</a>.
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
    "Vă mulțumim pentru cererea de precomandă. Am preluat-o și verificăm disponibilitatea cu furnizorii noștri. Revenim cu prețul final și termenul de livrare în maxim 1 zi lucrătoare.",
    "",
    `Piesă solicitată: ${partLabel}`,
    `Cantitate: ${quantity}`,
    "",
    "Veți primi un al doilea email cu prețul confirmat și data estimată de livrare imediat ce furnizorul ne dă disponibilitatea.",
    "",
    "Inter Bus Parts S.R.L. · +373 68 059 005 · sales@inter-bus.md",
  ].join("\n");

  const subject = `Precomandă înregistrată — ${partLabel}`;
  return { subject, html, text };
}
