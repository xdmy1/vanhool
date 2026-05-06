-- ALL-IN-ONE Chunk 1/4 — schema + base/expanded/Audi/Opel
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
-- =============================================================================
-- Vehicle taxonomy migration — pathway brand → model → engine → category → parts
-- Idempotent (uses IF NOT EXISTS / DROP-CREATE). Run after supabase-setup.sql.
-- =============================================================================

-- vehicle_makes ---------------------------------------------------------------
create table if not exists public.vehicle_makes (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    logo_url text,
    sort_order integer not null default 0,
    is_active boolean not null default true,
    is_popular boolean not null default false,
    tecdoc_id integer unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_vehicle_makes_active
    on public.vehicle_makes(is_active, sort_order, name);
create index if not exists idx_vehicle_makes_popular
    on public.vehicle_makes(is_popular)
    where is_popular = true;

-- vehicle_models --------------------------------------------------------------
create table if not exists public.vehicle_models (
    id uuid primary key default gen_random_uuid(),
    make_id uuid not null references public.vehicle_makes(id) on delete cascade,
    slug text not null,
    name text not null,
    year_from integer,
    year_to integer,
    body_type text,
    image_url text,
    is_active boolean not null default true,
    tecdoc_id integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(make_id, slug)
);
create index if not exists idx_vehicle_models_make
    on public.vehicle_models(make_id, is_active, name);

-- vehicle_types (engine variants — TecDoc TypeID equivalent) -----------------
create table if not exists public.vehicle_types (
    id uuid primary key default gen_random_uuid(),
    model_id uuid not null references public.vehicle_models(id) on delete cascade,
    slug text not null,
    name text not null,
    power_kw integer,
    power_hp integer,
    capacity_cc integer,
    fuel text,
    year_from integer,
    year_to integer,
    engine_code text,
    body text,
    drive text,
    is_active boolean not null default true,
    tecdoc_type_id integer unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(model_id, slug)
);
create index if not exists idx_vehicle_types_model
    on public.vehicle_types(model_id, is_active, year_from);

-- Junction: vehicle_part_link -------------------------------------------------
create table if not exists public.vehicle_part_link (
    vehicle_type_id uuid not null references public.vehicle_types(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    primary key (vehicle_type_id, product_id),
    created_at timestamptz not null default now()
);
create index if not exists idx_vehicle_part_link_product
    on public.vehicle_part_link(product_id);

-- updated_at triggers ---------------------------------------------------------
-- Reuses public.set_updated_at() defined in supabase-setup.sql.
do $$
begin
    if exists (
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'set_updated_at'
    ) then
        drop trigger if exists vehicle_makes_set_updated_at on public.vehicle_makes;
        create trigger vehicle_makes_set_updated_at
            before update on public.vehicle_makes
            for each row execute function public.set_updated_at();

        drop trigger if exists vehicle_models_set_updated_at on public.vehicle_models;
        create trigger vehicle_models_set_updated_at
            before update on public.vehicle_models
            for each row execute function public.set_updated_at();

        drop trigger if exists vehicle_types_set_updated_at on public.vehicle_types;
        create trigger vehicle_types_set_updated_at
            before update on public.vehicle_types
            for each row execute function public.set_updated_at();
    end if;
end $$;

-- RLS -------------------------------------------------------------------------
alter table public.vehicle_makes enable row level security;
alter table public.vehicle_models enable row level security;
alter table public.vehicle_types enable row level security;
alter table public.vehicle_part_link enable row level security;

drop policy if exists "vehicle_makes public read" on public.vehicle_makes;
create policy "vehicle_makes public read" on public.vehicle_makes
    for select using (is_active = true or public.is_admin());
drop policy if exists "vehicle_makes admin all" on public.vehicle_makes;
create policy "vehicle_makes admin all" on public.vehicle_makes
    for all using (public.is_admin());

drop policy if exists "vehicle_models public read" on public.vehicle_models;
create policy "vehicle_models public read" on public.vehicle_models
    for select using (is_active = true or public.is_admin());
drop policy if exists "vehicle_models admin all" on public.vehicle_models;
create policy "vehicle_models admin all" on public.vehicle_models
    for all using (public.is_admin());

drop policy if exists "vehicle_types public read" on public.vehicle_types;
create policy "vehicle_types public read" on public.vehicle_types
    for select using (is_active = true or public.is_admin());
drop policy if exists "vehicle_types admin all" on public.vehicle_types;
create policy "vehicle_types admin all" on public.vehicle_types
    for all using (public.is_admin());

drop policy if exists "vehicle_part_link public read" on public.vehicle_part_link;
create policy "vehicle_part_link public read" on public.vehicle_part_link
    for select using (true);
drop policy if exists "vehicle_part_link admin all" on public.vehicle_part_link;
create policy "vehicle_part_link admin all" on public.vehicle_part_link
    for all using (public.is_admin());

-- Helpful view: enumerate types with full breadcrumb path -------------------
create or replace view public.v_vehicle_breadcrumbs as
select
    t.id              as type_id,
    t.slug            as type_slug,
    t.name            as type_name,
    t.power_kw,
    t.year_from,
    t.year_to,
    m.id              as model_id,
    m.slug            as model_slug,
    m.name            as model_name,
    mk.id             as make_id,
    mk.slug           as make_slug,
    mk.name           as make_name
from public.vehicle_types t
join public.vehicle_models m on m.id = t.model_id
join public.vehicle_makes  mk on mk.id = m.make_id
where t.is_active and m.is_active and mk.is_active;

grant select on public.v_vehicle_breadcrumbs to anon, authenticated;
-- =============================================================================
-- Vehicle taxonomy seed — global make list, Honda full tree, Honda Accord II
-- end-to-end (4 engine variants), demo categories, demo products linked to types.
--
-- Idempotent: re-runnable. Uses INSERT ... ON CONFLICT DO UPDATE.
-- Run AFTER supabase-vehicles-migration.sql.
-- =============================================================================

-- 0. Extend categories (idempotent) ----------------------------------------------
insert into public.categories (slug, name_en, name_ro, name_ru, sort_order, is_active)
values
    ('brakes',       'Brakes',         'Frâne',                 'Тормоза',         10, true),
    ('engine',       'Engine',         'Motor',                 'Двигатель',       20, true),
    ('filtre',       'Filters',        'Filtre',                'Фильтры',         30, true),
    ('suspension',   'Suspension',     'Suspensie',             'Подвеска',        40, true),
    ('transmission', 'Transmission',   'Transmisie',            'Трансмиссия',     50, true),
    ('cooling',      'Cooling',        'Răcire',                'Охлаждение',      60, true),
    ('electro',      'Electrical',     'Sistem electric',       'Электрика',       70, true),
    ('exhaust',      'Exhaust',        'Sistem de evacuare',    'Выхлоп',          80, true),
    ('steering',     'Steering',       'Direcție',              'Рулевое',         90, true),
    ('body',         'Body',           'Caroserie',             'Кузов',          100, true),
    ('interior',     'Interior',       'Interior',              'Интерьер',       110, true),
    ('lighting',     'Lighting',       'Iluminat',              'Освещение',      120, true)
on conflict (slug) do update
set name_en   = excluded.name_en,
    name_ro   = excluded.name_ro,
    name_ru   = excluded.name_ru,
    sort_order = excluded.sort_order,
    is_active = true;

-- 1. Vehicle makes (35 popular brands, top 12 marked popular) -----------------
insert into public.vehicle_makes (slug, name, sort_order, is_popular) values
    ('audi',          'Audi',           10,  true),
    ('bmw',           'BMW',            20,  true),
    ('mercedes-benz', 'Mercedes-Benz',  30,  true),
    ('volkswagen',    'Volkswagen',     40,  true),
    ('skoda',         'Škoda',          50,  true),
    ('opel',          'Opel',           60,  true),
    ('ford',          'Ford',           70,  true),
    ('renault',       'Renault',        80,  true),
    ('peugeot',       'Peugeot',        90,  true),
    ('citroen',       'Citroën',       100,  true),
    ('toyota',        'Toyota',        110,  true),
    ('honda',         'Honda',         120,  true),
    ('nissan',        'Nissan',        130, false),
    ('mazda',         'Mazda',         140, false),
    ('mitsubishi',    'Mitsubishi',    150, false),
    ('subaru',        'Subaru',        160, false),
    ('suzuki',        'Suzuki',        170, false),
    ('hyundai',       'Hyundai',       180,  true),
    ('kia',           'Kia',           190, false),
    ('chevrolet',     'Chevrolet',     200, false),
    ('volvo',         'Volvo',         210, false),
    ('saab',          'Saab',          220, false),
    ('mini',          'Mini',          230, false),
    ('smart',         'Smart',         240, false),
    ('dacia',         'Dacia',         250,  true),
    ('lada',          'Lada',          260, false),
    ('fiat',          'Fiat',          270, false),
    ('alfa-romeo',    'Alfa Romeo',    280, false),
    ('lancia',        'Lancia',        290, false),
    ('seat',          'SEAT',          300, false),
    ('land-rover',    'Land Rover',    310, false),
    ('jaguar',        'Jaguar',        320, false),
    ('porsche',       'Porsche',       330, false),
    ('jeep',          'Jeep',          340, false),
    ('tesla',         'Tesla',         350, false)
on conflict (slug) do update
set name       = excluded.name,
    sort_order = excluded.sort_order,
    is_popular = excluded.is_popular,
    is_active  = true;

-- 2. Honda models (12 representative) ----------------------------------------
with h as (select id from public.vehicle_makes where slug = 'honda')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select h.id, m.slug, m.name, m.yf, m.yt, m.body
from h, (values
    ('accord-ii',  'Accord II',   1985, 1989, 'sedan'),
    ('accord-iii', 'Accord III',  1989, 1993, 'sedan'),
    ('accord-iv',  'Accord IV',   1993, 1998, 'sedan'),
    ('accord-v',   'Accord V',    1998, 2002, 'sedan'),
    ('civic-v',    'Civic V',     1991, 1995, 'hatchback'),
    ('civic-vi',   'Civic VI',    1995, 2001, 'hatchback'),
    ('civic-vii',  'Civic VII',   2001, 2005, 'hatchback'),
    ('cr-v-i',     'CR-V I',      1995, 2002, 'suv'),
    ('cr-v-ii',    'CR-V II',     2002, 2006, 'suv'),
    ('jazz-i',     'Jazz I',      2001, 2008, 'hatchback'),
    ('hr-v-i',     'HR-V I',      1999, 2006, 'suv'),
    ('prelude-iv', 'Prelude IV',  1992, 1996, 'coupe'),
    ('s2000',      'S2000',       1999, 2009, 'roadster'),
    ('legend-ii',  'Legend II',   1991, 1996, 'sedan')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name       = excluded.name,
    year_from  = excluded.year_from,
    year_to    = excluded.year_to,
    body_type  = excluded.body_type,
    is_active  = true;

-- 3. Honda Accord II — 4 engine variants (incl. exact "1.6-ex-ac-65kw") ------
with m as (
    select vm.id from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'honda' and vm.slug = 'accord-ii'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select m.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from m, (values
    ('1.6-ex-ac-65kw', '1.6 EX AC',  65,  88, 1598, 'petrol', 1985, 1989, 'EW3',  'FWD'),
    ('1.8-ex-74kw',    '1.8 EX',     74, 101, 1829, 'petrol', 1985, 1989, 'ET2',  'FWD'),
    ('2.0-ex-79kw',    '2.0 EX',     79, 107, 1955, 'petrol', 1986, 1989, 'BS1',  'FWD'),
    ('2.0-exi-90kw',   '2.0 EXi',    90, 122, 1955, 'petrol', 1986, 1989, 'B20A', 'FWD')
) as t(slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
on conflict (model_id, slug) do update
set name        = excluded.name,
    power_kw    = excluded.power_kw,
    power_hp    = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel        = excluded.fuel,
    year_from   = excluded.year_from,
    year_to     = excluded.year_to,
    engine_code = excluded.engine_code,
    drive       = excluded.drive,
    is_active   = true;

-- 4. Demo products: 8 Honda Accord II compatible parts -----------------------
-- Categories used: filtre, brakes, engine, suspension, electro, cooling
do $$
declare
    cat_filtre     uuid;
    cat_brakes     uuid;
    cat_engine     uuid;
    cat_suspension uuid;
    cat_electro    uuid;
    cat_cooling    uuid;
begin
    select id into cat_filtre     from public.categories where slug = 'filtre';
    select id into cat_brakes     from public.categories where slug = 'brakes';
    select id into cat_engine     from public.categories where slug = 'engine';
    select id into cat_suspension from public.categories where slug = 'suspension';
    select id into cat_electro    from public.categories where slug = 'electro';
    select id into cat_cooling    from public.categories where slug = 'cooling';

    insert into public.products
        (slug, part_code, brand, price, stock_quantity, category_id,
         name_en, name_ro, name_ru,
         description_en, description_ro, description_ru,
         is_active, is_featured, warranty_months)
    values
        ('mann-w610-3-oil-filter',
         'W 610/3', 'MANN-FILTER', 89.00, 24, cat_filtre,
         'Oil Filter MANN W 610/3',
         'Filtru ulei MANN W 610/3',
         'Масляный фильтр MANN W 610/3',
         'Spin-on oil filter compatible with Honda Accord II 1.6/1.8/2.0.',
         'Filtru ulei spin-on compatibil Honda Accord II 1.6/1.8/2.0.',
         'Масляный фильтр для Honda Accord II 1.6/1.8/2.0.',
         true, true, 12),

        ('bosch-1457433008-air-filter',
         '1 457 433 008', 'BOSCH', 145.00, 18, cat_filtre,
         'Air Filter BOSCH S 3008',
         'Filtru aer BOSCH S 3008',
         'Воздушный фильтр BOSCH S 3008',
         'High-flow air filter for Honda Accord II petrol engines.',
         'Filtru aer high-flow pentru motoarele pe benzină Honda Accord II.',
         'Воздушный фильтр повышенной пропускной способности.',
         true, true, 12),

        ('mann-wk-612-fuel-filter',
         'WK 612/2', 'MANN-FILTER', 175.00, 12, cat_filtre,
         'Fuel Filter MANN WK 612/2',
         'Filtru combustibil MANN WK 612/2',
         'Топливный фильтр MANN WK 612/2',
         'In-line fuel filter for carburettor petrol engines.',
         'Filtru combustibil in-line pentru motoare cu carburator.',
         'Топливный фильтр для карбюраторных двигателей.',
         true, false, 12),

        ('bosch-0986424513-brake-pads-front',
         '0 986 424 513', 'BOSCH', 540.00, 9, cat_brakes,
         'Brake Pads Front BOSCH BP913',
         'Plăcuțe frână față BOSCH BP913',
         'Тормозные колодки передние BOSCH BP913',
         'Front axle brake pad set for Honda Accord II — ECE R90 approved.',
         'Set plăcuțe frână față pentru Honda Accord II — omologate ECE R90.',
         'Комплект передних колодок — ECE R90.',
         true, true, 24),

        ('ngk-bpr6es-spark-plug',
         'BPR6ES', 'NGK', 38.00, 80, cat_engine,
         'Spark Plug NGK BPR6ES',
         'Bujie NGK BPR6ES',
         'Свеча зажигания NGK BPR6ES',
         'Standard nickel spark plug — set of 4 recommended for Accord II.',
         'Bujie nichel standard — set de 4 recomandat pentru Accord II.',
         'Стандартная никелевая свеча — рекомендуется комплект из 4.',
         true, false, 12),

        ('sachs-3000951032-clutch-kit',
         '3000 951 032', 'SACHS', 1850.00, 4, cat_engine,
         'Clutch Kit SACHS 3000 951 032',
         'Kit ambreiaj SACHS 3000 951 032',
         'Комплект сцепления SACHS 3000 951 032',
         'Complete clutch kit (disc + pressure plate + release bearing).',
         'Kit ambreiaj complet (disc + placă presiune + rulment presiune).',
         'Полный комплект сцепления (диск + корзина + выжимной).',
         true, true, 24),

        ('monroe-g7367-shock-front',
         'G7367', 'MONROE', 720.00, 6, cat_suspension,
         'Shock Absorber Front MONROE G7367',
         'Amortizor față MONROE G7367',
         'Амортизатор передний MONROE G7367',
         'Gas-pressure front shock absorber.',
         'Amortizor față cu presiune de gaz.',
         'Передний газовый амортизатор.',
         true, false, 24),

        ('valeo-732556-radiator',
         '732556', 'VALEO', 1290.00, 3, cat_cooling,
         'Radiator VALEO 732556',
         'Radiator răcire VALEO 732556',
         'Радиатор охлаждения VALEO 732556',
         'Engine cooling radiator with plastic side tanks.',
         'Radiator răcire cu rezervoare laterale plastic.',
         'Радиатор с пластиковыми бачками.',
         true, false, 24)
    on conflict (slug) do update
    set part_code        = excluded.part_code,
        brand            = excluded.brand,
        price            = excluded.price,
        stock_quantity   = excluded.stock_quantity,
        category_id      = excluded.category_id,
        name_en          = excluded.name_en,
        name_ro          = excluded.name_ro,
        name_ru          = excluded.name_ru,
        description_en   = excluded.description_en,
        description_ro   = excluded.description_ro,
        description_ru   = excluded.description_ru,
        is_active        = true,
        is_featured      = excluded.is_featured,
        warranty_months  = excluded.warranty_months;
end $$;

-- 5. Link all 8 products to all 4 Accord II engine variants ------------------
-- (Demo: same parts fit all 4 engines — for real life this is per-type)
insert into public.vehicle_part_link (vehicle_type_id, product_id)
select t.id, p.id
from public.vehicle_types t
join public.vehicle_models m on m.id = t.model_id
join public.vehicle_makes  mk on mk.id = m.make_id
cross join public.products p
where mk.slug = 'honda'
  and m.slug = 'accord-ii'
  and p.slug in (
      'mann-w610-3-oil-filter',
      'bosch-1457433008-air-filter',
      'mann-wk-612-fuel-filter',
      'bosch-0986424513-brake-pads-front',
      'ngk-bpr6es-spark-plug',
      'sachs-3000951032-clutch-kit',
      'monroe-g7367-shock-front',
      'valeo-732556-radiator'
  )
on conflict (vehicle_type_id, product_id) do nothing;

-- =============================================================================
-- Done. Verify with:
--   select count(*) from public.vehicle_makes;        -- 35
--   select count(*) from public.vehicle_models where make_id = (select id from public.vehicle_makes where slug='honda');  -- 14
--   select count(*) from public.vehicle_types;        -- 4 (just Accord II for now)
--   select count(*) from public.vehicle_part_link;    -- 32 (8 parts × 4 engines)
-- =============================================================================
-- =============================================================================
-- Vehicle taxonomy seed — EXPANDED
-- Honda (complete), BMW, Volkswagen, Toyota, Mercedes-Benz.
-- Plus 5 universal demo products linked to every engine type.
--
-- Data is hand-crafted from public TecDoc-style knowledge (Wikipedia, vehicle
-- manuals, ETK catalogues). NOT scraped from fixbox.md.
--
-- Idempotent. Run AFTER supabase-vehicles-seed.sql.
-- =============================================================================

-- ============================================================================
-- 0. Five UNIVERSAL demo products (fit any car)
-- ============================================================================
do $$
declare
    cat_engine    uuid;
    cat_filtre    uuid;
    cat_body      uuid;
    cat_electro   uuid;
    cat_lighting  uuid;
begin
    select id into cat_engine    from public.categories where slug = 'engine';
    select id into cat_filtre    from public.categories where slug = 'filtre';
    select id into cat_body      from public.categories where slug = 'body';
    select id into cat_electro   from public.categories where slug = 'electro';
    select id into cat_lighting  from public.categories where slug = 'lighting';

    insert into public.products
        (slug, part_code, brand, price, stock_quantity, category_id,
         name_en, name_ro, name_ru,
         description_en, description_ro, description_ru,
         is_active, is_featured, warranty_months)
    values
        ('castrol-edge-5w30-5l',
         'EDGE-5W30-5L', 'CASTROL', 580.00, 35, cat_engine,
         'Engine Oil Castrol EDGE 5W-30 LL 5L',
         'Ulei motor Castrol EDGE 5W-30 LL 5L',
         'Моторное масло Castrol EDGE 5W-30 LL 5L',
         'Full synthetic engine oil. Universal — fits most petrol/diesel engines.',
         'Ulei motor full synthetic. Universal — pentru benzină/diesel.',
         'Полностью синтетическое масло. Универсальное.',
         true, true, 0),

        ('bosch-aerotwin-ar20u',
         '3 397 008 538', 'BOSCH', 215.00, 60, cat_body,
         'Wiper Blades Bosch Aerotwin AR20U',
         'Lamele ștergător Bosch Aerotwin AR20U',
         'Щётки стеклоочистителя Bosch Aerotwin AR20U',
         'Universal flat-blade wiper, 500/475 mm. Hook arm fitting.',
         'Lamelă universală flat-blade, 500/475 mm. Prindere cârlig.',
         'Универсальная плоская щётка, 500/475 мм.',
         true, true, 12),

        ('mann-cu-26-006-cabin-filter',
         'CU 26 006', 'MANN-FILTER', 95.00, 30, cat_filtre,
         'Cabin Air Filter MANN CU 26 006',
         'Filtru polen MANN CU 26 006',
         'Салонный фильтр MANN CU 26 006',
         'Activated carbon cabin filter. Universal slot 260×130×30 mm.',
         'Filtru polen cu cărbune activ. Slot universal 260×130×30 mm.',
         'Угольный салонный фильтр, 260×130×30 мм.',
         true, false, 12),

        ('varta-blue-d24',
         '560 408 054', 'VARTA', 985.00, 14, cat_electro,
         'Battery Varta Blue Dynamic D24 60Ah',
         'Acumulator Varta Blue Dynamic D24 60Ah',
         'Аккумулятор Varta Blue Dynamic D24 60Ah',
         'Lead-acid battery 12V 60Ah 540A — fits most european cars.',
         'Acumulator 12V 60Ah 540A — pentru majoritatea mașinilor europene.',
         'Свинцово-кислотный аккумулятор 12В 60Ач 540А.',
         true, true, 24),

        ('osram-h7-night-breaker',
         '64210NL-HCB', 'OSRAM', 165.00, 80, cat_lighting,
         'Headlight Bulb Osram H7 Night Breaker Laser 55W',
         'Bec far Osram H7 Night Breaker Laser 55W',
         'Лампа Osram H7 Night Breaker Laser 55Вт',
         'Halogen H7 bulb, +150% brightness. Set of 2.',
         'Bec halogen H7, +150% luminozitate. Set 2 buc.',
         'Галогенная лампа H7, +150% яркости. Комплект 2 шт.',
         true, false, 12)
    on conflict (slug) do update
    set part_code = excluded.part_code,
        brand = excluded.brand,
        price = excluded.price,
        stock_quantity = excluded.stock_quantity,
        category_id = excluded.category_id,
        name_en = excluded.name_en,
        name_ro = excluded.name_ro,
        name_ru = excluded.name_ru,
        description_en = excluded.description_en,
        description_ro = excluded.description_ro,
        description_ru = excluded.description_ru,
        is_active = true,
        is_featured = excluded.is_featured;
end $$;

-- ============================================================================
-- 1. HONDA — extended (10 generations beyond Accord II)
-- ============================================================================
-- Honda models already seeded. Add engines for those + new generations.

with mk as (select id from public.vehicle_makes where slug = 'honda')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('accord-vi',  'Accord VI',   1998, 2002, 'sedan'),
    ('accord-vii', 'Accord VII',  2002, 2008, 'sedan'),
    ('accord-viii','Accord VIII', 2008, 2015, 'sedan'),
    ('civic-viii', 'Civic VIII',  2005, 2012, 'hatchback'),
    ('civic-ix',   'Civic IX',    2011, 2017, 'hatchback'),
    ('cr-v-iii',   'CR-V III',    2006, 2012, 'suv'),
    ('cr-v-iv',    'CR-V IV',     2012, 2018, 'suv'),
    ('jazz-ii',    'Jazz II',     2008, 2015, 'hatchback'),
    ('hr-v-ii',    'HR-V II',     2015, 2021, 'suv'),
    ('insight-ii', 'Insight II',  2009, 2014, 'hatchback')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    body_type = excluded.body_type,
    is_active = true;

-- Honda engines for ALL models (uses model slug to join)
with mdl as (
    select vm.id, vm.slug
    from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'honda'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Accord III (existing 'accord-iii' model in base seed)
    ('accord-iii', '2.0i-16v-100kw',   '2.0i 16V',     100, 137, 1958, 'petrol', 1989, 1993, 'B20A6', 'FWD'),
    ('accord-iii', '2.0-16v-110kw',    '2.0 16V',      110, 150, 1997, 'petrol', 1989, 1993, 'B20A',  'FWD'),
    ('accord-iii', '2.2-16v-110kw',    '2.2 16V',      110, 150, 2156, 'petrol', 1990, 1993, 'F22A',  'FWD'),
    -- Accord IV
    ('accord-iv',  '1.8-i-95kw',       '1.8 i',         95, 130, 1849, 'petrol', 1993, 1998, 'F18A3', 'FWD'),
    ('accord-iv',  '2.0-i-100kw',      '2.0 i',        100, 136, 1997, 'petrol', 1993, 1998, 'F20A4', 'FWD'),
    ('accord-iv',  '2.2-i-vtec-110kw', '2.2 i VTEC',   110, 150, 2156, 'petrol', 1993, 1998, 'F22B6', 'FWD'),
    -- Accord V
    ('accord-v',   '1.6-i-77kw',       '1.6 i',         77, 105, 1590, 'petrol', 1998, 2002, 'D16Y3', 'FWD'),
    ('accord-v',   '1.8-i-100kw',      '1.8 i',        100, 136, 1850, 'petrol', 1998, 2002, 'F18B2', 'FWD'),
    ('accord-v',   '2.0-i-108kw',      '2.0 i',        108, 147, 1997, 'petrol', 1998, 2002, 'F20B6', 'FWD'),
    ('accord-v',   '2.0-type-r-156kw', '2.0 Type R',   156, 212, 1997, 'petrol', 1998, 2002, 'H22A7', 'FWD'),
    -- Accord VI
    ('accord-vi',  '2.0-i-vtec-110kw', '2.0 i-VTEC',   110, 150, 1997, 'petrol', 2002, 2008, 'K20A6', 'FWD'),
    ('accord-vi',  '2.4-i-vtec-140kw', '2.4 i-VTEC',   140, 190, 2354, 'petrol', 2002, 2008, 'K24A3', 'FWD'),
    ('accord-vi',  '2.2-ctdi-103kw',   '2.2 i-CTDi',   103, 140, 2204, 'diesel', 2004, 2008, 'N22A1', 'FWD'),
    -- Accord VII
    ('accord-vii', '2.0-i-vtec-115kw', '2.0 i-VTEC',   115, 156, 1997, 'petrol', 2002, 2008, 'K20A6', 'FWD'),
    ('accord-vii', '2.4-i-vtec-140kw', '2.4 i-VTEC',   140, 190, 2354, 'petrol', 2002, 2008, 'K24A3', 'FWD'),
    ('accord-vii', '2.2-ctdi-103kw',   '2.2 i-CTDi',   103, 140, 2204, 'diesel', 2004, 2008, 'N22A1', 'FWD'),
    -- Accord VIII
    ('accord-viii','2.0-i-vtec-115kw', '2.0 i-VTEC',   115, 156, 1997, 'petrol', 2008, 2015, 'R20A3', 'FWD'),
    ('accord-viii','2.4-i-vtec-148kw', '2.4 i-VTEC',   148, 201, 2354, 'petrol', 2008, 2015, 'K24Z3', 'FWD'),
    ('accord-viii','2.2-i-dtec-110kw', '2.2 i-DTEC',   110, 150, 2199, 'diesel', 2008, 2015, 'N22B1', 'FWD'),
    -- Civic V
    ('civic-v',    '1.3-16v-55kw',     '1.3 16V',       55,  75, 1343, 'petrol', 1991, 1995, 'D13B2', 'FWD'),
    ('civic-v',    '1.5-16v-66kw',     '1.5 16V',       66,  90, 1493, 'petrol', 1991, 1995, 'D15B2', 'FWD'),
    ('civic-v',    '1.6-vtec-92kw',    '1.6 VTEC',      92, 125, 1595, 'petrol', 1991, 1995, 'D16Z6', 'FWD'),
    -- Civic VI
    ('civic-vi',   '1.4-16v-66kw',     '1.4 16V',       66,  90, 1396, 'petrol', 1995, 2001, 'D14A1', 'FWD'),
    ('civic-vi',   '1.5-vtec-e-84kw',  '1.5 VTEC-E',    84, 114, 1493, 'petrol', 1995, 2001, 'D15Z6', 'FWD'),
    ('civic-vi',   '1.6-vtec-92kw',    '1.6 VTEC',      92, 125, 1590, 'petrol', 1995, 2001, 'D16W3', 'FWD'),
    ('civic-vi',   '1.8-vti-124kw',    '1.8 VTi',      124, 169, 1797, 'petrol', 1995, 2001, 'B18C4', 'FWD'),
    -- Civic VII
    ('civic-vii',  '1.4-16v-66kw',     '1.4 i',         66,  90, 1396, 'petrol', 2001, 2005, 'D14Z5', 'FWD'),
    ('civic-vii',  '1.6-vtec-81kw',    '1.6 i-VTEC',    81, 110, 1590, 'petrol', 2001, 2005, 'D16V1', 'FWD'),
    ('civic-vii',  '2.0-type-r-147kw', '2.0 Type R',   147, 200, 1998, 'petrol', 2001, 2005, 'K20A2', 'FWD'),
    ('civic-vii',  '1.7-ctdi-74kw',    '1.7 CTDi',      74, 100, 1686, 'diesel', 2001, 2005, '4EE-2', 'FWD'),
    -- Civic VIII
    ('civic-viii', '1.4-i-83kw',       '1.4 i',         83, 113, 1399, 'petrol', 2005, 2012, 'L13A8', 'FWD'),
    ('civic-viii', '1.8-i-vtec-103kw', '1.8 i-VTEC',   103, 140, 1799, 'petrol', 2005, 2012, 'R18A2', 'FWD'),
    ('civic-viii', '2.0-type-r-148kw', '2.0 i-VTEC Type R', 148, 201, 1998, 'petrol', 2007, 2011, 'K20Z4', 'FWD'),
    ('civic-viii', '2.2-i-ctdi-103kw', '2.2 i-CTDi',   103, 140, 2204, 'diesel', 2005, 2012, 'N22A2', 'FWD'),
    -- Civic IX
    ('civic-ix',   '1.4-i-vtec-73kw',  '1.4 i-VTEC',    73,  99, 1399, 'petrol', 2011, 2017, 'L13Z1', 'FWD'),
    ('civic-ix',   '1.8-i-vtec-104kw', '1.8 i-VTEC',   104, 142, 1798, 'petrol', 2011, 2017, 'R18Z4', 'FWD'),
    ('civic-ix',   '2.2-i-dtec-110kw', '2.2 i-DTEC',   110, 150, 2199, 'diesel', 2011, 2017, 'N22B1', 'FWD'),
    ('civic-ix',   '1.6-i-dtec-88kw',  '1.6 i-DTEC',    88, 120, 1597, 'diesel', 2013, 2017, 'N16A1', 'FWD'),
    -- CR-V I
    ('cr-v-i',     '2.0-16v-94kw',     '2.0 16V',       94, 128, 1973, 'petrol', 1995, 2002, 'B20B3', 'AWD'),
    -- CR-V II
    ('cr-v-ii',    '2.0-i-vtec-110kw', '2.0 i-VTEC',   110, 150, 1998, 'petrol', 2002, 2006, 'K20A4', 'AWD'),
    ('cr-v-ii',    '2.4-i-vtec-117kw', '2.4 i-VTEC',   117, 160, 2354, 'petrol', 2002, 2006, 'K24A1', 'AWD'),
    ('cr-v-ii',    '2.2-ctdi-103kw',   '2.2 i-CTDi',   103, 140, 2204, 'diesel', 2005, 2006, 'N22A2', 'AWD'),
    -- CR-V III
    ('cr-v-iii',   '2.0-i-vtec-110kw', '2.0 i-VTEC',   110, 150, 1997, 'petrol', 2006, 2012, 'R20A2', 'AWD'),
    ('cr-v-iii',   '2.4-i-vtec-125kw', '2.4 i-VTEC',   125, 170, 2354, 'petrol', 2006, 2012, 'K24Z1', 'AWD'),
    ('cr-v-iii',   '2.2-i-ctdi-103kw', '2.2 i-CTDi',   103, 140, 2204, 'diesel', 2006, 2012, 'N22A2', 'AWD'),
    -- CR-V IV
    ('cr-v-iv',    '2.0-i-vtec-114kw', '2.0 i-VTEC',   114, 155, 1997, 'petrol', 2012, 2018, 'R20A9', 'AWD'),
    ('cr-v-iv',    '2.4-i-vtec-140kw', '2.4 i-VTEC',   140, 190, 2354, 'petrol', 2012, 2018, 'K24Z9', 'AWD'),
    ('cr-v-iv',    '1.6-i-dtec-88kw',  '1.6 i-DTEC',    88, 120, 1597, 'diesel', 2013, 2018, 'N16A1', 'AWD'),
    ('cr-v-iv',    '2.2-i-dtec-110kw', '2.2 i-DTEC',   110, 150, 2199, 'diesel', 2012, 2018, 'N22B1', 'AWD'),
    -- Jazz I
    ('jazz-i',     '1.2-i-56kw',       '1.2 i',         56,  76, 1246, 'petrol', 2001, 2008, 'L12A1', 'FWD'),
    ('jazz-i',     '1.4-i-61kw',       '1.4 i',         61,  83, 1339, 'petrol', 2001, 2008, 'L13A1', 'FWD'),
    -- Jazz II
    ('jazz-ii',    '1.2-i-vtec-66kw',  '1.2 i-VTEC',    66,  90, 1198, 'petrol', 2008, 2015, 'L12B1', 'FWD'),
    ('jazz-ii',    '1.4-i-vtec-73kw',  '1.4 i-VTEC',    73, 100, 1339, 'petrol', 2008, 2015, 'L13Z1', 'FWD'),
    -- HR-V I
    ('hr-v-i',     '1.6-16v-77kw',     '1.6 16V',       77, 105, 1590, 'petrol', 1999, 2006, 'D16W1', 'AWD'),
    ('hr-v-i',     '1.6-vtec-91kw',    '1.6 VTEC',      91, 124, 1590, 'petrol', 1999, 2006, 'D16W5', 'AWD'),
    -- HR-V II
    ('hr-v-ii',    '1.5-i-vtec-96kw',  '1.5 i-VTEC',    96, 130, 1498, 'petrol', 2015, 2021, 'L15B7', 'FWD'),
    ('hr-v-ii',    '1.6-i-dtec-88kw',  '1.6 i-DTEC',    88, 120, 1597, 'diesel', 2015, 2021, 'N16A1', 'FWD'),
    -- Prelude IV
    ('prelude-iv', '2.0-i-96kw',       '2.0 i',         96, 130, 1997, 'petrol', 1992, 1996, 'F20A4', 'FWD'),
    ('prelude-iv', '2.2-vtec-138kw',   '2.2 16V VTEC', 138, 188, 2157, 'petrol', 1992, 1996, 'H22A1', 'FWD'),
    -- S2000
    ('s2000',      '2.0-vtec-177kw',   '2.0 VTEC',     177, 240, 1997, 'petrol', 1999, 2003, 'F20C1', 'RWD'),
    ('s2000',      '2.2-vtec-177kw',   '2.2 VTEC',     177, 240, 2157, 'petrol', 2003, 2009, 'F22C1', 'RWD'),
    -- Legend II
    ('legend-ii',  '3.2-v6-154kw',     '3.2 V6',       154, 209, 3206, 'petrol', 1991, 1996, 'C32A1', 'FWD'),
    -- Insight II
    ('insight-ii', '1.3-hybrid-65kw',  '1.3 IMA Hybrid', 65, 88, 1339, 'hybrid', 2009, 2014, 'LDA3',  'FWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name,
    power_kw = excluded.power_kw,
    power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel = excluded.fuel,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    engine_code = excluded.engine_code,
    drive = excluded.drive,
    is_active = true;

-- ============================================================================
-- 2. BMW — 12 popular models with engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'bmw')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('1-series-e87',  '1 Series E87',  2004, 2011, 'hatchback'),
    ('3-series-e30',  '3 Series E30',  1982, 1991, 'sedan'),
    ('3-series-e36',  '3 Series E36',  1990, 2000, 'sedan'),
    ('3-series-e46',  '3 Series E46',  1998, 2007, 'sedan'),
    ('3-series-e90',  '3 Series E90',  2005, 2013, 'sedan'),
    ('3-series-f30',  '3 Series F30',  2012, 2019, 'sedan'),
    ('5-series-e34',  '5 Series E34',  1988, 1996, 'sedan'),
    ('5-series-e39',  '5 Series E39',  1995, 2003, 'sedan'),
    ('5-series-e60',  '5 Series E60',  2003, 2010, 'sedan'),
    ('5-series-f10',  '5 Series F10',  2010, 2017, 'sedan'),
    ('7-series-e38',  '7 Series E38',  1994, 2001, 'sedan'),
    ('x3-e83',        'X3 E83',        2003, 2010, 'suv'),
    ('x5-e53',        'X5 E53',        1999, 2006, 'suv'),
    ('x5-e70',        'X5 E70',        2006, 2013, 'suv'),
    ('z4-e85',        'Z4 E85',        2002, 2008, 'roadster')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    body_type = excluded.body_type,
    is_active = true;

with mdl as (
    select vm.id, vm.slug
    from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'bmw'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- 1 Series E87
    ('1-series-e87', '116i-85kw',  '116i',  85, 116, 1596, 'petrol', 2004, 2011, 'N45B16', 'RWD'),
    ('1-series-e87', '118i-105kw', '118i', 105, 143, 1995, 'petrol', 2004, 2011, 'N46B20', 'RWD'),
    ('1-series-e87', '120i-125kw', '120i', 125, 170, 1995, 'petrol', 2004, 2011, 'N46B20', 'RWD'),
    ('1-series-e87', '130i-195kw', '130i', 195, 265, 2996, 'petrol', 2005, 2011, 'N52B30', 'RWD'),
    ('1-series-e87', '116d-85kw',  '116d',  85, 116, 1995, 'diesel', 2009, 2011, 'N47D20', 'RWD'),
    ('1-series-e87', '118d-105kw', '118d', 105, 143, 1995, 'diesel', 2007, 2011, 'N47D20', 'RWD'),
    ('1-series-e87', '120d-130kw', '120d', 130, 177, 1995, 'diesel', 2007, 2011, 'N47D20', 'RWD'),
    -- 3 Series E30
    ('3-series-e30', '316i-73kw',  '316i',  73, 100, 1796, 'petrol', 1987, 1991, 'M40B18', 'RWD'),
    ('3-series-e30', '318i-83kw',  '318i',  83, 113, 1796, 'petrol', 1987, 1991, 'M40B18', 'RWD'),
    ('3-series-e30', '320i-95kw',  '320i',  95, 129, 1990, 'petrol', 1982, 1991, 'M20B20', 'RWD'),
    ('3-series-e30', '325i-125kw', '325i', 125, 170, 2494, 'petrol', 1985, 1991, 'M20B25', 'RWD'),
    ('3-series-e30', '324d-63kw',  '324d',  63,  86, 2443, 'diesel', 1985, 1991, 'M21D24', 'RWD'),
    -- 3 Series E36
    ('3-series-e36', '316i-75kw',  '316i',  75, 102, 1596, 'petrol', 1993, 1999, 'M43B16', 'RWD'),
    ('3-series-e36', '318i-85kw',  '318i',  85, 115, 1796, 'petrol', 1993, 1999, 'M43B18', 'RWD'),
    ('3-series-e36', '320i-110kw', '320i', 110, 150, 1991, 'petrol', 1990, 1999, 'M50B20', 'RWD'),
    ('3-series-e36', '325i-141kw', '325i', 141, 192, 2494, 'petrol', 1990, 1995, 'M50B25', 'RWD'),
    ('3-series-e36', '328i-142kw', '328i', 142, 193, 2793, 'petrol', 1995, 1999, 'M52B28', 'RWD'),
    ('3-series-e36', '318tds-66kw','318tds', 66,  90, 1665, 'diesel', 1995, 1999, 'M41D17', 'RWD'),
    ('3-series-e36', '325tds-105kw','325tds',105, 143, 2498, 'diesel', 1993, 1999, 'M51D25', 'RWD'),
    -- 3 Series E46
    ('3-series-e46', '316i-77kw',  '316i',  77, 105, 1596, 'petrol', 1998, 2005, 'N45B16', 'RWD'),
    ('3-series-e46', '318i-87kw',  '318i',  87, 118, 1995, 'petrol', 2001, 2005, 'N42B20', 'RWD'),
    ('3-series-e46', '320i-110kw', '320i', 110, 150, 2171, 'petrol', 1998, 2005, 'M54B22', 'RWD'),
    ('3-series-e46', '325i-141kw', '325i', 141, 192, 2494, 'petrol', 2000, 2005, 'M54B25', 'RWD'),
    ('3-series-e46', '330i-170kw', '330i', 170, 231, 2979, 'petrol', 2000, 2005, 'M54B30', 'RWD'),
    ('3-series-e46', '320d-110kw', '320d', 110, 150, 1995, 'diesel', 2001, 2005, 'M47D20TU','RWD'),
    ('3-series-e46', '330d-150kw', '330d', 150, 204, 2926, 'diesel', 2003, 2005, 'M57D30',  'RWD'),
    ('3-series-e46', 'm3-252kw',   'M3',   252, 343, 3246, 'petrol', 2000, 2006, 'S54B32',  'RWD'),
    -- 3 Series E90
    ('3-series-e90', '320i-125kw', '320i', 125, 170, 1995, 'petrol', 2007, 2013, 'N43B20', 'RWD'),
    ('3-series-e90', '325i-160kw', '325i', 160, 218, 2497, 'petrol', 2005, 2013, 'N52B25', 'RWD'),
    ('3-series-e90', '330i-200kw', '330i', 200, 272, 2996, 'petrol', 2005, 2013, 'N52B30', 'RWD'),
    ('3-series-e90', '335i-225kw', '335i', 225, 306, 2979, 'petrol', 2007, 2013, 'N54B30', 'RWD'),
    ('3-series-e90', '320d-130kw', '320d', 130, 177, 1995, 'diesel', 2007, 2013, 'N47D20', 'RWD'),
    ('3-series-e90', '325d-145kw', '325d', 145, 197, 2993, 'diesel', 2006, 2013, 'M57D30', 'RWD'),
    ('3-series-e90', '330d-180kw', '330d', 180, 245, 2993, 'diesel', 2008, 2013, 'N57D30', 'RWD'),
    -- 3 Series F30
    ('3-series-f30', '320i-135kw', '320i', 135, 184, 1997, 'petrol', 2012, 2019, 'N20B20', 'RWD'),
    ('3-series-f30', '328i-180kw', '328i', 180, 245, 1997, 'petrol', 2012, 2015, 'N20B20', 'RWD'),
    ('3-series-f30', '335i-225kw', '335i', 225, 306, 2979, 'petrol', 2012, 2015, 'N55B30', 'RWD'),
    ('3-series-f30', '320d-135kw', '320d', 135, 184, 1995, 'diesel', 2012, 2019, 'N47D20', 'RWD'),
    ('3-series-f30', '330d-190kw', '330d', 190, 258, 2993, 'diesel', 2012, 2019, 'N57D30', 'RWD'),
    -- 5 Series E34
    ('5-series-e34', '520i-110kw', '520i', 110, 150, 1991, 'petrol', 1988, 1995, 'M50B20', 'RWD'),
    ('5-series-e34', '525i-141kw', '525i', 141, 192, 2494, 'petrol', 1988, 1995, 'M50B25', 'RWD'),
    ('5-series-e34', '530i-155kw', '530i', 155, 211, 2997, 'petrol', 1992, 1995, 'M60B30', 'RWD'),
    ('5-series-e34', '540i-210kw', '540i', 210, 286, 3982, 'petrol', 1992, 1995, 'M60B40', 'RWD'),
    ('5-series-e34', '525tds-105kw','525tds',105, 143, 2498, 'diesel', 1991, 1996, 'M51D25', 'RWD'),
    -- 5 Series E39
    ('5-series-e39', '520i-110kw', '520i', 110, 150, 2171, 'petrol', 1996, 2003, 'M54B22', 'RWD'),
    ('5-series-e39', '525i-141kw', '525i', 141, 192, 2494, 'petrol', 2000, 2003, 'M54B25', 'RWD'),
    ('5-series-e39', '528i-142kw', '528i', 142, 193, 2793, 'petrol', 1995, 2000, 'M52B28', 'RWD'),
    ('5-series-e39', '535i-173kw', '535i', 173, 235, 3498, 'petrol', 1996, 2003, 'M62B35', 'RWD'),
    ('5-series-e39', '540i-210kw', '540i', 210, 286, 4398, 'petrol', 1996, 2003, 'M62B44', 'RWD'),
    ('5-series-e39', '520d-100kw', '520d', 100, 136, 1951, 'diesel', 2000, 2003, 'M47D20', 'RWD'),
    ('5-series-e39', '525d-120kw', '525d', 120, 163, 2497, 'diesel', 2000, 2003, 'M57D25', 'RWD'),
    ('5-series-e39', '530d-142kw', '530d', 142, 193, 2926, 'diesel', 1998, 2003, 'M57D30', 'RWD'),
    -- 5 Series E60
    ('5-series-e60', '520i-125kw', '520i', 125, 170, 2171, 'petrol', 2003, 2010, 'M54B22', 'RWD'),
    ('5-series-e60', '525i-160kw', '525i', 160, 218, 2497, 'petrol', 2005, 2010, 'N52B25', 'RWD'),
    ('5-series-e60', '530i-200kw', '530i', 200, 272, 2996, 'petrol', 2005, 2010, 'N52B30', 'RWD'),
    ('5-series-e60', '535i-225kw', '535i', 225, 306, 2979, 'petrol', 2007, 2010, 'N54B30', 'RWD'),
    ('5-series-e60', '520d-130kw', '520d', 130, 177, 1995, 'diesel', 2007, 2010, 'N47D20', 'RWD'),
    ('5-series-e60', '525d-145kw', '525d', 145, 197, 2993, 'diesel', 2007, 2010, 'M57D30', 'RWD'),
    ('5-series-e60', '530d-170kw', '530d', 170, 231, 2993, 'diesel', 2007, 2010, 'M57D30', 'RWD'),
    ('5-series-e60', '535d-200kw', '535d', 200, 272, 2993, 'diesel', 2004, 2010, 'M57D30', 'RWD'),
    -- 5 Series F10
    ('5-series-f10', '520i-135kw', '520i', 135, 184, 1997, 'petrol', 2010, 2017, 'N20B20', 'RWD'),
    ('5-series-f10', '528i-180kw', '528i', 180, 245, 1997, 'petrol', 2011, 2017, 'N20B20', 'RWD'),
    ('5-series-f10', '535i-225kw', '535i', 225, 306, 2979, 'petrol', 2010, 2017, 'N55B30', 'RWD'),
    ('5-series-f10', '550i-300kw', '550i', 300, 408, 4395, 'petrol', 2010, 2017, 'N63B44', 'RWD'),
    ('5-series-f10', '520d-135kw', '520d', 135, 184, 1995, 'diesel', 2011, 2017, 'N47D20', 'RWD'),
    ('5-series-f10', '525d-160kw', '525d', 160, 218, 2993, 'diesel', 2011, 2017, 'N57D30', 'RWD'),
    ('5-series-f10', '530d-190kw', '530d', 190, 258, 2993, 'diesel', 2011, 2017, 'N57D30', 'RWD'),
    -- 7 Series E38
    ('7-series-e38', '728i-142kw', '728i', 142, 193, 2793, 'petrol', 1995, 2001, 'M52B28', 'RWD'),
    ('7-series-e38', '735i-173kw', '735i', 173, 235, 3498, 'petrol', 1996, 2001, 'M62B35', 'RWD'),
    ('7-series-e38', '740i-210kw', '740i', 210, 286, 4398, 'petrol', 1996, 2001, 'M62B44', 'RWD'),
    ('7-series-e38', '750i-240kw', '750i', 240, 326, 5379, 'petrol', 1995, 2001, 'M73B54', 'RWD'),
    ('7-series-e38', '730d-135kw', '730d', 135, 184, 2926, 'diesel', 1998, 2001, 'M57D30', 'RWD'),
    ('7-series-e38', '740d-180kw', '740d', 180, 245, 3901, 'diesel', 1999, 2001, 'M67D40', 'RWD'),
    -- X3 E83
    ('x3-e83',       '2.0i-110kw',  '2.0i', 110, 150, 1995, 'petrol', 2004, 2010, 'N46B20', 'AWD'),
    ('x3-e83',       '2.5i-141kw',  '2.5i', 141, 192, 2494, 'petrol', 2004, 2010, 'M54B25', 'AWD'),
    ('x3-e83',       '3.0i-170kw',  '3.0i', 170, 231, 2979, 'petrol', 2004, 2010, 'M54B30', 'AWD'),
    ('x3-e83',       '2.0d-110kw',  '2.0d', 110, 150, 1995, 'diesel', 2005, 2010, 'M47D20', 'AWD'),
    ('x3-e83',       '3.0d-160kw',  '3.0d', 160, 218, 2993, 'diesel', 2003, 2010, 'M57D30', 'AWD'),
    -- X5 E53
    ('x5-e53',       '3.0i-170kw',  '3.0i', 170, 231, 2979, 'petrol', 1999, 2006, 'M54B30', 'AWD'),
    ('x5-e53',       '4.4i-210kw',  '4.4i', 210, 286, 4398, 'petrol', 1999, 2006, 'M62B44', 'AWD'),
    ('x5-e53',       '4.6is-250kw', '4.6is',250, 340, 4619, 'petrol', 2002, 2003, 'M62B46', 'AWD'),
    ('x5-e53',       '4.8is-265kw', '4.8is',265, 360, 4799, 'petrol', 2003, 2006, 'N62B48', 'AWD'),
    ('x5-e53',       '3.0d-135kw',  '3.0d', 135, 184, 2926, 'diesel', 2001, 2006, 'M57D30', 'AWD'),
    ('x5-e53',       '4.4d-160kw',  '4.4d', 160, 218, 4423, 'diesel', 2003, 2006, 'M67D44', 'AWD'),
    -- X5 E70
    ('x5-e70',       '3.0si-200kw', '3.0si',200, 272, 2996, 'petrol', 2007, 2010, 'N52B30', 'AWD'),
    ('x5-e70',       '4.8i-261kw',  '4.8i', 261, 355, 4799, 'petrol', 2007, 2010, 'N62B48', 'AWD'),
    ('x5-e70',       'm-408kw',     'M',    408, 555, 4395, 'petrol', 2009, 2013, 'S63B44', 'AWD'),
    ('x5-e70',       '3.0d-173kw',  '3.0d', 173, 235, 2993, 'diesel', 2007, 2013, 'N57D30', 'AWD'),
    -- Z4 E85
    ('z4-e85',       '2.5i-141kw',  '2.5i', 141, 192, 2494, 'petrol', 2002, 2005, 'M54B25', 'RWD'),
    ('z4-e85',       '3.0i-170kw',  '3.0i', 170, 231, 2979, 'petrol', 2002, 2005, 'M54B30', 'RWD'),
    ('z4-e85',       '3.0si-195kw', '3.0si',195, 265, 2996, 'petrol', 2006, 2008, 'N52B30', 'RWD'),
    ('z4-e85',       'm-252kw',     'M',    252, 343, 3246, 'petrol', 2006, 2008, 'S54B32', 'RWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name,
    power_kw = excluded.power_kw,
    power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel = excluded.fuel,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    engine_code = excluded.engine_code,
    drive = excluded.drive,
    is_active = true;

-- ============================================================================
-- 3. VOLKSWAGEN — 14 popular models with engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'volkswagen')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('golf-iii',     'Golf III',     1991, 1997, 'hatchback'),
    ('golf-iv',      'Golf IV',      1997, 2003, 'hatchback'),
    ('golf-v',       'Golf V',       2003, 2009, 'hatchback'),
    ('golf-vi',      'Golf VI',      2008, 2013, 'hatchback'),
    ('golf-vii',     'Golf VII',     2012, 2020, 'hatchback'),
    ('passat-b5',    'Passat B5',    1996, 2005, 'sedan'),
    ('passat-b6',    'Passat B6',    2005, 2010, 'sedan'),
    ('passat-b7',    'Passat B7',    2010, 2015, 'sedan'),
    ('polo-iv',      'Polo IV',      2001, 2009, 'hatchback'),
    ('polo-v',       'Polo V',       2009, 2017, 'hatchback'),
    ('touareg-i',    'Touareg I',    2002, 2010, 'suv'),
    ('tiguan-i',     'Tiguan I',     2007, 2016, 'suv'),
    ('caddy-iii',    'Caddy III',    2004, 2015, 'mpv'),
    ('transporter-t5','Transporter T5',2003, 2015, 'van')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    body_type = excluded.body_type,
    is_active = true;

with mdl as (
    select vm.id, vm.slug
    from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'volkswagen'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Golf III
    ('golf-iii', '1.4-44kw',     '1.4',         44,  60, 1390, 'petrol', 1991, 1997, 'ABD', 'FWD'),
    ('golf-iii', '1.6-55kw',     '1.6',         55,  75, 1598, 'petrol', 1992, 1997, 'AEK', 'FWD'),
    ('golf-iii', '1.8-66kw',     '1.8',         66,  90, 1781, 'petrol', 1991, 1997, 'AAM', 'FWD'),
    ('golf-iii', '2.0-gti-110kw','2.0 GTi 16V',110, 150, 1984, 'petrol', 1992, 1997, 'ABF', 'FWD'),
    ('golf-iii', '1.9-d-47kw',   '1.9 D',       47,  64, 1896, 'diesel', 1991, 1997, '1Y',  'FWD'),
    ('golf-iii', '1.9-tdi-66kw', '1.9 TDi',     66,  90, 1896, 'diesel', 1993, 1997, '1Z',  'FWD'),
    ('golf-iii', '1.9-tdi-81kw', '1.9 TDi',     81, 110, 1896, 'diesel', 1996, 1997, 'AHU', 'FWD'),
    -- Golf IV
    ('golf-iv',  '1.4-16v-55kw', '1.4 16V',     55,  75, 1390, 'petrol', 1997, 2003, 'AHW', 'FWD'),
    ('golf-iv',  '1.4-16v-74kw', '1.4 16V',     74, 100, 1390, 'petrol', 2000, 2003, 'BCA', 'FWD'),
    ('golf-iv',  '1.6-74kw',     '1.6',         74, 100, 1595, 'petrol', 1997, 2003, 'AEH', 'FWD'),
    ('golf-iv',  '1.6-16v-77kw', '1.6 16V',     77, 105, 1598, 'petrol', 2000, 2003, 'AZD', 'FWD'),
    ('golf-iv',  '1.8-t-110kw',  '1.8 T',      110, 150, 1781, 'petrol', 1997, 2003, 'AGU', 'FWD'),
    ('golf-iv',  '1.8-t-132kw',  '1.8 T 20V',  132, 180, 1781, 'petrol', 1999, 2002, 'AUM', 'FWD'),
    ('golf-iv',  '2.3-v5-110kw', '2.3 V5',     110, 150, 2324, 'petrol', 1997, 2000, 'AGZ', 'FWD'),
    ('golf-iv',  '1.9-tdi-66kw', '1.9 TDi',     66,  90, 1896, 'diesel', 1997, 2003, 'ALH', 'FWD'),
    ('golf-iv',  '1.9-tdi-74kw', '1.9 TDi',     74, 100, 1896, 'diesel', 2000, 2003, 'ATD', 'FWD'),
    ('golf-iv',  '1.9-tdi-85kw', '1.9 TDi',     85, 115, 1896, 'diesel', 1998, 2003, 'AHF', 'FWD'),
    ('golf-iv',  '1.9-tdi-96kw', '1.9 TDi',     96, 130, 1896, 'diesel', 2000, 2003, 'ASZ', 'FWD'),
    ('golf-iv',  'r32-177kw',    'R32',        177, 240, 3189, 'petrol', 2002, 2003, 'BFH', 'AWD'),
    -- Golf V
    ('golf-v',   '1.4-16v-55kw', '1.4 16V',     55,  75, 1390, 'petrol', 2003, 2008, 'BCA', 'FWD'),
    ('golf-v',   '1.4-16v-59kw', '1.4 16V',     59,  80, 1390, 'petrol', 2006, 2009, 'BUD', 'FWD'),
    ('golf-v',   '1.4-tsi-90kw', '1.4 TSi',     90, 122, 1390, 'petrol', 2007, 2009, 'CAXA','FWD'),
    ('golf-v',   '1.6-75kw',     '1.6',         75, 102, 1595, 'petrol', 2003, 2009, 'BSE', 'FWD'),
    ('golf-v',   '1.6-fsi-85kw', '1.6 FSi',     85, 115, 1598, 'petrol', 2003, 2008, 'BAG', 'FWD'),
    ('golf-v',   '2.0-fsi-110kw','2.0 FSi',    110, 150, 1984, 'petrol', 2003, 2008, 'BLR', 'FWD'),
    ('golf-v',   '2.0-tfsi-147kw','2.0 TFSi GTi',147,200,1984,'petrol', 2004, 2009, 'AXX', 'FWD'),
    ('golf-v',   '1.9-tdi-77kw', '1.9 TDi',     77, 105, 1896, 'diesel', 2003, 2009, 'BLS', 'FWD'),
    ('golf-v',   '1.9-tdi-85kw', '1.9 TDi',     85, 115, 1896, 'diesel', 2003, 2008, 'BKC', 'FWD'),
    ('golf-v',   '2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2003, 2009, 'BKD', 'FWD'),
    ('golf-v',   '2.0-tdi-125kw','2.0 TDi GT', 125, 170, 1968, 'diesel', 2005, 2009, 'BMN', 'FWD'),
    -- Golf VI
    ('golf-vi',  '1.2-tsi-63kw', '1.2 TSi',     63,  86, 1197, 'petrol', 2010, 2013, 'CBZA','FWD'),
    ('golf-vi',  '1.2-tsi-77kw', '1.2 TSi',     77, 105, 1197, 'petrol', 2010, 2013, 'CBZB','FWD'),
    ('golf-vi',  '1.4-tsi-90kw', '1.4 TSi',     90, 122, 1390, 'petrol', 2008, 2013, 'CAXA','FWD'),
    ('golf-vi',  '1.4-tsi-118kw','1.4 TSi',    118, 160, 1390, 'petrol', 2008, 2013, 'CAVD','FWD'),
    ('golf-vi',  '1.6-tdi-66kw', '1.6 TDi',     66,  90, 1598, 'diesel', 2009, 2013, 'CAYB','FWD'),
    ('golf-vi',  '1.6-tdi-77kw', '1.6 TDi',     77, 105, 1598, 'diesel', 2009, 2013, 'CAYC','FWD'),
    ('golf-vi',  '2.0-tdi-81kw', '2.0 TDi',     81, 110, 1968, 'diesel', 2009, 2013, 'CBDC','FWD'),
    ('golf-vi',  '2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2008, 2013, 'CBAB','FWD'),
    ('golf-vi',  '2.0-tfsi-155kw','2.0 TFSi GTi',155,210, 1984,'petrol', 2008, 2013, 'CCZB','FWD'),
    -- Golf VII
    ('golf-vii', '1.2-tsi-77kw', '1.2 TSi',     77, 105, 1197, 'petrol', 2012, 2017, 'CJZA','FWD'),
    ('golf-vii', '1.4-tsi-90kw', '1.4 TSi',     90, 122, 1395, 'petrol', 2012, 2017, 'CMBA','FWD'),
    ('golf-vii', '1.4-tsi-103kw','1.4 TSi',    103, 140, 1395, 'petrol', 2012, 2017, 'CHPA','FWD'),
    ('golf-vii', '2.0-tsi-162kw','2.0 TSi GTi',162, 220, 1984, 'petrol', 2012, 2020, 'CHHB','FWD'),
    ('golf-vii', '1.6-tdi-77kw', '1.6 TDi',     77, 105, 1598, 'diesel', 2012, 2020, 'CLHA','FWD'),
    ('golf-vii', '2.0-tdi-110kw','2.0 TDi',    110, 150, 1968, 'diesel', 2012, 2020, 'CRBC','FWD'),
    ('golf-vii', '2.0-r-221kw',  '2.0 R',      221, 300, 1984, 'petrol', 2013, 2020, 'CJXC','AWD'),
    -- Passat B5
    ('passat-b5','1.6-74kw',     '1.6',         74, 101, 1595, 'petrol', 1996, 2005, 'AHL', 'FWD'),
    ('passat-b5','1.8-92kw',     '1.8',         92, 125, 1781, 'petrol', 1996, 2005, 'ADR', 'FWD'),
    ('passat-b5','1.8-t-110kw',  '1.8 T',      110, 150, 1781, 'petrol', 1996, 2005, 'AEB', 'FWD'),
    ('passat-b5','2.0-85kw',     '2.0',         85, 115, 1984, 'petrol', 1996, 2005, 'AZM', 'FWD'),
    ('passat-b5','2.8-v6-142kw', '2.8 V6',     142, 193, 2771, 'petrol', 1996, 2005, 'AMX', 'FWD'),
    ('passat-b5','1.9-tdi-66kw', '1.9 TDi',     66,  90, 1896, 'diesel', 1996, 2000, 'AHU', 'FWD'),
    ('passat-b5','1.9-tdi-85kw', '1.9 TDi',     85, 115, 1896, 'diesel', 1998, 2005, 'AVB', 'FWD'),
    ('passat-b5','1.9-tdi-96kw', '1.9 TDi',     96, 130, 1896, 'diesel', 2000, 2005, 'AVF', 'FWD'),
    ('passat-b5','2.5-tdi-110kw','2.5 TDi V6', 110, 150, 2496, 'diesel', 1998, 2005, 'AFB', 'FWD'),
    ('passat-b5','2.5-tdi-132kw','2.5 TDi V6', 132, 180, 2496, 'diesel', 2003, 2005, 'BDH', 'FWD'),
    -- Passat B6
    ('passat-b6','1.6-75kw',     '1.6',         75, 102, 1595, 'petrol', 2005, 2008, 'BSE', 'FWD'),
    ('passat-b6','1.6-fsi-85kw', '1.6 FSi',     85, 115, 1598, 'petrol', 2005, 2008, 'BLF', 'FWD'),
    ('passat-b6','2.0-fsi-110kw','2.0 FSi',    110, 150, 1984, 'petrol', 2005, 2010, 'BLR', 'FWD'),
    ('passat-b6','2.0-tfsi-147kw','2.0 TFSi', 147, 200, 1984, 'petrol', 2005, 2010, 'BPY', 'FWD'),
    ('passat-b6','1.9-tdi-77kw', '1.9 TDi',     77, 105, 1896, 'diesel', 2005, 2009, 'BXE', 'FWD'),
    ('passat-b6','2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2005, 2010, 'BMP', 'FWD'),
    ('passat-b6','2.0-tdi-125kw','2.0 TDi',    125, 170, 1968, 'diesel', 2005, 2010, 'BMR', 'FWD'),
    -- Passat B7
    ('passat-b7','1.4-tsi-90kw', '1.4 TSi',     90, 122, 1390, 'petrol', 2010, 2014, 'CAXA','FWD'),
    ('passat-b7','1.8-tsi-118kw','1.8 TSi',    118, 160, 1798, 'petrol', 2010, 2014, 'CDAA','FWD'),
    ('passat-b7','2.0-tsi-155kw','2.0 TSi',    155, 210, 1984, 'petrol', 2010, 2014, 'CCZA','FWD'),
    ('passat-b7','1.6-tdi-77kw', '1.6 TDi',     77, 105, 1598, 'diesel', 2010, 2015, 'CAYC','FWD'),
    ('passat-b7','2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2010, 2015, 'CFFB','FWD'),
    ('passat-b7','2.0-tdi-125kw','2.0 TDi',    125, 170, 1968, 'diesel', 2010, 2015, 'CFGB','FWD'),
    -- Polo IV
    ('polo-iv',  '1.2-40kw',     '1.2',         40,  54, 1198, 'petrol', 2001, 2009, 'AWY', 'FWD'),
    ('polo-iv',  '1.2-47kw',     '1.2',         47,  64, 1198, 'petrol', 2001, 2009, 'AZQ', 'FWD'),
    ('polo-iv',  '1.4-16v-55kw', '1.4 16V',     55,  75, 1390, 'petrol', 2001, 2009, 'AUA', 'FWD'),
    ('polo-iv',  '1.4-16v-74kw', '1.4 16V',     74, 100, 1390, 'petrol', 2001, 2009, 'BBY', 'FWD'),
    ('polo-iv',  '1.8-gti-110kw','1.8 T GTi',  110, 150, 1781, 'petrol', 2005, 2007, 'BJX', 'FWD'),
    ('polo-iv',  '1.4-tdi-51kw', '1.4 TDi',     51,  70, 1422, 'diesel', 2001, 2009, 'AMF', 'FWD'),
    ('polo-iv',  '1.4-tdi-59kw', '1.4 TDi',     59,  80, 1422, 'diesel', 2001, 2009, 'BNV', 'FWD'),
    ('polo-iv',  '1.9-tdi-74kw', '1.9 TDi',     74, 100, 1896, 'diesel', 2001, 2009, 'ATD', 'FWD'),
    -- Polo V
    ('polo-v',   '1.0-44kw',     '1.0',         44,  60, 999,  'petrol', 2014, 2017, 'CHYA','FWD'),
    ('polo-v',   '1.2-tsi-66kw', '1.2 TSi',     66,  90, 1197, 'petrol', 2009, 2017, 'CBZA','FWD'),
    ('polo-v',   '1.4-tsi-90kw', '1.4 TSi',     90, 122, 1390, 'petrol', 2010, 2014, 'CAVE','FWD'),
    ('polo-v',   '1.4-tsi-110kw','1.4 TSi GTi',110, 150, 1395, 'petrol', 2014, 2017, 'CZEA','FWD'),
    ('polo-v',   '1.6-77kw',     '1.6',         77, 105, 1598, 'petrol', 2009, 2014, 'CFNA','FWD'),
    ('polo-v',   '1.6-tdi-66kw', '1.6 TDi',     66,  90, 1598, 'diesel', 2009, 2017, 'CAYB','FWD'),
    ('polo-v',   '1.6-tdi-77kw', '1.6 TDi',     77, 105, 1598, 'diesel', 2009, 2017, 'CAYC','FWD'),
    -- Touareg I
    ('touareg-i','3.2-v6-162kw', '3.2 V6',     162, 220, 3189, 'petrol', 2003, 2007, 'BMV', 'AWD'),
    ('touareg-i','3.6-v6-206kw', '3.6 V6 FSi', 206, 280, 3597, 'petrol', 2006, 2010, 'BHK', 'AWD'),
    ('touareg-i','4.2-v8-228kw', '4.2 V8',     228, 310, 4172, 'petrol', 2003, 2010, 'AXQ', 'AWD'),
    ('touareg-i','2.5-r5-tdi-128kw','2.5 R5 TDi',128,174,2461,'diesel', 2003, 2010, 'BAC', 'AWD'),
    ('touareg-i','3.0-v6-tdi-165kw','3.0 V6 TDi',165,225,2967,'diesel', 2004, 2010, 'BKS', 'AWD'),
    ('touareg-i','5.0-v10-tdi-230kw','5.0 V10 TDi',230,313,4921,'diesel',2003,2010, 'AYH', 'AWD'),
    -- Tiguan I
    ('tiguan-i', '1.4-tsi-110kw','1.4 TSi',    110, 150, 1390, 'petrol', 2007, 2016, 'CAVA','AWD'),
    ('tiguan-i', '1.4-tsi-118kw','1.4 TSi',    118, 160, 1390, 'petrol', 2010, 2016, 'CAVD','AWD'),
    ('tiguan-i', '2.0-tsi-132kw','2.0 TSi',    132, 180, 1984, 'petrol', 2007, 2016, 'CCTA','AWD'),
    ('tiguan-i', '2.0-tsi-155kw','2.0 TSi',    155, 210, 1984, 'petrol', 2007, 2016, 'CAWB','AWD'),
    ('tiguan-i', '2.0-tdi-81kw', '2.0 TDi',     81, 110, 1968, 'diesel', 2008, 2016, 'CBAA','AWD'),
    ('tiguan-i', '2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2007, 2016, 'CBAB','AWD'),
    ('tiguan-i', '2.0-tdi-125kw','2.0 TDi',    125, 170, 1968, 'diesel', 2008, 2016, 'CBBB','AWD'),
    -- Caddy III
    ('caddy-iii','1.4-16v-55kw', '1.4 16V',     55,  75, 1390, 'petrol', 2004, 2010, 'BCA', 'FWD'),
    ('caddy-iii','1.6-75kw',     '1.6',         75, 102, 1595, 'petrol', 2004, 2010, 'BSE', 'FWD'),
    ('caddy-iii','2.0-sdi-51kw', '2.0 SDi',     51,  70, 1968, 'diesel', 2004, 2010, 'BDJ', 'FWD'),
    ('caddy-iii','1.9-tdi-77kw', '1.9 TDi',     77, 105, 1896, 'diesel', 2004, 2010, 'BLS', 'FWD'),
    ('caddy-iii','2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2010, 2015, 'CFHC','FWD'),
    -- Transporter T5
    ('transporter-t5','2.0-85kw','2.0',          85, 115, 1984, 'petrol', 2003, 2009, 'AXA', 'FWD'),
    ('transporter-t5','3.2-v6-173kw','3.2 V6', 173, 235, 3189, 'petrol', 2003, 2009, 'AXK', 'AWD'),
    ('transporter-t5','1.9-tdi-63kw','1.9 TDi', 63,  86, 1896, 'diesel', 2003, 2009, 'AXB', 'FWD'),
    ('transporter-t5','1.9-tdi-77kw','1.9 TDi', 77, 105, 1896, 'diesel', 2003, 2009, 'AXC', 'FWD'),
    ('transporter-t5','2.5-tdi-96kw','2.5 TDi', 96, 130, 2461, 'diesel', 2003, 2009, 'AXD', 'FWD'),
    ('transporter-t5','2.5-tdi-128kw','2.5 TDi',128,174, 2461, 'diesel', 2003, 2009, 'BPC', 'FWD'),
    ('transporter-t5','2.0-tdi-103kw','2.0 TDi',103,140, 1968, 'diesel', 2009, 2015, 'CAAC','FWD'),
    ('transporter-t5','2.0-bitdi-132kw','2.0 BiTDi',132,180,1968,'diesel',2009,2015, 'CFCA','AWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name,
    power_kw = excluded.power_kw,
    power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel = excluded.fuel,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    engine_code = excluded.engine_code,
    drive = excluded.drive,
    is_active = true;

-- ============================================================================
-- 4. TOYOTA — popular models
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'toyota')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('corolla-e110', 'Corolla E110', 1995, 2002, 'sedan'),
    ('corolla-e120', 'Corolla E120', 2001, 2007, 'sedan'),
    ('corolla-e150', 'Corolla E150', 2006, 2013, 'sedan'),
    ('yaris-xp10',   'Yaris XP10',   1999, 2005, 'hatchback'),
    ('yaris-xp90',   'Yaris XP90',   2005, 2011, 'hatchback'),
    ('avensis-t220', 'Avensis T220', 1997, 2003, 'sedan'),
    ('avensis-t250', 'Avensis T250', 2003, 2008, 'sedan'),
    ('camry-xv30',   'Camry XV30',   2002, 2006, 'sedan'),
    ('rav4-xa20',    'RAV4 XA20',    2000, 2006, 'suv'),
    ('rav4-xa30',    'RAV4 XA30',    2005, 2012, 'suv'),
    ('prius-xw20',   'Prius XW20',   2003, 2009, 'hatchback'),
    ('prius-xw30',   'Prius XW30',   2009, 2015, 'hatchback'),
    ('aygo-i',       'Aygo I',       2005, 2014, 'hatchback'),
    ('hilux-an10',   'Hilux AN10',   2004, 2015, 'pickup')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    body_type = excluded.body_type,
    is_active = true;

with mdl as (
    select vm.id, vm.slug
    from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'toyota'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    ('corolla-e110', '1.3-63kw',     '1.3 16V',      63,  86, 1332, 'petrol', 1995, 2002, '4E-FE', 'FWD'),
    ('corolla-e110', '1.4-71kw',     '1.4 16V',      71,  97, 1398, 'petrol', 1997, 2002, '4ZZ-FE','FWD'),
    ('corolla-e110', '1.6-81kw',     '1.6 16V',      81, 110, 1587, 'petrol', 1995, 2002, '4A-FE', 'FWD'),
    ('corolla-e110', '2.0-d-53kw',   '2.0 D',        53,  72, 1975, 'diesel', 1995, 2002, '2C-E',  'FWD'),
    ('corolla-e120', '1.4-71kw',     '1.4 VVT-i',    71,  97, 1398, 'petrol', 2001, 2007, '4ZZ-FE','FWD'),
    ('corolla-e120', '1.6-81kw',     '1.6 VVT-i',    81, 110, 1598, 'petrol', 2001, 2007, '3ZZ-FE','FWD'),
    ('corolla-e120', '1.8-100kw',    '1.8 VVT-i',   100, 136, 1796, 'petrol', 2001, 2007, '1ZZ-FE','FWD'),
    ('corolla-e120', '2.0-d4d-65kw', '2.0 D-4D',     65,  90, 1995, 'diesel', 2001, 2007, '1CD-FTV','FWD'),
    ('corolla-e120', '2.0-d4d-85kw', '2.0 D-4D',     85, 116, 1995, 'diesel', 2002, 2007, '1CD-FTV','FWD'),
    ('corolla-e150', '1.4-71kw',     '1.4 VVT-i',    71,  97, 1398, 'petrol', 2007, 2013, '4ZZ-FE','FWD'),
    ('corolla-e150', '1.6-91kw',     '1.6 VVT-i',    91, 124, 1598, 'petrol', 2007, 2013, '1ZR-FE','FWD'),
    ('corolla-e150', '1.8-97kw',     '1.8 VVT-i',    97, 132, 1798, 'petrol', 2007, 2013, '2ZR-FE','FWD'),
    ('corolla-e150', '2.0-d4d-93kw', '2.0 D-4D',     93, 126, 1998, 'diesel', 2007, 2013, '1AD-FTV','FWD'),
    ('yaris-xp10',   '1.0-50kw',     '1.0 VVT-i',    50,  68, 998,  'petrol', 1999, 2005, '1SZ-FE','FWD'),
    ('yaris-xp10',   '1.3-65kw',     '1.3 VVT-i',    65,  87, 1299, 'petrol', 1999, 2005, '2NZ-FE','FWD'),
    ('yaris-xp10',   '1.5-78kw',     '1.5 VVT-i',    78, 106, 1497, 'petrol', 1999, 2005, '1NZ-FE','FWD'),
    ('yaris-xp10',   '1.4-d4d-55kw', '1.4 D-4D',     55,  75, 1364, 'diesel', 2001, 2005, '1ND-TV','FWD'),
    ('yaris-xp90',   '1.0-51kw',     '1.0 VVT-i',    51,  69, 998,  'petrol', 2005, 2011, '1KR-FE','FWD'),
    ('yaris-xp90',   '1.3-64kw',     '1.3 VVT-i',    64,  87, 1298, 'petrol', 2005, 2011, '2NZ-FE','FWD'),
    ('yaris-xp90',   '1.4-d4d-66kw', '1.4 D-4D',     66,  90, 1364, 'diesel', 2005, 2011, '1ND-TV','FWD'),
    ('avensis-t220', '1.6-81kw',     '1.6 VVT-i',    81, 110, 1598, 'petrol', 1997, 2003, '3ZZ-FE','FWD'),
    ('avensis-t220', '1.8-95kw',     '1.8 VVT-i',    95, 129, 1794, 'petrol', 2000, 2003, '1ZZ-FE','FWD'),
    ('avensis-t220', '2.0-d4d-81kw', '2.0 D-4D',     81, 110, 1995, 'diesel', 1999, 2003, '1CD-FTV','FWD'),
    ('avensis-t250', '1.6-81kw',     '1.6 VVT-i',    81, 110, 1598, 'petrol', 2003, 2008, '3ZZ-FE','FWD'),
    ('avensis-t250', '1.8-95kw',     '1.8 VVT-i',    95, 129, 1794, 'petrol', 2003, 2008, '1ZZ-FE','FWD'),
    ('avensis-t250', '2.0-108kw',    '2.0 VVT-i',   108, 147, 1998, 'petrol', 2003, 2008, '1AZ-FSE','FWD'),
    ('avensis-t250', '2.0-d4d-85kw', '2.0 D-4D',     85, 116, 1995, 'diesel', 2003, 2008, '1CD-FTV','FWD'),
    ('avensis-t250', '2.2-d4d-110kw','2.2 D-4D',    110, 150, 2231, 'diesel', 2005, 2008, '2AD-FTV','FWD'),
    ('camry-xv30',   '2.4-112kw',    '2.4 VVT-i',   112, 152, 2362, 'petrol', 2002, 2006, '2AZ-FE','FWD'),
    ('camry-xv30',   '3.0-v6-142kw', '3.0 V6 VVT-i',142,194, 2994,'petrol', 2002, 2006, '1MZ-FE','FWD'),
    ('rav4-xa20',    '1.8-92kw',     '1.8 VVT-i',    92, 125, 1794, 'petrol', 2000, 2006, '1ZZ-FE','AWD'),
    ('rav4-xa20',    '2.0-110kw',    '2.0 VVT-i',   110, 150, 1998, 'petrol', 2000, 2006, '1AZ-FE','AWD'),
    ('rav4-xa20',    '2.0-d4d-85kw', '2.0 D-4D',     85, 115, 1995, 'diesel', 2001, 2006, '1CD-FTV','AWD'),
    ('rav4-xa30',    '2.0-112kw',    '2.0 VVT-i',   112, 152, 1998, 'petrol', 2005, 2012, '1AZ-FE','AWD'),
    ('rav4-xa30',    '2.4-125kw',    '2.4 VVT-i',   125, 170, 2362, 'petrol', 2005, 2012, '2AZ-FE','AWD'),
    ('rav4-xa30',    '2.2-d4d-100kw','2.2 D-4D',    100, 136, 2231, 'diesel', 2005, 2012, '2AD-FTV','AWD'),
    ('rav4-xa30',    '2.2-d4d-130kw','2.2 D-CAT',   130, 177, 2231, 'diesel', 2006, 2012, '2AD-FHV','AWD'),
    ('prius-xw20',   '1.5-hybrid-57kw','1.5 Hybrid',57,  78, 1497, 'hybrid', 2003, 2009, '1NZ-FXE','FWD'),
    ('prius-xw30',   '1.8-hybrid-73kw','1.8 Hybrid',73,  99, 1798, 'hybrid', 2009, 2015, '2ZR-FXE','FWD'),
    ('aygo-i',       '1.0-50kw',     '1.0 VVT-i',    50,  68, 998,  'petrol', 2005, 2014, '1KR-FE','FWD'),
    ('aygo-i',       '1.4-d4d-40kw', '1.4 D-4D',     40,  54, 1364, 'diesel', 2005, 2010, '1ND-TV','FWD'),
    ('hilux-an10',   '2.5-d4d-75kw', '2.5 D-4D',     75, 102, 2494, 'diesel', 2004, 2015, '2KD-FTV','AWD'),
    ('hilux-an10',   '2.5-d4d-106kw','2.5 D-4D',    106, 144, 2494, 'diesel', 2004, 2015, '2KD-FTV','AWD'),
    ('hilux-an10',   '3.0-d4d-126kw','3.0 D-4D',    126, 171, 2982, 'diesel', 2006, 2015, '1KD-FTV','AWD'),
    ('hilux-an10',   '4.0-v6-175kw', '4.0 V6',      175, 238, 3956, 'petrol', 2005, 2015, '1GR-FE','AWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name,
    power_kw = excluded.power_kw,
    power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel = excluded.fuel,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    engine_code = excluded.engine_code,
    drive = excluded.drive,
    is_active = true;

-- ============================================================================
-- 5. MERCEDES-BENZ — popular models
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'mercedes-benz')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('c-class-w202',  'C-Class W202',  1993, 2000, 'sedan'),
    ('c-class-w203',  'C-Class W203',  2000, 2007, 'sedan'),
    ('c-class-w204',  'C-Class W204',  2007, 2014, 'sedan'),
    ('e-class-w210',  'E-Class W210',  1995, 2002, 'sedan'),
    ('e-class-w211',  'E-Class W211',  2002, 2009, 'sedan'),
    ('e-class-w212',  'E-Class W212',  2009, 2016, 'sedan'),
    ('s-class-w220',  'S-Class W220',  1998, 2005, 'sedan'),
    ('s-class-w221',  'S-Class W221',  2005, 2013, 'sedan'),
    ('a-class-w168',  'A-Class W168',  1997, 2004, 'hatchback'),
    ('a-class-w169',  'A-Class W169',  2004, 2012, 'hatchback'),
    ('ml-w164',       'ML W164',       2005, 2011, 'suv'),
    ('vito-w638',     'Vito W638',     1996, 2003, 'van'),
    ('vito-w639',     'Vito W639',     2003, 2014, 'van'),
    ('sprinter-w906', 'Sprinter W906', 2006, 2018, 'van')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    body_type = excluded.body_type,
    is_active = true;

with mdl as (
    select vm.id, vm.slug
    from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'mercedes-benz'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- C-Class W202
    ('c-class-w202', 'c180-90kw',    'C 180',         90, 122, 1799, 'petrol', 1993, 2000, 'M111.920','RWD'),
    ('c-class-w202', 'c200-100kw',   'C 200',        100, 136, 1998, 'petrol', 1993, 2000, 'M111.945','RWD'),
    ('c-class-w202', 'c220-110kw',   'C 220',        110, 150, 2199, 'petrol', 1993, 2000, 'M111.961','RWD'),
    ('c-class-w202', 'c280-142kw',   'C 280',        142, 193, 2799, 'petrol', 1993, 2000, 'M104.941','RWD'),
    ('c-class-w202', 'c200-cdi-75kw','C 200 CDi',     75, 102, 2151, 'diesel', 1998, 2000, 'OM611.960','RWD'),
    ('c-class-w202', 'c220-cdi-92kw','C 220 CDi',     92, 125, 2151, 'diesel', 1997, 2000, 'OM611.961','RWD'),
    ('c-class-w202', 'c250-td-110kw','C 250 TD',     110, 150, 2497, 'diesel', 1995, 2000, 'OM605.960','RWD'),
    -- C-Class W203
    ('c-class-w203', 'c180-k-105kw', 'C 180 K',      105, 143, 1796, 'petrol', 2002, 2007, 'M271.946','RWD'),
    ('c-class-w203', 'c200-k-120kw', 'C 200 K',      120, 163, 1796, 'petrol', 2002, 2007, 'M271.940','RWD'),
    ('c-class-w203', 'c230-k-145kw', 'C 230 K',      145, 197, 1796, 'petrol', 2004, 2007, 'M271.948','RWD'),
    ('c-class-w203', 'c320-v6-160kw','C 320 V6',     160, 218, 3199, 'petrol', 2000, 2007, 'M112.946','RWD'),
    ('c-class-w203', 'c200-cdi-90kw','C 200 CDi',     90, 122, 2148, 'diesel', 2003, 2007, 'OM646.962','RWD'),
    ('c-class-w203', 'c220-cdi-110kw','C 220 CDi',  110, 150, 2148, 'diesel', 2003, 2007, 'OM646.963','RWD'),
    ('c-class-w203', 'c270-cdi-125kw','C 270 CDi',  125, 170, 2685, 'diesel', 2000, 2005, 'OM612.962','RWD'),
    -- C-Class W204
    ('c-class-w204', 'c180-k-115kw', 'C 180 K',      115, 156, 1796, 'petrol', 2007, 2009, 'M271.910','RWD'),
    ('c-class-w204', 'c200-k-135kw', 'C 200 K',      135, 184, 1796, 'petrol', 2007, 2009, 'M271.911','RWD'),
    ('c-class-w204', 'c250-cgi-150kw','C 250 CGi',  150, 204, 1796, 'petrol', 2009, 2014, 'M271.821','RWD'),
    ('c-class-w204', 'c350-220kw',   'C 350',        220, 299, 3498, 'petrol', 2007, 2014, 'M272.984','RWD'),
    ('c-class-w204', 'c200-cdi-100kw','C 200 CDi', 100, 136, 2143, 'diesel', 2007, 2014, 'OM651.911','RWD'),
    ('c-class-w204', 'c220-cdi-125kw','C 220 CDi', 125, 170, 2143, 'diesel', 2007, 2014, 'OM651.911','RWD'),
    ('c-class-w204', 'c350-cdi-195kw','C 350 CDi', 195, 265, 2987, 'diesel', 2009, 2014, 'OM642.961','RWD'),
    -- E-Class W210
    ('e-class-w210', 'e200-100kw',   'E 200',        100, 136, 1998, 'petrol', 1995, 2002, 'M111.957','RWD'),
    ('e-class-w210', 'e240-v6-125kw','E 240 V6',    125, 170, 2398, 'petrol', 1997, 2002, 'M112.911','RWD'),
    ('e-class-w210', 'e280-v6-142kw','E 280 V6',    142, 193, 2799, 'petrol', 1995, 2002, 'M112.921','RWD'),
    ('e-class-w210', 'e320-v6-165kw','E 320 V6',    165, 224, 3199, 'petrol', 1997, 2002, 'M112.941','RWD'),
    ('e-class-w210', 'e220-cdi-92kw','E 220 CDi',    92, 125, 2151, 'diesel', 1999, 2002, 'OM611.961','RWD'),
    ('e-class-w210', 'e270-cdi-125kw','E 270 CDi', 125, 170, 2685, 'diesel', 1999, 2002, 'OM612.961','RWD'),
    ('e-class-w210', 'e320-cdi-145kw','E 320 CDi', 145, 197, 3222, 'diesel', 1999, 2002, 'OM613.961','RWD'),
    -- E-Class W211
    ('e-class-w211', 'e200-k-135kw', 'E 200 K',      135, 184, 1796, 'petrol', 2002, 2009, 'M271.940','RWD'),
    ('e-class-w211', 'e240-v6-130kw','E 240 V6',    130, 177, 2597, 'petrol', 2002, 2005, 'M112.913','RWD'),
    ('e-class-w211', 'e320-v6-165kw','E 320 V6',    165, 224, 3199, 'petrol', 2002, 2005, 'M112.949','RWD'),
    ('e-class-w211', 'e350-200kw',   'E 350',        200, 272, 3498, 'petrol', 2004, 2009, 'M272.964','RWD'),
    ('e-class-w211', 'e500-v8-225kw','E 500 V8',    225, 306, 4966, 'petrol', 2002, 2006, 'M113.967','RWD'),
    ('e-class-w211', 'e220-cdi-125kw','E 220 CDi', 125, 170, 2148, 'diesel', 2006, 2009, 'OM646.961','RWD'),
    ('e-class-w211', 'e270-cdi-130kw','E 270 CDi', 130, 177, 2685, 'diesel', 2002, 2005, 'OM647.961','RWD'),
    ('e-class-w211', 'e320-cdi-150kw','E 320 CDi', 150, 204, 3222, 'diesel', 2002, 2005, 'OM648.961','RWD'),
    ('e-class-w211', 'e320-cdi-165kw','E 320 CDi', 165, 224, 2987, 'diesel', 2005, 2009, 'OM642.920','RWD'),
    -- E-Class W212
    ('e-class-w212', 'e200-cgi-135kw','E 200 CGi', 135, 184, 1796, 'petrol', 2009, 2016, 'M271.860','RWD'),
    ('e-class-w212', 'e250-cgi-150kw','E 250 CGi', 150, 204, 1796, 'petrol', 2009, 2014, 'M271.820','RWD'),
    ('e-class-w212', 'e350-v6-200kw','E 350 V6',  200, 272, 3498, 'petrol', 2009, 2014, 'M272.967','RWD'),
    ('e-class-w212', 'e500-v8-285kw','E 500 V8',  285, 388, 4663, 'petrol', 2011, 2016, 'M278.922','RWD'),
    ('e-class-w212', 'e200-cdi-100kw','E 200 CDi',100, 136, 2143, 'diesel', 2009, 2016, 'OM651.911','RWD'),
    ('e-class-w212', 'e220-cdi-125kw','E 220 CDi',125, 170, 2143, 'diesel', 2009, 2016, 'OM651.924','RWD'),
    ('e-class-w212', 'e250-cdi-150kw','E 250 CDi',150, 204, 2143, 'diesel', 2009, 2016, 'OM651.924','RWD'),
    ('e-class-w212', 'e350-cdi-195kw','E 350 CDi',195, 265, 2987, 'diesel', 2009, 2016, 'OM642.852','RWD'),
    -- S-Class W220
    ('s-class-w220', 's280-v6-150kw','S 280 V6',  150, 204, 2799, 'petrol', 1998, 2005, 'M112.922','RWD'),
    ('s-class-w220', 's320-v6-165kw','S 320 V6',  165, 224, 3199, 'petrol', 1998, 2005, 'M112.944','RWD'),
    ('s-class-w220', 's430-v8-205kw','S 430 V8',  205, 279, 4266, 'petrol', 1998, 2005, 'M113.941','RWD'),
    ('s-class-w220', 's500-v8-225kw','S 500 V8',  225, 306, 4966, 'petrol', 1998, 2005, 'M113.960','RWD'),
    ('s-class-w220', 's600-v12-270kw','S 600 V12',270, 367, 5786, 'petrol', 1999, 2002, 'M137.970','RWD'),
    ('s-class-w220', 's320-cdi-145kw','S 320 CDi',145, 197, 3222, 'diesel', 1999, 2005, 'OM613.960','RWD'),
    ('s-class-w220', 's400-cdi-184kw','S 400 CDi',184, 250, 3996, 'diesel', 2000, 2005, 'OM628.960','RWD'),
    -- S-Class W221
    ('s-class-w221', 's350-200kw',   'S 350',        200, 272, 3498, 'petrol', 2005, 2013, 'M272.967','RWD'),
    ('s-class-w221', 's500-v8-285kw','S 500 V8',    285, 388, 4663, 'petrol', 2010, 2013, 'M278.929','RWD'),
    ('s-class-w221', 's600-v12-380kw','S 600 V12', 380, 517, 5513, 'petrol', 2005, 2013, 'M275.953','RWD'),
    ('s-class-w221', 's320-cdi-173kw','S 320 CDi', 173, 235, 2987, 'diesel', 2005, 2009, 'OM642.930','RWD'),
    ('s-class-w221', 's350-cdi-195kw','S 350 CDi', 195, 265, 2987, 'diesel', 2009, 2013, 'OM642.853','RWD'),
    ('s-class-w221', 's420-cdi-235kw','S 420 CDi', 235, 320, 3996, 'diesel', 2005, 2010, 'OM629.910','RWD'),
    -- A-Class W168
    ('a-class-w168', 'a140-60kw',    'A 140',         60,  82, 1397, 'petrol', 1997, 2004, 'M166.940','FWD'),
    ('a-class-w168', 'a160-75kw',    'A 160',         75, 102, 1598, 'petrol', 1997, 2004, 'M166.960','FWD'),
    ('a-class-w168', 'a190-92kw',    'A 190',         92, 125, 1898, 'petrol', 1999, 2004, 'M166.990','FWD'),
    ('a-class-w168', 'a160-cdi-44kw','A 160 CDi',     44,  60, 1689, 'diesel', 1998, 2004, 'OM668.940','FWD'),
    ('a-class-w168', 'a170-cdi-70kw','A 170 CDi',     70,  95, 1689, 'diesel', 1998, 2004, 'OM668.942','FWD'),
    -- A-Class W169
    ('a-class-w169', 'a150-70kw',    'A 150',         70,  95, 1498, 'petrol', 2004, 2012, 'M266.920','FWD'),
    ('a-class-w169', 'a160-70kw',    'A 160',         70,  95, 1498, 'petrol', 2008, 2012, 'M266.920','FWD'),
    ('a-class-w169', 'a170-85kw',    'A 170',         85, 116, 1699, 'petrol', 2004, 2008, 'M266.940','FWD'),
    ('a-class-w169', 'a200-100kw',   'A 200',        100, 136, 2034, 'petrol', 2004, 2012, 'M266.960','FWD'),
    ('a-class-w169', 'a200-turbo-142kw','A 200 Turbo',142,193,2034, 'petrol', 2004, 2012, 'M266.980','FWD'),
    ('a-class-w169', 'a160-cdi-60kw','A 160 CDi',     60,  82, 1991, 'diesel', 2004, 2012, 'OM640.941','FWD'),
    ('a-class-w169', 'a180-cdi-80kw','A 180 CDi',     80, 109, 1991, 'diesel', 2004, 2012, 'OM640.940','FWD'),
    ('a-class-w169', 'a200-cdi-100kw','A 200 CDi',  100, 136, 1991, 'diesel', 2004, 2012, 'OM640.942','FWD'),
    -- ML W164
    ('ml-w164',      'ml-280-cdi-140kw','ML 280 CDi',140,190, 2987, 'diesel', 2005, 2009, 'OM642.940','AWD'),
    ('ml-w164',      'ml-300-cdi-140kw','ML 300 CDi',140,190, 2987, 'diesel', 2009, 2011, 'OM642.940','AWD'),
    ('ml-w164',      'ml-320-cdi-165kw','ML 320 CDi',165,224, 2987, 'diesel', 2005, 2009, 'OM642.940','AWD'),
    ('ml-w164',      'ml-350-200kw', 'ML 350 V6',   200, 272, 3498, 'petrol', 2005, 2011, 'M272.967','AWD'),
    ('ml-w164',      'ml-500-v8-285kw','ML 500 V8',285, 388, 5461, 'petrol', 2005, 2011, 'M273.963','AWD'),
    -- Vito W638
    ('vito-w638',    '108-d-58kw',   '108 D',         58,  79, 2299, 'diesel', 1995, 2003, 'OM601.942','RWD'),
    ('vito-w638',    '110-cdi-75kw', '110 CDi',       75, 102, 2151, 'diesel', 1999, 2003, 'OM611.980','RWD'),
    ('vito-w638',    '112-cdi-90kw', '112 CDi',       90, 122, 2151, 'diesel', 1999, 2003, 'OM611.980','RWD'),
    ('vito-w638',    '113-92kw',     '113',           92, 125, 2295, 'petrol', 1996, 2003, 'M111.949','RWD'),
    -- Vito W639
    ('vito-w639',    '109-cdi-65kw', '109 CDi',       65,  88, 2148, 'diesel', 2003, 2010, 'OM646.982','RWD'),
    ('vito-w639',    '111-cdi-80kw', '111 CDi',       80, 109, 2148, 'diesel', 2003, 2010, 'OM646.983','RWD'),
    ('vito-w639',    '115-cdi-110kw','115 CDi',      110, 150, 2148, 'diesel', 2003, 2010, 'OM646.980','RWD'),
    ('vito-w639',    '120-cdi-150kw','120 CDi',      150, 204, 2987, 'diesel', 2006, 2014, 'OM642.990','RWD'),
    -- Sprinter W906
    ('sprinter-w906','311-cdi-80kw', '311 CDi',       80, 109, 2148, 'diesel', 2006, 2018, 'OM646.989','RWD'),
    ('sprinter-w906','313-cdi-95kw', '313 CDi',       95, 129, 2143, 'diesel', 2009, 2018, 'OM651.957','RWD'),
    ('sprinter-w906','315-cdi-110kw','315 CDi',      110, 150, 2148, 'diesel', 2006, 2009, 'OM646.985','RWD'),
    ('sprinter-w906','318-cdi-135kw','318 CDi V6',   135, 184, 2987, 'diesel', 2006, 2018, 'OM642.992','RWD'),
    ('sprinter-w906','316-95kw',     '316',           95, 129, 1796, 'petrol', 2009, 2018, 'M271.948','RWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name,
    power_kw = excluded.power_kw,
    power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel = excluded.fuel,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    engine_code = excluded.engine_code,
    drive = excluded.drive,
    is_active = true;

-- ============================================================================
-- 6. Link 5 universal products to ALL engine types (every page has products)
-- ============================================================================
insert into public.vehicle_part_link (vehicle_type_id, product_id)
select t.id, p.id
from public.vehicle_types t
cross join public.products p
where p.slug in (
    'castrol-edge-5w30-5l',
    'bosch-aerotwin-ar20u',
    'mann-cu-26-006-cabin-filter',
    'varta-blue-d24',
    'osram-h7-night-breaker'
)
on conflict (vehicle_type_id, product_id) do nothing;

-- =============================================================================
-- Verify with:
--   select count(*) from public.vehicle_makes where is_active;        -- 35
--   select count(*) from public.vehicle_models where is_active;       -- ~75
--   select count(*) from public.vehicle_types where is_active;        -- ~330
--   select count(*) from public.vehicle_part_link;                    -- ~1700+
--
-- Sample any engine page now has 5 universal products + Honda Accord II also
-- has 8 brand-specific products in their categories.
-- =============================================================================
-- =============================================================================
-- Vehicle taxonomy MEGA seed — part 1/4
-- AUDI + OPEL + FORD (3 brands, ~44 models, ~340 engines)
--
-- ACCURACY DISCLAIMER: hand-crafted from public TecDoc-style knowledge.
-- kW/HP/cc/years are accurate. Engine codes (ABM, Z16XE, 1Z, AHU, etc.) are
-- the real factory codes but at this volume there WILL be edge-case errors
-- (variant naming between markets, mid-cycle code changes). Good for UX/demo.
-- For production checkout: validate via TecDoc (Apify) before committing.
--
-- Idempotent. Run AFTER supabase-vehicles-seed-expanded.sql.
-- =============================================================================

-- ============================================================================
-- AUDI — 16 models, ~110 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'audi')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('80-b4',     '80 B4',      1991, 1996, 'sedan'),
    ('100-c4',    '100 C4',     1990, 1994, 'sedan'),
    ('a1-8x',     'A1 8X',      2010, 2018, 'hatchback'),
    ('a3-8l',     'A3 8L',      1996, 2003, 'hatchback'),
    ('a3-8p',     'A3 8P',      2003, 2012, 'hatchback'),
    ('a3-8v',     'A3 8V',      2012, 2020, 'hatchback'),
    ('a4-b5',     'A4 B5',      1994, 2001, 'sedan'),
    ('a4-b6',     'A4 B6',      2000, 2004, 'sedan'),
    ('a4-b7',     'A4 B7',      2004, 2008, 'sedan'),
    ('a4-b8',     'A4 B8',      2008, 2015, 'sedan'),
    ('a6-c4',     'A6 C4',      1994, 1997, 'sedan'),
    ('a6-c5',     'A6 C5',      1997, 2004, 'sedan'),
    ('a6-c6',     'A6 C6',      2004, 2011, 'sedan'),
    ('a6-c7',     'A6 C7',      2011, 2018, 'sedan'),
    ('q5-8r',     'Q5 8R',      2008, 2017, 'suv'),
    ('q7-4l',     'Q7 4L',      2005, 2015, 'suv'),
    ('tt-8n',     'TT 8N',      1998, 2006, 'coupe'),
    ('tt-8j',     'TT 8J',      2006, 2014, 'coupe')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'audi'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- 80 B4
    ('80-b4',  '1.6-55kw',     '1.6',          55,  75, 1595, 'petrol', 1991, 1996, 'ABM', 'FWD'),
    ('80-b4',  '2.0-85kw',     '2.0',          85, 116, 1984, 'petrol', 1991, 1996, 'ABK', 'FWD'),
    ('80-b4',  '2.0-16v-103kw','2.0 16V',     103, 140, 1984, 'petrol', 1992, 1996, 'ACE', 'FWD'),
    ('80-b4',  '2.6-v6-110kw', '2.6 V6',      110, 150, 2598, 'petrol', 1992, 1995, 'ABC', 'FWD'),
    ('80-b4',  '2.8-v6-128kw', '2.8 V6',      128, 174, 2771, 'petrol', 1991, 1996, 'AAH', 'FWD'),
    ('80-b4',  '1.9-tdi-66kw', '1.9 TDi',      66,  90, 1896, 'diesel', 1991, 1996, '1Z',  'FWD'),
    ('80-b4',  '2.5-tdi-85kw', '2.5 TDi',      85, 116, 2461, 'diesel', 1991, 1996, 'AAT', 'FWD'),
    -- 100 C4
    ('100-c4', '2.0-74kw',     '2.0',          74, 101, 1984, 'petrol', 1990, 1994, 'AAE', 'FWD'),
    ('100-c4', '2.3-98kw',     '2.3 E',        98, 133, 2309, 'petrol', 1990, 1994, 'AAR', 'FWD'),
    ('100-c4', '2.6-v6-110kw', '2.6 V6',      110, 150, 2598, 'petrol', 1992, 1994, 'ABC', 'FWD'),
    ('100-c4', '2.8-v6-128kw', '2.8 V6',      128, 174, 2771, 'petrol', 1991, 1994, 'AAH', 'FWD'),
    ('100-c4', '2.5-tdi-85kw', '2.5 TDi',      85, 116, 2461, 'diesel', 1990, 1994, 'AAT', 'FWD'),
    ('100-c4', '2.5-tdi-103kw','2.5 TDi',     103, 140, 2461, 'diesel', 1992, 1994, 'AEL', 'FWD'),
    -- A1 8X
    ('a1-8x',  '1.0-tfsi-70kw','1.0 TFSi',     70,  95,  999, 'petrol', 2014, 2018, 'CHZB','FWD'),
    ('a1-8x',  '1.2-tfsi-63kw','1.2 TFSi',     63,  86, 1197, 'petrol', 2010, 2015, 'CBZA','FWD'),
    ('a1-8x',  '1.4-tfsi-90kw','1.4 TFSi',     90, 122, 1390, 'petrol', 2010, 2014, 'CAXA','FWD'),
    ('a1-8x',  '1.4-tfsi-110kw','1.4 TFSi',   110, 150, 1395, 'petrol', 2014, 2018, 'CZEA','FWD'),
    ('a1-8x',  '1.8-tfsi-141kw','1.8 TFSi',   141, 192, 1798, 'petrol', 2014, 2018, 'CJSA','FWD'),
    ('a1-8x',  '2.0-tfsi-170kw','2.0 TFSi S1',170, 231, 1984, 'petrol', 2014, 2018, 'CWZA','AWD'),
    ('a1-8x',  '1.4-tdi-66kw', '1.4 TDi',      66,  90, 1422, 'diesel', 2014, 2018, 'CUSA','FWD'),
    ('a1-8x',  '1.6-tdi-66kw', '1.6 TDi',      66,  90, 1598, 'diesel', 2010, 2014, 'CAYB','FWD'),
    ('a1-8x',  '1.6-tdi-77kw', '1.6 TDi',      77, 105, 1598, 'diesel', 2010, 2014, 'CAYC','FWD'),
    -- A3 8L
    ('a3-8l',  '1.6-75kw',     '1.6',          75, 102, 1595, 'petrol', 1996, 2003, 'AEH', 'FWD'),
    ('a3-8l',  '1.8-92kw',     '1.8',          92, 125, 1781, 'petrol', 1996, 2003, 'AGN', 'FWD'),
    ('a3-8l',  '1.8-t-110kw',  '1.8 T',       110, 150, 1781, 'petrol', 1996, 2003, 'AGU', 'FWD'),
    ('a3-8l',  '1.8-t-132kw',  '1.8 T',       132, 180, 1781, 'petrol', 1999, 2003, 'AUM', 'FWD'),
    ('a3-8l',  's3-1.8t-154kw','S3 1.8T',     154, 210, 1781, 'petrol', 1999, 2003, 'AMK', 'AWD'),
    ('a3-8l',  '1.9-tdi-66kw', '1.9 TDi',      66,  90, 1896, 'diesel', 1996, 2003, 'AGR', 'FWD'),
    ('a3-8l',  '1.9-tdi-74kw', '1.9 TDi',      74, 100, 1896, 'diesel', 2000, 2003, 'ATD', 'FWD'),
    ('a3-8l',  '1.9-tdi-96kw', '1.9 TDi',      96, 130, 1896, 'diesel', 2000, 2003, 'ASZ', 'FWD'),
    -- A3 8P
    ('a3-8p',  '1.4-tfsi-92kw','1.4 TFSi',     92, 125, 1390, 'petrol', 2007, 2012, 'CAXC','FWD'),
    ('a3-8p',  '1.6-75kw',     '1.6',          75, 102, 1595, 'petrol', 2003, 2012, 'BSE', 'FWD'),
    ('a3-8p',  '1.6-fsi-85kw', '1.6 FSi',      85, 115, 1598, 'petrol', 2003, 2008, 'BAG', 'FWD'),
    ('a3-8p',  '1.8-tfsi-118kw','1.8 TFSi',  118, 160, 1798, 'petrol', 2007, 2012, 'CDAA','FWD'),
    ('a3-8p',  '2.0-tfsi-147kw','2.0 TFSi',  147, 200, 1984, 'petrol', 2004, 2012, 'BWA', 'FWD'),
    ('a3-8p',  's3-2.0tfsi-195kw','S3 2.0 TFSi',195,265, 1984,'petrol', 2006, 2012, 'CDLA','AWD'),
    ('a3-8p',  '1.6-tdi-66kw', '1.6 TDi',      66,  90, 1598, 'diesel', 2009, 2012, 'CAYB','FWD'),
    ('a3-8p',  '1.6-tdi-77kw', '1.6 TDi',      77, 105, 1598, 'diesel', 2009, 2012, 'CAYC','FWD'),
    ('a3-8p',  '2.0-tdi-100kw','2.0 TDi',    100, 136, 1968, 'diesel', 2003, 2008, 'BKD', 'FWD'),
    ('a3-8p',  '2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2003, 2008, 'BKD', 'FWD'),
    ('a3-8p',  '2.0-tdi-125kw','2.0 TDi',    125, 170, 1968, 'diesel', 2005, 2008, 'BMN', 'FWD'),
    ('a3-8p',  '3.2-v6-184kw', '3.2 V6 quattro',184,250,3189,'petrol', 2003, 2009, 'BUB', 'AWD'),
    -- A3 8V
    ('a3-8v',  '1.0-tfsi-85kw','1.0 TFSi',     85, 116,  999, 'petrol', 2016, 2020, 'CHZJ','FWD'),
    ('a3-8v',  '1.2-tfsi-77kw','1.2 TFSi',     77, 105, 1197, 'petrol', 2012, 2014, 'CJZA','FWD'),
    ('a3-8v',  '1.4-tfsi-92kw','1.4 TFSi',     92, 125, 1395, 'petrol', 2012, 2018, 'CMBA','FWD'),
    ('a3-8v',  '1.4-tfsi-110kw','1.4 TFSi',  110, 150, 1395, 'petrol', 2014, 2020, 'CZEA','FWD'),
    ('a3-8v',  '1.5-tfsi-110kw','1.5 TFSi',  110, 150, 1498, 'petrol', 2017, 2020, 'DADA','FWD'),
    ('a3-8v',  '1.8-tfsi-132kw','1.8 TFSi',  132, 180, 1798, 'petrol', 2012, 2016, 'CJSA','FWD'),
    ('a3-8v',  '2.0-tfsi-162kw','2.0 TFSi',  162, 220, 1984, 'petrol', 2013, 2020, 'CHHB','FWD'),
    ('a3-8v',  's3-2.0tfsi-213kw','S3 2.0 TFSi',213,290,1984,'petrol', 2013, 2020, 'CJXC','AWD'),
    ('a3-8v',  'rs3-2.5tfsi-270kw','RS3 2.5 TFSi',270,367,2480,'petrol',2015,2020, 'CZGB','AWD'),
    ('a3-8v',  '1.6-tdi-77kw', '1.6 TDi',      77, 105, 1598, 'diesel', 2012, 2020, 'CLHA','FWD'),
    ('a3-8v',  '1.6-tdi-85kw', '1.6 TDi',      85, 116, 1598, 'diesel', 2017, 2020, 'DDYA','FWD'),
    ('a3-8v',  '2.0-tdi-110kw','2.0 TDi',    110, 150, 1968, 'diesel', 2012, 2020, 'CRBC','FWD'),
    ('a3-8v',  '2.0-tdi-135kw','2.0 TDi',    135, 184, 1968, 'diesel', 2014, 2020, 'CUNA','FWD'),
    -- A4 B5
    ('a4-b5',  '1.6-74kw',     '1.6',          74, 100, 1595, 'petrol', 1995, 2001, 'AHL', 'FWD'),
    ('a4-b5',  '1.8-92kw',     '1.8',          92, 125, 1781, 'petrol', 1994, 2001, 'ADR', 'FWD'),
    ('a4-b5',  '1.8-t-110kw',  '1.8 T',       110, 150, 1781, 'petrol', 1995, 2001, 'AEB', 'FWD'),
    ('a4-b5',  '2.4-v6-121kw', '2.4 V6',      121, 165, 2393, 'petrol', 1997, 2001, 'APS', 'FWD'),
    ('a4-b5',  '2.8-v6-142kw', '2.8 V6 30V',  142, 193, 2771, 'petrol', 1996, 2001, 'ACK', 'FWD'),
    ('a4-b5',  '1.9-tdi-66kw', '1.9 TDi',      66,  90, 1896, 'diesel', 1995, 2000, 'AHU', 'FWD'),
    ('a4-b5',  '1.9-tdi-81kw', '1.9 TDi',      81, 110, 1896, 'diesel', 1996, 2000, 'AFN', 'FWD'),
    ('a4-b5',  '1.9-tdi-85kw', '1.9 TDi',      85, 115, 1896, 'diesel', 2000, 2001, 'AJM', 'FWD'),
    ('a4-b5',  '2.5-tdi-110kw','2.5 TDi V6', 110, 150, 2496, 'diesel', 1997, 2001, 'AFB', 'FWD'),
    -- A4 B6
    ('a4-b6',  '1.6-75kw',     '1.6',          75, 102, 1595, 'petrol', 2000, 2004, 'ALZ', 'FWD'),
    ('a4-b6',  '1.8-t-110kw',  '1.8 T',       110, 150, 1781, 'petrol', 2000, 2004, 'BEX', 'FWD'),
    ('a4-b6',  '1.8-t-140kw',  '1.8 T quattro',140,190,1781, 'petrol', 2002, 2004, 'BFB', 'AWD'),
    ('a4-b6',  '2.0-96kw',     '2.0',          96, 130, 1984, 'petrol', 2000, 2004, 'ALT', 'FWD'),
    ('a4-b6',  '3.0-v6-160kw', '3.0 V6',      160, 218, 2976, 'petrol', 2000, 2004, 'ASN', 'FWD'),
    ('a4-b6',  '1.9-tdi-74kw', '1.9 TDi',      74, 101, 1896, 'diesel', 2000, 2004, 'AVB', 'FWD'),
    ('a4-b6',  '1.9-tdi-96kw', '1.9 TDi',      96, 130, 1896, 'diesel', 2001, 2004, 'AWX', 'FWD'),
    ('a4-b6',  '2.5-tdi-114kw','2.5 TDi V6', 114, 155, 2496, 'diesel', 2000, 2004, 'BAU', 'FWD'),
    ('a4-b6',  '2.5-tdi-132kw','2.5 TDi V6', 132, 180, 2496, 'diesel', 2002, 2004, 'BFC', 'FWD'),
    -- A4 B7
    ('a4-b7',  '1.6-75kw',     '1.6',          75, 102, 1595, 'petrol', 2004, 2008, 'ALZ', 'FWD'),
    ('a4-b7',  '1.8-t-120kw',  '1.8 T',       120, 163, 1781, 'petrol', 2004, 2008, 'BFB', 'FWD'),
    ('a4-b7',  '2.0-tfsi-147kw','2.0 TFSi',  147, 200, 1984, 'petrol', 2004, 2008, 'BUL', 'FWD'),
    ('a4-b7',  '3.2-fsi-188kw','3.2 FSi V6', 188, 255, 3123, 'petrol', 2004, 2008, 'AUK', 'FWD'),
    ('a4-b7',  'rs4-4.2-309kw','RS4 4.2 V8', 309, 420, 4163, 'petrol', 2005, 2008, 'BNS', 'AWD'),
    ('a4-b7',  '1.9-tdi-85kw', '1.9 TDi',      85, 116, 1896, 'diesel', 2004, 2008, 'BKE', 'FWD'),
    ('a4-b7',  '2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2004, 2008, 'BLB', 'FWD'),
    ('a4-b7',  '2.0-tdi-125kw','2.0 TDi',    125, 170, 1968, 'diesel', 2006, 2008, 'BPW', 'FWD'),
    ('a4-b7',  '2.5-tdi-132kw','2.5 TDi V6', 132, 180, 2496, 'diesel', 2004, 2006, 'BCZ', 'FWD'),
    -- A4 B8
    ('a4-b8',  '1.8-tfsi-118kw','1.8 TFSi',  118, 160, 1798, 'petrol', 2008, 2015, 'CDHB','FWD'),
    ('a4-b8',  '1.8-tfsi-125kw','1.8 TFSi',  125, 170, 1798, 'petrol', 2011, 2015, 'CJEB','FWD'),
    ('a4-b8',  '2.0-tfsi-132kw','2.0 TFSi',  132, 180, 1984, 'petrol', 2008, 2015, 'CDNB','FWD'),
    ('a4-b8',  '2.0-tfsi-155kw','2.0 TFSi',  155, 211, 1984, 'petrol', 2008, 2012, 'CDNC','FWD'),
    ('a4-b8',  '3.0-tfsi-200kw','3.0 TFSi',  200, 272, 2995, 'petrol', 2008, 2015, 'CAKA','AWD'),
    ('a4-b8',  '3.2-fsi-195kw','3.2 FSi V6', 195, 265, 3197, 'petrol', 2008, 2012, 'CALA','AWD'),
    ('a4-b8',  'rs4-4.2-331kw','RS4 4.2 V8', 331, 450, 4163, 'petrol', 2012, 2015, 'CFSA','AWD'),
    ('a4-b8',  '2.0-tdi-100kw','2.0 TDi',    100, 136, 1968, 'diesel', 2008, 2015, 'CAGB','FWD'),
    ('a4-b8',  '2.0-tdi-105kw','2.0 TDi',    105, 143, 1968, 'diesel', 2008, 2013, 'CAGA','FWD'),
    ('a4-b8',  '2.0-tdi-130kw','2.0 TDi',    130, 177, 1968, 'diesel', 2011, 2015, 'CGLC','FWD'),
    ('a4-b8',  '2.7-tdi-140kw','2.7 TDi V6', 140, 190, 2698, 'diesel', 2008, 2012, 'CAMA','FWD'),
    ('a4-b8',  '3.0-tdi-150kw','3.0 TDi V6', 150, 204, 2967, 'diesel', 2008, 2015, 'CAPA','AWD'),
    ('a4-b8',  '3.0-tdi-176kw','3.0 TDi V6', 176, 240, 2967, 'diesel', 2008, 2011, 'CCWA','AWD'),
    -- A6 C5
    ('a6-c5',  '1.8-92kw',     '1.8',          92, 125, 1781, 'petrol', 1997, 2001, 'ADR', 'FWD'),
    ('a6-c5',  '1.8-t-110kw',  '1.8 T',       110, 150, 1781, 'petrol', 1997, 2004, 'AEB', 'FWD'),
    ('a6-c5',  '1.8-t-132kw',  '1.8 T',       132, 180, 1781, 'petrol', 2000, 2004, 'AWT', 'FWD'),
    ('a6-c5',  '2.4-v6-125kw', '2.4 V6',      125, 170, 2393, 'petrol', 1997, 2004, 'APS', 'FWD'),
    ('a6-c5',  '2.8-v6-142kw', '2.8 V6 30V', 142, 193, 2771, 'petrol', 1997, 2001, 'ACK', 'FWD'),
    ('a6-c5',  '3.0-v6-162kw', '3.0 V6',     162, 220, 2976, 'petrol', 2001, 2004, 'ASN', 'FWD'),
    ('a6-c5',  '4.2-v8-220kw', '4.2 V8',     220, 299, 4172, 'petrol', 1998, 2004, 'AQJ', 'AWD'),
    ('a6-c5',  '1.9-tdi-81kw', '1.9 TDi',     81, 110, 1896, 'diesel', 1997, 2001, 'AFN', 'FWD'),
    ('a6-c5',  '1.9-tdi-96kw', '1.9 TDi',     96, 130, 1896, 'diesel', 2001, 2004, 'AVF', 'FWD'),
    ('a6-c5',  '2.5-tdi-110kw','2.5 TDi V6', 110, 150, 2496, 'diesel', 1997, 2004, 'AFB', 'FWD'),
    ('a6-c5',  '2.5-tdi-132kw','2.5 TDi V6', 132, 180, 2496, 'diesel', 2002, 2004, 'BAU', 'FWD'),
    -- A6 C6
    ('a6-c6',  '2.0-tfsi-125kw','2.0 TFSi',  125, 170, 1984, 'petrol', 2005, 2011, 'BPJ', 'FWD'),
    ('a6-c6',  '2.0-tfsi-170kw','2.0 TFSi',  170, 230, 1984, 'petrol', 2008, 2011, 'CDNC','FWD'),
    ('a6-c6',  '2.4-v6-130kw', '2.4 V6',     130, 177, 2393, 'petrol', 2004, 2008, 'BDW', 'FWD'),
    ('a6-c6',  '2.8-fsi-162kw','2.8 FSi V6', 162, 220, 2773, 'petrol', 2006, 2011, 'BDX', 'FWD'),
    ('a6-c6',  '3.0-tfsi-213kw','3.0 TFSi V6',213,290, 2995,'petrol', 2008, 2011, 'CAJA','AWD'),
    ('a6-c6',  '3.2-fsi-188kw','3.2 FSi V6', 188, 255, 3123, 'petrol', 2004, 2008, 'AUK', 'FWD'),
    ('a6-c6',  '4.2-fsi-257kw','4.2 FSi V8', 257, 350, 4163, 'petrol', 2006, 2011, 'BAT', 'AWD'),
    ('a6-c6',  '2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2004, 2008, 'BLB', 'FWD'),
    ('a6-c6',  '2.0-tdi-125kw','2.0 TDi',    125, 170, 1968, 'diesel', 2008, 2011, 'CAHA','FWD'),
    ('a6-c6',  '2.7-tdi-132kw','2.7 TDi V6', 132, 180, 2698, 'diesel', 2004, 2008, 'BPP', 'FWD'),
    ('a6-c6',  '2.7-tdi-140kw','2.7 TDi V6', 140, 190, 2698, 'diesel', 2008, 2011, 'CANA','FWD'),
    ('a6-c6',  '3.0-tdi-165kw','3.0 TDi V6', 165, 225, 2967, 'diesel', 2004, 2008, 'BMK', 'AWD'),
    ('a6-c6',  '3.0-tdi-176kw','3.0 TDi V6', 176, 240, 2967, 'diesel', 2008, 2011, 'CDYA','AWD'),
    -- A6 C7
    ('a6-c7',  '2.0-tfsi-132kw','2.0 TFSi',  132, 180, 1984, 'petrol', 2011, 2015, 'CDNB','FWD'),
    ('a6-c7',  '2.0-tfsi-185kw','2.0 TFSi',  185, 252, 1984, 'petrol', 2014, 2018, 'CYRB','FWD'),
    ('a6-c7',  '2.8-fsi-150kw','2.8 FSi V6', 150, 204, 2773, 'petrol', 2011, 2014, 'CHVA','FWD'),
    ('a6-c7',  '3.0-tfsi-220kw','3.0 TFSi V6',220,300, 2995,'petrol', 2011, 2018, 'CGWB','AWD'),
    ('a6-c7',  '3.0-tfsi-245kw','3.0 TFSi V6',245,333, 2995,'petrol', 2011, 2018, 'CGXB','AWD'),
    ('a6-c7',  'rs6-4.0-tfsi-412kw','RS6 4.0 TFSi V8',412,560,3993,'petrol',2013,2018,'CRDB','AWD'),
    ('a6-c7',  '2.0-tdi-100kw','2.0 TDi',    100, 136, 1968, 'diesel', 2011, 2018, 'CGLD','FWD'),
    ('a6-c7',  '2.0-tdi-140kw','2.0 TDi',    140, 190, 1968, 'diesel', 2011, 2018, 'CNHA','FWD'),
    ('a6-c7',  '3.0-tdi-150kw','3.0 TDi V6', 150, 204, 2967, 'diesel', 2011, 2018, 'CDUC','FWD'),
    ('a6-c7',  '3.0-tdi-180kw','3.0 TDi V6', 180, 245, 2967, 'diesel', 2011, 2018, 'CDUD','AWD'),
    ('a6-c7',  '3.0-tdi-235kw','3.0 BiTDi V6',235,320, 2967,'diesel', 2014, 2018, 'CGQB','AWD'),
    -- Q5 8R
    ('q5-8r',  '2.0-tfsi-132kw','2.0 TFSi',  132, 180, 1984, 'petrol', 2008, 2017, 'CDNB','AWD'),
    ('q5-8r',  '2.0-tfsi-165kw','2.0 TFSi',  165, 224, 1984, 'petrol', 2008, 2017, 'CDNC','AWD'),
    ('q5-8r',  '3.0-tfsi-200kw','3.0 TFSi V6',200,272, 2995,'petrol', 2008, 2012, 'CALB','AWD'),
    ('q5-8r',  '3.0-tfsi-245kw','3.0 TFSi V6',245,333, 2995,'petrol', 2012, 2017, 'CTUC','AWD'),
    ('q5-8r',  '3.2-fsi-199kw','3.2 FSi V6', 199, 270, 3197, 'petrol', 2008, 2012, 'CALA','AWD'),
    ('q5-8r',  '2.0-tdi-105kw','2.0 TDi',    105, 143, 1968, 'diesel', 2008, 2017, 'CAGA','AWD'),
    ('q5-8r',  '2.0-tdi-130kw','2.0 TDi',    130, 177, 1968, 'diesel', 2011, 2017, 'CGLC','AWD'),
    ('q5-8r',  '2.0-tdi-140kw','2.0 TDi',    140, 190, 1968, 'diesel', 2014, 2017, 'CNHC','AWD'),
    ('q5-8r',  '3.0-tdi-150kw','3.0 TDi V6', 150, 204, 2967, 'diesel', 2008, 2017, 'CCWB','AWD'),
    ('q5-8r',  '3.0-tdi-180kw','3.0 TDi V6', 180, 245, 2967, 'diesel', 2008, 2017, 'CDUC','AWD'),
    ('q5-8r',  'sq5-3.0-tdi-230kw','SQ5 3.0 BiTDi V6',230,313,2967,'diesel',2013,2017,'CGQA','AWD'),
    -- Q7 4L
    ('q7-4l',  '3.0-tfsi-200kw','3.0 TFSi V6',200,272, 2995,'petrol', 2010, 2015, 'CJTC','AWD'),
    ('q7-4l',  '3.6-fsi-206kw','3.6 FSi V6', 206, 280, 3597, 'petrol', 2006, 2010, 'BHK', 'AWD'),
    ('q7-4l',  '4.2-fsi-257kw','4.2 FSi V8', 257, 350, 4163, 'petrol', 2006, 2010, 'BAR', 'AWD'),
    ('q7-4l',  '6.0-tdi-368kw','6.0 V12 TDi V12',368,500,5934,'diesel',2008,2012, 'CCGA','AWD'),
    ('q7-4l',  '3.0-tdi-165kw','3.0 TDi V6', 165, 224, 2967, 'diesel', 2006, 2010, 'BUG', 'AWD'),
    ('q7-4l',  '3.0-tdi-176kw','3.0 TDi V6', 176, 240, 2967, 'diesel', 2007, 2010, 'CASA','AWD'),
    ('q7-4l',  '3.0-tdi-180kw','3.0 TDi V6', 180, 245, 2967, 'diesel', 2010, 2015, 'CRCA','AWD'),
    ('q7-4l',  '4.2-tdi-240kw','4.2 TDi V8', 240, 326, 4134, 'diesel', 2007, 2015, 'BTR', 'AWD'),
    -- TT 8N
    ('tt-8n',  '1.8-t-110kw',  '1.8 T',       110, 150, 1781, 'petrol', 1998, 2006, 'AJQ', 'FWD'),
    ('tt-8n',  '1.8-t-132kw',  '1.8 T quattro',132,180,1781, 'petrol', 1998, 2006, 'APX', 'AWD'),
    ('tt-8n',  '1.8-t-165kw',  '1.8 T quattro',165,225,1781, 'petrol', 1998, 2006, 'BAM', 'AWD'),
    ('tt-8n',  '3.2-v6-184kw', '3.2 V6 quattro',184,250,3189,'petrol', 2003, 2006, 'BHE', 'AWD'),
    -- TT 8J
    ('tt-8j',  '1.8-tfsi-118kw','1.8 TFSi',  118, 160, 1798, 'petrol', 2008, 2014, 'CDAA','FWD'),
    ('tt-8j',  '2.0-tfsi-147kw','2.0 TFSi',  147, 200, 1984, 'petrol', 2006, 2014, 'BWA', 'FWD'),
    ('tt-8j',  '2.0-tfsi-200kw','2.0 TFSi TTS',200,272,1984,'petrol', 2008, 2014, 'CDLB','AWD'),
    ('tt-8j',  '3.2-v6-184kw', '3.2 V6 quattro',184,250,3189,'petrol', 2006, 2010, 'BUB', 'AWD'),
    ('tt-8j',  '2.0-tdi-125kw','2.0 TDi quattro',125,170,1968,'diesel',2008,2014, 'CFGB','AWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name, power_kw = excluded.power_kw, power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc, fuel = excluded.fuel,
    year_from = excluded.year_from, year_to = excluded.year_to,
    engine_code = excluded.engine_code, drive = excluded.drive, is_active = true;

-- ============================================================================
-- OPEL — 15 models, ~120 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'opel')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('astra-g',     'Astra G',      1998, 2004, 'hatchback'),
    ('astra-h',     'Astra H',      2004, 2010, 'hatchback'),
    ('astra-j',     'Astra J',      2009, 2015, 'hatchback'),
    ('astra-k',     'Astra K',      2015, 2021, 'hatchback'),
    ('corsa-b',     'Corsa B',      1993, 2000, 'hatchback'),
    ('corsa-c',     'Corsa C',      2000, 2006, 'hatchback'),
    ('corsa-d',     'Corsa D',      2006, 2014, 'hatchback'),
    ('corsa-e',     'Corsa E',      2014, 2019, 'hatchback'),
    ('vectra-b',    'Vectra B',     1995, 2002, 'sedan'),
    ('vectra-c',    'Vectra C',     2002, 2008, 'sedan'),
    ('insignia-a',  'Insignia A',   2008, 2017, 'sedan'),
    ('insignia-b',  'Insignia B',   2017, 2022, 'sedan'),
    ('zafira-a',    'Zafira A',     1999, 2005, 'mpv'),
    ('zafira-b',    'Zafira B',     2005, 2014, 'mpv'),
    ('meriva-a',    'Meriva A',     2003, 2010, 'mpv')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'opel'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Astra G
    ('astra-g', '1.2-16v-55kw', '1.2 16V',     55,  75, 1199, 'petrol', 1998, 2004, 'Z12XE',  'FWD'),
    ('astra-g', '1.4-16v-66kw', '1.4 16V',     66,  90, 1389, 'petrol', 1998, 2004, 'Z14XE',  'FWD'),
    ('astra-g', '1.6-8v-62kw',  '1.6',         62,  84, 1598, 'petrol', 1998, 2004, 'Z16SE',  'FWD'),
    ('astra-g', '1.6-16v-74kw', '1.6 16V',     74, 100, 1598, 'petrol', 1998, 2004, 'Z16XE',  'FWD'),
    ('astra-g', '1.8-16v-92kw', '1.8 16V',     92, 125, 1796, 'petrol', 1998, 2004, 'Z18XE',  'FWD'),
    ('astra-g', '2.0-16v-100kw','2.0 16V',    100, 136, 1998, 'petrol', 1998, 2002, 'Z20XEV', 'FWD'),
    ('astra-g', '2.0-turbo-141kw','2.0 Turbo',141, 192, 1998, 'petrol', 2002, 2004, 'Z20LET', 'FWD'),
    ('astra-g', '2.2-16v-108kw','2.2 16V',    108, 147, 2198, 'petrol', 2000, 2004, 'Z22SE',  'FWD'),
    ('astra-g', '1.7-dti-55kw', '1.7 DTi',     55,  75, 1686, 'diesel', 2000, 2003, 'Y17DT',  'FWD'),
    ('astra-g', '1.7-dti-59kw', '1.7 DTi',     59,  80, 1686, 'diesel', 2000, 2003, 'Y17DT',  'FWD'),
    ('astra-g', '2.0-dti-74kw', '2.0 DTi',     74, 101, 1995, 'diesel', 1998, 2004, 'Y20DTH', 'FWD'),
    ('astra-g', '2.2-dti-92kw', '2.2 DTi',     92, 125, 2172, 'diesel', 2002, 2004, 'Y22DTR', 'FWD'),
    -- Astra H
    ('astra-h', '1.4-16v-66kw', '1.4 16V',     66,  90, 1364, 'petrol', 2004, 2010, 'Z14XEP', 'FWD'),
    ('astra-h', '1.4-16v-74kw', '1.4 16V Twinport',74,100,1364,'petrol',2004,2010, 'Z14XEP', 'FWD'),
    ('astra-h', '1.6-16v-77kw', '1.6 16V',     77, 105, 1598, 'petrol', 2004, 2010, 'Z16XEP', 'FWD'),
    ('astra-h', '1.6-16v-85kw', '1.6 16V',     85, 115, 1598, 'petrol', 2007, 2010, 'Z16XER', 'FWD'),
    ('astra-h', '1.6-turbo-132kw','1.6 Turbo',132,180,1598, 'petrol', 2007, 2010, 'Z16LER', 'FWD'),
    ('astra-h', '1.8-16v-103kw','1.8 16V',    103, 140, 1796, 'petrol', 2004, 2010, 'Z18XER', 'FWD'),
    ('astra-h', '2.0-turbo-125kw','2.0 Turbo',125,170,1998, 'petrol', 2004, 2010, 'Z20LEH', 'FWD'),
    ('astra-h', '2.0-turbo-147kw','2.0 Turbo',147,200,1998, 'petrol', 2004, 2010, 'Z20LER', 'FWD'),
    ('astra-h', 'opc-2.0-177kw','OPC 2.0 Turbo',177,240,1998,'petrol',2005,2010,  'Z20LEH', 'FWD'),
    ('astra-h', '1.3-cdti-51kw','1.3 CDTi',    51,  70, 1248, 'diesel', 2005, 2010, 'Z13DTH', 'FWD'),
    ('astra-h', '1.3-cdti-66kw','1.3 CDTi',    66,  90, 1248, 'diesel', 2005, 2010, 'Z13DTH', 'FWD'),
    ('astra-h', '1.7-cdti-59kw','1.7 CDTi',    59,  80, 1686, 'diesel', 2004, 2010, 'Z17DTL', 'FWD'),
    ('astra-h', '1.7-cdti-74kw','1.7 CDTi',    74, 100, 1686, 'diesel', 2004, 2010, 'Z17DTH', 'FWD'),
    ('astra-h', '1.7-cdti-92kw','1.7 CDTi',    92, 125, 1686, 'diesel', 2007, 2010, 'A17DTR', 'FWD'),
    ('astra-h', '1.9-cdti-74kw','1.9 CDTi',    74, 100, 1910, 'diesel', 2004, 2010, 'Z19DT',  'FWD'),
    ('astra-h', '1.9-cdti-88kw','1.9 CDTi',    88, 120, 1910, 'diesel', 2004, 2010, 'Z19DT',  'FWD'),
    ('astra-h', '1.9-cdti-110kw','1.9 CDTi 16V',110,150,1910,'diesel', 2004, 2010, 'Z19DTH', 'FWD'),
    -- Astra J
    ('astra-j', '1.4-16v-74kw', '1.4 16V',     74, 100, 1398, 'petrol', 2009, 2015, 'A14XER', 'FWD'),
    ('astra-j', '1.4-turbo-103kw','1.4 Turbo',103,140,1364, 'petrol', 2009, 2015, 'A14NET', 'FWD'),
    ('astra-j', '1.4-turbo-118kw','1.4 Turbo',118,160,1364, 'petrol', 2014, 2015, 'A14NET', 'FWD'),
    ('astra-j', '1.6-16v-85kw', '1.6 16V',     85, 116, 1598, 'petrol', 2009, 2015, 'A16XER', 'FWD'),
    ('astra-j', '1.6-turbo-132kw','1.6 Turbo',132,180,1598, 'petrol', 2009, 2015, 'A16LET', 'FWD'),
    ('astra-j', '1.6-turbo-147kw','1.6 Turbo',147,200,1598, 'petrol', 2012, 2015, 'A16LET', 'FWD'),
    ('astra-j', 'opc-2.0-206kw','OPC 2.0 Turbo',206,280,1998,'petrol',2012,2015,  'A20NHT', 'FWD'),
    ('astra-j', '1.7-cdti-81kw','1.7 CDTi',    81, 110, 1686, 'diesel', 2009, 2015, 'A17DTJ', 'FWD'),
    ('astra-j', '1.7-cdti-92kw','1.7 CDTi',    92, 125, 1686, 'diesel', 2009, 2015, 'A17DTR', 'FWD'),
    ('astra-j', '1.7-cdti-96kw','1.7 CDTi',    96, 130, 1686, 'diesel', 2010, 2015, 'A17DTS', 'FWD'),
    ('astra-j', '2.0-cdti-118kw','2.0 CDTi',  118, 160, 1956, 'diesel', 2009, 2015, 'A20DTH', 'FWD'),
    ('astra-j', '2.0-cdti-121kw','2.0 CDTi',  121, 165, 1956, 'diesel', 2009, 2015, 'A20DTH', 'FWD'),
    ('astra-j', '2.0-biturbo-143kw','2.0 BiTurbo CDTi',143,195,1956,'diesel',2012,2015,'A20DTR','FWD'),
    -- Astra K
    ('astra-k', '1.0-turbo-77kw','1.0 Turbo',  77, 105,  999, 'petrol', 2015, 2018, 'B10XFT', 'FWD'),
    ('astra-k', '1.4-turbo-92kw','1.4 Turbo',  92, 125, 1399, 'petrol', 2015, 2021, 'B14XFT', 'FWD'),
    ('astra-k', '1.4-turbo-110kw','1.4 Turbo',110,150, 1399, 'petrol', 2015, 2021, 'B14XFT', 'FWD'),
    ('astra-k', '1.6-sidi-147kw','1.6 SiDi Turbo',147,200,1598,'petrol',2015,2018,'B16SHT', 'FWD'),
    ('astra-k', '1.6-cdti-70kw','1.6 CDTi',    70,  95, 1598, 'diesel', 2015, 2021, 'B16DTL', 'FWD'),
    ('astra-k', '1.6-cdti-81kw','1.6 CDTi',    81, 110, 1598, 'diesel', 2015, 2021, 'B16DTH', 'FWD'),
    ('astra-k', '1.6-cdti-100kw','1.6 CDTi',  100, 136, 1598, 'diesel', 2015, 2018, 'B16DTH', 'FWD'),
    ('astra-k', '1.6-biturbo-118kw','1.6 BiTurbo CDTi',118,160,1598,'diesel',2015,2018,'B16DTR','FWD'),
    -- Corsa C
    ('corsa-c', '1.0-12v-43kw', '1.0 12V',     43,  58,  973, 'petrol', 2000, 2006, 'Z10XE',  'FWD'),
    ('corsa-c', '1.2-16v-55kw', '1.2 16V',     55,  75, 1199, 'petrol', 2000, 2006, 'Z12XE',  'FWD'),
    ('corsa-c', '1.4-16v-66kw', '1.4 16V',     66,  90, 1364, 'petrol', 2000, 2006, 'Z14XE',  'FWD'),
    ('corsa-c', '1.8-16v-92kw', '1.8 16V GSi', 92, 125, 1796, 'petrol', 2000, 2006, 'Z18XE',  'FWD'),
    ('corsa-c', '1.3-cdti-51kw','1.3 CDTi',    51,  70, 1248, 'diesel', 2003, 2006, 'Z13DT',  'FWD'),
    ('corsa-c', '1.7-dti-55kw', '1.7 DTi',     55,  75, 1686, 'diesel', 2000, 2003, 'Y17DTL', 'FWD'),
    ('corsa-c', '1.7-cdti-74kw','1.7 CDTi',    74, 100, 1686, 'diesel', 2003, 2006, 'Z17DTH', 'FWD'),
    -- Corsa D
    ('corsa-d', '1.0-12v-44kw', '1.0 12V',     44,  60,  998, 'petrol', 2006, 2014, 'Z10XEP', 'FWD'),
    ('corsa-d', '1.2-16v-59kw', '1.2 16V',     59,  80, 1229, 'petrol', 2006, 2014, 'Z12XEP', 'FWD'),
    ('corsa-d', '1.2-16v-63kw', '1.2 16V',     63,  85, 1229, 'petrol', 2010, 2014, 'A12XER', 'FWD'),
    ('corsa-d', '1.4-16v-66kw', '1.4 16V',     66,  90, 1364, 'petrol', 2006, 2014, 'Z14XEP', 'FWD'),
    ('corsa-d', '1.4-16v-74kw', '1.4 16V',     74, 100, 1398, 'petrol', 2010, 2014, 'A14XER', 'FWD'),
    ('corsa-d', '1.6-turbo-110kw','1.6 Turbo OPC',110,150,1598,'petrol',2007,2014,'Z16LER', 'FWD'),
    ('corsa-d', '1.6-turbo-141kw','1.6 Turbo OPC',141,192,1598,'petrol',2007,2014,'Z16LER', 'FWD'),
    ('corsa-d', '1.3-cdti-55kw','1.3 CDTi',    55,  75, 1248, 'diesel', 2006, 2014, 'Z13DTJ', 'FWD'),
    ('corsa-d', '1.3-cdti-66kw','1.3 CDTi',    66,  90, 1248, 'diesel', 2006, 2014, 'Z13DTH', 'FWD'),
    ('corsa-d', '1.3-cdti-70kw','1.3 CDTi',    70,  95, 1248, 'diesel', 2010, 2014, 'A13DTE', 'FWD'),
    ('corsa-d', '1.7-cdti-74kw','1.7 CDTi',    74, 100, 1686, 'diesel', 2006, 2010, 'Z17DTJ', 'FWD'),
    ('corsa-d', '1.7-cdti-92kw','1.7 CDTi',    92, 125, 1686, 'diesel', 2010, 2014, 'A17DTS', 'FWD'),
    -- Corsa E
    ('corsa-e', '1.0-sidi-66kw','1.0 SIDI Turbo',66,90,  999, 'petrol', 2014, 2019, 'B10XFL', 'FWD'),
    ('corsa-e', '1.0-sidi-85kw','1.0 SIDI Turbo',85,115, 999, 'petrol', 2014, 2019, 'B10XFT', 'FWD'),
    ('corsa-e', '1.2-51kw',     '1.2',         51,  70, 1229, 'petrol', 2014, 2019, 'A12XEL', 'FWD'),
    ('corsa-e', '1.4-66kw',     '1.4',         66,  90, 1398, 'petrol', 2014, 2019, 'B14XEL', 'FWD'),
    ('corsa-e', '1.4-turbo-110kw','1.4 Turbo',110,150,1364, 'petrol', 2014, 2018, 'B14NET', 'FWD'),
    ('corsa-e', 'opc-1.6-152kw','OPC 1.6 Turbo',152,207,1598,'petrol',2014,2018,  'B16LER', 'FWD'),
    ('corsa-e', '1.3-cdti-55kw','1.3 CDTi',    55,  75, 1248, 'diesel', 2014, 2019, 'B13DTC', 'FWD'),
    ('corsa-e', '1.3-cdti-70kw','1.3 CDTi',    70,  95, 1248, 'diesel', 2014, 2019, 'B13DTE', 'FWD'),
    -- Vectra B
    ('vectra-b', '1.6-16v-74kw','1.6 16V',     74, 100, 1598, 'petrol', 1995, 2002, 'X16XEL', 'FWD'),
    ('vectra-b', '1.8-16v-85kw','1.8 16V',     85, 115, 1796, 'petrol', 1995, 2002, 'X18XE',  'FWD'),
    ('vectra-b', '2.0-16v-100kw','2.0 16V',   100, 136, 1998, 'petrol', 1995, 2002, 'X20XEV', 'FWD'),
    ('vectra-b', '2.5-v6-125kw','2.5 V6',     125, 170, 2498, 'petrol', 1995, 2000, 'X25XE',  'FWD'),
    ('vectra-b', '2.6-v6-125kw','2.6 V6',     125, 170, 2597, 'petrol', 2000, 2002, 'Y26SE',  'FWD'),
    ('vectra-b', '1.7-td-60kw', '1.7 TD',      60,  82, 1686, 'diesel', 1995, 2000, 'X17DT',  'FWD'),
    ('vectra-b', '2.0-dti-60kw','2.0 DTi 16V', 60,  82, 1995, 'diesel', 1997, 2002, 'X20DTL', 'FWD'),
    ('vectra-b', '2.0-dti-74kw','2.0 DTi 16V', 74, 101, 1995, 'diesel', 1997, 2002, 'X20DTH', 'FWD'),
    ('vectra-b', '2.2-dti-92kw','2.2 DTi 16V', 92, 125, 2172, 'diesel', 2000, 2002, 'Y22DTR', 'FWD'),
    -- Vectra C
    ('vectra-c', '1.6-16v-74kw','1.6 16V',     74, 100, 1598, 'petrol', 2002, 2008, 'Z16XE',  'FWD'),
    ('vectra-c', '1.8-16v-90kw','1.8 16V',     90, 122, 1796, 'petrol', 2002, 2005, 'Z18XE',  'FWD'),
    ('vectra-c', '1.8-16v-103kw','1.8 16V',   103, 140, 1796, 'petrol', 2005, 2008, 'Z18XER', 'FWD'),
    ('vectra-c', '2.0-turbo-129kw','2.0 Turbo',129,175,1998,'petrol', 2003, 2008, 'Z20NET', 'FWD'),
    ('vectra-c', '2.2-direct-114kw','2.2 Direct',114,155,2198,'petrol',2003,2008,'Z22YH',  'FWD'),
    ('vectra-c', '2.8-v6-turbo-169kw','2.8 V6 Turbo OPC',169,230,2792,'petrol',2005,2008,'Z28NET','FWD'),
    ('vectra-c', '2.8-v6-turbo-191kw','2.8 V6 Turbo OPC',191,260,2792,'petrol',2005,2008,'Z28NEL','FWD'),
    ('vectra-c', '3.2-v6-155kw','3.2 V6',     155, 211, 3175, 'petrol', 2002, 2005, 'Z32SE',  'FWD'),
    ('vectra-c', '1.9-cdti-88kw','1.9 CDTi',   88, 120, 1910, 'diesel', 2004, 2008, 'Z19DT',  'FWD'),
    ('vectra-c', '1.9-cdti-110kw','1.9 CDTi 16V',110,150,1910,'diesel',2004, 2008, 'Z19DTH', 'FWD'),
    ('vectra-c', '3.0-v6-cdti-130kw','3.0 V6 CDTi',130,177,2958,'diesel',2003,2008,'Y30DT', 'FWD'),
    ('vectra-c', '3.0-v6-cdti-135kw','3.0 V6 CDTi',135,184,2958,'diesel',2005,2008,'Z30DT', 'FWD'),
    -- Insignia A
    ('insignia-a', '1.4-turbo-103kw','1.4 Turbo',103,140,1364,'petrol', 2008, 2017, 'A14NET', 'FWD'),
    ('insignia-a', '1.6-turbo-132kw','1.6 Turbo',132,180,1598,'petrol', 2008, 2017, 'A16LET', 'FWD'),
    ('insignia-a', '1.8-16v-103kw','1.8 16V',  103, 140, 1796, 'petrol', 2008, 2017, 'A18XER', 'FWD'),
    ('insignia-a', '2.0-turbo-162kw','2.0 Turbo',162,220,1998,'petrol', 2008, 2017, 'A20NHT', 'FWD'),
    ('insignia-a', '2.0-turbo-184kw','2.0 Turbo OPC',184,250,1998,'petrol',2008,2017,'A20NHT','AWD'),
    ('insignia-a', '2.8-v6-turbo-191kw','2.8 V6 Turbo OPC',191,260,2792,'petrol',2009,2014,'A28NET','AWD'),
    ('insignia-a', '2.8-v6-turbo-239kw','2.8 V6 Turbo OPC',239,325,2792,'petrol',2010,2014,'A28NER','AWD'),
    ('insignia-a', '2.0-cdti-81kw','2.0 CDTi', 81, 110, 1956, 'diesel', 2008, 2017, 'A20DTH', 'FWD'),
    ('insignia-a', '2.0-cdti-96kw','2.0 CDTi', 96, 131, 1956, 'diesel', 2008, 2017, 'A20DTH', 'FWD'),
    ('insignia-a', '2.0-cdti-118kw','2.0 CDTi',118,160,1956, 'diesel', 2008, 2017, 'A20DTH', 'FWD'),
    ('insignia-a', '2.0-cdti-143kw','2.0 BiTurbo CDTi',143,195,1956,'diesel',2012,2017,'A20DTR','FWD'),
    -- Insignia B
    ('insignia-b', '1.5-turbo-121kw','1.5 Turbo',121,165,1490,'petrol', 2017, 2022, 'D15SFT', 'FWD'),
    ('insignia-b', '1.5-turbo-147kw','1.5 Turbo',147,200,1490,'petrol', 2017, 2022, 'D15SFL', 'FWD'),
    ('insignia-b', '2.0-turbo-191kw','2.0 Turbo',191,260,1998,'petrol', 2017, 2022, 'A20NFT', 'AWD'),
    ('insignia-b', '1.6-cdti-81kw','1.6 CDTi', 81, 110, 1598, 'diesel', 2017, 2022, 'B16DTH', 'FWD'),
    ('insignia-b', '1.6-cdti-100kw','1.6 CDTi',100,136,1598, 'diesel', 2017, 2022, 'B16DTH', 'FWD'),
    ('insignia-b', '2.0-cdti-125kw','2.0 CDTi',125,170,1956, 'diesel', 2017, 2022, 'B20DTH', 'FWD'),
    ('insignia-b', '2.0-cdti-154kw','2.0 BiTurbo CDTi',154,210,1956,'diesel',2017,2022,'B20DTR','AWD'),
    -- Zafira A
    ('zafira-a', '1.6-16v-74kw','1.6 16V',     74, 100, 1598, 'petrol', 1999, 2005, 'Z16XE',  'FWD'),
    ('zafira-a', '1.8-16v-92kw','1.8 16V',     92, 125, 1796, 'petrol', 1999, 2005, 'Z18XE',  'FWD'),
    ('zafira-a', 'opc-2.0-147kw','OPC 2.0 Turbo',147,200,1998,'petrol', 2001, 2005, 'Z20LET', 'FWD'),
    ('zafira-a', '2.2-16v-108kw','2.2 16V',   108, 147, 2198, 'petrol', 2000, 2005, 'Z22SE',  'FWD'),
    ('zafira-a', '2.0-dti-60kw','2.0 DTi',     60,  82, 1995, 'diesel', 1999, 2005, 'X20DTL', 'FWD'),
    ('zafira-a', '2.0-dti-74kw','2.0 DTi',     74, 101, 1995, 'diesel', 1999, 2005, 'X20DTH', 'FWD'),
    ('zafira-a', '2.2-dti-92kw','2.2 DTi',     92, 125, 2172, 'diesel', 2002, 2005, 'Y22DTR', 'FWD'),
    -- Zafira B
    ('zafira-b', '1.6-85kw',    '1.6',         85, 115, 1598, 'petrol', 2005, 2014, 'Z16XER', 'FWD'),
    ('zafira-b', '1.8-103kw',   '1.8 16V',    103, 140, 1796, 'petrol', 2005, 2014, 'Z18XER', 'FWD'),
    ('zafira-b', 'opc-2.0-177kw','OPC 2.0 Turbo',177,240,1998,'petrol',2005,2014,  'Z20LER', 'FWD'),
    ('zafira-b', '2.2-110kw',   '2.2 16V',    110, 150, 2198, 'petrol', 2005, 2010, 'Z22YH',  'FWD'),
    ('zafira-b', '1.7-cdti-81kw','1.7 CDTi',   81, 110, 1686, 'diesel', 2008, 2014, 'A17DTJ', 'FWD'),
    ('zafira-b', '1.7-cdti-92kw','1.7 CDTi',   92, 125, 1686, 'diesel', 2008, 2014, 'A17DTR', 'FWD'),
    ('zafira-b', '1.9-cdti-74kw','1.9 CDTi',   74, 100, 1910, 'diesel', 2005, 2014, 'Z19DT',  'FWD'),
    ('zafira-b', '1.9-cdti-110kw','1.9 CDTi 16V',110,150,1910,'diesel',2005,2014,  'Z19DTH', 'FWD'),
    -- Meriva A
    ('meriva-a', '1.4-16v-66kw','1.4 16V',     66,  90, 1364, 'petrol', 2003, 2010, 'Z14XEP', 'FWD'),
    ('meriva-a', '1.6-16v-74kw','1.6 16V',     74, 100, 1598, 'petrol', 2003, 2010, 'Z16XEP', 'FWD'),
    ('meriva-a', '1.8-16v-92kw','1.8 16V',     92, 125, 1796, 'petrol', 2003, 2010, 'Z18XE',  'FWD'),
    ('meriva-a', '1.3-cdti-55kw','1.3 CDTi',   55,  75, 1248, 'diesel', 2005, 2010, 'Z13DTH', 'FWD'),
    ('meriva-a', '1.3-cdti-66kw','1.3 CDTi',   66,  90, 1248, 'diesel', 2005, 2010, 'Z13DTH', 'FWD'),
    ('meriva-a', '1.7-cdti-74kw','1.7 CDTi',   74, 100, 1686, 'diesel', 2003, 2010, 'Z17DTH', 'FWD'),
    ('meriva-a', '1.7-cdti-92kw','1.7 CDTi',   92, 125, 1686, 'diesel', 2007, 2010, 'A17DTR', 'FWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name, power_kw = excluded.power_kw, power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc, fuel = excluded.fuel,
    year_from = excluded.year_from, year_to = excluded.year_to,
    engine_code = excluded.engine_code, drive = excluded.drive, is_active = true;

-- ============================================================================
-- Link 5 universal products to ALL new engines (idempotent)
-- ============================================================================
insert into public.vehicle_part_link (vehicle_type_id, product_id)
select t.id, p.id
from public.vehicle_types t
cross join public.products p
where p.slug in (
    'castrol-edge-5w30-5l',
    'bosch-aerotwin-ar20u',
    'mann-cu-26-006-cabin-filter',
    'varta-blue-d24',
    'osram-h7-night-breaker'
)
on conflict (vehicle_type_id, product_id) do nothing;
