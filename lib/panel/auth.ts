import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type PanelUser = {
  id: string;
  email: string;
  fullName: string | null;
};

/**
 * Resolve the current panel user. Treated as admin-only for now; a salesperson
 * role can be wired in later by extending the profiles check.
 *
 * Returns null instead of redirecting so callers can branch (e.g. server
 * actions that want to throw rather than send an HTTP redirect). Pages should
 * call requirePanelUser() which redirects on miss.
 */
export async function getPanelUser(): Promise<PanelUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile.full_name ?? null,
  };
}

export async function requirePanelUser(locale: string): Promise<PanelUser> {
  const user = await getPanelUser();
  if (!user) {
    const supabase = await createClient();
    const {
      data: { user: authed },
    } = await supabase.auth.getUser();
    if (!authed) redirect(`/${locale}/login?next=/${locale}/panel`);
    redirect(`/${locale}/dashboard`);
  }
  return user;
}
