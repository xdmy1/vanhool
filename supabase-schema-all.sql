-- ============================================================================
-- INTER BUS — FULL SCHEMA (ALL-IN-ONE)
-- ============================================================================
-- Conține în ordinea corectă:
--   1. Setup de bază (extensii, tables, triggers, RLS, seed categorii + demo)
--   2. Vehicule (vehicle_makes / models / types / part_link + view)
--   3. TecDoc (oem_codes, vehicle_compatibility, tecdoc_cache, images)
--   4. Odoo (cross-IDs, odoo_sync_log, helpers)
--   5. Coduri alternative & producători (manufacturers, cross_references,
--      product_vehicle_makes, search_codes + trigger normalize_code)
--
-- Idempotent. Sigur de rulat de mai multe ori. Niciun DROP TABLE / TRUNCATE.
-- Rulează în Supabase Dashboard → SQL Editor → New query → Paste → Run.
-- ============================================================================


-- ============================================================================
-- 1. SETUP DE BAZĂ
-- ============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- profiles --------------------------------------------------------------------
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    full_name text,
    phone text,
    is_admin boolean not null default false,
    language text default 'ro',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- categories ------------------------------------------------------------------
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name_en text,
    name_ro text,
    name_ru text,
    slug text unique,
    parent_id uuid references public.categories(id) on delete set null,
    sort_order int default 0,
    is_active boolean not null default true,
    created_at timestamptz default now()
);
create index if not exists categories_parent_id_idx on public.categories (parent_id);
create index if not exists categories_slug_idx on public.categories (slug);

-- products --------------------------------------------------------------------
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    part_code text,
    name_en text,
    name_ro text,
    name_ru text,
    description_en text,
    description_ro text,
    description_ru text,
    price numeric(10,2) not null default 0,
    stock_quantity int not null default 0,
    image_url text,
    sku text,
    brand text,
    weight numeric(10,3),
    width numeric(10,2),
    height numeric(10,2),
    warranty_months int default 12,
    category_id uuid references public.categories(id) on delete set null,
    is_active boolean not null default true,
    is_featured boolean not null default false,
    slug text unique,
    created_at timestamptz default now()
);
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_is_active_idx on public.products (is_active);
create index if not exists products_is_featured_idx on public.products (is_featured);
create index if not exists products_part_code_idx on public.products (part_code);
create index if not exists products_brand_idx on public.products (brand);

-- carts -----------------------------------------------------------------------
create table if not exists public.carts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    status text not null default 'active',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create index if not exists carts_user_id_idx on public.carts (user_id);

create table if not exists public.cart_items (
    id uuid primary key default gen_random_uuid(),
    cart_id uuid not null references public.carts(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    quantity int not null default 1 check (quantity > 0),
    unit_price numeric(10,2),
    total_price numeric(10,2),
    created_at timestamptz default now(),
    unique (cart_id, product_id)
);
create index if not exists cart_items_cart_id_idx on public.cart_items (cart_id);
create index if not exists cart_items_product_id_idx on public.cart_items (product_id);

-- promocodes ------------------------------------------------------------------
create table if not exists public.promocodes (
    id uuid primary key default gen_random_uuid(),
    code text unique not null,
    discount_type text not null default 'percentage' check (discount_type in ('percentage','fixed')),
    discount_value numeric(10,2) not null default 0,
    min_order_amount numeric(10,2),
    max_uses int,
    current_uses int not null default 0,
    is_active boolean not null default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create index if not exists promocodes_code_idx on public.promocodes (code);

-- orders ----------------------------------------------------------------------
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    customer_name text,
    customer_email text,
    customer_phone text,
    customer_address text,
    items jsonb not null default '[]'::jsonb,
    subtotal numeric(10,2) not null default 0,
    discount_amount numeric(10,2) not null default 0,
    shipping_cost numeric(10,2) not null default 0,
    total numeric(10,2) not null default 0,
    status text not null default 'pending'
        check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
    payment_method text check (payment_method in ('paynet','cash','transfer')),
    notes text,
    invoice_id text,
    invoice_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- payments --------------------------------------------------------------------
create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references public.orders(id) on delete cascade,
    amount numeric(10,2),
    currency text default 'EUR',
    method text,
    status text default 'pending',
    gateway_url text,
    gateway_reference text,
    created_at timestamptz default now()
);
create index if not exists payments_order_id_idx on public.payments (order_id);

-- contact_messages ------------------------------------------------------------
create table if not exists public.contact_messages (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    name text not null,
    email text not null,
    phone text,
    subject text,
    message text not null,
    topic text default 'general',
    status text not null default 'new'
        check (status in ('new','reading','replied','archived')),
    created_at timestamptz default now()
);
create index if not exists contact_messages_status_idx on public.contact_messages (status);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- ============================================================================
-- TRIGGERS — touch_updated_at + new-user profile
-- ============================================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Alias used by some older migrations
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
    before update on public.profiles
    for each row execute function public.touch_updated_at();

drop trigger if exists carts_touch on public.carts;
create trigger carts_touch
    before update on public.carts
    for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch
    before update on public.orders
    for each row execute function public.touch_updated_at();

drop trigger if exists promocodes_touch on public.promocodes;
create trigger promocodes_touch
    before update on public.promocodes
    for each row execute function public.touch_updated_at();

-- Auto-create profile on signup -----------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email, full_name, phone, language)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'phone', ''),
        coalesce(new.raw_user_meta_data->>'language', 'ro')
    )
    on conflict (id) do update
        set email = excluded.email,
            full_name = coalesce(excluded.full_name, profiles.full_name),
            phone = coalesce(excluded.phone, profiles.phone),
            language = coalesce(excluded.language, profiles.language);
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ============================================================================
-- RPCs — promo usage incrementer
-- ============================================================================

