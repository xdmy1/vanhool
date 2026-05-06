-- Enrichment chunk 6/8
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-tud5',
       '1.5 L TUD5',
       null,
       null,
       1527,
       null,
       null,
       null,
       'TUD5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-ax'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-ami-6 → Citroën_Ami (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1961), year_to = coalesce(year_to, 1978), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-ami-6'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l',
       '0.6 L',
       null,
       null,
       602,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-ami-6'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       1015,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-ami-6'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-osee → Citroën_Osée (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001)
where slug = 'citroen-osee'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-osee'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-ds4 → DS_No._4 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-ds4'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-ele-eb2dts',
       '1.2 L EB2DTS ELECTRIC',
       null,
       null,
       1200,
       'electric',
       null,
       null,
       'EB2DTS'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-ds4'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-ep6fdt',
       '1.6 L EP6FDT',
       null,
       null,
       1600,
       null,
       null,
       null,
       'EP6FDT'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-ds4'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-dv5',
       '1.5 L DV5',
       null,
       null,
       1500,
       null,
       null,
       null,
       'DV5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-ds4'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-prototype-y → Citroën_Prototype_Y (0 engines)

-- citroen/citroen-7u → Citroën_7U (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1935), year_to = coalesce(year_to, 1938)
where slug = 'citroen-7u'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-7u'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-berlingo-electrique → Citroën_Berlingo_électrique (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2005)
where slug = 'citroen-berlingo-electrique'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-synergie → Citroën_Synergie (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), body_type = coalesce(body_type, 'mpv')
where slug = 'citroen-synergie'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c-airdream → Citroën_C-Airdream (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002)
where slug = 'citroen-c-airdream'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c-airdream'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-u23 → Citroën_U23 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1935), year_to = coalesce(year_to, 1969)
where slug = 'citroen-u23'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-pet',
       '1.9 L',
       null,
       null,
       1911,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-u23'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-die',
       '1.8 L Diesel',
       null,
       null,
       1767,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-u23'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-bx → Citroën_BX (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1982), year_to = coalesce(year_to, 1994), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-bx'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-die-tu3',
       '1.1 L TU3 Diesel',
       null,
       null,
       1124,
       'diesel',
       null,
       null,
       'TU3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-bx'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-g-engine → Mazda_G_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), year_to = coalesce(year_to, 2014)
where slug = 'mazda-g-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-chantez → Mazda_Chantez (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1972), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-chantez'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       359,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-chantez'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-cx-50 → Mazda_CX-50 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2022), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-50'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-50'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-50'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-a25a-fxs',
       '2.5 L A25A-FXS',
       null,
       null,
       2500,
       null,
       null,
       null,
       'A25A-FXS'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-50'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-a25d-fxs',
       '2.5 L A25D-FXS',
       null,
       null,
       2500,
       null,
       null,
       null,
       'A25D-FXS'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-50'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-takeri-concept → Mazda6_(third_generation) (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-takeri-concept'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-takeri-concept'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-takeri-concept'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-takeri-concept'
on conflict (model_id, slug) do nothing;

-- mazda/eunos-500 → Eunos_500 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), year_to = coalesce(year_to, 1999), body_type = coalesce(body_type, 'sedan')
where slug = 'eunos-500'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-b6-9',
       '1.6 L B6-9',
       null,
       null,
       1600,
       null,
       null,
       null,
       'B6-9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'eunos-500'
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
where mk.slug = 'mazda' and vm.slug = 'eunos-500'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-k8-ze',
       '1.8 L K8-ZE',
       null,
       null,
       1800,
       null,
       null,
       null,
       'K8-ZE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'eunos-500'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-kf-1',
       '2.0 L KF-1',
       null,
       null,
       2000,
       null,
       null,
       null,
       'KF-1'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'eunos-500'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-furai → Mazda_Furai (1 engines)
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-331kw-r20b',
       '2.0 L R20B 331kW',
       331,
       450,
       2000,
       null,
       null,
       null,
       'R20B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-furai'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-mx-81 → Mazda_MX-81 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), body_type = coalesce(body_type, 'hatchback')
where slug = 'mazda-mx-81'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-premacy-hydrogen-re-hybrid → Mazda_Premacy_Hydrogen_RE_Hybrid (0 engines)

-- mazda/mazda-nagare → Mazda_Nagare_(car_design) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2007)
where slug = 'mazda-nagare'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/efini-ms-8 → Ɛ̃fini_MS-8 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), year_to = coalesce(year_to, 1997), body_type = coalesce(body_type, 'sedan')
where slug = 'efini-ms-8'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'efini-ms-8'
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
where mk.slug = 'mazda' and vm.slug = 'efini-ms-8'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-bongo → Mazda_Bongo (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966), body_type = coalesce(body_type, 'van')
where slug = 'mazda-bongo'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-ibuki → Mazda_Ibuki (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), body_type = coalesce(body_type, 'roadster')
where slug = 'mazda-ibuki'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-ibuki'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-kabura → Mazda_Kabura (1 engines)
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
where mk.slug = 'mazda' and vm.slug = 'mazda-kabura'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-etude → Mazda_Étude (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1987)
where slug = 'mazda-etude'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1498,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-etude'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-b6d',
       '1.6 L B6D',
       null,
       null,
       1597,
       null,
       null,
       null,
       'B6D'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-etude'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-roadpacer-ap → Mazda_Roadpacer (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975), year_to = coalesce(year_to, 1977), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-roadpacer-ap'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-roadpacer-ap'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-b600 → Mazda_B600 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1961), body_type = coalesce(body_type, 'mpv')
where slug = 'mazda-b600'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       356,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-b600'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       358,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-b600'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l',
       '0.6 L',
       null,
       null,
       577,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-b600'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-r100 → Mazda_R100 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963), year_to = coalesce(year_to, 2003)
