import { createClient } from "@/lib/supabase/server";
import type { AccountScope } from "@/lib/panel/scope";

export type PanelClientRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  account_type: "individual" | "business" | null;
  company_name: string | null;
  idno: string | null;
  discount_percent: number | null;
  created_at: string | null;
  orders_count: number;
  /**
   * Grouped per currency. Panel sales can be MDL/EUR/USD; storefront
   * orders are MDL. Summing across currencies and tagging the result
   * as `lei` was misleading (and is what the operator was seeing in the
   * client detail header). Empty object means no orders. UI must render
   * one entry per currency.
   */
  total_spent_by_currency: Record<string, number>;
};

const PAGE_SIZE = 50;

export type ListClientsArgs = {
  q?: string;
  scope: AccountScope;
  onlyWithTransactions?: boolean;
  page?: number;
};

/**
 * List profiles + aggregate per-scope totals. Walk-in (non-registered)
 * customers don't show here — only profiles. Aggregates come from `orders`
 * filtered to `account_scope = scope`.
 */
export async function listPanelClients(args: ListClientsArgs): Promise<{
  rows: PanelClientRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const page = Math.max(1, args.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, account_type, company_name, idno, discount_percent, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (args.q) {
    const q = `%${args.q.replace(/[%_]/g, "")}%`;
    query = query.or(
      `email.ilike.${q},full_name.ilike.${q},company_name.ilike.${q},idno.ilike.${q},phone.ilike.${q}`,
    );
  }

  const { data: profiles, count, error } = await query;
  if (error) throw new Error(error.message);

  const ids = (profiles ?? []).map((p) => p.id);
  // Aggregate orders per user, grouped by currency so EUR sales don't
  // get silently summed into the MDL bucket.
  const aggMap = new Map<
    string,
    { count: number; byCurrency: Record<string, number> }
  >();
  if (ids.length > 0) {
    let { data: ordersAgg, error: aggErr } = await supabase
      .from("orders")
      .select("user_id, total, currency")
      .eq("account_scope", args.scope)
      .in("user_id", ids);
    // Defensive retry — older deploys may not have orders.currency yet.
    if (aggErr && /currency/i.test(aggErr.message)) {
      const retry = await supabase
        .from("orders")
        .select("user_id, total")
        .eq("account_scope", args.scope)
        .in("user_id", ids);
      ordersAgg = retry.data as typeof ordersAgg;
    }
    for (const o of ordersAgg ?? []) {
      if (!o.user_id) continue;
      const cur =
        aggMap.get(o.user_id) ?? { count: 0, byCurrency: {} as Record<string, number> };
      cur.count += 1;
      const code =
        (((o as { currency?: string | null }).currency ?? "") || "MDL").toUpperCase();
      cur.byCurrency[code] = (cur.byCurrency[code] ?? 0) + Number(o.total ?? 0);
      aggMap.set(o.user_id, cur);
    }
    // Round each per-currency total so we don't expose float jitter.
    for (const a of aggMap.values()) {
      for (const k of Object.keys(a.byCurrency)) {
        a.byCurrency[k] = Number(a.byCurrency[k].toFixed(2));
      }
    }
  }

  const rows: PanelClientRow[] = (profiles ?? []).map((p) => {
    const agg = aggMap.get(p.id) ?? { count: 0, byCurrency: {} };
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      phone: p.phone,
      account_type: p.account_type,
      company_name: p.company_name,
      idno: p.idno,
      discount_percent: p.discount_percent,
      created_at: p.created_at,
      orders_count: agg.count,
      total_spent_by_currency: agg.byCurrency,
    };
  });

  const filtered = args.onlyWithTransactions
    ? rows.filter((r) => r.orders_count > 0)
    : rows;

  return {
    rows: filtered,
    total: count ?? rows.length,
    page,
    pageSize: PAGE_SIZE,
  };
}

