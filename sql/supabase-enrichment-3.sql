-- Enrichment chunk 3/8
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-ponton'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l-om636',
       '1.7 L OM636',
       null,
       null,
       1697,
       null,
       null,
       null,
       'OM636'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-ponton'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-om621',
       '1.9 L OM621',
       null,
       null,
       1897,
       null,
       null,
       null,
       'OM621'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-ponton'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-gle-coupe → Mercedes-Benz_GLE_Coupe (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997), year_to = coalesce(year_to, 2015)
where slug = 'mercedes-benz-gle-coupe'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-w222 → Mercedes-Benz_S-Class_(W222) (12 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w222'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-ele-m276',
       '3.5 L M276 ELECTRIC',
       null,
       null,
       3500,
       'electric',
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-hyb-m276',
       '3.0 L M276 HYBRID',
       null,
       null,
       3000,
       'hybrid',
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-m277',
       '6.0 L M277',
       null,
       null,
       6000,
       null,
       null,
       null,
       'M277'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-die-om651',
       '2.2 L OM651 Diesel',
       null,
       null,
       2200,
       'diesel',
       null,
       null,
       'OM651'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w222'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-c208 → Mercedes-Benz_CLK-Class_(C208) (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997)
where slug = 'mercedes-benz-c208'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c208'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c208'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c208'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c208'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-f700 → Mercedes-Benz_F700 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-f700'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-f700'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w03 → Mercedes-Benz_W03 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1926), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w03'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-m03',
       '1.0 L M03',
       null,
       null,
       968,
       null,
       null,
       null,
       'M03'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w03'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l-m04',
       '0.1 L M04',
       null,
       null,
       131,
       null,
       null,
       null,
       'M04'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w03'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l-m09',
       '0.4 L M09',
       null,
       null,
       444,
       null,
       null,
       null,
       'M09'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w03'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-190-sl → Mercedes-Benz_190_SL (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1955), year_to = coalesce(year_to, 1963), body_type = coalesce(body_type, 'roadster')
where slug = 'mercedes-benz-190-sl'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l-m121',
       '0.9 L M121',
       null,
       null,
       897,
       null,
       null,
       null,
       'M121'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-190-sl'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-c219 → Mercedes-Benz_CLS-Class_(C219) (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), body_type = coalesce(body_type, 'coupe')
where slug = 'mercedes-benz-c219'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m272',
       '3.0 L M272',
       null,
       null,
       3000,
       null,
       null,
       null,
       'M272'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c219'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c219'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-0l-m113',
       '5.0 L M113',
       null,
       null,
       5000,
       null,
       null,
       null,
       'M113'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c219'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c219'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c219'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c219'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c219'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-c216 → Mercedes-Benz_CL-Class_(C216) (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2014)
where slug = 'mercedes-benz-c216'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c216'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c216'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c216'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c216'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-5l-m275',
       '5.5 L M275',
       null,
       null,
       5500,
       null,
       null,
       null,
       'M275'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c216'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-m275',
       '6.0 L M275',
       null,
       null,
       6000,
       null,
       null,
       null,
       'M275'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c216'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w02 → Mercedes-Benz_W02 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1926), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w02'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       988,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w02'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-gl-class → Mercedes-Benz_GLS (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2015)
where slug = 'mercedes-benz-gl-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-1570100-ps → Mercedes_15/70/100_PS (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1924), year_to = coalesce(year_to, 1929), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-1570100-ps'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l',
       '0.9 L',
       null,
       null,
       920,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-1570100-ps'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-r231 → Mercedes-Benz_SL-Class_(R231) (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011), year_to = coalesce(year_to, 2020)
