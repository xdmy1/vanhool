-- Enrichment chunk 2/8
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-n13',
       '2.0 L N13',
       null,
       null,
       2000,
       null,
       null,
       null,
       'N13'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-1-series'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-n55',
       '3.0 L N55',
       null,
       null,
       3000,
       null,
       null,
       null,
       'N55'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-1-series'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-ele-b37',
       '1.5 L B37 ELECTRIC',
       null,
       null,
       1500,
       'electric',
       null,
       null,
       'B37'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-1-series'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-n47',
       '2.0 L N47',
       null,
       null,
       2000,
       null,
       null,
       null,
       'N47'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-1-series'
on conflict (model_id, slug) do nothing;

-- bmw/bmw-5-series-e39 → BMW_5_Series_(E39) (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2004), body_type = coalesce(body_type, 'sedan')
where slug = 'bmw-5-series-e39'
  and make_id = (select id from public.vehicle_makes where slug = 'bmw');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-8l-m52',
       '2.8 L M52',
       null,
       null,
       2800,
       null,
       null,
       null,
       'M52'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-5-series-e39'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m54',
       '3.0 L M54',
       null,
       null,
       3000,
       null,
       null,
       null,
       'M54'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-5-series-e39'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-4l-m62',
       '4.4 L M62',
       null,
       null,
       4400,
       null,
       null,
       null,
       'M62'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-5-series-e39'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-9l-s62',
       '4.9 L S62',
       null,
       null,
       4900,
       null,
       null,
       null,
       'S62'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-5-series-e39'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m47',
       '2.0 L M47',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M47'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-5-series-e39'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-m51',
       '2.5 L M51',
       null,
       null,
       2500,
       null,
       null,
       null,
       'M51'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-5-series-e39'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-9l-m57',
       '2.9 L M57',
       null,
       null,
       2900,
       null,
       null,
       null,
       'M57'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-5-series-e39'
on conflict (model_id, slug) do nothing;

-- bmw/bmw-2-series-active-tourer → BMW_2_Series_Active_Tourer (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), body_type = coalesce(body_type, 'hatchback')
where slug = 'bmw-2-series-active-tourer'
  and make_id = (select id from public.vehicle_makes where slug = 'bmw');

-- bmw/bmw-z4-e89 → BMW_Z4_(E89) (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), body_type = coalesce(body_type, 'convertible')
where slug = 'bmw-z4-e89'
  and make_id = (select id from public.vehicle_makes where slug = 'bmw');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-n20',
       '2.0 L N20',
       null,
       null,
       2000,
       null,
       null,
       null,
       'N20'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-z4-e89'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-n52',
       '2.5 L N52',
       null,
       null,
       2500,
       null,
       null,
       null,
       'N52'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-z4-e89'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-n52',
       '3.0 L N52',
       null,
       null,
       3000,
       null,
       null,
       null,
       'N52'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-z4-e89'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-n54',
       '3.0 L N54',
       null,
       null,
       3000,
       null,
       null,
       null,
       'N54'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-z4-e89'
on conflict (model_id, slug) do nothing;

-- bmw/bmw-e84 → BMW_X1_(E84) (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), body_type = coalesce(body_type, 'suv')
where slug = 'bmw-e84'
  and make_id = (select id from public.vehicle_makes where slug = 'bmw');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-n46',
       '2.0 L N46',
       null,
       null,
       2000,
       null,
       null,
       null,
       'N46'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-e84'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-n20',
       '2.0 L N20',
       null,
       null,
       2000,
       null,
       null,
       null,
       'N20'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-e84'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-n52',
       '3.0 L N52',
       null,
       null,
       3000,
       null,
       null,
       null,
       'N52'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-e84'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-n55',
       '3.0 L N55',
       null,
       null,
       3000,
       null,
       null,
       null,
       'N55'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-e84'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-n47',
       '2.0 L N47',
       null,
       null,
       2000,
       null,
       null,
       null,
       'N47'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-e84'
on conflict (model_id, slug) do nothing;

-- bmw/bmw-b38 → BMW_B38_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013)
where slug = 'bmw-b38'
  and make_id = (select id from public.vehicle_makes where slug = 'bmw');

-- bmw/bmw-7-series-g70 → BMW_7_Series_(G70) (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2022), body_type = coalesce(body_type, 'sedan')
where slug = 'bmw-7-series-g70'
  and make_id = (select id from public.vehicle_makes where slug = 'bmw');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-b58',
       '3.0 L B58',
       null,
       null,
       3000,
       null,
       null,
       null,
       'B58'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-7-series-g70'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-4l-s68',
       '4.4 L S68',
       null,
       null,
       4400,
       null,
       null,
       null,
       'S68'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-7-series-g70'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-b57',
       '3.0 L B57',
       null,
       null,
       3000,
       null,
       null,
       null,
       'B57'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-7-series-g70'
on conflict (model_id, slug) do nothing;

-- bmw/bmw-f70 → BMW_1_Series_(F70) (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2024), body_type = coalesce(body_type, 'hatchback')
where slug = 'bmw-f70'
  and make_id = (select id from public.vehicle_makes where slug = 'bmw');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-b38',
       '1.5 L B38',
       null,
       null,
       1500,
       null,
       null,
       null,
       'B38'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-f70'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-hyb-b38',
       '1.5 L B38 HYBRID',
       null,
       null,
       1500,
       'hybrid',
       null,
       null,
       'B38'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-f70'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-b48',
       '2.0 L B48',
       null,
       null,
       2000,
       null,
       null,
       null,
       'B48'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-f70'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-b47',
       '2.0 L B47',
       null,
       null,
       2000,
       null,
       null,
       null,
       'B47'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-f70'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-b47',
       '2.0 L B47 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'B47'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-f70'
