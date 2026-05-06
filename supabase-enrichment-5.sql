-- Enrichment chunk 5/8
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l',
       '0.1 L',
       null,
       null,
       124,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-visa'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       219,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-visa'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l-xyi4',
       '0.4 L XYI4',
       null,
       null,
       360,
       null,
       null,
       null,
       'XYI4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-visa'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-visa'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-die-xud7',
       '0.8 L XUD7 Diesel',
       null,
       null,
       769,
       'diesel',
       null,
       null,
       'XUD7'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-visa'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-partner → Peugeot_Partner (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), body_type = coalesce(body_type, 'pickup')
where slug = 'peugeot-partner'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/talbot-express → Talbot_Express (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981)
where slug = 'talbot-express'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-10 → Peugeot_Type_10 (1 engines)
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-10'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-type-a → Citroën_Type_A (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1919), year_to = coalesce(year_to, 1921), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-type-a'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-type-a'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-belphegor → Citroën_Belphégor (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), year_to = coalesce(year_to, 1974)
where slug = 'citroen-belphegor'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-6l',
       '5.6 L',
       null,
       null,
       5607,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-belphegor'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-207-s2000 → Peugeot_207_S2000 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007)
where slug = 'peugeot-207-s2000'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-207-s2000'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-c3-picasso → Citroën_C3_Picasso (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), year_to = coalesce(year_to, 2017), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-c3-picasso'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c3-picasso'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c3-picasso'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-159 → Peugeot_Type_159 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1919), year_to = coalesce(year_to, 1920)
where slug = 'peugeot-type-159'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1452,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-159'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-153 → Peugeot_Type_153 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1913), year_to = coalesce(year_to, 1916)
where slug = 'peugeot-type-153'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-153'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-153'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-177 → Peugeot_Type_177 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1924), year_to = coalesce(year_to, 1929)
where slug = 'peugeot-type-177'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-174 → Peugeot_Type_174 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1923), year_to = coalesce(year_to, 1928)
where slug = 'peugeot-type-174'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-174'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-175 → Peugeot_Type_175 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1923), year_to = coalesce(year_to, 1924)
where slug = 'peugeot-type-175'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '3-0l-la5',
       '3.0 L LA5',
       null,
       null,
       2951,
       null,
       null,
       null,
       'LA5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-175'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-berlingo → Citroën_Berlingo (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), body_type = coalesce(body_type, 'pickup')
