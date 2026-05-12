/**
 * Brand-styled HTML email templates.
 *
 * Shared layout (`wrapEmail`) gives every message:
 *   • warm-light palette (#ece9e2 page bg, #ffffff card, #c0392b accent)
 *   • Inter-ish web-safe stack
 *   • compact header with logo wordmark, footer with contact info
 *   • plain-text fallback rendered by the caller
 *
 * Each template exports a small typed function returning
 * `{ subject, html, text }` ready to pass into sendResendEmail.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://inter-bus.md";

const CONTACT = {
  phone: "+373 60 319 000",
  email: "sales@inter-bus.md",
  address: "str. Dimo 9, Durlești, Chișinău",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const fmtMoney = (v: number | string | null | undefined): string => {
  const n = typeof v === "string" ? Number(v) : v;
  const x = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return `${x.toFixed(2)} lei`;
};

const num = (v: number | string | null | undefined): number => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
};

/**
 * Wrap a piece of body HTML in the brand layout. `eyebrow` is the small
 * red uppercase line above the title; `cta` (optional) renders a primary
 * button at the bottom.
 */
function wrapEmail({
  eyebrow,
  title,
  intro,
  bodyHtml,
  cta,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
}): string {
  return `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#ece9e2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#2a2622">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#ece9e2">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 2px rgba(42,38,34,0.04)">
          <tr>
            <td style="padding:24px 32px;background-color:#f4f1ea;border-bottom:1px solid #d8d2c5">
              <div style="font-size:18px;font-weight:700;color:#2a2622;letter-spacing:-0.01em">Inter Bus</div>
              <div style="font-size:12px;color:#6b6358;margin-top:2px">Piese auto · ${CONTACT.email} · ${CONTACT.phone}</div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px">
              <div style="font-size:12px;color:#c0392b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">${escapeHtml(eyebrow)}</div>
              <h1 style="margin:8px 0 0 0;font-size:24px;color:#2a2622;font-weight:600;line-height:1.25">${escapeHtml(title)}</h1>
              ${intro ? `<p style="margin:12px 0 0 0;font-size:14px;color:#6b6358;line-height:1.55">${intro}</p>` : ""}
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px">${bodyHtml}</td>
          </tr>

          ${
            cta
              ? `<tr><td align="center" style="padding:0 32px 32px"><a href="${cta.href}" style="display:inline-block;background-color:#c0392b;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">${escapeHtml(cta.label)}</a></td></tr>`
              : ""
          }

          <tr>
            <td style="padding:16px 32px;background-color:#f4f1ea;border-top:1px solid #d8d2c5;font-size:12px;color:#6b6358;line-height:1.5">
              Inter Bus · ${CONTACT.address} · ${CONTACT.phone} · ${CONTACT.email}<br />
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

// ============================================================================
// Order — confirmation to customer
// ============================================================================

export type OrderItemInput = {
  name: string;
  partCode?: string | null;
  brand?: string | null;
  price: number;
  quantity: number;
};

export type OrderEmailData = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItemInput[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  paymentMethod: string | null;
  notes: string | null;
  promoCode: string | null;
};

const PAYMENT_LABELS: Record<string, string> = {
  paynet: "Card online (Paynet)",
  cash: "Numerar la livrare",
  transfer: "Transfer bancar",
};

function renderItemRows(items: OrderItemInput[]): string {
  return items
    .map((it) => {
      const sub = (it.quantity ?? 1) * (it.price ?? 0);
      const codeBadge =
        it.brand || it.partCode
          ? `<div style="font-size:11px;color:#6b6358;margin-top:2px">${escapeHtml(it.brand ?? "")}${it.brand && it.partCode ? " · " : ""}${escapeHtml(it.partCode ?? "")}</div>`
          : "";
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e2dccf">
            <div style="font-size:14px;color:#2a2622;font-weight:600">${escapeHtml(it.name)}</div>
            ${codeBadge}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e2dccf;text-align:right;font-size:13px;color:#6b6358;white-space:nowrap">${it.quantity} × ${fmtMoney(it.price)}</td>
          <td style="padding:12px 0 12px 16px;border-bottom:1px solid #e2dccf;text-align:right;font-size:14px;color:#2a2622;font-weight:600;white-space:nowrap">${fmtMoney(sub)}</td>
        </tr>`;
    })
    .join("");
}