on conflict (model_id, slug) do nothing;

-- bmw/bmw-335 → BMW_335 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1939), year_to = coalesce(year_to, 1941), body_type = coalesce(body_type, 'sedan')
where slug = 'bmw-335'
  and make_id = (select id from public.vehicle_makes where slug = 'bmw');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-m335',
       '3.5 L M335',
       null,
       null,
       3485,
       null,
       null,
       null,
       'M335'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-335'
on conflict (model_id, slug) do nothing;

-- bmw/bmw-2-series-f22 → BMW_2_Series_(F22) (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), year_to = coalesce(year_to, 2021)
where slug = 'bmw-2-series-f22'
  and make_id = (select id from public.vehicle_makes where slug = 'bmw');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-ele-b38',
       '1.5 L B38 ELECTRIC',
       null,
       null,
       1500,
       'electric',
       null,
       null,
       'B38'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-2-series-f22'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-n20',
       '2.0 L N20',
       null,
       null,
       2000,
       null,
       null,
       null,
       'N20'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-2-series-f22'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-n55',
       '3.0 L N55',
       null,
       null,
       3000,
       null,
       null,
       null,
       'N55'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-2-series-f22'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-n47',
       '2.0 L N47',
       null,
       null,
       2000,
       null,
       null,
       null,
       'N47'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-2-series-f22'
on conflict (model_id, slug) do nothing;

-- bmw/bmw-new-class-coupe → BMW_New_Class_coupé (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1962), year_to = coalesce(year_to, 1972), body_type = coalesce(body_type, 'sedan')
where slug = 'bmw-new-class-coupe'
  and make_id = (select id from public.vehicle_makes where slug = 'bmw');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m10',
       '2.0 L M10',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-new-class-coupe'
on conflict (model_id, slug) do nothing;

-- bmw/bmw-700 → BMW_700 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1959), body_type = coalesce(body_type, 'sedan')
where slug = 'bmw-700'
  and make_id = (select id from public.vehicle_makes where slug = 'bmw');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       697,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'bmw' and vm.slug = 'bmw-700'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-om646-engine → Mercedes-Benz_OM646_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), year_to = coalesce(year_to, 2010)
where slug = 'mercedes-benz-om646-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-t80 → Mercedes-Benz_T80 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1939)
where slug = 'mercedes-benz-t80'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-5l',
       '4.5 L',
       null,
       null,
       4520,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-t80'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w186 → Mercedes-Benz_W186 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1951), year_to = coalesce(year_to, 1957), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w186'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m186',
       '3.0 L M186',
       null,
       null,
       2996,
       null,
       null,
       null,
       'M186'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w186'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-r171 → Mercedes-Benz_SLK-Class_(R171) (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), year_to = coalesce(year_to, 2011)
where slug = 'mercedes-benz-r171'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-m271',
       '1.8 L M271',
       null,
       null,
       1800,
       null,
       null,
       null,
       'M271'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r171'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-m272',
       '3.5 L M272',
       null,
       null,
       3500,
       null,
       null,
       null,
       'M272'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r171'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-4l-m113',
       '5.4 L M113',
       null,
       null,
       5400,
       null,
       null,
       null,
       'M113'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r171'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-r172 → Mercedes-Benz_SLK-Class_(R172) (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011), year_to = coalesce(year_to, 2020)
where slug = 'mercedes-benz-r172'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-m270',
       '1.6 L M270',
       null,
       null,
       1600,
       null,
       null,
       null,
       'M270'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r172'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-m271',
       '1.8 L M271',
       null,
       null,
       1800,
       null,
       null,
       null,
       'M271'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r172'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m274',
       '2.0 L M274',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M274'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r172'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m276',
       '3.0 L M276',
       null,
       null,
       3000,
       null,
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r172'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-m276',
       '3.5 L M276',
       null,
       null,
       3500,
       null,
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r172'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-5l-m152',
       '5.5 L M152',
       null,
       null,
       5500,
       null,
       null,
       null,
       'M152'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r172'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-om651',
       '2.1 L OM651',
       null,
       null,
       2100,
       null,
       null,
       null,
       'OM651'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r172'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-vision-eqxx → Mercedes-Benz_Vision_EQXX (0 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-vision-eqxx'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-w142 → Mercedes-Benz_W142 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1937)
where slug = 'mercedes-benz-w142'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l-m142',
       '0.2 L M142',
       null,
       null,
       208,
       null,
       1937,
       1938,
       'M142'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w142'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-atego → Mercedes-Benz_Atego (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998)
where slug = 'mercedes-benz-atego'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-vario → Mercedes-Benz_Vario (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2013), body_type = coalesce(body_type, 'van')
where slug = 'mercedes-benz-vario'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-metris → Mercedes-Benz_Metris (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), body_type = coalesce(body_type, 'mpv')
where slug = 'mercedes-benz-metris'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-vision-sla → Mercedes-Benz_Vision_SLA (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), body_type = coalesce(body_type, 'convertible')
where slug = 'mercedes-benz-vision-sla'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-m166',
       '1.9 L M166',
       null,
       null,
       1900,
       null,
       null,
       null,
       'M166'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-vision-sla'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/smart-crosstown → Smart_Crosstown (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005)
where slug = 'smart-crosstown'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/unimog-401 → Unimog_401 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1953), year_to = coalesce(year_to, 1956)
where slug = 'unimog-401'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l-die',
       '1.7 L Diesel',
       null,
       null,
       1700,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'unimog-401'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-om654-engine → Mercedes-Benz_OM654_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016)
