-- ============================================================================
-- INTER BUS — Supabase setup
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Idempotent: safe to run multiple times. CREATE…IF NOT EXISTS / DROP POLICY IF EXISTS.
-- ============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

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

-- carts (server-side persistence for logged-in users) -------------------------
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
-- TRIGGERS — updated_at maintenance + new-user profile auto-create
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
-- RPC — promo usage incrementer (used by orders/actions.ts)
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

    if not found then
        return false;
    end if;

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

    if not found then
        return false;
    end if;

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
-- is_admin() — non-recursive helper used by every admin policy.
-- SECURITY DEFINER so it reads profiles bypassing RLS, avoiding self-recursion.
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
-- ROW LEVEL SECURITY
-- ============================================================================

-- profiles --------------------------------------------------------------------
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

-- categories ------------------------------------------------------------------
alter table public.categories enable row level security;

drop policy if exists "categories_select_active" on public.categories;
create policy "categories_select_active" on public.categories
    for select using (is_active = true or public.is_admin());

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
    for all using (public.is_admin());

-- products --------------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "products_select_active" on public.products;
create policy "products_select_active" on public.products
    for select using (is_active = true or public.is_admin());

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
    for all using (public.is_admin());

-- carts -----------------------------------------------------------------------
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

-- cart_items ------------------------------------------------------------------
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

-- promocodes ------------------------------------------------------------------
alter table public.promocodes enable row level security;

drop policy if exists "promocodes_select_active" on public.promocodes;
create policy "promocodes_select_active" on public.promocodes
    for select using (is_active = true or public.is_admin());

drop policy if exists "promocodes_admin_all" on public.promocodes;
create policy "promocodes_admin_all" on public.promocodes
    for all using (public.is_admin());

-- orders ----------------------------------------------------------------------
alter table public.orders enable row level security;

-- Anyone (anon or authenticated) can place an order. The server action attaches
-- user_id when authenticated; guests insert with user_id = null.
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

-- payments --------------------------------------------------------------------
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

-- contact_messages ------------------------------------------------------------
alter table public.contact_messages enable row level security;

-- Anyone can submit a contact message
drop policy if exists "contact_insert_any" on public.contact_messages;
create policy "contact_insert_any" on public.contact_messages
    for insert with check (true);

drop policy if exists "contact_select_own_or_admin" on public.contact_messages;
create policy "contact_select_own_or_admin" on public.contact_messages
    for select using (
        (auth.uid() is not null and auth.uid() = user_id)
        or public.is_admin()
    );

drop policy if exists "contact_admin_all" on public.contact_messages;
create policy "contact_admin_all" on public.contact_messages
    for all using (public.is_admin());

-- ============================================================================
-- SEED DATA — categories + a few sample products + sample promo codes
-- (UPSERT semantics so the script stays idempotent.)
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

-- A handful of demo products tied to those categories. Replace/extend through admin panel.
with cat as (
    select id, slug from public.categories
)
insert into public.products (slug, part_code, brand, name_ro, name_en, name_ru,
    description_ro, description_en, description_ru,
    price, stock_quantity, category_id, is_featured, is_active, warranty_months)
