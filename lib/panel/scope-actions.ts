"use server";

import { cookies } from "next/headers";

import { type AccountScope, isScope, SCOPE_COOKIE } from "@/lib/panel/scope";

/**
 * Persist the active book preference so navigating to a page without a
 * `?book=` param respects the last choice. The URL param remains the
 * canonical source of truth on each request; this cookie is only the
 * default. Same-site=Lax + 1y matches the locale cookie pattern.
 */
export async function setActiveBook(scope: AccountScope): Promise<void> {
  if (!isScope(scope)) return;
  const store = await cookies();
  store.set(SCOPE_COOKIE, scope, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}