where slug = 'citroen-berlingo'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-173 → Peugeot_Type_173 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1922), year_to = coalesce(year_to, 1925)
where slug = 'peugeot-type-173'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-rosalie → Citroën_Rosalie (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1932), year_to = coalesce(year_to, 1938), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-rosalie'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1452,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-rosalie'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-c15 → Citroën_C15 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1984), year_to = coalesce(year_to, 2006), body_type = coalesce(body_type, 'van')
where slug = 'citroen-c15'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-c2 → Citroën_C2 (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-c2'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-tu1',
       '1.1 L TU1',
       null,
       null,
       1100,
       null,
       null,
       null,
       'TU1'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-c2'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c2'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c2'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c2'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c2'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c2'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-504 → Peugeot_504 (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-504'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-xc5',
       '1.6 L XC5',
       null,
       null,
       1618,
       null,
       null,
       null,
       'XC5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-504'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-504'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l',
       '2.0 L',
       null,
       null,
       1971,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-504'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-504'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-xd88',
       '1.9 L XD88',
       null,
       null,
       1948,
       null,
       null,
       null,
       'XD88'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-504'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l-xd90',
       '2.1 L XD90',
       null,
       null,
       2112,
       null,
       null,
       null,
       'XD90'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-504'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-504'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-54 → Peugeot_Type_54 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1903)
where slug = 'peugeot-type-54'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       652,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-54'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-15 → Peugeot_Type_15 (0 engines)

-- peugeot/peugeot-605 → Peugeot_605 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-605'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-605'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-405 → Peugeot_405 (9 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1987), year_to = coalesce(year_to, 1997), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-405'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-405'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-tu5',
       '1.6 L TU5',
       null,
       null,
       1587,
       null,
       null,
       null,
       'TU5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-405'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-405'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-xu7',
       '1.8 L XU7',
       null,
       null,
       1761,
       null,
       null,
       null,
       'XU7'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-405'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-405'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-0l-xu10',
       '2.0 L XU10',
       null,
       null,
       1998,
       null,
       null,
       null,
       'XU10'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-405'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-die-xud7',
       '1.8 L XUD7 Diesel',
       null,
       null,
       1769,
       'diesel',
       null,
       null,
       'XUD7'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-405'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-405'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-die-xud9',
       '1.9 L XUD9 Diesel',
       null,
       null,
       1905,
       'diesel',
       null,
       null,
       'XUD9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-405'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-404 → Peugeot_404 (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1960), year_to = coalesce(year_to, 1975), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-404'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1468,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-404'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1616,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-404'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-xm7',
       '1.8 L XM7',
       null,
       null,
       1796,
       null,
       null,
       null,
       'XM7'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-404'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-xd85',
       '1.8 L XD85',
       null,
       null,
       1816,
       null,
       null,
       null,
       'XD85'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-404'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-xd88',
       '1.9 L XD88',
       null,
       null,
       1948,
       null,
       null,
       null,
       'XD88'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-404'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-4007 → Peugeot_4007 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), year_to = coalesce(year_to, 2012), body_type = coalesce(body_type, 'suv')
where slug = 'peugeot-4007'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-4007'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-4007'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-4007'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-33 → Peugeot_Type_33 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1901), year_to = coalesce(year_to, 1902)
where slug = 'peugeot-type-33'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-33'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-26 → Peugeot_Type_26 (0 engines)

-- peugeot/peugeot-type-4 → Peugeot_Type_4 (1 engines)
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-4'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-8 → Peugeot_Type_8 (1 engines)
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-8'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-106 → Peugeot_106 (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1991), year_to = coalesce(year_to, 2003), body_type = coalesce(body_type, 'hatchback')
where slug = 'peugeot-106'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-tu9',
       '1.0 L TU9',
       null,
       null,
       954,
       null,
       null,
       null,
       'TU9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-106'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-106'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-106'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-106'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-tu5',
       '1.6 L TU5',
       null,
       null,
       1587,
       null,
       null,
       null,
       'TU5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-106'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-tud3',
       '1.4 L TUD3',
       null,
       null,
       1360,
       null,
       null,
       null,
       'TUD3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-106'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-106'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-201 → Peugeot_201 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1929), year_to = coalesce(year_to, 1937), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-201'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1085,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-201'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-bx → Citroën_BX (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1982), year_to = coalesce(year_to, 1994), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-bx'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-bx'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-104 → Peugeot_104 (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1972), year_to = coalesce(year_to, 1988), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-104'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-104'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l',
       '0.1 L',
       null,
       null,
       124,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-104'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       219,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-104'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       360,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-104'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-508 → Peugeot_508 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), year_to = coalesce(year_to, 2025), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-508'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-jumpy → Citroën_Jumpy (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), body_type = coalesce(body_type, 'van')
where slug = 'citroen-jumpy'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-601 → Peugeot_601 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1934), year_to = coalesce(year_to, 1935), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-601'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l',
       '0.1 L',
       null,
       null,
       148,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-601'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '44kw',
       '44kW',
       44,
       60,
       null,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-601'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-lacoste → Citroën_Lacoste (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'suv')
where slug = 'citroen-lacoste'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-lacoste'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-402 → Peugeot_402 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1935), year_to = coalesce(year_to, 1942), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-402'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-402'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l',
       '2.1 L',
       null,
       null,
       2142,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-402'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-2008 → Peugeot_2008 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013), body_type = coalesce(body_type, 'suv')
