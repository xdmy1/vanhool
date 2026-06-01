import { createClient } from "@/lib/supabase/server";
import type { AccountScope } from "@/lib/panel/scope";

type DateRange = { from: string; to: string };

/** Orders rows in the date range, optionally filtered by scope. */
async function fetchOrdersInRange(args: { scope?: AccountScope; range: DateRange }) {
  const supabase = await createClient();
  let q = supabase
    .from("orders")
    .select(
      "id, total, subtotal, currency, status, items, created_at, account_scope, source, customer_email, customer_name, user_id",
    )
    .gte("created_at", `${args.range.from}T00:00:00`)
    .lt("created_at", `${args.range.to}T23:59:59.999`)
    .neq("status", "cancelled");
  if (args.scope) q = q.eq("account_scope", args.scope);
  const { data } = await q.limit(5000);
  return data ?? [];
}

/**
 * Reports aggregate sales across MDL / EUR / USD documents. We normalise to
 * MDL with the same fixed reference rates the wizard + cash-drawer use, so
 * a chart that shows "total revenue" can still display a single number per
 * day without silently treating 100 EUR as 100 MDL.
 */
const FX_TO_MDL: Record<string, number> = { MDL: 1, EUR: 20, USD: 17 };
function toMdl(amount: number, currency: string | null | undefined): number {
  return amount * (FX_TO_MDL[(currency ?? "MDL").toUpperCase()] ?? 1);
}

// ---------- Sales by period (day) ----------
export type SalesByDayRow = {
  day: string;
  orders: number;
  gross: number;
  conta1: number;
  conta2: number;
};

export async function reportSalesByDay(
  range: DateRange,
  scope?: AccountScope,
): Promise<SalesByDayRow[]> {
  const rows = await fetchOrdersInRange({ range, scope });
  const map = new Map<string, SalesByDayRow>();
  for (const o of rows) {
    const day = String(o.created_at ?? "").slice(0, 10);
    if (!day) continue;
    const cur =
      map.get(day) ?? { day, orders: 0, gross: 0, conta1: 0, conta2: 0 };
    // Normalise to MDL so daily totals stay comparable across currencies.
    // Without this a 100 EUR sale + a 100 MDL sale silently summed to 200
    // (or 200 MDL, indistinguishable from 200 of either).
    const t = toMdl(
      Number(o.total ?? 0),
      (o as { currency?: string | null }).currency,
    );
    cur.orders += 1;
    cur.gross += t;
    if (o.account_scope === "conta1") cur.conta1 += t;
    else cur.conta2 += t;
    map.set(day, cur);
  }
  return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
}

// ---------- Top products ----------
export type TopProductRow = {
  productId: string;
  partCode: string | null;
  name: string | null;
  qty: number;
  gross: number;
};

export async function reportTopProducts(
  range: DateRange,
  scope?: AccountScope,
  limit = 30,
): Promise<TopProductRow[]> {
  const rows = await fetchOrdersInRange({ scope, range });
  const map = new Map<string, TopProductRow>();
  for (const o of rows) {
    const items = (Array.isArray(o.items) ? o.items : []) as Array<{
      productId?: string;
      partCode?: string | null;
      name?: string | null;
      quantity?: number;
      price?: number;
      total?: number;
    }>;
    const orderCurrency = (o as { currency?: string | null }).currency;
    for (const it of items) {
      const key = String(it.productId ?? it.partCode ?? "—");
      const cur =
        map.get(key) ?? {
          productId: key,
          partCode: it.partCode ?? null,
          name: it.name ?? null,
          qty: 0,
          gross: 0,
        };
      cur.qty += Number(it.quantity ?? 0);
      // Item totals are in the order's currency — convert to MDL so a
      // best-seller chart doesn't silently rank EUR sales 20× higher.
      const lineGross =
        Number(it.total ?? Number(it.quantity ?? 0) * Number(it.price ?? 0));
      cur.gross += toMdl(lineGross, orderCurrency);
      map.set(key, cur);
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.gross - a.gross)
    .slice(0, limit);
}

// ---------- Top clients ----------
export type TopClientRow = {
  user_id: string | null;
  name: string | null;
  email: string | null;
  orders: number;
  gross: number;
};

export async function reportTopClients(
  range: DateRange,
  scope?: AccountScope,
  limit = 30,
): Promise<TopClientRow[]> {
  const rows = await fetchOrdersInRange({ scope, range });
  const map = new Map<string, TopClientRow>();
  for (const o of rows) {
    const key = o.user_id ?? o.customer_email ?? "anonim";
    const cur =
      map.get(key) ?? {
        user_id: o.user_id ?? null,
        name: o.customer_name ?? null,
        email: o.customer_email ?? null,
        orders: 0,
        gross: 0,
      };
    cur.orders += 1;
    cur.gross += toMdl(
      Number(o.total ?? 0),
      (o as { currency?: string | null }).currency,
    );
    map.set(key, cur);
  }
  return Array.from(map.values())
    .sort((a, b) => b.gross - a.gross)
    .slice(0, limit);
}

// ---------- Margin per period ----------
export type MarginRow = {
  productId: string;
  partCode: string | null;
  name: string | null;
  qty: number;
  revenue: number;
  cost: number;
  margin: number;
  margin_pct: number;
};

export async function reportMargin(
  range: DateRange,
  scope?: AccountScope,
  limit = 50,
): Promise<MarginRow[]> {
  const rows = await fetchOrdersInRange({ scope, range });
  const map = new Map<string, MarginRow>();
  for (const o of rows) {
    const items = (Array.isArray(o.items) ? o.items : []) as Array<{
      productId?: string;
      partCode?: string | null;
      name?: string | null;
      quantity?: number;
      price?: number;
      cost_price?: number;
      total?: number;
    }>;
    const orderCurrency = (o as { currency?: string | null }).currency;
    for (const it of items) {
      const key = String(it.productId ?? it.partCode ?? "—");
      const qty = Number(it.quantity ?? 0);
      // Revenue is in the order's currency; cost_price is always MDL
      // (catalog-side field). Normalise revenue to MDL too so the margin
      // is computed against consistent units.
      const revenue = toMdl(
        Number(it.total ?? qty * Number(it.price ?? 0)),
        orderCurrency,
      );
      const cost = qty * Number(it.cost_price ?? 0);
      const cur =
        map.get(key) ?? {
          productId: key,
          partCode: it.partCode ?? null,
          name: it.name ?? null,
          qty: 0,
          revenue: 0,
          cost: 0,
          margin: 0,
          margin_pct: 0,
        };
      cur.qty += qty;
      cur.revenue += revenue;
      cur.cost += cost;
      cur.margin = cur.revenue - cur.cost;
      cur.margin_pct = cur.revenue > 0 ? (cur.margin / cur.revenue) * 100 : 0;
      map.set(key, cur);
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.margin - a.margin)
    .slice(0, limit);
}

// ---------- Cash balance trend (conta2 only) ----------
export type CashTrendRow = { day: string; net: number; balance: number };

export async function reportCashTrend(range: DateRange): Promise<CashTrendRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cash_register_movements")
    .select("occurred_at, direction, amount, amount_mdl")
    .gte("occurred_at", `${range.from}T00:00:00`)
    .lt("occurred_at", `${range.to}T23:59:59.999`)
    .order("occurred_at");
  const byDay = new Map<string, number>();
  for (const m of (data ?? []) as Array<{
    occurred_at: string | null;
    direction: string;
    amount: number | null;
    amount_mdl?: number | null;
  }>) {
    const day = String(m.occurred_at ?? "").slice(0, 10);
    if (!day) continue;
    // Use amount_mdl when present so a EUR cash inflow doesn't push the
    // running balance ~20× too high. Fallback to amount only for legacy
    // rows that haven't been backfilled yet.
    const amt = m.amount_mdl != null ? Number(m.amount_mdl) : Number(m.amount ?? 0);
    const delta = (m.direction === "in" ? 1 : -1) * amt;
    byDay.set(day, (byDay.get(day) ?? 0) + delta);
  }
  // Compute running balance starting from 0 at range.from
  let bal = 0;
  return Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, net]) => {
      bal += net;
      return { day, net: Number(net.toFixed(2)), balance: Number(bal.toFixed(2)) };
    });
}

