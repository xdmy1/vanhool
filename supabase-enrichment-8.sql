-- Enrichment chunk 8/8
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-155'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-155'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-die',
       '2.0 L Diesel',
       null,
       null,
       2000,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-155'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-die',
       '2.5 L Diesel',
       null,
       null,
       2500,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-155'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-500a → Alfa_Romeo_500A (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1945), year_to = coalesce(year_to, 1948)
where slug = 'alfa-romeo-500a'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-150a → Alfa_Romeo_150A (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1957), year_to = coalesce(year_to, 1958)
where slug = 'alfa-romeo-150a'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-80a → Alfa_Romeo_80A (0 engines)

-- alfa-romeo/alfa-romeo-issima → Alfa_Romeo_Issima (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), body_type = coalesce(body_type, 'roadster')
where slug = 'alfa-romeo-issima'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-9l',
       '5.9 L',
       null,
       null,
       5900,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-issima'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-430a → Alfa_Romeo_430A (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1949), year_to = coalesce(year_to, 1953)
where slug = 'alfa-romeo-430a'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-iguana → Alfa_Romeo_Iguana (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1969)
where slug = 'alfa-romeo-iguana'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1995,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-iguana'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-6l',
       '2.6 L',
       null,
       null,
       2593,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-iguana'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-40a → Alfa_Romeo_40A (0 engines)

-- alfa-romeo/alfa-romeo-rl → Alfa_Romeo_RL (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1922)
where slug = 'alfa-romeo-rl'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-9l',
       '2.9 L',
       null,
       null,
       2900,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-rl'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-sz → Alfa_Romeo_SZ (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), year_to = coalesce(year_to, 1991)
where slug = 'alfa-romeo-sz'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       2959,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-sz'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-gta → Alfa_Romeo_GTA (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), year_to = coalesce(year_to, 1969)
where slug = 'alfa-romeo-gta'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-2600 → Alfa_Romeo_2600 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1962), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-2600'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-6l',
       '2.6 L',
       null,
       null,
       2600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-2600'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-vola → Alfa_Romeo_Vola (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), body_type = coalesce(body_type, 'roadster')
where slug = 'alfa-romeo-vola'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       3000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-vola'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-sportut → Alfa_Romeo_Sportut (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997), body_type = coalesce(body_type, 'suv')
where slug = 'alfa-romeo-sportut'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-sportut'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-twin-spark-engine → Alfa_Romeo_Twin_Spark_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 2009)
where slug = 'alfa-romeo-twin-spark-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-2uettottanta → Alfa_Romeo_2uettottanta (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'roadster')
where slug = 'alfa-romeo-2uettottanta'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1750,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-2uettottanta'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-matta → Alfa_Romeo_Matta (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1952)
where slug = 'alfa-romeo-matta'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-pet',
       '1.9 L',
       null,
       null,
       1900,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-matta'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-164 → Alfa_Romeo_164 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1987), year_to = coalesce(year_to, 1998), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-164'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-164'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       3000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-164'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-die',
       '2.5 L Diesel',
       null,
       null,
       2500,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-164'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-75 → Alfa_Romeo_75 (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1985), year_to = coalesce(year_to, 1992), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-75'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-75'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-75'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-75'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-75'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       3000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-75'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-75'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-2000-sportiva → Alfa_Romeo_2000_Sportiva (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1954), body_type = coalesce(body_type, 'roadster')
where slug = 'alfa-romeo-2000-sportiva'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-2000-sportiva'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-332 → Alfa_Romeo_33.2 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1967)
where slug = 'alfa-romeo-332'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-332'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-166 → Alfa_Romeo_166 (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2007), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-166'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-166'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-166'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       3000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-166'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l',
       '3.2 L',
       null,
       null,
       3200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-166'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-die',
       '2.4 L Diesel',
       null,
       null,
       2400,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-166'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-8c → Alfa_Romeo_8C (0 engines)

-- alfa-romeo/alfa-romeo-1750 → Alfa_Romeo_1750_Berlina (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-1750'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-1750'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-1750'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-navajo → Alfa_Romeo_Navajo (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1976), body_type = coalesce(body_type, 'coupe')
where slug = 'alfa-romeo-navajo'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-navajo'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-gt → Alfa_Romeo_GT (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003)
where slug = 'alfa-romeo-gt'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-gt'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-gt'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l',
       '3.2 L',
       null,
       null,
       3200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-gt'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-die',
       '1.9 L Diesel',
       null,
       null,
       1900,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-gt'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-gran-sport-quattroruote → Alfa_Romeo_Gran_Sport_Quattroruote (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), year_to = coalesce(year_to, 1967), body_type = coalesce(body_type, 'roadster')
where slug = 'alfa-romeo-gran-sport-quattroruote'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-gran-sport-quattroruote'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-rm → Alfa_Romeo_RM (0 engines)

-- alfa-romeo/alfa-romeo-alfa-6 → Alfa_Romeo_Alfa_6 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1979), year_to = coalesce(year_to, 1986), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-alfa-6'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-alfa-6'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-alfa-6'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-die-hr588',
       '2.5 L HR588 Diesel',
       null,
       null,
       2500,
       'diesel',
       null,
       null,
       'HR588'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-alfa-6'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-visconti → Alfa_Romeo_Visconti (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-visconti'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l',
       '3.2 L',
       null,
       null,
       3195,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-visconti'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-12c → Alfa_Romeo_12C (0 engines)

