-- Enrichment chunk 7/8

-- suzuki/suzuki-wagon-r-smile → Suzuki_Wagon_R_Smile (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021), body_type = coalesce(body_type, 'mpv')
where slug = 'suzuki-wagon-r-smile'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-pet-r06d',
       '0.7 L R06D',
       null,
       null,
       658,
       'petrol',
       null,
       null,
       'R06D'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-wagon-r-smile'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-cervo → Suzuki_Cervo (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1977), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-cervo'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l-ele-t5a',
       '0.5 L T5A ELECTRIC',
       null,
       null,
       539,
       'electric',
       null,
       null,
       'T5A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-cervo'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-f8a',
       '0.8 L F8A',
       null,
       null,
       797,
       null,
       null,
       null,
       'F8A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-cervo'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-f10a',
       '1.0 L F10A',
       null,
       null,
       970,
       null,
       null,
       null,
       'F10A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-cervo'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-grand-vitara → Suzuki_Grand_Vitara_(2022) (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2022), body_type = coalesce(body_type, 'suv')
where slug = 'suzuki-grand-vitara'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-k15b',
       '1.5 L K15B',
       null,
       null,
       1462,
       null,
       null,
       null,
       'K15B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-grand-vitara'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-hyb-k15c',
       '1.5 L K15C HYBRID',
       null,
       null,
       1462,
       'hybrid',
       null,
       null,
       'K15C'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-grand-vitara'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-k15c',
       '1.5 L K15C',
       null,
       null,
       1462,
       null,
       null,
       null,
       'K15C'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-grand-vitara'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-ele-m15d-fxe',
       '1.5 L M15D-FXE ELECTRIC',
       null,
       null,
       1490,
       'electric',
       null,
       null,
       'M15D-FXE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-grand-vitara'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-xbee → Suzuki_Xbee (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017), body_type = coalesce(body_type, 'suv')
where slug = 'suzuki-xbee'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele-k10c',
       '1.0 L K10C ELECTRIC',
       null,
       null,
       1000,
       'electric',
       null,
       null,
       'K10C'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-xbee'
on conflict (model_id, slug) do nothing;

-- suzuki/fuji-cabin → Fuji_Cabin (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1957), year_to = coalesce(year_to, 1958), body_type = coalesce(body_type, 'coupe')
where slug = 'fuji-cabin'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-celerio → Suzuki_Celerio (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-celerio'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-mehran → Suzuki_Mehran (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1988), year_to = coalesce(year_to, 2019), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-mehran'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-ele-f8b',
       '0.8 L F8B ELECTRIC',
       null,
       null,
       796,
       'electric',
       null,
       null,
       'F8B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-mehran'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-lt-r450 → Suzuki_LT-R450 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006)
where slug = 'suzuki-lt-r450'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       450,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-lt-r450'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-aerio → Suzuki_Aerio (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), year_to = coalesce(year_to, 2007), body_type = coalesce(body_type, 'sedan')
where slug = 'suzuki-aerio'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-die-m13a',
       '1.3 L M13A Diesel',
       null,
       null,
       1300,
       'diesel',
       null,
       null,
       'M13A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-aerio'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-fronte-800 → Suzuki_Fronte_800 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), body_type = coalesce(body_type, 'sedan')
where slug = 'suzuki-fronte-800'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-ele-c10',
       '0.8 L C10 ELECTRIC',
       null,
       null,
       785,
       'electric',
       null,
       null,
       'C10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-fronte-800'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-ignis → Suzuki_Ignis (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), year_to = coalesce(year_to, 2008)
where slug = 'suzuki-ignis'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-palette → Suzuki_Palette (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), year_to = coalesce(year_to, 2013), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-palette'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-pet-k6a',
       '0.7 L K6A',
       null,
       null,
       658,
       'petrol',
       null,
       null,
       'K6A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-palette'
on conflict (model_id, slug) do nothing;

-- suzuki/mitsubishi-maven → Mitsubishi_Maven (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), body_type = coalesce(body_type, 'van')
where slug = 'mitsubishi-maven'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-g15a',
       '1.5 L G15A',
       null,
       null,
       1500,
       null,
       null,
       null,
       'G15A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'mitsubishi-maven'
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
where mk.slug = 'suzuki' and vm.slug = 'mitsubishi-maven'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-g16a',
       '1.6 L G16A',
       null,
       null,
       1600,
       null,
       null,
       null,
       'G16A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'mitsubishi-maven'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-wagon-r → Suzuki_Wagon_R (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1993), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-wagon-r'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-sx4 → Suzuki_SX4 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006)
where slug = 'suzuki-sx4'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-karimun → Suzuki_Karimun (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2021), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-karimun'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-f-engine → Suzuki_F_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1977), year_to = coalesce(year_to, 2022)
where slug = 'suzuki-f-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-fronx → Suzuki_Fronx (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023), body_type = coalesce(body_type, 'suv')
where slug = 'suzuki-fronx'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele-k10c',
       '1.0 L K10C ELECTRIC',
       null,
       null,
       1000,
       'electric',
       null,
       null,
       'K10C'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-fronx'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-k12n',
       '1.2 L K12N',
       null,
       null,
       1200,
       null,
       null,
       null,
       'K12N'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-fronx'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-k15b',
       '1.5 L K15B',
       null,
       null,
       1500,
       null,
       null,
       null,
       'K15B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-fronx'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-hyb-k15c',
       '1.5 L K15C HYBRID',
       null,
       null,
       1500,
       'hybrid',
       null,
       null,
       'K15C'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-fronx'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-r-engine → Suzuki_R_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011)
where slug = 'suzuki-r-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-spacia → Suzuki_Spacia (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013)
where slug = 'suzuki-spacia'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/maruti-suzuki-alto → Maruti_Suzuki_Alto (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), body_type = coalesce(body_type, 'hatchback')
where slug = 'maruti-suzuki-alto'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-ciaz → Suzuki_Ciaz (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021), year_to = coalesce(year_to, 2025), body_type = coalesce(body_type, 'sedan')
where slug = 'suzuki-ciaz'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-die-k12b',
       '1.2 L K12B Diesel',
       null,
       null,
       1200,
       'diesel',
       null,
       null,
       'K12B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-ciaz'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-splash → Suzuki_Splash (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), year_to = coalesce(year_to, 2014), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-splash'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-die-k10b',
       '1.0 L K10B Diesel',
       null,
       null,
       1000,
       'diesel',
       null,
       null,
       'K10B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-splash'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-k-engine → Suzuki_K_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994)
