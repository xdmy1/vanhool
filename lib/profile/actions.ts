"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().max(40).optional().or(z.literal("")),
  language: z.enum(["ro", "en", "ru"]).optional(),
});

export type ProfileResult =
  | { ok: true }
  | { ok: false; code: "validation" | "server" | "not_authenticated"; message?: string };

export async function updateProfile(values: unknown): Promise<ProfileResult> {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "not_authenticated" };

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
        language: parsed.data.language ?? null,
      },
      { onConflict: "id" },
    );

  if (error) return { ok: false, code: "server", message: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

const passwordSchema = z
  .object({
    newPassword: z.string().min(8).max(72),
    confirm: z.string().min(8).max(72),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ["confirm"],
    message: "passwords_mismatch",
  });

export type PasswordResult =
  | { ok: true }
  | { ok: false; code: "validation" | "server" | "not_authenticated"; message?: string };

export async function changePassword(values: unknown): Promise<PasswordResult> {
  const parsed = passwordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      message: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "not_authenticated" };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });
  if (error) return { ok: false, code: "server", message: error.message };
  return { ok: true };
}
