"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { sendResendEmail, getAdminEmail } from "@/lib/email/resend";
import { contactAdminEmail } from "@/lib/email/templates";

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z.string().min(5).max(2000),
  topic: z.enum(["general", "part_id", "order", "warranty", "other"]).optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;

export type ContactResult =
  | { ok: true }
  | { ok: false; code: "validation" | "server"; message?: string };

export async function submitContact(values: unknown): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(values);
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

  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
    topic: parsed.data.topic ?? "general",
    user_id: user?.id ?? null,
  });

  if (error) return { ok: false, code: "server", message: error.message };

  // Fire-and-forget admin notification.
  const mail = contactAdminEmail({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    topic: parsed.data.topic ?? "general",
    subject: parsed.data.subject || null,
    message: parsed.data.message,
  });
  void sendResendEmail({
    to: getAdminEmail(),
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo: { email: parsed.data.email, name: parsed.data.name },
  }).catch((e) => console.error("[resend] contact email failed:", e));

  return { ok: true };
}