where slug = 'mazda-r100'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-rx-8-hydrogen-re → Mazda_RX-8_Hydrogen_RE (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003)
where slug = 'mazda-rx-8-hydrogen-re'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-rx-8-hydrogen-re'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-kazamai → Mazda_Kazamai (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-kazamai'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-kazamai'
on conflict (model_id, slug) do nothing;

-- mazda/mazda6 → Mazda6 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002)
where slug = 'mazda6'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mercury-tracer → Mercury_Tracer (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 1989)
where slug = 'mercury-tracer'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda2 → Mazda2 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002)
where slug = 'mazda2'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-cronos → Mazda_Cronos (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), year_to = coalesce(year_to, 2002)
where slug = 'mazda-cronos'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-biante → Mazda_Biante (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), body_type = coalesce(body_type, 'van')
where slug = 'mazda-biante'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-biante'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-biante'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-l3-ve',
       '2.3 L L3-VE',
       null,
       null,
       2300,
       null,
       null,
       null,
       'L3-VE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-biante'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-porter → Mazda_Porter (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1961), body_type = coalesce(body_type, 'mpv')
where slug = 'mazda-porter'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       356,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-porter'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       358,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-porter'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l',
       '0.6 L',
       null,
       null,
       577,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-porter'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-lantis → Mazda_Lantis (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1993), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-lantis'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-lantis'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-b6-d',
       '1.6 L B6-D',
       null,
       null,
       1600,
       null,
       null,
       null,
       'B6-D'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-lantis'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-lantis'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-lantis'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-hr-x → Mazda_HR-X (0 engines)

-- mazda/mazda-iconic-sp → Mazda_Iconic_SP (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023)
where slug = 'mazda-iconic-sp'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-kiyora → Mazda_Kiyora (1 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'hatchback')
where slug = 'mazda-kiyora'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-kiyora'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-chantez-ev → Mazda_Chantez_EV (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1972), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-chantez-ev'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       359,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-chantez-ev'
on conflict (model_id, slug) do nothing;

-- mazda/ford-cd3-platform → Ford_CD3_platform (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), year_to = coalesce(year_to, 2019)
where slug = 'ford-cd3-platform'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/autozam-revue → Autozam_Revue (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1990), year_to = coalesce(year_to, 1998), body_type = coalesce(body_type, 'sedan')
where slug = 'autozam-revue'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1100,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'autozam-revue'
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
where mk.slug = 'mazda' and vm.slug = 'autozam-revue'
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
where mk.slug = 'mazda' and vm.slug = 'autozam-revue'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-millenia → Mazda_Millenia (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1993), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-millenia'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-millenia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l',
       '2.3 L',
       null,
       null,
       2300,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-millenia'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-millenia'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-cx-9 → Mazda_CX-9 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2024), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-9'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-luce → Mazda_Luce (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966), year_to = coalesce(year_to, 1991)
where slug = 'mazda-luce'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-ryuga → Mazda_Ryuga (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007)
where slug = 'mazda-ryuga'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-e85',
       '2.5 L E85',
       null,
       null,
       2500,
       null,
       null,
       null,
       'E85'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-ryuga'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-929-coupe → Mazda_929_coupe (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1967), year_to = coalesce(year_to, 1995)
where slug = 'mazda-929-coupe'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazdaspeed3 → Mazdaspeed3 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), year_to = coalesce(year_to, 2013), body_type = coalesce(body_type, 'hatchback')
where slug = 'mazdaspeed3'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-pet-l3-vdt',
       '2.3 L L3-VDT',
       null,
       null,
       2300,
       'petrol',
       null,
       null,
       'L3-VDT'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazdaspeed3'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-cx-3 → Mazda_CX-3 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-3'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-pet-f-p5',
       '1.5 L F-P5',
       null,
       null,
       1500,
       'petrol',
       null,
       null,
       'F-P5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-3'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-3'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-s5-dpts',
       '1.5 L S5-DPTS',
       null,
       null,
       1500,
       null,
       null,
       null,
       'S5-DPTS'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-3'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-s8-dpts',
       '1.8 L S8-DPTS',
       null,
       null,
       1800,
       null,
       null,
       null,
       'S8-DPTS'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-3'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-rx-7 → Mazda_RX-7 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1978), year_to = coalesce(year_to, 2002)
where slug = 'mazda-rx-7'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda3 → Mazda3 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda3'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-navajo → Mazda_Navajo (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-navajo'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-navajo'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-taiki → Mazda_Taiki (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007)
where slug = 'mazda-taiki'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-taiki'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-cx-80 → Mazda_CX-80 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2024), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-80'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-3l-h3t',
       '3.3 L H3T',
       null,
       null,
       3300,
       null,
       null,
       null,
       'H3T'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-80'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-hyb',
       '2.5 L HYBRID',
       null,
       null,
       2500,
       'hybrid',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-80'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-3l-t3-vpts',
       '3.3 L T3-VPTS',
       null,
       null,
       3300,
       null,
       null,
       null,
       'T3-VPTS'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-80'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-az-offroad → Mazda_AZ-Offroad (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-az-offroad'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-tribute → Mazda_Tribute (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), year_to = coalesce(year_to, 2011), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-tribute'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-r360 → Mazda_R360 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1960)
where slug = 'mazda-r360'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       356,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-r360'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-rx-vision → Mazda_RX-Vision (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2015)
where slug = 'mazda-rx-vision'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-rx-vision'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-cx-90 → Mazda_CX-90 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-90'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-3l-h3t',
       '3.3 L H3T',
       null,
       null,
       3300,
       null,
       null,
       null,
       'H3T'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-90'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-hyb',
       '2.5 L HYBRID',
       null,
       null,
       2500,
       'hybrid',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-90'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-3l-t3-vpts',
       '3.3 L T3-VPTS',
       null,
       null,
       3300,
       null,
       null,
       null,
       'T3-VPTS'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-90'
on conflict (model_id, slug) do nothing;