-- alfa-romeo/alfa-romeo-scarabeo → Alfa_Romeo_Scarabeo (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966)
where slug = 'alfa-romeo-scarabeo'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1570,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-scarabeo'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-145 → Alfa_Romeo_145_and_146 (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), year_to = coalesce(year_to, 2000), body_type = coalesce(body_type, 'hatchback')
where slug = 'alfa-romeo-145'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l',
       '1.4 L',
       null,
       null,
       1400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-145'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-145'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l',
       '1.7 L',
       null,
       null,
       1700,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-145'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-145'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-145'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-die',
       '1.9 L Diesel',
       null,
       null,
       1900,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-145'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-alfasud → Alfa_Romeo_Alfasud (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1971), year_to = coalesce(year_to, 1983), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-alfasud'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       186,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-alfasud'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-stelvio → Alfa_Romeo_Stelvio (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), body_type = coalesce(body_type, 'suv')
where slug = 'alfa-romeo-stelvio'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-stelvio'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-90 → Alfa_Romeo_90 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1984), year_to = coalesce(year_to, 1987), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-90'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-90'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-90'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-90'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-die',
       '2.4 L Diesel',
       null,
       null,
       2400,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-90'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/ssz-stradale → SSZ_Stradale (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1984), year_to = coalesce(year_to, 1999), body_type = coalesce(body_type, 'coupe')
where slug = 'ssz-stradale'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-sprint → Alfa_Romeo_Sprint (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1976), year_to = coalesce(year_to, 1989)
where slug = 'alfa-romeo-sprint'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l',
       '1.2 L',
       null,
       null,
       1200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-sprint'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-156 → Alfa_Romeo_156 (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2007), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-156'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-156'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-156'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-156'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-156'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l',
       '3.2 L',
       null,
       null,
       3200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-156'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-die',
       '1.9 L Diesel',
       null,
       null,
       1900,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-156'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-die',
       '2.4 L Diesel',
       null,
       null,
       2400,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-156'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-gtv-and-spider → Alfa_Romeo_GTV_and_Spider (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1993), year_to = coalesce(year_to, 2004)
where slug = 'alfa-romeo-gtv-and-spider'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-gtv-and-spider'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-gtv-and-spider'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       3000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-gtv-and-spider'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-4060-hp → ALFA_40/60_HP (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1913), body_type = coalesce(body_type, 'roadster')
where slug = 'alfa-4060-hp'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l',
       '0.1 L',
       null,
       null,
       82,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-4060-hp'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-mille → Alfa_Romeo_Mille_(bus) (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1959), year_to = coalesce(year_to, 1964)
where slug = 'alfa-romeo-mille'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-die',
       '1.1 L Diesel',
       null,
       null,
       1050,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-mille'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-dardo → Alfa_Romeo_Dardo (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), body_type = coalesce(body_type, 'roadster')
where slug = 'alfa-romeo-dardo'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-dardo'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-6c → Alfa_Romeo_6C (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1927), year_to = coalesce(year_to, 1954)
where slug = 'alfa-romeo-6c'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-alfetta → Alfa_Romeo_Alfetta (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1972), year_to = coalesce(year_to, 1987), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-alfetta'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-50 → Alfa_Romeo_50 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1931), year_to = coalesce(year_to, 1934)
where slug = 'alfa-romeo-50'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l-die',
       '0.6 L Diesel',
       null,
       null,
       600,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-50'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-nuvola → Alfa_Romeo_Nuvola (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996)
where slug = 'alfa-romeo-nuvola'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-pet',
       '2.5 L',
       null,
       null,
       2500,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-nuvola'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-caimano → Alfa_Romeo_Caimano (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1971), body_type = coalesce(body_type, 'coupe')
where slug = 'alfa-romeo-caimano'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-3l',
       '0.3 L',
       null,
       null,
       286,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-caimano'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-24-hp → ALFA_24_HP (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1910), year_to = coalesce(year_to, 1914)
where slug = 'alfa-24-hp'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-1l',
       '4.1 L',
       null,
       null,
       4100,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-24-hp'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-scarabeo-ii → Alfa_Romeo_Scarabeo_II (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1973)
