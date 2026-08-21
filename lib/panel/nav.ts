// Panel "back" links.
//
// A detail page shouldn't guess where the operator came from. The caller
// encodes its own URL — filters, page, row anchor and all — into a `back`
// query param, and the detail header's arrow returns exactly there instead
// of dumping the operator on a default list with every filter reset.

/** Encode a panel URL (path + query + hash) for the `back` query param. */
export function encodeBackHref(href: string): string {
  return encodeURIComponent(href);
}

/**
 * Read a `back` param off searchParams. Only same-origin panel URLs are
 * honoured — anything else (absolute, protocol-relative, another section)
 * falls back, so a hand-edited link can't turn into an open redirect.
 */
export function resolveBackHref(
  raw: string | string[] | undefined,
  fallback: string,
): string {
  if (typeof raw !== "string" || !raw) return fallback;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return fallback;
  }
  if (decoded.startsWith("//") || !decoded.startsWith("/panel")) return fallback;
  return decoded;
}

/** Anchor id for a document row, so `back` can land on the exact row. */
export function rowAnchor(id: string): string {
  return `row-${id}`;
}
