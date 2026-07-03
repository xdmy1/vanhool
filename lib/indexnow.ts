import { SITE_URL } from "@/lib/seo";

// Public by protocol design — the key only proves domain ownership via the
// matching /{key}.txt file, it grants no access to anything.
export const INDEXNOW_KEY = "b13a626494d7753a193b696248c03071";

const LOCALES = ["ro", "en", "ru"] as const;

/**
 * Notify Bing/Yandex (IndexNow) that pages changed. Fire-and-forget with a
 * short timeout — indexing pings must never fail a product save.
 */
export async function pingIndexNow(paths: string[]): Promise<void> {
  if (!SITE_URL.startsWith("https://")) return; // skip on localhost
  const urlList = paths.flatMap((p) =>
    LOCALES.map((l) => `${SITE_URL}/${l}${p}`),
  );
  if (urlList.length === 0) return;
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Best-effort only.
  }
}