where slug = 'alfa-romeo-scarabeo-ii'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1962,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-scarabeo-ii'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-canguro → Alfa_Romeo_Canguro (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1964), body_type = coalesce(body_type, 'coupe')
where slug = 'alfa-romeo-canguro'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-canguro'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-8c-competizione → Alfa_Romeo_8C_Competizione (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), year_to = coalesce(year_to, 2009), body_type = coalesce(body_type, 'roadster')
where slug = 'alfa-romeo-8c-competizione'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-7l-f136',
       '4.7 L F136',
       null,
       null,
       4691,
       null,
       null,
       null,
       'F136'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-8c-competizione'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-33 → Alfa_Romeo_33 (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1983), year_to = coalesce(year_to, 1995), body_type = coalesce(body_type, 'hatchback')
where slug = 'alfa-romeo-33'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l',
       '1.2 L',
       null,
       null,
       1200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-33'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l',
       '1.4 L',
       null,
       null,
       1400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-33'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-33'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l',
       '1.7 L',
       null,
       null,
       1700,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-33'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-ele',
       '1.8 L ELECTRIC',
       null,
       null,
       1800,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-33'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-flat-4-engine → Alfa_Romeo_Boxer_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1971)
where slug = 'alfa-romeo-flat-4-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-2000 → Alfa_Romeo_2000 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1958), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-2000'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-2000'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-12-hp → ALFA_12_HP (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1910), year_to = coalesce(year_to, 1911)
where slug = 'alfa-12-hp'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-12-hp'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-proteo → Alfa_Romeo_Proteo (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1990), year_to = coalesce(year_to, 1991), body_type = coalesce(body_type, 'convertible')
where slug = 'alfa-romeo-proteo'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       3000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-proteo'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-romeo → Alfa_Romeo_Romeo (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1954), year_to = coalesce(year_to, 1983), body_type = coalesce(body_type, 'pickup')
where slug = 'alfa-romeo-romeo'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-twin-cam-engine → Alfa_Romeo_Twin_Cam_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1954)
where slug = 'alfa-romeo-twin-cam-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-diva → Alfa_Romeo_Diva (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), body_type = coalesce(body_type, 'coupe')
where slug = 'alfa-romeo-diva'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       179,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-diva'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-disco-volante-1952 → Alfa_Romeo_Disco_Volante (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1952), year_to = coalesce(year_to, 1953), body_type = coalesce(body_type, 'roadster')
where slug = 'alfa-romeo-disco-volante-1952'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       997,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-disco-volante-1952'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       495,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-disco-volante-1952'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-500 → Alfa_Romeo_500 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1937), year_to = coalesce(year_to, 1945)
where slug = 'alfa-romeo-500'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-1l-die',
       '6.1 L Diesel',
       null,
       null,
       6100,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-500'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-tonale → Alfa_Romeo_Tonale (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2022), body_type = coalesce(body_type, 'suv')
where slug = 'alfa-romeo-tonale'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-tonale'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-tonale'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1300,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-tonale'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-tonale'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-pandion → Alfa_Romeo_Pandion (1 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'coupe')
where slug = 'alfa-romeo-pandion'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-7l-f136',
       '4.7 L F136',
       null,
       null,
       4691,
       null,
       null,
       null,
       'F136'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-pandion'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-indy-v8-engine → Alfa_Romeo_Indy_V8_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), year_to = coalesce(year_to, 1991)
where slug = 'alfa-romeo-indy-v8-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-tipo-a → Alfa_Romeo_Tipo_A (0 engines)

-- alfa-romeo/alfa-15-hp → ALFA_15_HP (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1911), year_to = coalesce(year_to, 1913)
where slug = 'alfa-15-hp'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-15-hp'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-4060-gp → ALFA_Grand_Prix (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1920), year_to = coalesce(year_to, 1921)
where slug = 'alfa-4060-gp'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-5l',
       '4.5 L',
       null,
       null,
       4490,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-4060-gp'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-12-cylinders → Alfa_Romeo_12-cylinder_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1973), year_to = coalesce(year_to, 1982)
where slug = 'alfa-romeo-12-cylinders'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-p1 → Alfa_Romeo_P1 (0 engines)

-- alfa-romeo/alfa-romeo-8-cylinder-f1-engine → Alfa_Romeo_8-cylinder_F1_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1950)
where slug = 'alfa-romeo-8-cylinder-f1-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-kamal → Alfa_Romeo_Kamal (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), body_type = coalesce(body_type, 'suv')
where slug = 'alfa-romeo-kamal'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-arna → Alfa_Romeo_Arna (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1983), year_to = coalesce(year_to, 1987), body_type = coalesce(body_type, 'hatchback')
where slug = 'alfa-romeo-arna'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l',
       '1.2 L',
       null,
       null,
       1200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-arna'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-brera → Alfa_Romeo_Brera_and_Spider (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005), year_to = coalesce(year_to, 2010)