-- mazda/ford-festiva → Ford_Festiva (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 2002)
where slug = 'ford-festiva'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-mxr-01 → Mazda_MXR-01 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992)
where slug = 'mazda-mxr-01'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-5l-gv10',
       '3.5 L GV10',
       null,
       null,
       3500,
       null,
       null,
       null,
       'GV10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mxr-01'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-cx-6e → Mazda_CX-6e (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2025), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-6e'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-jl473qj',
       '1.5 L JL473QJ',
       null,
       null,
       1500,
       null,
       null,
       null,
       'JL473QJ'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-6e'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-hakaze-concept → Mazda_Hakaze (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), body_type = coalesce(body_type, 'coupe')
where slug = 'mazda-hakaze-concept'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-hakaze-concept'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-xedos-6 → Mazda_Xedos_6 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), year_to = coalesce(year_to, 1999), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-xedos-6'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-b6-9',
       '1.6 L B6-9',
       null,
       null,
       1600,
       null,
       null,
       null,
       'B6-9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-xedos-6'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-xedos-6'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-k8-ze',
       '1.8 L K8-ZE',
       null,
       null,
       1800,
       null,
       null,
       null,
       'K8-ZE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-xedos-6'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-kf-1',
       '2.0 L KF-1',
       null,
       null,
       2000,
       null,
       null,
       null,
       'KF-1'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-xedos-6'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-6e → Mazda_6e (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2024), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-6e'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-jl473qj',
       '1.5 L JL473QJ',
       null,
       null,
       1500,
       null,
       null,
       null,
       'JL473QJ'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-6e'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-cx-8 → Mazda_CX-8 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-8'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-8'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-pet-i4-t',
       '2.5 L I4-T',
       null,
       null,
       2500,
       'petrol',
       null,
       null,
       'I4-T'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-8'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-i4-t',
       '2.2 L I4-T',
       null,
       null,
       2200,
       null,
       null,
       null,
       'I4-T'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-8'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-rx-500 → Mazda_RX-500 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970)
where slug = 'mazda-rx-500'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       982,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-rx-500'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-mx-30 → Mazda_MX-30 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2020), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-mx-30'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-hyb',
       '0.8 L HYBRID',
       null,
       null,
       830,
       'hybrid',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-30'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-pet',
       '2.0 L',
       null,
       null,
       1997,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-30'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-mx-5-na → Mazda_MX-5_(NA) (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), year_to = coalesce(year_to, 1997), body_type = coalesce(body_type, 'convertible')
where slug = 'mazda-mx-5-na'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l-b6ze',
       '0.6 L B6ZE',
       null,
       null,
       597,
       null,
       null,
       null,
       'B6ZE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-na'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l',
       '0.8 L',
       null,
       null,
       839,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-na'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-na'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-mx-3 → Mazda_MX-3 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991)
where slug = 'mazda-mx-3'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-b5-ze',
       '1.5 L B5-ZE',
       null,
       null,
       1500,
       null,
       null,
       null,
       'B5-ZE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-3'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-b6-me',
       '1.6 L B6-ME',
       null,
       null,
       1600,
       null,
       null,
       null,
       'B6-ME'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-3'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-b6d',
       '1.6 L B6D',
       null,
       null,
       1600,
       null,
       null,
       null,
       'B6D'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-3'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-3'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-323 → Mazda_323 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963), year_to = coalesce(year_to, 2003)
where slug = 'mazda-323'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-demio → Mazda_Demio (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2019)
where slug = 'mazda-demio'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-premacy → Mazda_Premacy (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2018)
where slug = 'mazda-premacy'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-mx-5-nd → Mazda_MX-5_(ND) (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2015), body_type = coalesce(body_type, 'convertible')
where slug = 'mazda-mx-5-nd'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-pet-p5-vps',
       '1.5 L P5-VPS',
       null,
       null,
       1500,
       'petrol',
       null,
       null,
       'P5-VPS'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-nd'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-nd'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-mx-5-nb → Mazda_MX-5_(NB) (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2005), body_type = coalesce(body_type, 'convertible')
where slug = 'mazda-mx-5-nb'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-b6-ze',
       '1.6 L B6-ZE',
       null,
       null,
       1600,
       null,
       null,
       null,
       'B6-ZE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-nb'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-bp-5a',
       '1.8 L BP-5A',
       null,
       null,
       1800,
       null,
       null,
       null,
       'BP-5A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-nb'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-bp-4w',
       '1.8 L BP-4W',
       null,
       null,
       1800,
       null,
       null,
       null,
       'BP-4W'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-nb'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-bp-z3',
       '1.8 L BP-Z3',
       null,
       null,
       1800,
       null,
       null,
       null,
       'BP-Z3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-nb'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-nb'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-mx-5-nc → Mazda_MX-5_(NC) (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005), year_to = coalesce(year_to, 2015), body_type = coalesce(body_type, 'convertible')
where slug = 'mazda-mx-5-nc'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-nc'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-mx-5-nc'
on conflict (model_id, slug) do nothing;

-- mazda/sao-penza → Sao_Penza (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963), year_to = coalesce(year_to, 2003)
where slug = 'sao-penza'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-verisa → Mazda_Verisa (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), body_type = coalesce(body_type, 'hatchback')
where slug = 'mazda-verisa'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/autozam-az-1 → Autozam_AZ-1 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1993), year_to = coalesce(year_to, 1994)
where slug = 'autozam-az-1'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'autozam-az-1'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-626 → Mazda_626 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), year_to = coalesce(year_to, 2002)
where slug = 'mazda-626'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-capella → Mazda_Capella (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), year_to = coalesce(year_to, 2002)
where slug = 'mazda-capella'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-cx-5 → Mazda_CX-5 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-5'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-mzr-engine → Mazda_MZR_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), year_to = coalesce(year_to, 2015)
where slug = 'mazda-mzr-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-cx-7 → Mazda_CX-7 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-7'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-pet-l3-vdt',
       '2.3 L L3-VDT',
       null,
       null,
       2300,
       'petrol',
       null,
       null,
       'L3-VDT'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-7'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-pet-l5-ve',
       '2.5 L L5-VE',
       null,
       null,
       2500,
       'petrol',
       null,
       null,
       'L5-VE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-7'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-7'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-cx-4 → Mazda_CX-4 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), year_to = coalesce(year_to, 2025), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-4'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-4'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-4'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-mpv → Mazda_MPV (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1988), year_to = coalesce(year_to, 2016)
