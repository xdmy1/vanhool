import "server-only";

import { getOdooClient, OdooError } from "./client";

/**
 * Trigger Odoo's "Create Invoice" flow on a sale order. Returns the resulting
 * invoice (account.move) ids.
 *
 * Workflow in Odoo terms:
 *   sale.order._create_invoices() → returns one or more account.move records
 *   account.move.action_post() → "validates" / posts the invoice
 *
 * The web layer typically only needs to call this once per order.
 */
export async function createInvoiceFromSaleOrder(
  saleOrderId: number,
  options: { post?: boolean } = {},
): Promise<number[]> {
  const client = getOdooClient();

  // _create_invoices is a private-ish method but exposed via XML-RPC. It
  // returns a recordset of account.move; supabase-style result is a list of
  // invoice ids when called via the create_invoices wizard. Use the public
  // wizard `sale.advance.payment.inv` to be safe across versions.
  const wizardId = await client.create("sale.advance.payment.inv", {
    advance_payment_method: "delivered",
    consolidated_billing: false,
  });

  const res = (await client.execute<{ res_id?: number; res_ids?: number[] } | unknown[]>(
    "sale.advance.payment.inv",
    "create_invoices",
    [[wizardId]],
    {
      context: { active_model: "sale.order", active_ids: [saleOrderId] },
    },
  )) as { res_id?: number; res_ids?: number[] } | unknown[];

  // Find the freshly created invoice via the sale order's invoice_ids field.
  const [order] = await client.searchRead<{ invoice_ids: number[] }>(
    "sale.order",
    [["id", "=", saleOrderId]],
    { fields: ["invoice_ids"], limit: 1 },
  );
  const ids = order?.invoice_ids ?? [];
  if (ids.length === 0) {
    throw new OdooError(
      "Odoo did not create any invoice — order may not have deliverable lines",
      500,
      res,
    );
  }

  if (options.post) {
    await client.callMethod("account.move", "action_post", ids);
  }

  return ids;
}

export async function getInvoice(id: number) {
  const client = getOdooClient();
  const [row] = await client.searchRead<{
    id: number;
    name: string;
    state: string;
    amount_total: number;
    invoice_date: string | false;
    payment_state: string;
  }>(
    "account.move",
    [["id", "=", id]],
    {
      fields: ["id", "name", "state", "amount_total", "invoice_date", "payment_state"],
      limit: 1,
    },
  );
  return row ?? null;
}

/**
 * Render the invoice as PDF and return a public-ish URL. Requires the
 * portal_share / website addon. For the simplest path, we return Odoo's
 * built-in report URL — accessible to anyone with the access token.
 */
export async function getInvoicePdfUrl(id: number): Promise<string> {
  const client = getOdooClient();
  const [row] = await client.searchRead<{ access_token: string | false }>(
    "account.move",
    [["id", "=", id]],
    { fields: ["access_token"], limit: 1 },
  );
  const token = row?.access_token;
  const base = client.config.url;
  if (token) {
    return `${base}/my/invoices/${id}?access_token=${token}&report_type=pdf&download=true`;
  }
  return `${base}/web#id=${id}&model=account.move&view_type=form`;
}
