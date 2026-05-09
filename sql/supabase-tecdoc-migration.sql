-- ============================================================================
-- INTER BUS — TecDoc / Apify integration migration
-- Run this AFTER `supabase-setup.sql`. Idempotent.
-- ============================================================================

-- 1. Extend products with TecDoc-specific fields ------------------------------
alter table public.products
    add column if not exists tecdoc_id text,
    add column if not exists oem_codes text[] not null default '{}',
    add column if not exists vehicle_compatibility jsonb not null default '[]'::jsonb,
    add column if not exists tecdoc_synced_at timestamptz,
    add column if not exists images jsonb not null default '[]'::jsonb;

create index if not exists products_tecdoc_id_idx on public.products (tecdoc_id);
create index if not exists products_oem_codes_idx on public.products using gin (oem_codes);
create index if not exists products_vehicle_compat_idx on public.products using gin (vehicle_compatibility);

-- 2. tecdoc_cache — caches Apify lookup responses ----------------------------
create table if not exists public.tecdoc_cache (
    id uuid primary key default gen_random_uuid(),
    -- Cache key. Typically `${query_type}:${query_value}:${country}:${lang}`.
    cache_key text unique not null,
    query_type text not null check (query_type in ('part_code', 'oem', 'vehicle')),
    query_value text not null,
    country text,
    lang text,
    -- Raw response from Apify (the dataset items array).
    response jsonb not null default '[]'::jsonb,
    -- How many results in the response.
    result_count int not null default 0,
    -- Apify run metadata for billing/debug.
    actor_id text,
    run_id text,
    compute_units numeric(10,4),
    -- Timing.
    fetched_at timestamptz not null default now(),
    expires_at timestamptz
);

create index if not exists tecdoc_cache_cache_key_idx on public.tecdoc_cache (cache_key);
create index if not exists tecdoc_cache_expires_at_idx on public.tecdoc_cache (expires_at);
create index if not exists tecdoc_cache_query_type_idx on public.tecdoc_cache (query_type, query_value);

-- 3. RLS: only admins can read/write the cache table -------------------------
alter table public.tecdoc_cache enable row level security;

-- Helper from the main setup file (created if not present)
do $$
begin
    if not exists (select 1 from pg_proc where proname = 'is_admin' and pronamespace = 'public'::regnamespace) then
        create function public.is_admin()
        returns boolean
        language sql
        security definer
        stable
        set search_path = public
        as 'select coalesce((select is_admin from public.profiles where id = auth.uid()), false);';
        grant execute on function public.is_admin() to authenticated, anon;
    end if;
end$$;

drop policy if exists "tecdoc_cache_admin_all" on public.tecdoc_cache;
create policy "tecdoc_cache_admin_all" on public.tecdoc_cache
    for all using (public.is_admin());

-- 4. Optional housekeeping function: clear expired cache rows ----------------
create or replace function public.purge_tecdoc_cache_expired()
returns int
language plpgsql
security definer
as $$
declare
    deleted_count int;
begin
    delete from public.tecdoc_cache
        where expires_at is not null and expires_at < now();
    get diagnostics deleted_count = row_count;
    return deleted_count;
end;
$$;

grant execute on function public.purge_tecdoc_cache_expired() to authenticated;

-- ============================================================================
-- Verify:
--   select column_name from information_schema.columns
--    where table_name = 'products' and column_name in
--      ('tecdoc_id','oem_codes','vehicle_compatibility','tecdoc_synced_at','images');
--
--   select count(*) from public.tecdoc_cache;
-- ============================================================================
