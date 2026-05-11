-- Add "Mercedes-Benz Sprinter" as a top-level vehicle make so it shows up in
-- the brand selector, same pattern as Citaro / Integro / Tourismo / Vario.
-- Run in Supabase SQL Editor.

insert into public.vehicle_makes (slug, name, sort_order, is_active, is_popular)
values ('mercedes-benz-sprinter', 'Mercedes-Benz Sprinter', 305, true, true)
on conflict (slug) do update set
    name = excluded.name,
    is_active = true,
    is_popular = true;

-- Sanity check — should return one row:
select id, slug, name, sort_order, is_active, is_popular
from public.vehicle_makes
where slug = 'mercedes-benz-sprinter';