where slug = 'peugeot-2008'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-boxer → Peugeot_Boxer (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981)
where slug = 'peugeot-boxer'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-j5 → Peugeot_J5 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981)
where slug = 'peugeot-j5'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-135 → Peugeot_Type_135 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1911), year_to = coalesce(year_to, 1913), body_type = coalesce(body_type, 'sedan')
where slug = 'peugeot-type-135'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-0l',
       '5.0 L',
       null,
       null,
       5027,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-135'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-48 → Peugeot_Type_48 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1902), year_to = coalesce(year_to, 1909)
where slug = 'peugeot-type-48'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-184 → Peugeot_Type_184 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1928), year_to = coalesce(year_to, 1929)
where slug = 'peugeot-type-184'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-57 → Peugeot_Type_57 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1904)
where slug = 'peugeot-type-57'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-66 → Peugeot_Type_66 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1904)
where slug = 'peugeot-type-66'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-66'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-c5 → Citroën_C5 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), year_to = coalesce(year_to, 2018)
where slug = 'citroen-c5'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-405-turbo-16 → Peugeot_405_Turbo_16 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1988), year_to = coalesce(year_to, 1990)
where slug = 'peugeot-405-turbo-16'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-405-turbo-16'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-4002 → Peugeot_4002 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003)
where slug = 'peugeot-4002'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '6-0l-ep9',
       '6.0 L EP9',
       null,
       null,
       6000,
       null,
       null,
       null,
       'EP9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-4002'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-99 → Peugeot_Type_99 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1907)
where slug = 'peugeot-type-99'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-type-7 → Peugeot_Type_7 (1 engines)
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-type-7'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-108 → Peugeot_108 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), body_type = coalesce(body_type, 'hatchback')
where slug = 'peugeot-108'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-108'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-pet-eb2-f',
       '1.2 L EB2-F',
       null,
       null,
       1200,
       'petrol',
       null,
       null,
       'EB2-F'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-108'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-pet-b52',
       '1.0 L B52',
       null,
       null,
       1000,
       'petrol',
       null,
       null,
       'B52'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-108'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-j9 → Peugeot_J9 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), year_to = coalesce(year_to, 1991), body_type = coalesce(body_type, 'van')
where slug = 'peugeot-j9'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-j7 → Peugeot_J7 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), year_to = coalesce(year_to, 1980), body_type = coalesce(body_type, 'van')
where slug = 'peugeot-j7'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/peugeot-20cup → Peugeot_20Cup (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005)
where slug = 'peugeot-20cup'
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-20cup'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-flux → Peugeot_Flux (1 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'roadster')
where slug = 'peugeot-flux'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '93kw-ele',
       'ELECTRIC 93kW',
       93,
       126,
       null,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-flux'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-d3-and-d4 → Peugeot_D3_and_D4 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1947), year_to = coalesce(year_to, 1950)
where slug = 'peugeot-d3-and-d4'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-3l',
       '0.3 L',
       null,
       null,
       290,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-d3-and-d4'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       468,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'peugeot-d3-and-d4'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'peugeot' and vm.slug = 'peugeot-d3-and-d4'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-survolt → Citroën_Survolt (1 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'coupe')
where slug = 'citroen-survolt'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '221kw-ele',
       'ELECTRIC 221kW',
       221,
       300,
       null,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-survolt'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-u23 → Citroën_U23 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1935), year_to = coalesce(year_to, 1969)
where slug = 'citroen-u23'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-u23'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-u23'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-ex1-concept → Peugeot_EX1_Concept (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'roadster')
where slug = 'peugeot-ex1-concept'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-c-crosser → Citroën_C-Crosser (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), year_to = coalesce(year_to, 2012), body_type = coalesce(body_type, 'suv')
where slug = 'citroen-c-crosser'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c-crosser'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c-crosser'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-ds4 → DS_No._4 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-ds4'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-ds4'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-ds4'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-ds4'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-ax → Citroën_AX (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 1998), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-ax'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-tu9',
       '1.0 L TU9',
       null,
       null,
       954,
       null,
       null,
       null,
       'TU9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-ax'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-ax'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-ax'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-ax'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-tud3',
       '1.4 L TUD3',
       null,
       null,
       1360,
       null,
       null,
       null,
       'TUD3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-ax'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-ax'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-sm → Citroën_SM (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), year_to = coalesce(year_to, 1975), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-sm'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-sm'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-sm'