create or replace function public.increment_promo_usage(promo_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
    promo record;
    new_uses int;
begin
    select id, code, current_uses, max_uses, is_active
        into promo
        from public.promocodes
        where id = promo_id;
    if not found then return false; end if;
    new_uses := coalesce(promo.current_uses, 0) + 1;
    update public.promocodes
        set current_uses = new_uses,
            is_active = case
                when promo.max_uses is not null and new_uses >= promo.max_uses then false
                else is_active
            end,
            updated_at = now()
        where id = promo.id;
    return true;
end;
$$;

create or replace function public.increment_promo_usage_by_code(promo_code text)
returns boolean
language plpgsql
security definer
as $$
declare
    promo record;
    new_uses int;
begin
    select id, code, current_uses, max_uses, is_active
        into promo
        from public.promocodes
        where upper(code) = upper(promo_code);
    if not found then return false; end if;
    new_uses := coalesce(promo.current_uses, 0) + 1;
    update public.promocodes
        set current_uses = new_uses,
            is_active = case
                when promo.max_uses is not null and new_uses >= promo.max_uses then false
                else is_active
            end,
            updated_at = now()
        where id = promo.id;
    return true;
end;
$$;

grant execute on function public.increment_promo_usage(uuid) to authenticated, anon;
grant execute on function public.increment_promo_usage_by_code(text) to authenticated, anon;

-- ============================================================================
-- is_admin() — non-recursive RLS helper
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

grant execute on function public.is_admin() to authenticated, anon;

-- ============================================================================
-- ROW LEVEL SECURITY (core tables)
-- ============================================================================

alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
    for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
    for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
    for update using (auth.uid() = id);
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles
    for update using (public.is_admin());

alter table public.categories enable row level security;
drop policy if exists "categories_select_active" on public.categories;
create policy "categories_select_active" on public.categories
    for select using (is_active = true or public.is_admin());
drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
    for all using (public.is_admin());

alter table public.products enable row level security;
drop policy if exists "products_select_active" on public.products;
create policy "products_select_active" on public.products
    for select using (is_active = true or public.is_admin());
drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
    for all using (public.is_admin());

alter table public.carts enable row level security;
drop policy if exists "carts_select_own" on public.carts;
create policy "carts_select_own" on public.carts
    for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "carts_insert_own" on public.carts;
create policy "carts_insert_own" on public.carts
    for insert with check (auth.uid() = user_id);
drop policy if exists "carts_update_own" on public.carts;
create policy "carts_update_own" on public.carts
    for update using (auth.uid() = user_id);
drop policy if exists "carts_delete_own" on public.carts;
create policy "carts_delete_own" on public.carts
    for delete using (auth.uid() = user_id);

alter table public.cart_items enable row level security;
drop policy if exists "cart_items_select_via_cart" on public.cart_items;
create policy "cart_items_select_via_cart" on public.cart_items
    for select using (
        public.is_admin()
        or exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
    );
drop policy if exists "cart_items_insert_via_cart" on public.cart_items;
create policy "cart_items_insert_via_cart" on public.cart_items
    for insert with check (
        exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
    );
drop policy if exists "cart_items_update_via_cart" on public.cart_items;
create policy "cart_items_update_via_cart" on public.cart_items
    for update using (
        exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
    );
drop policy if exists "cart_items_delete_via_cart" on public.cart_items;
create policy "cart_items_delete_via_cart" on public.cart_items
    for delete using (
        exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
    );

alter table public.promocodes enable row level security;
drop policy if exists "promocodes_select_active" on public.promocodes;
create policy "promocodes_select_active" on public.promocodes
    for select using (is_active = true or public.is_admin());
drop policy if exists "promocodes_admin_all" on public.promocodes;
create policy "promocodes_admin_all" on public.promocodes
    for all using (public.is_admin());

alter table public.orders enable row level security;
drop policy if exists "orders_insert_self_or_guest" on public.orders;
create policy "orders_insert_self_or_guest" on public.orders
    for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
    for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin" on public.orders
    for update using (public.is_admin());
drop policy if exists "orders_delete_admin" on public.orders;
create policy "orders_delete_admin" on public.orders
    for delete using (public.is_admin());

alter table public.payments enable row level security;
drop policy if exists "payments_select_via_order" on public.payments;
create policy "payments_select_via_order" on public.payments
    for select using (
        public.is_admin()
        or exists (
            select 1 from public.orders o
            where o.id = payments.order_id and o.user_id = auth.uid()
        )
    );
drop policy if exists "payments_admin_all" on public.payments;
create policy "payments_admin_all" on public.payments
    for all using (public.is_admin());

alter table public.contact_messages enable row level security;
drop policy if exists "contact_insert_any" on public.contact_messages;
create policy "contact_insert_any" on public.contact_messages
    for insert with check (true);
drop policy if exists "contact_select_own_or_admin" on public.contact_messages;
create policy "contact_select_own_or_admin" on public.contact_messages
    for select using (
        (auth.uid() is not null and auth.uid() = user_id) or public.is_admin()
    );
drop policy if exists "contact_admin_all" on public.contact_messages;
create policy "contact_admin_all" on public.contact_messages
    for all using (public.is_admin());

-- ============================================================================
-- SEED — categorii (idempotent)
-- ============================================================================

insert into public.categories (slug, name_ro, name_en, name_ru, sort_order) values
    ('brakes',        'Frâne',                  'Brakes',                'Тормоза',              10),
    ('engine',        'Motor',                  'Engine',                'Двигатель',            20),
    ('chassis',       'Șasiu și suspensie',     'Chassis & suspension',  'Шасси и подвеска',     30),
    ('electro',       'Electro',                'Electro',               'Электро',              40),
    ('air-pressure',  'Aer comprimat',          'Air pressure',          'Пневмосистема',        50),
    ('body',          'Caroserie',              'Bodywork',              'Кузовщина',            60),
    ('clutch',        'Ambreiaj și cutie',      'Clutch & gearbox',      'Сцепление и КПП',      70),
    ('steering',      'Direcție și punți',      'Steering & axles',      'Рулевое и мосты',      80),
    ('cooling',       'Climă și încălzire',     'Climate & heating',     'Климат и отопление',   90),
    ('interior',      'Interior',               'Interior',              'Салон',               100),
    ('hoses',         'Furtune silicon',        'Silicone hoses',        'Силиконовые шланги',  110),
    ('couplings',     'Cuple pneumatice',       'Air couplings',         'Пневмосоединения',    120)
on conflict (slug) do update set
    name_ro    = excluded.name_ro,
    name_en    = excluded.name_en,
    name_ru    = excluded.name_ru,
    sort_order = excluded.sort_order,
    is_active  = true;

-- Sample promo codes (idempotent) --------------------------------------------
insert into public.promocodes (code, discount_type, discount_value, min_order_amount, max_uses, is_active) values
    ('WELCOME10',   'percentage', 10,  100, 500, true),
    ('FLEET50',     'fixed',      50,  500, 50,  true),
    ('FREESHIP',    'fixed',      25,  150, 1000, true)
on conflict (code) do update set
    discount_type    = excluded.discount_type,
    discount_value   = excluded.discount_value,
    min_order_amount = excluded.min_order_amount,
    max_uses         = excluded.max_uses,
    is_active        = excluded.is_active;


-- ============================================================================
-- 2. VEHICULE
-- ============================================================================

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

create table if not exists public.vehicle_part_link (
    vehicle_type_id uuid not null references public.vehicle_types(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    primary key (vehicle_type_id, product_id),
    created_at timestamptz not null default now()
);
create index if not exists idx_vehicle_part_link_product
    on public.vehicle_part_link(product_id);

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


-- ============================================================================
-- 3. TECDOC / APIFY
-- ============================================================================

alter table public.products
    add column if not exists tecdoc_id text,
    add column if not exists oem_codes text[] not null default '{}',
    add column if not exists vehicle_compatibility jsonb not null default '[]'::jsonb,
    add column if not exists tecdoc_synced_at timestamptz,
    add column if not exists images jsonb not null default '[]'::jsonb;

create index if not exists products_tecdoc_id_idx on public.products (tecdoc_id);
create index if not exists products_oem_codes_idx on public.products using gin (oem_codes);
create index if not exists products_vehicle_compat_idx on public.products using gin (vehicle_compatibility);

create table if not exists public.tecdoc_cache (
    id uuid primary key default gen_random_uuid(),
    cache_key text unique not null,
    query_type text not null check (query_type in ('part_code', 'oem', 'vehicle')),
    query_value text not null,
    country text,
    lang text,
    response jsonb not null default '[]'::jsonb,
    result_count int not null default 0,
    actor_id text,
    run_id text,
    compute_units numeric(10,4),
    fetched_at timestamptz not null default now(),
    expires_at timestamptz
);
create index if not exists tecdoc_cache_cache_key_idx on public.tecdoc_cache (cache_key);
create index if not exists tecdoc_cache_expires_at_idx on public.tecdoc_cache (expires_at);
create index if not exists tecdoc_cache_query_type_idx on public.tecdoc_cache (query_type, query_value);

alter table public.tecdoc_cache enable row level security;
drop policy if exists "tecdoc_cache_admin_all" on public.tecdoc_cache;
create policy "tecdoc_cache_admin_all" on public.tecdoc_cache
    for all using (public.is_admin());

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
-- 4. ODOO
-- ============================================================================

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

create table if not exists public.odoo_sync_log (
    id uuid primary key default gen_random_uuid(),
    direction text not null check (direction in ('pull', 'push', 'webhook')),
    operation text not null,
    entity_type text,
    entity_id text,
    odoo_model text,
    odoo_id integer,
    success boolean not null default false,
    detail jsonb,
    duration_ms integer,
    created_at timestamptz not null default now()
);
create index if not exists odoo_sync_log_created_at_idx
    on public.odoo_sync_log (created_at desc);
create index if not exists odoo_sync_log_operation_idx
    on public.odoo_sync_log (operation, success);

alter table public.odoo_sync_log enable row level security;
drop policy if exists "odoo_sync_log_admin_select" on public.odoo_sync_log;
create policy "odoo_sync_log_admin_select" on public.odoo_sync_log
    for select using (public.is_admin());
drop policy if exists "odoo_sync_log_admin_all" on public.odoo_sync_log;
create policy "odoo_sync_log_admin_all" on public.odoo_sync_log
    for all using (public.is_admin());

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
-- 5. PRODUCĂTORI + CODURI ALTERNATIVE + COMPATIBILITATE AUTOBUZE
-- ============================================================================

-- 5.1 manufacturers ---------------------------------------------------------
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

-- 5.2 Extensii products -----------------------------------------------------
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

-- 5.3 product_vehicle_makes (n:n piesă ↔ marcă autobuz) --------------------
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

-- 5.4 normalize_code() — uppercase + strip non-alphanumeric ----------------
create or replace function public.normalize_code(input text)
returns text
language sql
immutable
as $$
    select regexp_replace(upper(coalesce(input, '')), '[^A-Z0-9]', '', 'g');
$$;

grant execute on function public.normalize_code(text) to anon, authenticated;

-- 5.5 Trigger: rebuild products.search_codes -------------------------------
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

-- Backfill: rescriem coloana search_codes ca să declanșăm trigger-ul.
update public.products set search_codes = search_codes;


-- ============================================================================
-- 6. PROMOȚII (Task 8)
-- ============================================================================

alter table public.products
    add column if not exists is_promo boolean not null default false,
    add column if not exists promo_price numeric(10,2),
    add column if not exists promo_starts_at timestamptz,
    add column if not exists promo_ends_at timestamptz;

create index if not exists products_is_promo_idx
    on public.products (is_promo)
    where is_promo = true;

alter table public.products drop constraint if exists products_promo_price_chk;
alter table public.products
    add constraint products_promo_price_chk check (
        is_promo = false
        or (promo_price is not null and promo_price >= 0 and promo_price < price)
    );

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
-- 7. DISCOUNT PER CLIENT (Task 9)
-- ============================================================================

alter table public.profiles
    add column if not exists discount_percent numeric(5,2) not null default 0;

alter table public.profiles drop constraint if exists profiles_discount_chk;
alter table public.profiles
    add constraint profiles_discount_chk
        check (discount_percent >= 0 and discount_percent <= 100);

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
-- VERIFICĂRI
-- ============================================================================
--   select count(*) from public.products;
--   select count(*) from public.categories;       -- ≥ 12
--   select count(*) from public.manufacturers;
--   select column_name from information_schema.columns
--     where table_name = 'products'
--       and column_name in ('manufacturer_id','subcategory_id','cross_references',
--                           'search_codes','condition','storage_location','cost_price',
--                           'oem_codes','tecdoc_id','odoo_id','barcode');
--   select id, part_code, oem_codes, search_codes from public.products limit 5;
--
-- DUPĂ ÎNREGISTRARE — fă-te admin:
--   update public.profiles set is_admin = true where email = 'tu@example.com';
-- ============================================================================
-- ============================================================================
-- INTER BUS — Categories & subcategories seed (Task 3 — full taxonomy)
-- Conține 12 categorii root + ~72 subcategorii (cf. screenshots).
-- Idempotent: UPSERT pe slug. Sigur de rulat de mai multe ori.
-- ============================================================================

-- 1. Update root category names to match the canonical taxonomy ----------------
update public.categories set
    name_ro = 'Frâne',
    name_en = 'Brakes',
    name_ru = 'Тормоза',
    sort_order = 10,
    is_active = true
where slug = 'brakes';

update public.categories set
    name_ro = 'Presiune a aerului',
    name_en = 'Air pressure',
    name_ru = 'Пневмосистема',
    sort_order = 20,
    is_active = true
where slug = 'air-pressure';

update public.categories set
    name_ro = 'Șasiu și suspensie',
    name_en = 'Chassis & suspension',
    name_ru = 'Шасси и подвеска',
    sort_order = 30,
    is_active = true
where slug = 'chassis';

update public.categories set
    name_ro = 'Electro',
    name_en = 'Electro',
    name_ru = 'Электро',
    sort_order = 40,
    is_active = true
where slug = 'electro';

update public.categories set
    name_ro = 'Motor și asamblare',
    name_en = 'Engine & assembly',
    name_ru = 'Двигатель и сборка',
    sort_order = 50,
    is_active = true
where slug = 'engine';

update public.categories set
    name_ro = 'Ambreiaj și cutie de viteze',
    name_en = 'Clutch & gearbox',
    name_ru = 'Сцепление и КПП',
    sort_order = 60,
    is_active = true
where slug = 'clutch';

update public.categories set
    name_ro = 'Direcție și butucuri',
    name_en = 'Steering & hubs',
    name_ru = 'Рулевое и ступицы',
    sort_order = 70,
    is_active = true
where slug = 'steering';

update public.categories set
    name_ro = 'Caroserie',
    name_en = 'Bodywork',
    name_ru = 'Кузов',
    sort_order = 80,
    is_active = true
where slug = 'body';

update public.categories set
    name_ro = 'Aer condiționat și încălzire',
    name_en = 'Air conditioning & heating',
    name_ru = 'Кондиционер и отопление',
    sort_order = 90,
    is_active = true
where slug = 'cooling';

update public.categories set
    name_ro = 'Interior',
    name_en = 'Interior',
    name_ru = 'Салон',
    sort_order = 100,
    is_active = true
where slug = 'interior';

update public.categories set
    name_ro = 'Țevi din silicon',
    name_en = 'Silicone hoses',
    name_ru = 'Силиконовые шланги',
    sort_order = 110,
    is_active = true
where slug = 'hoses';

update public.categories set
    name_ro = 'Cuplaje pneumatice ABC Raufoss',
    name_en = 'Pneumatic couplings ABC Raufoss',
    name_ru = 'Пневмосоединения ABC Raufoss',
    sort_order = 120,
    is_active = true
where slug = 'couplings';

-- 2. Subcategories ------------------------------------------------------------
-- One big UPSERT joining a literal table of (parent_slug + sub) → resolves
-- parent_id, conflict on slug updates names + parent + sort.
with roots as (
    select id, slug from public.categories where parent_id is null
)
insert into public.categories (slug, name_ro, name_en, name_ru, parent_id, sort_order, is_active)
select v.slug, v.name_ro, v.name_en, v.name_ru, r.id, v.sort_order, true
from (values
    -- Frâne ----------------------------------------------------------------
    ('brakes-pads',           'Plăcuțe de frână',                'Brake pads',                'Тормозные колодки',                'brakes',       10),
    ('brakes-discs',          'Discuri de frână',                'Brake discs',               'Тормозные диски',                  'brakes',       20),
    ('brakes-cap',            'Capac de frână',                  'Brake caliper cap',         'Крышка суппорта',                  'brakes',       30),
    ('brakes-calipers',       'Capacități de frână și accesorii','Brake calipers & accessories','Тормозные суппорты и аксессуары','brakes',       40),
    ('brakes-wear-indicator', 'Indicatori de uzură',             'Wear indicators',           'Индикаторы износа',                'brakes',       50),
    ('brakes-trailer-cyl',    'Remorcare cilindri',              'Trailer cylinders',         'Цилиндры прицепа',                 'brakes',       60),
    ('brakes-drums',          'Tambure de frână',                'Brake drums',               'Тормозные барабаны',               'brakes',       70),
    ('brakes-shoes',          'Saboți de frână și accesorii',    'Brake shoes & accessories', 'Тормозные колодки барабанные и аксессуары','brakes',80),

    -- Presiune a aerului ---------------------------------------------------
    ('air-compressors',       'Compresoare și accesorii',        'Compressors & accessories', 'Компрессоры и аксессуары',         'air-pressure', 10),
    ('air-valves',            'Valve',                           'Valves',                    'Клапаны',                          'air-pressure', 20),
    ('air-couplings-line',    'Cuplaje de aer',                  'Air couplings',             'Пневмосоединения',                 'air-pressure', 30),
    ('air-treatment',         'Tratare a aerului',               'Air treatment',             'Подготовка воздуха',               'air-pressure', 40),
    ('air-abs-ebs',           'ABS-EBS',                         'ABS-EBS',                   'ABS-EBS',                          'air-pressure', 50),

    -- Șasiu și suspensie ---------------------------------------------------
    ('chassis-shocks',        'Amortizoare',                     'Shock absorbers',           'Амортизаторы',                     'chassis',      10),
    ('chassis-reaction-rod',  'Tijă de reacție',                 'Reaction rod',              'Реактивная штанга',                'chassis',      20),
    ('chassis-leaf-spring',   'Arc lamelar',                     'Leaf spring',               'Рессора',                          'chassis',      30),
    ('chassis-air-susp',      'Suspensie pneumatică',            'Air suspension',            'Пневмоподвеска',                   'chassis',      40),
    ('chassis-stab-triangle', 'Triunghiul de stabilizare',       'Stabilizer triangle',       'Стабилизатор треугольный',         'chassis',      50),
    ('chassis-stab-link',     'Conexiune - tijă de stabilizare', 'Stabilizer link rod',       'Тяга стабилизатора',               'chassis',      60),
    ('chassis-suspension',    'Suspensie',                       'Suspension',                'Подвеска',                         'chassis',      70),

    -- Electro --------------------------------------------------------------
    ('electro-alternators',   'Alternatoare',                    'Alternators',               'Генераторы',                       'electro',      10),
    ('electro-aperitive',     'Aperitive',                       'Aperitive',                 'Аперитив',                         'electro',      20),
    ('electro-batteries',     'Baterii',                         'Batteries',                 'Аккумуляторы',                     'electro',      30),
    ('electro-ext-lighting',  'Iluminat exterior',               'Exterior lighting',         'Внешнее освещение',                'electro',      40),
    ('electro-int-lighting',  'Iluminare interioară',            'Interior lighting',         'Внутреннее освещение',             'electro',      50),
    ('electro-accessories',   'Accesorii electrice',             'Electrical accessories',    'Электрические аксессуары',         'electro',      60),

    -- Motor și asamblare ---------------------------------------------------
    ('engine-cooling',        'Răcire',                          'Cooling',                   'Охлаждение',                       'engine',       10),
    ('engine-timing',         'Distribuție',                     'Timing',                    'Газораспределение',                'engine',       20),
    ('engine-filters',        'Filtre',                          'Filters',                   'Фильтры',                          'engine',       30),
    ('engine-turbo',          'Turbo & intercoolere',            'Turbo & intercoolers',      'Турбо и интеркулеры',              'engine',       40),
    ('engine-exhaust',        'Epuiza',                          'Exhaust',                   'Выхлопная система',                'engine',       50),
    ('engine-adblue',         'AdBlue',                          'AdBlue',                    'AdBlue',                           'engine',       60),
    ('engine-block',          'Motor',                           'Engine block',              'Двигатель',                        'engine',       70),
    ('engine-filters-man',    'Filtre MAN originale',            'Original MAN filters',      'Оригинальные фильтры MAN',         'engine',       80),

    -- Ambreiaj și cutie de viteze -----------------------------------------
    ('clutch-clutch',         'Ambreiaj',                        'Clutch',                    'Сцепление',                        'clutch',       10),
    ('clutch-control',        'Control ambreiaj',                'Clutch control',            'Управление сцеплением',            'clutch',       20),
    ('clutch-gearbox',        'Cutie de viteze',                 'Gearbox',                   'Коробка передач',                  'clutch',       30),
    ('clutch-transmission',   'Transmitere',                     'Transmission',              'Трансмиссия',                      'clutch',       40),

    -- Sistem de direcție și butucuri ax -----------------------------------
    ('steering-shocks',       'Amortizoare de direcție',         'Steering shock absorbers',  'Рулевые амортизаторы',             'steering',     10),
    ('steering-knuckle',      'Fuzetă',                          'Steering knuckle',          'Поворотный кулак',                 'steering',     20),
    ('steering-rods',         'Tije de direcție',                'Steering rods',             'Рулевые тяги',                     'steering',     30),
    ('steering-track-rods',   'Tije de șenilă',                  'Track rods',                'Поперечные тяги',                  'steering',     40),
    ('steering-hubs',         'Mutui și accesorii',              'Hubs & accessories',        'Ступицы и аксессуары',             'steering',     50),
    ('steering-housings',     'Carcase de direcție',             'Steering housings',         'Корпусы рулевого механизма',       'steering',     60),

    -- Caroserie -----------------------------------------------------------
    ('body-mirrors',          'Oglinzi',                         'Mirrors',                   'Зеркала',                          'body',         10),
    ('body-wipers',           'Ștergătoare de parbriz',          'Windshield wipers',         'Стеклоочистители',                 'body',         20),
    ('body-bumper',           'Bară de protecție și panouri laterale','Bumper & side panels','Бампер и боковые панели',           'body',         30),
    ('body-sheet',            'Tablă metalică',                  'Sheet metal',               'Металлические панели',             'body',         40),
    ('body-windows',          'Ferestre',                        'Windows',                   'Окна',                             'body',         50),
    ('body-roof-hatch',       'Trape de acoperiș',               'Roof hatches',              'Крышные люки',                     'body',         60),
    ('body-wheels',           'Jante și roți',                   'Wheels & rims',             'Диски и колёса',                   'body',         70),

    -- Aer condiționat și încălzire ----------------------------------------
    ('cooling-ac',            'Aer condiționat',                 'Air conditioning',          'Кондиционер',                      'cooling',      10),
    ('cooling-heating',       'Încălzire',                       'Heating',                   'Отопление',                        'cooling',      20),

    -- Interior ------------------------------------------------------------
    ('interior-belts',        'Centuri de siguranță',            'Safety belts',              'Ремни безопасности',               'interior',     10),
    ('interior-seats',        'Scaune',                          'Seats',                     'Сиденья',                          'interior',     20),
    ('interior-sanitary',     'Instalații sanitare',             'Sanitary fittings',         'Санитарные приборы',               'interior',     30),

    -- Țevi din silicon ----------------------------------------------------
    ('hoses-straight',        'Țeavă dreaptă din silicon',       'Straight silicone hose',    'Прямой силиконовый шланг',         'hoses',        10),
    ('hoses-90',              'Țeavă de silicon 90°',            'Silicone hose 90°',         'Силиконовый шланг 90°',            'hoses',        20),
    ('hoses-135',             'Țeavă de silicon 135°',           'Silicone hose 135°',        'Силиконовый шланг 135°',           'hoses',        30),
    ('hoses-sleeve',          'Manșon de țeavă din silicon',     'Silicone hose sleeve',      'Силиконовый рукав',                'hoses',        40),
    ('hoses-special',         'Țevi din silicon cu formă specială','Silicone hose special shape','Силиконовый шланг особой формы','hoses',        50),
    ('hoses-reducer-straight','Țeavă din silicon reducție dreaptă','Straight reducer silicone hose','Прямой переходник силикон', 'hoses',        60),
    ('hoses-reducer-curved',  'Țeavă de silicon cu reducție curbată','Curved reducer silicone hose','Изогнутый переходник силикон','hoses',     70),
    ('hoses-clamp-band',      'Bandă de clemare',                'Clamping band',             'Хомутная лента',                   'hoses',        80),

    -- Cuplaje pneumatice ABC Raufoss --------------------------------------
    ('couplings-push-new',    'Împingeți linie nouă',            'New line push-in',          'Push-in для новой линии',          'couplings',    10),
    ('couplings-wireless',    'Împingere fără fir',              'Wireless push-in',          'Беспроводной push-in',             'couplings',    20),
    ('couplings-shot',        'Cuplare shot',                    'Shot coupling',             'Соединение shot',                  'couplings',    30),
    ('couplings-pivot',       'Pivotare',                        'Pivot',                     'Поворотный',                       'couplings',    40),
    ('couplings-rotolock',    'Rotolock',                        'Rotolock',                  'Rotolock',                         'couplings',    50),
    ('couplings-push-90',     'Împingeți la 90° ABC',            '90° push-in ABC',           'Push-in 90° ABC',                  'couplings',    60),
    ('couplings-converter',   'Convertor',                       'Converter',                 'Преобразователь',                  'couplings',    70),
    ('couplings-45',          'Cuplaj la 45°',                   '45° coupling',              'Соединение 45°',                   'couplings',    80)
) as v(slug, name_ro, name_en, name_ru, parent_slug, sort_order)
join roots r on r.slug = v.parent_slug
on conflict (slug) do update set
    name_ro    = excluded.name_ro,
    name_en    = excluded.name_en,
    name_ru    = excluded.name_ru,
    parent_id  = excluded.parent_id,
    sort_order = excluded.sort_order,
    is_active  = true;

-- 3. Cleanup: dezactivează orice rădăcină non-canonică ----------------------
update public.categories
   set is_active = false
 where parent_id is null
   and slug not in (
       'brakes','air-pressure','chassis','electro','engine','clutch',
       'steering','body','cooling','interior','hoses','couplings'
   );

-- ============================================================================
-- Verify:
--   select c.slug, c.name_ro, p.slug as parent
--     from public.categories c
--     left join public.categories p on p.id = c.parent_id
--    order by p.sort_order nulls first, c.sort_order;
--
--   select count(*) from public.categories where parent_id is null and is_active = true;     -- 12
--   select count(*) from public.categories where parent_id is not null and is_active = true; -- ~72
-- ============================================================================
-- ============================================================================
-- INTER BUS — Category banners
-- Adaugă coloana image_url pe categorii + setează banner-ele pentru cele 12
-- rădăcini canonice. Idempotent.
-- ============================================================================

alter table public.categories
    add column if not exists image_url text;

update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002317_remmen_290.jpeg'                    where slug = 'brakes';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002342_luchtdruk_290.png'                  where slug = 'air-pressure';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002325_chassis-ophanging_290.jpeg'         where slug = 'chassis';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002320_electro_290.jpeg'                   where slug = 'electro';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002321_motor-aanbouw_290.jpeg'             where slug = 'engine';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002322_koppeling-versnellingsbak_290.jpeg' where slug = 'clutch';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002323_stuurinrichting-asnaven_290.jpeg'   where slug = 'steering';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002324_carrosserie_290.jpeg'               where slug = 'body';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002326_airco-verwarming_290.jpeg'          where slug = 'cooling';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0013827_silicone-leiding_290.jpeg'          where slug = 'hoses';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0014966_abc-raufoss-luchtkoppelingen_290.png' where slug = 'couplings';
update public.categories set image_url = 'https://shop.mits-automotive.be/images/thumbs/0002327_interieur_290.jpeg'                 where slug = 'interior';

-- ============================================================================
-- Verify:
--   select slug, name_ro, image_url from public.categories
--    where parent_id is null and is_active = true
--    order by sort_order;
-- ============================================================================
-- ============================================================================
-- INTER BUS — Bus makes seed (vehicle_makes)
-- 24 mărci/modele de autobuze folosite în formularul "Mărci compatibile" la
-- piesa de schimb. Conține și brand-ul gol (ex. "MAN") + variantele model
-- ("MAN Lion's City") ca să poți marca compatibilitatea fie la nivel general,
-- fie la nivel de model specific.
--
-- Idempotent: UPSERT pe slug. Sigur de rulat de mai multe ori.
-- ============================================================================

insert into public.vehicle_makes (slug, name, sort_order, is_active, is_popular)
values
    -- IVECO ---------------------------------------------------------------
    ('iveco-crossway',         'Iveco Crossway',          110, true, false),
    ('iveco-daily',            'Iveco Daily',             111, true, false),

    -- MAN -----------------------------------------------------------------
    ('man',                    'MAN',                     200, true, true),
    ('man-lions-city',         'MAN Lion''s City',        210, true, false),
    ('man-lions-coach',        'MAN Lion''s Coach',       211, true, false),
    ('man-lions-regio',        'MAN Lion''s Regio',       212, true, false),
    ('man-lions-intercity',    'MAN Lion''s Intercity',   213, true, false),

    -- Mercedes-Benz -------------------------------------------------------
    ('mercedes-benz',          'Mercedes-Benz',           300, true, true),
    ('mercedes-benz-citaro',   'Mercedes-Benz Citaro',    310, true, false),
    ('mercedes-benz-integro',  'Mercedes-Benz Integro',   311, true, false),
    ('mercedes-benz-tourismo', 'Mercedes-Benz Tourismo',  312, true, false),
    ('mercedes-benz-vario',    'Mercedes-Benz Vario',     313, true, false),

    -- Temsa ---------------------------------------------------------------
    ('temsa-md9',              'Temsa MD9',               400, true, false),

    -- Van Hool ------------------------------------------------------------
    ('van-hool',               'Van Hool',                500, true, true),
    ('van-hool-a360h',         'Van Hool A360H',          510, true, false),
    ('van-hool-newa360',       'Van Hool NEWA360',        511, true, false),
    ('van-hool-a330',          'Van Hool A330',           512, true, false),
    ('van-hool-newag300',      'Van Hool NEWAG300',       513, true, false),
    ('van-hool-t9',            'Van Hool T9',             514, true, false),
    ('van-hool-tx',            'Van Hool TX',             515, true, false),
    ('van-hool-ex',            'Van Hool EX',             516, true, false),

    -- VDL -----------------------------------------------------------------
    ('vdl',                    'VDL',                     600, true, true),
    ('vdl-citea',              'VDL Citea',               610, true, false),
    ('vdl-futura',             'VDL Futura',              611, true, false)
on conflict (slug) do update set
    name       = excluded.name,
    sort_order = excluded.sort_order,
    is_active  = excluded.is_active,
    is_popular = excluded.is_popular;

-- ============================================================================
-- Verify:
--   select slug, name, sort_order, is_popular from public.vehicle_makes
--    where slug in ('man','mercedes-benz','iveco-crossway','van-hool','vdl')
--       or name ilike '%lion%' or name ilike '%vdl%' or name ilike '%van hool%'
--    order by sort_order;
--
--   select count(*) from public.vehicle_makes where is_active = true;
-- ============================================================================
-- ============================================================================
-- INTER BUS — One-shot migration: EUR values → MDL (lei)
-- ============================================================================
-- Multiplică toate valorile monetare cu 20 (1 EUR ≈ 20 MDL).
-- Acoperă: products (price, cost_price, promo_price), orders (subtotal,
-- discount_amount, shipping_cost, total), promocodes (discount_value pentru
-- tipul fixed, min_order_amount), payments (amount, currency).
--
-- IDEMPOTENT prin tabel `app_settings` — flag-ul `currency_migrated_to_mdl`
-- previne dublarea conversiei dacă rulezi scriptul de mai multe ori.
--
-- IMPORTANT — citește înainte de a rula:
--   • dacă produsele tale conțin DEJA valori în lei (introduse manual
--     după switch), NU rula scriptul: le va înmulți cu 20.
--   • dacă produsele conțin valori în EUR (date legacy / demo), rulează
--     scriptul O SINGURĂ DATĂ. Flag-ul te protejează la rulări ulterioare.
--   • după rulare, verifică câteva rânduri în /admin/products să confirmi.
-- ============================================================================

-- 1. Tabel pentru flag-uri / metadata aplicație ------------------------------
create table if not exists public.app_settings (
    key text primary key,
    value text,
    updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "app_settings_admin_read" on public.app_settings;
create policy "app_settings_admin_read" on public.app_settings
    for select using (public.is_admin());

drop policy if exists "app_settings_admin_all" on public.app_settings;
create policy "app_settings_admin_all" on public.app_settings
    for all using (public.is_admin()) with check (public.is_admin());

-- 2. Conversia propriu-zisă, ghidată de flag -------------------------------
do $$
declare
    already_migrated boolean;
begin
    select exists (
        select 1 from public.app_settings where key = 'currency_migrated_to_mdl'
    ) into already_migrated;

    if already_migrated then
        raise notice 'Conversia EUR → MDL a fost deja aplicată. Skip.';
        return;
    end if;

    -- Products: preț listă, preț cost, preț promo
    update public.products set price = round(price::numeric * 20, 2);
    update public.products set cost_price = round(cost_price::numeric * 20, 2)
        where cost_price is not null;
    update public.products set promo_price = round(promo_price::numeric * 20, 2)
        where promo_price is not null;

    -- Orders: toate valorile monetare
    update public.orders set
        subtotal        = round(subtotal::numeric * 20, 2),
        discount_amount = round(discount_amount::numeric * 20, 2),
        shipping_cost   = round(shipping_cost::numeric * 20, 2),
        total           = round(total::numeric * 20, 2);

    -- Promocodes: doar reducerile FIXE și pragul minim de comandă
    update public.promocodes set discount_value = round(discount_value::numeric * 20, 2)
        where discount_type = 'fixed';
    update public.promocodes set min_order_amount = round(min_order_amount::numeric * 20, 2)
        where min_order_amount is not null;

    -- Payments: suma + monedă
    update public.payments set amount = round(amount::numeric * 20, 2)
        where amount is not null;
    update public.payments set currency = 'MDL'
        where currency = 'EUR' or currency is null;

    -- Marchează conversia ca finalizată
    insert into public.app_settings (key, value, updated_at)
        values ('currency_migrated_to_mdl', now()::text, now())
        on conflict (key) do update set value = excluded.value, updated_at = now();

    raise notice 'Conversie EUR → MDL aplicată. Toate valorile monetare × 20.';
end $$;

-- 3. Default-ul pentru tranzacții noi ----------------------------------------
alter table public.payments alter column currency set default 'MDL';

-- ============================================================================
-- Verify (rulează aceste interogări după ce ai aplicat scriptul):
--   select id, part_code, price, cost_price, promo_price from public.products
--    order by created_at desc limit 5;
--
--   select code, discount_type, discount_value, min_order_amount from public.promocodes;
--
--   select key, value, updated_at from public.app_settings
--    where key = 'currency_migrated_to_mdl';
-- ============================================================================

-- ============================================================================
-- DACĂ AI RULAT GREȘIT (de ex. ai aplicat conversia, apoi ai re-introdus
-- prețuri în lei și ai rulat din nou) — anulează flag-ul și împarte la 20:
--
--   delete from public.app_settings where key = 'currency_migrated_to_mdl';
--   update public.products set price = round(price / 20, 2);
--   update public.products set cost_price = round(cost_price / 20, 2)
--     where cost_price is not null;
--   -- etc. pentru celelalte tabele
-- ============================================================================