where slug = 'mazda-mpv'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/ford-laser → Ford_Laser (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), year_to = coalesce(year_to, 2005)
where slug = 'ford-laser'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-929 → Mazda_929 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1973), year_to = coalesce(year_to, 1997)
where slug = 'mazda-929'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-shinari → Mazda_Shinari (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-shinari'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-shinari'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-shinari'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-cx-30 → Mazda_CX-30 (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2019), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-30'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-30'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-30'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-pet-i4',
       '2.5 L I4-',
       null,
       null,
       2500,
       'petrol',
       null,
       null,
       'I4-'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-30'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-30'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-30'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-spiano → Mazda_Spiano (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), body_type = coalesce(body_type, 'hatchback')
where slug = 'mazda-spiano'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-spiano'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-spiano'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-rx-792p → Mazda_RX-792P (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992)
where slug = 'mazda-rx-792p'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-6l-r26b',
       '2.6 L R26B',
       null,
       null,
       2600,
       null,
       null,
       null,
       'R26B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-rx-792p'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-titan → Mazda_Titan (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1971)
where slug = 'mazda-titan'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-cosmo → Mazda_Cosmo (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1967), year_to = coalesce(year_to, 1995)
where slug = 'mazda-cosmo'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-rx-9 → Mazda_RX-9 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966), year_to = coalesce(year_to, 1991)
where slug = 'mazda-rx-9'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-persona → Mazda_Persona (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1988), year_to = coalesce(year_to, 1992), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-persona'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1789,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-persona'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-grand-familia → Mazda_Grand_Familia (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1971), year_to = coalesce(year_to, 1978), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-grand-familia'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-st3av',
       '1.3 L ST3AV',
       null,
       null,
       1272,
       null,
       null,
       null,
       'ST3AV'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-grand-familia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-lpg-k303',
       '1.3 L K303 LPG',
       null,
       null,
       1272,
       'lpg',
       null,
       null,
       'K303'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-grand-familia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-su4',
       '1.5 L SU4',
       null,
       null,
       1490,
       null,
       null,
       null,
       'SU4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-grand-familia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-sn4',
       '1.6 L SN4',
       null,
       null,
       1586,
       null,
       null,
       null,
       'SN4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-grand-familia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       982,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-grand-familia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1146,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-grand-familia'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-b-series → Mazda_B_series (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1961), year_to = coalesce(year_to, 2006)
where slug = 'mazda-b-series'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-cx-60 → Mazda_CX-60 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2022), body_type = coalesce(body_type, 'suv')
where slug = 'mazda-cx-60'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-60'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-3l-h3t',
       '3.3 L H3T',
       null,
       null,
       3300,
       null,
       null,
       null,
       'H3T'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-60'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-hyb',
       '2.5 L HYBRID',
       null,
       null,
       2500,
       'hybrid',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-60'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-3l-t3-vpts',
       '3.3 L T3-VPTS',
       null,
       null,
       3300,
       null,
       null,
       null,
       'T3-VPTS'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-cx-60'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-mx-5 → Mazda_MX-5 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989)
where slug = 'mazda-mx-5'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-323f → Mazda_323F (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963), year_to = coalesce(year_to, 2003)
where slug = 'mazda-323f'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-mazdago → Mazda-Go (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1931), year_to = coalesce(year_to, 1938)
where slug = 'mazda-mazdago'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       482,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mazdago'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       669,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mazda' and vm.slug = 'mazda-mazdago'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-sentia → Mazda_Sentia (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), year_to = coalesce(year_to, 1999)
where slug = 'mazda-sentia'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-mx-6 → Mazda_MX-6 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1987), year_to = coalesce(year_to, 1997)
where slug = 'mazda-mx-6'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-az-wagon → Mazda_AZ-Wagon (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1993), body_type = coalesce(body_type, 'hatchback')
where slug = 'mazda-az-wagon'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-hazumi → Mazda_Hazumi (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002)
where slug = 'mazda-hazumi'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-rx-01 → Mazda_RX-01 (0 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'coupe')
where slug = 'mazda-rx-01'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-vision-coupe → Mazda_Vision_Coupe (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017)
where slug = 'mazda-vision-coupe'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-carol → Mazda_Carol (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1962), year_to = coalesce(year_to, 1970), body_type = coalesce(body_type, 'sedan')
where slug = 'mazda-carol'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-laputa → Mazda_Laputa (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2009), body_type = coalesce(body_type, 'hatchback')
where slug = 'mazda-laputa'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-laputa'
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
where mk.slug = 'mazda' and vm.slug = 'mazda-laputa'
on conflict (model_id, slug) do nothing;

-- mazda/mazda-familia → Mazda_Familia (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963), year_to = coalesce(year_to, 2003)
where slug = 'mazda-familia'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');

-- mazda/mazda-rx-8 → Mazda_RX-8 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003)
where slug = 'mazda-rx-8'
  and make_id = (select id from public.vehicle_makes where slug = 'mazda');
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
where mk.slug = 'mazda' and vm.slug = 'mazda-rx-8'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-px33 → Mitsubishi_PX33 (0 engines)

-- mitsubishi/mitsubishi-4m4-engine → Mitsubishi_4M4_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994)
where slug = 'mitsubishi-4m4-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-racing-lancer → Mitsubishi_Racing_Lancer (0 engines)

