import "server-only";

export type OdooConfig = {
  url: string;
  db: string;
  user: string;
  apiKey: string;
  webhookSecret: string;
  companyId: number | null;
};

export class OdooConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OdooConfigError";
  }
}

let cached: OdooConfig | null = null;

export function getOdooConfig(): OdooConfig {
  if (cached) return cached;
  const url = (process.env.ODOO_URL ?? "").replace(/\/+$/, "");
  const db = process.env.ODOO_DB ?? "";
  const user = process.env.ODOO_USER ?? "";
  const apiKey = process.env.ODOO_API_KEY ?? "";
  const webhookSecret = process.env.ODOO_WEBHOOK_SECRET ?? "";
  if (!url) throw new OdooConfigError("ODOO_URL is not set");
  if (!db) throw new OdooConfigError("ODOO_DB is not set");
  if (!user) throw new OdooConfigError("ODOO_USER is not set");
  if (!apiKey) throw new OdooConfigError("ODOO_API_KEY is not set");
  const companyRaw = process.env.ODOO_COMPANY_ID?.trim();
  const companyId =
    companyRaw && companyRaw.length > 0 ? Number(companyRaw) : null;
  cached = {
    url,
    db,
    user,
    apiKey,
    webhookSecret,
    companyId: Number.isFinite(companyId as number) ? companyId : null,
  };
  return cached;
}

export function isOdooConfigured(): boolean {
  return !!(
    process.env.ODOO_URL &&
    process.env.ODOO_DB &&
    process.env.ODOO_USER &&
    process.env.ODOO_API_KEY
  );
}

export function isOdooWebhookConfigured(): boolean {
  return !!process.env.ODOO_WEBHOOK_SECRET;
}
