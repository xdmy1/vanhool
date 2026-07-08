import "server-only";

import crypto from "node:crypto";

import type {
  MaibCallbackBody,
  MaibPayInfo,
  MaibPayInput,
  MaibPayResult,
} from "./types";

/**
 * Thin server-only client for the maib e-commerce API. Mirrors the official
 * PHP SDK (maib-ecomm/maib-sdk-php): Bearer token from /generate-token, direct
 * /pay, /pay-info, /refund, and the exact callback signature algorithm.
 */

const BASE_URL = (
  process.env.MAIB_BASE_URL || "https://api.maibmerchants.md/v1/"
).replace(/\/*$/, "/");
const PROJECT_ID = process.env.MAIB_PROJECT_ID || "";
const PROJECT_SECRET = process.env.MAIB_PROJECT_SECRET || "";
const SIGNATURE_KEY = process.env.MAIB_SIGNATURE_KEY || "";

/** True when the maib credentials are present (gate the card option on this). */
export function maibConfigured(): boolean {
  return Boolean(PROJECT_ID && PROJECT_SECRET && SIGNATURE_KEY);
}

type TokenCache = {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
  refreshExpiresAt: number;
};
// Per-lambda-instance cache — safe on serverless (cold starts just re-auth).
let tokenCache: TokenCache | null = null;

async function apiFetch(
  path: string,
  opts: { method: string; body?: unknown; token?: string },
): Promise<Record<string, unknown>> {
  const res = await fetch(BASE_URL + path, {
    method: opts.method,
    headers: {
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : null;
  } catch {
    json = null;
  }
  const errors = json?.errors as Array<{ errorMessage?: string }> | undefined;
  if (!res.ok || json?.ok === false || (errors && errors.length > 0)) {
    const msg = errors?.[0]?.errorMessage || `HTTP ${res.status}`;
    throw new Error(`maib API error (${path}): ${msg}`);
  }
  // Responses are shaped { ok, result: {...} } — unwrap result.
  return (json?.result as Record<string, unknown>) ?? json ?? {};
}

async function generateToken(
  payload: Record<string, string>,
): Promise<TokenCache> {
  const r = await apiFetch("generate-token", { method: "POST", body: payload });
  const now = Date.now();
  return {
    accessToken: String(r.accessToken ?? ""),
    expiresAt: now + (Number(r.expiresIn) || 0) * 1000,
    refreshToken: String(r.refreshToken ?? ""),
    refreshExpiresAt: now + (Number(r.refreshExpiresIn) || 0) * 1000,
  };
}

/** Cached Bearer access token; refreshes with the refresh token when possible. */
export async function getToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 30_000) {
    return tokenCache.accessToken;
  }
  if (tokenCache && tokenCache.refreshExpiresAt > now + 30_000) {
    try {
      tokenCache = await generateToken({ refreshToken: tokenCache.refreshToken });
      return tokenCache.accessToken;
    } catch {
      // fall through to a full re-auth
    }
  }
  tokenCache = await generateToken({
    projectId: PROJECT_ID,
    projectSecret: PROJECT_SECRET,
  });
  return tokenCache.accessToken;
}

/** POST /pay — initiate a direct payment. Returns payUrl to redirect the client. */
export async function createPayment(
  input: MaibPayInput,
): Promise<MaibPayResult> {
  const token = await getToken();
  const body: MaibPayInput = {
    ...input,
    amount: Number(input.amount.toFixed(2)),
    ...(input.delivery != null
      ? { delivery: Number(input.delivery.toFixed(2)) }
      : {}),
  };
  const r = await apiFetch("pay", { method: "POST", body, token });
  return {
    payId: String(r.payId ?? ""),
    payUrl: String(r.payUrl ?? ""),
    orderId: r.orderId != null ? String(r.orderId) : undefined,
  };
}

/** GET /pay-info/{payId} — authoritative status (verify before trusting redirects). */
export async function getPaymentInfo(payId: string): Promise<MaibPayInfo> {
  const token = await getToken();
  const r = await apiFetch(`pay-info/${encodeURIComponent(payId)}`, {
    method: "GET",
    token,
  });
  return r as MaibPayInfo;
}

/** POST /refund — full (no amount) or partial refund. */
export async function refund(
  payId: string,
  refundAmount?: number,
): Promise<MaibPayInfo> {
  const token = await getToken();
  const body: Record<string, unknown> = { payId };
  if (refundAmount != null) body.refundAmount = Number(refundAmount.toFixed(2));
  const r = await apiFetch("refund", { method: "POST", body, token });
  return r as MaibPayInfo;
}

// ---------------------------------------------------------------------------
// Callback signature validation — EXACT mirror of the SDK's callbackUrl.php:
//   sortByKeyRecursive(result) → append SIGNATURE_KEY → implode(':') →
//   base64(sha256(signString)). String coercion matches PHP (bool → "1"/"").

function phpStringify(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "1" : "";
  return String(v);
}

function flattenSortedValues(value: unknown): string[] {
  if (value === null || typeof value !== "object") return [phpStringify(value)];
  const obj = value as Record<string, unknown>;
  const out: string[] = [];
  for (const key of Object.keys(obj).sort()) {
    const v = obj[key];
    if (v !== null && typeof v === "object") out.push(...flattenSortedValues(v));
    else out.push(phpStringify(v));
  }
  return out;
}

/** Compute the callback signature for a `result` object. */
export function computeSignature(result: Record<string, unknown>): string {
  const values = flattenSortedValues(result);
  values.push(SIGNATURE_KEY);
  return crypto.createHash("sha256").update(values.join(":"), "utf8").digest("base64");
}

/** Validate the signature maib sent on the Callback URL (timing-safe). */
export function verifyCallbackSignature(body: Partial<MaibCallbackBody>): boolean {
  if (!body || !body.signature || !body.result || !SIGNATURE_KEY) return false;
  const expected = computeSignature(body.result as Record<string, unknown>);
  const a = Buffer.from(expected);
  const b = Buffer.from(body.signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