function renderTotalRow(label: string, value: string, color = "#2a2622"): string {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#6b6358">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-size:14px;color:${color};text-align:right;font-weight:500">${value}</td>
  </tr>`;
}

export function orderCustomerEmail(o: OrderEmailData) {
  const ref = o.orderId.slice(0, 8).toUpperCase();
  const payment = PAYMENT_LABELS[o.paymentMethod ?? ""] ?? "—";
  const firstName = (o.customerName ?? "").split(" ")[0] ?? "";
  const dashboardUrl = `${SITE_URL}/ro/dashboard`;

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e2dccf">
      ${renderItemRows(o.items)}
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px">
      ${renderTotalRow("Subtotal", fmtMoney(o.subtotal))}
      ${num(o.discountAmount) > 0 ? renderTotalRow("Reducere", "-" + fmtMoney(o.discountAmount), "#c0392b") : ""}
      ${renderTotalRow("Livrare", num(o.shippingCost) > 0 ? fmtMoney(o.shippingCost) : "Gratuit")}
      <tr>
        <td style="padding:12px 0 0 0;font-size:14px;color:#2a2622;font-weight:600;border-top:2px solid #2a2622">Total</td>
        <td style="padding:12px 0 0 0;font-size:18px;color:#2a2622;font-weight:700;text-align:right;border-top:2px solid #2a2622">${fmtMoney(o.total)}</td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px;background-color:#f4f1ea;border-radius:6px">
      <tr>
        <td style="padding:16px;font-size:13px;color:#2a2622;line-height:1.55">
          <div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Livrare la</div>
          ${escapeHtml(o.customerAddress ?? "—")}<br />
          <span style="color:#6b6358">${escapeHtml(o.customerPhone ?? "")}</span>
          <div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 4px">Plată</div>
          ${escapeHtml(payment)}
          ${o.notes ? `<div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 4px">Observații</div>${escapeHtml(o.notes)}` : ""}
        </td>
      </tr>
    </table>
  `;

  const html = wrapEmail({
    eyebrow: "Mulțumim pentru comandă",
    title: `Comanda #${ref}`,
    intro: `Bună ${escapeHtml(firstName)},<br />Am primit comanda ta și o pregătim. Vei primi separat factura PDF, iar curierul va contacta la numărul de telefon furnizat.`,
    bodyHtml,
    cta: { label: "Vezi comenzile mele", href: dashboardUrl },
  });

  const text = `Mulțumim pentru comandă!

Comanda #${ref}

${o.items.map((it) => `  - ${it.name} × ${it.quantity} → ${fmtMoney(it.price * it.quantity)}`).join("\n")}

Subtotal: ${fmtMoney(o.subtotal)}
${num(o.discountAmount) > 0 ? `Reducere: -${fmtMoney(o.discountAmount)}\n` : ""}Livrare: ${num(o.shippingCost) > 0 ? fmtMoney(o.shippingCost) : "gratuit"}
Total: ${fmtMoney(o.total)}

Livrare: ${o.customerAddress ?? "—"}
Telefon: ${o.customerPhone ?? "—"}
Plată: ${payment}

Vezi comenzile la ${dashboardUrl}
`;

  return { subject: `Confirmare comandă #${ref} — Inter Bus`, html, text };
}

// ============================================================================
// Order — notification to admin
// ============================================================================