where slug = 'suzuki-k-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/geo-metro → Geo_Metro (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), year_to = coalesce(year_to, 2001)
where slug = 'geo-metro'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/toyota-glanza → Toyota_Glanza (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2015), body_type = coalesce(body_type, 'hatchback')
where slug = 'toyota-glanza'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-cv1 → Suzuki_CV1 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), year_to = coalesce(year_to, 1985)
where slug = 'suzuki-cv1'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-ertiga → Suzuki_Ertiga (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012)
where slug = 'suzuki-ertiga'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-hustler → Suzuki_Hustler (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), body_type = coalesce(body_type, 'suv')
where slug = 'suzuki-hustler'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-alto → Suzuki_Alto (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1979), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-alto'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-carry → Suzuki_Carry (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1961)
where slug = 'suzuki-carry'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-kei → Suzuki_Kei (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2009), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-kei'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-ele-f6a',
       '0.7 L F6A ELECTRIC',
       null,
       null,
       657,
       'electric',
       null,
       null,
       'F6A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-kei'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-ele-k6a',
       '0.7 L K6A ELECTRIC',
       null,
       null,
       658,
       'electric',
       null,
       null,
       'K6A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-kei'
on conflict (model_id, slug) do nothing;

-- suzuki/toyota-vitz → Toyota_Vitz (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), body_type = coalesce(body_type, 'hatchback')
where slug = 'toyota-vitz'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-swift → Suzuki_Swift (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-swift'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-xl-7 → Suzuki_XL-7 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2009), body_type = coalesce(body_type, 'suv')
where slug = 'suzuki-xl-7'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/toyota-starlet → Toyota_Starlet (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1973)
where slug = 'toyota-starlet'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-samurai → Suzuki_Samurai (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), body_type = coalesce(body_type, 'suv')
where slug = 'suzuki-samurai'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-cultus-crescent → Suzuki_Cultus_Crescent (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), year_to = coalesce(year_to, 2002), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-cultus-crescent'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/mitsubishi-minicab → Mitsubishi_Minicab (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966), body_type = coalesce(body_type, 'pickup')
where slug = 'mitsubishi-minicab'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-twin → Suzuki_Twin (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), year_to = coalesce(year_to, 2005), body_type = coalesce(body_type, 'coupe')
where slug = 'suzuki-twin'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-kizashi → Suzuki_Kizashi (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), body_type = coalesce(body_type, 'sedan')
where slug = 'suzuki-kizashi'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-j24b',
       '2.4 L J24B',
       null,
       null,
       2400,
       null,
       null,
       null,
       'J24B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-kizashi'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-suzulight → Suzuki_Suzulight (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1955), year_to = coalesce(year_to, 1969)
where slug = 'suzuki-suzulight'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-jimny → Suzuki_Jimny (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), body_type = coalesce(body_type, 'suv')
where slug = 'suzuki-jimny'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-lapin → Suzuki_Alto_Lapin (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-lapin'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-40kw',
       '0.7 L 40kW',
       40,
       54,
       657,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-lapin'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-44kw',
       '0.7 L 44kW',
       44,
       60,
       657,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-lapin'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-apv → Suzuki_APV (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), body_type = coalesce(body_type, 'van')
where slug = 'suzuki-apv'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-g15a',
       '1.5 L G15A',
       null,
       null,
       1500,
       null,
       null,
       null,
       'G15A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-apv'
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
where mk.slug = 'suzuki' and vm.slug = 'suzuki-apv'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-g16a',
       '1.6 L G16A',
       null,
       null,
       1600,
       null,
       null,
       null,
       'G16A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-apv'
on conflict (model_id, slug) do nothing;

-- suzuki/mazda-carol → Mazda_Carol (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1962), year_to = coalesce(year_to, 1970), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-carol'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/toyota-belta → Toyota_Belta (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005), body_type = coalesce(body_type, 'sedan')
where slug = 'toyota-belta'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele',
       '1.0 L ELECTRIC',
       null,
       null,
       1000,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'toyota-belta'
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
where mk.slug = 'suzuki' and vm.slug = 'toyota-belta'
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
where mk.slug = 'suzuki' and vm.slug = 'toyota-belta'
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
where mk.slug = 'suzuki' and vm.slug = 'toyota-belta'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-cappuccino → Suzuki_Cappuccino (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), body_type = coalesce(body_type, 'roadster')
where slug = 'suzuki-cappuccino'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-ele-f6a',
       '0.7 L F6A ELECTRIC',
       null,
       null,
       657,
       'electric',
       null,
       null,
       'F6A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-cappuccino'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-ele-k6a',
       '0.7 L K6A ELECTRIC',
       null,
       null,
       657,
       'electric',
       null,
       null,
       'K6A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-cappuccino'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-fronte → Suzuki_Fronte (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1967), body_type = coalesce(body_type, 'sedan')
where slug = 'suzuki-fronte'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l-lc10',
       '0.4 L LC10',
       null,
       null,
       356,
       null,
       null,
       null,
       'LC10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-fronte'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-vitara → Suzuki_Vitara (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1988)
where slug = 'suzuki-vitara'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-x-90 → Suzuki_X-90 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), year_to = coalesce(year_to, 1997), body_type = coalesce(body_type, 'coupe')
where slug = 'suzuki-x-90'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-g16a',
       '1.6 L G16A',
       null,
       null,
       1600,
       null,
       null,
       null,
       'G16A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-x-90'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-mr-wagon → Suzuki_MR_Wagon (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), year_to = coalesce(year_to, 2016), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-mr-wagon'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-mighty-boy → Suzuki_Mighty_Boy (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1983)
where slug = 'suzuki-mighty-boy'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l-ele-f5a',
       '0.5 L F5A ELECTRIC',
       null,
       null,
       543,
       'electric',
       null,
       null,
       'F5A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-mighty-boy'
on conflict (model_id, slug) do nothing;

-- kia/kia-pop → Kia_Pop (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010)
where slug = 'kia-pop'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-ev9 → Kia_EV9 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023), body_type = coalesce(body_type, 'suv')
where slug = 'kia-ev9'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-shuma → Kia_Shuma (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), year_to = coalesce(year_to, 2003)
where slug = 'kia-shuma'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-avella → Kia_Avella (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 2002)
where slug = 'kia-avella'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-ceed → Kia_Ceed (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006)
where slug = 'kia-ceed'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-rio → Kia_Rio (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-rio'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-kue → Kia_Kue (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), body_type = coalesce(body_type, 'suv')
where slug = 'kia-kue'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-6l',
       '4.6 L',
       null,
       null,
       4600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-kue'
on conflict (model_id, slug) do nothing;

-- kia/kia-cub → Kia_Cub (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), body_type = coalesce(body_type, 'hatchback')
where slug = 'kia-cub'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-cub'
on conflict (model_id, slug) do nothing;

-- kia/kia-provo → Kia_Provo (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), body_type = coalesce(body_type, 'hatchback')
where slug = 'kia-provo'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-provo'
on conflict (model_id, slug) do nothing;

-- kia/ford-festiva → Ford_Festiva (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 2002)
where slug = 'ford-festiva'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-pregio → Kia_Pregio (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), year_to = coalesce(year_to, 2006), body_type = coalesce(body_type, 'van')
where slug = 'kia-pregio'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-pregio'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l-die',
       '2.7 L Diesel',
       null,
       null,
       2700,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-pregio'
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
where mk.slug = 'kia' and vm.slug = 'kia-pregio'
on conflict (model_id, slug) do nothing;

-- kia/kia-syros → Kia_Syros (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2025), body_type = coalesce(body_type, 'suv')
where slug = 'kia-syros'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-g10t',
       '1.0 L G1.0T-',
       null,
       null,
       1000,
       null,
       null,
       null,
       'G1.0T-'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-syros'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-die-d15',
       '1.5 L D1.5 Diesel',
       null,
       null,
       1500,
       'diesel',
       null,
       null,
       'D1.5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-syros'
on conflict (model_id, slug) do nothing;

-- kia/kia-kx3 → Kia_KX3 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2015), year_to = coalesce(year_to, 2023), body_type = coalesce(body_type, 'suv')
where slug = 'kia-kx3'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-k4-2024 → Kia_K4 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2024), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-k4-2024'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele-g10',
       '1.0 L G1.0 ELECTRIC',
       null,
       null,
       1000,
       'electric',
       null,
       null,
       'G1.0'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-k4-2024'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-g16',
       '1.6 L G1.6',
       null,
       null,
       1600,
       null,
       null,
       null,
       'G1.6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-k4-2024'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-g20',
       '2.0 L G2.0',
       null,
       null,
       2000,
       null,
       null,
       null,
       'G2.0'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-k4-2024'
