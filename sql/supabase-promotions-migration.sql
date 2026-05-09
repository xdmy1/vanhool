-- ============================================================================
-- INTER BUS — Promotions migration (Task 8)
-- Run AFTER supabase-product-codes-migration.sql. Idempotent.
--
-- Adds promo flag + promo price + optional schedule to products. The
-- /promotions storefront page lists all products where is_promo = true and
-- (now() BETWEEN promo_starts_at AND promo_ends_at) when both bounds are set.
-- ============================================================================

alter table public.products
    add column if not exists is_promo boolean not null default false,
    add column if not exists promo_price numeric(10,2),
    add column if not exists promo_starts_at timestamptz,
    add column if not exists promo_ends_at timestamptz;

-- Partial index — most products won't be on promo, so a filtered index keeps
-- it cheap to scan only the promoted rows.
create index if not exists products_is_promo_idx
    on public.products (is_promo)
    where is_promo = true;

-- Enforce: if is_promo is true, promo_price must be set and lower than price.
-- Soft check — done in app for nicer error messages, but DB guards integrity.
alter table public.products drop constraint if exists products_promo_price_chk;
alter table public.products
    add constraint products_promo_price_chk check (
        is_promo = false
        or (promo_price is not null and promo_price >= 0 and promo_price < price)
    );

-- Helper: compute the price-to-show (promo if active, otherwise list price).
create or replace function public.product_effective_price(
    p_price numeric,
    p_promo_price numeric,
    p_is_promo boolean,
    p_starts timestamptz,
    p_ends timestamptz
)
returns numeric
language sql
immutable
as $$
    select case
        when p_is_promo
             and p_promo_price is not null
             and (p_starts is null or p_starts <= now())
             and (p_ends is null or p_ends >= now())
        then p_promo_price
        else p_price
    end;
$$;

grant execute on function public.product_effective_price(numeric, numeric, boolean, timestamptz, timestamptz) to anon, authenticated;

-- ============================================================================
-- Verify:
--   select column_name from information_schema.columns
--    where table_name = 'products'
--      and column_name in ('is_promo','promo_price','promo_starts_at','promo_ends_at');
--   select id, part_code, price, promo_price, is_promo from public.products
--    where is_promo = true limit 10;
-- ============================================================================