-- mitsubishi/mitsubishi-pistachio → Mitsubishi_Pistachio (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), body_type = coalesce(body_type, 'hatchback')
where slug = 'mitsubishi-pistachio'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1094,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-pistachio'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-diamante → Mitsubishi_Diamante (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1990), year_to = coalesce(year_to, 2005)
where slug = 'mitsubishi-diamante'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-delica → Mitsubishi_Delica (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968)
where slug = 'mitsubishi-delica'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-galant-vr-4 → Mitsubishi_Galant_VR-4 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1987), year_to = coalesce(year_to, 2002), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-galant-vr-4'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1997,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-galant-vr-4'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-galant-lambda → Mitsubishi_Galant_Lambda (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1976), year_to = coalesce(year_to, 1984)
where slug = 'mitsubishi-galant-lambda'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-starion → Mitsubishi_Starion (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1982), year_to = coalesce(year_to, 1989)
where slug = 'mitsubishi-starion'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-g63b',
       '2.0 L G63B',
       null,
       null,
       2000,
       null,
       null,
       null,
       'G63B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-starion'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-6l-g54b',
       '2.6 L G54B',
       null,
       null,
       2600,
       null,
       null,
       null,
       'G54B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-starion'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-triton → Mitsubishi_Triton (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1978)
where slug = 'mitsubishi-triton'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-magna → Mitsubishi_Magna (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1985), year_to = coalesce(year_to, 2005)
where slug = 'mitsubishi-magna'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-8a8-engine → Mitsubishi_8A8_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2008)
where slug = 'mitsubishi-8a8-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-dignity → Mitsubishi_Dignity (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2001)
where slug = 'mitsubishi-dignity'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-ek → Mitsubishi_eK (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), body_type = coalesce(body_type, 'hatchback')
where slug = 'mitsubishi-ek'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-proudia → Mitsubishi_Proudia (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2001), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-proudia'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-mirage → Mitsubishi_Mirage (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1978), year_to = coalesce(year_to, 2003)
where slug = 'mitsubishi-mirage'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-3g8-engine → Mitsubishi_3G8_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1987)
where slug = 'mitsubishi-3g8-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-6b3-engine → Mitsubishi_6B3_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005), year_to = coalesce(year_to, 2021)
where slug = 'mitsubishi-6b3-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-6a1-engine → Mitsubishi_6A1_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), year_to = coalesce(year_to, 2009)
where slug = 'mitsubishi-6a1-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-vulcan-engine → Mitsubishi_Vulcan_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1972), year_to = coalesce(year_to, 1989)
where slug = 'mitsubishi-vulcan-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-astron-engine → Mitsubishi_Astron_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1972), year_to = coalesce(year_to, 2023)
where slug = 'mitsubishi-astron-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-galant → Mitsubishi_Galant (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1969), year_to = coalesce(year_to, 2012)
where slug = 'mitsubishi-galant'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-pajero-mini → Mitsubishi_Pajero_Mini (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), year_to = coalesce(year_to, 2012), body_type = coalesce(body_type, 'suv')
where slug = 'mitsubishi-pajero-mini'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-4j1-engine → Mitsubishi_4J1_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011)
where slug = 'mitsubishi-4j1-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-me-engine → Mitsubishi_ME21/24_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1961)
where slug = 'mitsubishi-me-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-4b1-engine → Mitsubishi_4B1_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007)
where slug = 'mitsubishi-4b1-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-sirius-engine → Mitsubishi_Sirius_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1980), year_to = coalesce(year_to, 2013)
where slug = 'mitsubishi-sirius-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-hsr → Mitsubishi_HSR (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1987), body_type = coalesce(body_type, 'coupe')
where slug = 'mitsubishi-hsr'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-6g7-engine → Mitsubishi_6G7_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 2021)
where slug = 'mitsubishi-6g7-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-saturn-engine → Mitsubishi_Saturn_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1969), year_to = coalesce(year_to, 1999)
where slug = 'mitsubishi-saturn-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-orion-engine → Mitsubishi_Orion_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1977)
where slug = 'mitsubishi-orion-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-i → Mitsubishi_i (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2013), body_type = coalesce(body_type, 'hatchback')
where slug = 'mitsubishi-i'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-pet',
       '0.7 L',
       null,
       null,
       659,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-i'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-pajero → Mitsubishi_Pajero (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), year_to = coalesce(year_to, 2021)
where slug = 'mitsubishi-pajero'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-4a9-engine → Mitsubishi_4A9_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004)
where slug = 'mitsubishi-4a9-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-3b2-engine → Mitsubishi_3B2_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005), year_to = coalesce(year_to, 2020)
where slug = 'mitsubishi-3b2-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-fto → Mitsubishi_FTO (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), year_to = coalesce(year_to, 2000), body_type = coalesce(body_type, 'coupe')
where slug = 'mitsubishi-fto'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-fto'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-lancer → Mitsubishi_Lancer_(A70) (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1973), year_to = coalesce(year_to, 1979), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-lancer'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       187,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-lancer'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       238,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-lancer'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l-g11b',
       '0.2 L G11B',
       null,
       null,
       244,
       null,
       null,
       null,
       'G11B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-lancer'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l-g12b',
       '0.4 L G12B',
       null,
       null,
       410,
       null,
       null,
       null,
       'G12B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-lancer'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l-g33b',
       '0.4 L G33B',
       null,
       null,
       439,
       null,
       null,
       null,
       'G33B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-lancer'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l-g32b',
       '0.6 L G32B',
       null,
       null,
       597,
       null,
       null,
       null,
       'G32B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-lancer'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-g52b',
       '1.0 L G52B',
       null,
       null,
       995,
       null,
       null,
       null,
       'G52B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-lancer'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-rvr → Mitsubishi_RVR (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), year_to = coalesce(year_to, 2002), body_type = coalesce(body_type, 'suv')