// ---------- Stock turnover (last 30d sold qty / current stock) ----------
export type StockTurnoverRow = {
  productId: string;
  partCode: string | null;
  name: string | null;
  sold_30d: number;
  current_stock: number;
  turnover: number | null;
};

export async function reportStockTurnover(limit = 30): Promise<StockTurnoverRow[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const rows = await fetchOrdersInRange({
    range: { from: since, to: new Date().toISOString().slice(0, 10) },
  });
  const soldByProduct = new Map<string, { qty: number; name: string | null; partCode: string | null }>();
  for (const o of rows) {
    const items = (Array.isArray(o.items) ? o.items : []) as Array<{
      productId?: string;
      partCode?: string | null;
      name?: string | null;
      quantity?: number;
    }>;
    for (const it of items) {
      const key = String(it.productId ?? it.partCode ?? "—");
      const cur = soldByProduct.get(key) ?? { qty: 0, name: it.name ?? null, partCode: it.partCode ?? null };
      cur.qty += Number(it.quantity ?? 0);
      soldByProduct.set(key, cur);
    }
  }
  const ids = Array.from(soldByProduct.keys()).filter((k) => /^[0-9a-f-]{36}$/.test(k));
  const { data: stockRows } = ids.length
    ? await supabase
        .from("products")
        .select("id, stock_quantity, part_code, name_ro")
        .in("id", ids)
    : { data: [] };
  const stockMap = new Map((stockRows ?? []).map((p) => [p.id, p]));

  return Array.from(soldByProduct.entries())
    .map(([id, agg]) => {
      const stock = stockMap.get(id);
      const current = Number(stock?.stock_quantity ?? 0);
      return {
        productId: id,
        partCode: agg.partCode ?? stock?.part_code ?? null,
        name: agg.name ?? stock?.name_ro ?? null,
        sold_30d: agg.qty,
        current_stock: current,
        turnover: current > 0 ? Number((agg.qty / current).toFixed(2)) : null,
      };
    })
    .sort((a, b) => (b.turnover ?? Number.MAX_SAFE_INTEGER) - (a.turnover ?? Number.MAX_SAFE_INTEGER))
    .slice(0, limit);
}

// ---------- Invoice export rows (conta1, used by export-documente + rapoarte) ----------
export type InvoiceExportRow = {
  id: string;
  series: string | null;
  number: string | null;
  issued_date: string;
  customer_name: string | null;
  customer_idno: string | null;
  total: number;
  refrens_url: string | null;
};

export async function listInvoicesForExport(range: DateRange): Promise<InvoiceExportRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, series, number, issued_date, customer_snapshot, total, refrens_url")
    .gte("issued_date", range.from)
    .lte("issued_date", range.to)
    .order("issued_date");
  return (data ?? []).map((r) => {
    const snap = r.customer_snapshot as { name?: string; idno?: string } | null;
    return {
      id: r.id,
      series: r.series,
      number: r.number,
      issued_date: r.issued_date,
      customer_name: snap?.name ?? null,
      customer_idno: snap?.idno ?? null,
      total: Number(r.total ?? 0),
      refrens_url: r.refrens_url,
    };
  });
}
