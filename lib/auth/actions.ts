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

export type SignUpBusiness = {
  companyName: string;
  idno: string;
  legalForm?: string;
  contactPosition?: string;
  billingCountry: string;
  billingStreet: string;
  billingCity: string;
  billingDistrict?: string;
  billingPostal?: string;
  shippingSameAsBilling: boolean;
  shippingCountry?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingDistrict?: string;
  shippingPostal?: string;
  vatPayer: boolean;
  vatNumber?: string;
  euVatId?: string;
};

export async function signUp(input: {
  accountType?: "individual" | "business";
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  company?: string;
  language?: "ro" | "en" | "ru";
  marketingOptIn?: boolean;
  business?: SignUpBusiness;
}): Promise<AuthResult> {
  const phoneDigits = input.phone.replace(/\D/g, "");
  if (!input.phone || phoneDigits.length < 7) {
    return { ok: false, code: "unknown", message: "Phone required" };
  }
  const accountType = input.accountType ?? "individual";
  if (accountType === "business" && !input.business) {
    return { ok: false, code: "unknown", message: "Business details required" };
  }
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
        phone: input.phone,
        company: input.business?.companyName ?? input.company ?? "",
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

  // Always upsert profile row with the full set of fields. The
  // handle_new_user trigger creates a minimal row from auth metadata; we
  // immediately enrich it with business data when applicable.
  const userId = data.user?.id;
  if (userId) {
    const b = input.business;
    const baseRow = {
      id: userId,
      email: data.user!.email,
      full_name: fullName,
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      language: input.language ?? "ro",
      account_type: accountType,
    } as const;
    const businessRow = b
      ? {
          company: b.companyName,
          company_name: b.companyName,
          idno: b.idno,
          legal_form: b.legalForm ?? null,
          contact_position: b.contactPosition ?? null,
          billing_country: b.billingCountry,
          billing_street: b.billingStreet,
          billing_city: b.billingCity,
          billing_district: b.billingDistrict ?? null,
          billing_postal: b.billingPostal ?? null,
          shipping_same_as_billing: b.shippingSameAsBilling,
          shipping_country: b.shippingSameAsBilling ? b.billingCountry : b.shippingCountry ?? null,
          shipping_street: b.shippingSameAsBilling ? b.billingStreet : b.shippingStreet ?? null,
          shipping_city: b.shippingSameAsBilling ? b.billingCity : b.shippingCity ?? null,
          shipping_district: b.shippingSameAsBilling ? b.billingDistrict ?? null : b.shippingDistrict ?? null,
          shipping_postal: b.shippingSameAsBilling ? b.billingPostal ?? null : b.shippingPostal ?? null,
          vat_payer: b.vatPayer,
          vat_number: b.vatPayer ? b.vatNumber ?? null : null,
          vat_code: b.vatPayer ? b.vatNumber ?? null : null,
          eu_vat_id: b.euVatId ?? null,
        }
      : { company: input.company ?? null };
    await supabase
      .from("profiles")
      .upsert({ ...baseRow, ...businessRow }, { onConflict: "id" });
  }

  if (data.session) {
    return { ok: true, requiresEmailConfirmation: false };
  }
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