where slug = 'mitsubishi-rvr'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-380 → Mitsubishi_380 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-380'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-380'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-dingo → Mitsubishi_Mirage_Dingo (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2003), body_type = coalesce(body_type, 'hatchback')
where slug = 'mitsubishi-dingo'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-dingo'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-dingo'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-dingo'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-concept-px-miev → Mitsubishi_Concept_PX-MiEV (1 engines)
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-concept-px-miev'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-pajero-sport → Mitsubishi_Pajero_Sport (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), body_type = coalesce(body_type, 'suv')
where slug = 'mitsubishi-pajero-sport'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-eclipse → Mitsubishi_Eclipse (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), body_type = coalesce(body_type, 'hatchback')
where slug = 'mitsubishi-eclipse'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-jeep → Mitsubishi_Jeep (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1944), year_to = coalesce(year_to, 1986), body_type = coalesce(body_type, 'convertible')
where slug = 'mitsubishi-jeep'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-concept-ra → Mitsubishi_Concept-RA (0 engines)

-- mitsubishi/mitsubishi-delica-mini → Mitsubishi_Delica_Mini (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023)
where slug = 'mitsubishi-delica-mini'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-miev-evolution → Mitsubishi_MiEV_Evolution (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014)
where slug = 'mitsubishi-miev-evolution'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-4n1-engine → Mitsubishi_4N1_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010)
where slug = 'mitsubishi-4n1-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-minicab → Mitsubishi_Minicab (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966), body_type = coalesce(body_type, 'pickup')
where slug = 'mitsubishi-minicab'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-500 → Mitsubishi_500 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1960), year_to = coalesce(year_to, 1962), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-500'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l-ne19a',
       '0.5 L NE19A',
       null,
       null,
       493,
       null,
       null,
       null,
       'NE19A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-500'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l-ne35a',
       '0.6 L NE35A',
       null,
       null,
       594,
       null,
       null,
       null,
       'NE35A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-500'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-cordia → Mitsubishi_Cordia (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1982), year_to = coalesce(year_to, 1990), body_type = coalesce(body_type, 'hatchback')
where slug = 'mitsubishi-cordia'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l',
       '1.4 L',
       null,
       null,
       1410,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-cordia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1597,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-cordia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1755,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-cordia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1795,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-cordia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1997,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-cordia'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-pajero-junior → Mitsubishi_Pajero_Junior (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), body_type = coalesce(body_type, 'suv')
where slug = 'mitsubishi-pajero-junior'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1094,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-pajero-junior'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-model-a → Mitsubishi_Model_A (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1917), year_to = coalesce(year_to, 1921), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-model-a'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l',
       '0.8 L',
       null,
       null,
       765,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-model-a'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ke43',
       '1.0 L KE43',
       null,
       null,
       977,
       null,
       null,
       null,
       'KE43'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-model-a'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-freeca → Mitsubishi_Freeca (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997), year_to = coalesce(year_to, 2007), body_type = coalesce(body_type, 'estate')
where slug = 'mitsubishi-freeca'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-freeca'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-freeca'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-freeca'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-toppo → Mitsubishi_Toppo (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1990), year_to = coalesce(year_to, 2004)
where slug = 'mitsubishi-toppo'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-ele',
       '0.7 L ELECTRIC',
       null,
       null,
       657,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-toppo'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       659,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-toppo'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-pajero-io → Mitsubishi_Pajero_iO (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2007), body_type = coalesce(body_type, 'suv')
where slug = 'mitsubishi-pajero-io'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-pajero-io'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-pajero-io'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-pajero-io'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-grandis → Mitsubishi_Grandis (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), year_to = coalesce(year_to, 2011)
where slug = 'mitsubishi-grandis'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-pet-na4w',
       '2.4 L NA4W',
       null,
       null,
       2400,
       'petrol',
       null,
       null,
       'NA4W'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-grandis'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-na8w',
       '2.0 L NA8W',
       null,
       null,
       2000,
       null,
       null,
       null,
       'NA8W'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-grandis'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-ek-space → Mitsubishi_eK_Space (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), body_type = coalesce(body_type, 'mpv')
where slug = 'mitsubishi-ek-space'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-eclipse-cross → Mitsubishi_Eclipse_Cross (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017), body_type = coalesce(body_type, 'suv')
where slug = 'mitsubishi-eclipse-cross'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-gk1w',
       '1.5 L GK1W',
       null,
       null,
       1500,
       null,
       null,
       null,
       'GK1W'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-eclipse-cross'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-gk2w',
       '2.0 L GK2W',
       null,
       null,
       2000,
       null,
       null,
       null,
       'GK2W'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-eclipse-cross'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l-gl3w',
       '2.4 L GL3W',
       null,
       null,
       2400,
       null,
       null,
       null,
       'GL3W'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-eclipse-cross'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-gk9w',
       '2.2 L GK9W',
       null,
       null,
       2200,
       null,
       null,
       null,
       'GK9W'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-eclipse-cross'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-xpander → Mitsubishi_Xpander (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017)
where slug = 'mitsubishi-xpander'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-xpander'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-xpander'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-destinator → Mitsubishi_Destinator (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2025), body_type = coalesce(body_type, 'suv')
where slug = 'mitsubishi-destinator'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-hyb',
       '1.5 L HYBRID',
       null,
       null,
       1500,
       'hybrid',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-destinator'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-zinger → Mitsubishi_Zinger (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005), body_type = coalesce(body_type, 'estate')
where slug = 'mitsubishi-zinger'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-zinger'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-attrage → Mitsubishi_Attrage (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1978), year_to = coalesce(year_to, 2003)
where slug = 'mitsubishi-attrage'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/nissan-livina → Nissan_Livina (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006)
where slug = 'nissan-livina'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-colt → Mitsubishi_Colt (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1962), year_to = coalesce(year_to, 1971)
where slug = 'mitsubishi-colt'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-minica → Mitsubishi_Minica (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1962), year_to = coalesce(year_to, 2007)
where slug = 'mitsubishi-minica'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-carisma → Mitsubishi_Carisma (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), year_to = coalesce(year_to, 2004), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-carisma'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-carisma'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-da1',
       '1.6 L DA1',
       null,
       null,
       1600,
       null,
       null,
       null,
       'DA1'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-carisma'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-da2',
       '1.8 L DA2',
       null,
       null,
       1800,
       null,
       null,
       null,
       'DA2'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-carisma'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-carisma'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-carisma'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-die-f9q',
       '1.9 L F9Q Diesel',
       null,
       null,
       1900,
       'diesel',
       null,
       null,
       'F9Q'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-carisma'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-endeavor → Mitsubishi_Endeavor (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), year_to = coalesce(year_to, 2011), body_type = coalesce(body_type, 'suv')
