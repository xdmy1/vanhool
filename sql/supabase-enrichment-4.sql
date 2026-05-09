-- Enrichment chunk 4/8

-- opel/vauxhall-astra → Vauxhall_Astra (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1980), body_type = coalesce(body_type, 'sedan')
where slug = 'vauxhall-astra'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-mokka → Opel_Mokka (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), body_type = coalesce(body_type, 'suv')
where slug = 'opel-mokka'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-signum → Opel_Signum (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), year_to = coalesce(year_to, 2008), body_type = coalesce(body_type, 'hatchback')
where slug = 'opel-signum'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-speedster → Opel_Speedster (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), body_type = coalesce(body_type, 'roadster')
where slug = 'opel-speedster'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-z20let',
       '2.0 L Z20LET',
       null,
       null,
       2000,
       null,
       null,
       null,
       'Z20LET'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-speedster'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-z22se',
       '2.2 L Z22SE',
       null,
       null,
       2200,
       null,
       null,
       null,
       'Z22SE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-speedster'
on conflict (model_id, slug) do nothing;

-- opel/opel-senator → Opel_Senator (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1978), year_to = coalesce(year_to, 1993)
where slug = 'opel-senator'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-calibra → Opel_Calibra (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), year_to = coalesce(year_to, 1997), body_type = coalesce(body_type, 'hatchback')
where slug = 'opel-calibra'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-c20ne',
       '2.0 L C20NE',
       null,
       null,
       2000,
       null,
       null,
       null,
       'C20NE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-calibra'
on conflict (model_id, slug) do nothing;

-- opel/opel-tech-1 → Opel_Tech_1 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), body_type = coalesce(body_type, 'hatchback')
where slug = 'opel-tech-1'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-patent-motor-car → Opel_Patent_Motor_Car (1 engines)
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
where mk.slug = 'opel' and vm.slug = 'opel-patent-motor-car'
on conflict (model_id, slug) do nothing;

-- opel/opel-omega → Opel_Omega (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986)
where slug = 'opel-omega'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-x20xev → X20XEV (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), year_to = coalesce(year_to, 1999)
where slug = 'opel-x20xev'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-insignia → Opel_Insignia (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), year_to = coalesce(year_to, 2022)
where slug = 'opel-insignia'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-tigra → Opel_Tigra (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), year_to = coalesce(year_to, 2000)
where slug = 'opel-tigra'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-1040-ps → Opel_10/40_PS (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1925), year_to = coalesce(year_to, 1929), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-1040-ps'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-6l',
       '2.6 L',
       null,
       null,
       2620,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-1040-ps'
on conflict (model_id, slug) do nothing;

-- opel/opel-ascona → Opel_Ascona (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), year_to = coalesce(year_to, 1988)
where slug = 'opel-ascona'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-karl → Opel_Karl (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2015), year_to = coalesce(year_to, 2019), body_type = coalesce(body_type, 'hatchback')
where slug = 'opel-karl'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-pet-b10xe',
       '1.0 L B10XE',
       null,
       null,
       1000,
       'petrol',
       null,
       null,
       'B10XE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-karl'
on conflict (model_id, slug) do nothing;

-- opel/20seh → 20SEH (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), year_to = coalesce(year_to, 1999)
where slug = '20seh'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-regent → Opel_Regent (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1928), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-regent'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-48-ps → Opel_4/8_PS (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1909), body_type = coalesce(body_type, 'convertible')
where slug = 'opel-48-ps'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-pet',
       '1.0 L',
       null,
       null,
       1029,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-48-ps'
on conflict (model_id, slug) do nothing;

-- opel/opel-olympia-rekord → Opel_Olympia_Rekord (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1953), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-olympia-rekord'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
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
where mk.slug = 'opel' and vm.slug = 'opel-olympia-rekord'
on conflict (model_id, slug) do nothing;

-- opel/opel-laubfrosch → Opel_Laubfrosch (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1924), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-laubfrosch'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-9kw',
       '1.0 L 9kW',
       9,
       12,
       951,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-laubfrosch'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-10kw',
       '1.0 L 10kW',
       10,
       14,
       1018,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-laubfrosch'
on conflict (model_id, slug) do nothing;

-- opel/opel-cascada → Opel_Cascada (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), year_to = coalesce(year_to, 2019), body_type = coalesce(body_type, 'convertible')
where slug = 'opel-cascada'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-b14net',
       '1.4 L B14NET',
       null,
       null,
       1400,
       null,
       null,
       null,
       'B14NET'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-cascada'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-a16xht',
       '1.6 L A16XHT',
       null,
       null,
       1600,
       null,
       null,
       null,
       'A16XHT'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-cascada'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-a16sht',
       '1.6 L A16SHT',
       null,
       null,
       1600,
       null,
       null,
       null,
       'A16SHT'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-cascada'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-b20dth',
       '2.0 L B20DTH',
       null,
       null,
       2000,
       null,
       null,
       null,
       'B20DTH'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-cascada'
on conflict (model_id, slug) do nothing;

