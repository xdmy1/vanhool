"use server";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";
import { getPanelSettings, updatePanelSettings } from "@/lib/panel/settings/actions";
import { formatInternalCode } from "@/lib/panel/codes/format";

const MAX_RETRIES = 5;

export type GeneratedCode = { ok: true; code: string; seq: number; letter: string };
export type GenerateError = { ok: false; reason: string };

/**
 * Atomically reserve the next internal code. Calls the `next_internal_code`
 * RPC which locks the sequence row and increments. On collision with an
 * existing product or purchase line, bumps the letter and retries up to 5×.
 */
export async function generateInternalCode(opts?: {
  categorySlug?: string;
}): Promise<GeneratedCode | GenerateError> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const supabase = await createClient();
  const settings = await getPanelSettings();
  const template = settings.internalCodeTemplate || "{seq:7}{letter}";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { data: rpc, error } = await supabase.rpc("next_internal_code");
    if (error || !rpc) {
      return { ok: false, reason: error?.message ?? "rpc_failed" };
    }
    const seq = Number(rpc.next_seq);
    const letter = rpc.next_letter;
    const code = formatInternalCode(template, seq, letter, opts?.categorySlug);

    // Collision check against products.part_code and purchase_items.internal_code
    const [partRes, lineRes] = await Promise.all([
      supabase
        .from("products")
        .select("id", { head: true, count: "exact" })
        .eq("part_code", code),
      supabase
        .from("purchase_items")
        .select("id", { head: true, count: "exact" })
        .eq("internal_code", code),
    ]);
    const collision = (partRes.count ?? 0) > 0 || (lineRes.count ?? 0) > 0;
    if (!collision) {
      return { ok: true, code, seq, letter };
    }

    // Bump the letter and retry. Wraps Z → AA after 25 single-letter
    // fallbacks; AA is acceptable in the wild for our usage.
    const nextLetter = bumpLetter(letter);
    const updated = await updatePanelSettings({ internalCodeLetter: nextLetter });
    if (!updated.ok) return { ok: false, reason: updated.reason };
  }

  return { ok: false, reason: "max_retries_exceeded" };
}

function bumpLetter(current: string): string {
  if (!current) return "A";
  const code = current.toUpperCase().charCodeAt(0);
  if (code < 90) return String.fromCharCode(code + 1);
  return "AA";
}
