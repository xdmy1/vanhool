"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getPanelUser } from "@/lib/panel/auth";
import type { Json } from "@/lib/supabase/database.types";

export type PanelSettings = {
  internalCodeTemplate: string;
  internalCodeSequence: number;
  internalCodeLetter: string;
  invoiceSeries: string;
  invoiceNextNumber: number;
  deliveryNoteSeries: string;
  deliveryNoteNextNumber: number;
};

const DEFAULTS: PanelSettings = {
  internalCodeTemplate: "{seq:7}{letter}",
  internalCodeSequence: 0,
  internalCodeLetter: "A",
  invoiceSeries: "IB",
  invoiceNextNumber: 1,
  deliveryNoteSeries: "FL",
  deliveryNoteNextNumber: 1,
};

const KEY_MAP = {
  internalCodeTemplate: "internal_code.template",
  internalCodeSequence: "internal_code.sequence",
  internalCodeLetter: "internal_code.letter",
  invoiceSeries: "invoice.series",
  invoiceNextNumber: "invoice.next_number",
  deliveryNoteSeries: "delivery_note.series",
  deliveryNoteNextNumber: "delivery_note.next_number",
} as const;

type SettingKey = keyof PanelSettings;

function castValue<K extends SettingKey>(key: K, raw: unknown): PanelSettings[K] {
  // panel_settings.value is jsonb — strings come back as strings, numbers as numbers.
  switch (key) {
    case "internalCodeSequence":
    case "invoiceNextNumber":
    case "deliveryNoteNextNumber":
      return (typeof raw === "number" ? raw : Number(raw)) as PanelSettings[K];
    default:
      return (typeof raw === "string" ? raw : String(raw ?? "")) as PanelSettings[K];
  }
}

export async function getPanelSettings(): Promise<PanelSettings> {
  const user = await getPanelUser();
  if (!user) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("panel_settings")
    .select("key, value");
  if (error) {
    // Most likely the migration hasn't been applied yet — return defaults so
    // the settings page can still render and the admin can fix it.
    return DEFAULTS;
  }

  const out: PanelSettings = { ...DEFAULTS };
  for (const row of data ?? []) {
    const tsKey = (Object.keys(KEY_MAP) as SettingKey[]).find(
      (k) => KEY_MAP[k] === row.key,
    );
    if (!tsKey) continue;
    (out[tsKey] as unknown) = castValue(tsKey, row.value);
  }
  return out;
}

export type UpdatePanelSettingsInput = Partial<PanelSettings>;

export async function updatePanelSettings(
  input: UpdatePanelSettingsInput,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const user = await getPanelUser();
  if (!user) return { ok: false, reason: "unauthorized" };

  const supabase = await createClient();

  const rows = (Object.keys(input) as SettingKey[])
    .filter((k) => input[k] !== undefined)
    .map((k) => ({
      key: KEY_MAP[k] as string,
      value: (input[k] ?? null) as Json,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    }));
  if (rows.length === 0) return { ok: true };

  const { error } = await supabase
    .from("panel_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) return { ok: false, reason: error.message };

  revalidatePath("/[locale]/panel/setari", "page");
  return { ok: true };
}