-- opel/opel-kadett-e → Opel_Kadett_E (9 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1984), year_to = coalesce(year_to, 1998), body_type = coalesce(body_type, 'hatchback')
where slug = 'opel-kadett-e'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l',
       '1.2 L',
       null,
       null,
       1196,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-e'
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
where mk.slug = 'opel' and vm.slug = 'opel-kadett-e'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l',
       '1.4 L',
       null,
       null,
       1396,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-e'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1598,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-e'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1796,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-e'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1998,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-e'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'opel' and vm.slug = 'opel-kadett-e'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l',
       '1.7 L',
       null,
       null,
       1686,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-e'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l',
       '1.7 L',
       null,
       null,
       1699,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-e'
on conflict (model_id, slug) do nothing;

-- opel/opel-rekord-a → Opel_Rekord_Series_A (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1963), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-rekord-a'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       488,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-a'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       680,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-a'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l',
       '0.6 L',
       null,
       null,
       605,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-a'
on conflict (model_id, slug) do nothing;

-- opel/opel-rekord-p2 → Opel_Rekord_P2 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1960), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-rekord-p2'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       488,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-p2'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       680,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-p2'
on conflict (model_id, slug) do nothing;

-- opel/opel-rekord-b → Opel_Rekord_Series_B (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-rekord-b'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1492,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-b'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l',
       '1.7 L',
       null,
       null,
       1698,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-b'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l',
       '1.9 L',
       null,
       null,
       1897,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-b'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-6l',
       '2.6 L',
       null,
       null,
       2605,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-b'
on conflict (model_id, slug) do nothing;

-- opel/opel-rekord-c → Opel_Rekord_Series_C (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1966), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-rekord-c'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       492,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-c'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       698,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-c'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l',
       '0.9 L',
       null,
       null,
       897,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-c'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       239,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-c'
on conflict (model_id, slug) do nothing;

-- opel/opel-olympia-rekord-p1 → Opel_Rekord_P1 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1957), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-olympia-rekord-p1'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       205,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-olympia-rekord-p1'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       488,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-olympia-rekord-p1'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       680,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-olympia-rekord-p1'
on conflict (model_id, slug) do nothing;

-- opel/opel-rekord-e → Opel_Rekord_Series_E (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1980), year_to = coalesce(year_to, 1988), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-rekord-e'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-flextreme-gte → Opel_Flextreme_GT/E (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010)
where slug = 'opel-flextreme-gte'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-kadett → Opel_Kadett (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1936)
where slug = 'opel-kadett'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-olympia → Opel_Olympia (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1935), year_to = coalesce(year_to, 1940)
where slug = 'opel-olympia'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-slalom → Opel_Slalom (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996)
where slug = 'opel-slalom'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
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
where mk.slug = 'opel' and vm.slug = 'opel-slalom'
on conflict (model_id, slug) do nothing;

-- opel/opel-crossland → Opel_Crossland (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017), year_to = coalesce(year_to, 2024), body_type = coalesce(body_type, 'suv')
where slug = 'opel-crossland'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-ele-eb2f',
       '1.2 L EB2F ELECTRIC',
       null,
       null,
       1200,
       'electric',
       null,
       null,
       'EB2F'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-crossland'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-ele-eb2dt',
       '1.2 L EB2DT ELECTRIC',
       null,
       null,
       1200,
       'electric',
       null,
       null,
       'EB2DT'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-crossland'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-ele-eb2fa',
       '1.2 L EB2FA ELECTRIC',
       null,
       null,
       1200,
       'electric',
       null,
       null,
       'EB2FA'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-crossland'
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
where mk.slug = 'opel' and vm.slug = 'opel-crossland'
on conflict (model_id, slug) do nothing;

-- opel/opel-cih → Opel_cam-in-head_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), year_to = coalesce(year_to, 1998)
where slug = 'opel-cih'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-rekord-d → Opel_Rekord_Series_D (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1972), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-rekord-d'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l',
       '1.7 L',
       null,
       null,
       1698,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-d'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l',
       '1.9 L',
       null,
       null,
       1897,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-d'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1979,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-d'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1998,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-d'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l',
       '2.1 L',
       null,
       null,
       2068,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-rekord-d'
on conflict (model_id, slug) do nothing;

-- opel/opel-zafira → Opel_Zafira (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2019), body_type = coalesce(body_type, 'mpv')
where slug = 'opel-zafira'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-20se → 20SE (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), year_to = coalesce(year_to, 1999)
where slug = 'opel-20se'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-ohv-engine → Opel_OHV_engine (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1962), year_to = coalesce(year_to, 1993)
where slug = 'opel-ohv-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-18-litre → Opel_1.8_Liter (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1931), year_to = coalesce(year_to, 1933), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-18-litre'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1790,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-18-litre'
on conflict (model_id, slug) do nothing;

-- opel/opel-meriva → Opel_Meriva (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), body_type = coalesce(body_type, 'mpv')
where slug = 'opel-meriva'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/vauxhall-cavalier → Vauxhall_Cavalier (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975), year_to = coalesce(year_to, 1995)
where slug = 'vauxhall-cavalier'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-astra-h → Opel_Astra_H (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991)
where slug = 'opel-astra-h'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-super-6 → Opel_Super_6 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1937), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-super-6'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');
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
where mk.slug = 'opel' and vm.slug = 'opel-super-6'
on conflict (model_id, slug) do nothing;