where slug = 'mercedes-benz-om654-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-eqt → Mercedes-Benz_EQT (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), year_to = coalesce(year_to, 2026)
where slug = 'mercedes-benz-eqt'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-w108 → Mercedes-Benz_W108/W109 (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), year_to = coalesce(year_to, 1972), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w108'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w108'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w108'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w108'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l',
       '3.5 L',
       null,
       null,
       3500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w108'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-5l',
       '4.5 L',
       null,
       null,
       4500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w108'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-3l',
       '6.3 L',
       null,
       null,
       6300,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w108'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-amg-vision-gran-turismo → Mercedes-Benz_AMG_Vision_Gran_Turismo (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013)
where slug = 'mercedes-benz-amg-vision-gran-turismo'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-5l-m157',
       '5.5 L M157',
       null,
       null,
       5500,
       null,
       null,
       null,
       'M157'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-amg-vision-gran-turismo'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-2l-m159',
       '6.2 L M159',
       null,
       null,
       6200,
       null,
       null,
       null,
       'M159'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-amg-vision-gran-turismo'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/unimog-435 → Unimog_435 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975), year_to = coalesce(year_to, 1993)
where slug = 'unimog-435'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-citan → Mercedes-Benz_Citan (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), year_to = coalesce(year_to, 2026)
where slug = 'mercedes-benz-citan'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-r-class → Mercedes-Benz_R-Class (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), body_type = coalesce(body_type, 'estate')
where slug = 'mercedes-benz-r-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r-class'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l',
       '3.5 L',
       null,
       null,
       3500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r-class'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-0l',
       '5.0 L',
       null,
       null,
       5000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r-class'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-5l',
       '5.5 L',
       null,
       null,
       5500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r-class'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-2l',
       '6.2 L',
       null,
       null,
       6200,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r-class'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-die',
       '3.0 L Diesel',
       null,
       null,
       3000,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r-class'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-gle-class → Mercedes-Benz_GLE (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997), year_to = coalesce(year_to, 2015)
where slug = 'mercedes-benz-gle-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-sprinter → Mercedes-Benz_Sprinter (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995)
where slug = 'mercedes-benz-sprinter'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-w143 → Mercedes-Benz_W143 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1937), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w143'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l-m143',
       '0.2 L M143',
       null,
       null,
       229,
       null,
       null,
       null,
       'M143'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w143'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w08 → Mercedes-Benz_W08 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1928), body_type = coalesce(body_type, 'roadster')
where slug = 'mercedes-benz-w08'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l-m08',
       '0.6 L M08',
       null,
       null,
       622,
       null,
       1928,
       1933,
       'M08'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w08'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w21 → Mercedes-Benz_W21 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1933), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w21'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       961,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w21'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-gla → Mercedes-Benz_GLA (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), body_type = coalesce(body_type, 'suv')
where slug = 'mercedes-benz-gla'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-a-class → Mercedes-Benz_A-Class (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), body_type = coalesce(body_type, 'hatchback')
where slug = 'mercedes-benz-a-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-4g-tronic-transmission → Mercedes-Benz_4G-Tronic_transmission (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1979), year_to = coalesce(year_to, 1996)
where slug = 'mercedes-benz-4g-tronic-transmission'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-x-class → Mercedes-Benz_X-Class (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017)
where slug = 'mercedes-benz-x-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-om699',
       '2.3 L OM699',
       null,
       null,
       2300,
       null,
       null,
       null,
       'OM699'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-x-class'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-om642',
       '3.0 L OM642',
       null,
       null,
       3000,
       null,
       null,
       null,
       'OM642'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-x-class'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-b-class → Mercedes-Benz_B-Class (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), year_to = coalesce(year_to, 2026), body_type = coalesce(body_type, 'hatchback')
where slug = 'mercedes-benz-b-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-om612-engine → Mercedes-Benz_OM612_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2013)
where slug = 'mercedes-benz-om612-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/jeep-hurricane → Jeep_Hurricane (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005)
where slug = 'jeep-hurricane'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-7l',
       '5.7 L',
       null,
       null,
       5700,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-hurricane'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-v-class → Mercedes-Benz_V-Class (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), body_type = coalesce(body_type, 'mpv')
where slug = 'mercedes-benz-v-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/unimog-2010 → Unimog_2010 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1951)
where slug = 'unimog-2010'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l-die-om636912',
       '1.7 L OM636.912 Diesel',
       null,
       null,
       1700,
       'diesel',
       null,
       null,
       'OM636.912'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'unimog-2010'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-cls-class → Mercedes-Benz_CLS (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), year_to = coalesce(year_to, 2023), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-cls-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-arocs → Mercedes-Benz_Arocs (0 engines)

