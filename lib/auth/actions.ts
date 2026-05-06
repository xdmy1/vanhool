"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthResult =
  | { ok: true; redirectTo?: string; requiresEmailConfirmation?: boolean }
  | {
      ok: false;
      code:
        | "invalid_credentials"
        | "email_not_confirmed"
        | "email_exists"
        | "weak_password"
        | "rate_limited"
        | "unknown";
      message?: string;
    };

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    "http://localhost:3000"
  );
}

export async function signIn(input: {
  email: string;
  password: string;
  redirectTo?: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password,
  });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("not confirmed") || m.includes("email_not_confirmed")) {
      return { ok: false, code: "email_not_confirmed", message: error.message };
    }
    return { ok: false, code: "invalid_credentials", message: error.message };
  }
  return { ok: true, redirectTo: input.redirectTo };
}

export async function signUp(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  language?: "ro" | "en" | "ru";
  marketingOptIn?: boolean;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: fullName,
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone ?? "",
        company: input.company ?? "",
        marketing_opt_in: !!input.marketingOptIn,
        language: input.language ?? "ro",
      },
      emailRedirectTo: `${siteUrl()}/${input.language ?? "ro"}/dashboard`,
    },
  });
  if (error) {
    if (error.message.toLowerCase().includes("password")) {
      return { ok: false, code: "weak_password", message: error.message };
    }
    if (error.message.toLowerCase().includes("registered") || error.message.toLowerCase().includes("exists")) {
      return { ok: false, code: "email_exists", message: error.message };
    }
    return { ok: false, code: "unknown", message: error.message };
  }
  // If a session was returned, the user is auto-signed in (email confirmation disabled).
  if (data.session) {
    // Best-effort upsert into profiles. The handle_new_user trigger covers this
    // too, but upserting from the action means it works even if the trigger
    // hasn't been deployed yet.
    await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user!.id,
          email: data.user!.email,
          full_name: fullName,
          phone: input.phone ?? null,
          language: input.language ?? "ro",
        },
        { onConflict: "id" },
      );
    return { ok: true, requiresEmailConfirmation: false };
  }
  // No session => Supabase has email confirmation enabled; user must click the
  // link in the verification email before they can log in.
  return { ok: true, requiresEmailConfirmation: true };
}

export type ResendResult =
  | { ok: true }
  | {
      ok: false;
      code: "rate_limited" | "invalid_email" | "unknown";
      message?: string;
    };

/**
 * Re-sends the signup confirmation email. Supabase rate-limits this; we surface
 * "rate_limited" so the UI can show a friendly cooldown message.
 */
export async function resendSignupConfirmation(
  email: string,
): Promise<ResendResult> {
  const trimmed = email.trim();
  if (!trimmed.includes("@")) return { ok: false, code: "invalid_email" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: trimmed,
    options: { emailRedirectTo: `${siteUrl()}/ro/dashboard` },
  });
  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("rate") || m.includes("too many")) {
      return { ok: false, code: "rate_limited", message: error.message };
    }
    return { ok: false, code: "unknown", message: error.message };
  }
  return { ok: true };
}

export async function signOut(): Promise<{ ok: true } | { ok: false; message?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/** Reads the auth header to verify a user is logged in (used by guards). */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const h = await headers();
    const path = h.get("x-pathname") ?? "/";
    redirect(`/login?next=${encodeURIComponent(path)}`);
  }
  return user;
}
