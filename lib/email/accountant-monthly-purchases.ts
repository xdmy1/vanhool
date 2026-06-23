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

export function accountantMonthlyPurchasesEmail(
  data: PurchasesForMonth,
  options?: { mode?: "monthly" | "single" },
): {
  subject: string;
  html: string;
  text: string;
} {
  const { from, to, count, purchases, totalsByCurrency } = data;
  const rangeStr = fmtRange(from, to);
  const singleMode = options?.mode === "single";
  const eyebrow = singleMode
    ? "Achiziție · raport complet"
    : "Raport achiziții lunare";
  const requestLine = singleMode
    ? "Vă rugăm să luați în evidență achiziția de mai jos."
    : "Vă rugăm să introduceți în evidența contabilă achizițiile listate mai jos pentru perioada";

  const purchasesHtml = purchases
    .map((p, idx) => {
      const itemsHtml = p.items
        .map((it) => {
          // Updated per bookkeeper request: split back into three
          // explicit columns — Net + TVA(sumă) + Total cu TVA — so
          // the figures match what they enter in the books without
          // having to back out VAT from a single gross number. Also
          // surface the unit of measure (purchase rows don't track
          // it yet, default "buc"; sales/invoice paths read the real
          // value from items_snapshot.unit).
          const netLine = Number(it.line_total.toFixed(2));
          const vatLineAmount = Number(
            (it.line_total * (it.vat_rate / 100)).toFixed(2),
          );
          const grossLine = Number((netLine + vatLineAmount).toFixed(2));
          return `<tr style="border-bottom:1px solid #eee5d2">
            <td style="padding:5px 8px;font-size:11px;color:#2a2622;vertical-align:top">
              ${it.supplier_code ? `<span style="font-family:ui-monospace,monospace;color:#6b6358">${escapeHtml(it.supplier_code)}</span><br/>` : ""}
              ${escapeHtml(it.description)}
            </td>
            <td style="padding:5px 8px;font-size:11px;text-align:right;color:#2a2622;vertical-align:top;white-space:nowrap">${it.quantity} buc</td>
            <td style="padding:5px 8px;font-size:11px;text-align:right;color:#2a2622;vertical-align:top">${fmtMoney(it.unit_cost, p.currency)}</td>
            <td style="padding:5px 8px;font-size:11px;text-align:right;color:#2a2622;vertical-align:top">${fmtMoney(netLine, p.currency)}</td>
            <td style="padding:5px 8px;font-size:11px;text-align:right;color:#2a2622;vertical-align:top">${fmtMoney(vatLineAmount, p.currency)}<div style="font-size:9px;color:#6b6358">${it.vat_rate}%</div></td>
            <td style="padding:5px 8px;font-size:11px;text-align:right;color:#2a2622;font-weight:600;vertical-align:top">${fmtMoney(grossLine, p.currency)}</td>
          </tr>`;
        })
        .join("");

      // Compact supplier registration block — IDNO, VAT code, address,
      // phone, email. Anything missing simply collapses out of the layout.
      const supplierRows: string[] = [];
      if (p.supplier_idno) {
        supplierRows.push(
          `<div style="font-size:11px;color:#6b6358">IDNO: <span style="font-family:ui-monospace,monospace;color:#2a2622">${escapeHtml(p.supplier_idno)}</span></div>`,
        );
      }
      if (p.supplier_vat_code) {
        supplierRows.push(
          `<div style="font-size:11px;color:#6b6358">Cod TVA: <span style="font-family:ui-monospace,monospace;color:#2a2622">${escapeHtml(p.supplier_vat_code)}</span></div>`,
        );
      }
      if (p.supplier_address) {
        supplierRows.push(
          `<div style="font-size:11px;color:#6b6358">Adresă: <span style="color:#2a2622">${escapeHtml(p.supplier_address)}</span></div>`,
        );
      }
      if (p.supplier_phone) {
        supplierRows.push(
          `<div style="font-size:11px;color:#6b6358">Telefon: <span style="color:#2a2622">${escapeHtml(p.supplier_phone)}</span></div>`,
        );
      }
      if (p.supplier_email) {
        supplierRows.push(
          `<div style="font-size:11px;color:#6b6358">Email: <span style="color:#2a2622">${escapeHtml(p.supplier_email)}</span></div>`,
        );
      }
      const supplierBlock =
        supplierRows.length > 0
          ? `<div style="margin-top:6px;padding-top:6px;border-top:1px dashed #d8d2c5">${supplierRows.join("")}</div>`
          : "";

      return `<div style="margin-bottom:16px;border:1px solid #d8d2c5;border-radius:6px;overflow:hidden">
        <div style="padding:10px 14px;background:#f4f1ea;border-bottom:1px solid #d8d2c5">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:#6b6358;text-transform:uppercase;letter-spacing:0.05em">
            <span>#${idx + 1} · ${fmtDate(p.document_date)}</span>
            <span style="font-weight:600">${escapeHtml(p.status)}</span>
          </div>
          <div style="margin-top:4px;font-size:14px;font-weight:600;color:#2a2622">${escapeHtml(p.supplier_name)}</div>
          ${p.document_number ? `<div style="margin-top:2px;font-family:ui-monospace,monospace;font-size:11px;color:#6b6358">Doc: ${escapeHtml(p.document_number)}</div>` : ""}
          ${supplierBlock}
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
          <tbody>${itemsHtml || `<tr><td colspan="6" style="padding:8px;text-align:center;color:#6b6358;font-size:11px">— fără linii —</td></tr>`}</tbody>
        </table>
        <div style="padding:8px 14px;background:#fafaf6;border-top:1px solid #d8d2c5;font-size:12px;color:#2a2622">
          <div style="display:flex;justify-content:space-between;color:#6b6358"><span>Subtotal net</span><span style="color:#2a2622">${fmtMoney(p.subtotal, p.currency)}</span></div>
          <div style="display:flex;justify-content:space-between;color:#6b6358"><span>TVA</span><span style="color:#2a2622">${fmtMoney(p.vat_amount, p.currency)}</span></div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid #d8d2c5;margin-top:4px;padding-top:4px;font-weight:700"><span style="text-transform:uppercase;font-size:11px">Total cu TVA</span><span>${fmtMoney(p.total, p.currency)}</span></div>
        </div>
      </div>`;
    })
    .join("");

  // Grand totals strip — three columns again per bookkeeper's revised
  // request: Net subtotal, VAT amount, Gross total. Each currency
  // gets its own row.
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
          <div style="font-size:11px;color:#c0392b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">${escapeHtml(eyebrow)}</div>
          <div style="font-size:22px;font-weight:700;color:#2a2622;margin-top:4px">${escapeHtml(singleMode ? (purchases[0]?.supplier_name ?? "Achiziție") : rangeStr)}</div>
          <div style="font-size:12px;color:#6b6358;margin-top:2px">${singleMode ? (purchases[0]?.document_number ? `Doc ${escapeHtml(purchases[0].document_number)} · ${fmtDate(purchases[0].document_date)}` : fmtDate(purchases[0]?.document_date ?? "")) : `${count} document${count === 1 ? "" : "e"}`}</div>
        </td></tr>

        <tr><td style="padding:16px 24px;background:#fffbe6;border-bottom:1px solid #f3e8aa">
          <div style="font-size:13px;color:#5a4906;line-height:1.5">
            <strong>${singleMode ? "Solicitare contabilitate" : "Raport achiziții"}</strong> — ${escapeHtml(requestLine)}${singleMode ? "" : " " + escapeHtml(rangeStr) + "."}
          </div>
        </td></tr>

        <tr><td style="padding:20px 24px">
          ${purchasesHtml || `<div style="padding:24px;text-align:center;color:#6b6358;font-size:13px">— nicio achiziție în perioadă —</div>`}
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

  const textLines: string[] = [
    `Raport achiziții lunare — ${rangeStr}`,
    `${count} document(e)`,
    "",
  ];
  for (const [i, p] of purchases.entries()) {
    textLines.push(
      `[${i + 1}] ${fmtDate(p.document_date)} · ${p.supplier_name}${p.document_number ? ` · Doc ${p.document_number}` : ""}`,
    );
    if (p.supplier_idno) textLines.push(`   IDNO: ${p.supplier_idno}`);
    if (p.supplier_vat_code) textLines.push(`   Cod TVA: ${p.supplier_vat_code}`);
    if (p.supplier_address) textLines.push(`   Adresă: ${p.supplier_address}`);
    if (p.supplier_phone) textLines.push(`   Telefon: ${p.supplier_phone}`);
    if (p.supplier_email) textLines.push(`   Email: ${p.supplier_email}`);
    for (const it of p.items) {
      const code = it.supplier_code ? `${it.supplier_code} ` : "";
      const netLine = Number(it.line_total.toFixed(2));
      const vatLine = Number((it.line_total * (it.vat_rate / 100)).toFixed(2));
      const grossLine = Number((netLine + vatLine).toFixed(2));
      textLines.push(
        `   • ${code}${it.description}: ${it.quantity} buc × ${it.unit_cost.toFixed(2)} = net ${netLine.toFixed(2)} + TVA ${vatLine.toFixed(2)} (${it.vat_rate}%) = total ${grossLine.toFixed(2)} ${p.currency}`,
      );
    }
    textLines.push(
      `   Subtotal net: ${p.subtotal.toFixed(2)} | TVA: ${p.vat_amount.toFixed(2)} | TOTAL cu TVA: ${p.total.toFixed(2)} ${p.currency}`,
    );
    textLines.push("");
  }
  if (totalsByCurrency.length > 0) {
    textLines.push("Total general (pe valută):");
    for (const t of totalsByCurrency) {
      const net = Number((t.total - t.vat_amount).toFixed(2));
      textLines.push(
        `  ${t.currency}: net ${net.toFixed(2)} | TVA ${t.vat_amount.toFixed(2)} | total ${t.total.toFixed(2)}`,
      );
    }
  }

  const subject = singleMode && purchases[0]
    ? `Achiziție · ${purchases[0].supplier_name}${purchases[0].document_number ? ` · ${purchases[0].document_number}` : ""} · ${fmtDate(purchases[0].document_date)}`
    : `Raport achiziții lunare · ${rangeStr} · ${count} document(e)`;

  return { subject, html, text: textLines.join("\n") };
}
