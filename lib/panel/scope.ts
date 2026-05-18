import { cookies } from "next/headers";

export type AccountScope = "conta1" | "conta2";

export const ACCOUNT_SCOPES: readonly AccountScope[] = ["conta1", "conta2"] as const;
export const DEFAULT_SCOPE: AccountScope = "conta1";
export const SCOPE_COOKIE = "IB_PANEL_BOOK";

export function isScope(value: unknown): value is AccountScope {
  return value === "conta1" || value === "conta2";
}

/**
 * Resolve the active book for a panel page. Reads ?book= first (URLs are
 * shareable / linkable from the dashboard), falls back to cookie, then to
 * conta1. Pages that are scope-locked (facturi, cheltuieli oficiale, etc.)
 * ignore this and pass the forced scope to their queries.
 */
export async function getActiveBook(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): Promise<AccountScope> {
  const raw = searchParams?.book;
  const fromUrl = Array.isArray(raw) ? raw[0] : raw;
  if (isScope(fromUrl)) return fromUrl;

  const store = await cookies();
  const fromCookie = store.get(SCOPE_COOKIE)?.value;
  if (isScope(fromCookie)) return fromCookie;

  return DEFAULT_SCOPE;
}