on conflict (model_id, slug) do nothing;

-- kia/kia-retona → Kia_Retona (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), body_type = coalesce(body_type, 'suv')
where slug = 'kia-retona'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-retona'
on conflict (model_id, slug) do nothing;

-- kia/kia-opirus → Kia_Opirus (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), year_to = coalesce(year_to, 2011), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-opirus'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l',
       '2.7 L',
       null,
       null,
       2700,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-opirus'
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
where mk.slug = 'kia' and vm.slug = 'kia-opirus'
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
where mk.slug = 'kia' and vm.slug = 'kia-opirus'
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
where mk.slug = 'kia' and vm.slug = 'kia-opirus'
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
where mk.slug = 'kia' and vm.slug = 'kia-opirus'
on conflict (model_id, slug) do nothing;

-- kia/kia-ev5 → Kia_EV5 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023), body_type = coalesce(body_type, 'suv')
where slug = 'kia-ev5'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-sonet → Kia_Sonet (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2020), body_type = coalesce(body_type, 'suv')
where slug = 'kia-sonet'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele',
       '1.0 L ELECTRIC',
       null,
       null,
       1000,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-sonet'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-g12',
       '1.2 L G1.2',
       null,
       null,
       1200,
       null,
       null,
       null,
       'G1.2'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-sonet'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-g15',
       '1.5 L G1.5',
       null,
       null,
       1500,
       null,
       null,
       null,
       'G1.5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-sonet'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-die-d15',
       '1.5 L D1.5 Diesel',
       null,
       null,
       1500,
       'diesel',
       null,
       null,
       'D1.5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-sonet'
on conflict (model_id, slug) do nothing;

-- kia/kia-enterprise → Kia_Enterprise (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), year_to = coalesce(year_to, 1999)
where slug = 'kia-enterprise'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-joice → Kia_Joice (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2002), body_type = coalesce(body_type, 'estate')
where slug = 'kia-joice'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-joice'
on conflict (model_id, slug) do nothing;

-- kia/kia-concord → Kia_Concord (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1987)
where slug = 'kia-concord'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-concord'
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
where mk.slug = 'kia' and vm.slug = 'kia-concord'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-lpg',
       '1.8 L LPG',
       null,
       null,
       1800,
       'lpg',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-concord'
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
where mk.slug = 'kia' and vm.slug = 'kia-concord'
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
where mk.slug = 'kia' and vm.slug = 'kia-concord'
on conflict (model_id, slug) do nothing;

-- kia/kia-ev4 → Kia_EV4 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2025), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-ev4'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-niro → Kia_Niro (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), body_type = coalesce(body_type, 'suv')
where slug = 'kia-niro'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-morning → Kia_Picanto (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003)
where slug = 'kia-morning'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-forte → Kia_Forte (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), year_to = coalesce(year_to, 2024)
where slug = 'kia-forte'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-naimo → Kia_Naimo (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011), body_type = coalesce(body_type, 'hatchback')
where slug = 'kia-naimo'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-k8 → Kia_K8 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-k8'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-g25',
       '2.5 L G2.5',
       null,
       null,
       2500,
       null,
       null,
       null,
       'G2.5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-k8'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-g35',
       '3.5 L G3.5',
       null,
       null,
       3500,
       null,
       null,
       null,
       'G3.5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-k8'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-g16',
       '1.6 L G1.6',
       null,
       null,
       1600,
       null,
       null,
       null,
       'G1.6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-k8'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-l35',
       '3.5 L L3.5',
       null,
       null,
       3500,
       null,
       null,
       null,
       'L3.5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-k8'
on conflict (model_id, slug) do nothing;

-- kia/km131-jeep → K131_jeep (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997)
where slug = 'km131-jeep'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'km131-jeep'
on conflict (model_id, slug) do nothing;

-- kia/kia-granbird → Kia_Granbird (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994)
where slug = 'kia-granbird'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-ev3 → Kia_EV3 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2024), body_type = coalesce(body_type, 'suv')
where slug = 'kia-ev3'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-venga → Kia_Venga (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), year_to = coalesce(year_to, 2019), body_type = coalesce(body_type, 'hatchback')
where slug = 'kia-venga'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-venga'
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
where mk.slug = 'kia' and vm.slug = 'kia-venga'
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
where mk.slug = 'kia' and vm.slug = 'kia-venga'
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
where mk.slug = 'kia' and vm.slug = 'kia-venga'
on conflict (model_id, slug) do nothing;

-- kia/kia-k9 → Kia_K9 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-k9'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-stonic → Kia_Stonic (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017), body_type = coalesce(body_type, 'suv')
where slug = 'kia-stonic'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele',
       '1.0 L ELECTRIC',
       null,
       null,
       1000,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-stonic'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele-g10',
       '1.0 L G1.0 ELECTRIC',
       null,
       null,
       1000,
       'electric',
       null,
       null,
       'G1.0'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-stonic'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'kia' and vm.slug = 'kia-stonic'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-g12',
       '1.2 L G1.2',
       null,
       null,
       1200,
       null,
       null,
       null,
       'G1.2'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-stonic'
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
where mk.slug = 'kia' and vm.slug = 'kia-stonic'
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
where mk.slug = 'kia' and vm.slug = 'kia-stonic'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die-d16',
       '1.6 L D1.6 Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       'D1.6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-stonic'
on conflict (model_id, slug) do nothing;

