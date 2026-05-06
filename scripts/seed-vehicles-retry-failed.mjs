#!/usr/bin/env node
/**
 * Retry script for brands that failed the main scraper.
 *
 * For each brand:
 * 1. wbsearchentities API → top candidate Q-ids
 * 2. For each candidate, count models manufactured
 * 3. Pick winner (most models > 5)
 * 4. Fetch full model list with the right Q-id
 * 5. Append to supabase-vehicles-seed-wikidata.sql
 *
 * Generous delays — Wikidata is moody.
 */

import { appendFileSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "supabase-vehicles-seed-wikidata.sql");

const SPARQL = "https://query.wikidata.org/sparql";
const SEARCH = "https://www.wikidata.org/w/api.php";
const UA = "InterBus-vehicle-seeder/1.1 (https://interbus.md/)";

// Brands that failed in the main run, with name to search and country hint.
const FAILED = [
  { slug: "mercedes-benz", search: "Mercedes-Benz", country: "Germany" },
  { slug: "skoda",         search: "Škoda Auto",   country: "Czech Republic" },
  { slug: "opel",          search: "Opel",          country: "Germany" },
  { slug: "renault",       search: "Renault",       country: "France" },
  { slug: "peugeot",       search: "Peugeot",       country: "France" },
  { slug: "toyota",        search: "Toyota",        country: "Japan" },
  { slug: "suzuki",        search: "Suzuki",        country: "Japan" },
  { slug: "nissan",        search: "Nissan",        country: "Japan" },
  { slug: "subaru",        search: "Subaru",        country: "Japan" },
  { slug: "saab",          search: "Saab Automobile", country: "Sweden" },
  { slug: "mini",          search: "Mini (marque)",  country: "United Kingdom" },
  { slug: "smart",         search: "Smart (automobile)", country: "Germany" },
  { slug: "dacia",         search: "Automobile Dacia",   country: "Romania" },
  { slug: "lada",          search: "Lada",          country: "Russia" },
  { slug: "alfa-romeo",    search: "Alfa Romeo",    country: "Italy" },
  { slug: "lancia",        search: "Lancia",        country: "Italy" },
  { slug: "land-rover",    search: "Land Rover",    country: "United Kingdom" },
  { slug: "jaguar",        search: "Jaguar Cars",   country: "United Kingdom" },
  { slug: "jeep",          search: "Jeep",          country: "United States" },
];

const DELAY_BETWEEN_BRANDS_MS = 5000;
const TIMEOUT_MS = 90_000;
const MAX_RETRIES = 4;

async function fetchJson(url, label, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/sparql-results+json,application/json",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 100)}`);
    }
    return await res.json();
  } catch (e) {
    if (attempt < MAX_RETRIES) {
      const wait = 4000 * attempt;
      process.stderr.write(`[${label} retry ${attempt}, +${wait}ms] `);
      await new Promise((r) => setTimeout(r, wait));
      return fetchJson(url, label, attempt + 1);
    }
    throw e;
  }
}

async function searchCandidates(query) {
  const url =
    `${SEARCH}?action=wbsearchentities&search=${encodeURIComponent(query)}` +
    `&language=en&type=item&limit=10&format=json&origin=*`;
  const json = await fetchJson(url, "search");
  return (json.search ?? []).map((s) => ({ id: s.id, label: s.label, desc: s.description ?? "" }));
}

async function countModels(qid) {
  const sparql = `SELECT (COUNT(DISTINCT ?m) AS ?count) WHERE { ?m wdt:P176 wd:${qid} }`;
  const url = `${SPARQL}?query=${encodeURIComponent(sparql)}&format=json`;
  const json = await fetchJson(url, "count");
  return parseInt(json.results.bindings[0]?.count?.value ?? "0", 10);
}

const FETCH_QUERY = (qid) => `
SELECT ?model ?modelLabel ?typeLabel ?inception ?dissolved WHERE {
  ?model wdt:P176 wd:${qid} .
  ?model wdt:P31 ?type .
  OPTIONAL { ?model wdt:P571 ?inception . }
  OPTIONAL { ?model wdt:P576 ?dissolved . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 2000
`;