-- opel/opel-c25xe → C25XE (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), year_to = coalesce(year_to, 2004)
where slug = 'opel-c25xe'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-manta → Opel_Manta (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), year_to = coalesce(year_to, 1988)
where slug = 'opel-manta'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-c20ne → C20NE (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), year_to = coalesce(year_to, 1999)
where slug = 'opel-c20ne'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-grandland → Opel_Grandland (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017), body_type = coalesce(body_type, 'suv')
where slug = 'opel-grandland'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-blitz → Opel_Blitz (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1930), year_to = coalesce(year_to, 1975), body_type = coalesce(body_type, 'pickup')
where slug = 'opel-blitz'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-kadett-b → Opel_Kadett_B (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), year_to = coalesce(year_to, 1973), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-kadett-b'
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
where mk.slug = 'opel' and vm.slug = 'opel-kadett-b'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1078,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-b'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l',
       '1.2 L',
       null,
       null,
       1196,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-b'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1492,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-b'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-7l',
       '1.7 L',
       null,
       null,
       1698,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-b'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l',
       '1.9 L',
       null,
       null,
       1897,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'opel' and vm.slug = 'opel-kadett-b'
on conflict (model_id, slug) do nothing;

-- opel/opel-kapitan → Opel_Kapitän (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1938), body_type = coalesce(body_type, 'sedan')
where slug = 'opel-kapitan'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-vectra → Opel_Vectra (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1988)
where slug = 'opel-vectra'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-astra-g → Opel_Astra_G (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991)
where slug = 'opel-astra-g'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- opel/opel-agila → Opel_Agila (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), year_to = coalesce(year_to, 2014)
where slug = 'opel-agila'
  and make_id = (select id from public.vehicle_makes where slug = 'opel');

-- peugeot/peugeot-quark → Peugeot_Quark (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004)
where slug = 'peugeot-quark'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '28kw',
       '28kW',
       28,
       38,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-quark'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-e7 → Peugeot_E7 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1990)
where slug = 'peugeot-e7'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-408 → Peugeot_408_(saloon) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-408'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-207 → Peugeot_207 (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2015), body_type = coalesce(body_type, 'hatchback')
where slug = 'peugeot-207'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-tu3jp',
       '1.4 L TU3JP',
       null,
       null,
       1400,
       null,
       null,
       null,
       'TU3JP'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-et3j4',
       '1.4 L ET3J4',
       null,
       null,
       1400,
       null,
       null,
       null,
       'ET3J4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-207'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-tu5jp4',
       '1.6 L TU5JP4',
       null,
       null,
       1600,
       null,
       null,
       null,
       'TU5JP4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-207'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-die-dv4',
       '1.4 L DV4 Diesel',
       null,
       null,
       1400,
       'diesel',
       null,
       null,
       'DV4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-207'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die-dv6',
       '1.6 L DV6 Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       'DV6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-207'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-308 → Peugeot_308 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007)
where slug = 'peugeot-308'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-4008 → Peugeot_4008 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), year_to = coalesce(year_to, 2017), body_type = coalesce(body_type, 'suv')
where slug = 'peugeot-4008'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-4008'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-4008'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-die',
       '1.8 L Diesel',
       null,
       null,
       1800,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-4008'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-1525 → Peugeot_Type_1525 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1917), year_to = coalesce(year_to, 1920)
where slug = 'peugeot-type-1525'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-zx → Citroën_ZX (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), year_to = coalesce(year_to, 1998), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-zx'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-205 → Peugeot_205 (15 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1983), year_to = coalesce(year_to, 1999), body_type = coalesce(body_type, 'hatchback')
where slug = 'peugeot-205'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       954,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1124,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-tu1',
       '1.1 L TU1',
       null,
       null,
       1124,
       null,
       null,
       null,
       'TU1'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l',
       '1.2 L',
       null,
       null,
       1204,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-g1a',
       '1.3 L G1A',
       null,
       null,
       1294,
       null,
       null,
       null,
       'G1A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-tu2',
       '1.3 L TU2',
       null,
       null,
       1294,
       null,
       null,
       null,
       'TU2'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l',
       '1.4 L',
       null,
       null,
       1360,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-tu3',
       '1.4 L TU3',
       null,
       null,
       1360,
       null,
       null,
       null,
       'TU3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l',
       '1.4 L',
       null,
       null,
       1442,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-xu5',
       '1.6 L XU5',
       null,
       null,
       1580,
       null,
       null,
       null,
       'XU5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1592,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-xu8t',
       '1.8 L XU8T',
       null,
       null,
       1775,
       null,
       null,
       null,
       'XU8T'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-xu9',
       '1.9 L XU9',
       null,
       null,
       1905,
       null,
       null,
       null,
       'XU9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-xud7',
       '1.8 L XUD7',
       null,
       null,
       1769,
       null,
       null,
       null,
       'XUD7'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-xud9',
       '1.9 L XUD9',
       null,
       null,
       1905,
       null,
       null,
       null,
       'XUD9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-205'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-307 → Peugeot_307 (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), year_to = coalesce(year_to, 2008), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-307'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-tu3',
       '1.4 L TU3',
       null,
       null,
       1400,
       null,
       null,
       null,
       'TU3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-307'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-et3',
       '1.4 L ET3',
       null,
       null,
       1400,
       null,
       null,
       null,
       'ET3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-307'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-tu5',
       '1.6 L TU5',
       null,
       null,
       1600,
       null,
       null,
       null,
       'TU5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-307'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-ew10',
       '2.0 L EW10',
       null,
       null,
       2000,
       null,
       null,
       null,
       'EW10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-307'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-die-dv4',
       '1.4 L DV4 Diesel',
       null,
       null,
       1400,
       'diesel',
       null,
       null,
       'DV4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-307'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die-dv6',
       '1.6 L DV6 Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       'DV6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-307'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-die-dw10',
       '2.0 L DW10 Diesel',
       null,
       null,
       2000,
       'diesel',
       null,
       null,
       'DW10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-307'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-5cv → Peugeot_5CV (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1924), year_to = coalesce(year_to, 1929)
