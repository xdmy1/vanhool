/**
 * Web3Forms client — emails the shop's inbox whenever a public form is
 * submitted (contact / new order / B2B registration).
 *
 * IMPORTANT: must run in the browser. Web3Forms's free plan rejects
 * server-side submissions ("This method is not allowed. Use our API in
 * client side or contact support with server IP address — Pro plan
 * required"). The access key is intentionally NEXT_PUBLIC_* so the
 * client bundle can read it.
 *
 * Calls are fire-and-forget at the callsite: a failure here must NEVER
 * block the user-facing flow (we always save the order / message to
 * Supabase first via the server action, then trigger this notification).
 *
 * Docs: https://docs.web3forms.com/
 */

const ENDPOINT = "https://api.web3forms.com/submit";
const DEFAULT_FROM = "Inter Bus website";

export type Web3FormsPayload = {
  subject: string;
  message: string;
  fromName?: string;
  /** Sets the Reply-To header — lets the shop reply directly to the customer. */
  replyTo?: string;
  /** Extra labelled fields rendered in the notification email. */
  fields?: Record<string, string | number | undefined | null>;
};

export type Web3FormsResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_configured" | "http_error" | "api_error" | "exception";
      status?: number;
      message?: string;
    };

export function isWeb3FormsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY);
}

export async function sendWeb3FormsNotification(
  payload: Web3FormsPayload,
): Promise<Web3FormsResult> {
  const key = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  if (!key) {
    console.warn(
      "[web3forms] NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY missing — skipping notification",
    );
    return { ok: false, reason: "not_configured" };
  }

  // Flatten labelled fields into the top-level body so they each render as a
  // separate row in the notification email. Skip undefined / empty values.
  const flatFields: Record<string, string> = {};
  for (const [k, v] of Object.entries(payload.fields ?? {})) {
    if (v == null) continue;
    const s = typeof v === "string" ? v : String(v);
    if (!s.trim()) continue;
    flatFields[k] = s;
  }

  const body: Record<string, unknown> = {
    access_key: key,
    subject: payload.subject,
    from_name: payload.fromName ?? DEFAULT_FROM,
    message: payload.message,
    ...flatFields,
  };
  if (payload.replyTo) body.replyto = payload.replyTo;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[web3forms] non-2xx", res.status);
      return { ok: false, reason: "http_error", status: res.status };
    }
    const json = (await res.json()) as { success?: boolean; message?: string };
    if (!json.success) {
      console.error("[web3forms] api error", json);
      return { ok: false, reason: "api_error", message: json.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("[web3forms] exception", err);
    return {
      ok: false,
      reason: "exception",
      message: err instanceof Error ? err.message : "unknown",
    };
  }
}