where slug = 'mercedes-benz-r231'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r231'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r231'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r231'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r231'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r231'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-r107-and-c107 → Mercedes-Benz_R107_and_C107 (8 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1971), year_to = coalesce(year_to, 1981), body_type = coalesce(body_type, 'roadster')
where slug = 'mercedes-benz-r107-and-c107'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-8l-m110',
       '2.8 L M110',
       null,
       null,
       2800,
       null,
       null,
       null,
       'M110'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r107-and-c107'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-m103980',
       '3.0 L M103.980',
       null,
       null,
       3000,
       null,
       null,
       null,
       'M103.980'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r107-and-c107'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-m116980',
       '3.5 L M116.980',
       null,
       null,
       3500,
       null,
       null,
       null,
       'M116.980'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r107-and-c107'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-8l-m116980',
       '3.8 L M116.980',
       null,
       null,
       3800,
       null,
       null,
       null,
       'M116.980'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r107-and-c107'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-2l-m116980',
       '4.2 L M116.980',
       null,
       null,
       4200,
       null,
       null,
       null,
       'M116.980'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r107-and-c107'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-5l-m117982',
       '4.5 L M117.982',
       null,
       null,
       4500,
       null,
       null,
       null,
       'M117.982'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r107-and-c107'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-0l-m117960',
       '5.0 L M117.960',
       null,
       null,
       5000,
       null,
       null,
       null,
       'M117.960'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r107-and-c107'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-6l-m117967',
       '5.6 L M117.967',
       null,
       null,
       5600,
       null,
       null,
       null,
       'M117.967'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r107-and-c107'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w212 → Mercedes-Benz_E-Class_(W212) (12 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w212'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-hyb-m276',
       '3.5 L M276 HYBRID',
       null,
       null,
       3500,
       'hybrid',
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-hyb-om651',
       '2.1 L OM651 HYBRID',
       null,
       null,
       2100,
       'hybrid',
       null,
       null,
       'OM651'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w212'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w15 → Mercedes-Benz_W15 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1931), year_to = coalesce(year_to, 1936)
where slug = 'mercedes-benz-w15'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-m15',
       '0.7 L M15',
       null,
       null,
       692,
       null,
       null,
       null,
       'M15'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w15'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-c112 → Mercedes-Benz_C112 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991)
