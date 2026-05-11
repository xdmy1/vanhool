import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  translateToAll,
  type TranslateLocale,
} from "@/lib/translation/translate";

const VALID: TranslateLocale[] = ["ro", "en", "ru"];

/**
 * POST /api/translate
 * Body: { source: "ro" | "en" | "ru", text: string }
 * Auth: admin only.
 * Returns: { ok: true, translations: { en?, ru?, ro? } } — the two non-source locales.
 */
export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (err) {
    console.error("[translate] unhandled error", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}

async function handle(request: Request) {
  // --- auth: admin only ---
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "not_authenticated" },
      { status: 401 },
    );
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  // --- input validation ---
  let body: { source?: unknown; text?: unknown };
  try {
    body = (await request.json()) as { source?: unknown; text?: unknown };
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }
  const source = String(body.source ?? "").toLowerCase();
  if (!VALID.includes(source as TranslateLocale)) {
    return NextResponse.json(
      { ok: false, error: "invalid_source" },
      { status: 400 },
    );
  }
  const text = typeof body.text === "string" ? body.text : "";
  if (!text.trim()) {
    return NextResponse.json(
      { ok: false, error: "empty_text" },
      { status: 400 },
    );
  }
  if (text.length > 5000) {
    return NextResponse.json(
      { ok: false, error: "too_long" },
      { status: 413 },
    );
  }

  const translations = await translateToAll(text, source as TranslateLocale);
  return NextResponse.json({ ok: true, translations });
}