export type PanelClientDetail = PanelClientRow & {
  legal_form: string | null;
  vat_code: string | null;
  billing_country: string | null;
  billing_city: string | null;
  billing_street: string | null;
  billing_district: string | null;
  billing_postal: string | null;
  shipping_country: string | null;
  shipping_city: string | null;
  shipping_street: string | null;
  shipping_district: string | null;
  shipping_postal: string | null;
  shipping_same_as_billing: boolean | null;
  /**
   * Grouped by currency — storefront orders are MDL, but panel sales in
   * EUR/USD shouldn't get silently re-stamped as `lei`. Empty object
   * means no orders at all. UI renders one Price per currency.
   */
  total_spent_by_currency: Record<string, number>;
  recent_orders: Array<{
    id: string;
    total: number | null;
    /** Always set — `MDL` for legacy rows without an explicit currency. */
    currency: string;
    status: string | null;
    account_scope: "conta1" | "conta2";
    source: "storefront" | "panel" | "import";
    created_at: string | null;
  }>;
};

export async function getPanelClient(
  id: string,
  scope: AccountScope,
): Promise<PanelClientDetail | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, account_type, company_name, idno, discount_percent, created_at, legal_form, vat_code, billing_country, billing_city, billing_street, billing_district, billing_postal, shipping_country, shipping_city, shipping_street, shipping_district, shipping_postal, shipping_same_as_billing",
    )
    .eq("id", id)
    .maybeSingle();
  if (!profile) return null;

  // `currency` lives on the orders table via a panel migration; older
  // rows have it null and we default to MDL on read. Defensive retry on
  // 42703 so the page still loads if the column hasn't been migrated
  // (matches the pattern used in invoices/queries.ts).
  let { data: ordersAgg, error: aggErr } = await supabase
    .from("orders")
    .select("total, currency")
    .eq("account_scope", scope)
    .eq("user_id", id);
  if (aggErr && /currency/i.test(aggErr.message)) {
    const retry = await supabase
      .from("orders")
      .select("total")
      .eq("account_scope", scope)
      .eq("user_id", id);
    ordersAgg = retry.data as typeof ordersAgg;
    aggErr = retry.error;
  }
  const total_spent_by_currency: Record<string, number> = {};
  for (const o of ordersAgg ?? []) {
    const cur =
      (((o as { currency?: string | null }).currency ?? "") || "MDL").toUpperCase();
    total_spent_by_currency[cur] = (total_spent_by_currency[cur] ?? 0) + Number(o.total ?? 0);
  }
  // Round to 2 dp after summing — avoids ugly 1234.5600000001 floats.
  for (const k of Object.keys(total_spent_by_currency)) {
    total_spent_by_currency[k] = Number(total_spent_by_currency[k].toFixed(2));
  }

  let { data: recent, error: recentErr } = await supabase
    .from("orders")
    .select("id, total, currency, status, account_scope, source, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (recentErr && /currency/i.test(recentErr.message)) {
    const retry = await supabase
      .from("orders")
      .select("id, total, status, account_scope, source, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(20);
    recent = retry.data as typeof recent;
    recentErr = retry.error;
  }

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    phone: profile.phone,
    account_type: profile.account_type,
    company_name: profile.company_name,
    idno: profile.idno,
    discount_percent: profile.discount_percent,
    created_at: profile.created_at,
    legal_form: profile.legal_form,
    vat_code: profile.vat_code,
    billing_country: profile.billing_country,
    billing_city: profile.billing_city,
    billing_street: profile.billing_street,
    billing_district: profile.billing_district,
    billing_postal: profile.billing_postal,
    shipping_country: profile.shipping_country,
    shipping_city: profile.shipping_city,
    shipping_street: profile.shipping_street,
    shipping_district: profile.shipping_district,
    shipping_postal: profile.shipping_postal,
    shipping_same_as_billing: profile.shipping_same_as_billing,
    orders_count: (ordersAgg ?? []).length,
    total_spent_by_currency,
    recent_orders: (recent ?? []).map((r) => ({
      id: r.id,
      total: r.total,
      currency:
        ((((r as { currency?: string | null }).currency ?? "") || "MDL")).toUpperCase(),
      status: r.status,
      account_scope: r.account_scope,
      source: r.source,
      created_at: r.created_at,
    })),
  };
}
