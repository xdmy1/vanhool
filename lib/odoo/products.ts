import "server-only";

import { getOdooClient } from "./client";

export type OdooProduct = {
  id: number;
  name: string;
  default_code: string | null; // internal reference / part code
  barcode: string | null;
  list_price: number;
  qty_available: number;
  active: boolean;
  description_sale: string | null;
  weight: number | null;
  /** [id, "Category Name"] tuple from Odoo */
  categ_id: [number, string] | false;
  type: string; // "consu" | "service" | (storable in 18: "consu" with is_storable)
};

const PRODUCT_FIELDS = [
  "id",
  "name",
  "default_code",
  "barcode",
  "list_price",
  "qty_available",
  "active",
  "description_sale",
  "weight",
  "categ_id",
  "type",
] as const;

export async function findProductByBarcode(barcode: string): Promise<OdooProduct | null> {
  const client = getOdooClient();
  const rows = await client.searchRead<OdooProduct>(
    "product.product",
    [["barcode", "=", barcode.trim()]],
    { fields: [...PRODUCT_FIELDS], limit: 1 },
  );
  return rows[0] ?? null;
}

export async function findProductByCode(code: string): Promise<OdooProduct | null> {
  const client = getOdooClient();
  const rows = await client.searchRead<OdooProduct>(
    "product.product",
    [["default_code", "=", code.trim()]],
    { fields: [...PRODUCT_FIELDS], limit: 1 },
  );
  return rows[0] ?? null;
}

export async function findProductById(id: number): Promise<OdooProduct | null> {
  const client = getOdooClient();
  const rows = await client.searchRead<OdooProduct>(
    "product.product",
    [["id", "=", id]],
    { fields: [...PRODUCT_FIELDS], limit: 1 },
  );
  return rows[0] ?? null;
}

/**
 * Page through all storable products. Use for the initial sync.
 * Pulls only "consu" / storable products (skips services).
 */
export async function listStorableProducts(opts: {
  limit?: number;
  offset?: number;
} = {}): Promise<OdooProduct[]> {
  const client = getOdooClient();
  return client.searchRead<OdooProduct>(
    "product.product",
    [
      ["active", "=", true],
      ["sale_ok", "=", true],
    ],
    {
      fields: [...PRODUCT_FIELDS],
      limit: opts.limit ?? 100,
      offset: opts.offset ?? 0,
      order: "id asc",
    },
  );
}

/** Fetch quantities only — cheap call used for periodic stock refresh. */
export async function listStockLevels(odooIds: number[]): Promise<
  Map<number, number>
> {
  if (odooIds.length === 0) return new Map();
  const client = getOdooClient();
  const rows = await client.searchRead<{ id: number; qty_available: number }>(
    "product.product",
    [["id", "in", odooIds]],
    { fields: ["id", "qty_available"], limit: odooIds.length },
  );
  const map = new Map<number, number>();
  for (const r of rows) map.set(r.id, Number(r.qty_available ?? 0));
  return map;
}