on conflict (model_id, slug) do nothing;

-- peugeot/ds-5 → DS_5 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011), year_to = coalesce(year_to, 2018), body_type = coalesce(body_type, 'hatchback')
where slug = 'ds-5'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-thp163',
       '1.6 L THP163',
       null,
       null,
       1600,
       null,
       null,
       null,
       'THP163'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'ds-5'
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
where mk.slug = 'peugeot' and vm.slug = 'ds-5'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-c35 → Citroën_C35 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1974), year_to = coalesce(year_to, 1987)
where slug = 'citroen-c35'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-dyane → Citroën_Dyane (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1967), year_to = coalesce(year_to, 1983), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-dyane'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       425,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-dyane'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       435,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-dyane'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-dyane'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-c6 → Citroën_C6 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), year_to = coalesce(year_to, 2023), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-c6'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c6'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c6'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-c6'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-cx → Citroën_CX (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1974), year_to = coalesce(year_to, 1991), body_type = coalesce(body_type, 'estate')
where slug = 'citroen-cx'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-cx'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-cx'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-cx'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-cx'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-cx'
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-cx'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-lna → Citroën_LNA (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1976), year_to = coalesce(year_to, 1986), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-lna'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l-r06',
       '0.6 L R06',
       null,
       null,
       602,
       null,
       null,
       null,
       'R06'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-lna'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-24 → Peugeot_Type_24 (0 engines)

-- peugeot/citroen-tub → Citroën_TUB (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1939)
where slug = 'citroen-tub'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-xsara-picasso → Citroën_Xsara_Picasso (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2010), body_type = coalesce(body_type, 'mpv')
where slug = 'citroen-xsara-picasso'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- peugeot/citroen-h-van → Citroën_H_Van (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1947), year_to = coalesce(year_to, 1981), body_type = coalesce(body_type, 'pickup')
where slug = 'citroen-h-van'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1628,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-h-van'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'peugeot' and vm.slug = 'citroen-h-van'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1621,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-h-van'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-tmd85',
       '1.8 L TMD85',
       null,
       null,
       1816,
       null,
       null,
       null,
       'TMD85'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-h-van'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-xd88',
       '1.9 L XD88',
       null,
       null,
       1948,
       null,
       null,
       null,
       'XD88'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-h-van'
on conflict (model_id, slug) do nothing;

-- peugeot/citroen-type-c → Citroën_Type_C_5HP (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1922), body_type = coalesce(body_type, 'convertible')
where slug = 'citroen-type-c'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-pet',
       '0.8 L',
       null,
       null,
       800,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'peugeot' and vm.slug = 'citroen-type-c'
on conflict (model_id, slug) do nothing;

-- peugeot/peugeot-type-181 → Peugeot_Type_181 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1925), year_to = coalesce(year_to, 1928)
where slug = 'peugeot-type-181'
  and make_id = (select id from public.vehicle_makes where slug = 'peugeot');

-- citroen/citroen-c35 → Citroën_C35 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1974), year_to = coalesce(year_to, 1987)
where slug = 'citroen-c35'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-acadiane → Citroën_Acadiane (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1977), year_to = coalesce(year_to, 1987), body_type = coalesce(body_type, 'van')
where slug = 'citroen-acadiane'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/ds-5 → DS_5 (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011), year_to = coalesce(year_to, 2018), body_type = coalesce(body_type, 'hatchback')
where slug = 'ds-5'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-thp163',
       '1.6 L THP163',
       null,
       null,
       1600,
       null,
       null,
       null,
       'THP163'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'ds-5'
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
where mk.slug = 'citroen' and vm.slug = 'ds-5'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c6 → Citroën_C6 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2016), year_to = coalesce(year_to, 2023), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-c6'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c6'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c6'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c6'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-dyane → Citroën_Dyane (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1967), year_to = coalesce(year_to, 1983), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-dyane'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       425,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-dyane'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       435,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-dyane'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'citroen' and vm.slug = 'citroen-dyane'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-cx → Citroën_CX (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1974), year_to = coalesce(year_to, 1991), body_type = coalesce(body_type, 'estate')
where slug = 'citroen-cx'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-cx'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-cx'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-cx'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-cx'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-cx'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-cx'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-lna → Citroën_LNA (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1976), year_to = coalesce(year_to, 1986), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-lna'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l-r06',
       '0.6 L R06',
       null,
       null,
       602,
       null,
       null,
       null,
       'R06'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-lna'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-tub → Citroën_TUB (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1939)
