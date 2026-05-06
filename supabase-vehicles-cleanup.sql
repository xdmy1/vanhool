-- =============================================================================
-- CLEANUP — purge models without active engines, deactivate empty makes
--
-- Run this AFTER all seeds + enrichment. Rerunnable.
-- =============================================================================

-- 1. Counts BEFORE (for audit) ---------------------------------------------
select 'BEFORE' as stage,
       (select count(*) from public.vehicle_models)  as total_models,
       (select count(*) from public.vehicle_types)   as total_types,
       (select count(*) from public.vehicle_models
        where id not in (
            select distinct model_id from public.vehicle_types
            where is_active = true and model_id is not null
        )) as models_without_engines,
       (select count(*) from public.vehicle_makes where is_active = true) as active_makes;

-- 2. Delete models that have no active vehicle_types ------------------------
-- CASCADE handles related rows (vehicle_types are 0 for these, vehicle_part_link
-- inherits via vehicle_types). Hand-crafted models all have types, so they survive.
delete from public.vehicle_models
where id not in (
    select distinct model_id from public.vehicle_types
    where is_active = true and model_id is not null
);

-- 3. Deactivate makes that no longer have any active models -----------------
-- (Don't delete the make rows — keeps them recoverable for future imports.)
update public.vehicle_makes
set is_active = false
where id not in (
    select distinct make_id from public.vehicle_models
    where is_active = true and make_id is not null
);

-- 4. Counts AFTER -----------------------------------------------------------
select 'AFTER'  as stage,
       (select count(*) from public.vehicle_models)  as total_models,
       (select count(*) from public.vehicle_types)   as total_types,
       (select count(*) from public.vehicle_makes where is_active = true) as active_makes,
       (select count(*) from public.vehicle_makes where is_active = false) as inactive_makes;

-- 5. Per-brand model counts (for sanity check) ------------------------------
select mk.slug         as make_slug,
       mk.is_active    as make_active,
       count(vm.id)    as models,
       (select count(*) from public.vehicle_types vt
        join public.vehicle_models vm2 on vm2.id = vt.model_id
        where vm2.make_id = mk.id and vt.is_active = true) as engines
from public.vehicle_makes mk
left join public.vehicle_models vm on vm.make_id = mk.id and vm.is_active = true
group by mk.id, mk.slug, mk.is_active
order by models desc, mk.slug;
