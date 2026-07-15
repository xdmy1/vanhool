import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Next.js App Router caches fetch() (GET) responses in its Data Cache by
      // default, and supabase-js reads go through fetch — so a SELECT could
      // return a STALE row after the DB changed (e.g. stock edited to 3 but the
      // sale still shows 1). Force no-store so every read is live. Stock/price
      // correctness beats caching in a panel.
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: "no-store" }),
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // ignored when called from a Server Component — handled by proxy
          }
        },
      },
    },
  );
}