where slug = 'citroen-tub'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-type-c → Citroën_Type_C_5HP (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1922), body_type = coalesce(body_type, 'convertible')
where slug = 'citroen-type-c'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-pet',
       '0.8 L',
       null,
       null,
       800,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-type-c'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-m35 → Citroën_M35 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1969)
where slug = 'citroen-m35'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l',
       '0.5 L',
       null,
       null,
       498,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-m35'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-gq → GQ_by_Citroën (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-gq'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-h-van → Citroën_H_Van (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1947), year_to = coalesce(year_to, 1981), body_type = coalesce(body_type, 'pickup')
where slug = 'citroen-h-van'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1628,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-h-van'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'citroen' and vm.slug = 'citroen-h-van'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l',
       '1.6 L',
       null,
       null,
       1621,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-h-van'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-8l-tmd85',
       '1.8 L TMD85',
       null,
       null,
       1816,
       null,
       null,
       null,
       'TMD85'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-h-van'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-9l-xd88',
       '1.9 L XD88',
       null,
       null,
       1948,
       null,
       null,
       null,
       'XD88'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-h-van'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-lacoste → Citroën_Lacoste (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'suv')
where slug = 'citroen-lacoste'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-lacoste'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-metropolis → Citroën_Metropolis (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-metropolis'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-metropolis'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-xsara-picasso → Citroën_Xsara_Picasso (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1999), year_to = coalesce(year_to, 2010), body_type = coalesce(body_type, 'mpv')
where slug = 'citroen-xsara-picasso'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c4-cactus → Citroën_C4_Cactus (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2018), year_to = coalesce(year_to, 2024), body_type = coalesce(body_type, 'suv')
where slug = 'citroen-c4-cactus'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-pet-eb2',
       '1.2 L EB2',
       null,
       null,
       1200,
       'petrol',
       null,
       null,
       'EB2'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-c4-cactus'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c4-cactus'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c4 → Citroën_C4 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2004)
where slug = 'citroen-c4'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-tulip → Citroën_Tulip (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994)
where slug = 'citroen-tulip'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/ds-9 → DS_9 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2020), year_to = coalesce(year_to, 2024), body_type = coalesce(body_type, 'sedan')
where slug = 'ds-9'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'ds-9'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-hypnos → Citroën_Hypnos (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), body_type = coalesce(body_type, 'suv')
where slug = 'citroen-hypnos'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c5 → Citroën_C5 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2000), year_to = coalesce(year_to, 2018)
where slug = 'citroen-c5'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c8 → Citroën_C8 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), body_type = coalesce(body_type, 'mpv')
where slug = 'citroen-c8'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-gs-camargue → Citroën_GS_Camargue (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1972), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-gs-camargue'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-gs-camargue'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c3-xr → Citroën_C3-XR (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), year_to = coalesce(year_to, 2023), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-c3-xr'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c3-xr'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c3-xr'
on conflict (model_id, slug) do nothing;

-- citroen/gt-by-citroen → GT_by_Citroën (2 engines)
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
where mk.slug = 'citroen' and vm.slug = 'gt-by-citroen'
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
where mk.slug = 'citroen' and vm.slug = 'gt-by-citroen'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-mehari → Citroën_Méhari (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1968), year_to = coalesce(year_to, 1988), body_type = coalesce(body_type, 'roadster')
where slug = 'citroen-mehari'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-mehari'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-nemo → Citroën_Nemo (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1977), year_to = coalesce(year_to, 2024)
where slug = 'citroen-nemo'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-xantia → Citroën_Xantia (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1992), year_to = coalesce(year_to, 2001), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-xantia'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-xantia'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-xantia'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-xantia'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-xantia'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-xantia'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-xantia'
on conflict (model_id, slug) do nothing;

