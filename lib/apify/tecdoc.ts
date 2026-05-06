import "server-only";

import { createClient } from "@/lib/supabase/server";
import { runActorSync, ApifyError } from "./client";
import { getApifyConfig, isApifyConfigured } from "./config";

/**
 * The normalised shape we use across the app — independent of which Apify
 * TecDoc actor is configured. Mappers below try multiple field names because
 * different actors expose data slightly differently.
 */
export type TecdocPart = {
  /** TecDoc-internal ID, when the actor exposes it. */
  tecdocId: string | null;
  /** The part code as supplied to TecDoc (e.g. "0986494296"). */
  partCode: string;
  brand: string | null;
  manufacturerId: string | null;
  /** Most-relevant short description per locale fallback chain. */
  name: string | null;
  /** Long description / catalogue text. */
  description: string | null;
  /** Image URLs in display order. */
  images: string[];
  /** Spec key/value pairs (e.g. {Width: "100mm"}). */
  specs: { key: string; value: string }[];
  /** OEM cross-reference codes ("alternative" article numbers). */
  oemCodes: string[];
  /** Vehicles this part fits, in normalised form. */
  vehicles: TecdocVehicle[];
  /** Optional category hint from TecDoc (used to suggest a local category). */
  categoryHint: string | null;
  /** Estimated weight (kg) and dimensions (mm) when available. */
  weightKg: number | null;
  widthMm: number | null;
  heightMm: number | null;
  /** TecDoc generic article number, when present. */
  genericArticleNumber: string | null;
  /** Original JSON from Apify, kept for debugging. */
  raw: unknown;
};

export type TecdocVehicle = {
  manufacturer: string | null;
  model: string | null;
  type: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  engineCode: string | null;
  power: string | null;
};

export type TecdocLookupResult = {
  source: "apify" | "cache";
  fetchedAt: string;
  parts: TecdocPart[];
  meta: {
    runId: string | null;
    actorId: string;
    computeUnits: number | null;
  };
};

const CACHE_BYPASS_LIMIT_PER_MIN = 30; // soft guard

export async function lookupByPartCode(
  rawCode: string,
  opts: { fresh?: boolean } = {},
): Promise<TecdocLookupResult> {
  if (!isApifyConfigured()) {
    throw new ApifyError("Apify TecDoc is not configured", 0);
  }
  const cfg = getApifyConfig();
  const code = rawCode.trim();
  if (!code) throw new ApifyError("Empty part code", 400);

  const cacheKey = buildCacheKey({
    type: "part_code",
    value: code,
    country: cfg.tecdoc.country,
    lang: cfg.tecdoc.lang,
  });

  // Try cache first unless caller opts out.
  if (!opts.fresh) {
    const cached = await readCache(cacheKey);
    if (cached) {
      return {
        source: "cache",
        fetchedAt: cached.fetched_at,
        parts: (cached.response as unknown[])
          .map((raw) => mapItemToPart(raw, code))
          .filter((p): p is TecdocPart => p !== null),
        meta: {
          runId: cached.run_id,
          actorId: cached.actor_id ?? cfg.tecdoc.actorId,
          computeUnits: Number(cached.compute_units ?? 0) || null,
        },
      };
    }
  }

  const input = buildActorInput({
    type: "part_code",
    value: code,
    country: cfg.tecdoc.country,
    lang: cfg.tecdoc.lang,
  });

  const run = await runActorSync<unknown>({
    actorId: cfg.tecdoc.actorId,
    input,
    timeoutSec: cfg.tecdoc.timeoutSec,
    memoryMb: cfg.tecdoc.memoryMb,
  });

  const items = run.items;
  const parts = items
    .map((raw) => mapItemToPart(raw, code))
    .filter((p): p is TecdocPart => p !== null);

  // Write through to cache (best-effort — ignore failures).
  await writeCache({
    cacheKey,
    queryType: "part_code",
    queryValue: code,
    country: cfg.tecdoc.country,
    lang: cfg.tecdoc.lang,
    response: items,
    actorId: run.meta.actorId,
    runId: run.meta.runId,
    computeUnits: run.meta.computeUnits,
    ttlSec: cfg.tecdoc.cacheTtlSec,
  });

  return {
    source: "apify",
    fetchedAt: new Date().toISOString(),
    parts,
    meta: run.meta,
  };
}