where slug = 'mercedes-benz-c112'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-econic → Mercedes-Benz_Econic (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998)
where slug = 'mercedes-benz-econic'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-c218 → Mercedes-Benz_CLS-Class_(C218) (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-c218'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c218'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c218'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c218'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c218'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c218'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-c215 → Mercedes-Benz_CL-Class_(C215) (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998)
where slug = 'mercedes-benz-c215'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-0l-m113',
       '5.0 L M113',
       null,
       null,
       5000,
       null,
       null,
       null,
       'M113'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c215'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c215'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-5l-m275',
       '5.5 L M275',
       null,
       null,
       5500,
       null,
       null,
       null,
       'M275'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c215'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-8l-m137',
       '5.8 L M137',
       null,
       null,
       5800,
       null,
       null,
       null,
       'M137'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c215'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-m275',
       '6.0 L M275',
       null,
       null,
       6000,
       null,
       null,
       null,
       'M275'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c215'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-3l-m137',
       '6.3 L M137',
       null,
       null,
       6300,
       null,
       null,
       null,
       'M137'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-c215'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w220 → Mercedes-Benz_S-Class_(W220) (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w220'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-7l-m112',
       '3.7 L M112',
       null,
       null,
       3700,
       null,
       null,
       null,
       'M112'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w220'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w220'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-m275',
       '6.0 L M275',
       null,
       null,
       6000,
       null,
       null,
       null,
       'M275'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w220'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-3l-m137',
       '6.3 L M137',
       null,
       null,
       6300,
       null,
       null,
       null,
       'M137'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w220'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l-om613',
       '3.2 L OM613',
       null,
       null,
       3200,
       null,
       null,
       null,
       'OM613'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w220'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l-om648',
       '3.2 L OM648',
       null,
       null,
       3200,
       null,
       null,
       null,
       'OM648'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w220'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-om628',
       '4.0 L OM628',
       null,
       null,
       4000,
       null,
       null,
       null,
       'OM628'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w220'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w210 → Mercedes-Benz_E-Class_(W210) (23 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w210'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l-m104',
       '3.2 L M104',
       null,
       null,
       3200,
       null,
       null,
       null,
       'M104'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-m112',
       '2.4 L M112',
       null,
       null,
       2400,
       null,
       null,
       null,
       'M112'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-2l-m119',
       '4.2 L M119',
       null,
       null,
       4200,
       null,
       null,
       null,
       'M119'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-m119',
       '6.0 L M119',
       null,
       null,
       6000,
       null,
       null,
       null,
       'M119'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-5l-m119',
       '6.5 L M119',
       null,
       null,
       6500,
       null,
       null,
       null,
       'M119'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-om604',
       '2.0 L OM604',
       null,
       null,
       2000,
       null,
       null,
       null,
       'OM604'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-om604',
       '2.2 L OM604',
       null,
       null,
       2200,
       null,
       null,
       null,
       'OM604'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-om605',
       '2.5 L OM605',
       null,
       null,
       2500,
       null,
       null,
       null,
       'OM605'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l-die-om612',
       '2.7 L OM612 Diesel',
       null,
       null,
       2700,
       'diesel',
       null,
       null,
       'OM612'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-9l-om602',
       '2.9 L OM602',
       null,
       null,
       2900,
       null,
       null,
       null,
       'OM602'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-om606',
       '3.0 L OM606',
       null,
       null,
       3000,
       null,
       null,
       null,
       'OM606'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l-die-om613',
       '3.2 L OM613 Diesel',
       null,
       null,
       3200,
       'diesel',
       null,
       null,
       'OM613'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w210'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/maybach-57-and-62 → Maybach_57_and_62 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), body_type = coalesce(body_type, 'sedan')
where slug = 'maybach-57-and-62'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-5l-m285',
       '5.5 L M285',
       null,
       null,
       5500,
       null,
       null,
       null,
       'M285'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'maybach-57-and-62'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-m285',
       '6.0 L M285',
       null,
       null,
       6000,
       null,
       null,
       null,
       'M285'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'maybach-57-and-62'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-r170 → Mercedes-Benz_SLK-Class_(R170) (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), body_type = coalesce(body_type, 'roadster')
where slug = 'mercedes-benz-r170'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-m111946',
       '2.0 L M111.946',
       null,
       null,
       2000,
       null,
       null,
       null,
       'M111.946'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r170'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r170'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-r170'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-sl-class → Mercedes-Benz_SL-Class (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1954)
where slug = 'mercedes-benz-sl-class'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-w211 → Mercedes-Benz_E-Class_(W211) (12 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w211'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-0l-m113',
       '5.0 L M113',
       null,
       null,
       5000,
       null,
       null,
       null,
       'M113'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-4l',
       '5.4 L',
       null,
       null,
       5400,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l-om647',
       '2.7 L OM647',
       null,
       null,
       2700,
       null,
       null,
       null,
       'OM647'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l-om648',
       '3.2 L OM648',
       null,
       null,
       3200,
       null,
       null,
       null,
       'OM648'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-om628',
       '4.0 L OM628',
       null,
       null,
       4000,
       null,
       null,
       null,
       'OM628'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w211'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-600 → Mercedes-Benz_600 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963), year_to = coalesce(year_to, 1981)
where slug = 'mercedes-benz-600'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-3l-m100',
       '6.3 L M100',
       null,
       null,
       6300,
       null,
       null,
       null,
       'M100'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-600'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w18 → Mercedes-Benz_W18 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1933), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w18'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l-m18',
       '0.9 L M18',
       null,
       null,
       867,
       null,
       null,
       null,
       'M18'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w18'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-c111 → Mercedes-Benz_C111 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970)
where slug = 'mercedes-benz-c111'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-24100140-ps → Mercedes_24/100/140_PS (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1924), year_to = coalesce(year_to, 1929), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-24100140-ps'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       240,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-24100140-ps'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-x166 → Mercedes-Benz_GL-Class_(X166) (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), body_type = coalesce(body_type, 'suv')
where slug = 'mercedes-benz-x166'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-x166'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-x166'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-x166'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-x166'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w140 → Mercedes-Benz_W140 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w140'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');

-- mercedes-benz/mercedes-benz-vaneo → Mercedes-Benz_Vaneo (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), year_to = coalesce(year_to, 2005), body_type = coalesce(body_type, 'mpv')
where slug = 'mercedes-benz-vaneo'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-vaneo'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-vaneo'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-vaneo'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w10 → Mercedes-Benz_W10 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1929), year_to = coalesce(year_to, 1934), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w10'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-4l-m10',
       '3.4 L M10',
       null,
       null,
       3400,
       null,
       null,
       null,
       'M10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w10'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w11 → Mercedes-Benz_W11 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1929), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w11'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l-m11',
       '0.6 L M11',
       null,
       null,
       581,
       null,
       null,
       null,
       'M11'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w11'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-f800 → Mercedes-Benz_F800 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-f800'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-hyb-m276',
       '3.5 L M276 HYBRID',
       null,
       null,
       3500,
       'hybrid',
       null,
       null,
       'M276'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-f800'
