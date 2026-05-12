/**
 * Resend transactional email wrapper.
 * https://resend.com/docs/api-reference/emails/send-email
 *
 * Server-only. The API key must NEVER leak to the client bundle —
 * RESEND_API_KEY (no NEXT_PUBLIC_ prefix). All notification calls go
 * through server actions.
 */

import "server-only";

const DEFAULT_FROM = "Inter Bus <sales@inter-bus.md>";

export type ResendRecipient = string | { email: string; name?: string };

export type ResendResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function fmtRecipient(r: ResendRecipient): string {
  if (typeof r === "string") return r;
  return r.name ? `${r.name} <${r.email}>` : r.email;
}

export async function sendResendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  cc,
  bcc,
  from,
}: {
  to: ResendRecipient | ResendRecipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: ResendRecipient;
  cc?: ResendRecipient[];
  bcc?: ResendRecipient[];
  from?: string;
}): Promise<ResendResult> {
  if (!isResendConfigured()) {
    console.warn("[resend] RESEND_API_KEY missing — skipping email");
    return { ok: false, reason: "not_configured" };
  }

  const body: Record<string, unknown> = {
    from: from ?? process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM,
    to: (Array.isArray(to) ? to : [to]).map(fmtRecipient),
    subject,
    html,
  };
  if (text) body.text = text;
  if (replyTo) body.reply_to = fmtRecipient(replyTo);
  if (cc?.length) body.cc = cc.map(fmtRecipient);
  if (bcc?.length) body.bcc = bcc.map(fmtRecipient);

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("[resend] network error:", e);
    return { ok: false, reason: "network_error" };
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[resend] API rejected:", res.status, detail.slice(0, 500));
    return { ok: false, reason: `http_${res.status}` };
  }

  const json = (await res.json().catch(() => null)) as { id?: string } | null;
  return { ok: true, id: json?.id ?? "unknown" };
}

export function getAdminEmail(): string {
  return process.env.ADMIN_NOTIFICATION_EMAIL || "sales@inter-bus.md";
}