export async function lookupByOem(
  oem: string,
  opts: { fresh?: boolean } = {},
): Promise<TecdocLookupResult> {
  if (!isApifyConfigured()) {
    throw new ApifyError("Apify TecDoc is not configured", 0);
  }
  const cfg = getApifyConfig();
  const code = oem.trim();
  if (!code) throw new ApifyError("Empty OEM code", 400);

  const cacheKey = buildCacheKey({
    type: "oem",
    value: code,
    country: cfg.tecdoc.country,
    lang: cfg.tecdoc.lang,
  });

  if (!opts.fresh) {
    const cached = await readCache(cacheKey);
    if (cached) {
      return {
        source: "cache",
        fetchedAt: cached.fetched_at,
        parts: (cached.response as unknown[])
          .map((raw) => mapItemToPart(raw, code))
          .filter((p): p is TecdocPart => p !== null),
        meta: {
          runId: cached.run_id,
          actorId: cached.actor_id ?? cfg.tecdoc.actorId,
          computeUnits: Number(cached.compute_units ?? 0) || null,
        },
      };
    }
  }

  const run = await runActorSync<unknown>({
    actorId: cfg.tecdoc.actorId,
    input: buildActorInput({
      type: "oem",
      value: code,
      country: cfg.tecdoc.country,
      lang: cfg.tecdoc.lang,
    }),
    timeoutSec: cfg.tecdoc.timeoutSec,
    memoryMb: cfg.tecdoc.memoryMb,
  });

  const parts = run.items
    .map((raw) => mapItemToPart(raw, code))
    .filter((p): p is TecdocPart => p !== null);

  await writeCache({
    cacheKey,
    queryType: "oem",
    queryValue: code,
    country: cfg.tecdoc.country,
    lang: cfg.tecdoc.lang,
    response: run.items,
    actorId: run.meta.actorId,
    runId: run.meta.runId,
    computeUnits: run.meta.computeUnits,
    ttlSec: cfg.tecdoc.cacheTtlSec,
  });

  return {
    source: "apify",
    fetchedAt: new Date().toISOString(),
    parts,
    meta: run.meta,
  };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function buildCacheKey(parts: {
  type: string;
  value: string;
  country: string;
  lang: string;
}): string {
  return `${parts.type}:${parts.value.toUpperCase()}:${parts.country}:${parts.lang}`;
}

/**
 * Build the actor input. Different Apify TecDoc actors accept different
 * input field names — we send the most common keys at once and let the actor
 * pick what it understands. The unused fields are ignored.
 */
function buildActorInput(args: {
  type: "part_code" | "oem" | "vehicle";
  value: string;
  country: string;
  lang: string;
}): Record<string, unknown> {
  const base: Record<string, unknown> = {
    country: args.country,
    countryId: args.country,
    countryCode: args.country,
    language: args.lang,
    lang: args.lang,
    languageCode: args.lang,
    maxItems: 25,
    proxyConfiguration: { useApifyProxy: true },
  };
  if (args.type === "part_code") {
    base.search = args.value;
    base.query = args.value;
    base.partNumber = args.value;
    base.articleNumber = args.value;
    base.partCodes = [args.value];
    base.searches = [args.value];
  } else if (args.type === "oem") {
    base.oem = args.value;
    base.oemNumber = args.value;
    base.oemCode = args.value;
    base.search = args.value;
    base.query = args.value;
  }
  return base;
}

type CacheRow = {
  cache_key: string;
  query_type: string;
  query_value: string;
  country: string | null;
  lang: string | null;
  response: unknown;
  result_count: number;
  actor_id: string | null;
  run_id: string | null;
  compute_units: number | null;
  fetched_at: string;
  expires_at: string | null;
};

async function readCache(cacheKey: string): Promise<CacheRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tecdoc_cache")
    .select(
      "cache_key, query_type, query_value, country, lang, response, result_count, actor_id, run_id, compute_units, fetched_at, expires_at",
    )
    .eq("cache_key", cacheKey)
    .maybeSingle();
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return null;
  }
  return data as CacheRow;
}

