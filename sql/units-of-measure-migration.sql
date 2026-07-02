-- ============================================================================
-- Migration: divisible units of measure + decimal stock (inter-bus.md)
-- Paste into Supabase Studio SQL editor. IDEMPOTENT — safe to re-run.
--
-- Adds products.unit (buc / litru / metru / kg / ...) and lets stock hold
-- decimals so a 200 L oil barrel can be sold by the litre (200 -> 199.5).
--
-- Order is load-bearing:
--   (1) add products.unit, (2) widen products.stock_quantity,
--   (3) widen cart_items.quantity, (4) replace set_stock_from_odoo (it READS unit).
-- Forward direction is loss-free: int -> numeric is a widening cast. Do NOT
-- author a down-migration that floors numeric -> int (that destroys data).
--
-- Decision: the unit vocabulary lives in the APP (Zod + form selectors), NOT a
-- DB CHECK — so introducing a new unit never risks rejecting a product save.
-- ============================================================================

-- 1) Single source of unit on the product ------------------------------------
alter table public.products
  add column if not exists unit text not null default 'buc';

-- 2) Decimal stock: products.stock_quantity int -> numeric(12,3) --------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name  = 'products'
      and column_name = 'stock_quantity'
      and data_type <> 'numeric'
  ) then
    alter table public.products
      alter column stock_quantity type numeric(12,3)
      using stock_quantity::numeric(12,3);
  end if;
end $$;
alter table public.products alter column stock_quantity set not null;
alter table public.products alter column stock_quantity set default 0;

-- 3) Decimal storefront cart line: cart_items.quantity int -> numeric(12,3) ---
--    (harmless insurance — the live cart is client-side; orders live in
--     orders.items JSONB — but keep the schema honest in case anything writes it)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name  = 'cart_items'
      and column_name = 'quantity'
      and data_type <> 'numeric'
  ) then
    alter table public.cart_items
      alter column quantity type numeric(12,3)
      using quantity::numeric(12,3);
  end if;
end $$;

-- 4) Stop the Odoo RPC from flooring decimal stock ---------------------------
--    Same signature (integer, numeric) so existing GRANTs are preserved.
--    Floor ONLY for piece units ('buc'); keep 3-decimal precision otherwise.
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
    update public.products p
        set stock_quantity = case
              when coalesce(p.unit, 'buc') = 'buc'
                then greatest(0, floor(p_qty))
              else greatest(0, round(p_qty, 3))
            end,
            odoo_qty_available = p_qty,
            odoo_synced_at = now()
        where p.odoo_id = p_odoo_id;
    get diagnostics rows_affected = row_count;
    return rows_affected > 0;
end;
$$;

revoke all on function public.set_stock_from_odoo(integer, numeric) from public;
grant execute on function public.set_stock_from_odoo(integer, numeric) to service_role;

-- ============================================================================
-- Verify after running:
--   select data_type, numeric_scale from information_schema.columns
--     where table_name='products' and column_name='stock_quantity';  -- numeric, 3
-- ============================================================================
