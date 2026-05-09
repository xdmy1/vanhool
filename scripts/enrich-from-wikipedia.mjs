#!/usr/bin/env node
/**
 * Wikipedia infobox enrichment.
 *
 * For each known make:
 *   1. Re-query Wikidata for all car models, including Wikipedia sitelink
 *   2. For each model with a Wikipedia article, fetch raw wikitext via MediaWiki API
 *   3. Parse `Infobox automobile` block: production, body_style, engine
 *   4. Extract individual engine variants from the free-text engine list
 *   5. Stream UPDATE + INSERT statements to SQL file
 *
 * Output: supabase-vehicles-enrichment.sql — idempotent.
 *
 * Run: node scripts/enrich-from-wikipedia.mjs
 */

import { writeFileSync, appendFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "supabase-vehicles-enrichment.sql");
const CHECKPOINT = resolve(__dirname, "..", ".enrichment-checkpoint.json");

const WIKIDATA = "https://query.wikidata.org/sparql";
const WIKIPEDIA = "https://en.wikipedia.org/w/api.php";
const UA = "InterBus-vehicle-enricher/1.0 (https://inter-bus.md/) Node/" + process.version;

const CONCURRENCY = 6;
const WIKIPEDIA_TIMEOUT_MS = 30_000;
const SPARQL_TIMEOUT_MS = 60_000;
const SPARQL_DELAY_MS = 1500;

// 35 makes with corrected Q-ids based on the retry pass
const MAKES = [
  { slug: "audi",          name: "Audi",          qid: "Q23317"   },
  { slug: "bmw",           name: "BMW",           qid: "Q26678"   },
  { slug: "mercedes-benz", name: "Mercedes-Benz", qid: "Q27530"   },
  { slug: "volkswagen",    name: "Volkswagen",    qid: "Q246"     },
  { slug: "skoda",         name: "Škoda",         qid: "Q29637"   },
  { slug: "opel",          name: "Opel",          qid: "Q40966"   },
  { slug: "ford",          name: "Ford",          qid: "Q44294"   },
  { slug: "renault",       name: "Renault",       qid: "Q6686"    },
  { slug: "peugeot",       name: "Peugeot",       qid: "Q6742"    },
  { slug: "citroen",       name: "Citroën",       qid: "Q6746"    },
  { slug: "toyota",        name: "Toyota",        qid: "Q53268"   },
  { slug: "honda",         name: "Honda",         qid: "Q9584"    },
  { slug: "nissan",        name: "Nissan",        qid: "Q20165"   },
  { slug: "mazda",         name: "Mazda",         qid: "Q35996"   },
  { slug: "mitsubishi",    name: "Mitsubishi",    qid: "Q36033"   },
  { slug: "subaru",        name: "Subaru",        qid: "Q1051297" },
  { slug: "suzuki",        name: "Suzuki",        qid: "Q181642"  },
  { slug: "hyundai",       name: "Hyundai",       qid: "Q55931"   },
  { slug: "kia",           name: "Kia",           qid: "Q35349"   },
  { slug: "chevrolet",     name: "Chevrolet",     qid: "Q29570"   },
  { slug: "volvo",         name: "Volvo Cars",    qid: "Q215293"  },
  { slug: "dacia",         name: "Dacia",         qid: "Q27460"   },
  { slug: "fiat",          name: "Fiat",          qid: "Q27597"   },
  { slug: "alfa-romeo",    name: "Alfa Romeo",    qid: "Q26921"   },
  { slug: "lancia",        name: "Lancia",        qid: "Q35896"   },
  { slug: "seat",          name: "SEAT",          qid: "Q188217"  },
  { slug: "land-rover",    name: "Land Rover",    qid: "Q35907"   },
  { slug: "jaguar",        name: "Jaguar Cars",   qid: "Q30055"   },
  { slug: "porsche",       name: "Porsche",       qid: "Q40993"   },
  { slug: "jeep",          name: "Jeep",          qid: "Q30113"   },
  { slug: "tesla",         name: "Tesla",         qid: "Q478214"  },
];

