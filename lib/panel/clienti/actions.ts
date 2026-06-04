"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPanelUser } from "@/lib/panel/auth";
import { verifyAdminPin } from "@/lib/panel/admin-pin";
import type { Database } from "@/lib/supabase/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const clientSchema = z.object({
  account_type: z.enum(["individual", "business"]).default("individual"),
  email: z.string().email().nullable().optional().or(z.literal("")),
  full_name: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  idno: z.string().nullable().optional(),
  legal_form: z.string().nullable().optional(),
  contact_position: z.string().nullable().optional(),
  vat_code: z.string().nullable().optional(),
  discount_percent: z.number().min(0).max(100).nullable().optional(),
  language: z.enum(["ro", "en", "ru"]).default("ro"),
  billing_country: z.string().nullable().optional(),
  billing_street: z.string().nullable().optional(),
  billing_city: z.string().nullable().optional(),
  billing_district: z.string().nullable().optional(),
  billing_postal: z.string().nullable().optional(),
  shipping_same_as_billing: z.boolean().default(true),
  shipping_country: z.string().nullable().optional(),
  shipping_street: z.string().nullable().optional(),
  shipping_city: z.string().nullable().optional(),
  shipping_district: z.string().nullable().optional(),
  shipping_postal: z.string().nullable().optional(),
});

export type PanelClientInput = z.infer<typeof clientSchema>;

function normalize(input: PanelClientInput) {
  return {
    ...input,
    email: input.email && input.email.trim().length > 0 ? input.email.trim() : null,
    full_name:
      input.full_name && input.full_name.trim().length > 0
        ? input.full_name.trim()
        : [input.first_name, input.last_name].filter(Boolean).join(" ").trim() ||
          null,
  };
}

/**
 * Create a new client by provisioning an auth.users row (via service-role
 * admin client) and then filling in the auto-created profile with the
 * panel-supplied fields. If no email is given, generates a stable placeholder
 * (panel-{uuid}@inter-bus.md) so the auth.users insert can succeed — these
 * placeholder users can't log in (no password set).
 */
export async function createPanelClient(
  raw: unknown,
): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = clientSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const input = normalize(parsed.data);

  // Need at least a name or company to identify the client.
  const displayName =
    input.account_type === "business"
      ? (input.company_name ?? input.full_name)?.trim()
      : input.full_name?.trim();
  if (!displayName) {
    return {
      ok: false,
      reason:
        input.account_type === "business"
          ? "company_name_required"
          : "full_name_required",
    };
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : "missing_service_role",
    };
  }

  const placeholderEmail =
    input.email ?? `panel-${randomUUID()}@inter-bus.md`;

  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email: placeholderEmail,
    email_confirm: true,
    user_metadata: {
      full_name: input.full_name ?? displayName,
      phone: input.phone ?? undefined,
      language: input.language,
      panel_managed: true,
    },
  });
  if (authErr || !created?.user) {
    return {
      ok: false,
      reason: authErr?.message ?? "auth_create_failed",
    };
  }
  const userId = created.user.id;

  // The handle_new_user trigger already inserted a basic profile row.
  // Fill in the B2B / billing fields.
  const profileUpdate: ProfileUpdate = {
    account_type: input.account_type,
    first_name: input.first_name ?? null,
    last_name: input.last_name ?? null,
    company_name: input.company_name ?? null,
    idno: input.idno ?? null,
    legal_form: input.legal_form ?? null,
    contact_position: input.contact_position ?? null,
    vat_code: input.vat_code ?? null,
    phone: input.phone ?? null,
    full_name: input.full_name ?? displayName,
    discount_percent: input.discount_percent ?? 0,
    billing_country: input.billing_country ?? null,
    billing_street: input.billing_street ?? null,
    billing_city: input.billing_city ?? null,
    billing_district: input.billing_district ?? null,
    billing_postal: input.billing_postal ?? null,
    shipping_same_as_billing: input.shipping_same_as_billing,
    shipping_country: input.shipping_same_as_billing
      ? null
      : (input.shipping_country ?? null),
    shipping_street: input.shipping_same_as_billing
      ? null
      : (input.shipping_street ?? null),
    shipping_city: input.shipping_same_as_billing
      ? null
      : (input.shipping_city ?? null),
    shipping_district: input.shipping_same_as_billing
      ? null
      : (input.shipping_district ?? null),
    shipping_postal: input.shipping_same_as_billing
      ? null
      : (input.shipping_postal ?? null),
    updated_at: new Date().toISOString(),
  };

  const { error: profileErr } = await admin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId);
  if (profileErr) {
    // Best-effort cleanup: remove the auth user so we don't leak orphans.
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    return { ok: false, reason: profileErr.message };
  }

  revalidatePath("/[locale]/panel/clienti", "page");
  return { ok: true, id: userId };
}

export async function updatePanelClient(
  id: string,
  raw: unknown,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const parsed = clientSchema.partial().safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0]?.message ?? "invalid_input" };
  }
  const input = parsed.data;

  const supabase = await createClient();
  const update: ProfileUpdate = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    (update as Record<string, unknown>)[k] = v === "" ? null : v;
  }
  const { error } = await supabase.from("profiles").update(update).eq("id", id);
  if (error) return { ok: false, reason: error.message };
  revalidatePath(`/[locale]/panel/clienti/${id}`, "page");
  revalidatePath("/[locale]/panel/clienti", "page");
  return { ok: true };
}

/**
 * Hard-delete a client. PIN-gated. Detaches references from orders /
 * invoices first so the FK doesn't block the delete. The auth.users
 * row is dropped via the admin API since cascade isn't configured on
 * profiles → auth.users.
 */
export async function deleteClientWithPin(
  id: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };
  if (!verifyAdminPin(pin)) return { ok: false, reason: "bad_pin" };
  if (id === user.id) return { ok: false, reason: "cannot_delete_self" };
  const supabase = await createClient();

  // Detach references so the profile row can drop without FK errors.
  // Orders / invoices stay — they keep their customer_snapshot, just
  // lose the live link to the (now deleted) profile.
  await supabase.from("orders").update({ user_id: null }).eq("user_id", id);

  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };

  // Auth row is admin-API only; ignore failures so the panel still
  // moves on (profile already gone is the source of truth for the UI).
  try {
    const admin = getSupabaseAdmin();
    await admin.auth.admin.deleteUser(id);
  } catch (e) {
    console.warn("[panel.clienti] auth.deleteUser failed (non-fatal):", e);
  }

  revalidatePath("/[locale]/panel/clienti", "page");
  return { ok: true };
}