where slug = 'mitsubishi-endeavor'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-endeavor'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-concept-zt → Mitsubishi_Concept-ZT (0 engines)

-- mitsubishi/mitsubishi-space-wagon → Mitsubishi_Chariot (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1983), year_to = coalesce(year_to, 2003)
where slug = 'mitsubishi-space-wagon'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-gto → Mitsubishi_3000GT (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), year_to = coalesce(year_to, 1999), body_type = coalesce(body_type, 'hatchback')
where slug = 'mitsubishi-gto'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-gto'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-outlander → Mitsubishi_Outlander (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), body_type = coalesce(body_type, 'suv')
where slug = 'mitsubishi-outlander'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-debonair → Mitsubishi_Debonair (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1964), year_to = coalesce(year_to, 1999), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-debonair'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-town-box → Mitsubishi_Town_Box (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), body_type = coalesce(body_type, 'van')
where slug = 'mitsubishi-town-box'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-ele',
       '0.7 L ELECTRIC',
       null,
       null,
       657,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-town-box'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       659,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-town-box'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1094,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-town-box'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-pajero-evolution → Mitsubishi_Pajero_Evolution (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1984), year_to = coalesce(year_to, 2007)
where slug = 'mitsubishi-pajero-evolution'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-pajero-evolution'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-asx → Mitsubishi_ASX (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'suv')
where slug = 'mitsubishi-asx'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-xforce → Mitsubishi_Xforce (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023), body_type = coalesce(body_type, 'suv')
where slug = 'mitsubishi-xforce'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-xforce'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-xforce'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-4b4-engine → Mitsubishi_4B4_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017)
where slug = 'mitsubishi-4b4-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-dion → Mitsubishi_Dion (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), year_to = coalesce(year_to, 2005)
where slug = 'mitsubishi-dion'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-dion'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-dion'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-lancer-evolution-x → Mitsubishi_Lancer_Evolution_X (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-lancer-evolution-x'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-pet-i4-t',
       '2.0 L I4-T',
       null,
       null,
       1998,
       'petrol',
       null,
       null,
       'I4-T'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-lancer-evolution-x'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-colt-600 → Mitsubishi_Colt_600 (0 engines)

-- mitsubishi/mitsubishi-esr → Mitsubishi_ESR (0 engines)

-- mitsubishi/mitsubishi-nessie → Mitsubishi_Nessie (0 engines)

-- mitsubishi/mitsubishi-colt-800 → Mitsubishi_Colt_800 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), year_to = coalesce(year_to, 1971), body_type = coalesce(body_type, 'hatchback')
where slug = 'mitsubishi-colt-800'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-ele',
       '0.8 L ELECTRIC',
       null,
       null,
       843,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-colt-800'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ke43',
       '1.0 L KE43',
       null,
       null,
       977,
       null,
       null,
       null,
       'KE43'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-colt-800'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l-ke44',
       '0.1 L KE44',
       null,
       null,
       88,
       null,
       null,
       null,
       'KE44'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-colt-800'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-colt-1000 → Mitsubishi_Colt_1000 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963), year_to = coalesce(year_to, 1966), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-colt-1000'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ke43',
       '1.0 L KE43',
       null,
       null,
       977,
       null,
       null,
       null,
       'KE43'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-colt-1000'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-lancer-evolution → Mitsubishi_Lancer_Evolution (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), year_to = coalesce(year_to, 2016), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-lancer-evolution'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-lancer-evolution'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-suw → Mitsubishi_SUW (0 engines)

-- mitsubishi/mitsubishi-sup → Mitsubishi_SUP (0 engines)

-- mitsubishi/mitsubishi-rpm-7000 → Mitsubishi_RPM_7000 (0 engines)

-- mitsubishi/mitsubishi-mizushima → Mitsubishi_Mizushima (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1947), year_to = coalesce(year_to, 1962)
where slug = 'mitsubishi-mizushima'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-space-gear → Mitsubishi_Space_Gear (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968)
where slug = 'mitsubishi-space-gear'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-tetra → Mitsubishi_TETRA (0 engines)

-- mitsubishi/mitsubishi-gaus → Mitsubishi_Gaus (0 engines)

-- mitsubishi/mitsubishi-savrin → Mitsubishi_Savrin (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), body_type = coalesce(body_type, 'estate')
where slug = 'mitsubishi-savrin'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-tredia → Mitsubishi_Tredia (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1982), year_to = coalesce(year_to, 1990), body_type = coalesce(body_type, 'sedan')
where slug = 'mitsubishi-tredia'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l',
       '1.4 L',
       null,
       null,
       1410,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-tredia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1597,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-tredia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1755,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-tredia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1795,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-tredia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1997,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-tredia'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-space-star → Mitsubishi_Space_Star (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2005), body_type = coalesce(body_type, 'hatchback')
where slug = 'mitsubishi-space-star'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-space-star'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-space-star'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-space-star'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-f9q',
       '1.9 L F9Q',
       null,
       null,
       1900,
       null,
       null,
       null,
       'F9Q'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-space-star'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-aspire → Mitsubishi_Aspire (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1969), year_to = coalesce(year_to, 2012)
where slug = 'mitsubishi-aspire'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-galant-gto → Mitsubishi_Galant_GTO (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), year_to = coalesce(year_to, 1977)
where slug = 'mitsubishi-galant-gto'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1597,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-galant-gto'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-raider → Mitsubishi_Raider (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005), body_type = coalesce(body_type, 'pickup')
where slug = 'mitsubishi-raider'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-raider'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-raider'
on conflict (model_id, slug) do nothing;

