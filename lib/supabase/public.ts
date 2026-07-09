import { createServerClient } from "@supabase/ssr";

import type { Database } from "./database.types";

/**
 * Anon Supabase client with no cookie adapter, for reads that are identical for
 * every visitor (sitemap, feeds).
 *
 * `lib/supabase/server.ts` calls `cookies()`, which opts its caller out of
 * static rendering. A route that uses it can never be prerendered or cached, so
 * `export const revalidate` on such a route is silently dead. Reading through
 * this client instead keeps those routes cacheable.
 *
 * Only ever use it where the result must not depend on who is asking — it
 * carries no session, so RLS sees the `anon` role.
 */
export function createPublicClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  );
}