on conflict (model_id, slug) do nothing;

-- mercedes-benz/mercedes-benz-w221 → Mercedes-Benz_S-Class_(W221) (11 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), body_type = coalesce(body_type, 'sedan')
where slug = 'mercedes-benz-w221'
  and make_id = (select id from public.vehicle_makes where slug = 'mercedes-benz');
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w221'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-hyb-m272',
       '3.5 L M272 HYBRID',
       null,
       null,
       3500,
       'hybrid',
       null,
       null,
       'M272'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w221'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w221'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w221'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w221'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w221'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-m275',
       '6.0 L M275',
       null,
       null,
       6000,
       null,
       null,
       null,
       'M275'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w221'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w221'
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
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w221'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-hyb-om642',
       '3.0 L OM642 HYBRID',
       null,
       null,
       3000,
       'hybrid',
       null,
       null,
       'OM642'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w221'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-0l-om629',
       '4.0 L OM629',
       null,
       null,
       4000,
       null,
       null,
       null,
       'OM629'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mercedes-benz' and vm.slug = 'mercedes-benz-w221'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-cross-coupe-gte-concept → Volkswagen_Cross_Coupe_GTE_Concept (1 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'suv')
where slug = 'volkswagen-cross-coupe-gte-concept'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-6l-203kw-ele-vr6',
       '3.6 L VR6 ELECTRIC 203kW',
       203,
       276,
       3600,
       'electric',
       null,
       null,
       'VR6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-cross-coupe-gte-concept'
on conflict (model_id, slug) do nothing;

-- volkswagen/cupra-formentor → Cupra_Formentor (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2020), body_type = coalesce(body_type, 'suv')
where slug = 'cupra-formentor'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-pet',
       '1.5 L',
       null,
       null,
       1500,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'cupra-formentor'
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
where mk.slug = 'volkswagen' and vm.slug = 'cupra-formentor'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-pet-vz5',
       '2.5 L VZ5',
       null,
       null,
       2500,
       'petrol',
       null,
       null,
       'VZ5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'cupra-formentor'
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
where mk.slug = 'volkswagen' and vm.slug = 'cupra-formentor'
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
where mk.slug = 'volkswagen' and vm.slug = 'cupra-formentor'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-gx3 → Volkswagen_GX3 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), body_type = coalesce(body_type, 'roadster')
where slug = 'volkswagen-gx3'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-gx3'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-tavendor → Volkswagen_Tavendor (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2022), body_type = coalesce(body_type, 'suv')
where slug = 'volkswagen-tavendor'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-pet-ea888',
       '2.0 L EA888',
       null,
       null,
       2000,
       'petrol',
       null,
       null,
       'EA888'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-tavendor'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-bora → Volkswagen_Bora (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2006), body_type = coalesce(body_type, 'sedan')
where slug = 'volkswagen-bora'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-bora'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-bora'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-bora'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-bora'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-pet-vr5',
       '2.3 L VR5',
       null,
       null,
       2300,
       'petrol',
       null,
       null,
       'VR5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-bora'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-8l-pet-vr6',
       '2.8 L VR6',
       null,
       null,
       2800,
       'petrol',
       null,
       null,
       'VR6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-bora'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-bora'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-e-golf → Volkswagen_e-Golf (9 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), year_to = coalesce(year_to, 2020), body_type = coalesce(body_type, 'hatchback')
where slug = 'volkswagen-e-golf'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-pet-ea211',
       '1.0 L EA211',
       null,
       null,
       1000,
       'petrol',
       null,
       null,
       'EA211'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-e-golf'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-pet-ea211',
       '1.2 L EA211',
       null,
       null,
       1200,
       'petrol',
       null,
       null,
       'EA211'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-e-golf'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-pet-ea211',
       '1.4 L EA211',
       null,
       null,
       1400,
       'petrol',
       null,
       null,
       'EA211'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-e-golf'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-pet-ea211',
       '1.5 L EA211',
       null,
       null,
       1500,
       'petrol',
       null,
       null,
       'EA211'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-e-golf'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-ea211',
       '1.6 L EA211',
       null,
       null,
       1600,
       null,
       null,
       null,
       'EA211'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-e-golf'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-pet-ea888',
       '1.8 L EA888',
       null,
       null,
       1800,
       'petrol',
       null,
       null,
       'EA888'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-e-golf'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-pet-ea888',
       '2.0 L EA888',
       null,
       null,
       2000,
       'petrol',
       null,
       null,
       'EA888'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-e-golf'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die-ea288',
       '1.6 L EA288 Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       'EA288'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-e-golf'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-die-ea189',
       '2.0 L EA189 Diesel',
       null,
       null,
       2000,
       'diesel',
       null,
       null,
       'EA189'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-e-golf'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-race-touareg-2 → Volkswagen_Race_Touareg_2 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), year_to = coalesce(year_to, 2011)