export function orderAdminEmail(o: OrderEmailData) {
  const ref = o.orderId.slice(0, 8).toUpperCase();
  const payment = PAYMENT_LABELS[o.paymentMethod ?? ""] ?? "—";
  const adminOrderUrl = `${SITE_URL}/ro/admin/orders/${o.orderId}`;

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e2dccf">
      ${renderItemRows(o.items)}
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px">
      ${renderTotalRow("Subtotal", fmtMoney(o.subtotal))}
      ${num(o.discountAmount) > 0 ? renderTotalRow(`Reducere${o.promoCode ? ` (${o.promoCode})` : ""}`, "-" + fmtMoney(o.discountAmount), "#c0392b") : ""}
      ${renderTotalRow("Livrare", num(o.shippingCost) > 0 ? fmtMoney(o.shippingCost) : "Gratuit")}
      <tr>
        <td style="padding:12px 0 0 0;font-size:14px;color:#2a2622;font-weight:600;border-top:2px solid #2a2622">Total</td>
        <td style="padding:12px 0 0 0;font-size:18px;color:#c0392b;font-weight:700;text-align:right;border-top:2px solid #2a2622">${fmtMoney(o.total)}</td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px;background-color:#f4f1ea;border-radius:6px">
      <tr>
        <td style="padding:16px;font-size:13px;color:#2a2622;line-height:1.55">
          <div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Client</div>
          <strong>${escapeHtml(o.customerName)}</strong><br />
          <a href="mailto:${escapeHtml(o.customerEmail)}" style="color:#c0392b;text-decoration:none">${escapeHtml(o.customerEmail)}</a><br />
          <a href="tel:${escapeHtml(o.customerPhone.replace(/\s/g, ""))}" style="color:#c0392b;text-decoration:none">${escapeHtml(o.customerPhone ?? "")}</a>

          <div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 4px">Adresă</div>
          ${escapeHtml(o.customerAddress ?? "—")}

          <div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 4px">Plată</div>
          ${escapeHtml(payment)}

          ${o.notes ? `<div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 4px">Observații client</div>${escapeHtml(o.notes)}` : ""}
        </td>
      </tr>
    </table>
  `;

  const html = wrapEmail({
    eyebrow: "Comandă nouă",
    title: `#${ref} — ${fmtMoney(o.total)}`,
    intro: `${escapeHtml(o.customerName)} a plasat o comandă cu ${o.items.length} ${o.items.length === 1 ? "produs" : "produse"}.`,
    bodyHtml,
    cta: { label: "Deschide în admin", href: adminOrderUrl },
  });

  const text = `Comandă nouă #${ref} — ${fmtMoney(o.total)}

Client: ${o.customerName}
Email:  ${o.customerEmail}
Tel:    ${o.customerPhone}
Adresă: ${o.customerAddress}
Plată:  ${payment}
${o.notes ? `Note:   ${o.notes}\n` : ""}
Produse:
${o.items.map((it) => `  - ${it.quantity}× ${it.name}${it.partCode ? ` (${it.partCode})` : ""} — ${fmtMoney(it.price * it.quantity)}`).join("\n")}

Total: ${fmtMoney(o.total)}

Detalii: ${adminOrderUrl}
`;

  return { subject: `[Comandă] #${ref} · ${fmtMoney(o.total)} · ${o.customerName}`, html, text };
}

// ============================================================================
// Registration — welcome to user
// ============================================================================

export function welcomeEmail({
  firstName,
  email,
  accountType,
  locale,
}: {
  firstName: string;
  email: string;
  accountType: "individual" | "business";
  locale: "ro" | "en" | "ru";
}) {
  const dashboardUrl = `${SITE_URL}/${locale}/dashboard`;
  const catalogUrl = `${SITE_URL}/${locale}/catalog`;
  const accountLabel = accountType === "business" ? "business" : "personal";

  const bodyHtml = `
    <p style="margin:0 0 12px 0;font-size:14px;color:#2a2622;line-height:1.6">
      Contul tău ${escapeHtml(accountLabel)} a fost creat cu emailul <strong>${escapeHtml(email)}</strong>.
      ${accountType === "business" ? " Vom verifica datele companiei și îți activăm prețurile B2B în maxim 24h lucrătoare." : ""}
    </p>
    <p style="margin:0 0 12px 0;font-size:14px;color:#2a2622;line-height:1.6">
      Ce poți face acum:
    </p>
    <ul style="margin:0;padding:0 0 0 20px;font-size:14px;color:#2a2622;line-height:1.7">
      <li>Cauți piese după cod OE/OEM sau marcă vehicul</li>
      <li>Salvezi favorite pentru reorder rapid</li>
      <li>Urmărești toate comenzile în dashboard</li>
      <li>Primești factura PDF pe email la fiecare comandă</li>
    </ul>
  `;

  const html = wrapEmail({
    eyebrow: "Cont creat",
    title: `Bună ${escapeHtml(firstName)} 👋`,
    intro: "Bine ai venit la Inter Bus.",
    bodyHtml,
    cta: { label: "Deschide catalogul", href: catalogUrl },
  });

  const text = `Bună ${firstName},

Contul tău ${accountLabel} a fost creat cu emailul ${email}.

Deschide catalogul: ${catalogUrl}
Dashboard: ${dashboardUrl}

Inter Bus
${CONTACT.email} · ${CONTACT.phone}
`;

  return { subject: "Bine ai venit la Inter Bus", html, text };
}

// ============================================================================
// Registration — notification to admin
// ============================================================================

