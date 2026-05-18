import { createClient } from "@/lib/supabase/server";

/**
 * Full company profile rendered on every document (proforma, invoice, PO,
 * delivery sheet). Sourced from panel_settings `company.*` rows; defaults
 * below mirror the official Inter Bus Parts S.R.L. registration data so the
 * app keeps working even before the rows are upserted in Supabase.
 */
export type CompanyInfo = {
  /** Brand / short display name (e.g. "Inter Bus Parts"). */
  name: string;
  /** Legal entity name as used in contracts (e.g. "Inter Bus Parts S.R.L."). */
  legal_name: string;
  /** Full legal denomination ("Societatea cu Răspundere Limitată …"). */
  full_legal_name: string;
  /** Legal form code: SRL, SA, II, etc. */
  legal_form: string;
  /** Administrator / authorised signatory. */
  administrator: string;
  /** Single-line registered address. */
  address: string;
  country: string;
  /** Fiscal code / IDNO (Moldova). 13 digits. */
  idno: string;
  /** VAT registration number, separate from IDNO. */
  vat_registration_number: string;
  /** ISO date string of state registration. */
  registration_date: string;
  email: string;
  phone: string;
  website: string;
};

export type BankAccount = {
  currency: string;
  iban: string;
  bank_name: string;
  swift: string;
  account_holder: string;
  account_number?: string | null;
};

const COMPANY_DEFAULTS: CompanyInfo = {
  name: "Inter Bus Parts",
  legal_name: "Inter Bus Parts S.R.L.",
  full_legal_name: "Societatea cu Răspundere Limitată „Inter Bus Parts”",
  legal_form: "SRL",
  administrator: "Adrian Oborocean",
  address: "MD-2071, str. Liviu Deleanu 10/19, ap. 28, mun. Chișinău, Republica Moldova",
  country: "Republica Moldova",
  idno: "1026023029685",
  vat_registration_number: "0510688",
  registration_date: "2026-04-30",
  email: "adrian@inter-bus.md",
  phone: "+373 68 059 005",
  website: "www.inter-bus.md",
};

const BANK_DEFAULTS: BankAccount[] = [
  {
    currency: "MDL",
    iban: "MD44AG000000022517532551",
    bank_name: "maib (BC MAIB S.A.)",
    swift: "AGRNMD2X",
    account_holder: "Inter Bus Parts S.R.L.",
    account_number: "22517532551",
  },
  {
    currency: "EUR",
    iban: "MD40AG000000022517532623",
    bank_name: "maib (BC MAIB S.A.)",
    swift: "AGRNMD2X",
    account_holder: "Inter Bus Parts S.R.L.",
    account_number: "22517532623",
  },
];

function unquote(v: unknown): string {
  if (typeof v === "string") return v;
  if (v === null || v === undefined) return "";
  return String(v).replace(/^"|"$/g, "");
}

/**
 * Reads company.* and bank.* rows from panel_settings and returns a typed
 * profile + bank-accounts list. Falls back to seeded defaults if any row is
 * missing.
 *
 * New layout uses currency-suffixed bank keys (bank.mdl.*, bank.eur.*); the
 * legacy single-bank keys (bank.iban / bank.account_name / …) are still
 * recognised and mapped to the MDL slot for backwards compatibility.
 */
export async function getCompanyAndBank(): Promise<{
  company: CompanyInfo;
  banks: BankAccount[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("panel_settings")
    .select("key, value")
    .or("key.like.company.%,key.like.bank.%");

  const company: CompanyInfo = { ...COMPANY_DEFAULTS };
  // Per-currency banks keyed by currency code.
  const bankMap = new Map<string, BankAccount>();
  for (const b of BANK_DEFAULTS) bankMap.set(b.currency, { ...b });

  // Legacy single-bank pieces buffered until we know they apply to MDL.
  let legacy: Partial<BankAccount> = {};

  for (const row of data ?? []) {
    const v = unquote(row.value);
    if (row.key.startsWith("company.")) {
      switch (row.key) {
        case "company.name":                    company.name = v; break;
        case "company.legal_name":              company.legal_name = v; break;
        case "company.full_legal_name":         company.full_legal_name = v; break;
        case "company.legal_form":              company.legal_form = v; break;
        case "company.administrator":           company.administrator = v; break;
        case "company.address":                 company.address = v; break;
        case "company.country":                 company.country = v; break;
        case "company.idno":                    company.idno = v; break;
        case "company.vat_number":              if (!company.idno) company.idno = v; break;
        case "company.vat_registration_number": company.vat_registration_number = v; break;
        case "company.registration_date":       company.registration_date = v; break;
        case "company.email":                   company.email = v; break;
        case "company.phone":                   company.phone = v; break;
        case "company.website":                 company.website = v; break;
      }
      continue;
    }

    // bank.{currency}.{field} or legacy bank.{field}
    const parts = row.key.split(".");
    if (parts.length === 3) {
      const currency = parts[1].toUpperCase();
      const field = parts[2];
      const acc = bankMap.get(currency) ?? {
        currency,
        iban: "",
        bank_name: "",
        swift: "",
        account_holder: company.legal_name,
      };
      switch (field) {
        case "iban":            acc.iban = v; break;
        case "bank_name":       acc.bank_name = v; break;
        case "name":            acc.bank_name = v; break;
        case "swift":           acc.swift = v; break;
        case "account_holder":  acc.account_holder = v; break;
        case "account_name":    acc.account_holder = v; break;
        case "account_number":  acc.account_number = v; break;
      }
      bankMap.set(currency, acc);
    } else if (parts.length === 2) {
      // Legacy keys → folded into MDL at the end.
      switch (parts[1]) {
        case "iban":            legacy.iban = v; break;
        case "account_name":    legacy.account_holder = v; break;
        case "account_number":  legacy.account_number = v; break;
        case "name":            legacy.bank_name = v; break;
        case "swift":           legacy.swift = v; break;
      }
    }
  }

  // Fold legacy single-bank pieces into MDL only if MDL has no IBAN yet.
  const mdl = bankMap.get("MDL");
  if (mdl && !mdl.iban && legacy.iban) {
    bankMap.set("MDL", {
      currency: "MDL",
      iban: legacy.iban ?? "",
      bank_name: legacy.bank_name ?? mdl.bank_name,
      swift: legacy.swift ?? mdl.swift,
      account_holder: legacy.account_holder ?? mdl.account_holder,
      account_number: legacy.account_number ?? mdl.account_number ?? null,
    });
  }

  return {
    company,
    banks: Array.from(bankMap.values()).filter((b) => b.iban),
  };
}

/**
 * Pick the bank account matching the document currency. Falls back to the
 * first available bank if no exact match.
 */
export function pickBankForCurrency(
  banks: BankAccount[],
  currency: string,
): BankAccount | null {
  if (banks.length === 0) return null;
  const exact = banks.find((b) => b.currency === currency);
  return exact ?? banks[0];
}
