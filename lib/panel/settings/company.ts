import { createClient } from "@/lib/supabase/server";

export type CompanyInfo = {
  name: string;
  legal_name: string;
  address: string;
  vat_number: string;
  email: string;
  phone: string;
};

export type BankInfo = {
  account_name: string;
  account_number: string;
  iban: string;
  swift: string;
  name: string;
};

const COMPANY_DEFAULTS: CompanyInfo = {
  name: "Inter-Bus Parts",
  legal_name: "Interbus SRL",
  address: "s. Sireți, r. Strășeni, MD-3731, Moldova",
  vat_number: "MD-8601124",
  email: "adrian@inter-bus.md",
  phone: "+373 680 59 005",
};

const BANK_DEFAULTS: BankInfo = {
  account_name: "Interbus SRL",
  account_number: "22513845876",
  iban: "MD33AG000000022513845876",
  swift: "AGRNMD2X",
  name: "BC MAIB S.A., suc. Alecu Russo",
};

function unquote(v: unknown): string {
  if (typeof v === "string") return v;
  if (v === null || v === undefined) return "";
  return String(v).replace(/^"|"$/g, "");
}

/**
 * Reads company.* and bank.* rows from panel_settings. Falls back to seeded
 * defaults if a row is missing (so print pages still render in dev).
 */
export async function getCompanyAndBank(): Promise<{
  company: CompanyInfo;
  bank: BankInfo;
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("panel_settings")
    .select("key, value")
    .or("key.like.company.%,key.like.bank.%");

  const company: CompanyInfo = { ...COMPANY_DEFAULTS };
  const bank: BankInfo = { ...BANK_DEFAULTS };
  for (const row of data ?? []) {
    const v = unquote(row.value);
    switch (row.key) {
      case "company.name":          company.name = v; break;
      case "company.legal_name":    company.legal_name = v; break;
      case "company.address":       company.address = v; break;
      case "company.vat_number":    company.vat_number = v; break;
      case "company.email":         company.email = v; break;
      case "company.phone":         company.phone = v; break;
      case "bank.account_name":     bank.account_name = v; break;
      case "bank.account_number":   bank.account_number = v; break;
      case "bank.iban":             bank.iban = v; break;
      case "bank.swift":            bank.swift = v; break;
      case "bank.name":             bank.name = v; break;
    }
  }
  return { company, bank };
}
