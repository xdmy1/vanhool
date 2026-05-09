-- ============================================================================
-- INTER BUS — Per-customer discount migration (Task 9)
-- Run AFTER supabase-promotions-migration.sql. Idempotent.
--
-- Adds discount_percent (0-100) to profiles. The storefront applies it on
-- top of the effective price (which may already be a promo price).
-- ============================================================================

alter table public.profiles
    add column if not exists discount_percent numeric(5,2) not null default 0;

alter table public.profiles drop constraint if exists profiles_discount_chk;
alter table public.profiles
    add constraint profiles_discount_chk
        check (discount_percent >= 0 and discount_percent <= 100);

-- Helper used by the storefront to compute the price for the *current* user.
-- Pure SQL, marked stable so PostgREST/Supabase can call it efficiently from
-- the client (we use it server-side, but exposing it costs nothing).
create or replace function public.apply_customer_discount(
    p_price numeric,
    p_discount_percent numeric
)
returns numeric
language sql
immutable
as $$
    select round(
        p_price * (1 - greatest(0, least(100, coalesce(p_discount_percent, 0))) / 100.0),
        2
    );
$$;

grant execute on function public.apply_customer_discount(numeric, numeric) to anon, authenticated;

-- ============================================================================
-- Verify:
--   select column_name, data_type from information_schema.columns
--    where table_name = 'profiles' and column_name = 'discount_percent';
--   select id, email, discount_percent from public.profiles
--    where discount_percent > 0;
-- ============================================================================