where slug = 'volkswagen-race-touareg-2'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-tarek → Volkswagen_Tarek (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003)
where slug = 'volkswagen-tarek'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-viloran → Volkswagen_Viloran (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2020), body_type = coalesce(body_type, 'mpv')
where slug = 'volkswagen-viloran'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-ea888',
       '2.0 L EA888',
       null,
       null,
       2000,
       null,
       null,
       null,
       'EA888'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-viloran'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-race-touareg-3 → Volkswagen_Race_Touareg_3 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), year_to = coalesce(year_to, 2011)
where slug = 'volkswagen-race-touareg-3'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-228kw-die',
       '2.5 L Diesel 228kW',
       228,
       310,
       2500,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-race-touareg-3'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-sharan → Volkswagen_Sharan (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), year_to = coalesce(year_to, 2023), body_type = coalesce(body_type, 'mpv')
where slug = 'volkswagen-sharan'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-t-cross → Volkswagen_T-Cross (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2018), body_type = coalesce(body_type, 'suv')
where slug = 'volkswagen-t-cross'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-pet',
       '1.0 L',
       null,
       null,
       1000,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-t-cross'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-t-cross'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-t-cross'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-pet',
       '1.5 L',
       null,
       null,
       1500,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-t-cross'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-t-cross'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die',
       '1.6 L Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-t-cross'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-kommandeurswagen → Volkswagen_Kommandeurswagen (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1941), year_to = coalesce(year_to, 1944), body_type = coalesce(body_type, 'sedan')
where slug = 'volkswagen-kommandeurswagen'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-18kw-pet',
       '1.1 L 18kW',
       18,
       24,
       1131,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-kommandeurswagen'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-auto-2000 → Volkswagen_Auto_2000 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), body_type = coalesce(body_type, 'hatchback')
where slug = 'volkswagen-auto-2000'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-golf-sportsvan → Volkswagen_Golf_Sportsvan (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), year_to = coalesce(year_to, 2020), body_type = coalesce(body_type, 'mpv')
where slug = 'volkswagen-golf-sportsvan'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-pet',
       '1.0 L',
       null,
       null,
       1000,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-golf-sportsvan'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-pet',
       '1.2 L',
       null,
       null,
       1200,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-golf-sportsvan'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-golf-sportsvan'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-pet',
       '1.5 L',
       null,
       null,
       1500,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-golf-sportsvan'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die',
       '1.6 L Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-golf-sportsvan'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-golf-sportsvan'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-atlas → Volkswagen_Atlas (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017), body_type = coalesce(body_type, 'suv')
where slug = 'volkswagen-atlas'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-virtus → Volkswagen_Virtus (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2018), body_type = coalesce(body_type, 'sedan')
where slug = 'volkswagen-virtus'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-pet',
       '1.0 L',
       null,
       null,
       1000,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-virtus'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-virtus'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-virtus'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-pet',
       '1.5 L',
       null,
       null,
       1500,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-virtus'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-virtus'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-polo-sedan → Volkswagen_Polo_(CK) (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), year_to = coalesce(year_to, 2019), body_type = coalesce(body_type, 'sedan')
where slug = 'volkswagen-polo-sedan'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-pet',
       '1.0 L',
       null,
       null,
       1000,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-polo-sedan'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-ele',
       '1.2 L ELECTRIC',
       null,
       null,
       1200,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-polo-sedan'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-pet',
       '1.2 L',
       null,
       null,
       1200,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-polo-sedan'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-polo-sedan'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-polo-sedan'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-die',
       '1.4 L Diesel',
       null,
       null,
       1400,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-polo-sedan'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die',
       '1.6 L Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-polo-sedan'
on conflict (model_id, slug) do nothing;