export function registerAdminEmail({
  firstName,
  lastName,
  email,
  phone,
  accountType,
  companyName,
  idno,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  accountType: "individual" | "business";
  companyName?: string;
  idno?: string;
}) {
  const adminUsersUrl = `${SITE_URL}/ro/admin/customers`;
  const isB2B = accountType === "business";

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f1ea;border-radius:6px">
      <tr>
        <td style="padding:16px;font-size:13px;color:#2a2622;line-height:1.65">
          <strong>${escapeHtml(firstName)} ${escapeHtml(lastName)}</strong><br />
          <a href="mailto:${escapeHtml(email)}" style="color:#c0392b;text-decoration:none">${escapeHtml(email)}</a><br />
          <a href="tel:${escapeHtml(phone.replace(/\s/g, ""))}" style="color:#c0392b;text-decoration:none">${escapeHtml(phone)}</a>

          ${
            isB2B
              ? `<div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 4px">Companie</div>
                 <strong>${escapeHtml(companyName ?? "—")}</strong>${idno ? `<br />IDNO: <span style="font-family:ui-monospace,monospace">${escapeHtml(idno)}</span>` : ""}`
              : ""
          }

          <div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 4px">Tip cont</div>
          ${isB2B ? "Business (B2B — verifică datele companiei)" : "Personal"}
        </td>
      </tr>
    </table>
  `;

  const html = wrapEmail({
    eyebrow: isB2B ? "Înregistrare B2B" : "Cont nou",
    title: `${escapeHtml(firstName)} ${escapeHtml(lastName)}`,
    intro: isB2B
      ? "Cont business nou — verifică datele companiei și activează prețurile B2B."
      : "Un client nou și-a creat cont pe site.",
    bodyHtml,
    cta: { label: "Deschide clienții", href: adminUsersUrl },
  });

  const text = `${isB2B ? "Înregistrare B2B" : "Cont nou"}

${firstName} ${lastName}
${email}
${phone}
${isB2B ? `\nCompanie: ${companyName ?? "—"}${idno ? `\nIDNO: ${idno}` : ""}` : ""}

${adminUsersUrl}
`;

  return {
    subject: isB2B
      ? `[B2B] Înregistrare nouă — ${companyName ?? firstName + " " + lastName}`
      : `[Cont] ${firstName} ${lastName}`,
    html,
    text,
  };
}

// ============================================================================
// Contact form — notification to admin
// ============================================================================

const TOPIC_LABELS: Record<string, string> = {
  general: "General",
  part_id: "Identificare piesă",
  order: "Comandă existentă",
  warranty: "Garanție",
  other: "Altceva",
};

export function contactAdminEmail({
  name,
  email,
  phone,
  topic,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone?: string | null;
  topic?: string | null;
  subject?: string | null;
  message: string;
}) {
  const topicLabel = TOPIC_LABELS[topic ?? "general"] ?? "General";
  const adminMessagesUrl = `${SITE_URL}/ro/admin/messages`;

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f1ea;border-radius:6px">
      <tr>
        <td style="padding:16px;font-size:13px;color:#2a2622;line-height:1.65">
          <strong>${escapeHtml(name)}</strong><br />
          <a href="mailto:${escapeHtml(email)}" style="color:#c0392b;text-decoration:none">${escapeHtml(email)}</a>
          ${phone ? `<br /><a href="tel:${escapeHtml(phone.replace(/\s/g, ""))}" style="color:#c0392b;text-decoration:none">${escapeHtml(phone)}</a>` : ""}

          <div style="font-size:11px;color:#6b6358;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin:12px 0 4px">Subiect</div>
          ${escapeHtml(topicLabel)}${subject ? ` — ${escapeHtml(subject)}` : ""}
        </td>
      </tr>
    </table>

    <div style="margin-top:16px;padding:16px;background-color:#ffffff;border:1px solid #e2dccf;border-radius:6px;font-size:14px;color:#2a2622;line-height:1.65;white-space:pre-wrap">${escapeHtml(message)}</div>
  `;

  const html = wrapEmail({
    eyebrow: "Mesaj nou",
    title: `${escapeHtml(name)} a scris`,
    intro: `Categorie: <strong>${escapeHtml(topicLabel)}</strong>`,
    bodyHtml,
    cta: { label: "Vezi toate mesajele", href: adminMessagesUrl },
  });

  const text = `Mesaj nou — ${topicLabel}

De la: ${name} <${email}>
${phone ? `Tel:   ${phone}\n` : ""}${subject ? `Sub:   ${subject}\n` : ""}
${message}

${adminMessagesUrl}
`;

  return {
    subject: `[Contact${topic && topic !== "general" ? " · " + topicLabel : ""}] ${name}`,
    html,
    text,
  };
}
