/**
 * Translation provider abstraction.
 *
 * Default backend: MyMemory (free, no key, ~50k chars/day anonymous).
 * If `DEEPL_API_KEY` is set in env, swaps to DeepL (better quality, 500k
 * chars/month free). No callers need to change.
 */

export type TranslateLocale = "ro" | "en" | "ru";

const ALL_LOCALES: TranslateLocale[] = ["ro", "en", "ru"];

const MYMEMORY_CHUNK = 480; // url-encoded GET limit is generous; stay safe

export type TranslateResult = Partial<Record<TranslateLocale, string>>;

/**
 * Translate `text` from `source` into the other 2 locales (RO/EN/RU minus source).
 * Returns a partial record keyed by target locale.
 */
export async function translateToAll(
  text: string,
  source: TranslateLocale,
): Promise<TranslateResult> {
  const targets = ALL_LOCALES.filter((l) => l !== source);
  const trimmed = text.trim();
  if (!trimmed) {
    const empty: TranslateResult = {};
    for (const t of targets) empty[t] = "";
    return empty;
  }

  const useDeepL = !!process.env.DEEPL_API_KEY;
  const translator = useDeepL ? translateDeepL : translateMyMemory;

  const results = await Promise.all(
    targets.map(async (target) => {
      try {
        const out = await translator(trimmed, source, target);
        return [target, out] as const;
      } catch (err) {
        // Surface a server-side log without breaking the whole request.
        console.error("translate failed", { source, target, err });
        return [target, ""] as const;
      }
    }),
  );

  const out: TranslateResult = {};
  for (const [k, v] of results) out[k] = v;
  return out;
}

async function translateMyMemory(
  text: string,
  source: TranslateLocale,
  target: TranslateLocale,
): Promise<string> {
  // MyMemory caps a single request at ~500 chars. Chunk on whitespace
  // boundaries so we don't slice mid-word.
  const chunks = chunkOnBoundary(text, MYMEMORY_CHUNK);
  const translated: string[] = [];
  for (const chunk of chunks) {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", chunk);
    url.searchParams.set("langpair", `${source}|${target}`);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`mymemory ${res.status}`);
    const json = (await res.json()) as {
      responseData?: { translatedText?: string };
      responseStatus?: number;
    };
    const out = json.responseData?.translatedText ?? "";
    translated.push(out);
  }
  return translated.join(" ").replace(/\s+/g, " ").trim();
}

async function translateDeepL(
  text: string,
  source: TranslateLocale,
  target: TranslateLocale,
): Promise<string> {
  // DeepL accepts up to 130k chars/request, so no chunking required for our sizes.
  const key = process.env.DEEPL_API_KEY!;
  // Free-tier keys end in `:fx` and use the `-free` host.
  const host = key.endsWith(":fx")
    ? "https://api-free.deepl.com"
    : "https://api.deepl.com";
  const res = await fetch(`${host}/v2/translate`, {
    method: "POST",
    headers: {
      "Authorization": `DeepL-Auth-Key ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      text,
      source_lang: source.toUpperCase(),
      target_lang: target.toUpperCase(),
    }).toString(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`deepl ${res.status}`);
  const json = (await res.json()) as {
    translations?: { text?: string }[];
  };
  return json.translations?.[0]?.text ?? "";
}

function chunkOnBoundary(input: string, max: number): string[] {
  if (input.length <= max) return [input];
  const out: string[] = [];
  let i = 0;
  while (i < input.length) {
    let end = Math.min(i + max, input.length);
    if (end < input.length) {
      // Walk back to nearest whitespace so we don't split mid-word.
      const back = input.lastIndexOf(" ", end);
      if (back > i + max / 2) end = back;
    }
    out.push(input.slice(i, end).trim());
    i = end;
  }
  return out.filter(Boolean);
}