-- volkswagen/kubelwagen → Volkswagen_Kübelwagen (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1940), year_to = coalesce(year_to, 1945), body_type = coalesce(body_type, 'roadster')
where slug = 'kubelwagen'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       985,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'kubelwagen'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l',
       '0.1 L',
       null,
       null,
       131,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'kubelwagen'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-taigo → Volkswagen_Taigo (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2020), body_type = coalesce(body_type, 'suv')
where slug = 'volkswagen-taigo'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-pet',
       '1.0 L',
       null,
       null,
       1000,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-taigo'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-taigo'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-pet',
       '1.5 L',
       null,
       null,
       1500,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-taigo'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-vento-a05 → Volkswagen_Vento_(A05) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), year_to = coalesce(year_to, 2022), body_type = coalesce(body_type, 'sedan')
where slug = 'volkswagen-vento-a05'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-concept-bluesport → Volkswagen_Concept_BlueSport (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), body_type = coalesce(body_type, 'roadster')
where slug = 'volkswagen-concept-bluesport'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-concept-bluesport'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-t-roc → Volkswagen_T-Roc (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017)
where slug = 'volkswagen-t-roc'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-concept-d → Volkswagen_Concept_D (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), body_type = coalesce(body_type, 'sedan')
where slug = 'volkswagen-concept-d'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-concept-r → Volkswagen_Concept_R (1 engines)
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-2l-pet',
       '3.2 L',
       null,
       null,
       3200,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-concept-r'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-gti-roadster-vision-gran-turismo → Volkswagen_GTI_Roadster_Vision_Gran_Turismo (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), body_type = coalesce(body_type, 'roadster')
where slug = 'volkswagen-gti-roadster-vision-gran-turismo'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-pet-vr6',
       '3.0 L VR6',
       null,
       null,
       3000,
       'petrol',
       null,
       null,
       'VR6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-gti-roadster-vision-gran-turismo'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-concept-a → Volkswagen_Concept_A (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), body_type = coalesce(body_type, 'suv')
where slug = 'volkswagen-concept-a'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-c-coupe-gte → Volkswagen_C_Coupe_GTE (1 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'sedan')
where slug = 'volkswagen-c-coupe-gte'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-ele',
       '2.0 L ELECTRIC',
       null,
       null,
       2000,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-c-coupe-gte'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-budd-e → Volkswagen_BUDD-e (0 engines)

-- volkswagen/volkswagen-talagon → Volkswagen_Talagon (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021), body_type = coalesce(body_type, 'suv')
where slug = 'volkswagen-talagon'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-pet-ea888',
       '2.0 L EA888',
       null,
       null,
       2000,
       'petrol',
       null,
       null,
       'EA888'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-talagon'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-ea390',
       '2.5 L EA390',
       null,
       null,
       2500,
       null,
       null,
       null,
       'EA390'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-talagon'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-bora-china → Volkswagen_Bora_(China) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001)
where slug = 'volkswagen-bora-china'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-jetta-vi → Volkswagen_Jetta_(A6) (9 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), year_to = coalesce(year_to, 2019), body_type = coalesce(body_type, 'sedan')
where slug = 'volkswagen-jetta-vi'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-pet',
       '1.2 L',
       null,
       null,
       1200,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vi'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vi'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vi'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vi'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vi'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vi'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vi'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die',
       '1.6 L Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vi'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vi'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-samba → Volkswagen_Samba (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1949), body_type = coalesce(body_type, 'van')
where slug = 'volkswagen-samba'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-polo-gti-r5 → Volkswagen_Polo_GTI_R5 (1 engines)
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-polo-gti-r5'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-taos → Volkswagen_Taos (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2018), body_type = coalesce(body_type, 'suv')
where slug = 'volkswagen-taos'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-pet',
       '1.2 L',
       null,
       null,
       1200,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-taos'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-taos'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-pet',
       '1.5 L',
       null,
       null,
       1500,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-taos'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-taos'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-taos'
on conflict (model_id, slug) do nothing;

-- volkswagen/porsche-914 → Porsche_914 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1969)
where slug = 'porsche-914'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
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
where mk.slug = 'volkswagen' and vm.slug = 'porsche-914'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-jetta-vii → Volkswagen_Jetta_(A7) (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2018), body_type = coalesce(body_type, 'sedan')
where slug = 'volkswagen-jetta-vii'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-pet',
       '1.2 L',
       null,
       null,
       1200,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vii'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vii'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-pet',
       '1.5 L',
       null,
       null,
       1500,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vii'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vii'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-jetta-vii'