-- kia/kia-carens → Kia_Carens (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2019)
where slug = 'kia-carens'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-carnival → Kia_Carnival (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), body_type = coalesce(body_type, 'mpv')
where slug = 'kia-carnival'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-credos → Kia_Credos (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), year_to = coalesce(year_to, 2001), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-credos'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-t8d',
       '1.8 L T8D',
       null,
       null,
       1800,
       null,
       null,
       null,
       'T8D'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-credos'
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
where mk.slug = 'kia' and vm.slug = 'kia-credos'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-kv6',
       '2.5 L KV6',
       null,
       null,
       2500,
       null,
       null,
       null,
       'KV6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-credos'
on conflict (model_id, slug) do nothing;

-- kia/kia-gt → Kia_GT_Concept (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-gt'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-gt'
on conflict (model_id, slug) do nothing;

-- kia/kia-k7-cadenza → Kia_Cadenza (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-k7-cadenza'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-sephia → Kia_Sephia (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), year_to = coalesce(year_to, 2003)
where slug = 'kia-sephia'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-ev6 → Kia_EV6 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021), body_type = coalesce(body_type, 'suv')
where slug = 'kia-ev6'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-seltos → Kia_Seltos (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2019), body_type = coalesce(body_type, 'suv')
where slug = 'kia-seltos'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-stinger → Kia_Stinger (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-stinger'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-stinger'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-g25',
       '2.5 L G2.5',
       null,
       null,
       2500,
       null,
       null,
       null,
       'G2.5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-stinger'
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
where mk.slug = 'kia' and vm.slug = 'kia-stinger'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-die',
       '2.2 L Diesel',
       null,
       null,
       2200,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-stinger'
on conflict (model_id, slug) do nothing;

-- kia/kia-mohave → Kia_Mohave (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), year_to = coalesce(year_to, 2024), body_type = coalesce(body_type, 'suv')
where slug = 'kia-mohave'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-mohave'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-6l',
       '4.6 L',
       null,
       null,
       4600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-mohave'
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
where mk.slug = 'kia' and vm.slug = 'kia-mohave'
on conflict (model_id, slug) do nothing;

-- kia/kia-niro-ev → Kia_e-Niro (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), body_type = coalesce(body_type, 'suv')
where slug = 'kia-niro-ev'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-potentia → Kia_Potentia (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966), year_to = coalesce(year_to, 1991)
where slug = 'kia-potentia'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-k5 → Kia_K5 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000)
where slug = 'kia-k5'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-besta → Kia_Besta (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1980), body_type = coalesce(body_type, 'pickup')
where slug = 'kia-besta'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-bongo → Kia_Bongo (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1980), body_type = coalesce(body_type, 'pickup')
where slug = 'kia-bongo'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-telluride → Kia_Telluride (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2019), body_type = coalesce(body_type, 'suv')
where slug = 'kia-telluride'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-heart → Kia_Soul (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), year_to = coalesce(year_to, 2025), body_type = coalesce(body_type, 'hatchback')
where slug = 'kia-heart'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-sportage → Kia_Sportage (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1993), body_type = coalesce(body_type, 'convertible')
where slug = 'kia-sportage'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-k4 → Kia_K4_(China) (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), year_to = coalesce(year_to, 2020), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-k4'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-k4'
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
where mk.slug = 'kia' and vm.slug = 'kia-k4'
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
where mk.slug = 'kia' and vm.slug = 'kia-k4'
on conflict (model_id, slug) do nothing;

-- kia/kia-pv5 → Kia_PV5 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2025), body_type = coalesce(body_type, 'mpv')
where slug = 'kia-pv5'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-k3-2023 → Kia_K3_(BL7) (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-k3-2023'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
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
where mk.slug = 'kia' and vm.slug = 'kia-k3-2023'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-g16',
       '1.6 L G1.6',
       null,
       null,
       1600,
       null,
       null,
       null,
       'G1.6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-k3-2023'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-g20',
       '2.0 L G2.0',
       null,
       null,
       2000,
       null,
       null,
       null,
       'G2.0'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-k3-2023'
on conflict (model_id, slug) do nothing;

-- kia/kia-tasman → Kia_Tasman (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2025)
where slug = 'kia-tasman'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-g25',
       '2.5 L G2.5',
       null,
       null,
       2500,
       null,
       null,
       null,
       'G2.5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-tasman'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-die-d22',
       '2.2 L D2.2 Diesel',
       null,
       null,
       2200,
       'diesel',
       null,
       null,
       'D2.2'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-tasman'
on conflict (model_id, slug) do nothing;

-- kia/kia-cerato → Kia_Cerato (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), year_to = coalesce(year_to, 2024), body_type = coalesce(body_type, 'sedan')
where slug = 'kia-cerato'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-sorento → Kia_Sorento (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), body_type = coalesce(body_type, 'suv')
where slug = 'kia-sorento'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');

-- kia/kia-combi → Kia_Combi (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1983), year_to = coalesce(year_to, 2002)
where slug = 'kia-combi'
  and make_id = (select id from public.vehicle_makes where slug = 'kia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-die',
       '1.0 L Diesel',
       null,
       null,
       977,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-combi'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-3l-die-d4al',
       '0.3 L D4AL Diesel',
       null,
       null,
       296,
       'diesel',
       null,
       null,
       'D4AL'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-combi'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-die',
       '0.7 L Diesel',
       null,
       null,
       749,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-combi'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l-die-d4da',
       '0.9 L D4DA Diesel',
       null,
       null,
       907,
       'diesel',
       null,
       null,
       'D4DA'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-combi'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l-die',
       '0.1 L Diesel',
       null,
       null,
       52,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'kia' and vm.slug = 'kia-combi'
on conflict (model_id, slug) do nothing;

-- chevrolet/chevrolet-miray → Chevrolet_Miray (1 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'roadster')
where slug = 'chevrolet-miray'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');
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
where mk.slug = 'chevrolet' and vm.slug = 'chevrolet-miray'
on conflict (model_id, slug) do nothing;

-- chevrolet/chevrolet-adra → Chevrolet_Adra (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014)
where slug = 'chevrolet-adra'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');

-- chevrolet/powerglide → Powerglide (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1950), year_to = coalesce(year_to, 1973)
where slug = 'powerglide'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');

-- chevrolet/chevrolet-cruze → Chevrolet_Cruze (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), year_to = coalesce(year_to, 2023)
where slug = 'chevrolet-cruze'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');

-- chevrolet/chevrolet-series-h → Chevrolet_Series_H (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1914), year_to = coalesce(year_to, 1916), body_type = coalesce(body_type, 'roadster')
where slug = 'chevrolet-series-h'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '18kw',
       '18kW',
       18,
       24,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'chevrolet' and vm.slug = 'chevrolet-series-h'
on conflict (model_id, slug) do nothing;

-- chevrolet/chevrolet-straight-6-engine → Chevrolet_Stovebolt_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1929), year_to = coalesce(year_to, 1962)
where slug = 'chevrolet-straight-6-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');

