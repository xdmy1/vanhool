import "server-only";

import { getOdooClient } from "./client";
import { findProductByCode } from "./products";

export type OdooOrderLineInput = {
  /** Either supply Odoo product id directly, or part_code to look up. */
  productOdooId?: number;
  partCode?: string;
  /** Free-text description, used if product can't be matched. */
  name?: string;
  quantity: number;
  /** Unit price in EUR. If omitted, Odoo uses the product list price. */
  unitPrice?: number;
};

export type CreateSaleOrderInput = {
  partnerId: number;
  /** Internal reference shown on the document (e.g. our short order id). */
  clientReference?: string;
  notes?: string;
  lines: OdooOrderLineInput[];
  /** "draft" = quotation, "sent" = quotation sent. We push as draft and
   *   confirm (state→"sale") only when payment / shipping is settled. */
  confirm?: boolean;
};

export type CreateSaleOrderResult = {
  orderId: number;
  /** Odoo's human reference like "S00042". */
  reference: string;
};

/**
 * Create a sale.order in Odoo. Lines that match a product (by code) become
 * proper product lines; lines that don't are stored as section comments so
 * nothing is lost.
 */
export async function createSaleOrder(
  input: CreateSaleOrderInput,
): Promise<CreateSaleOrderResult> {
  const client = getOdooClient();

  const orderLines: unknown[] = [];
  for (const line of input.lines) {
    let productId = line.productOdooId ?? null;
    if (!productId && line.partCode) {
      const p = await findProductByCode(line.partCode);
      productId = p?.id ?? null;
    }

    if (productId) {
      orderLines.push([
        0,
        0,
        {
          product_id: productId,
          product_uom_qty: line.quantity,
          ...(typeof line.unitPrice === "number"
            ? { price_unit: line.unitPrice }
            : {}),
          ...(line.name ? { name: line.name } : {}),
        },
      ]);
    } else {
      // Note line — keeps the item visible without binding to a product.
      orderLines.push([
        0,
        0,
        {
          display_type: "line_note",
          name: line.name ?? line.partCode ?? "Item without code",
        },
      ]);
    }
  }

  const orderId = await client.create("sale.order", {
    partner_id: input.partnerId,
    client_order_ref: input.clientReference ?? false,
    note: input.notes ?? false,
    order_line: orderLines,
  });

  if (input.confirm) {
    await client.callMethod("sale.order", "action_confirm", [orderId]);
  }

  const [row] = await client.searchRead<{ name: string }>(
    "sale.order",
    [["id", "=", orderId]],
    { fields: ["name"], limit: 1 },
  );

  return {
    orderId,
    reference: row?.name ?? `S${orderId}`,
  };
}

export async function confirmSaleOrder(orderId: number): Promise<boolean> {
  const client = getOdooClient();
  return client.callMethod<boolean>("sale.order", "action_confirm", [orderId]);
}

export async function cancelSaleOrder(orderId: number): Promise<boolean> {
  const client = getOdooClient();
  return client.callMethod<boolean>("sale.order", "action_cancel", [orderId]);
}

/**
 * A "quotation" in Odoo is just a sale.order in state="draft". This helper is
 * an alias that documents intent for the admin UI.
 */
export async function createQuotation(
  input: Omit<CreateSaleOrderInput, "confirm">,
): Promise<CreateSaleOrderResult> {
  return createSaleOrder({ ...input, confirm: false });
}

export async function getSaleOrder(orderId: number) {
  const client = getOdooClient();
  const [row] = await client.searchRead<{
    id: number;
    name: string;
    state: string;
    amount_total: number;
    partner_id: [number, string] | false;
    invoice_status: string;
  }>(
    "sale.order",
    [["id", "=", orderId]],
    {
      fields: ["id", "name", "state", "amount_total", "partner_id", "invoice_status"],
      limit: 1,
    },
  );
  return row ?? null;
}