on conflict (model_id, slug) do nothing;

-- volkswagen/volkswagen-logus → Volkswagen_Logus (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1993), year_to = coalesce(year_to, 1997), body_type = coalesce(body_type, 'coupe')
where slug = 'volkswagen-logus'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-id-space-vizzion → Volkswagen_ID._Space_Vizzion (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2018), body_type = coalesce(body_type, 'estate')
where slug = 'volkswagen-id-space-vizzion'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');

-- volkswagen/volkswagen-arteon → Volkswagen_Arteon (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017), year_to = coalesce(year_to, 2023), body_type = coalesce(body_type, 'hatchback')
where slug = 'volkswagen-arteon'
  and make_id = (select id from public.vehicle_makes where slug = 'volkswagen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-pet',
       '1.5 L',
       null,
       null,
       1500,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-arteon'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-arteon'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-pet-ea211',
       '1.4 L EA211',
       null,
       null,
       1400,
       'petrol',
       null,
       null,
       'EA211'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-arteon'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-arteon'
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
where mk.slug = 'volkswagen' and vm.slug = 'volkswagen-arteon'
on conflict (model_id, slug) do nothing;

-- opel/opel-x30xe → X30XE (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), year_to = coalesce(year_to, 2004)
where slug = 'opel-x30xe'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-x25xe → X25XE (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), year_to = coalesce(year_to, 2004)
where slug = 'opel-x25xe'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-trixx → Opel_Trixx (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), body_type = coalesce(body_type, 'hatchback')
where slug = 'opel-trixx'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-die',
       '1.3 L Diesel',
       null,
       null,
       1300,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-trixx'
on conflict (model_id, slug) do nothing;

-- opel/opel-admiral → Opel_Admiral (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1937)
where slug = 'opel-admiral'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-astra-l → Opel_Astra_L (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991)
where slug = 'opel-astra-l'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-frogster → Opel_Frogster (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), body_type = coalesce(body_type, 'roadster')
where slug = 'opel-frogster'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-pet-x10xe',
       '1.0 L X10XE',
       null,
       null,
       1000,
       'petrol',
       null,
       null,
       'X10XE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-frogster'
on conflict (model_id, slug) do nothing;

-- opel/opel-rak-e → Opel_RAK_e (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011), body_type = coalesce(body_type, 'hatchback')
where slug = 'opel-rak-e'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-c20xe → C20XE (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), year_to = coalesce(year_to, 1999)
where slug = 'opel-c20xe'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-12-litre → Opel_1,2_Liter (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1931), year_to = coalesce(year_to, 1935), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-12-litre'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       995,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-12-litre'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1073,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-12-litre'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l',
       '1.2 L',
       null,
       null,
       1193,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-12-litre'
on conflict (model_id, slug) do nothing;

-- opel/opel-astra-j → Opel_Astra_J (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991)
where slug = 'opel-astra-j'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-512-ps → Opel_5/12_PS (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1911)
where slug = 'opel-512-ps'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-straight-6-engine → Opel_straight-6_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1930), year_to = coalesce(year_to, 1966)
where slug = 'opel-straight-6-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/vauxhall-belmont → Vauxhall_Belmont (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), body_type = coalesce(body_type, 'sedan')
where slug = 'vauxhall-belmont'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-kadett-a → Opel_Kadett_A (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1962), year_to = coalesce(year_to, 1965), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-kadett-a'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       993,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-a'
on conflict (model_id, slug) do nothing;

-- opel/opel-corsa → Opel_Corsa (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1982)
where slug = 'opel-corsa'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-astra-f → Opel_Astra_F (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991)
where slug = 'opel-astra-f'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-flextreme → Opel_Flextreme (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), body_type = coalesce(body_type, 'hatchback')
where slug = 'opel-flextreme'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-die',
       '1.3 L Diesel',
       null,
       null,
       1300,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-flextreme'
on conflict (model_id, slug) do nothing;

-- opel/opel-840-ps → Opel_8/40_PS (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1927), year_to = coalesce(year_to, 1930)
where slug = 'opel-840-ps'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l-25kw',
       '1.7 L 25kW',
       25,
       34,
       1735,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-840-ps'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-29kw',
       '1.9 L 29kW',
       29,
       40,
       1924,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-840-ps'