-- chevrolet/chevrolet-kodiak → Chevrolet_Kodiak (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1980), year_to = coalesce(year_to, 2009)
where slug = 'chevrolet-kodiak'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');

-- chevrolet/chevrolet-camaro → Chevrolet_Camaro_(sixth_generation) (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2015), body_type = coalesce(body_type, 'convertible')
where slug = 'chevrolet-camaro'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');
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
where mk.slug = 'chevrolet' and vm.slug = 'chevrolet-camaro'
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
where mk.slug = 'chevrolet' and vm.slug = 'chevrolet-camaro'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-2l-lt1',
       '6.2 L LT1',
       null,
       null,
       6200,
       null,
       null,
       null,
       'LT1'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'chevrolet' and vm.slug = 'chevrolet-camaro'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-2l-lt4',
       '6.2 L LT4',
       null,
       null,
       6200,
       null,
       null,
       null,
       'LT4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'chevrolet' and vm.slug = 'chevrolet-camaro'
on conflict (model_id, slug) do nothing;

-- chevrolet/chevrolet-code-130r-concept → Chevrolet_Code_130R (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), body_type = coalesce(body_type, 'coupe')
where slug = 'chevrolet-code-130r-concept'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');
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
where mk.slug = 'chevrolet' and vm.slug = 'chevrolet-code-130r-concept'
on conflict (model_id, slug) do nothing;

-- chevrolet/chevrolet-equinox-ev → Chevrolet_Equinox_EV (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2024), body_type = coalesce(body_type, 'suv')
where slug = 'chevrolet-equinox-ev'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');

-- chevrolet/chevrolet-turbo-titan-iii → Chevrolet_Turbo_Titan_III (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965)
where slug = 'chevrolet-turbo-titan-iii'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');

-- chevrolet/chevrolet-silverado-ev → Chevrolet_Silverado_EV (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023), body_type = coalesce(body_type, 'pickup')
where slug = 'chevrolet-silverado-ev'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');

-- chevrolet/chevrolet-tru-140s → Chevrolet_Tru_140S (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), body_type = coalesce(body_type, 'coupe')
where slug = 'chevrolet-tru-140s'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');
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
where mk.slug = 'chevrolet' and vm.slug = 'chevrolet-tru-140s'
on conflict (model_id, slug) do nothing;

-- chevrolet/chevrolet-series-f → Chevrolet_Series_F (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1917), body_type = coalesce(body_type, 'roadster')
where slug = 'chevrolet-series-f'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '18kw',
       '18kW',
       18,
       24,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'chevrolet' and vm.slug = 'chevrolet-series-f'
on conflict (model_id, slug) do nothing;

-- chevrolet/rpo-zr2 → RPO_ZR2 (0 engines)

-- chevrolet/chevrolet-ak-series → Chevrolet_AK_Series (0 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'estate')
where slug = 'chevrolet-ak-series'
  and make_id = (select id from public.vehicle_makes where slug = 'chevrolet');

-- volvo/volvo-ycc → Volvo_YCC (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), body_type = coalesce(body_type, 'coupe')
where slug = 'volvo-ycc'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
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
where mk.slug = 'volvo' and vm.slug = 'volvo-ycc'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-p1800 → Volvo_P1800 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1961), year_to = coalesce(year_to, 1973), body_type = coalesce(body_type, 'coupe')
where slug = 'volvo-p1800'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-b18',
       '0.8 L B18',
       null,
       null,
       778,
       null,
       null,
       null,
       'B18'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-p1800'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-es90 → Volvo_ES90 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2025), body_type = coalesce(body_type, 'hatchback')
where slug = 'volvo-es90'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-480 → Volvo_480 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 1995)
where slug = 'volvo-480'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l-f3n',
       '1.7 L F3N',
       null,
       null,
       1700,
       null,
       null,
       null,
       'F3N'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-480'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-f3r',
       '2.0 L F3R',
       null,
       null,
       2000,
       null,
       null,
       null,
       'F3R'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-480'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-200-series → Volvo_200_Series (9 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1974), year_to = coalesce(year_to, 1993), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-200-series'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-b17',
       '1.8 L B17',
       null,
       null,
       1800,
       null,
       null,
       null,
       'B17'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-200-series'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-b20',
       '2.0 L B20',
       null,
       null,
       2000,
       null,
       null,
       null,
       'B20'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-200-series'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-b19',
       '2.0 L B19',
       null,
       null,
       2000,
       null,
       null,
       null,
       'B19'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-200-series'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-b21',
       '2.1 L B21',
       null,
       null,
       2100,
       null,
       null,
       null,
       'B21'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-200-series'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-b23',
       '2.3 L B23',
       null,
       null,
       2300,
       null,
       null,
       null,
       'B23'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-200-series'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l-b27',
       '2.7 L B27',
       null,
       null,
       2700,
       null,
       null,
       null,
       'B27'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-200-series'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-8l-b28',
       '2.8 L B28',
       null,
       null,
       2800,
       null,
       null,
       null,
       'B28'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-200-series'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-d20',
       '2.0 L D20',
       null,
       null,
       2000,
       null,
       null,
       null,
       'D20'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-200-series'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-d24',
       '2.4 L D24',
       null,
       null,
       2400,
       null,
       null,
       null,
       'D24'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-200-series'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-262c → Volvo_262C (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1977), year_to = coalesce(year_to, 1981)
where slug = 'volvo-262c'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l',
       '2.7 L',
       null,
       null,
       2664,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-262c'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-300-series → Volvo_300_Series (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1976), body_type = coalesce(body_type, 'hatchback')
where slug = 'volvo-300-series'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1289,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-300-series'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-760 → Volvo_760 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1982), year_to = coalesce(year_to, 1992)
where slug = 'volvo-760'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-c40 → Volvo_C40 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017), body_type = coalesce(body_type, 'suv')
where slug = 'volvo-c40'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-ele-b3154',
       '1.5 L B3154 ELECTRIC',
       null,
       null,
       1500,
       'electric',
       null,
       null,
       'B3154'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-c40'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-b4204',
       '2.0 L B4204',
       null,
       null,
       2000,
       null,
       null,
       null,
       'B4204'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-c40'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-ele-b3154t5',
       '1.5 L B3154T5 ELECTRIC',
       null,
       null,
       1500,
       'electric',
       null,
       null,
       'B3154T5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-c40'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-d4204',
       '2.0 L D4204',
       null,
       null,
       2000,
       null,
       null,
       null,
       'D4204'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-c40'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-v60 → Volvo_V60 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'estate')
