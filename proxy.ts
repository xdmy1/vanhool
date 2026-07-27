import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { routing } from "@/lib/i18n/routing";
import type { Database } from "@/lib/supabase/database.types";

const intlMiddleware = createIntlMiddleware(routing);

const ADMIN_PREFIXES = ["admin", "panel"] as const;

// inter-bus.md is a closed B2B platform: the public sees ONLY the landing +
// these pages. Everything else in the storefront (catalog, products, cart,
// checkout, dashboard, …) requires a login. Allow-list, not block-list, so a
// new shop route is gated by default. `register` is intentionally absent —
// accounts are created by the operator (its page redirects to /login).
const PUBLIC_PREFIXES = [
  "login",
  "contact",
  "about",
  "informatii",
] as const;

function localeOf(pathname: string): string | null {
  const seg = pathname.split("/")[1];
  if (routing.locales.includes(seg as (typeof routing.locales)[number])) return seg;
  return null;
}

function matchesProtected(pathname: string): "auth" | "admin" | null {
  const locale = localeOf(pathname);
  if (!locale) return null;
  const rest = pathname.slice(locale.length + 1).replace(/^\/+/, "").split("/")[0];
  if (ADMIN_PREFIXES.includes(rest as (typeof ADMIN_PREFIXES)[number])) return "admin";
  // Landing (empty rest) + explicit public pages stay open; everything else
  // in the storefront requires authentication.
  if (rest === "" || PUBLIC_PREFIXES.includes(rest as (typeof PUBLIC_PREFIXES)[number])) {
    return null;
  }
  return "auth";
}

export async function proxy(request: NextRequest) {
  // 1) Locale routing/redirect
  const intlResponse = intlMiddleware(request);
  if (intlResponse.headers.get("location")) {
    return intlResponse;
  }

  // 2) Build a response that we'll mutate cookies on. Forward x-pathname on
  // the *request* headers — RSC's `headers()` reads inbound request headers,
  // so a `response.headers.set()` would be invisible to server components.
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({
    request: { headers: forwardedHeaders },
  });

  // Forward intl headers/cookies
  intlResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  intlResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    response.headers.set(key, value);
  });
  // Also expose pathname on the response for client-side debugging.
  response.headers.set("x-pathname", request.nextUrl.pathname);

  // 3) Refresh Supabase session
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4) Guards
  const matched = matchesProtected(request.nextUrl.pathname);
  if (matched) {
    const locale = localeOf(request.nextUrl.pathname) ?? routing.defaultLocale;
    if (!user) {
      const next = encodeURIComponent(
        request.nextUrl.pathname + request.nextUrl.search,
      );
      const redirectUrl = new URL(`/${locale}/login?next=${next}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (matched === "admin") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Skip the locale rewrite for static assets and the Next.js icon /
    // manifest convention routes — those must stay outside i18n so phone
    // launchers can resolve them at the root.
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|logo.svg|images|icon|apple-icon|manifest|.*\\..*).*)",
  ],
};
