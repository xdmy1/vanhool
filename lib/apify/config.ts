import "server-only";

export type ApifyConfig = {
  token: string;
  baseUrl: string;
  tecdoc: {
    actorId: string;
    country: string;
    lang: string;
    timeoutSec: number;
    memoryMb: number | null;
    cacheTtlSec: number;
  };
};

export class ApifyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApifyConfigError";
  }
}

let cached: ApifyConfig | null = null;

export function getApifyConfig(): ApifyConfig {
  if (cached) return cached;

  const token = process.env.APIFY_TOKEN ?? "";
  const actorId = process.env.APIFY_TECDOC_ACTOR_ID ?? "";

  if (!token) throw new ApifyConfigError("APIFY_TOKEN is not set");
  if (!actorId) throw new ApifyConfigError("APIFY_TECDOC_ACTOR_ID is not set");

  const country = (process.env.APIFY_TECDOC_COUNTRY ?? "MD").toUpperCase();
  const lang = (process.env.APIFY_TECDOC_LANG ?? "ro").toLowerCase();
  const timeoutSec = clampInt(process.env.APIFY_TECDOC_TIMEOUT, 10, 300, 120);
  const memoryRaw = process.env.APIFY_TECDOC_MEMORY_MB?.trim();
  const memoryMb =
    memoryRaw && memoryRaw.length > 0 ? clampInt(memoryRaw, 128, 32768, 1024) : null;
  const cacheTtlSec = clampInt(
    process.env.APIFY_TECDOC_CACHE_TTL_SEC,
    60,
    60 * 60 * 24 * 30,
    60 * 60 * 24 * 7,
  );

  cached = {
    token,
    baseUrl: "https://api.apify.com/v2",
    tecdoc: { actorId, country, lang, timeoutSec, memoryMb, cacheTtlSec },
  };
  return cached;
}

export function isApifyConfigured(): boolean {
  return !!process.env.APIFY_TOKEN && !!process.env.APIFY_TECDOC_ACTOR_ID;
}

function clampInt(
  raw: string | undefined,
  min: number,
  max: number,
  fallback: number,
): number {
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}