where slug = 'volvo-v60'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-p1900 → Volvo_P1900 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1956), body_type = coalesce(body_type, 'roadster')
where slug = 'volvo-p1900'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-b14',
       '1.4 L B14',
       null,
       null,
       1414,
       null,
       null,
       null,
       'B14'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-p1900'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-vesc → Volvo_VESC (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1972), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-vesc'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-164 → Volvo_164 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-164'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-b30',
       '3.0 L B30',
       null,
       null,
       3000,
       null,
       null,
       null,
       'B30'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-164'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-s80 → Volvo_S80 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2016), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-s80'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-xc40 → Volvo_XC40 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017), body_type = coalesce(body_type, 'suv')
where slug = 'volvo-xc40'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-ele-b3154',
       '1.5 L B3154 ELECTRIC',
       null,
       null,
       1500,
       'electric',
       null,
       null,
       'B3154'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-xc40'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-b4204',
       '2.0 L B4204',
       null,
       null,
       2000,
       null,
       null,
       null,
       'B4204'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-xc40'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-ele-b3154t5',
       '1.5 L B3154T5 ELECTRIC',
       null,
       null,
       1500,
       'electric',
       null,
       null,
       'B3154T5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-xc40'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-d4204',
       '2.0 L D4204',
       null,
       null,
       2000,
       null,
       null,
       null,
       'D4204'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-xc40'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-s90 → Volvo_S90 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), year_to = coalesce(year_to, 2024), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-s90'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-scc → Volvo_SCC (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), body_type = coalesce(body_type, 'hatchback')
where slug = 'volvo-scc'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-66 → Volvo_66 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975), year_to = coalesce(year_to, 1980), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-66'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-b110',
       '1.1 L B110',
       null,
       null,
       1100,
       null,
       null,
       null,
       'B110'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-66'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-b130',
       '1.3 L B130',
       null,
       null,
       1300,
       null,
       null,
       null,
       'B130'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-66'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-duett → Volvo_Duett (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1953), body_type = coalesce(body_type, 'estate')
where slug = 'volvo-duett'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-b18a',
       '1.8 L B18A',
       null,
       null,
       1800,
       null,
       null,
       null,
       'B18A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-duett'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-philip → Volvo_Philip (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1952), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-philip'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-6l-b8b',
       '3.6 L B8B',
       null,
       null,
       3600,
       null,
       null,
       null,
       'B8B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-philip'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-460 → Volvo_460 (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1988), body_type = coalesce(body_type, 'hatchback')
where slug = 'volvo-460'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-b16f',
       '1.6 L B16F',
       null,
       null,
       1600,
       null,
       null,
       null,
       'B16F'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-460'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l-b18f',
       '1.7 L B18F',
       null,
       null,
       1700,
       null,
       null,
       null,
       'B18F'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-460'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l-b18ft',
       '1.7 L B18FT',
       null,
       null,
       1700,
       null,
       null,
       null,
       'B18FT'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-460'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-f3p',
       '1.8 L F3P',
       null,
       null,
       1800,
       null,
       null,
       null,
       'F3P'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-460'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-f3r',
       '2.0 L F3R',
       null,
       null,
       2000,
       null,
       null,
       null,
       'F3R'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-460'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-f8q',
       '1.9 L F8Q',
       null,
       null,
       1900,
       null,
       null,
       null,
       'F8Q'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-460'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-740 → Volvo_740 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1982), year_to = coalesce(year_to, 1992)
where slug = 'volvo-740'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-pv650-series → Volvo_PV650_Series (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1929), year_to = coalesce(year_to, 1937), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-pv650-series'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-concept-you → Volvo_Concept_You (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-concept-you'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
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
where mk.slug = 'volvo' and vm.slug = 'volvo-concept-you'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-ex90 → Volvo_EX90 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2024), body_type = coalesce(body_type, 'suv')
where slug = 'volvo-ex90'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-s40 → Volvo_S40 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), year_to = coalesce(year_to, 2012)
where slug = 'volvo-s40'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-c70 → Volvo_C70 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2013), body_type = coalesce(body_type, 'convertible')
where slug = 'volvo-c70'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-pv-60 → Volvo_PV_60 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1946), year_to = coalesce(year_to, 1950), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-pv-60'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-7l',
       '3.7 L',
       null,
       null,
       3670,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-pv-60'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-ex60 → Volvo_EX60 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2026), body_type = coalesce(body_type, 'suv')
where slug = 'volvo-ex60'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-850 → Volvo_850 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), year_to = coalesce(year_to, 1997), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-850'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-s60 → Volvo_S60 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), year_to = coalesce(year_to, 2024), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-s60'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-amazon → Volvo_Amazon (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1956), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-amazon'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-b4b',
       '1.6 L B4B',
       null,
       null,
       1583,
       null,
       null,
       null,
       'B4B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-amazon'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-xc60 → Volvo_XC60 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), body_type = coalesce(body_type, 'suv')
where slug = 'volvo-xc60'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-lcp2000 → Volvo_LCP2000 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1983), body_type = coalesce(body_type, 'hatchback')
where slug = 'volvo-lcp2000'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1279,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-lcp2000'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-pv51 → Volvo_PV51 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1936), year_to = coalesce(year_to, 1945), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-pv51'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-7l',
       '3.7 L',
       null,
       null,
       3670,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-pv51'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-gtz → Volvo_GTZ (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1969), body_type = coalesce(body_type, 'coupe')
where slug = 'volvo-gtz'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-b20',
       '2.0 L B20',
       null,
       null,
       2000,
       null,
       null,
       null,
       'B20'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-gtz'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-concept-xc-coupe → Volvo_Concept_XC_Coupe (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), body_type = coalesce(body_type, 'suv')
where slug = 'volvo-concept-xc-coupe'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
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
where mk.slug = 'volvo' and vm.slug = 'volvo-concept-xc-coupe'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-140-series → Volvo_140_Series (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-140-series'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-b18',
       '1.8 L B18',
       null,
       null,
       1800,
       null,
       null,
       null,
       'B18'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-140-series'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-em90 → Volvo_EM90 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2024), body_type = coalesce(body_type, 'mpv')
where slug = 'volvo-em90'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-pv444 → Volvo_PV444/544 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1944), year_to = coalesce(year_to, 1965)
where slug = 'volvo-pv444'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-venus-bilo → Volvo_Venus_Bilo (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1933), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-venus-bilo'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-v50 → Volvo_V50 (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), year_to = coalesce(year_to, 2012), body_type = coalesce(body_type, 'estate')
where slug = 'volvo-v50'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
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
where mk.slug = 'volvo' and vm.slug = 'volvo-v50'
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
where mk.slug = 'volvo' and vm.slug = 'volvo-v50'
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
where mk.slug = 'volvo' and vm.slug = 'volvo-v50'
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
where mk.slug = 'volvo' and vm.slug = 'volvo-v50'
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
where mk.slug = 'volvo' and vm.slug = 'volvo-v50'
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
where mk.slug = 'volvo' and vm.slug = 'volvo-v50'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-v40 → Volvo_V40_(2012–2019) (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), year_to = coalesce(year_to, 2019), body_type = coalesce(body_type, 'hatchback')
where slug = 'volvo-v40'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
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
where mk.slug = 'volvo' and vm.slug = 'volvo-v40'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-b5204t9',
       '2.0 L B5204T9',
       null,
       null,
       2000,
       null,
       null,
       null,
       'B5204T9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-v40'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-vep4',
       '1.5 L VEP4',
       null,
       null,
       1500,
       null,
       null,
       null,
       'VEP4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-v40'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-vep4',
       '2.0 L VEP4',
       null,
       null,
       2000,
       null,
       null,
       null,
       'VEP4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-v40'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-dv6',
       '1.6 L DV6',
       null,
       null,
       1600,
       null,
       null,
       null,
       'DV6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-v40'
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
where mk.slug = 'volvo' and vm.slug = 'volvo-v40'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-ved4',
       '2.0 L VED4',
       null,
       null,
       2000,
       null,
       null,
       null,
       'VED4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-v40'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-v70 → Volvo_V70 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2016), body_type = coalesce(body_type, 'estate')
