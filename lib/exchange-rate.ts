/**
 * EUR → MDL exchange rate, sourced from Banca Națională a Moldovei (BNM) — the
 * official rate publisher for the Moldovan leu — with a free fallback if BNM
 * is unreachable. The number returned is "how many MDL one EUR buys", e.g.
 * `19.5234`. Convert a MDL value to EUR with `mdl / rate`.
 *
 * BNM publishes one rate per business day. Cache for 6h so a fresh rate kicks
 * in within the same business morning without hammering BNM. fetch() is
 * deduped per request by Next.js.
 */

export type ExchangeRate = {
  /** MDL per 1 EUR */
  rate: number;
  /** Where the rate came from. */
  source: "bnm" | "er-api";
  /** ISO date the rate was published. */
  asOf: string;
};

const REVALIDATE_SECONDS = 6 * 60 * 60; // 6h

export async function getEurToMdlRate(): Promise<ExchangeRate> {
  const bnm = await fetchFromBnm();
  if (bnm) return bnm;
  const fallback = await fetchFromErApi();
  if (fallback) return fallback;
  // Hardcoded last-resort. ~12-month average to avoid catastrophically wrong
  // numbers if both APIs are down. Logged so we notice in dev.
  console.warn("[exchange-rate] both sources failed, using hardcoded fallback");
  return { rate: 19.5, source: "er-api", asOf: new Date().toISOString().slice(0, 10) };
}

async function fetchFromBnm(): Promise<ExchangeRate | null> {
  try {
    // BNM requires an explicit `date` query param — without one the endpoint
    // returns 404. Use today's date (server-side in MD timezone is close
    // enough; if BNM hasn't published yet for today it falls back below).
    const now = new Date();
    const dd = String(now.getUTCDate()).padStart(2, "0");
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = now.getUTCFullYear();
    const url = `https://www.bnm.md/en/official_exchange_rates?get_xml=1&date=${dd}.${mm}.${yyyy}`;
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["exchange-rate"] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const xml = await res.text();
    // Pull just the EUR <Valute> block, then Value and Nominal inside it.
    const block = xml.match(/<Valute[^>]*>[\s\S]*?<CharCode>\s*EUR\s*<\/CharCode>[\s\S]*?<\/Valute>/);
    if (!block) return null;
    const nominalMatch = block[0].match(/<Nominal>\s*(\d+)\s*<\/Nominal>/);
    const valueMatch = block[0].match(/<Value>\s*([\d.,]+)\s*<\/Value>/);
    if (!valueMatch) return null;
    const nominal = nominalMatch ? Number(nominalMatch[1]) : 1;
    const value = Number(valueMatch[1].replace(",", "."));
    if (!Number.isFinite(value) || value <= 0 || nominal <= 0) return null;
    const rate = value / nominal;
    const dateMatch = xml.match(/<ValCurs[^>]*Date="(\d{2})\.(\d{2})\.(\d{4})"/);
    const asOf = dateMatch
      ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`
      : new Date().toISOString().slice(0, 10);
    return { rate, source: "bnm", asOf };
  } catch (err) {
    console.warn("[exchange-rate] BNM fetch failed", err);
    return null;
  }
}

async function fetchFromErApi(): Promise<ExchangeRate | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["exchange-rate"] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    if (data.result !== "success") return null;
    const mdl = data.rates?.MDL;
    if (typeof mdl !== "number" || !Number.isFinite(mdl) || mdl <= 0) return null;
    const asOf = data.time_last_update_utc
      ? new Date(data.time_last_update_utc).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    return { rate: mdl, source: "er-api", asOf };
  } catch (err) {
    console.warn("[exchange-rate] er-api fetch failed", err);
    return null;
  }
}

/** Convert a MDL amount to EUR using the given EUR→MDL rate. */
export function mdlToEur(mdl: number, eurMdlRate: number): number {
  if (!Number.isFinite(mdl) || !Number.isFinite(eurMdlRate) || eurMdlRate <= 0) {
    return 0;
  }
  return mdl / eurMdlRate;
}