where slug = 'alfa-romeo-brera'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1750,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-brera'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l',
       '2.2 L',
       null,
       null,
       2200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-brera'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l',
       '3.2 L',
       null,
       null,
       3200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-brera'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-die',
       '2.0 L Diesel',
       null,
       null,
       2000,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-brera'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-die',
       '2.4 L Diesel',
       null,
       null,
       2400,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-brera'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-giulietta-sprint-speciale → Alfa_Romeo_Giulietta_Sprint_Speciale (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1959)
where slug = 'alfa-romeo-giulietta-sprint-speciale'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1300,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-giulietta-sprint-speciale'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-15-20-hp → ALFA_15/20_HP (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1914), year_to = coalesce(year_to, 1920)
where slug = 'alfa-15-20-hp'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-15-20-hp'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-g1 → Alfa_Romeo_G1 (0 engines)

-- alfa-romeo/alfa-romeo-scighera → Alfa_Romeo_Scighera (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997)
where slug = 'alfa-romeo-scighera'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       2959,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-scighera'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-spider → Alfa_Romeo_Spider (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966), year_to = coalesce(year_to, 1993), body_type = coalesce(body_type, 'roadster')
where slug = 'alfa-romeo-spider'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-giulia → Alfa_Romeo_Giulia (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1962), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-giulia'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1300,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-giulia'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-new-york-taxi → Alfa_Romeo_New_York_Taxi (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1976), body_type = coalesce(body_type, 'mpv')
where slug = 'alfa-romeo-new-york-taxi'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-carabo → Alfa_Romeo_Carabo (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968), body_type = coalesce(body_type, 'coupe')
where slug = 'alfa-romeo-carabo'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1995,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-carabo'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-mito → Alfa_Romeo_MiTo (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), year_to = coalesce(year_to, 2020), body_type = coalesce(body_type, 'hatchback')
where slug = 'alfa-romeo-mito'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l-pet',
       '0.9 L',
       null,
       null,
       900,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-mito'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-pet',
       '1.4 L',
       null,
       null,
       1400,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-mito'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1300,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-mito'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-mito'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-1900 → Alfa_Romeo_1900 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1950), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-1900'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l',
       '1.9 L',
       null,
       null,
       1900,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-1900'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-1900'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-giulietta-type-750101 → Alfa_Romeo_Giulietta_(1954) (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1954), year_to = coalesce(year_to, 1965), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-giulietta-type-750101'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-pet',
       '1.3 L',
       null,
       null,
       1300,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-giulietta-type-750101'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-430 → Alfa_Romeo_430 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1942), year_to = coalesce(year_to, 1950)
where slug = 'alfa-romeo-430'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-die',
       '0.8 L Diesel',
       null,
       null,
       816,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-430'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-450 → Alfa_Romeo_450 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1947), year_to = coalesce(year_to, 1959)
where slug = 'alfa-romeo-450'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-33-stradale-1969 → Alfa_Romeo_33_Stradale (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1967)
where slug = 'alfa-romeo-33-stradale-1969'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-33-stradale-1969'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-110a → Alfa_Romeo_110A (0 engines)

-- alfa-romeo/alfa-romeo-v1035 → Alfa_Romeo_Tipo_1035 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1987), year_to = coalesce(year_to, 1988)
where slug = 'alfa-romeo-v1035'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-montreal → Alfa_Romeo_Montreal (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970)
where slug = 'alfa-romeo-montreal'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-6l',
       '2.6 L',
       null,
       null,
       2600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-montreal'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-delfino → Alfa_Romeo_Delfino (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1983)
where slug = 'alfa-romeo-delfino'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-pet',
       '2.5 L',
       null,
       null,
       2492,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-delfino'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-tipo-33 → Alfa_Romeo_Tipo_33 (0 engines)

-- alfa-romeo/alfa-romeo-eagle → Alfa_Romeo_Eagle (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975)
where slug = 'alfa-romeo-eagle'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1779,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-eagle'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-140a → Alfa_Romeo_140A (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1950), year_to = coalesce(year_to, 1958)
where slug = 'alfa-romeo-140a'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       517,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-140a'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-2030-hp → ALFA_20/30_HP (0 engines)

-- alfa-romeo/alfa-romeo-902a → Alfa_Romeo_902A (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1957), year_to = coalesce(year_to, 1959)
where slug = 'alfa-romeo-902a'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '9-5l',
       '9.5 L',
       null,
       null,
       9495,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-902a'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-mille-af → Alfa_Romeo_Mille_AF (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1959), year_to = coalesce(year_to, 1964)