where slug = 'volvo-v70'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-pv-36-carioca → Volvo_PV_36_Carioca (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1935), year_to = coalesce(year_to, 1938), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-pv-36-carioca'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-7l',
       '3.7 L',
       null,
       null,
       3670,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-pv-36-carioca'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-concept-coupe → Volvo_Concept_Coupe (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), body_type = coalesce(body_type, 'coupe')
where slug = 'volvo-concept-coupe'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
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
where mk.slug = 'volvo' and vm.slug = 'volvo-concept-coupe'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-900-series → Volvo_900_Series (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1990), year_to = coalesce(year_to, 1998)
where slug = 'volvo-900-series'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-v90 → Volvo_V90 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), year_to = coalesce(year_to, 2025), body_type = coalesce(body_type, 'estate')
where slug = 'volvo-v90'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-b18-engine → Volvo_B18_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1961), year_to = coalesce(year_to, 1968)
where slug = 'volvo-b18-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-ov-4 → Volvo_ÖV_4 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1927), body_type = coalesce(body_type, 'estate')
where slug = 'volvo-ov-4'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
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
where mk.slug = 'volvo' and vm.slug = 'volvo-ov-4'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-tundra → Volvo_Tundra (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1979), body_type = coalesce(body_type, 'hatchback')
where slug = 'volvo-tundra'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-b14',
       '1.4 L B14',
       null,
       null,
       1397,
       null,
       null,
       null,
       'B14'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-tundra'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-recharge → Volvo_Recharge (0 engines)

-- volvo/volvo-concept-estate → Volvo_Concept_Estate (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), body_type = coalesce(body_type, 'estate')
where slug = 'volvo-concept-estate'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
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
where mk.slug = 'volvo' and vm.slug = 'volvo-concept-estate'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-s70 → Volvo_S70 (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2000), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-s70'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
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
where mk.slug = 'volvo' and vm.slug = 'volvo-s70'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-pet',
       '2.3 L',
       null,
       null,
       2300,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-s70'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-pet',
       '2.4 L',
       null,
       null,
       2400,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-s70'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'volvo' and vm.slug = 'volvo-s70'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-die-d5252t',
       '2.5 L D5252T Diesel',
       null,
       null,
       2500,
       'diesel',
       null,
       null,
       'D5252T'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-s70'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-c30 → Volvo_C30 (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2013), body_type = coalesce(body_type, 'hatchback')
where slug = 'volvo-c30'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
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
where mk.slug = 'volvo' and vm.slug = 'volvo-c30'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-l8-de',
       '1.8 L L8-DE',
       null,
       null,
       1800,
       null,
       null,
       null,
       'L8-DE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-c30'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-l8-ve',
       '1.8 L L8-VE',
       null,
       null,
       1800,
       null,
       null,
       null,
       'L8-VE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-c30'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-b5244s',
       '2.4 L B5244S',
       null,
       null,
       2400,
       null,
       null,
       null,
       'B5244S'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-c30'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-b5254t',
       '2.5 L B5254T',
       null,
       null,
       2500,
       null,
       null,
       null,
       'B5254T'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-c30'
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
where mk.slug = 'volvo' and vm.slug = 'volvo-c30'
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
where mk.slug = 'volvo' and vm.slug = 'volvo-c30'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-pv800-series → Volvo_PV800_Series (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1938), year_to = coalesce(year_to, 1958), body_type = coalesce(body_type, 'sedan')
where slug = 'volvo-pv800-series'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-7l',
       '3.7 L',
       null,
       null,
       3670,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'volvo' and vm.slug = 'volvo-pv800-series'
on conflict (model_id, slug) do nothing;

-- volvo/volvo-ex30 → Volvo_EX30 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023), body_type = coalesce(body_type, 'hatchback')
where slug = 'volvo-ex30'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- volvo/volvo-xc90 → Volvo_XC90 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), body_type = coalesce(body_type, 'suv')
where slug = 'volvo-xc90'
  and make_id = (select id from public.vehicle_makes where slug = 'volvo');

-- dacia/dacia-supernova → Dacia_SupeRNova (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), body_type = coalesce(body_type, 'hatchback')
where slug = 'dacia-supernova'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
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
where mk.slug = 'dacia' and vm.slug = 'dacia-supernova'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-solenza → Dacia_Solenza (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), body_type = coalesce(body_type, 'hatchback')
where slug = 'dacia-solenza'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-pet-e7j',
       '1.4 L E7J',
       null,
       null,
       1400,
       'petrol',
       null,
       null,
       'E7J'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-solenza'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-die-f8q',
       '1.9 L F8Q Diesel',
       null,
       null,
       1900,
       'diesel',
       null,
       null,
       'F8Q'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-solenza'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-lodgy → Dacia_Lodgy (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), year_to = coalesce(year_to, 2024), body_type = coalesce(body_type, 'mpv')
where slug = 'dacia-lodgy'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
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
where mk.slug = 'dacia' and vm.slug = 'dacia-lodgy'
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
where mk.slug = 'dacia' and vm.slug = 'dacia-lodgy'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-k7m',
       '1.6 L K7M',
       null,
       null,
       1600,
       null,
       null,
       null,
       'K7M'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-lodgy'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-die-k9k',
       '1.5 L K9K Diesel',
       null,
       null,
       1500,
       'diesel',
       null,
       null,
       'K9K'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-lodgy'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-pick-up → Dacia_Pick-Up (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975), year_to = coalesce(year_to, 2006)