select * from (values
    ('plg-front-brake-pads', '0986494296',   'BOSCH',
        'Plăcuțe frână față',         'Front brake pads',         'Тормозные колодки передние',
        'Set plăcuțe frână față pentru autobuze MAN/Setra. Garnitură ceramic-metalică.',
        'Front brake pads set for MAN/Setra coaches. Ceramic-metallic lining.',
        'Передние тормозные колодки для автобусов MAN/Setra. Керамо-металлическая накладка.',
        62.50, 24, (select id from cat where slug = 'brakes'), true, true, 12),
    ('flt-air-mann-c25860', 'C25860/2',      'MANN-FILTER',
        'Filtru aer MANN C25860/2',   'Air filter MANN C25860/2', 'Воздушный фильтр MANN C25860/2',
        'Filtru aer pentru autobuze cu motor D2066/D2876. Înlocuire la fiecare 60.000 km.',
        'Air filter for D2066/D2876 engines. Replace every 60,000 km.',
        'Воздушный фильтр для двигателей D2066/D2876. Замена каждые 60 000 км.',
        38.90, 40, (select id from cat where slug = 'engine'), true, true, 12),
    ('shk-shock-absorber-rear', '23-470831', 'BILSTEIN',
        'Amortizor spate B4',         'Rear shock absorber B4',   'Амортизатор задний B4',
        'Amortizor hidraulic spate, gama OE pentru autobuze interurbane.',
        'Rear hydraulic shock absorber, OE-grade for intercity coaches.',
        'Задний гидравлический амортизатор, OE-уровень для междугородних автобусов.',
        145.00, 12, (select id from cat where slug = 'chassis'), false, true, 24),
    ('alt-alternator-28v-110a', '0124655009', 'BOSCH',
        'Alternator 28V 110A',        'Alternator 28V 110A',      'Генератор 28В 110А',
        'Alternator pentru sisteme 24V/28V. Test bench-verified.',
        'Alternator for 24V/28V systems. Bench-tested.',
        'Генератор для систем 24В/28В. Проверен на стенде.',
        420.00, 6, (select id from cat where slug = 'electro'), true, true, 24),
    ('vlv-air-relay-valve', '9730110030',    'WABCO',
        'Supapă releu aer',           'Air relay valve',          'Релейный пневмоклапан',
        'Supapă releu pentru sistemul de frânare pneumatic. Original WABCO.',
        'Relay valve for pneumatic brake system. Genuine WABCO.',
        'Релейный клапан тормозной пневмосистемы. Оригинал WABCO.',
        85.00, 18, (select id from cat where slug = 'air-pressure'), false, true, 12),
    ('mir-side-mirror-heated', 'A9408100319', 'MERCEDES',
        'Oglindă laterală încălzită', 'Side mirror, heated',      'Боковое зеркало с подогревом',
        'Oglindă laterală cu încălzire pentru autobuze Setra/Mercedes Travego.',
        'Heated side mirror for Setra/Mercedes Travego coaches.',
        'Боковое зеркало с подогревом для автобусов Setra/Mercedes Travego.',
        310.00, 4, (select id from cat where slug = 'body'), false, true, 12),
    ('clt-clutch-kit-430', '3400700468',     'SACHS',
        'Kit ambreiaj 430mm',         'Clutch kit 430mm',         'Комплект сцепления 430мм',
        'Kit ambreiaj complet (disc, presiune, rulment) pentru cutii ZF.',
        'Complete clutch kit (disc, pressure plate, bearing) for ZF gearboxes.',
        'Комплект сцепления (диск, корзина, выжимной) для коробок ZF.',
        720.00, 3, (select id from cat where slug = 'clutch'), true, true, 24),
    ('tie-rod-end-steering', '81953010198',  'LEMFORDER',
        'Cap de bară direcție',       'Tie rod end',              'Наконечник рулевой тяги',
        'Cap bară direcție pentru autobuze MAN Lion''s Coach.',
        'Tie rod end for MAN Lion''s Coach.',
        'Наконечник рулевой тяги для MAN Lion''s Coach.',
        92.00, 14, (select id from cat where slug = 'steering'), false, true, 12),
    ('rad-radiator-cooling', '81061016474',  'NISSENS',
        'Radiator răcire motor',      'Engine cooling radiator',  'Радиатор охлаждения двигателя',
        'Radiator răcire pentru autobuze MAN cu motor D2066.',
        'Cooling radiator for MAN D2066-powered coaches.',
        'Радиатор охлаждения для автобусов MAN с двигателем D2066.',
        680.00, 2, (select id from cat where slug = 'cooling'), false, true, 24),
    ('seat-belt-3pt', 'IB-SB-3PT',           'INTER BUS',
        'Centură siguranță 3 puncte', '3-point seat belt',        'Ремень безопасности 3-точечный',
        'Centură 3 puncte pentru locurile pasagerilor.',
        '3-point seat belt for passenger seats.',
        '3-точечный ремень для пассажирских сидений.',
        45.00, 60, (select id from cat where slug = 'interior'), false, true, 24),
    ('hose-silicon-90deg', 'IB-H-9090',      'INTER BUS',
        'Furtun silicon 90° Ø90mm',   'Silicone hose 90° Ø90mm',  'Силиконовый шланг 90° Ø90мм',
        'Furtun silicon armat, 90°, diametru 90mm.',
        'Reinforced silicone hose, 90°, 90mm diameter.',
        'Армированный силиконовый шланг, 90°, диаметр 90мм.',
        29.50, 80, (select id from cat where slug = 'hoses'), false, true, 12),
    ('cpl-air-coupling-m22', '4630370010',   'WABCO',
        'Cuplă pneumatică M22',       'Air coupling M22',         'Пневмосоединение M22',
        'Cuplă pneumatică M22, etanșare cu O-ring.',
        'M22 air coupling with O-ring sealing.',
        'Пневмосоединение M22, уплотнение O-ring.',
        18.00, 120, (select id from cat where slug = 'couplings'), false, true, 12)
) as v(slug, part_code, brand, name_ro, name_en, name_ru,
       description_ro, description_en, description_ru,
       price, stock_quantity, category_id, is_featured, is_active, warranty_months)
on conflict (slug) do update set
    part_code      = excluded.part_code,
    brand          = excluded.brand,
    name_ro        = excluded.name_ro,
    name_en        = excluded.name_en,
    name_ru        = excluded.name_ru,
    description_ro = excluded.description_ro,
    description_en = excluded.description_en,
    description_ru = excluded.description_ru,
    price          = excluded.price,
    stock_quantity = excluded.stock_quantity,
    category_id    = excluded.category_id,
    is_featured    = excluded.is_featured,
    warranty_months= excluded.warranty_months;

-- Sample promo codes -----------------------------------------------------------
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
-- HOW TO MAKE A USER ADMIN (run after the user signs up)
-- ----------------------------------------------------------------------------
--   update public.profiles set is_admin = true where email = 'you@example.com';
-- ============================================================================

-- Done. Verify with:
--   select count(*) from public.products;       -- should match seed count
--   select count(*) from public.categories;     -- 12
--   select code, current_uses, max_uses from public.promocodes;
