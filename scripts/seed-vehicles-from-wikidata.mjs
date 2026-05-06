#!/usr/bin/env node
/**
 * Vehicle taxonomy seed generator — Wikidata source.
 *
 * Pulls car models for each known make from Wikidata SPARQL endpoint, then
 * writes them as idempotent SQL INSERTs to supabase-vehicles-seed-wikidata.sql.
 *
 * Run:   node scripts/seed-vehicles-from-wikidata.mjs
 * Then:  paste supabase-vehicles-seed-wikidata.sql in Supabase SQL Editor
 *
 * Models only — engines are not in Wikidata structured data reliably enough.
 * Use Apify TecDoc for engine variants.
 */

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "supabase-vehicles-seed-wikidata.sql");

const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";
const USER_AGENT =
  "InterBus-vehicle-seeder/1.0 (https://interbus.md/) Node/" + process.version;

/**
 * Maps the make slug in our DB to its Wikidata Q-id (the manufacturer entity).
 * Adding a new brand: find on wikidata.org → click "concept URI" → copy Q-id.
 */
const MAKES = [
  { slug: "audi",          name: "Audi",          qid: "Q23317"  },
  { slug: "bmw",           name: "BMW",           qid: "Q26678"  },
  { slug: "mercedes-benz", name: "Mercedes-Benz", qid: "Q36008"  },
  { slug: "volkswagen",    name: "Volkswagen",    qid: "Q246"    },
  { slug: "skoda",         name: "Škoda",         qid: "Q29637"  },
  { slug: "opel",          name: "Opel",          qid: "Q40570"  },
  { slug: "ford",          name: "Ford",          qid: "Q44294"  },
  { slug: "renault",       name: "Renault",       qid: "Q35339"  },
  { slug: "peugeot",       name: "Peugeot",       qid: "Q6742"   },
  { slug: "citroen",       name: "Citroën",       qid: "Q6746"   },
  { slug: "toyota",        name: "Toyota",        qid: "Q53268"  },
  { slug: "honda",         name: "Honda",         qid: "Q9584"   },
  { slug: "nissan",        name: "Nissan",        qid: "Q35055"  },
  { slug: "mazda",         name: "Mazda",         qid: "Q35996"  },
  { slug: "mitsubishi",    name: "Mitsubishi",    qid: "Q36033"  },
  { slug: "subaru",        name: "Subaru",        qid: "Q35958"  },
  { slug: "suzuki",        name: "Suzuki",        qid: "Q181642" },
  { slug: "hyundai",       name: "Hyundai",       qid: "Q55931"  },
  { slug: "kia",           name: "Kia",           qid: "Q35349"  },
  { slug: "chevrolet",     name: "Chevrolet",     qid: "Q29570"  },
  { slug: "volvo",         name: "Volvo Cars",    qid: "Q215293" },
  { slug: "saab",          name: "Saab",          qid: "Q47018"  },
  { slug: "mini",          name: "Mini",          qid: "Q201738" },
  { slug: "smart",         name: "Smart",         qid: "Q221881" },
  { slug: "dacia",         name: "Dacia",         qid: "Q200260" },
  { slug: "lada",          name: "Lada",          qid: "Q482647" },
  { slug: "fiat",          name: "Fiat",          qid: "Q27597"  },
  { slug: "alfa-romeo",    name: "Alfa Romeo",    qid: "Q47172"  },
  { slug: "lancia",        name: "Lancia",        qid: "Q47086"  },
  { slug: "seat",          name: "SEAT",          qid: "Q188217" },
  { slug: "land-rover",    name: "Land Rover",    qid: "Q142158" },
  { slug: "jaguar",        name: "Jaguar",        qid: "Q26321"  },
  { slug: "porsche",       name: "Porsche",       qid: "Q40993"  },
  { slug: "jeep",          name: "Jeep",          qid: "Q173407" },
  { slug: "tesla",         name: "Tesla",         qid: "Q478214" },
];

// Simple query: everything manufactured by the brand. We filter type in JS.
const SPARQL_TEMPLATE = (qid) => `
SELECT ?model ?modelLabel ?typeLabel ?inception ?dissolved WHERE {
  ?model wdt:P176 wd:${qid} .
  ?model wdt:P31 ?type .
  OPTIONAL { ?model wdt:P571 ?inception . }
  OPTIONAL { ?model wdt:P576 ?dissolved . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 2000
`;

