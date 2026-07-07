import "server-only";

import crypto from "node:crypto";

/**
 * Signed one-click "mark as entered" links for the bookkeeper email. The
 * accountant isn't logged into the panel, so the link carries an HMAC over
 * `${kind}:${id}` — only a link we generated can flip the state. No expiry
 * (the accountant may act days later); the action is idempotent + harmless.
 */
export type AccountantDocKind = "invoice" | "purchase";

const SECRET =
  process.env.ACCOUNTANT_LINK_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "ib-accountant-link-fallback";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "https://inter-bus.md";

export function accountantEnteredToken(kind: AccountantDocKind, id: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(`${kind}:${id}`)
    .digest("hex")
    .slice(0, 40);
}

export function verifyAccountantEnteredToken(
  kind: AccountantDocKind,
  id: string,
  token: string,
): boolean {
  const expected = accountantEnteredToken(kind, id);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Absolute URL for the "Marchează ca INTRODUS" email button. */
export function accountantMarkEnteredUrl(kind: AccountantDocKind, id: string): string {
  const t = accountantEnteredToken(kind, id);
  return `${SITE_URL}/api/accountant/mark-entered?kind=${kind}&id=${encodeURIComponent(id)}&t=${t}`;
}
