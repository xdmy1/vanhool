-- ============================================================================
-- INTER BUS — Product codes & manufacturers migration
-- Run AFTER supabase-setup.sql, supabase-tecdoc-migration.sql,
-- supabase-vehicles-migration.sql, supabase-odoo-migration.sql. Idempotent.
--
-- Adds:
--   • public.manufacturers — part-makers (Bosch, MANN, MAHLE, ...)
--   • public.product_vehicle_makes — n:n compatibility products↔buses
--   • products.manufacturer_id, subcategory_id, cross_references jsonb,
--     search_codes text[], condition, storage_location, cost_price
--   • normalize_code() — uppercase + strip non-alphanumeric (used by search)
--   • trigger that rebuilds products.search_codes from part_code, barcode,
--     oem_codes, cross_references on every insert/update
-- ============================================================================

-- 1. manufacturers ------------------------------------------------------------
create table if not exists public.manufacturers (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    logo_url text,
    country text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create unique index if not exists manufacturers_name_uq
    on public.manufacturers (lower(name));
create index if not exists manufacturers_active_idx
    on public.manufacturers (is_active);

alter table public.manufacturers enable row level security;
drop policy if exists "manufacturers_public_read" on public.manufacturers;
create policy "manufacturers_public_read" on public.manufacturers
    for select using (is_active = true or public.is_admin());
drop policy if exists "manufacturers_admin_all" on public.manufacturers;
create policy "manufacturers_admin_all" on public.manufacturers
    for all using (public.is_admin()) with check (public.is_admin());

-- 2. Extend products ---------------------------------------------------------
alter table public.products
    add column if not exists manufacturer_id uuid references public.manufacturers(id) on delete set null,
    add column if not exists subcategory_id uuid references public.categories(id) on delete set null,
    add column if not exists cross_references jsonb not null default '[]'::jsonb,
    add column if not exists search_codes text[] not null default '{}',
    add column if not exists condition text not null default 'new'
        check (condition in ('new','refurbished','used')),
    add column if not exists storage_location text,
    add column if not exists cost_price numeric(12,2);

create index if not exists products_search_codes_idx
    on public.products using gin (search_codes);
create index if not exists products_cross_references_idx
    on public.products using gin (cross_references);
create index if not exists products_manufacturer_idx
    on public.products (manufacturer_id);
create index if not exists products_subcategory_idx
    on public.products (subcategory_id);

-- 3. product_vehicle_makes (n:n product ↔ bus make) --------------------------
create table if not exists public.product_vehicle_makes (
    product_id uuid not null references public.products(id) on delete cascade,
    vehicle_make_id uuid not null references public.vehicle_makes(id) on delete cascade,
    primary key (product_id, vehicle_make_id),
    created_at timestamptz not null default now()
);
create index if not exists pvm_make_idx
    on public.product_vehicle_makes (vehicle_make_id);

alter table public.product_vehicle_makes enable row level security;
drop policy if exists "pvm_public_read" on public.product_vehicle_makes;
create policy "pvm_public_read" on public.product_vehicle_makes
    for select using (true);
drop policy if exists "pvm_admin_all" on public.product_vehicle_makes;
create policy "pvm_admin_all" on public.product_vehicle_makes
    for all using (public.is_admin()) with check (public.is_admin());

-- 4. normalize_code() — uppercase + strip non-alphanumeric -------------------
-- The same rule MUST be applied client-side at search time. See
-- lib/utils/normalize-code.ts for the TS counterpart.
create or replace function public.normalize_code(input text)
returns text
language sql
immutable
as $$
    select regexp_replace(upper(coalesce(input, '')), '[^A-Z0-9]', '', 'g');
$$;

grant execute on function public.normalize_code(text) to anon, authenticated;

-- 5. Trigger: rebuild products.search_codes ----------------------------------
create or replace function public.products_rebuild_search_codes()
returns trigger
language plpgsql
as $$
declare
    codes text[] := '{}';
    extracted text[];
begin
    if new.part_code is not null and length(trim(new.part_code)) > 0 then
        codes := array_append(codes, public.normalize_code(new.part_code));
    end if;

    if new.barcode is not null and length(trim(new.barcode)) > 0 then
        codes := array_append(codes, public.normalize_code(new.barcode));
    end if;

    if new.oem_codes is not null and array_length(new.oem_codes, 1) is not null then
        select array_agg(public.normalize_code(c))
            into extracted
            from unnest(new.oem_codes) as c
            where c is not null and length(trim(c)) > 0;
        if extracted is not null then
            codes := codes || extracted;
        end if;
    end if;

    if new.cross_references is not null
       and jsonb_typeof(new.cross_references) = 'array' then
        select array_agg(public.normalize_code(elem->>'code'))
            into extracted
            from jsonb_array_elements(new.cross_references) as elem
            where elem ? 'code'
              and length(trim(coalesce(elem->>'code',''))) > 0;
        if extracted is not null then
            codes := codes || extracted;
        end if;
    end if;

    new.search_codes := (
        select coalesce(array_agg(distinct c), '{}'::text[])
        from unnest(codes) as c
        where c is not null and length(c) > 0
    );

    return new;
end;
$$;

drop trigger if exists products_search_codes_trg on public.products;
create trigger products_search_codes_trg
    before insert or update
    on public.products
    for each row execute function public.products_rebuild_search_codes();

-- Backfill existing rows: write search_codes to itself → trigger fires & rebuilds.
update public.products set search_codes = search_codes;

-- ============================================================================
-- Verify:
--   select column_name from information_schema.columns
--    where table_name = 'products'
--      and column_name in ('manufacturer_id','subcategory_id','cross_references',
--                          'search_codes','condition','storage_location','cost_price');
--   select id, part_code, oem_codes, search_codes from public.products limit 5;
--   select * from public.manufacturers;
-- ============================================================================