where slug = 'alfa-romeo-mille-af'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-die',
       '1.1 L Diesel',
       null,
       null,
       1050,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-mille-af'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-900a → Alfa_Romeo_900A (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1952), year_to = coalesce(year_to, 1956)
where slug = 'alfa-romeo-900a'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '9-5l',
       '9.5 L',
       null,
       null,
       9495,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-900a'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-690t-engine → Alfa_Romeo_690T_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2015)
where slug = 'alfa-romeo-690t-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-85 → Alfa_Romeo_85 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1934), year_to = coalesce(year_to, 1939)
where slug = 'alfa-romeo-85'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l-die',
       '0.6 L Diesel',
       null,
       null,
       560,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-85'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l-pet',
       '0.5 L',
       null,
       null,
       517,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-85'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-350 → Alfa_Romeo_350 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1935), year_to = coalesce(year_to, 1937)
where slug = 'alfa-romeo-350'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-1l-die',
       '6.1 L Diesel',
       null,
       null,
       6100,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-350'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-800 → Alfa_Romeo_800 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1940), year_to = coalesce(year_to, 1947)
where slug = 'alfa-romeo-800'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-die',
       '0.7 L Diesel',
       null,
       null,
       725,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-800'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-a15 → Alfa_Romeo_A15 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1967), year_to = coalesce(year_to, 1974)
where slug = 'alfa-romeo-a15'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-tipo-103 → Alfa_Romeo_Tipo_103 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1960), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-tipo-103'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l',
       '0.9 L',
       null,
       null,
       896,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-tipo-103'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-giulia-gt → Alfa_Romeo_105/115_Series_Coupés (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963), year_to = coalesce(year_to, 1977), body_type = coalesce(body_type, 'convertible')
where slug = 'alfa-romeo-giulia-gt'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-giulia-gt'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-bella → Alfa_Romeo_Bella (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999)
where slug = 'alfa-romeo-bella'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-giulia-tz → Alfa_Romeo_Giulia_TZ (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963)
where slug = 'alfa-romeo-giulia-tz'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-giulia-tz'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-169 → Alfa_Romeo_169 (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2007), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-169'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-169'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-169'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       3000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-169'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l',
       '3.2 L',
       null,
       null,
       3200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-169'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-die',
       '2.4 L Diesel',
       null,
       null,
       2400,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-169'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-4c → Alfa_Romeo_4C (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), year_to = coalesce(year_to, 2019), body_type = coalesce(body_type, 'roadster')
where slug = 'alfa-romeo-4c'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1750,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-4c'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-epsilon → Lancia_Epsilon (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1911), year_to = coalesce(year_to, 1912)
where slug = 'lancia-epsilon'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l-pet',
       '0.1 L',
       null,
       null,
       80,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-epsilon'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-megagamma → Lancia_Megagamma (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1978), body_type = coalesce(body_type, 'mpv')
where slug = 'lancia-megagamma'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2484,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-megagamma'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-jota → Lancia_Jota (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1915), year_to = coalesce(year_to, 1935)
where slug = 'lancia-jota'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l-pet',
       '0.9 L',
       null,
       null,
       940,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-jota'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-kappa → Lancia_Kappa (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-kappa'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-kappa'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-kappa'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       3000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-kappa'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-die',
       '2.4 L Diesel',
       null,
       null,
       2400,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-kappa'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-delta → Lancia_Delta (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1979), year_to = coalesce(year_to, 1999), body_type = coalesce(body_type, 'hatchback')
where slug = 'lancia-delta'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-esatau → Lancia_Esatau (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1947), year_to = coalesce(year_to, 1973)
where slug = 'lancia-esatau'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '8-2l-die',
       '8.2 L Diesel',
       null,
       null,
       8245,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-esatau'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '8-9l-die',
       '8.9 L Diesel',
       null,
       null,
       8867,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-esatau'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-eptajota → Lancia_Eptajota (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1915), year_to = coalesce(year_to, 1935)
where slug = 'lancia-eptajota'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l-pet',
       '0.9 L',
       null,
       null,
       940,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-eptajota'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-dedra → Lancia_Dedra (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-dedra'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-dedra'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-dedra'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-dedra'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l',
       '1.9 L',
       null,
       null,
       1900,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-dedra'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-stratos → Lancia_Stratos (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1973), year_to = coalesce(year_to, 1978)