-- citroen/ds-5ls → DS_5LS (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2014), year_to = coalesce(year_to, 2019), body_type = coalesce(body_type, 'sedan')
where slug = 'ds-5ls'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'ds-5ls'
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
where mk.slug = 'citroen' and vm.slug = 'ds-5ls'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-type-b12 → Citroën_Type_B12 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1925), year_to = coalesce(year_to, 1927), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-type-b12'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l-pet',
       '0.5 L',
       null,
       null,
       452,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-type-b12'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c5-x → Citroën_C5_X (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2021), year_to = coalesce(year_to, 2026), body_type = coalesce(body_type, 'estate')
where slug = 'citroen-c5-x'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c5-x'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c5-x'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-hyb-ep6fdt',
       '1.6 L EP6FDT HYBRID',
       null,
       null,
       1600,
       'hybrid',
       null,
       null,
       'EP6FDT'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-c5-x'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c3 → Citroën_C3 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-c3'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-2cv-fourgonnette → Citroën_2CV_Fourgonnette (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1948), year_to = coalesce(year_to, 1990), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-2cv-fourgonnette'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       375,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-2cv-fourgonnette'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       425,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-2cv-fourgonnette'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       435,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-2cv-fourgonnette'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'citroen' and vm.slug = 'citroen-2cv-fourgonnette'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-visa → Citroën_Visa (7 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1978), year_to = coalesce(year_to, 1988), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-visa'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-visa'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-visa'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-1l',
       '0.1 L',
       null,
       null,
       124,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-visa'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-2l',
       '0.2 L',
       null,
       null,
       219,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-visa'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l-xyi4',
       '0.4 L XYI4',
       null,
       null,
       360,
       null,
       null,
       null,
       'XYI4'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-visa'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-visa'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-8l-die-xud7',
       '0.8 L XUD7 Diesel',
       null,
       null,
       769,
       'diesel',
       null,
       null,
       'XUD7'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-visa'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-gs → Citroën_GS (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), year_to = coalesce(year_to, 1986), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-gs'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-gs'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-gs'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-gs'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-gs'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-gs'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-2cv → Citroën_2CV (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1948), year_to = coalesce(year_to, 1990), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-2cv'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       375,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-2cv'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       425,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-2cv'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-4l',
       '0.4 L',
       null,
       null,
       435,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-2cv'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'citroen' and vm.slug = 'citroen-2cv'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c-airplay → Citroën_C-Airplay (0 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-c-airplay'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c-buggy → Citroën_C-Buggy (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006)
where slug = 'citroen-c-buggy'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-zabrus → Citroën_Zabrus (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986)
where slug = 'citroen-zabrus'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '2-1l',
       '2.1 L',
       null,
       null,
       2141,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-zabrus'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-ds → Citroën_DS (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1955), year_to = coalesce(year_to, 1975), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-ds'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-ds'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-ds'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-ds'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-ds'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c3-picasso → Citroën_C3_Picasso (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2008), year_to = coalesce(year_to, 2017), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-c3-picasso'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c3-picasso'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c3-picasso'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-type-a → Citroën_Type_A (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1919), year_to = coalesce(year_to, 1921), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-type-a'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-type-a'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c-metisse → Citroën_C-Métisse (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006)
where slug = 'citroen-c-metisse'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c-metisse'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-ds-inside → Citroën_DS_Inside (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-ds-inside'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c3-aircross → Citroën_C3_Aircross (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), year_to = coalesce(year_to, 2020), body_type = coalesce(body_type, 'suv')
where slug = 'citroen-c3-aircross'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-revolte-2009 → Citroën_Revolte (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2009), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-revolte-2009'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '238kw-hyb',
       'HYBRID 238kW',
       238,
       323,
       null,
       'hybrid',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-revolte-2009'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-g-van → Citroën_G_Van (1 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'van')