where slug = 'peugeot-5cv'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       667,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-5cv'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       695,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-5cv'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       720,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-5cv'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-64 → Peugeot_Type_64 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1905), year_to = coalesce(year_to, 1908)
where slug = 'peugeot-type-64'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1817,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-64'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-908-rc → Peugeot_908_RC (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-908-rc'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-5l-die',
       '5.5 L Diesel',
       null,
       null,
       5500,
       'diesel',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-908-rc'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-dma → Peugeot_DMA (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1941), year_to = coalesce(year_to, 1948)
where slug = 'peugeot-dma'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-rc → Peugeot_RC (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-rc'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-pet-ew10',
       '2.0 L EW10',
       null,
       null,
       2000,
       'petrol',
       null,
       null,
       'EW10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-rc'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-die-dw12',
       '2.2 L DW12 Diesel',
       null,
       null,
       2200,
       'diesel',
       null,
       null,
       'DW12'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-rc'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-c4 → Citroën_C4 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004)
where slug = 'citroen-c4'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-xd-engine → PSA_XD (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012)
where slug = 'peugeot-xd-engine'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-hoggar → Peugeot_Hoggar_Concept (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004)
where slug = 'peugeot-hoggar'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-hoggar'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-105 → Peugeot_Type_105 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1908), year_to = coalesce(year_to, 1909)
where slug = 'peugeot-type-105'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       1000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-105'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-mehari → Citroën_Méhari (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968), year_to = coalesce(year_to, 1988), body_type = coalesce(body_type, 'roadster')
where slug = 'citroen-mehari'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-mehari'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-305 → Peugeot_305 (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1977), year_to = coalesce(year_to, 1993), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-305'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-3l-xl5',
       '0.3 L XL5',
       null,
       null,
       290,
       null,
       null,
       null,
       'XL5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-305'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l-xr5',
       '0.5 L XR5',
       null,
       null,
       472,
       null,
       null,
       null,
       'XR5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-305'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l-xu5',
       '0.6 L XU5',
       null,
       null,
       580,
       null,
       null,
       null,
       'XU5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-305'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l-xu9',
       '0.9 L XU9',
       null,
       null,
       905,
       null,
       null,
       null,
       'XU9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-305'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       548,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-305'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-9l-xud9',
       '0.9 L XUD9',
       null,
       null,
       905,
       null,
       null,
       null,
       'XUD9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-305'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-expert → Peugeot_Expert (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), body_type = coalesce(body_type, 'van')
where slug = 'peugeot-expert'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-56 → Peugeot_Type_56 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1903)
where slug = 'peugeot-type-56'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l',
       '0.8 L',
       null,
       null,
       833,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-56'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-hr1 → Peugeot_HR1 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'suv')
where slug = 'peugeot-hr1'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-3 → Peugeot_Type_3 (1 engines)
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l',
       '0.6 L',
       null,
       null,
       565,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-3'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-quadrilette → Peugeot_Quadrilette (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1921), year_to = coalesce(year_to, 1924)
where slug = 'peugeot-quadrilette'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       667,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-quadrilette'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       720,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-quadrilette'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-5008 → Peugeot_5008 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), body_type = coalesce(body_type, 'suv')
where slug = 'peugeot-5008'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-bipper → Peugeot_Bipper (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1977), year_to = coalesce(year_to, 2024)
where slug = 'peugeot-bipper'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-inception → Peugeot_Inception (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2023), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-inception'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-9 → Peugeot_Type_9 (1 engines)
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1282,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-9'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-160 → Peugeot_Type_160 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1913)
where slug = 'peugeot-type-160'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '7-0l',
       '7.0 L',
       null,
       null,
       7000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-160'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-3008-dkr → Peugeot_3008_DKR (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2017)
where slug = 'peugeot-3008-dkr'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-3008-dkr'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-203 → Peugeot_203 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1948), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-203'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1290,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-203'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-306 → Peugeot_306 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1993), year_to = coalesce(year_to, 2002), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-306'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-polygon → Peugeot_Polygon (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2025)
where slug = 'peugeot-polygon'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-e-208 → Peugeot_e-208 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2019), body_type = coalesce(body_type, 'hatchback')
where slug = 'peugeot-e-208'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/talbot-horizon → Chrysler_Horizon (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1978), body_type = coalesce(body_type, 'hatchback')
where slug = 'talbot-horizon'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1118,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'talbot-horizon'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1294,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'talbot-horizon'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l',
       '1.4 L',
       null,
       null,
       1442,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'talbot-horizon'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-xud9',
       '1.9 L XUD9',
       null,
       null,
       1905,
       null,
       null,
       null,
       'XUD9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'talbot-horizon'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-604 → Peugeot_604 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1975), year_to = coalesce(year_to, 1985), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-604'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-604'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-604'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-xd2s',
       '2.3 L XD2S',
       null,
       null,
       2300,
       null,
       null,
       null,
       'XD2S'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-604'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-xd3s',
       '2.5 L XD3S',
       null,
       null,
       2500,
       null,
       null,
       null,
       'XD3S'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-604'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-204 → Peugeot_204 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), year_to = coalesce(year_to, 1976), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-204'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-xk5',
       '1.1 L XK5',
       null,
       null,
       1127,
       null,
       null,
       null,
       'XK5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-xk4',
       '1.1 L XK4',
       null,
       null,
       1130,
       null,
       null,
       null,
       'XK4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1255,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-204'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-xl4d',
       '1.4 L XL4D',
       null,
       null,
       1357,
       null,
       null,
       null,
       'XL4D'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-204'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-1007 → Peugeot_1007 (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), year_to = coalesce(year_to, 2009), body_type = coalesce(body_type, 'hatchback')
