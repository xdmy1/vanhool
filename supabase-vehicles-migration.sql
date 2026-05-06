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