where slug = 'citroen-g-van'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-6l-22kw',
       '0.6 L 22kW',
       22,
       29,
       602,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-g-van'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-b10 → Citroën_Type_B10 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1924), year_to = coalesce(year_to, 1925), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-b10'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l-pet',
       '0.5 L',
       null,
       null,
       452,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-b10'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-karin → Citroën_Karin (0 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'coupe')
where slug = 'citroen-karin'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-tubik → Citroën_Tubik (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011)
where slug = 'citroen-tubik'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c-elysee → Citroën_C-Elysée (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), year_to = coalesce(year_to, 2022), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-c-elysee'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-2l-ele-eb2',
       '1.2 L EB2 ELECTRIC',
       null,
       null,
       1200,
       'electric',
       null,
       null,
       'EB2'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-c-elysee'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-ec5',
       '1.6 L EC5',
       null,
       null,
       1600,
       null,
       null,
       null,
       'EC5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-c-elysee'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c-elysee'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c-elysee'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c-elysee'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-belphegor → Citroën_Belphégor (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1965), year_to = coalesce(year_to, 1974)
where slug = 'citroen-belphegor'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '5-6l',
       '5.6 L',
       null,
       null,
       5607,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-belphegor'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-survolt → Citroën_Survolt (1 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'coupe')
where slug = 'citroen-survolt'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '221kw-ele',
       'ELECTRIC 221kW',
       221,
       300,
       null,
       'electric',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-survolt'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-berlingo → Citroën_Berlingo (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), body_type = coalesce(body_type, 'pickup')
where slug = 'citroen-berlingo'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c15 → Citroën_C15 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1984), year_to = coalesce(year_to, 2006), body_type = coalesce(body_type, 'van')
where slug = 'citroen-c15'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-xm → Citroën_XM (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1989), year_to = coalesce(year_to, 2000), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-xm'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-xm'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-xm'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-xm'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-xm'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-xm'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-type-c4 → Citroën_C4_&_C6 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1928), year_to = coalesce(year_to, 1932), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-type-c4'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-type-c4'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-rosalie → Citroën_Rosalie (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1932), year_to = coalesce(year_to, 1938), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-rosalie'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-5l',
       '1.5 L',
       null,
       null,
       1452,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-rosalie'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-activa → Citroën_Activa (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1988), body_type = coalesce(body_type, 'coupe')
where slug = 'citroen-activa'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-ami → Citroën_Ami_(electric_vehicle) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2020)
where slug = 'citroen-ami'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c1 → Citroën_C1 (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2005)
where slug = 'citroen-c1'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c2 → Citroën_C2 (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2003), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-c2'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l-tu1',
       '1.1 L TU1',
       null,
       null,
       1100,
       null,
       null,
       null,
       'TU1'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-c2'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c2'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c2'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c2'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c2'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c2'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-technospace → Citroën_Technospace (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2013)
where slug = 'citroen-technospace'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-saxo → Citroën_Saxo (5 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1996), year_to = coalesce(year_to, 2003), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-saxo'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-tu9',
       '1.0 L TU9',
       null,
       null,
       954,
       null,
       null,
       null,
       'TU9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-saxo'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-saxo'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-saxo'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-tu5',
       '1.6 L TU5',
       null,
       null,
       1587,
       null,
       null,
       null,
       'TU5'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-saxo'