-- mercedes-benz/mercedes-benz-w123 → Mercedes-Benz_W123 (10 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w123'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m115',
       '2.0 L M115',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M115'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w123'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m102',
       '2.0 L M102',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M102'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w123'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-m115',
       '2.3 L M115',
       null,
       null,
       2300,
       null,
       null,
       null,
       'M115'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w123'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-m102',
       '2.3 L M102',
       null,
       null,
       2300,
       null,
       null,
       null,
       'M102'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w123'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-m123',
       '2.5 L M123',
       null,
       null,
       2500,
       null,
       null,
       null,
       'M123'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w123'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l-m110',
       '2.7 L M110',
       null,
       null,
       2700,
       null,
       null,
       null,
       'M110'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w123'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-om615',
       '2.0 L OM615',
       null,
       null,
       2000,
       null,
       null,
       null,
       'OM615'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w123'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-om615',
       '2.2 L OM615',
       null,
       null,
       2200,
       null,
       null,
       null,
       'OM615'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w123'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-om616',
       '2.4 L OM616',
       null,
       null,
       2400,
       null,
       null,
       null,
       'OM616'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w123'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-om617',
       '3.0 L OM617',
       null,
       null,
       3000,
       null,
       null,
       null,
       'OM617'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w123'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-170s → Mercedes-Benz_170S (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1949), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-170s'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-m136',
       '1.8 L M136',
       null,
       null,
       1767,
       null,
       null,
       null,
       'M136'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-170s'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-om636',
       '1.8 L OM636',
       null,
       null,
       1767,
       null,
       null,
       null,
       'OM636'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-170s'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w105 → Mercedes-Benz_W105 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1956), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w105'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-m180',
       '2.2 L M180',
       null,
       null,
       2195,
       null,
       null,
       null,
       'M180'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w105'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w203 → Mercedes-Benz_C-Class_(W203) (11 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w203'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-m271',
       '1.8 L M271',
       null,
       null,
       1800,
       null,
       null,
       null,
       'M271'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w203'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m111',
       '2.0 L M111',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M111'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w203'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-6l-m112',
       '2.6 L M112',
       null,
       null,
       2600,
       null,
       null,
       null,
       'M112'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w203'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-m272',
       '2.5 L M272',
       null,
       null,
       2500,
       null,
       null,
       null,
       'M272'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w203'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l-m112',
       '3.2 L M112',
       null,
       null,
       3200,
       null,
       null,
       null,
       'M112'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w203'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-m272',
       '3.5 L M272',
       null,
       null,
       3500,
       null,
       null,
       null,
       'M272'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w203'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-4l-m113',
       '5.4 L M113',
       null,
       null,
       5400,
       null,
       null,
       null,
       'M113'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w203'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-die-om611',
       '2.1 L OM611 Diesel',
       null,
       null,
       2100,
       'diesel',
       null,
       null,
       'OM611'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w203'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-die-om646',
       '2.1 L OM646 Diesel',
       null,
       null,
       2100,
       'diesel',
       null,
       null,
       'OM646'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w203'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-die-om612',
       '3.0 L OM612 Diesel',
       null,
       null,
       3000,
       'diesel',
       null,
       null,
       'OM612'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w203'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-die-om642',
       '3.0 L OM642 Diesel',
       null,
       null,
       3000,
       'diesel',
       null,
       null,
       'OM642'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w203'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w204 → Mercedes-Benz_C-Class_(W204) (10 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w204'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-m271',
       '1.6 L M271',
       null,
       null,
       1600,
       null,
       null,
       null,
       'M271'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-m271',
       '1.8 L M271',
       null,
       null,
       1800,
       null,
       null,
       null,
       'M271'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-m274',
       '1.6 L M274',
       null,
       null,
       1600,
       null,
       null,
       null,
       'M274'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-m272',
       '2.5 L M272',
       null,
       null,
       2500,
       null,
       null,
       null,
       'M272'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-m272',
       '3.5 L M272',
       null,
       null,
       3500,
       null,
       null,
       null,
       'M272'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-m276',
       '3.5 L M276',
       null,
       null,
       3500,
       null,
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-2l-m156',
       '6.2 L M156',
       null,
       null,
       6200,
       null,
       null,
       null,
       'M156'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-die-om651',
       '2.1 L OM651 Diesel',
       null,
       null,
       2100,
       'diesel',
       null,
       null,
       'OM651'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-die-om646',
       '2.2 L OM646 Diesel',
       null,
       null,
       2200,
       'diesel',
       null,
       null,
       'OM646'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-die-om642',
       '3.0 L OM642 Diesel',
       null,
       null,
       3000,
       'diesel',
       null,
       null,
       'OM642'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w204'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w153 → Mercedes-Benz_W153 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1938), year_to = coalesce(year_to, 1943), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w153'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-m153',
       '2.3 L M153',
       null,
       null,
       2289,
       null,
       null,
       null,
       'M153'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w153'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-f200 → Mercedes-Benz_F200 (1 engines)
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-m120',
       '6.0 L M120',
       null,
       null,
       6000,
       null,
       null,
       null,
       'M120'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-f200'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-f125 → Mercedes-Benz_F125 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011)
where slug = 'mercedes-benz-f125'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-type-223 → Mercedes-Benz_S-Class_(W223) (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2020), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-type-223'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-m256',
       '2.5 L M256',
       null,
       null,
       2500,
       null,
       null,
       null,
       'M256'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-type-223'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m256',
       '3.0 L M256',
       null,
       null,
       3000,
       null,
       null,
       null,
       'M256'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-type-223'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-m176',
       '4.0 L M176',
       null,
       null,
       4000,
       null,
       null,
       null,
       'M176'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-type-223'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-m279',
       '6.0 L M279',
       null,
       null,
       6000,
       null,
       null,
       null,
       'M279'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-type-223'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-m177',
       '4.0 L M177',
       null,
       null,
       4000,
       null,
       null,
       null,
       'M177'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-type-223'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-9l-om656',
       '2.9 L OM656',
       null,
       null,
       2900,
       null,
       null,
       null,
       'OM656'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-type-223'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-ocean-drive → Mercedes-Benz_Ocean_Drive (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), body_type = coalesce(body_type, 'convertible')
where slug = 'mercedes-benz-ocean-drive'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-500e → Mercedes-Benz_500_E (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), year_to = coalesce(year_to, 1994), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-500e'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-0l-m119',
       '5.0 L M119',
       null,
       null,
       5000,
       null,
       null,
       null,
       'M119'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-500e'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w31 → Mercedes-Benz_W31 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1934), year_to = coalesce(year_to, 1939), body_type = coalesce(body_type, 'estate')
where slug = 'mercedes-benz-w31'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-0l-m24',
       '5.0 L M24',
       null,
       null,
       5000,
       null,
       null,
       null,
       'M24'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w31'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w214 → Mercedes-Benz_E-Class_(W214) (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w214'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w214'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w214'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-c209 → Mercedes-Benz_CLK-Class_(C209) (9 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001)
where slug = 'mercedes-benz-c209'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-m271',
       '1.8 L M271',
       null,
       null,
       1800,
       null,
       null,
       null,
       'M271'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c209'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l-m112',
       '3.2 L M112',
       null,
       null,
       3200,
       null,
       null,
       null,
       'M112'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c209'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-m272',
       '3.5 L M272',
       null,
       null,
       3500,
       null,
       null,
       null,
       'M272'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c209'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-4l-m113',
       '5.4 L M113',
       null,
       null,
       5400,
       null,
       null,
       null,
       'M113'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c209'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-5l-m273',
       '5.5 L M273',
       null,
       null,
       5500,
       null,
       null,
       null,
       'M273'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c209'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-2l-m156',
       '6.2 L M156',
       null,
       null,
       6200,
       null,
       null,
       null,
       'M156'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c209'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-om646',
       '2.1 L OM646',
       null,
       null,
       2100,
       null,
       null,
       null,
       'OM646'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c209'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l-om612',
       '2.7 L OM612',
       null,
       null,
       2700,
       null,
       null,
       null,
       'OM612'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c209'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-om642',
       '3.0 L OM642',
       null,
       null,
       3000,
       null,
       null,
       null,
       'OM642'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c209'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-simplex → Mercedes_Simplex (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1902), year_to = coalesce(year_to, 1909)
where slug = 'mercedes-simplex'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-3l',
       '5.3 L',
       null,
       null,
       5315,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-simplex'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w128 → Mercedes-Benz_W128 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1958), year_to = coalesce(year_to, 1960), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w128'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-m127',
       '2.2 L M127',
       null,
       null,
       2200,
       null,
       null,
       null,
       'M127'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w128'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w206 → Mercedes-Benz_C-Class_(W206) (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w206'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-hyb-m264',
       '1.5 L M264 HYBRID',
       null,
       null,
       1500,
       'hybrid',
       null,
       null,
       'M264'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-m264',
       '2.0 L M264 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'M264'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-m139',
       '2.0 L M139 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'M139'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-m254',
       '2.0 L M254 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'M254'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-m139l',
       '2.0 L M139L HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'M139L'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-om654',
       '2.0 L OM654 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'OM654'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w206'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/smart-electric-drive → Smart_electric_drive (0 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'hatchback')
where slug = 'smart-electric-drive'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-s-class → Mercedes-Benz_S-Class (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1954), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-s-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-w189 → Mercedes-Benz_W189 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1957), year_to = coalesce(year_to, 1962), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w189'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m189',
       '3.0 L M189',
       null,
       null,
       2996,
       null,
       null,
       null,
       'M189'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w189'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w06 → Mercedes-Benz_S-Series (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1926), year_to = coalesce(year_to, 1933)