where slug = 'peugeot-1007'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-tu3',
       '1.4 L TU3',
       null,
       null,
       1400,
       null,
       null,
       null,
       'TU3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-1007'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-et3',
       '1.4 L ET3',
       null,
       null,
       1400,
       null,
       null,
       null,
       'ET3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-1007'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-tu5',
       '1.6 L TU5',
       null,
       null,
       1600,
       null,
       null,
       null,
       'TU5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-1007'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-die-dv4',
       '1.4 L DV4 Diesel',
       null,
       null,
       1400,
       'diesel',
       null,
       null,
       'DV4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-1007'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die-dv6',
       '1.6 L DV6 Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       'DV6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-1007'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-moovie → Peugeot_Moovie (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005)
where slug = 'peugeot-moovie'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-quasar → Peugeot_Quasar (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1984), body_type = coalesce(body_type, 'coupe')
where slug = 'peugeot-quasar'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-quasar'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-2008-dkr → Peugeot_2008_DKR (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2015), year_to = coalesce(year_to, 2016)
where slug = 'peugeot-2008-dkr'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-2008-dkr'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-moonster → Peugeot_Moonster (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2001), body_type = coalesce(body_type, 'coupe')
where slug = 'peugeot-moonster'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-190 → Peugeot_Type_190 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1928), year_to = coalesce(year_to, 1931), body_type = coalesce(body_type, 'roadster')
where slug = 'peugeot-type-190'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       695,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-190'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-c3 → Citroën_C3 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-c3'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-125 → Peugeot_Type_125 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1910)
where slug = 'peugeot-type-125'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1148,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-125'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-163 → Peugeot_Type_163 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1919), year_to = coalesce(year_to, 1924)
where slug = 'peugeot-type-163'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-landtrek → Peugeot_Landtrek (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2020)
where slug = 'peugeot-landtrek'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-landtrek'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-d20tcie',
       '1.9 L D20TCIE',
       null,
       null,
       1900,
       null,
       null,
       null,
       'D20TCIE'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-landtrek'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-dw12',
       '2.2 L DW12',
       null,
       null,
       2200,
       null,
       null,
       null,
       'DW12'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-landtrek'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-landtrek'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-gs → Citroën_GS (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), year_to = coalesce(year_to, 1986), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-gs'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-0l',
       '0.0 L',
       null,
       null,
       15,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-gs'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l',
       '0.1 L',
       null,
       null,
       129,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-gs'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       222,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-gs'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-3l',
       '0.3 L',
       null,
       null,
       299,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-gs'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-gs'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-ds → Citroën_DS (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1955), year_to = coalesce(year_to, 1975), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-ds'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l',
       '1.9 L',
       null,
       null,
       1911,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-ds'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1985,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-ds'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l',
       '2.2 L',
       null,
       null,
       2175,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-ds'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l',
       '2.3 L',
       null,
       null,
       2347,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-ds'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-1 → Peugeot_Type_1 (0 engines)

-- peugeot/peugeot-type-183 → Peugeot_Type_183 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1928), year_to = coalesce(year_to, 1932)
where slug = 'peugeot-type-183'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-407 → Peugeot_407 (9 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004), year_to = coalesce(year_to, 2011), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-407'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-ew7',
       '1.8 L EW7',
       null,
       null,
       1800,
       null,
       null,
       null,
       'EW7'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-407'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-ew10',
       '2.0 L EW10',
       null,
       null,
       2000,
       null,
       null,
       null,
       'EW10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-407'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-ew12',
       '2.2 L EW12',
       null,
       null,
       2200,
       null,
       null,
       null,
       'EW12'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-407'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-es9',
       '3.0 L ES9',
       null,
       null,
       3000,
       null,
       null,
       null,
       'ES9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-407'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die-dv6',
       '1.6 L DV6 Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       'DV6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-407'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-die-dw10',
       '2.0 L DW10 Diesel',
       null,
       null,
       2000,
       'diesel',
       null,
       null,
       'DW10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-407'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-die-dw12',
       '2.2 L DW12 Diesel',
       null,
       null,
       2200,
       'diesel',
       null,
       null,
       'DW12'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-407'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l-die-dt17',
       '2.7 L DT17 Diesel',
       null,
       null,
       2700,
       'diesel',
       null,
       null,
       'DT17'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-407'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-die-dt20',
       '3.0 L DT20 Diesel',
       null,
       null,
       3000,
       'diesel',
       null,
       null,
       'DT20'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-407'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-2 → Peugeot_Type_2 (0 engines)