where slug = 'lancia-stratos'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2418,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-stratos'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-musa → Lancia_Musa (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), year_to = coalesce(year_to, 2012), body_type = coalesce(body_type, 'mpv')
where slug = 'lancia-musa'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-2000 → Lancia_2000 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1971), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-2000'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1991,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-2000'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-jolly → Lancia_Jolly (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1959), year_to = coalesce(year_to, 1963)
where slug = 'lancia-jolly'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-gamma → Lancia_Gamma (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1976), year_to = coalesce(year_to, 1984), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-gamma'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-gamma'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-gamma'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-flat-4-engine → Lancia_Flat-4_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1960), year_to = coalesce(year_to, 1984)
where slug = 'lancia-flat-4-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-y → Lancia_Y (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995)
where slug = 'lancia-y'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-augusta → Lancia_Augusta (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1933), year_to = coalesce(year_to, 1936), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-augusta'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       196,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-augusta'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-thesis → Lancia_Thesis (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), year_to = coalesce(year_to, 2009), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-thesis'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-thesis'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-thesis'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       3000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-thesis'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l',
       '3.2 L',
       null,
       null,
       3200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-thesis'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-die',
       '2.4 L Diesel',
       null,
       null,
       2400,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-thesis'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-montecarlo → Lancia_Montecarlo (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975), year_to = coalesce(year_to, 1978)
where slug = 'lancia-montecarlo'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-montecarlo'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-trevi → Lancia_Trevi (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1980), year_to = coalesce(year_to, 1984), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-trevi'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-pet',
       '1.6 L',
       null,
       null,
       1600,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-trevi'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-pet',
       '2.0 L',
       null,
       null,
       2000,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-trevi'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-fulvia → Lancia_Fulvia (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-fulvia'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l',
       '0.1 L',
       null,
       null,
       91,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-fulvia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       199,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-fulvia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       216,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-fulvia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       231,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-fulvia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-3l',
       '0.3 L',
       null,
       null,
       298,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-fulvia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l',
       '0.6 L',
       null,
       null,
       584,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-fulvia'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-dialfa → Lancia_Dialfa (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1908), body_type = coalesce(body_type, 'convertible')
where slug = 'lancia-dialfa'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-8l-29kw',
       '3.8 L 29kW',
       29,
       40,
       3815,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-dialfa'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-prisma → Lancia_Prisma (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1982), year_to = coalesce(year_to, 1989), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-prisma'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1300,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-prisma'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-thema → Lancia_Thema (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1984), year_to = coalesce(year_to, 1994)
where slug = 'lancia-thema'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-zeta → Lancia_Zeta_(1912) (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1912), year_to = coalesce(year_to, 1914)
where slug = 'lancia-zeta'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l',
       '0.6 L',
       null,
       null,
       620,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-zeta'
on conflict (model_id, slug) do nothing;

-- lancia/fiat-twin-cam-engine → Fiat_Twin_Cam_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966)
where slug = 'fiat-twin-cam-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-beta → Lancia_Beta (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1972), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-beta'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1300,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-beta'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-eta-3050hp → Lancia_Eta (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1911), year_to = coalesce(year_to, 1914)
where slug = 'lancia-eta-3050hp'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-1l',
       '4.1 L',
       null,
       null,
       4084,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-eta-3050hp'
on conflict (model_id, slug) do nothing;

-- lancia/alfa-romeo-twin-spark-engine → Alfa_Romeo_Twin_Spark_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 2009)
where slug = 'alfa-romeo-twin-spark-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-dilambda → Lancia_Dilambda (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1928), year_to = coalesce(year_to, 1935), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-dilambda'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-74kw',
       '4.0 L 74kW',
       74,
       100,
       3958,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-dilambda'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-trikappa → Lancia_Trikappa (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1922), year_to = coalesce(year_to, 1925)
where slug = 'lancia-trikappa'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l',
       '0.6 L',
       null,
       null,
       594,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-trikappa'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-artena → Lancia_Artena (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1931), year_to = coalesce(year_to, 1936), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-artena'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l-pet',
       '0.9 L',
       null,
       null,
       924,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-artena'
on conflict (model_id, slug) do nothing;

-- lancia/autobianchi-y10 → Autobianchi_Y10 (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1985), year_to = coalesce(year_to, 1996), body_type = coalesce(body_type, 'hatchback')
where slug = 'autobianchi-y10'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       999,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'autobianchi-y10'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       1049,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'autobianchi-y10'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1108,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'autobianchi-y10'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1297,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'autobianchi-y10'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1301,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'autobianchi-y10'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-super-jolly → Lancia_Superjolly (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963), year_to = coalesce(year_to, 1970)
where slug = 'lancia-super-jolly'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1488,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-super-jolly'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-pura-hpe → Lancia_Pu+Ra_HPE (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023), body_type = coalesce(body_type, 'coupe')
where slug = 'lancia-pura-hpe'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-alfa-12hp → Lancia_Alfa (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1908), body_type = coalesce(body_type, 'coupe')
where slug = 'lancia-alfa-12hp'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-21kw',
       '2.5 L 21kW',
       21,
       28,
       2544,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-alfa-12hp'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-037 → Lancia_Rally_037 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1982), year_to = coalesce(year_to, 1984)