where slug = 'mercedes-benz-w06'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/jeep-grand-cherokee-wk → Jeep_Grand_Cherokee_(WK) (14 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), body_type = coalesce(body_type, 'suv')
where slug = 'jeep-grand-cherokee-wk'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-7l',
       '3.7 L',
       null,
       null,
       3700,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '154kw',
       '154kW',
       154,
       210,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-7l',
       '4.7 L',
       null,
       null,
       4700,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       703,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '224kw',
       '224kW',
       224,
       305,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-7l',
       '5.7 L',
       null,
       null,
       5700,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       654,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '243kw',
       '243kW',
       243,
       330,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-1l-srt-8',
       '6.1 L SRT-8',
       null,
       null,
       6100,
       null,
       null,
       null,
       'SRT-8'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l',
       '0.1 L',
       null,
       null,
       59,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '313kw',
       '313kW',
       313,
       425,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-om642',
       '3.0 L OM642',
       null,
       null,
       3000,
       null,
       null,
       null,
       'OM642'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       987,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '158kw',
       '158kW',
       158,
       215,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wk'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/jeep-grand-cherokee-wj → Jeep_Grand_Cherokee_(WJ) (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2005)
where slug = 'jeep-grand-cherokee-wj'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wj'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-7l',
       '4.7 L',
       null,
       null,
       4700,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wj'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-1l-die',
       '3.1 L Diesel',
       null,
       null,
       3100,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wj'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l-om612',
       '2.7 L OM612',
       null,
       null,
       2700,
       null,
       null,
       null,
       'OM612'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wj'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-c698qa1',
       '4.0 L C698QA1',
       null,
       null,
       4000,
       null,
       null,
       null,
       'C698QA1'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wj'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-7l-c8v93q',
       '4.7 L C8V93Q',
       null,
       null,
       4700,
       null,
       null,
       null,
       'C8V93Q'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-grand-cherokee-wj'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/jeep-liberty → Jeep_Liberty_(KJ) (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001)