-- peugeot/peugeot-type-156 → Peugeot_Type_156 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1921), year_to = coalesce(year_to, 1923)
where slug = 'peugeot-type-156'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-202 → Peugeot_202 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1938), year_to = coalesce(year_to, 1942), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-202'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1133,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-202'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-30 → Peugeot_Type_30 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1900), year_to = coalesce(year_to, 1902)
where slug = 'peugeot-type-30'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/lion-peugeot-type-v4c3 → Lion-Peugeot_Type_V4C3 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1912), year_to = coalesce(year_to, 1913)
where slug = 'lion-peugeot-type-v4c3'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-e-legend → Peugeot_e-Legend (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2018)
where slug = 'peugeot-e-legend'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-309 → Peugeot_309 (8 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1985), year_to = coalesce(year_to, 1994), body_type = coalesce(body_type, 'hatchback')
where slug = 'peugeot-309'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-e1a',
       '1.1 L E1A',
       null,
       null,
       1118,
       null,
       null,
       null,
       'E1A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-309'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-tu1',
       '1.1 L TU1',
       null,
       null,
       1124,
       null,
       null,
       null,
       'TU1'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-309'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-g1a',
       '1.3 L G1A',
       null,
       null,
       1294,
       null,
       null,
       null,
       'G1A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-309'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-tu3',
       '1.4 L TU3',
       null,
       null,
       1360,
       null,
       null,
       null,
       'TU3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-309'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-xu5',
       '1.6 L XU5',
       null,
       null,
       1580,
       null,
       null,
       null,
       'XU5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-309'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-xu9',
       '1.9 L XU9',
       null,
       null,
       1905,
       null,
       null,
       null,
       'XU9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-309'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-xud7',
       '1.8 L XUD7',
       null,
       null,
       1769,
       null,
       null,
       null,
       'XUD7'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-309'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-xud9',
       '1.9 L XUD9',
       null,
       null,
       1905,
       null,
       null,
       null,
       'XUD9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-309'
on conflict (model_id, slug) do nothing;

-- peugeot/talbot-tagora → Talbot_Tagora (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1980), year_to = coalesce(year_to, 1983), body_type = coalesce(body_type, 'sedan')
where slug = 'talbot-tagora'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'talbot-tagora'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-21 → Peugeot_Type_21 (0 engines)

-- peugeot/citroen-c1 → Citroën_C1 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005)
where slug = 'citroen-c1'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-16 → Peugeot_Type_16 (1 engines)
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-4l',
       '2.4 L',
       null,
       null,
       2423,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-16'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-bb1 → Peugeot_BB1 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), body_type = coalesce(body_type, 'hatchback')
where slug = 'peugeot-bb1'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/talbot-samba → Talbot_Samba (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), body_type = coalesce(body_type, 'hatchback')
where slug = 'talbot-samba'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       1000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'talbot-samba'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-xm → Citroën_XM (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), year_to = coalesce(year_to, 2000), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-xm'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-xu10',
       '2.0 L XU10',
       null,
       null,
       2000,
       null,
       null,
       null,
       'XU10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-xm'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-xm'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-xm'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-xud11',
       '2.1 L XUD11',
       null,
       null,
       2100,
       null,
       null,
       null,
       'XUD11'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-xm'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-dk5',
       '2.5 L DK5',
       null,
       null,
       2500,
       null,
       null,
       null,
       'DK5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-xm'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-146 → Peugeot_Type_146 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1913), year_to = coalesce(year_to, 1914)
where slug = 'peugeot-type-146'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '4-5l',
       '4.5 L',
       null,
       null,
       4536,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-146'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-81 → Peugeot_Type_81 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1906)
where slug = 'peugeot-type-81'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l',
       '2.2 L',
       null,
       null,
       2207,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-81'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-505 → Peugeot_505 (8 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1979), year_to = coalesce(year_to, 1992), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-505'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-xm7a',
       '1.8 L XM7A',
       null,
       null,
       1796,
       null,
       null,
       null,
       'XM7A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-505'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-xn1',
       '2.0 L XN1',
       null,
       null,
       1971,
       null,
       null,
       null,
       'XN1'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-505'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-505'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-n9t',
       '2.2 L N9T',
       null,
       null,
       2155,
       null,
       null,
       null,
       'N9T'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-505'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l',
       '2.2 L',
       null,
       null,
       2165,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-505'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-8l-zn3j',
       '2.8 L ZN3J',
       null,
       null,
       2849,
       null,
       null,
       null,
       'ZN3J'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-505'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-3l-xd2',
       '2.3 L XD2',
       null,
       null,
       2304,
       null,
       null,
       null,
       'XD2'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-505'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l-xd3',
       '2.5 L XD3',
       null,
       null,
       2498,
       null,
       null,
       null,
       'XD3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-505'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-107 → Peugeot_107 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005), year_to = coalesce(year_to, 2014), body_type = coalesce(body_type, 'hatchback')
where slug = 'peugeot-107'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-107'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-die-dv4-td',
       '1.4 L DV4-TD Diesel',
       null,
       null,
       1400,
       'diesel',
       null,
       null,
       'DV4-TD'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-107'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-spacetourer → Citroën_Spacetourer (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), body_type = coalesce(body_type, 'van')