async function writeCache(args: {
  cacheKey: string;
  queryType: "part_code" | "oem" | "vehicle";
  queryValue: string;
  country: string;
  lang: string;
  response: unknown[];
  actorId: string;
  runId: string | null;
  computeUnits: number | null;
  ttlSec: number;
}): Promise<void> {
  try {
    const supabase = await createClient();
    const expiresAt = new Date(Date.now() + args.ttlSec * 1000).toISOString();
    await supabase
      .from("tecdoc_cache")
      .upsert(
        {
          cache_key: args.cacheKey,
          query_type: args.queryType,
          query_value: args.queryValue,
          country: args.country,
          lang: args.lang,
          response: args.response as never,
          result_count: args.response.length,
          actor_id: args.actorId,
          run_id: args.runId,
          compute_units: args.computeUnits,
          fetched_at: new Date().toISOString(),
          expires_at: expiresAt,
        },
        { onConflict: "cache_key" },
      );
  } catch {
    // best-effort: cache write failures shouldn't break the lookup
  }
}

/**
 * Map an Apify dataset item to our normalised TecdocPart.
 * Fields are read defensively — different actors emit different shapes.
 */
function mapItemToPart(raw: unknown, fallbackCode: string): TecdocPart | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const partCode = pickStr(
    r,
    "articleNumber",
    "partNumber",
    "code",
    "articleNo",
    "article_no",
    "partCode",
    "part_code",
    "supplierArticleNumber",
  ) ?? fallbackCode;

  const brand = pickStr(r, "brand", "manufacturer", "manufacturerName", "supplierName", "brandName");

  const name =
    pickStr(r, "name", "title", "productName", "shortDescription", "label", "description") ??
    pickStr(r, "description") ??
    null;

  const description = pickStr(
    r,
    "description",
    "longDescription",
    "fullDescription",
    "additionalDescription",
    "info",
  );

  const images = pickImages(r);
  const specs = pickSpecs(r);
  const oemCodes = pickOemCodes(r);
  const vehicles = pickVehicles(r);

  const tecdocId = pickStr(
    r,
    "tecdocId",
    "tecdoc_id",
    "articleId",
    "id",
    "supplierArticleId",
  );

  const manufacturerId = pickStr(
    r,
    "manufacturerId",
    "supplierId",
    "brandId",
    "manufacturer_id",
  );

  const categoryHint = pickStr(
    r,
    "categoryName",
    "category",
    "groupName",
    "productGroup",
    "assemblyGroupName",
  );

  const genericArticleNumber = pickStr(
    r,
    "genericArticleNumber",
    "genericArticleId",
    "ganId",
  );

  return {
    tecdocId,
    partCode,
    brand,
    manufacturerId,
    name,
    description,
    images,
    specs,
    oemCodes,
    vehicles,
    categoryHint,
    weightKg: pickNumber(r, "weight", "weightKg", "weight_kg"),
    widthMm: pickNumber(r, "width", "widthMm", "width_mm"),
    heightMm: pickNumber(r, "height", "heightMm", "height_mm"),
    genericArticleNumber,
    raw,
  };
}

