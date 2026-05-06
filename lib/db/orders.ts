import { createClient } from "@/lib/supabase/server";

export type OrderRow = {
  id: string;
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  items: unknown;
  subtotal: number | null;
  discount_amount: number | null;
  shipping_cost: number | null;
  total: number | null;
  status: string | null;
  payment_method: string | null;
  notes: string | null;
  invoice_id: string | null;
  invoice_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  partCode: string;
  brand: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  shortId: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: string;
  paymentMethod: string | null;
  notes: string | null;
  invoiceUrl: string | null;
  createdAt: string;
};

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function parseItems(input: unknown): OrderItem[] {
  if (!Array.isArray(input)) return [];
  const out: OrderItem[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    out.push({
      productId: String(r.productId ?? r.product_id ?? r.id ?? ""),
      slug: String(r.slug ?? ""),
      name: String(r.name ?? ""),
      partCode: String(r.partCode ?? r.part_code ?? ""),
      brand: String(r.brand ?? ""),
      price: Number(r.price ?? r.unit_price ?? 0),
      quantity: Number(r.quantity ?? 1),
    });
  }
  return out;
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    shortId: shortId(row.id),
    userId: row.user_id,
    customerName: row.customer_name ?? "",
    customerEmail: row.customer_email ?? "",
    customerPhone: row.customer_phone ?? "",
    customerAddress: row.customer_address ?? "",
    items: parseItems(row.items),
    subtotal: Number(row.subtotal ?? 0),
    discount: Number(row.discount_amount ?? 0),
    shipping: Number(row.shipping_cost ?? 0),
    total: Number(row.total ?? 0),
    status: row.status ?? "pending",
    paymentMethod: row.payment_method,
    notes: row.notes,
    invoiceUrl: row.invoice_url,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("orders")
    .select(
      "id, user_id, customer_name, customer_email, customer_phone, customer_address, items, subtotal, discount_amount, shipping_cost, total, status, payment_method, notes, invoice_id, invoice_url, created_at, updated_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return ((data ?? []) as OrderRow[]).map(toOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, user_id, customer_name, customer_email, customer_phone, customer_address, items, subtotal, discount_amount, shipping_cost, total, status, payment_method, notes, invoice_id, invoice_url, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;
  return toOrder(data as OrderRow);
}