where slug = 'citroen-spacetourer'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-301 → Peugeot_301_(1932–1936) (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1932), year_to = coalesce(year_to, 1936), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-301'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1465,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-301'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-6 → Peugeot_Type_6 (1 engines)
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l',
       '0.6 L',
       null,
       null,
       600,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-6'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-607 → Peugeot_607 (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2008), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-607'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-ew12',
       '2.2 L EW12',
       null,
       null,
       2200,
       null,
       null,
       null,
       'EW12'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-607'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-es9',
       '3.0 L ES9',
       null,
       null,
       3000,
       null,
       null,
       null,
       'ES9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-607'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-dw10',
       '2.0 L DW10',
       null,
       null,
       2000,
       null,
       null,
       null,
       'DW10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-607'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-dw12',
       '2.2 L DW12',
       null,
       null,
       2200,
       null,
       null,
       null,
       'DW12'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-607'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-7l-die-dt17',
       '2.7 L DT17 Diesel',
       null,
       null,
       2700,
       'diesel',
       null,
       null,
       'DT17'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-607'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-rcz → Peugeot_RCZ (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), year_to = coalesce(year_to, 2015)
where slug = 'peugeot-rcz'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-ep6',
       '1.6 L EP6',
       null,
       null,
       1600,
       null,
       null,
       null,
       'EP6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-rcz'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-ep6cdtr',
       '1.6 L EP6CDTR',
       null,
       null,
       1600,
       null,
       null,
       null,
       'EP6CDTR'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-rcz'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-rifter-2018 → Peugeot_Rifter (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), body_type = coalesce(body_type, 'pickup')
where slug = 'peugeot-rifter-2018'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-c4-picasso → Citroën_C4_Picasso (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2022)
where slug = 'citroen-c4-picasso'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-14 → Peugeot_Type_14 (0 engines)

-- peugeot/peugeot-type-108 → Peugeot_Type_108 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1908)
where slug = 'peugeot-type-108'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-302 → Peugeot_302 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1936), year_to = coalesce(year_to, 1937), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-302'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l',
       '1.8 L',
       null,
       null,
       1758,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-302'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-126 → Peugeot_Type_126 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1910)
where slug = 'peugeot-type-126'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l',
       '2.2 L',
       null,
       null,
       2212,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-126'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l',
       '0.8 L',
       null,
       null,
       785,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-126'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-118 → Peugeot_Type_118 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1909)
where slug = 'peugeot-type-118'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-37 → Peugeot_Type_37 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1902)
where slug = 'peugeot-type-37'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-27 → Peugeot_Type_27 (0 engines)

-- peugeot/peugeot-type-28 → Peugeot_Type_28 (0 engines)

-- peugeot/peugeot-type-63 → Peugeot_Type_63 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1904)
where slug = 'peugeot-type-63'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-25 → Peugeot_Type_25 (0 engines)

-- peugeot/peugeot-type-68 → Peugeot_Type_68 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1905)
where slug = 'peugeot-type-68'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-176 → Peugeot_Type_176 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1925), year_to = coalesce(year_to, 1928)
where slug = 'peugeot-type-176'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-5l',
       '2.5 L',
       null,
       null,
       2493,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-176'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-hoggar-coupe-utility → Peugeot_Hoggar_(coupé_utility) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010)
where slug = 'peugeot-hoggar-coupe-utility'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-58 → Peugeot_Type_58 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1904)
where slug = 'peugeot-type-58'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-bijou → Citroën_Bijou (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1959), year_to = coalesce(year_to, 1964)
where slug = 'citroen-bijou'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l-pet',
       '0.4 L',
       null,
       null,
       425,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-bijou'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-406 → Peugeot_406 (9 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1995), year_to = coalesce(year_to, 2004), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-406'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-xu5',
       '1.6 L XU5',
       null,
       null,
       1600,
       null,
       null,
       null,
       'XU5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-406'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-ew7',
       '1.8 L EW7',
       null,
       null,
       1800,
       null,
       null,
       null,
       'EW7'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-406'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-ew10',
       '2.0 L EW10',
       null,
       null,
       2000,
       null,
       null,
       null,
       'EW10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-406'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-ew12',
       '2.2 L EW12',
       null,
       null,
       2200,
       null,
       null,
       null,
       'EW12'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-406'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-es9',
       '3.0 L ES9',
       null,
       null,
       3000,
       null,
       null,
       null,
       'ES9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-406'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-die-xud9',
       '1.9 L XUD9 Diesel',
       null,
       null,
       1900,
       'diesel',
       null,
       null,
       'XUD9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-406'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-die-dw10',
       '2.0 L DW10 Diesel',
       null,
       null,
       2000,
       'diesel',
       null,
       null,
       'DW10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-406'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-die-xud11',
       '2.1 L XUD11 Diesel',
       null,
       null,
       2100,
       'diesel',
       null,
       null,
       'XUD11'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-406'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-2l-die-dw12',
       '2.2 L DW12 Diesel',
       null,
       null,
       2200,
       'diesel',
       null,
       null,
       'DW12'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-406'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-xsara → Citroën_Xsara (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997), year_to = coalesce(year_to, 2006), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-xsara'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-304 → Peugeot_304 (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1969), year_to = coalesce(year_to, 1980), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-304'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l-xk5',
       '0.1 L XK5',
       null,
       null,
       127,
       null,
       null,
       null,
       'XK5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-304'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l-xk4',
       '0.1 L XK4',
       null,
       null,
       130,
       null,
       null,
       null,
       'XK4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-304'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-3l-xl3',
       '0.3 L XL3',
       null,
       null,
       288,
       null,
       null,
       null,
       'XL3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-304'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-3l-xl5',
       '0.3 L XL5',
       null,
       null,
       290,
       null,
       null,
       null,
       'XL5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-304'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l-xl4d',
       '0.4 L XL4D',
       null,
       null,
       357,
       null,
       null,
       null,
       'XL4D'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-304'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       548,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-304'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-proxima → Peugeot_Proxima (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), body_type = coalesce(body_type, 'coupe')
