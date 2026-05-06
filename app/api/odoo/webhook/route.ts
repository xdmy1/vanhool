import { NextResponse } from "next/server";
import crypto from "node:crypto";

import {
  isOdooConfigured,
  isOdooWebhookConfigured,
  getOdooConfig,
} from "@/lib/odoo/config";
import { applyProductUpdate, logSync } from "@/lib/odoo/sync";

/**
 * Odoo webhook endpoint. Configured in Odoo as an Automation Rule with a
 * Python action that POSTs JSON here, signed with HMAC-SHA256 (header
 * `x-odoo-signature`, secret = ODOO_WEBHOOK_SECRET).
 *
 * See docs/odoo-setup.md §5.
 */
export async function POST(request: Request) {
  if (!isOdooConfigured() || !isOdooWebhookConfigured()) {
    return NextResponse.json(
      { ok: false, error: "odoo_not_configured" },
      { status: 503 },
    );
  }
  const cfg = getOdooConfig();

  const raw = await request.text();
  const signature = request.headers.get("x-odoo-signature") ?? "";
  const expected = crypto
    .createHmac("sha256", cfg.webhookSecret)
    .update(raw)
    .digest("hex");

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    )
  ) {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const event = String(body.event ?? "");
  const model = String(body.model ?? "");

  try {
    if (
      (event === "product.updated" || model === "product.product") &&
      typeof body.id === "number"
    ) {
      const ok = await applyProductUpdate({
        id: body.id,
        qty_available:
          typeof body.qty_available === "number"
            ? body.qty_available
            : undefined,
        list_price:
          typeof body.list_price === "number" ? body.list_price : undefined,
        barcode:
          typeof body.barcode === "string" || body.barcode === null
            ? (body.barcode as string | null)
            : undefined,
        active: typeof body.active === "boolean" ? body.active : undefined,
      });
      return NextResponse.json({ ok, matched: ok ? 1 : 0 });
    }

    // Unknown event — log and acknowledge so Odoo doesn't keep retrying.
    await logSync({
      direction: "webhook",
      operation: `unhandled.${event || model || "unknown"}`,
      success: true,
      detail: body,
    });
    return NextResponse.json({ ok: true, matched: 0, ignored: true });
  } catch (e) {
    await logSync({
      direction: "webhook",
      operation: `error.${event || model || "unknown"}`,
      success: false,
      detail: { error: e instanceof Error ? e.message : String(e), body },
    });
    return NextResponse.json({ ok: false, error: "handler_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: isOdooConfigured() && isOdooWebhookConfigured(),
    message: "POST signed JSON to this endpoint to send Odoo webhooks.",
  });
}