on conflict (model_id, slug) do nothing;

-- opel/opel-13-litre → Opel_1,3_Liter (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1934), year_to = coalesce(year_to, 1935), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-13-litre'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1288,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-13-litre'
on conflict (model_id, slug) do nothing;

-- opel/opel-kadett-c → Opel_Kadett_C (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1973), year_to = coalesce(year_to, 1979), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-kadett-c'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-astra-k → Opel_Astra_K (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991)
where slug = 'opel-astra-k'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-c20let → C20LET (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), year_to = coalesce(year_to, 1999)
where slug = 'opel-c20let'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-gt → Opel_GT (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968), year_to = coalesce(year_to, 1973)
where slug = 'opel-gt'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-junior → Opel_Junior (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1983), body_type = coalesce(body_type, 'hatchback')
where slug = 'opel-junior'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-pet',
       '1.2 L',
       null,
       null,
       1200,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-junior'
on conflict (model_id, slug) do nothing;

-- opel/opel-gtc → Opel_GTC (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007)
where slug = 'opel-gtc'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-8l-lp9',
       '2.8 L LP9',
       null,
       null,
       2800,
       null,
       null,
       null,
       'LP9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-gtc'
on conflict (model_id, slug) do nothing;

-- opel/opel-adam → Opel_Adam (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), year_to = coalesce(year_to, 2019), body_type = coalesce(body_type, 'hatchback')
where slug = 'opel-adam'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele-b10xfl',
       '1.0 L B10XFL ELECTRIC',
       null,
       null,
       1000,
       'electric',
       null,
       null,
       'B10XFL'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-adam'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-a12xel',
       '1.2 L A12XEL',
       null,
       null,
       1200,
       null,
       null,
       null,
       'A12XEL'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-adam'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-a14xel',
       '1.4 L A14XEL',
       null,
       null,
       1400,
       null,
       null,
       null,
       'A14XEL'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-adam'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-b14neh',
       '1.4 L B14NEH',
       null,
       null,
       1400,
       null,
       null,
       null,
       'B14NEH'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-adam'
on conflict (model_id, slug) do nothing;

-- opel/opel-commodore → Opel_Commodore (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1967), year_to = coalesce(year_to, 1986)
where slug = 'opel-commodore'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/cadillac-catera → Cadillac_Catera (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2001), body_type = coalesce(body_type, 'sedan')
where slug = 'cadillac-catera'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
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
where mk.slug = 'opel' and vm.slug = 'cadillac-catera'
on conflict (model_id, slug) do nothing;

-- opel/opel-rekord → Opel_Rekord (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1953), year_to = coalesce(year_to, 1986), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-rekord'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-monza → Opel_Monza (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1977), year_to = coalesce(year_to, 1986)
where slug = 'opel-monza'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-astra → Opel_Astra (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991)
where slug = 'opel-astra'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-20-litre → Opel_2.0_litre (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1934), year_to = coalesce(year_to, 1937), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-20-litre'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l',
       '1.9 L',
       null,
       null,
       1932,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-20-litre'
on conflict (model_id, slug) do nothing;

-- opel/opel-diplomat → Opel_Diplomat (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1964)
where slug = 'opel-diplomat'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-1030-ps → Opel_10/30_(10/35)_PS (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1922)
where slug = 'opel-1030-ps'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/vauxhall-carlton → Vauxhall_Carlton (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1978), year_to = coalesce(year_to, 1994), body_type = coalesce(body_type, 'sedan')
where slug = 'vauxhall-carlton'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-antara → Opel_Antara (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2015), body_type = coalesce(body_type, 'suv')
where slug = 'opel-antara'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
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
where mk.slug = 'opel' and vm.slug = 'opel-antara'
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
where mk.slug = 'opel' and vm.slug = 'opel-antara'
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
where mk.slug = 'opel' and vm.slug = 'opel-antara'
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
where mk.slug = 'opel' and vm.slug = 'opel-antara'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-6l',
       '3.6 L',
       null,
       null,
       3600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-antara'
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
where mk.slug = 'opel' and vm.slug = 'opel-antara'
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
where mk.slug = 'opel' and vm.slug = 'opel-antara'
on conflict (model_id, slug) do nothing;
