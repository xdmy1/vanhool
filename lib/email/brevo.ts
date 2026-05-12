/**
 * Brevo (ex-Sendinblue) transactional email wrapper.
 * https://developers.brevo.com/reference/sendtransacemail
 */

export type BrevoRecipient = { email: string; name?: string };

export type BrevoConfig = {
  apiKey: string;
  fromEmail: string;
  fromName: string;
};

function getConfig(): BrevoConfig | null {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME || "Inter Bus";
  if (!apiKey || !fromEmail) return null;
  return { apiKey, fromEmail, fromName };
}

export function isBrevoConfigured(): boolean {
  return getConfig() !== null;
}

export async function sendBrevoEmail({
  to,
  subject,
  htmlContent,
  textContent,
  replyTo,
}: {
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: BrevoRecipient;
}): Promise<{ ok: true; messageId?: string } | { ok: false; reason: string }> {
  const cfg = getConfig();
  if (!cfg) return { ok: false, reason: "not_configured" };

  const body = {
    sender: { name: cfg.fromName, email: cfg.fromEmail },
    to,
    subject,
    htmlContent,
    textContent,
    replyTo: replyTo ?? undefined,
  };

  let res: Response;
  try {
    res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": cfg.apiKey,
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("[brevo] network error:", e);
    return { ok: false, reason: "network_error" };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[brevo] API rejected:", res.status, text.slice(0, 500));
    return { ok: false, reason: `http_${res.status}` };
  }

  const json = (await res.json().catch(() => null)) as
    | { messageId?: string }
    | null;
  return { ok: true, messageId: json?.messageId };
}