where slug = 'peugeot-proxima'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-9l',
       '2.9 L',
       null,
       null,
       2850,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-proxima'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-31 → Peugeot_Type_31 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1900), year_to = coalesce(year_to, 1902)
where slug = 'peugeot-type-31'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-faf → Citroën_FAF (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1973), year_to = coalesce(year_to, 1981)
where slug = 'citroen-faf'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-208-t16 → Peugeot_208_T16 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014)
where slug = 'peugeot-208-t16'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-208-t16'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-403 → Peugeot_403 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1955), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-403'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l-tm5',
       '1.3 L TM5',
       null,
       null,
       1290,
       null,
       null,
       null,
       'TM5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-403'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-401 → Peugeot_401 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1934), year_to = coalesce(year_to, 1935)
where slug = 'peugeot-401'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-401'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-7u → Citroën_7U (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1935), year_to = coalesce(year_to, 1938)
where slug = 'citroen-7u'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-7u'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-synergie → Citroën_Synergie (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), body_type = coalesce(body_type, 'mpv')
where slug = 'citroen-synergie'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-berlingo-electrique → Citroën_Berlingo_électrique (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), year_to = coalesce(year_to, 2005)
where slug = 'citroen-berlingo-electrique'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-3008 → Peugeot_3008 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), body_type = coalesce(body_type, 'suv')
where slug = 'peugeot-3008'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-208 → Peugeot_208 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012)
where slug = 'peugeot-208'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-sr1 → Peugeot_SR1 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'convertible')
where slug = 'peugeot-sr1'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-hyb',
       '1.6 L HYBRID',
       null,
       null,
       1600,
       'hybrid',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-sr1'
on conflict (model_id, slug) do nothing;

-- peugeot/gt-by-citroen → GT_by_Citroën (2 engines)
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '572kw',
       '572kW',
       572,
       778,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'gt-by-citroen'
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
where mk.slug = 'peugeot' and vm.slug = 'gt-by-citroen'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-5 → Peugeot_Type_5 (1 engines)
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l',
       '0.6 L',
       null,
       null,
       565,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-5'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-xantia → Citroën_Xantia (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), year_to = coalesce(year_to, 2001), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-xantia'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-xantia'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-xantia'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-xantia'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-xantia'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-xantia'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l',
       '2.1 L',
       null,
       null,
       2100,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-xantia'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-206 → Peugeot_206 (12 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1998), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-206'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       1000,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-tu1jp',
       '1.1 L TU1JP',
       null,
       null,
       1100,
       null,
       null,
       null,
       'TU1JP'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-tu3a',
       '1.4 L TU3A',
       null,
       null,
       1400,
       null,
       null,
       null,
       'TU3A'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-et3j4',
       '1.4 L ET3J4',
       null,
       null,
       1400,
       null,
       null,
       null,
       'ET3J4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-tu5jp',
       '1.6 L TU5JP',
       null,
       null,
       1600,
       null,
       null,
       null,
       'TU5JP'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-tu5jp4',
       '1.6 L TU5JP4',
       null,
       null,
       1600,
       null,
       null,
       null,
       'TU5JP4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-ew10j4',
       '2.0 L EW10J4',
       null,
       null,
       2000,
       null,
       null,
       null,
       'EW10J4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-ew10j4s',
       '2.0 L EW10J4S',
       null,
       null,
       2000,
       null,
       null,
       null,
       'EW10J4S'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-die-dv4',
       '1.4 L DV4 Diesel',
       null,
       null,
       1400,
       'diesel',
       null,
       null,
       'DV4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die-dv6',
       '1.6 L DV6 Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       'DV6'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-dw8',
       '1.9 L DW8',
       null,
       null,
       1900,
       null,
       null,
       null,
       'DW8'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-die-dw10',
       '2.0 L DW10 Diesel',
       null,
       null,
       2000,
       'diesel',
       null,
       null,
       'DW10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-206'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-907 → Peugeot_907 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004)
where slug = 'peugeot-907'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-36 → Peugeot_Type_36 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1901), year_to = coalesce(year_to, 1902), body_type = coalesce(body_type, 'roadster')
where slug = 'peugeot-type-36'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l',
       '0.6 L',
       null,
       null,
       642,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-36'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-visa → Citroën_Visa (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1978), year_to = coalesce(year_to, 1988), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-visa'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l-v06',
       '0.7 L V06',
       null,
       null,
       652,
       null,
       null,
       null,
       'V06'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-visa'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l',
       '1.0 L',
       null,
       null,
       954,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-visa'
on conflict (model_id, slug) do nothing;