-- mitsubishi/dodge-attitude → Dodge_Attitude (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006)
where slug = 'dodge-attitude'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- mitsubishi/mitsubishi-galant-fto → Mitsubishi_Galant_FTO (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1971)
where slug = 'mitsubishi-galant-fto'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-galant-fto'
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
where mk.slug = 'mitsubishi' and vm.slug = 'mitsubishi-galant-fto'
on conflict (model_id, slug) do nothing;

-- mitsubishi/mitsubishi-2g1-engine → Mitsubishi_2G1_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968), year_to = coalesce(year_to, 1976)
where slug = 'mitsubishi-2g1-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'mitsubishi');

-- subaru/isuzu-super-cruiser → Isuzu_Super_Cruiser (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 1996)
where slug = 'isuzu-super-cruiser'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- subaru/nissan-diesel-space-runner-jp → Nissan_Diesel_Space_Runner_JP (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), year_to = coalesce(year_to, 2010)
where slug = 'nissan-diesel-space-runner-jp'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- subaru/nissan-diesel-space-runner-ra → Nissan_Diesel_Space_Runner_RA (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), year_to = coalesce(year_to, 2011)
where slug = 'nissan-diesel-space-runner-ra'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- subaru/subaru-leone → Subaru_Leone (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1971), year_to = coalesce(year_to, 1994)
where slug = 'subaru-leone'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- subaru/nissan-diesel-space-runner-rp → Nissan_Diesel_Space_Runner_RP (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 2007)
where slug = 'nissan-diesel-space-runner-rp'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- subaru/subaru-1000 → Subaru_1000 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966), body_type = coalesce(body_type, 'sedan')
where slug = 'subaru-1000'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ea52',
       '1.0 L EA52',
       null,
       null,
       977,
       null,
       null,
       null,
       'EA52'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'subaru' and vm.slug = 'subaru-1000'
on conflict (model_id, slug) do nothing;

-- subaru/subaru-xv → Subaru_Crosstrek (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), body_type = coalesce(body_type, 'suv')
where slug = 'subaru-xv'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- subaru/subaru-1500 → Subaru_1500 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1954), body_type = coalesce(body_type, 'sedan')
where slug = 'subaru-1500'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-fg4a',
       '1.5 L FG4A',
       null,
       null,
       1500,
       null,
       null,
       null,
       'FG4A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'subaru' and vm.slug = 'subaru-1500'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l-l4-1',
       '1.5 L L4-1',
       null,
       null,
       1500,
       null,
       null,
       null,
       'L4-1'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'subaru' and vm.slug = 'subaru-1500'
on conflict (model_id, slug) do nothing;

-- subaru/isuzu-cubic → Isuzu_Cubic (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1984), year_to = coalesce(year_to, 2000)
where slug = 'isuzu-cubic'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- subaru/nissan-diesel-ua → Nissan_Diesel_UA (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1973), year_to = coalesce(year_to, 2005)
where slug = 'nissan-diesel-ua'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- subaru/nissan-diesel-rn → Nissan_Diesel_RN (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2003)
where slug = 'nissan-diesel-rn'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- subaru/nissan-diesel-space-arrow → Nissan_Diesel_Space_Arrow (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1985), year_to = coalesce(year_to, 2010)
where slug = 'nissan-diesel-space-arrow'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- subaru/isuzu-journey-k → Isuzu_Journey-K (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1984), year_to = coalesce(year_to, 1999)
where slug = 'isuzu-journey-k'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- subaru/nissan-diesel-space-runner-rm → Nissan_Diesel_Space_Runner_RM (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975), year_to = coalesce(year_to, 2010)
where slug = 'nissan-diesel-space-runner-rm'
  and make_id = (select id from public.vehicle_makes where slug = 'subaru');

-- suzuki/suzuki-j-engine → Suzuki_J_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2019)
where slug = 'suzuki-j-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-brezza → Suzuki_Brezza (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), body_type = coalesce(body_type, 'suv')
where slug = 'suzuki-brezza'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-baleno → Suzuki_Baleno_(2015) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2015), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-baleno'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-victoris → Suzuki_Victoris (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2025), body_type = coalesce(body_type, 'suv')
where slug = 'suzuki-victoris'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
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
where mk.slug = 'suzuki' and vm.slug = 'suzuki-victoris'
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
where mk.slug = 'suzuki' and vm.slug = 'suzuki-victoris'
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
where mk.slug = 'suzuki' and vm.slug = 'suzuki-victoris'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-gsx-r4 → Suzuki_GSX-R/4 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), body_type = coalesce(body_type, 'roadster')
where slug = 'suzuki-gsx-r4'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-127kw',
       '1.3 L 127kW',
       127,
       173,
       1300,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-gsx-r4'
on conflict (model_id, slug) do nothing;

-- suzuki/suzuki-e-vitara → Suzuki_e_Vitara (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2025), body_type = coalesce(body_type, 'suv')
where slug = 'suzuki-e-vitara'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-solio → Suzuki_Solio (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-solio'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-cultus → Suzuki_Cultus (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1983), year_to = coalesce(year_to, 2016)
where slug = 'suzuki-cultus'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');

-- suzuki/suzuki-s-presso → Suzuki_S-Presso (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2019), body_type = coalesce(body_type, 'hatchback')
where slug = 'suzuki-s-presso'
  and make_id = (select id from public.vehicle_makes where slug = 'suzuki');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele-k10b',
       '1.0 L K10B ELECTRIC',
       null,
       null,
       998,
       'electric',
       null,
       null,
       'K10B'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-s-presso'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-ele-k10c',
       '1.0 L K10C ELECTRIC',
       null,
       null,
       998,
       'electric',
       null,
       null,
       'K10C'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'suzuki' and vm.slug = 'suzuki-s-presso'
on conflict (model_id, slug) do nothing;