where slug = 'jeep-liberty'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-liberty'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w116 → Mercedes-Benz_W116 (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1972), year_to = coalesce(year_to, 1980), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w116'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w116'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l',
       '3.5 L',
       null,
       null,
       3500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w116'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-5l',
       '4.5 L',
       null,
       null,
       4500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w116'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-8l',
       '6.8 L',
       null,
       null,
       6834,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w116'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w116'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/sterling-bullet → Sterling_Bullet (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2008)
where slug = 'sterling-bullet'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-7l',
       '6.7 L',
       null,
       null,
       6700,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'sterling-bullet'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-vision-cls → Mercedes-Benz_Vision_CLS (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003)
where slug = 'mercedes-benz-vision-cls'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-maybach-6 → Mercedes-Maybach_6 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), body_type = coalesce(body_type, 'convertible')
where slug = 'mercedes-maybach-6'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-clk-class → Mercedes-Benz_CLK-Class (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2009)
where slug = 'mercedes-benz-clk-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-slr-mclaren → Mercedes-Benz_SLR_McLaren (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), year_to = coalesce(year_to, 2010), body_type = coalesce(body_type, 'roadster')
where slug = 'mercedes-benz-slr-mclaren'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-4l-m155',
       '5.4 L M155',
       null,
       null,
       5439,
       null,
       null,
       null,
       'M155'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-slr-mclaren'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-eqv → Mercedes-Benz_EQV (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), body_type = coalesce(body_type, 'mpv')
where slug = 'mercedes-benz-eqv'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-sk → Mercedes-Benz_SK (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), year_to = coalesce(year_to, 1998)
where slug = 'mercedes-benz-sk'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '9-6l-om401',
       '9.6 L OM401',
       null,
       null,
       9600,
       null,
       null,
       null,
       'OM401'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-sk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       'om441',
       'OM441',
       null,
       null,
       0,
       null,
       null,
       null,
       'OM441'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-sk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '8-0l-om402',
       '8.0 L OM402',
       null,
       null,
       8000,
       null,
       null,
       null,
       'OM402'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-sk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-om442',
       '6.0 L OM442',
       null,
       null,
       6000,
       null,
       null,
       null,
       'OM442'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-sk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-om442',
       '1.0 L OM442',
       null,
       null,
       1000,
       null,
       null,
       null,
       'OM442'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-sk'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-om423',
       '3.0 L OM423',
       null,
       null,
       3000,
       null,
       null,
       null,
       'OM423'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-sk'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-c207 → Mercedes-Benz_E-Class_(C207) (9 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), year_to = coalesce(year_to, 2017)
where slug = 'mercedes-benz-c207'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-m271',
       '1.8 L M271',
       null,
       null,
       1800,
       null,
       null,
       null,
       'M271'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m274',
       '2.0 L M274',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M274'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m276',
       '3.0 L M276',
       null,
       null,
       3000,
       null,
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-m276',
       '3.5 L M276',
       null,
       null,
       3500,
       null,
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-m272',
       '3.5 L M272',
       null,
       null,
       3500,
       null,
       null,
       null,
       'M272'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-7l-m278',
       '4.7 L M278',
       null,
       null,
       4700,
       null,
       null,
       null,
       'M278'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-5l-m273',
       '5.5 L M273',
       null,
       null,
       5500,
       null,
       null,
       null,
       'M273'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-om651',
       '2.1 L OM651',
       null,
       null,
       2100,
       null,
       null,
       null,
       'OM651'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-om642',
       '3.0 L OM642',
       null,
       null,
       3000,
       null,
       null,
       null,
       'OM642'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c207'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/chrysler-minivans → Chrysler_minivans_(RS) (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), year_to = coalesce(year_to, 2010), body_type = coalesce(body_type, 'mpv')
where slug = 'chrysler-minivans'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'chrysler-minivans'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'chrysler-minivans'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-3l',
       '3.3 L',
       null,
       null,
       3300,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'chrysler-minivans'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-8l',
       '3.8 L',
       null,
       null,
       3800,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'chrysler-minivans'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'chrysler-minivans'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-8l-die',
       '2.8 L Diesel',
       null,
       null,
       2800,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'chrysler-minivans'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/smart-fortwo → Smart_Fortwo (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2007), body_type = coalesce(body_type, 'hatchback')
where slug = 'smart-fortwo'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-sls-amg → Mercedes-Benz_SLS_AMG (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), year_to = coalesce(year_to, 2014), body_type = coalesce(body_type, 'coupe')
where slug = 'mercedes-benz-sls-amg'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-2l-m159',
       '6.2 L M159',
       null,
       null,
       6200,
       null,
       null,
       null,
       'M159'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-sls-amg'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-g-class → Mercedes-Benz_G-Class (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1979)
where slug = 'mercedes-benz-g-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/unimog-419 → Unimog_419 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 1991)
where slug = 'unimog-419'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '81kw',
       '81kW',
       81,
       110,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'unimog-419'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-vision-eq-silver-arrow → Mercedes-Benz_Vision_EQ_Silver_Arrow (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2018)
where slug = 'mercedes-benz-vision-eq-silver-arrow'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '552kw-ele',
       'ELECTRIC 552kW',
       552,
       750,
       null,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-vision-eq-silver-arrow'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-mb100 → Mercedes-Benz_MB100 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1980), year_to = coalesce(year_to, 1986), body_type = coalesce(body_type, 'pickup')
where slug = 'mercedes-benz-mb100'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-om615',
       '2.0 L OM615',
       null,
       null,
       2000,
       null,
       null,
       null,
       'OM615'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-mb100'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-om616',
       '2.4 L OM616',
       null,
       null,
       2400,
       null,
       null,
       null,
       'OM616'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-mb100'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-300sel-63 → Mercedes-Benz_300_SEL_6.3 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968), year_to = coalesce(year_to, 1972)