async function fetchModelsForMake(make, attempt = 1) {
  const sparql = SPARQL_TEMPLATE(make.qid);
  const url = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(sparql)}&format=json`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/sparql-results+json",
      },
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    }
    return await res.json();
  } catch (e) {
    if (attempt < 3 && (e.name === "TimeoutError" || e.name === "AbortError")) {
      process.stderr.write(`[retry ${attempt}] `);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      return fetchModelsForMake(make, attempt + 1);
    }
    throw e;
  }
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
  coupé: "coupe",
  convertible: "convertible",
  cabriolet: "convertible",
  roadster: "roadster",
  estate: "estate",
  "station wagon": "estate",
  wagon: "estate",
  touring: "estate",
  "sport utility vehicle": "suv",
  suv: "suv",
  crossover: "suv",
  pickup: "pickup",
  "pickup truck": "pickup",
  van: "van",
  "minivan": "mpv",
  mpv: "mpv",
  microvan: "van",
  "panel van": "van",
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
  // Wikidata returns "+1985-01-01T00:00:00Z" or "1985-01-01"
  const m = iso.match(/(-?\d{1,4})-/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  if (isNaN(y) || y < 1900 || y > 2030) return null;
  return y;
}

// Filters out non-model rows: bare Q-numbers, list articles, parts/components.
function isValidModelLabel(label) {
  if (!label) return false;
  if (/^Q\d+$/.test(label)) return false;
  if (label.length < 2 || label.length > 80) return false;
  if (/^list of\b/i.test(label)) return false;
  if (/\bengine\b|\bgearbox\b|\bsuspension\b|\btransmission\b|\bplant\b|\bcompany\b|\bfactory\b|\bbrand\b|\bsubsidiary\b|\bracing\b/i.test(label))
    return false;
  return true;
}

// Accept rows whose Wikidata type is car-ish (in label form).
const CAR_TYPE_HINTS = [
  "automobile model",
  "car model",
  "motor vehicle model",
  "motor car",
  "concept car",
  "supermini",
  "compact car",
  "mid-size car",
  "full-size car",
  "executive car",
  "sports car",
  "muscle car",
  "luxury car",
  "sport utility vehicle",
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
  "subcompact",
  "city car",
  "kei car",
  "sport sedan",
  "grand tourer",
  "fastback",
  "model series",
  "automotive",
  "vehicle model",
  "passenger car",
  "electric car",
  "electric vehicle",
];

function isCarType(typeLabel) {
  if (!typeLabel) return false;
  const lc = typeLabel.toLowerCase();
  if (/^q\d+$/.test(lc)) return false;
  return CAR_TYPE_HINTS.some((h) => lc.includes(h));
}

async function main() {
  const out = [];
  out.push("-- =============================================================================");
  out.push("-- Vehicle models — sourced from Wikidata SPARQL");
  out.push("-- Auto-generated by scripts/seed-vehicles-from-wikidata.mjs");
  out.push(`-- Generated: ${new Date().toISOString()}`);
  out.push("-- Idempotent. Run AFTER supabase-vehicles-migration.sql.");
  out.push("-- =============================================================================");
  out.push("");

  let totalRows = 0;
  let totalNewMakes = 0;
  const summary = [];

  for (const make of MAKES) {
    process.stderr.write(`Fetching ${make.slug.padEnd(15)} (${make.qid.padEnd(8)})... `);
    let json;
    try {
      json = await fetchModelsForMake(make);
    } catch (e) {
      process.stderr.write(`ERROR ${e.message}\n`);
      out.push(`-- ${make.slug}: ERROR ${e.message}`);
      summary.push({ slug: make.slug, count: 0, error: e.message });
      continue;
    }

    const bindings = json.results.bindings;
    const seen = new Map();
    for (const b of bindings) {
      const label = b.modelLabel?.value;
      const typeLabel = b.typeLabel?.value;
      if (!isValidModelLabel(label)) continue;
      if (!isCarType(typeLabel)) continue; // skip companies, plants, racing teams
      const slug = slugify(label);
      if (!slug) continue;
      const existing = seen.get(slug);
      const yearFrom = parseYear(b.inception?.value);
      const yearTo = parseYear(b.dissolved?.value);
      const body = normalizeBody(typeLabel);
      if (!existing) {
        seen.set(slug, { name: label, year_from: yearFrom, year_to: yearTo, body_type: body });
      } else {
        if (yearFrom && !existing.year_from) existing.year_from = yearFrom;
        if (yearTo && !existing.year_to) existing.year_to = yearTo;
        if (body && !existing.body_type) existing.body_type = body;
      }
    }

    if (seen.size === 0) {
      out.push(`-- ${make.slug}: no usable models from Wikidata`);
      out.push("");
      summary.push({ slug: make.slug, count: 0 });
      process.stderr.write("0 models\n");
      continue;
    }

    out.push(`-- ${make.slug}: ${seen.size} models from Wikidata`);
    out.push(`with mk as (select id from public.vehicle_makes where slug = '${make.slug}')`);
    out.push("insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)");
    out.push("select mk.id, m.slug, m.name, m.yf, m.yt, m.body");
    out.push("from mk, (values");
    const rows = [];
    for (const [slug, data] of seen) {
      rows.push(
        `    (${escapeSql(slug)}, ${escapeSql(data.name)}, ${data.year_from ?? "null"}, ${data.year_to ?? "null"}, ${escapeSql(data.body_type)})`,
      );
    }
    out.push(rows.join(",\n"));
    out.push(") as m(slug, name, yf, yt, body)");
    out.push("on conflict (make_id, slug) do nothing;  -- preserves hand-curated rows");
    out.push("");

    totalRows += seen.size;
    totalNewMakes++;
    summary.push({ slug: make.slug, count: seen.size });
    process.stderr.write(`${seen.size} models\n`);

    // Rate limit: be nice to Wikidata
    await new Promise((r) => setTimeout(r, 800));
  }

  out.push("-- =============================================================================");
  out.push(`-- TOTAL: ${totalRows} models across ${totalNewMakes} makes`);
  out.push("-- =============================================================================");

  writeFileSync(OUT_PATH, out.join("\n") + "\n");

  console.error("");
  console.error("=".repeat(60));
  console.error("Per-brand counts:");
  console.error("=".repeat(60));
  for (const s of summary) {
    console.error(`  ${s.slug.padEnd(18)} ${String(s.count).padStart(5)} models${s.error ? " [ERROR]" : ""}`);
  }
  console.error("=".repeat(60));
  console.error(`TOTAL: ${totalRows} models written to ${OUT_PATH}`);
}

main().catch((e) => {
  console.error("\nFATAL:", e);
  process.exit(1);
});