function pickStr(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

function pickNumber(obj: Record<string, unknown>, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v.replace(",", "."));
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function pickImages(obj: Record<string, unknown>): string[] {
  const out = new Set<string>();
  const candidates: unknown[] = [
    obj.images,
    obj.imageUrls,
    obj.image_urls,
    obj.pictures,
    obj.media,
    obj.gallery,
  ];
  for (const cand of candidates) {
    if (Array.isArray(cand)) {
      for (const item of cand) {
        if (typeof item === "string" && /^https?:\/\//.test(item)) {
          out.add(item);
        } else if (item && typeof item === "object") {
          const o = item as Record<string, unknown>;
          const u =
            pickStr(o, "url", "src", "href", "imageUrl", "image_url", "fullSize") ?? null;
          if (u && /^https?:\/\//.test(u)) out.add(u);
        }
      }
    }
  }
  // Single-image fields
  const single = pickStr(obj, "image", "imageUrl", "image_url", "thumbnail");
  if (single && /^https?:\/\//.test(single)) out.add(single);
  return [...out].slice(0, 12);
}

function pickSpecs(obj: Record<string, unknown>): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = [];
  const candidates: unknown[] = [
    obj.specifications,
    obj.specs,
    obj.attributes,
    obj.properties,
    obj.criteria,
    obj.articleCriteria,
  ];
  for (const cand of candidates) {
    if (Array.isArray(cand)) {
      for (const item of cand) {
        if (item && typeof item === "object") {
          const o = item as Record<string, unknown>;
          const key =
            pickStr(o, "name", "key", "label", "criteriaName", "title") ?? null;
          const value =
            pickStr(o, "value", "rawValue", "displayValue", "formattedValue", "text") ?? null;
          if (key && value) out.push({ key, value });
        }
      }
      if (out.length > 0) return out.slice(0, 32);
    } else if (cand && typeof cand === "object") {
      // object with key/value entries
      for (const [k, v] of Object.entries(cand as Record<string, unknown>)) {
        if (typeof v === "string" || typeof v === "number") {
          out.push({ key: k, value: String(v) });
        }
      }
      if (out.length > 0) return out.slice(0, 32);
    }
  }
  return out;
}

function pickOemCodes(obj: Record<string, unknown>): string[] {
  const out = new Set<string>();
  const candidates: unknown[] = [
    obj.oem,
    obj.oemNumbers,
    obj.oemCodes,
    obj.oem_numbers,
    obj.crossReferences,
    obj.cross_references,
    obj.alternativeNumbers,
  ];
  for (const cand of candidates) {
    if (Array.isArray(cand)) {
      for (const item of cand) {
        if (typeof item === "string" && item.trim().length > 0) {
          out.add(item.trim().toUpperCase());
        } else if (item && typeof item === "object") {
          const o = item as Record<string, unknown>;
          const v = pickStr(o, "oemNumber", "number", "code", "articleNumber");
          if (v) out.add(v.toUpperCase());
        }
      }
    } else if (typeof cand === "string") {
      out.add(cand.toUpperCase());
    }
  }
  return [...out].slice(0, 50);
}

function pickVehicles(obj: Record<string, unknown>): TecdocVehicle[] {
  const out: TecdocVehicle[] = [];
  const candidates: unknown[] = [
    obj.vehicles,
    obj.compatibility,
    obj.linkages,
    obj.linkedVehicles,
    obj.fitments,
  ];
  for (const cand of candidates) {
    if (!Array.isArray(cand)) continue;
    for (const item of cand) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      out.push({
        manufacturer: pickStr(o, "manufacturer", "make", "brand"),
        model: pickStr(o, "model", "modelName", "name"),
        type: pickStr(o, "type", "typeName", "modelType", "trim"),
        yearFrom: pickInt(o, "yearFrom", "year_from", "from"),
        yearTo: pickInt(o, "yearTo", "year_to", "to"),
        engineCode: pickStr(o, "engineCode", "engine", "engine_code"),
        power: pickStr(o, "power", "kw", "hp", "kwHp"),
      });
    }
    if (out.length > 0) return out.slice(0, 200);
  }
  return out;
}

function pickInt(obj: Record<string, unknown>, ...keys: string[]): number | null {
  const n = pickNumber(obj, ...keys);
  if (n === null) return null;
  return Math.trunc(n);
}
