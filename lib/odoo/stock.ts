import "server-only";

import { getOdooClient } from "./client";

export type StockQuant = {
  id: number;
  product_id: [number, string] | false;
  location_id: [number, string] | false;
  quantity: number;
  reserved_quantity: number;
};

/** Return on-hand quantities per Odoo product id, summed across locations. */
export async function getOnHandByProduct(
  productIds: number[],
): Promise<Map<number, number>> {
  if (productIds.length === 0) return new Map();
  const client = getOdooClient();
  const rows = await client.searchRead<StockQuant>(
    "stock.quant",
    [
      ["product_id", "in", productIds],
      ["location_id.usage", "=", "internal"],
    ],
    { fields: ["product_id", "quantity", "reserved_quantity"], limit: 5000 },
  );
  const map = new Map<number, number>();
  for (const r of rows) {
    if (!Array.isArray(r.product_id)) continue;
    const id = r.product_id[0];
    const free = Number(r.quantity ?? 0) - Number(r.reserved_quantity ?? 0);
    map.set(id, (map.get(id) ?? 0) + Math.max(0, free));
  }
  return map;
}

export type WarehouseInfo = {
  id: number;
  name: string;
  code: string;
};

export async function listWarehouses(): Promise<WarehouseInfo[]> {
  const client = getOdooClient();
  return client.searchRead<WarehouseInfo>(
    "stock.warehouse",
    [],
    { fields: ["id", "name", "code"], limit: 50, order: "id asc" },
  );
}