where slug = 'lancia-037'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1995,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-037'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-delta-s4 → Lancia_Delta_S4 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1985), year_to = coalesce(year_to, 1986)
where slug = 'lancia-delta-s4'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-pet',
       '1.8 L',
       null,
       null,
       1800,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-delta-s4'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-appia → Lancia_Appia (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1953), year_to = coalesce(year_to, 1963), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-appia'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-pet',
       '1.1 L',
       null,
       null,
       1100,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-appia'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-astura → Lancia_Astura (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1931), year_to = coalesce(year_to, 1939)
where slug = 'lancia-astura'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-6l',
       '2.6 L',
       null,
       null,
       2606,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-astura'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l',
       '3.0 L',
       null,
       null,
       2973,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-astura'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-beta-1520hp → Lancia_Beta_(1909) (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1909)
where slug = 'lancia-beta-1520hp'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '25kw',
       '25kW',
       25,
       34,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-beta-1520hp'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-delta-2030hp → Lancia_Delta_(1911) (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1911)
where slug = 'lancia-delta-2030hp'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l-pet',
       '0.1 L',
       null,
       null,
       80,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-delta-2030hp'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-dikappa → Lancia_Dikappa (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1921), year_to = coalesce(year_to, 1922)
where slug = 'lancia-dikappa'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l',
       '0.9 L',
       null,
       null,
       940,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-dikappa'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-ardea → Lancia_Ardea (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1939), year_to = coalesce(year_to, 1953), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-ardea'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l',
       '0.9 L',
       null,
       null,
       903,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-ardea'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '19kw',
       '19kW',
       19,
       26,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-ardea'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-aurelia → Lancia_Aurelia (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1950), year_to = coalesce(year_to, 1958), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-aurelia'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-b10',
       '1.8 L B10',
       null,
       null,
       1800,
       null,
       null,
       null,
       'B10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-aurelia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-b15',
       '2.0 L B15',
       null,
       null,
       2000,
       null,
       null,
       null,
       'B15'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-aurelia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-b12',
       '2.3 L B12',
       null,
       null,
       2300,
       null,
       null,
       null,
       'B12'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-aurelia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-b20',
       '2.5 L B20',
       null,
       null,
       2500,
       null,
       null,
       null,
       'B20'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-aurelia'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-theta-35hp → Lancia_Theta (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1913), year_to = coalesce(year_to, 1918)
where slug = 'lancia-theta-35hp'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-gamma-20hp → Lancia_Gamma_(1910) (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1910)
where slug = 'lancia-gamma-20hp'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l-pet',
       '0.5 L',
       null,
       null,
       460,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-gamma-20hp'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-flaminia → Lancia_Flaminia (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1957), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-flaminia'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-flaminia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-8l',
       '2.8 L',
       null,
       null,
       2800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-flaminia'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-lybra → Lancia_Lybra (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2005), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-lybra'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-lybra'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-lybra'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-lybra'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-lybra'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-die',
       '1.9 L Diesel',
       null,
       null,
       1900,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-lybra'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-die',
       '2.4 L Diesel',
       null,
       null,
       2400,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-lybra'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-flavia → Lancia_Flavia (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1961), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-flavia'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1488,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-flavia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1490,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-flavia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-flavia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-flavia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1991,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-flavia'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-sibilo → Lancia_Sibilo (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1978)
where slug = 'lancia-sibilo'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2418,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-sibilo'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-dialogos → Lancia_Dialogos (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-dialogos'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-ypsilon → Lancia_Ypsilon (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995)
where slug = 'lancia-ypsilon'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-aprilia → Lancia_Aprilia (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1937), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-aprilia'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       352,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-aprilia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       486,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-aprilia'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-lambda → Lancia_Lambda (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1922), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-lambda'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l',
       '2.1 L',
       null,
       null,
       2119,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-lambda'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2370,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-lambda'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-6l',
       '2.6 L',
       null,
       null,
       2568,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-lambda'
on conflict (model_id, slug) do nothing;

-- lancia/lancia-v6-engine → Lancia_V6_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1950)
where slug = 'lancia-v6-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');

