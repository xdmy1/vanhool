/**
 * Order confirmation email sent right after checkout. Brand-styled HTML
 * (warm-light palette, primary red, Inter font) with line items, totals,
 * delivery address and a "see your order" link. Plain-text fallback included.
 *
 * Fired fire-and-forget from createOrder; never throws.
 */

import { createClient } from "@/lib/supabase/server";
import { sendBrevoEmail } from "@/lib/email/brevo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://inter-bus.md";

type OrderItem = {
  name: string;
  partCode?: string | null;
  brand?: string | null;
  price: number;
  quantity: number;
};

type OrderRow = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  items: unknown;
  subtotal: number | string | null;
  discount_amount: number | string | null;
  shipping_cost: number | string | null;
  total: number | string | null;
  payment_method: string | null;
  notes: string | null;
};

const PAYMENT_LABELS: Record<string, string> = {
  paynet: "Card online (Paynet)",
  cash: "Numerar la livrare",
  transfer: "Transfer bancar",
};

const fmt = (v: number | string | null | undefined): string => {
  const n = typeof v === "string" ? Number(v) : v;
  const x = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return `${x.toFixed(2)} lei`;
};

function renderHtml(o: OrderRow): string {
  const items = (Array.isArray(o.items) ? o.items : []) as OrderItem[];
  const orderRef = o.id.slice(0, 8).toUpperCase();
  const payment = PAYMENT_LABELS[o.payment_method ?? ""] ?? "—";
  const dashboardUrl = `${SITE_URL}/ro/dashboard`;

  const itemRows = items
    .map((it) => {
      const sub = (it.quantity ?? 1) * (it.price ?? 0);
      const codeBadge = it.partCode
        ? `<div style="font-size:11px;color:#6b6358;margin-top:2px">${escapeHtml(it.brand ?? "")}${it.brand && it.partCode ? " · " : ""}${escapeHtml(it.partCode ?? "")}</div>`
        : "";
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2dccf">
            <div style="font-size:14px;color:#2a2622;font-weight:600">${escapeHtml(it.name)}</div>
            ${codeBadge}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e2dccf;text-align:right;font-size:13px;color:#6b6358;white-space:nowrap">
            ${it.quantity} × ${fmt(it.price)}
          </td>
          <td style="padding:12px 0 12px 16px;border-bottom:1px solid #e2dccf;text-align:right;font-size:14px;color:#2a2622;font-weight:600;white-space:nowrap">
            ${fmt(sub)}
          </td>
        </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Confirmare comandă</title>
</head>
<body style="margin:0;padding:0;background-color:#ece9e2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#2a2622">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ece9e2">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 2px rgba(42,38,34,0.04)">
          <tr>
            <td style="padding:24px 32px;background-color:#f4f1ea;border-bottom:1px solid #d8d2c5">
              <div style="font-size:18px;font-weight:700;color:#2a2622;letter-spacing:-0.01em">Inter Bus</div>
              <div style="font-size:12px;color:#6b6358;margin-top:2px">Piese auto · sales@inter-bus.md · +373 60 319 000</div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px">
              <div style="font-size:12px;color:#c0392b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Mulțumim pentru comandă</div>
              <h1 style="margin:8px 0 0 0;font-size:24px;color:#2a2622;font-weight:600">Comanda #${orderRef}</h1>
              <p style="margin:12px 0 0 0;font-size:14px;color:#6b6358;line-height:1.55">
                Bună ${escapeHtml((o.customer_name ?? "").split(" ")[0] ?? "")},<br />
                Am primit comanda ta și o pregătim. Vei primi separat factura PDF, iar curierul va contacta direct la numărul de telefon furnizat.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e2dccf">
                ${itemRows}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px 24px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${renderTotalRow("Subtotal", fmt(o.subtotal))}
                ${n(o.discount_amount) > 0 ? renderTotalRow("Reducere", "-" + fmt(o.discount_amount), "#c0392b") : ""}
                ${renderTotalRow("Livrare", n(o.shipping_cost) > 0 ? fmt(o.shipping_cost) : "Gratuit")}
                <tr>
                  <td style="padding:12px 0 0 0;font-size:14px;color:#2a2622;font-weight:600;border-top:2px solid #2a2622">Total</td>
                  <td style="padding:12px 0 0 0;font-size:18px;color:#2a2622;font-weight:700;text-align:right;border-top:2px solid #2a2622">${fmt(o.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f1ea;border-radius:6px">
                <tr>
                  <td style="padding:16px;font-size:13px;color:#2a2622;line-height:1.55">
                    <div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Livrare la</div>
                    ${escapeHtml(o.customer_address ?? "—")}<br />
                    <span style="color:#6b6358">${escapeHtml(o.customer_phone ?? "")}</span>
                    <div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 4px">Plată</div>
                    ${escapeHtml(payment)}
                    ${o.notes ? `<div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 4px">Observații</div>${escapeHtml(o.notes)}` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:0 32px 32px">
              <a href="${dashboardUrl}" style="display:inline-block;background-color:#c0392b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
                Vezi comenzile mele
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px;background-color:#f4f1ea;border-top:1px solid #d8d2c5;font-size:12px;color:#6b6358;line-height:1.5">
              Inter Bus · str. Dimo 9, Durlești, Chișinău · +373 60 319 000 · sales@inter-bus.md<br />
              Acest email a fost trimis automat. Răspunde aici pentru orice nelămurire.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderTotalRow(label: string, value: string, color = "#2a2622"): string {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#6b6358">${label}</td>
    <td style="padding:6px 0;font-size:14px;color:${color};text-align:right;font-weight:500">${value}</td>
  </tr>`;
}

function renderText(o: OrderRow): string {
  const items = (Array.isArray(o.items) ? o.items : []) as OrderItem[];
  const orderRef = o.id.slice(0, 8).toUpperCase();
  const lines = items
    .map((it) => `  - ${it.name} × ${it.quantity} → ${fmt(it.price * it.quantity)}`)
    .join("\n");
  return `Mulțumim pentru comandă!

Comanda #${orderRef}

${lines}

Subtotal: ${fmt(o.subtotal)}
${n(o.discount_amount) > 0 ? `Reducere: -${fmt(o.discount_amount)}\n` : ""}Livrare: ${n(o.shipping_cost) > 0 ? fmt(o.shipping_cost) : "gratuit"}
Total: ${fmt(o.total)}

Livrare: ${o.customer_address ?? "—"}
Telefon: ${o.customer_phone ?? "—"}

Vezi comenzile la ${SITE_URL}/ro/dashboard

Inter Bus · str. Dimo 9, Durlești, Chișinău
+373 60 319 000 · sales@inter-bus.md
`;
}

function n(v: number | string | null | undefined): number {
  const x = typeof v === "string" ? Number(v) : v;
  return typeof x === "number" && Number.isFinite(x) ? x : 0;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendOrderConfirmationEmail(
  orderId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_email, customer_address, customer_phone, items, subtotal, discount_amount, shipping_cost, total, payment_method, notes",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return { ok: false, reason: "order_not_found" };
  const o = data as unknown as OrderRow;
  if (!o.customer_email) return { ok: false, reason: "no_email" };

  const orderRef = o.id.slice(0, 8).toUpperCase();
  return sendBrevoEmail({
    to: [{ email: o.customer_email, name: o.customer_name ?? undefined }],
    subject: `Confirmare comandă #${orderRef} — Inter Bus`,
    htmlContent: renderHtml(o),
    textContent: renderText(o),
    replyTo: {
      email: process.env.BREVO_FROM_EMAIL ?? "sales@inter-bus.md",
      name: process.env.BREVO_FROM_NAME ?? "Inter Bus",
    },
  });
}