where slug = 'mercedes-benz-300sel-63'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-3l-m100',
       '6.3 L M100',
       null,
       null,
       6332,
       null,
       null,
       null,
       'M100'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-300sel-63'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-bluezero → Mercedes-Benz_BlueZERO (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'hatchback')
where slug = 'mercedes-benz-bluezero'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '50kw-m281',
       'M281 50kW',
       50,
       68,
       null,
       null,
       null,
       null,
       'M281'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-bluezero'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/chrysler-pacifica → Chrysler_Pacifica_(1999_concept_vehicle) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), body_type = coalesce(body_type, 'mpv')
where slug = 'chrysler-pacifica'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-c217 → Mercedes-Benz_S-Class_(C217) (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), body_type = coalesce(body_type, 'convertible')
where slug = 'mercedes-benz-c217'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m276',
       '3.0 L M276',
       null,
       null,
       3000,
       null,
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c217'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-m177',
       '4.0 L M177',
       null,
       null,
       4000,
       null,
       null,
       null,
       'M177'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c217'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-7l-m278',
       '4.7 L M278',
       null,
       null,
       4700,
       null,
       null,
       null,
       'M278'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c217'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-5l-m157',
       '5.5 L M157',
       null,
       null,
       5500,
       null,
       null,
       null,
       'M157'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c217'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-m279',
       '6.0 L M279',
       null,
       null,
       6000,
       null,
       null,
       null,
       'M279'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c217'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-glk-class → Mercedes-Benz_GLK-Class (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), year_to = coalesce(year_to, 2015), body_type = coalesce(body_type, 'suv')
where slug = 'mercedes-benz-glk-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-glk-class'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l',
       '3.5 L',
       null,
       null,
       3500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-glk-class'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-die',
       '2.1 L Diesel',
       null,
       null,
       2100,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-glk-class'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-die',
       '3.0 L Diesel',
       null,
       null,
       3000,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-glk-class'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w213 → Mercedes-Benz_E-Class_(W213) (13 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), year_to = coalesce(year_to, 2023), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w213'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m264',
       '2.0 L M264',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M264'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m270',
       '2.0 L M270',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M270'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m274',
       '2.0 L M274',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M274'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m256',
       '3.0 L M256',
       null,
       null,
       3000,
       null,
       null,
       null,
       'M256'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m276',
       '3.0 L M276',
       null,
       null,
       3000,
       null,
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-m177',
       '4.0 L M177',
       null,
       null,
       4000,
       null,
       null,
       null,
       'M177'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-m139',
       '2.0 L M139 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'M139'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-m270',
       '2.0 L M270 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'M270'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-hyb-m256',
       '3.0 L M256 HYBRID',
       null,
       null,
       3000,
       'hybrid',
       null,
       null,
       'M256'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-om654',
       '2.0 L OM654',
       null,
       null,
       2000,
       null,
       null,
       null,
       'OM654'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-om654',
       '2.0 L OM654 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'OM654'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-9l-om656',
       '2.9 L OM656',
       null,
       null,
       2900,
       null,
       null,
       null,
       'OM656'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-om642',
       '3.0 L OM642',
       null,
       null,
       3000,
       null,
       null,
       null,
       'OM642'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w213'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w205 → Mercedes-Benz_C-Class_(W205) (12 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), year_to = coalesce(year_to, 2023), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w205'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-m264',
       '1.5 L M264',
       null,
       null,
       1500,
       null,
       null,
       null,
       'M264'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-m270',
       '1.6 L M270',
       null,
       null,
       1600,
       null,
       null,
       null,
       'M270'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m274',
       '2.0 L M274',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M274'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m276',
       '3.0 L M276',
       null,
       null,
       3000,
       null,
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-m177',
       '4.0 L M177',
       null,
       null,
       4000,
       null,
       null,
       null,
       'M177'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m139',
       '2.0 L M139',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M139'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m264',
       '2.0 L M264',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M264'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-m274',
       '2.0 L M274 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'M274'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-die-om651',
       '2.1 L OM651 Diesel',
       null,
       null,
       2100,
       'diesel',
       null,
       null,
       'OM651'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die-om626',
       '1.6 L OM626 Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       'OM626'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-om654',
       '2.0 L OM654',
       null,
       null,
       2000,
       null,
       null,
       null,
       'OM654'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-om654',
       '2.0 L OM654 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'OM654'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w205'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-c257 → Mercedes-Benz_CLS_(C257) (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2018), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-c257'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-hyb-m264',
       '1.5 L M264 HYBRID',
       null,
       null,
       1500,
       'hybrid',
       null,
       null,
       'M264'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c257'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-m264',
       '2.0 L M264 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'M264'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c257'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-hyb-m256',
       '3.0 L M256 HYBRID',
       null,
       null,
       3000,
       'hybrid',
       null,
       null,
       'M256'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c257'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-hyb-om654',
       '2.0 L OM654 HYBRID',
       null,
       null,
       2000,
       'hybrid',
       null,
       null,
       'OM654'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c257'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-9l-hyb-om656',
       '2.9 L OM656 HYBRID',
       null,
       null,
       2900,
       'hybrid',
       null,
       null,
       'OM656'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c257'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w187 → Mercedes-Benz_W187 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1951), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w187'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-m180',
       '2.2 L M180',
       null,
       null,
       2195,
       null,
       null,
       null,
       'M180'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w187'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-cla-class → Mercedes-Benz_CLA (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-cla-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/jeep-trailhawk → Jeep_Trailhawk (1 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'suv')