-- lancia/lancia-medusa → Lancia_Medusa (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1980), body_type = coalesce(body_type, 'sedan')
where slug = 'lancia-medusa'
  and make_id = (select id from public.vehicle_makes where slug = 'lancia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'lancia' and vm.slug = 'lancia-medusa'
on conflict (model_id, slug) do nothing;

-- jeep/jeep-forward-control → Jeep_Forward_Control (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1956), year_to = coalesce(year_to, 1965)
where slug = 'jeep-forward-control'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');

-- jeep/jeep-commander → Jeep_Commander_(2022) (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021), body_type = coalesce(body_type, 'suv')
where slug = 'jeep-commander'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1300,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-commander'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-commander'
on conflict (model_id, slug) do nothing;

-- jeep/jeep-renegade → Jeep_Renegade_(concept) (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008)
where slug = 'jeep-renegade'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-die',
       '1.5 L Diesel',
       null,
       null,
       1500,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-renegade'
on conflict (model_id, slug) do nothing;

-- jeep/jeep-cherokee-kl → Jeep_Cherokee_(KL) (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), body_type = coalesce(body_type, 'suv')
where slug = 'jeep-cherokee-kl'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-die',
       '2.0 L Diesel',
       null,
       null,
       2000,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-cherokee-kl'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l',
       '2.2 L',
       null,
       null,
       2200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-cherokee-kl'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-cherokee-kl'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-cherokee-kl'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l',
       '3.2 L',
       null,
       null,
       3200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-cherokee-kl'
on conflict (model_id, slug) do nothing;

-- jeep/jeep-cherokee → Jeep_Cherokee_(SJ) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1974), year_to = coalesce(year_to, 1983)
where slug = 'jeep-cherokee'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');

-- jeep/jeep-dj → Jeep_DJ (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1955), year_to = coalesce(year_to, 1984), body_type = coalesce(body_type, 'hatchback')
where slug = 'jeep-dj'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');

-- jeep/jeep-patriot → Jeep_Patriot (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2016), body_type = coalesce(body_type, 'suv')
where slug = 'jeep-patriot'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-die-ea188',
       '2.0 L EA188 Diesel',
       null,
       null,
       2000,
       'diesel',
       null,
       null,
       'EA188'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-patriot'
on conflict (model_id, slug) do nothing;

-- jeep/jeep-comanche → Jeep_Comanche (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1985), year_to = coalesce(year_to, 1992)
where slug = 'jeep-comanche'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-comanche'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-8l-lr2',
       '2.8 L LR2',
       null,
       null,
       2800,
       null,
       null,
       null,
       'LR2'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-comanche'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l',
       '4.0 L',
       null,
       null,
       4000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-comanche'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-j8s',
       '2.1 L J8S',
       null,
       null,
       2100,
       null,
       null,
       null,
       'J8S'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-comanche'
on conflict (model_id, slug) do nothing;

-- jeep/jeep-compass → Jeep_Compass (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), body_type = coalesce(body_type, 'suv')
where slug = 'jeep-compass'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');

-- jeep/jeep-wagoneer → Jeep_Wagoneer_(SJ) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1962)
where slug = 'jeep-wagoneer'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');

-- jeep/jeep-cherokee-xj → Jeep_Cherokee_(XJ) (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1983), body_type = coalesce(body_type, 'suv')
where slug = 'jeep-cherokee-xj'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       2000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-cherokee-xj'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-cherokee-xj'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-c498qa',
       '2.5 L C498QA',
       null,
       null,
       2500,
       null,
       null,
       null,
       'C498QA'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-cherokee-xj'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l-c498qa3',
       '2.7 L C498QA3',
       null,
       null,
       2700,
       null,
       null,
       null,
       'C498QA3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-cherokee-xj'
on conflict (model_id, slug) do nothing;

-- jeep/jeep-recon → Jeep_Recon (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2026), body_type = coalesce(body_type, 'suv')
where slug = 'jeep-recon'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');

-- jeep/jeep-grand-commander → Jeep_Grand_Commander (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2018), year_to = coalesce(year_to, 2022), body_type = coalesce(body_type, 'suv')
where slug = 'jeep-grand-commander'
  and make_id = (select id from public.vehicle_makes where slug = 'jeep');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-pet-i4-t',
       '2.0 L I4-T',
       null,
       null,
       2000,
       'petrol',
       null,
       null,
       'I4-T'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'jeep' and vm.slug = 'jeep-grand-commander'
on conflict (model_id, slug) do nothing;

-- tesla/tesla-cyberquad → Tesla_Cyberquad (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2026)
where slug = 'tesla-cyberquad'
  and make_id = (select id from public.vehicle_makes where slug = 'tesla');

-- tesla/tesla-cybercab → Tesla_Cybercab (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2026), body_type = coalesce(body_type, 'coupe')
where slug = 'tesla-cybercab'
  and make_id = (select id from public.vehicle_makes where slug = 'tesla');

-- tesla/tesla-cybertruck → Tesla_Cybertruck (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023)
where slug = 'tesla-cybertruck'
  and make_id = (select id from public.vehicle_makes where slug = 'tesla');


-- ============================================================================
-- ENRICHMENT DONE
-- models_total=1710, with_article=1710
-- updated=1290, engines_inserted=1943
-- errors=13
-- ============================================================================