where slug = 'dacia-pick-up'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
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
where mk.slug = 'dacia' and vm.slug = 'dacia-pick-up'
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
where mk.slug = 'dacia' and vm.slug = 'dacia-pick-up'
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
where mk.slug = 'dacia' and vm.slug = 'dacia-pick-up'
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
where mk.slug = 'dacia' and vm.slug = 'dacia-pick-up'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-1300 → Dacia_1300 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1969), year_to = coalesce(year_to, 1984), body_type = coalesce(body_type, 'sedan')
where slug = 'dacia-1300'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
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
where mk.slug = 'dacia' and vm.slug = 'dacia-1300'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-logan-iii → Renault_Taliant (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004)
where slug = 'dacia-logan-iii'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');

-- dacia/dacia-nova → Dacia_Nova (0 engines)

-- dacia/dacia-1100 → Dacia_1100 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968), year_to = coalesce(year_to, 1971), body_type = coalesce(body_type, 'sedan')
where slug = 'dacia-1100'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
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
where mk.slug = 'dacia' and vm.slug = 'dacia-1100'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-manifesto → Dacia_Manifesto (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2022)
where slug = 'dacia-manifesto'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');

-- dacia/dacia-dokker → Dacia_Dokker (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), year_to = coalesce(year_to, 2021), body_type = coalesce(body_type, 'pickup')
where slug = 'dacia-dokker'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
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
where mk.slug = 'dacia' and vm.slug = 'dacia-dokker'
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
where mk.slug = 'dacia' and vm.slug = 'dacia-dokker'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-k7m',
       '1.6 L K7M',
       null,
       null,
       1600,
       null,
       null,
       null,
       'K7M'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-dokker'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-h4m',
       '1.6 L H4M',
       null,
       null,
       1600,
       null,
       null,
       null,
       'H4M'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-dokker'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-die-k9k',
       '1.5 L K9K Diesel',
       null,
       null,
       1500,
       'diesel',
       null,
       null,
       'K9K'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-dokker'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-sandero-iii → Dacia_Sandero_III (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), body_type = coalesce(body_type, 'hatchback')
where slug = 'dacia-sandero-iii'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');

-- dacia/renault-dusterdacia-duster → Dacia_Duster (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'suv')
where slug = 'renault-dusterdacia-duster'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');

-- dacia/dacia-bigster-concept → Dacia_Bigster_(concept_car) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021), body_type = coalesce(body_type, 'suv')
where slug = 'dacia-bigster-concept'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');

-- dacia/dacia-d33 → Dacia_D33 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997), body_type = coalesce(body_type, 'sedan')
where slug = 'dacia-d33'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');

-- dacia/dacia-1325 → Dacia_1325 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), year_to = coalesce(year_to, 1996), body_type = coalesce(body_type, 'hatchback')
where slug = 'dacia-1325'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
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
where mk.slug = 'dacia' and vm.slug = 'dacia-1325'
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
where mk.slug = 'dacia' and vm.slug = 'dacia-1325'
on conflict (model_id, slug) do nothing;

-- dacia/lada-largus → Lada_Largus (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), body_type = coalesce(body_type, 'estate')
where slug = 'lada-largus'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-pet-k4m',
       '1.6 L K4M',
       null,
       null,
       1600,
       'petrol',
       null,
       null,
       'K4M'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'lada-largus'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-spring → Dacia_Spring (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2015), body_type = coalesce(body_type, 'hatchback')
where slug = 'dacia-spring'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-ele-br08de',
       '0.8 L BR08DE ELECTRIC',
       null,
       null,
       799,
       'electric',
       null,
       null,
       'BR08DE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-spring'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele-br10de',
       '1.0 L BR10DE ELECTRIC',
       null,
       null,
       999,
       'electric',
       null,
       null,
       'BR10DE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-spring'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-1320 → Dacia_1320 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1979), year_to = coalesce(year_to, 2004), body_type = coalesce(body_type, 'sedan')
where slug = 'dacia-1320'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');

-- dacia/dacia-jogger → Dacia_Jogger (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021)
where slug = 'dacia-jogger'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele',
       '1.0 L ELECTRIC',
       null,
       null,
       1000,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-jogger'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-hyb-h4m',
       '1.6 L H4M HYBRID',
       null,
       null,
       1600,
       'hybrid',
       null,
       null,
       'H4M'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-jogger'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-die-k9k',
       '1.5 L K9K Diesel',
       null,
       null,
       1500,
       'diesel',
       null,
       null,
       'K9K'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-jogger'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-lastun → Dacia_Lăstun (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1988), year_to = coalesce(year_to, 1991), body_type = coalesce(body_type, 'hatchback')
where slug = 'dacia-lastun'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       500,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-lastun'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-duster-concept → Dacia_Duster_Concept (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), body_type = coalesce(body_type, 'suv')
where slug = 'dacia-duster-concept'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
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
where mk.slug = 'dacia' and vm.slug = 'dacia-duster-concept'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-bigster → Dacia_Bigster (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2024), body_type = coalesce(body_type, 'suv')
where slug = 'dacia-bigster'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');
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
where mk.slug = 'dacia' and vm.slug = 'dacia-bigster'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-hyb',
       '1.2 L HYBRID',
       null,
       null,
       1200,
       'hybrid',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-bigster'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-hyb',
       '1.8 L HYBRID',
       null,
       null,
       1800,
       'hybrid',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'dacia' and vm.slug = 'dacia-bigster'
on conflict (model_id, slug) do nothing;

-- dacia/dacia-sanderorenault-sandero → Dacia_Sandero (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), body_type = coalesce(body_type, 'hatchback')
where slug = 'dacia-sanderorenault-sandero'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');

-- dacia/dacia-logan → Dacia_Logan (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004)
where slug = 'dacia-logan'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');

-- dacia/dacia-1310 → Dacia_1310 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1979), year_to = coalesce(year_to, 2004), body_type = coalesce(body_type, 'sedan')
where slug = 'dacia-1310'
  and make_id = (select id from public.vehicle_makes where slug = 'dacia');

-- alfa-romeo/alfa-romeo-v6-engine → Alfa_Romeo_V6_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1979), year_to = coalesce(year_to, 2005)
where slug = 'alfa-romeo-v6-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'alfa-romeo');

-- alfa-romeo/alfa-romeo-gloria → Alfa_Romeo_Gloria (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-gloria'
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
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-gloria'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-85a → Alfa_Romeo_85A (0 engines)

-- alfa-romeo/alfa-romeo-147 → Alfa_Romeo_147 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), year_to = coalesce(year_to, 2010), body_type = coalesce(body_type, 'hatchback')
where slug = 'alfa-romeo-147'
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
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-147'
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
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-147'
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
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-147'
on conflict (model_id, slug) do nothing;

-- alfa-romeo/alfa-romeo-155 → Alfa_Romeo_155 (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), year_to = coalesce(year_to, 1998), body_type = coalesce(body_type, 'sedan')
where slug = 'alfa-romeo-155'
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
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-155'
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
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-155'
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
where mk.slug = 'alfa-romeo' and vm.slug = 'alfa-romeo-155'
on conflict (model_id, slug) do nothing;