// =============================================================================
// HTTP helpers with retry
// =============================================================================
async function fetchWithRetry(url, opts, label, attempt = 1, maxAttempts = 4) {
  try {
    const res = await fetch(url, {
      ...opts,
      headers: { "User-Agent": UA, ...(opts?.headers || {}) },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 100)}`);
    }
    return res;
  } catch (e) {
    if (attempt >= maxAttempts) throw e;
    const wait = 2000 * attempt;
    process.stderr.write(`[${label} retry ${attempt} after ${wait}ms] `);
    await new Promise((r) => setTimeout(r, wait));
    return fetchWithRetry(url, opts, label, attempt + 1, maxAttempts);
  }
}

// =============================================================================
// Wikidata: list models with Wikipedia URLs
// =============================================================================
const SPARQL_MODELS = (qid) => `
SELECT DISTINCT ?model ?modelLabel ?article ?typeLabel ?inception ?dissolved WHERE {
  ?model wdt:P176 wd:${qid} .
  ?article schema:about ?model ;
           schema:isPartOf <https://en.wikipedia.org/> .
  ?model wdt:P31 ?type .
  OPTIONAL { ?model wdt:P571 ?inception . }
  OPTIONAL { ?model wdt:P576 ?dissolved . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 2000
`;

async function fetchModelsForMake(make) {
  const url = `${WIKIDATA}?query=${encodeURIComponent(SPARQL_MODELS(make.qid))}&format=json`;
  const res = await fetchWithRetry(
    url,
    { signal: AbortSignal.timeout(SPARQL_TIMEOUT_MS), headers: { Accept: "application/sparql-results+json" } },
    `wikidata:${make.slug}`,
  );
  return res.json();
}

// =============================================================================
// Wikipedia: fetch wikitext
// =============================================================================
function articleTitleFromUrl(url) {
  const m = url.match(/\/wiki\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function fetchWikitext(title) {
  const url = `${WIKIPEDIA}?action=parse&page=${encodeURIComponent(title)}&format=json&prop=wikitext&redirects=1&origin=*`;
  const res = await fetchWithRetry(
    url,
    { signal: AbortSignal.timeout(WIKIPEDIA_TIMEOUT_MS) },
    `wp:${title.slice(0, 30)}`,
    1,
    3,
  );
  const json = await res.json();
  return json.parse?.wikitext?.["*"] ?? null;
}

// =============================================================================
// Wikitext cleaning + infobox extraction
// =============================================================================
function cleanWikitext(text) {
  if (!text) return "";
  let t = text;
  // Remove HTML comments
  t = t.replace(/<!--[\s\S]*?-->/g, "");
  // Remove <ref>...</ref> and <ref/>
  t = t.replace(/<ref[^>]*?\/>/gi, "");
  t = t.replace(/<ref[\s\S]*?<\/ref>/gi, "");
  // <br> -> newline
  t = t.replace(/<\s*br\s*\/?\s*>/gi, "\n");
  // Templates: convert/cvt
  t = t.replace(/\{\{(?:convert|cvt)\|(\d+(?:\.\d+)?)\|([a-zA-Z]+)(?:\|[^}]*)?\}\}/g, "$1 $2");
  // Lists: ubl, plainlist, hlist, flatlist, unbulleted list
  t = t.replace(/\{\{(?:ubl|plainlist|unbulleted list|hlist|flatlist)\|([\s\S]*?)\}\}/g, (_m, c) => {
    return c.split("|").join("\n");
  });
  // start date, end date
  t = t.replace(/\{\{start date(?: and age)?\|(\d{4})(?:\|\d+)*\}\}/gi, "$1");
  t = t.replace(/\{\{end date\|(\d{4})(?:\|\d+)*\}\}/gi, "$1");
  // Generic templates: {{x|y|z}} -> y (drop most templates, keep first arg if it looks textual)
  t = t.replace(/\{\{([^|{}]+?)\}\}/g, "");
  t = t.replace(/\{\{([^|{}]+?)\|([^{}]*?)\}\}/g, (_m, _name, args) => {
    const parts = args.split("|");
    return parts[0] || "";
  });
  // Wiki links: [[X|Y]] -> Y, [[X]] -> X
  t = t.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2");
  t = t.replace(/\[\[([^\]]+)\]\]/g, "$1");
  // External links: [http://x text] -> text
  t = t.replace(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/g, "$1");
  t = t.replace(/\[https?:\/\/[^\s\]]+\]/g, "");
  // HTML entities
  t = t.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
  // Remaining single braces
  t = t.replace(/\{\{[\s\S]*?\}\}/g, "");
  // Bold/italic markers
  t = t.replace(/'{2,}/g, "");
  return t.trim();
}

// Extract Infobox automobile / car / motor vehicle
function findInfobox(wikitext) {
  // Match {{Infobox <type>...}} including nested templates.
  const re = /\{\{Infobox\s+(?:automobile|car|motor[\s_]?vehicle|truck|bus|coach|van|pickup|sport[\s_]?utility[\s_]?vehicle)/i;
  const m = wikitext.match(re);
  if (!m) return null;
  const start = m.index;
  // Find matching }} accounting for nested {{}}
  let depth = 0;
  let i = start;
  for (; i < wikitext.length; i++) {
    if (wikitext[i] === "{" && wikitext[i + 1] === "{") {
      depth++;
      i++;
    } else if (wikitext[i] === "}" && wikitext[i + 1] === "}") {
      depth--;
      i++;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  return wikitext.slice(start, i);
}

// Parse infobox fields. Returns { production, body_style, engine, layout, ... }
function parseInfoboxFields(infoboxBlock) {
  if (!infoboxBlock) return null;
  // Strip the {{Infobox ...}} wrapping
  const inner = infoboxBlock.replace(/^\{\{Infobox[^\n]*\n?/, "").replace(/\n?\}\}\s*$/, "");

  // Split fields: each field starts with ^| name = value, value can be multi-line.
  // We need to be careful with nested templates {{...}} inside values.
  const fields = {};
  const lines = inner.split("\n");
  let curKey = null;
  let curVal = [];
  let braceDepth = 0;
  for (const raw of lines) {
    // Adjust brace depth from current line
    const opens = (raw.match(/\{\{/g) || []).length;
    const closes = (raw.match(/\}\}/g) || []).length;
    if (braceDepth === 0) {
      const m = raw.match(/^\|\s*([a-zA-Z0-9_\- ]+?)\s*=\s*(.*)$/);
      if (m) {
        if (curKey) fields[curKey] = curVal.join("\n");
        curKey = m[1].trim().toLowerCase().replace(/[ -]/g, "_");
        curVal = [m[2]];
        braceDepth += opens - closes;
        continue;
      }
    }
    if (curKey) {
      curVal.push(raw);
      braceDepth += opens - closes;
      if (braceDepth < 0) braceDepth = 0;
    }
  }
  if (curKey) fields[curKey] = curVal.join("\n");

  return fields;
}

// =============================================================================
// Field-specific parsers
// =============================================================================
const BODY_VOCAB = [
  ["sedan", /\b(?:sedan|saloon|berlina|berline)\b/i],
  ["hatchback", /\b(?:hatchback|liftback|three[\s-]door|five[\s-]door)\b/i],
  ["coupe", /\b(?:coupe|coupé|coupé)\b/i],
  ["convertible", /\b(?:convertible|cabriolet|cabrio|drophead)\b/i],
  ["roadster", /\b(?:roadster|spider|spyder|spyder)\b/i],
  ["estate", /\b(?:estate|station[\s-]?wagon|touring|kombi|avant|variant|sportwagen|caravan)\b/i],
  ["suv", /\b(?:suv|sport[\s-]?utility[\s-]?vehicle|crossover|cuv)\b/i],
  ["pickup", /\b(?:pickup|pick[\s-]?up|ute|utility[\s-]?vehicle)\b/i],
  ["van", /\b(?:van|panel[\s-]?van|cargo[\s-]?van)\b/i],
  ["mpv", /\b(?:mpv|minivan|people[\s-]?carrier|monovolume)\b/i],
];

function normalizeBody(text) {
  if (!text) return null;
  const cleaned = cleanWikitext(text);
  for (const [body, rx] of BODY_VOCAB) {
    if (rx.test(cleaned)) return body;
  }
  return null;
}

function parseProduction(text) {
  if (!text) return { year_from: null, year_to: null };
  const cleaned = cleanWikitext(text);
  // Look for the FIRST year range in the cleaned text.
  // Patterns: 1989–1996, 1989-1996, 1989 to 1996, 1989–present
  const m =
    cleaned.match(/(\d{4})\s*[–\-—to]+\s*(\d{4}|present)/i) ||
    cleaned.match(/(\d{4})\b/);
  if (!m) return { year_from: null, year_to: null };
  const yf = parseInt(m[1], 10);
  let yt = m[2] && m[2].toLowerCase() !== "present" ? parseInt(m[2], 10) : null;
  if (yf < 1900 || yf > 2030) return { year_from: null, year_to: null };
  if (yt && (yt < yf || yt > 2030)) yt = null;
  return { year_from: yf, year_to: yt };
}

const FUEL_HINTS = [
  ["diesel", /\b(?:diesel|tdi|cdti?|hdi|cdti|tdci|jtd|mjet|mjt|mjtd|d-4d|crdi|cdi|cdtj?|dtec|ddtj?|bluedci|bluetec|dci\b|td\b|sdi)\b/i],
  ["petrol", /\b(?:petrol|gasoline|tfsi|tsi|fsi|gti|gli|vtec|i-vtec|mivec|vvti?|vvt-?i|cvvt|skyactiv-?g|i4 petrol|gas|natural[\s-]?aspirated)\b/i],
  ["hybrid", /\b(?:hybrid|i-mmd|hsd|e-power|hev|phev|atkinson)\b/i],
  ["electric", /\b(?:electric|ev\b|bev|battery[\s-]?electric|e-tron|id\.|i3|i4 electric)\b/i],
  ["lpg", /\b(?:lpg|autogas|propane)\b/i],
  ["cng", /\b(?:cng|natural[\s-]?gas|methane)\b/i],
];

function detectFuel(line) {
  for (const [fuel, rx] of FUEL_HINTS) {
    if (rx.test(line)) return fuel;
  }
  return null;
}

// Engine line parser: extract one engine variant from a single line of text
function parseEngineLine(line) {
  const cleaned = cleanWikitext(line).replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length < 4) return null;

  // Capacity: prefer cc, fall back to L
  const ccMatch = cleaned.match(/(\d{3,4})\s*(?:cc|cm³|cm3)\b/);
  const litreMatch = cleaned.match(/\b(\d(?:\.\d{1,2})?)\s*(?:l\b|L\b|liter|litre)/);
  let capacity_cc = null;
  let capacity_l = null;
  if (ccMatch) {
    capacity_cc = parseInt(ccMatch[1], 10);
    capacity_l = capacity_cc / 1000;
  } else if (litreMatch) {
    capacity_l = parseFloat(litreMatch[1]);
    capacity_cc = Math.round(capacity_l * 1000);
  }

  // Power: kW + PS/HP. Patterns: "(110 kW; 150 PS)", "150 PS", "110 kW", "(150 hp)"
  const kwMatch = cleaned.match(/(\d{2,3})\s*kW/i);
  const psMatch = cleaned.match(/(\d{2,3})\s*(?:PS|HP|hp|bhp)\b/);
  let power_kw = kwMatch ? parseInt(kwMatch[1], 10) : null;
  let power_hp = psMatch ? parseInt(psMatch[1], 10) : null;
  if (power_kw == null && power_hp != null) power_kw = Math.round(power_hp * 0.7355);
  if (power_hp == null && power_kw != null) power_hp = Math.round(power_kw / 0.7355);

  // Engine code: 3-9 char token with both letters AND digits. Permissive but
  // filtered through a stopword list to drop things like "I4", "16V", "VTEC".
  const STOPWORDS = new Set([
    "I3","I4","I5","I6","I8","V4","V6","V8","V10","V12","H4","H6","W12","W16",
    "16V","20V","24V","32V","48V","8V","12V","48V",
    "DOHC","SOHC","OHV","OHC","VTEC","I-VTEC","VVT","VVTI","VVT-I","CVVT","VVT-IE",
    "VTEC-E","MIVEC","TFSI","TSI","FSI","TDI","CDI","HDI","JTD","MJTD","MJET","MPI",
    "GDI","CRDI","DCI","TDCI","CDTI","D-4D","D4D","BLUEHDI","BLUETEC","BLUEDCI",
    "MULTIAIR","MULTIPLEX","SKYACTIV","HYBRID","TURBO","TWINTURBO","BITURBO",
    "EFI","ECU","DSG","DCT","CVT","ABS","ESP","BMW","AMG","HEMI","NSX","LSX",
    "TFSi","TSi","FSi","TDi","CDi","HDi","JTd","MJtd","MJet","MPi","GDi","CRDi","DCi","TDCi","CDTi","D-4D","BluHDi","BluTEC","BluDCi",
  ]);
  function looksLikeCode(token) {
    if (token.length < 3 || token.length > 9) return false;
    if (!/[A-Z]/.test(token) || !/\d/.test(token)) return false;
    if (STOPWORDS.has(token.toUpperCase())) return false;
    if (/^\d+L$/.test(token)) return false;     // "4L"
    if (/^\d+ML$/.test(token)) return false;
    if (/^L\d+$/.test(token)) return false;     // "L8"
    return true;
  }
  let engine_code = null;
  // Match plausible alphanumeric codes: 1-4 letters + digits + optional letter + optional digits
  const codeRe = /\b([A-Z][A-Z0-9.\-]{2,8})\b/g;
  let cm;
  while ((cm = codeRe.exec(cleaned)) !== null) {
    const candidate = cm[1].toUpperCase();
    if (looksLikeCode(candidate)) { engine_code = candidate; break; }
  }

  // Year prefix: "1989–1991: 1.6L"
  const yearPrefix = cleaned.match(/^(\d{4})\s*[–\-—]\s*(\d{4}|present)?\s*[:.,]/i);
  let year_from = null;
  let year_to = null;
  if (yearPrefix) {
    year_from = parseInt(yearPrefix[1], 10);
    year_to = yearPrefix[2] && yearPrefix[2].toLowerCase() !== "present" ? parseInt(yearPrefix[2], 10) : null;
  }

  const fuel = detectFuel(cleaned);

  // Skip lines with no useful data
  if (capacity_cc == null && power_kw == null) return null;

  // Build a display name like "2.0 L K20A Diesel"
  const nameParts = [];
  if (capacity_l) nameParts.push(`${capacity_l.toFixed(1)} L`);
  if (engine_code) nameParts.push(engine_code);
  if (fuel && fuel !== "petrol") nameParts.push(fuel === "diesel" ? "Diesel" : fuel.toUpperCase());
  if (power_kw) nameParts.push(`${power_kw}kW`);
  const name = nameParts.filter(Boolean).join(" ").trim() || cleaned.slice(0, 40);

  return {
    name,
    capacity_cc,
    capacity_l,
    power_kw,
    power_hp,
    engine_code,
    fuel,
    year_from,
    year_to,
    raw: cleaned.slice(0, 120),
  };
}

function parseEngineField(text) {
  if (!text) return [];
  // Engine field is usually multi-line; sometimes uses *, ;, or / as separators
  const cleaned = text
    .replace(/\{\{(?:plainlist|ubl|unbulleted list|hlist|flatlist)\|/gi, "")
    .replace(/^\s*\*\s*/gm, "")
    .replace(/<br\s*\/?>/gi, "\n");

  // Split on newlines and on " / " (space-slash-space)
  const lines = cleaned
    .split(/\n+|\s\/\s/)
    .map((l) => l.trim())
    .filter(Boolean);

  const engines = [];
  const seen = new Set();
  for (const line of lines) {
    const parsed = parseEngineLine(line);
    if (!parsed) continue;
    // Dedupe
    const key = `${parsed.capacity_cc}-${parsed.power_kw}-${parsed.engine_code ?? ""}-${parsed.fuel ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    engines.push(parsed);
  }
  return engines;
}

// =============================================================================
// SQL emission
// =============================================================================
function slugify(s) {
  return String(s)
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

function engineSlug(eng, idx) {
  const parts = [];
  if (eng.capacity_l) parts.push(`${eng.capacity_l.toFixed(1).replace(".", "-")}l`);
  if (eng.power_kw) parts.push(`${eng.power_kw}kw`);
  if (eng.fuel) parts.push(eng.fuel.slice(0, 3));
  if (eng.engine_code) parts.push(slugify(eng.engine_code));
  if (parts.length === 0) parts.push(`engine-${idx}`);
  return parts.join("-");
}

function emitModelUpdate(makeSlug, modelSlug, year_from, year_to, body_type) {
  if (!year_from && !year_to && !body_type) return "";
  return `update public.vehicle_models set ${[
    year_from ? `year_from = coalesce(year_from, ${year_from})` : null,
    year_to ? `year_to = coalesce(year_to, ${year_to})` : null,
    body_type ? `body_type = coalesce(body_type, ${escapeSql(body_type)})` : null,
  ]
    .filter(Boolean)
    .join(", ")}
where slug = ${escapeSql(modelSlug)}
  and make_id = (select id from public.vehicle_makes where slug = ${escapeSql(makeSlug)});\n`;
}

function emitEngineInsert(makeSlug, modelSlug, eng, idx) {
  const slug = engineSlug(eng, idx);
  return `insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       ${escapeSql(slug)},
       ${escapeSql(eng.name)},
       ${eng.power_kw ?? "null"},
       ${eng.power_hp ?? "null"},
       ${eng.capacity_cc ?? "null"},
       ${escapeSql(eng.fuel)},
       ${eng.year_from ?? "null"},
       ${eng.year_to ?? "null"},
       ${escapeSql(eng.engine_code)}
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = ${escapeSql(makeSlug)} and vm.slug = ${escapeSql(modelSlug)}
on conflict (model_id, slug) do nothing;
`;
}

// =============================================================================
// Main
// =============================================================================
async function main() {
  // Resume support
  let processed = new Set();
  if (existsSync(CHECKPOINT)) {
    try {
      processed = new Set(JSON.parse(readFileSync(CHECKPOINT, "utf8")));
      process.stderr.write(`Resuming with ${processed.size} models already processed\n`);
    } catch {}
  }

  // Header (only if file doesn't exist)
  if (!existsSync(OUT_PATH)) {
    writeFileSync(
      OUT_PATH,
      `-- Wikipedia infobox enrichment\n` +
        `-- Generated by scripts/enrich-from-wikipedia.mjs\n` +
        `-- Idempotent (UPDATE coalesce + INSERT ON CONFLICT DO NOTHING).\n\n`,
    );
  }

  const stats = { models_total: 0, models_with_article: 0, updated: 0, engines_inserted: 0, errors: 0 };

  for (const make of MAKES) {
    process.stderr.write(`\n=== ${make.slug} (${make.qid}) ===\n`);
    let result;
    try {
      result = await fetchModelsForMake(make);
    } catch (e) {
      process.stderr.write(`SPARQL failed: ${e.message}\n`);
      stats.errors++;
      continue;
    }
    await new Promise((r) => setTimeout(r, SPARQL_DELAY_MS));

    // Group by model — same model can appear multiple times due to multiple types
    const byModel = new Map();
    for (const b of result.results.bindings) {
      const url = b.article?.value;
      if (!url) continue;
      const label = b.modelLabel?.value;
      if (!label || /^Q\d+$/.test(label)) continue;
      const slug = slugify(label);
      if (!slug) continue;
      const title = articleTitleFromUrl(url);
      if (!title) continue;
      if (!byModel.has(slug)) {
        byModel.set(slug, { slug, name: label, title });
      }
    }

    process.stderr.write(`  ${byModel.size} models with Wikipedia article\n`);
    stats.models_total += byModel.size;
    stats.models_with_article += byModel.size;

    // Process models in concurrent batches
    const models = Array.from(byModel.values());
    let i = 0;
    while (i < models.length) {
      const batch = models.slice(i, i + CONCURRENCY);
      await Promise.allSettled(
        batch.map(async (m) => {
          const checkpointKey = `${make.slug}:${m.slug}`;
          if (processed.has(checkpointKey)) return;

          let wikitext;
          try {
            wikitext = await fetchWikitext(m.title);
          } catch (e) {
            stats.errors++;
            return;
          }
          if (!wikitext) return;

          const ib = findInfobox(wikitext);
          if (!ib) return;
          const fields = parseInfoboxFields(ib);
          if (!fields) return;

          const { year_from, year_to } = parseProduction(
            fields.production || fields.production_start || fields.years,
          );
          const body_type = normalizeBody(fields.body_style || fields.body || fields.layout);
          const engines = parseEngineField(fields.engine);

          let sql = `-- ${make.slug}/${m.slug} → ${m.title} (${engines.length} engines)\n`;
          sql += emitModelUpdate(make.slug, m.slug, year_from, year_to, body_type);
          for (let k = 0; k < engines.length; k++) {
            sql += emitEngineInsert(make.slug, m.slug, engines[k], k);
          }
          if (year_from || year_to || body_type) stats.updated++;
          stats.engines_inserted += engines.length;
          appendFileSync(OUT_PATH, sql + "\n");
          processed.add(checkpointKey);
        }),
      );
      i += CONCURRENCY;
      // Polite pause
      await new Promise((r) => setTimeout(r, 250));
    }

    // Save checkpoint after each make
    writeFileSync(CHECKPOINT, JSON.stringify(Array.from(processed)));
    process.stderr.write(
      `  done (running stats: updated=${stats.updated}, engines=${stats.engines_inserted}, errors=${stats.errors})\n`,
    );
  }

  appendFileSync(
    OUT_PATH,
    `\n-- ============================================================================\n` +
      `-- ENRICHMENT DONE\n` +
      `-- models_total=${stats.models_total}, with_article=${stats.models_with_article}\n` +
      `-- updated=${stats.updated}, engines_inserted=${stats.engines_inserted}\n` +
      `-- errors=${stats.errors}\n` +
      `-- ============================================================================\n`,
  );

  process.stderr.write("\nFINAL STATS:\n");
  for (const [k, v] of Object.entries(stats)) process.stderr.write(`  ${k}: ${v}\n`);
  process.stderr.write(`\nOutput: ${OUT_PATH}\n`);
}

// Only run main when executed directly, not when imported.
if (import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  main().catch((e) => {
    console.error("FATAL:", e);
    process.exit(1);
  });
}