on conflict (model_id, slug) do nothing;
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
where mk.slug = 'citroen' and vm.slug = 'citroen-saxo'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c3-cc21 → Citroën_C3_(CC21) (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-c3-cc21'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c4-picasso → Citroën_C4_Picasso (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2006), year_to = coalesce(year_to, 2022)
where slug = 'citroen-c4-picasso'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-traction-avant → Citroën_Traction_Avant (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1934), year_to = coalesce(year_to, 1941), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-traction-avant'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-traction-avant'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-traction-avant'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c-sportlounge → Citroën_C-SportLounge (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2011), year_to = coalesce(year_to, 2018), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-c-sportlounge'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-thp163',
       '1.6 L THP163',
       null,
       null,
       1600,
       null,
       null,
       null,
       'THP163'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-c-sportlounge'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c-sportlounge'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c4-aircross → Citroën_C4_Aircross (4 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2012), year_to = coalesce(year_to, 2017), body_type = coalesce(body_type, 'suv')
where slug = 'citroen-c4-aircross'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c4-aircross'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c4-aircross'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-6l-die-dv6c',
       '1.6 L DV6C Diesel',
       null,
       null,
       1600,
       'diesel',
       null,
       null,
       'DV6C'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-c4-aircross'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c4-aircross'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-bijou → Citroën_Bijou (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1959), year_to = coalesce(year_to, 1964)
where slug = 'citroen-bijou'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-bijou'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-xsara → Citroën_Xsara (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1997), year_to = coalesce(year_to, 2006), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-xsara'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/ds-4 → DS_4 (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), year_to = coalesce(year_to, 2018)
where slug = 'ds-4'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'ds-4'
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
where mk.slug = 'citroen' and vm.slug = 'ds-4'
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
where mk.slug = 'citroen' and vm.slug = 'ds-4'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c-zero → Citroën_C-Zero (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2010), year_to = coalesce(year_to, 2020), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-c-zero'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-oli → Citroën_Oli (0 engines)
update public.vehicle_models set body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-oli'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-faf → Citroën_FAF (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1973), year_to = coalesce(year_to, 1981)
where slug = 'citroen-faf'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-jumpy → Citroën_Jumpy (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1994), body_type = coalesce(body_type, 'van')
where slug = 'citroen-jumpy'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-sm → Citroën_SM (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1970), year_to = coalesce(year_to, 1975), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-sm'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-sm'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-sm'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-c3-pluriel → Citroën_C3_Pluriel (0 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2002), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-c3-pluriel'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');

-- citroen/citroen-c-crosser → Citroën_C-Crosser (2 engines)
update public.vehicle_models set year_from = coalesce(year_from, 2007), year_to = coalesce(year_to, 2012), body_type = coalesce(body_type, 'suv')
where slug = 'citroen-c-crosser'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c-crosser'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-c-crosser'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-axel → Oltcit_Club (3 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1981), year_to = coalesce(year_to, 1996), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-axel'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-7l',
       '0.7 L',
       null,
       null,
       652,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-axel'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-1l',
       '1.1 L',
       null,
       null,
       1129,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-axel'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-3l',
       '1.3 L',
       null,
       null,
       1299,
       null,
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-axel'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-type-b2 → Citroën_Type_B2 (1 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1921), year_to = coalesce(year_to, 1926), body_type = coalesce(body_type, 'sedan')
where slug = 'citroen-type-b2'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '0-5l-pet',
       '0.5 L',
       null,
       null,
       452,
       'petrol',
       null,
       null,
       null
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-type-b2'
on conflict (model_id, slug) do nothing;

-- citroen/citroen-ax → Citroën_AX (6 engines)
update public.vehicle_models set year_from = coalesce(year_from, 1986), year_to = coalesce(year_to, 1998), body_type = coalesce(body_type, 'hatchback')
where slug = 'citroen-ax'
  and make_id = (select id from public.vehicle_makes where slug = 'citroen');
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-0l-tu9',
       '1.0 L TU9',
       null,
       null,
       954,
       null,
       null,
       null,
       'TU9'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-ax'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-ax'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-ax'
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
where mk.slug = 'citroen' and vm.slug = 'citroen-ax'
on conflict (model_id, slug) do nothing;
insert into public.vehicle_types
  (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code)
select vm.id,
       '1-4l-tud3',
       '1.4 L TUD3',
       null,
       null,
       1360,
       null,
       null,
       null,
       'TUD3'
from public.vehicle_models vm
join public.vehicle_makes mk on mk.id = vm.make_id
where mk.slug = 'citroen' and vm.slug = 'citroen-ax'
on conflict (model_id, slug) do nothing;
