-- ============================================================================
-- INTER BUS — Odoo integration migration
-- Run AFTER supabase-setup.sql and supabase-tecdoc-migration.sql. Idempotent.
-- ============================================================================

-- 1. Cross-reference IDs ------------------------------------------------------
alter table public.products
    add column if not exists odoo_id integer,
    add column if not exists barcode text,
    add column if not exists odoo_synced_at timestamptz,
    add column if not exists odoo_qty_available numeric(12,3);

create unique index if not exists products_odoo_id_uq
    on public.products (odoo_id) where odoo_id is not null;
create index if not exists products_barcode_idx on public.products (barcode);

alter table public.profiles
    add column if not exists odoo_partner_id integer,
    add column if not exists company text,
    add column if not exists vat_code text;

create unique index if not exists profiles_odoo_partner_id_uq
    on public.profiles (odoo_partner_id) where odoo_partner_id is not null;

alter table public.orders
    add column if not exists odoo_order_id integer,
    add column if not exists odoo_invoice_id integer,
    add column if not exists odoo_synced_at timestamptz,
    add column if not exists odoo_sync_error text;

create index if not exists orders_odoo_order_id_idx on public.orders (odoo_order_id);

-- 2. odoo_sync_log — append-only log of sync events --------------------------
create table if not exists public.odoo_sync_log (
    id uuid primary key default gen_random_uuid(),
    direction text not null check (direction in ('pull', 'push', 'webhook')),
    operation text not null,                                  -- e.g. "products.pull", "order.push", "stock.update"
    entity_type text,                                         -- e.g. "product", "order", "partner"
    entity_id text,                                           -- our id (uuid) or odoo id (int as text)
    odoo_model text,                                          -- e.g. "product.product"
    odoo_id integer,
    success boolean not null default false,
    detail jsonb,                                             -- payload, error, etc
    duration_ms integer,
    created_at timestamptz not null default now()
);

create index if not exists odoo_sync_log_created_at_idx
    on public.odoo_sync_log (created_at desc);
create index if not exists odoo_sync_log_operation_idx
    on public.odoo_sync_log (operation, success);

-- 3. RLS — admins read; service role writes (no user-facing API) -------------
alter table public.odoo_sync_log enable row level security;

drop policy if exists "odoo_sync_log_admin_select" on public.odoo_sync_log;
create policy "odoo_sync_log_admin_select" on public.odoo_sync_log
    for select using (public.is_admin());

drop policy if exists "odoo_sync_log_admin_all" on public.odoo_sync_log;
create policy "odoo_sync_log_admin_all" on public.odoo_sync_log
    for all using (public.is_admin());

-- 4. Convenience helper — bump stock from a webhook --------------------------
-- Called by the webhook route handler when Odoo emits a stock update.
-- SECURITY DEFINER so it bypasses RLS but only updates the matched row.
create or replace function public.set_stock_from_odoo(
    p_odoo_id integer,
    p_qty numeric
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    rows_affected int;
begin
    update public.products
        set stock_quantity = greatest(0, floor(p_qty))::int,
            odoo_qty_available = p_qty,
            odoo_synced_at = now()
        where odoo_id = p_odoo_id;
    get diagnostics rows_affected = row_count;
    return rows_affected > 0;
end;
$$;

revoke all on function public.set_stock_from_odoo(integer, numeric) from public;
grant execute on function public.set_stock_from_odoo(integer, numeric) to service_role;

-- 5. Helper to retire a sync error (after manual recovery) -------------------
create or replace function public.clear_order_sync_error(p_order_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
    update public.orders
        set odoo_sync_error = null
        where id = p_order_id and (
            select public.is_admin()
        )
    returning true;
$$;

grant execute on function public.clear_order_sync_error(uuid) to authenticated;

-- ============================================================================
-- Verify:
--   select column_name from information_schema.columns
--    where table_name = 'products'
--      and column_name in ('odoo_id','barcode','odoo_synced_at','odoo_qty_available');
--
--   select count(*) from public.odoo_sync_log;
-- ============================================================================
