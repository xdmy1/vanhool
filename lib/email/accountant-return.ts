/**
 * Factură de retur forwarded to the bookkeeper on its own — the parent invoice
 * / purchase has usually been sent (and entered) before the goods came back,
 * so the return can't wait for a re-send of the whole document.
 *
 * Triggered from the annex block and /panel/retururi by `sendReturnToAccountant`.
 */

import type { ReturnInvoice } from "@/lib/panel/returns/queries";

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
    timeZone: "Europe/Chisinau",
  }).format(dt);
}

export function accountantReturnEmail(
  ret: ReturnInvoice,
  options: {
    markEnteredUrl?: string;
    /** Sum of EVERY return on the parent document (this one included). */
    parentReturnsTotal: number;
  },
): { subject: string; html: string; text: string } {
  const isPurchase = ret.kind === "purchase";
  const kindLabel = isPurchase ? "Retur către furnizor" : "Retur de la client";
  const partyLabel = isPurchase ? "Furnizor" : "Client";
  const parentNoun = isPurchase ? "achiziției" : "facturii";
  const parentRef = `${parentNoun} ${ret.parent_label}${ret.parent_date ? ` din ${fmtDate(ret.parent_date)}` : ""}`;
  const scopeLabel = ret.account_scope === "conta1" ? "Conta 1" : "Conta 2";
  const cur = ret.currency;
  const netAfterReturns = Number((ret.parent_total - options.parentReturnsTotal).toFixed(2));
  const { markEnteredUrl } = options;

  const rowsHtml = ret.lines
    .map(
      (r) => `<tr style="border-bottom:1px solid #f3dede">
        <td style="padding:6px 8px;font-size:13px;color:#2a2622">
          ${r.part_code ? `<div style="font-family:ui-monospace,monospace;font-size:11px;color:#6b6358">${escapeHtml(String(r.part_code))}</div>` : ""}
          <div>${escapeHtml(String(r.name ?? "—"))}</div>
          ${r.reason ? `<div style="font-size:11px;color:#6b6358">${escapeHtml(String(r.reason))}</div>` : ""}
        </td>
        <td style="padding:6px 8px;font-size:13px;text-align:right;color:#2a2622;white-space:nowrap">${Number(r.quantity)}</td>
        <td style="padding:6px 8px;font-size:13px;text-align:right;color:#b91c1c">−${fmtMoney(Number(r.net_amount), cur)}</td>
        <td style="padding:6px 8px;font-size:13px;text-align:right;color:#b91c1c">−${fmtMoney(Number(r.vat_amount), cur)}<div style="font-size:9px;color:#6b6358">${Number(r.vat_rate)}%</div></td>
        <td style="padding:6px 8px;font-size:13px;text-align:right;font-weight:600;color:#b91c1c">−${fmtMoney(Number(r.total), cur)}</td>
      </tr>`,
    )
    .join("");

  const partyRows = [
    ret.party.idno
      ? `<div style="font-size:12px;color:#6b6358;margin-top:2px">IDNO: <span style="font-family:ui-monospace,monospace">${escapeHtml(ret.party.idno)}</span></div>`
      : "",
    ret.party.vat_code
      ? `<div style="font-size:12px;color:#6b6358">Cod TVA: <span style="font-family:ui-monospace,monospace">${escapeHtml(ret.party.vat_code)}</span></div>`
      : "",
    ret.party.address
      ? `<div style="font-size:12px;color:#6b6358;margin-top:4px">${escapeHtml(ret.party.address)}</div>`
      : "",
  ].join("");

  const html = `<!doctype html>
<html lang="ro">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#ece9e2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#2a2622">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width:640px;background:#ffffff;border-radius:8px;overflow:hidden">

        <tr><td style="padding:20px 24px;background:#f4f1ea;border-bottom:1px solid #d8d2c5">
          <div style="font-size:11px;color:#c0392b;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Factură de retur · ${escapeHtml(kindLabel)}</div>
          <div style="font-size:22px;font-weight:700;color:#2a2622;margin-top:4px">${escapeHtml(ret.label)}</div>
          <div style="font-size:12px;color:#6b6358;margin-top:2px">${escapeHtml(scopeLabel)} · Data returului: ${fmtDate(ret.date)}</div>
        </td></tr>

        ${markEnteredUrl ? `<tr><td style="padding:16px 24px 0">
          <a href="${markEnteredUrl}" style="display:block;text-align:center;background:#15803d;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 20px;border-radius:8px">✅ Marchează ca INTRODUS</a>
          <div style="font-size:11px;color:#6b6358;text-align:center;margin-top:6px">Apasă după ce ai introdus returul în contabilitate — se salvează automat în panelul Inter Bus.</div>
        </td></tr>` : ""}

        <tr><td style="padding:16px 24px;background:#fffbe6;border-bottom:1px solid #f3e8aa">
          <div style="font-size:13px;color:#5a4906;line-height:1.5">
            <strong>Retur</strong> — vă rugăm să luați în evidență returul de mai jos, aferent ${escapeHtml(parentRef)}.
          </div>
        </td></tr>

        <tr><td style="padding:20px 24px">
          <div style="font-size:11px;color:#6b6358;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">${partyLabel}</div>
          <div style="font-size:15px;font-weight:600;color:#2a2622;margin-top:4px">${escapeHtml(ret.party.name)}</div>
          ${partyRows}
        </td></tr>

        <tr><td style="padding:0 24px 16px">
          <div style="border:1px solid #f0c9c9;border-radius:8px;overflow:hidden">
            <div style="padding:10px 12px;background:#fbeaea;color:#b91c1c;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Produse returnate</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse">
              <thead><tr style="background:#fdf5f5">
                <th align="left" style="padding:6px 8px;font-size:10px;color:#6b6358;text-transform:uppercase">Produs</th>
                <th align="right" style="padding:6px 8px;font-size:10px;color:#6b6358;text-transform:uppercase">Cant.</th>
                <th align="right" style="padding:6px 8px;font-size:10px;color:#6b6358;text-transform:uppercase">Net</th>
                <th align="right" style="padding:6px 8px;font-size:10px;color:#6b6358;text-transform:uppercase">TVA</th>
                <th align="right" style="padding:6px 8px;font-size:10px;color:#6b6358;text-transform:uppercase">Total cu TVA</th>
              </tr></thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
        </td></tr>

        <tr><td style="padding:0 24px 20px" align="right">
          <table cellpadding="0" cellspacing="0" border="0" width="300" style="width:300px">
            <tr><td style="padding:4px 0;font-size:13px;color:#6b6358">Retur net</td><td align="right" style="padding:4px 0;font-size:13px;color:#b91c1c">−${fmtMoney(ret.net, cur)}</td></tr>
            <tr><td style="padding:4px 0;font-size:13px;color:#6b6358">TVA</td><td align="right" style="padding:4px 0;font-size:13px;color:#b91c1c">−${fmtMoney(ret.vat, cur)}</td></tr>
            <tr><td style="padding:8px 0 4px;font-size:15px;font-weight:700;color:#2a2622;border-top:2px solid #2a2622">Total retur (${cur})</td><td align="right" style="padding:8px 0 4px;font-size:15px;font-weight:700;color:#b91c1c;border-top:2px solid #2a2622">−${fmtMoney(ret.total, cur)}</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 24px 20px">
          <div style="border:1px solid #d8d2c5;border-radius:8px;padding:12px 14px;background:#fafaf6;font-size:12px;color:#6b6358;line-height:1.7">
            <div style="display:flex;justify-content:space-between"><span>Document inițial: ${escapeHtml(ret.parent_label)}${ret.parent_date ? ` · ${fmtDate(ret.parent_date)}` : ""}</span><span style="color:#2a2622">${fmtMoney(ret.parent_total, cur)}</span></div>
            <div style="display:flex;justify-content:space-between"><span>Total retururi pe document</span><span style="color:#b91c1c">−${fmtMoney(options.parentReturnsTotal, cur)}</span></div>
            <div style="display:flex;justify-content:space-between;font-weight:700;color:#2a2622;border-top:1px solid #d8d2c5;margin-top:4px;padding-top:4px"><span>Net după retururi</span><span>${fmtMoney(netAfterReturns, cur)}</span></div>
          </div>
        </td></tr>

        <tr><td style="padding:14px 24px;background:#f4f1ea;border-top:1px solid #d8d2c5;font-size:11px;color:#6b6358;line-height:1.5">
          Inter Bus Parts S.R.L. · Generat automat din panel.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const textLines: string[] = [
    `Factură de retur ${ret.label} — ${kindLabel}`,
    `Vă rugăm să luați în evidență returul de mai jos, aferent ${parentRef}.`,
    "",
    `Data returului: ${fmtDate(ret.date)} · ${scopeLabel}`,
    `${partyLabel}: ${ret.party.name}`,
  ];
  if (ret.party.idno) textLines.push(`IDNO: ${ret.party.idno}`);
  if (ret.party.vat_code) textLines.push(`Cod TVA: ${ret.party.vat_code}`);
  textLines.push("");
  for (const r of ret.lines) {
    textLines.push(
      `  ${r.part_code ? r.part_code + " " : ""}${r.name ?? ""}: ${Number(r.quantity)} buc → −${Number(r.total).toFixed(2)} ${cur} (net −${Number(r.net_amount).toFixed(2)} + TVA −${Number(r.vat_amount).toFixed(2)})${r.reason ? "  [" + r.reason + "]" : ""}`,
    );
  }
  textLines.push("");
  textLines.push(
    `TOTAL RETUR: −${ret.total.toFixed(2)} ${cur} (net −${ret.net.toFixed(2)} + TVA −${ret.vat.toFixed(2)})`,
  );
  textLines.push(
    `Document inițial ${ret.parent_label}: ${ret.parent_total.toFixed(2)} ${cur} · total retururi −${options.parentReturnsTotal.toFixed(2)} · NET DUPĂ RETURURI: ${netAfterReturns.toFixed(2)} ${cur}`,
  );
  if (markEnteredUrl) {
    textLines.push("");
    textLines.push(`Marchează ca INTRODUS (după introducerea în contabilitate): ${markEnteredUrl}`);
  }

  const subject = `Factură de retur ${ret.label} · ${kindLabel} — ${ret.party.name} — −${ret.total.toFixed(2)} ${cur}`;

  return { subject, html, text: textLines.join("\n") };
}