where slug = 'jeep-trailhawk'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-die',
       '3.0 L Diesel',
       null,
       null,
       3000,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'jeep-trailhawk'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w120 → Mercedes-Benz_W120/W121 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1953), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w120'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-380 → Mercedes-Benz_380_(1933) (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1933), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-380'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l',
       '0.8 L',
       null,
       null,
       820,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-380'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w125-rekordwagen → Mercedes-Benz_W125_Rekordwagen (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1937)
where slug = 'mercedes-benz-w125-rekordwagen'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-c-class → Mercedes-Benz_C-Class (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992)
where slug = 'mercedes-benz-c-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/unimog-425 → Unimog_425 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975), year_to = coalesce(year_to, 1988)
where slug = 'unimog-425'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '110kw-die',
       'Diesel 110kW',
       110,
       150,
       null,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'unimog-425'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-35-hp → Mercedes_35_hp (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1901)
where slug = 'mercedes-35-hp'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-9l',
       '5.9 L',
       null,
       null,
       5918,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-35-hp'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-f-cell → Mercedes-Benz_F-Cell (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002)
where slug = 'mercedes-benz-f-cell'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-x167 → Mercedes-Benz_GLS_(X167) (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2019), body_type = coalesce(body_type, 'suv')
where slug = 'mercedes-benz-x167'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m256',
       '3.0 L M256',
       null,
       null,
       3000,
       null,
       null,
       null,
       'M256'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-x167'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-m176',
       '4.0 L M176',
       null,
       null,
       4000,
       null,
       null,
       null,
       'M176'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-x167'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-m177',
       '4.0 L M177',
       null,
       null,
       4000,
       null,
       null,
       null,
       'M177'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-x167'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-9l-d29',
       '2.9 L D29',
       null,
       null,
       2900,
       null,
       null,
       null,
       'D29'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-x167'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-slk-class → Mercedes-Benz_SLK-Class (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2020), body_type = coalesce(body_type, 'roadster')
where slug = 'mercedes-benz-slk-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-540k → Mercedes-Benz_540K (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1936), body_type = coalesce(body_type, 'convertible')
where slug = 'mercedes-benz-540k'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       401,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-540k'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w177 → Mercedes-Benz_A-Class_(W177) (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2018), body_type = coalesce(body_type, 'hatchback')
where slug = 'mercedes-benz-w177'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-m282',
       '1.3 L M282',
       null,
       null,
       1300,
       null,
       null,
       null,
       'M282'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w177'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m260',
       '2.0 L M260',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M260'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w177'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m139',
       '2.0 L M139',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M139'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w177'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-die-om608',
       '1.5 L OM608 Diesel',
       null,
       null,
       1500,
       'diesel',
       null,
       null,
       'OM608'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w177'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-die-om654',
       '2.0 L OM654 Diesel',
       null,
       null,
       2000,
       'diesel',
       null,
       null,
       'OM654'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w177'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w202 → Mercedes-Benz_C-Class_(W202) (11 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w202'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-m111',
       '1.8 L M111',
       null,
       null,
       1800,
       null,
       null,
       null,
       'M111'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w202'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m111',
       '2.0 L M111',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M111'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w202'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-m111',
       '2.3 L M111',
       null,
       null,
       2300,
       null,
       null,
       null,
       'M111'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w202'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-8l-m104',
       '2.8 L M104',
       null,
       null,
       2800,
       null,
       null,
       null,
       'M104'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w202'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-8l-m112',
       '2.8 L M112',
       null,
       null,
       2800,
       null,
       null,
       null,
       'M112'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w202'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-6l-m104',
       '3.6 L M104',
       null,
       null,
       3600,
       null,
       null,
       null,
       'M104'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w202'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-3l-m113',
       '4.3 L M113',
       null,
       null,
       4300,
       null,
       null,
       null,
       'M113'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w202'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-4l-m113',
       '5.4 L M113',
       null,
       null,
       5400,
       null,
       null,
       null,
       'M113'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w202'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-die-om604',
       '2.2 L OM604 Diesel',
       null,
       null,
       2200,
       'diesel',
       null,
       null,
       'OM604'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w202'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-die-om611',
       '2.2 L OM611 Diesel',
       null,
       null,
       2200,
       'diesel',
       null,
       null,
       'OM611'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w202'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-die-om605',
       '2.5 L OM605 Diesel',
       null,
       null,
       2500,
       'diesel',
       null,
       null,
       'OM605'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w202'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-m-class → Mercedes-Benz_M-Class (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997), year_to = coalesce(year_to, 2015)
where slug = 'mercedes-benz-m-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-450sel-69 → Mercedes-Benz_450SEL_6.9 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975)
where slug = 'mercedes-benz-450sel-69'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-8l-m100',
       '6.8 L M100',
       null,
       null,
       6834,
       null,
       null,
       null,
       'M100'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-450sel-69'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-cl-class → Mercedes-Benz_CL-Class (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), year_to = coalesce(year_to, 2013)
where slug = 'mercedes-benz-cl-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-ponton → Mercedes-Benz_Ponton (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1953), year_to = coalesce(year_to, 1963), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-ponton'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-m127',
       '2.2 L M127',
       null,
       null,
       2195,
       null,
       null,
       null,
       'M127'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-ponton'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-m180',
       '2.2 L M180',
       null,
       null,
       2195,
       null,
       null,
       null,
       'M180'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-ponton'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-m121',
       '1.9 L M121',
       null,
       null,
       1897,
       null,
       null,
       null,
       'M121'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-ponton'
on conflict (model_id, slug) do nothing;
