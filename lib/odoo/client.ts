import "server-only";

import { getOdooConfig, type OdooConfig } from "./config";

export class OdooError extends Error {
  status: number;
  detail?: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "OdooError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Minimal zero-dep JSON-RPC client for Odoo's external API.
 * Auth is via API key (created in Odoo: Settings → Users → API Keys).
 *
 * Reference: https://www.odoo.com/documentation/18.0/developer/reference/external_api.html
 */
export class OdooClient {
  private uid: number | null = null;

  constructor(public readonly config: OdooConfig = getOdooConfig()) {}

  /** Authenticate (cached for the lifetime of this instance). */
  async authenticate(): Promise<number> {
    if (this.uid != null) return this.uid;
    const res = await this.rpc("common", "authenticate", [
      this.config.db,
      this.config.user,
      this.config.apiKey,
      {},
    ]);
    // Odoo returns false for auth failure, otherwise a positive uid number.
    if (typeof res !== "number" || res === 0) {
      throw new OdooError("Odoo authentication failed", 401, res);
    }
    this.uid = res;
    return res;
  }

  /**
   * Generic Odoo ORM call. Equivalent to:
   *   self.env[model].method(*args, **kwargs)
   *
   * Examples:
   *   await client.execute<number[]>("res.partner", "search",
   *     [[["email", "=", "x@y.com"]]], { limit: 1 });
   *   await client.execute("sale.order", "create", [{ partner_id: 5, … }]);
   */
  async execute<T = unknown>(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {},
  ): Promise<T> {
    const uid = await this.authenticate();
    const ctx = this.config.companyId
      ? { ...((kwargs.context as Record<string, unknown>) ?? {}), allowed_company_ids: [this.config.companyId] }
      : (kwargs.context as Record<string, unknown> | undefined);
    const finalKwargs = ctx ? { ...kwargs, context: ctx } : kwargs;
    return this.rpc("object", "execute_kw", [
      this.config.db,
      uid,
      this.config.apiKey,
      model,
      method,
      args,
      finalKwargs,
    ]) as Promise<T>;
  }

  /** Convenience wrapper for the common `search_read` pattern. */
  async searchRead<T = Record<string, unknown>>(
    model: string,
    domain: unknown[] = [],
    options: { fields?: string[]; limit?: number; offset?: number; order?: string } = {},
  ): Promise<T[]> {
    return this.execute<T[]>(model, "search_read", [domain], {
      fields: options.fields,
      limit: options.limit,
      offset: options.offset,
      order: options.order,
    });
  }

  async create(model: string, values: Record<string, unknown>): Promise<number> {
    const id = await this.execute<number>(model, "create", [values]);
    return id;
  }

  async write(
    model: string,
    ids: number[],
    values: Record<string, unknown>,
  ): Promise<boolean> {
    return this.execute<boolean>(model, "write", [ids, values]);
  }

  async unlink(model: string, ids: number[]): Promise<boolean> {
    return this.execute<boolean>(model, "unlink", [ids]);
  }

  async callMethod<T = unknown>(
    model: string,
    method: string,
    ids: number[],
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {},
  ): Promise<T> {
    return this.execute<T>(model, method, [ids, ...args], kwargs);
  }

  /** Low-level JSON-RPC call. */
  private async rpc(
    service: "common" | "object",
    method: string,
    args: unknown[],
  ): Promise<unknown> {
    const body = JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { service, method, args },
      id: Math.floor(Math.random() * 1e9),
    });

    let res: Response;
    try {
      res = await fetch(`${this.config.url}/jsonrpc`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        cache: "no-store",
      });
    } catch (cause) {
      throw new OdooError(
        `Odoo network error: ${cause instanceof Error ? cause.message : "unknown"}`,
        0,
        cause,
      );
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new OdooError(`Odoo HTTP ${res.status}`, res.status, text);
    }

    const data = (await res.json()) as
      | { result: unknown }
      | { error: { code: number; message: string; data?: { message?: string } } };

    if ("error" in data) {
      const msg = data.error.data?.message ?? data.error.message;
      throw new OdooError(`Odoo: ${msg}`, data.error.code ?? 500, data.error);
    }
    return data.result;
  }
}

let cachedClient: OdooClient | null = null;
export function getOdooClient(): OdooClient {
  if (!cachedClient) cachedClient = new OdooClient();
  return cachedClient;
}
