import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  verifyAccountantEnteredToken,
  type AccountantDocKind,
} from "@/lib/panel/accountant-entered";

export const dynamic = "force-dynamic";

function page(title: string, body: string, ok: boolean): Response {
  const html = `<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#f5f4f2;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px"><div style="background:#fff;border:1px solid #e5e2dd;border-radius:14px;padding:36px 30px;max-width:440px;text-align:center;box-shadow:0 10px 34px rgba(0,0,0,.06)"><div style="font-size:48px;line-height:1">${ok ? "✅" : "⚠️"}</div><h1 style="font-size:21px;margin:14px 0 8px;color:#1f1c19">${title}</h1><p style="font-size:14px;line-height:1.5;color:#6b6358;margin:0">${body}</p><div style="margin-top:22px;font-size:12px;color:#a8a29a">Inter Bus Parts</div></div></body></html>`;
  return new Response(html, {
    status: ok ? 200 : 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind");
  const id = searchParams.get("id");
  const token = searchParams.get("t");

  if ((kind !== "invoice" && kind !== "purchase") || !id || !token) {
    return page("Link invalid", "Linkul nu este complet sau corect.", false);
  }
  if (!verifyAccountantEnteredToken(kind as AccountantDocKind, id, token)) {
    return page("Link invalid", "Semnătura linkului nu este validă.", false);
  }

  const table = kind === "invoice" ? "invoices" : "purchases";
  // The accountant_entered_at column isn't in the generated types — use the
  // untyped client so the dynamic table + column don't fight the compiler.
  const admin = getSupabaseAdmin() as unknown as SupabaseClient;

  const { data: existing, error: readErr } = await admin
    .from(table)
    .select("accountant_entered_at")
    .eq("id", id)
    .maybeSingle();

  if (readErr) {
    return page(
      "Eroare",
      "Nu am putut citi documentul (posibil migrarea SQL nu e aplicată). Anunță Inter Bus.",
      false,
    );
  }
  if (!existing) {
    return page("Document inexistent", "Nu am găsit documentul.", false);
  }

  const already = (existing as { accountant_entered_at?: string | null })
    .accountant_entered_at;
  if (already) {
    return page(
      "Deja introdus",
      "Acest document era deja marcat ca <b>INTRODUS</b>. Nu trebuie să mai faci nimic.",
      true,
    );
  }

  const { error: updErr } = await admin
    .from(table)
    .update({ accountant_entered_at: new Date().toISOString() })
    .eq("id", id);
  if (updErr) {
    return page("Eroare", "Nu am putut salva starea. Anunță Inter Bus.", false);
  }

  return page(
    "Introdus ✓",
    "Mulțumim! Documentul a fost marcat ca <b>INTRODUS</b> în panelul Inter Bus.",
    true,
  );
}
