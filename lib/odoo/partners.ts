import "server-only";

import { getOdooClient } from "./client";

export type OdooPartner = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  zip: string | null;
  country_id: [number, string] | false;
  is_company: boolean;
  vat: string | null;
};

const PARTNER_FIELDS = [
  "id",
  "name",
  "email",
  "phone",
  "street",
  "city",
  "zip",
  "country_id",
  "is_company",
  "vat",
] as const;

export async function findPartnerByEmail(email: string): Promise<OdooPartner | null> {
  const client = getOdooClient();
  const rows = await client.searchRead<OdooPartner>(
    "res.partner",
    [["email", "=ilike", email.trim()]],
    { fields: [...PARTNER_FIELDS], limit: 1 },
  );
  return rows[0] ?? null;
}

export async function findPartnerById(id: number): Promise<OdooPartner | null> {
  const client = getOdooClient();
  const rows = await client.searchRead<OdooPartner>(
    "res.partner",
    [["id", "=", id]],
    { fields: [...PARTNER_FIELDS], limit: 1 },
  );
  return rows[0] ?? null;
}

export type UpsertPartnerInput = {
  email: string;
  name: string;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  zip?: string | null;
  countryCode?: string | null; // ISO-2 e.g. "MD"
  vat?: string | null;
  company?: string | null;
};

/**
 * Find a partner by email; create one if missing. Returns the Odoo partner id.
 * Used when a web order comes in for a customer that may not exist in Odoo yet.
 */
export async function upsertPartner(input: UpsertPartnerInput): Promise<number> {
  const client = getOdooClient();
  const existing = await findPartnerByEmail(input.email);

  const payload: Record<string, unknown> = {
    name: input.company?.trim() || input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || false,
    street: input.street?.trim() || false,
    city: input.city?.trim() || false,
    zip: input.zip?.trim() || false,
    is_company: !!input.company,
    vat: input.vat?.trim() || false,
  };

  if (input.countryCode) {
    const countries = await client.searchRead<{ id: number }>(
      "res.country",
      [["code", "=", input.countryCode.toUpperCase()]],
      { fields: ["id"], limit: 1 },
    );
    if (countries[0]) payload.country_id = countries[0].id;
  }

  if (existing) {
    await client.write("res.partner", [existing.id], payload);
    return existing.id;
  }
  return client.create("res.partner", payload);
}