async function fetchModels(qid) {
  const url = `${SPARQL}?query=${encodeURIComponent(FETCH_QUERY(qid))}&format=json`;
  const json = await fetchJson(url, "fetch");
  return json.results.bindings;
}

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeSql(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

const BODY_TYPE_MAP = {
  sedan: "sedan",
  saloon: "sedan",
  hatchback: "hatchback",
  liftback: "hatchback",
  coupe: "coupe",
  "coupé": "coupe",
  convertible: "convertible",
  cabriolet: "convertible",
  roadster: "roadster",
  estate: "estate",
  "station wagon": "estate",
  wagon: "estate",
  "sport utility vehicle": "suv",
  suv: "suv",
  crossover: "suv",
  pickup: "pickup",
  "pickup truck": "pickup",
  van: "van",
  minivan: "mpv",
  mpv: "mpv",
};

function normalizeBody(label) {
  if (!label) return null;
  const lc = label.toLowerCase().trim();
  if (BODY_TYPE_MAP[lc]) return BODY_TYPE_MAP[lc];
  for (const [k, v] of Object.entries(BODY_TYPE_MAP)) {
    if (lc.includes(k)) return v;
  }
  return null;
}

function parseYear(iso) {
  if (!iso) return null;
  const m = iso.match(/(-?\d{1,4})-/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  return isNaN(y) || y < 1900 || y > 2030 ? null : y;
}

function isValidModelLabel(label) {
  if (!label) return false;
  if (/^Q\d+$/.test(label)) return false;
  if (label.length < 2 || label.length > 80) return false;
  if (/^list of\b/i.test(label)) return false;
  if (
    /\bengine\b|\bgearbox\b|\bsuspension\b|\btransmission\b|\bplant\b|\bcompany\b|\bfactory\b|\bbrand\b|\bsubsidiary\b|\bracing\b|\bcorporation\b|\bgroup\b/i.test(
      label,
    )
  )
    return false;
  return true;
}

const CAR_TYPE_HINTS = [
  "automobile",
  "car",
  "motor vehicle",
  "vehicle model",
  "supermini",
  "compact",
  "mid-size",
  "executive",
  "sport",
  "luxury",
  "sport utility",
  "crossover",
  "hatchback",
  "sedan",
  "saloon",
  "coupe",
  "coupé",
  "estate",
  "station wagon",
  "minivan",
  "mpv",
  "pickup",
  "convertible",
  "cabriolet",
  "roadster",
  "limousine",
  "kei",
  "fastback",
  "model series",
  "van",
];

function isCarType(t) {
  if (!t) return false;
  const lc = t.toLowerCase();
  if (/^q\d+$/.test(lc)) return false;
  return CAR_TYPE_HINTS.some((h) => lc.includes(h));
}

function emitSql(slug, models) {
  const rows = [];
  for (const [s, d] of models) {
    rows.push(
      `    (${escapeSql(s)}, ${escapeSql(d.name)}, ${d.year_from ?? "null"}, ${d.year_to ?? "null"}, ${escapeSql(d.body_type)})`,
    );
  }
  return [
    `-- ${slug}: ${models.size} models from Wikidata (retry pass)`,
    `with mk as (select id from public.vehicle_makes where slug = '${slug}')`,
    "insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)",
    "select mk.id, m.slug, m.name, m.yf, m.yt, m.body",
    "from mk, (values",
    rows.join(",\n"),
    ") as m(slug, name, yf, yt, body)",
    "on conflict (make_id, slug) do nothing;",
    "",
  ].join("\n");
}

async function main() {
  appendFileSync(OUT_PATH, "\n-- =============================================================================\n");
  appendFileSync(OUT_PATH, "-- RETRY PASS — auto-resolved Q-ids from wbsearchentities + count\n");
  appendFileSync(OUT_PATH, `-- ${new Date().toISOString()}\n`);
  appendFileSync(OUT_PATH, "-- =============================================================================\n\n");

  const summary = [];

  for (const brand of FAILED) {
    process.stderr.write(`\n[${brand.slug}] searching "${brand.search}"... `);

    let candidates;
    try {
      candidates = await searchCandidates(brand.search);
    } catch (e) {
      process.stderr.write(`SEARCH FAILED ${e.message}\n`);
      summary.push({ slug: brand.slug, error: "search failed" });
      continue;
    }
    if (candidates.length === 0) {
      process.stderr.write("no candidates\n");
      summary.push({ slug: brand.slug, error: "no candidates" });
      continue;
    }

    process.stderr.write(`${candidates.length} candidates\n`);
    await new Promise((r) => setTimeout(r, 1500));

    let bestQid = null;
    let bestCount = 0;
    let bestLabel = null;
    for (const c of candidates.slice(0, 6)) {
      try {
        const count = await countModels(c.id);
        process.stderr.write(`  ${c.id.padEnd(10)} ${String(count).padStart(5)}  ${c.label}\n`);
        if (count > bestCount) {
          bestCount = count;
          bestQid = c.id;
          bestLabel = c.label;
        }
        await new Promise((r) => setTimeout(r, 1500));
      } catch (e) {
        process.stderr.write(`  ${c.id.padEnd(10)} ERROR  ${e.message.slice(0, 50)}\n`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    if (!bestQid || bestCount < 5) {
      process.stderr.write(`  ↳ no winner (best ${bestCount} models)\n`);
      summary.push({ slug: brand.slug, error: `best=${bestCount}` });
      continue;
    }

    process.stderr.write(`  ↳ WINNER ${bestQid} (${bestLabel}) with ${bestCount} models\n`);

    let bindings;
    try {
      bindings = await fetchModels(bestQid);
    } catch (e) {
      process.stderr.write(`  fetch failed: ${e.message}\n`);
      summary.push({ slug: brand.slug, error: "fetch failed", qid: bestQid });
      continue;
    }

    const seen = new Map();
    for (const b of bindings) {
      const label = b.modelLabel?.value;
      const typeLabel = b.typeLabel?.value;
      if (!isValidModelLabel(label)) continue;
      if (!isCarType(typeLabel)) continue;
      const slug = slugify(label);
      if (!slug) continue;
      const yearFrom = parseYear(b.inception?.value);
      const yearTo = parseYear(b.dissolved?.value);
      const body = normalizeBody(typeLabel);
      const existing = seen.get(slug);
      if (!existing) {
        seen.set(slug, { name: label, year_from: yearFrom, year_to: yearTo, body_type: body });
      } else {
        if (yearFrom && !existing.year_from) existing.year_from = yearFrom;
        if (yearTo && !existing.year_to) existing.year_to = yearTo;
        if (body && !existing.body_type) existing.body_type = body;
      }
    }

    if (seen.size === 0) {
      process.stderr.write(`  ↳ 0 usable after filter (raw ${bindings.length})\n`);
      summary.push({ slug: brand.slug, error: "all filtered", qid: bestQid });
      continue;
    }

    process.stderr.write(`  ↳ writing ${seen.size} models\n`);
    appendFileSync(OUT_PATH, emitSql(brand.slug, seen) + "\n");
    summary.push({ slug: brand.slug, count: seen.size, qid: bestQid });

    await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BRANDS_MS));
  }

  process.stderr.write("\n" + "=".repeat(70) + "\n");
  process.stderr.write("RETRY SUMMARY\n");
  process.stderr.write("=".repeat(70) + "\n");
  let total = 0;
  for (const s of summary) {
    process.stderr.write(
      `  ${s.slug.padEnd(15)} ${s.qid ? s.qid.padEnd(10) : "—".padEnd(10)} ${
        s.count ? String(s.count).padStart(5) + " models" : "FAIL: " + s.error
      }\n`,
    );
    if (s.count) total += s.count;
  }
  process.stderr.write(`\nTOTAL added in retry pass: ${total} models\n`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
