"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isOdooConfigured } from "@/lib/odoo/config";
import {
  pullProducts,
  pushOrderToOdoo,
  refreshStockLevels,
  generateInvoiceForOrder,
} from "@/lib/odoo/sync";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) return { ok: false as const };
  return { ok: true as const };
}

export type SyncActionResult =
  | { ok: true; payload: unknown }
  | {
      ok: false;
      code: "forbidden" | "not_configured" | "remote_error";
      message?: string;
    };

export async function adminPullProducts(): Promise<SyncActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  if (!isOdooConfigured()) return { ok: false, code: "not_configured" };

  const res = await pullProducts();
  revalidatePath("/", "layout");
  if (!res.ok) {
    return {
      ok: false,
      code: "remote_error",
      message: res.message ?? res.errors[0] ?? "pull failed",
    };
  }
  return { ok: true, payload: { fetched: res.fetched, upserted: res.upserted } };
}

export async function adminRefreshStock(): Promise<SyncActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  if (!isOdooConfigured()) return { ok: false, code: "not_configured" };

  const res = await refreshStockLevels();
  revalidatePath("/", "layout");
  if (!res.ok) {
    return { ok: false, code: "remote_error", message: res.message };
  }
  return { ok: true, payload: { updated: res.updated } };
}

export async function adminRetryOrderPush(orderId: string): Promise<SyncActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  if (!isOdooConfigured()) return { ok: false, code: "not_configured" };

  const res = await pushOrderToOdoo(orderId);
  revalidatePath("/", "layout");
  if (!res.ok) {
    return {
      ok: false,
      code: res.reason === "not_configured" ? "not_configured" : "remote_error",
      message: res.message,
    };
  }
  return {
    ok: true,
    payload: {
      odooOrderId: res.odooOrderId,
      odooReference: res.odooReference,
    },
  };
}

export async function adminGenerateInvoice(
  orderId: string,
): Promise<SyncActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, code: "forbidden" };
  if (!isOdooConfigured()) return { ok: false, code: "not_configured" };

  const res = await generateInvoiceForOrder(orderId);
  revalidatePath("/", "layout");
  if (!res.ok) {
    return {
      ok: false,
      code: res.reason === "not_configured" ? "not_configured" : "remote_error",
      message: res.message ?? res.reason,
    };
  }
  return { ok: true, payload: { invoiceId: res.odooInvoiceId, pdfUrl: res.pdfUrl } };
}
