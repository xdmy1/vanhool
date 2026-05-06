-- =============================================================================
-- Vehicle taxonomy MEGA seed — part 5/6
-- KIA + NISSAN (~25 models, ~140 engines)
-- Idempotent. Run AFTER supabase-vehicles-seed-mega-4.sql.
-- =============================================================================

-- ============================================================================
-- KIA — 12 models, ~70 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'kia')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('picanto-i',   'Picanto I',   2004, 2011, 'hatchback'),
    ('picanto-ii',  'Picanto II',  2011, 2017, 'hatchback'),
    ('rio-iii',     'Rio III',     2011, 2017, 'sedan'),
    ('rio-iv',      'Rio IV',      2017, 2024, 'sedan'),
    ('ceed-i',      'Cee''d I',    2006, 2012, 'hatchback'),
    ('ceed-ii',     'Cee''d II',   2012, 2018, 'hatchback'),
    ('ceed-iii',    'Ceed III',    2018, 2024, 'hatchback'),
    ('optima-iii',  'Optima III',  2010, 2015, 'sedan'),
    ('optima-iv',   'Optima IV',   2015, 2020, 'sedan'),
    ('sportage-ii', 'Sportage II', 2004, 2010, 'suv'),
    ('sportage-iii','Sportage III',2010, 2016, 'suv'),
    ('sportage-iv', 'Sportage IV', 2015, 2021, 'suv'),
    ('sorento-ii',  'Sorento II',  2009, 2014, 'suv'),
    ('sorento-iii', 'Sorento III', 2014, 2020, 'suv')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'kia'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Picanto I
    ('picanto-i',   '1.0-45kw',     '1.0',          45,  61,  999, 'petrol', 2004, 2011, 'G4HG', 'FWD'),
    ('picanto-i',   '1.1-48kw',     '1.1',          48,  65, 1086, 'petrol', 2004, 2011, 'G4HG', 'FWD'),
    ('picanto-i',   '1.1-crdi-55kw','1.1 CRDi',     55,  75, 1120, 'diesel', 2005, 2011, 'D3FA', 'FWD'),
    -- Picanto II
    ('picanto-ii',  '1.0-51kw',     '1.0',          51,  69,  998, 'petrol', 2011, 2017, 'G3LA', 'FWD'),
    ('picanto-ii',  '1.0-cvvt-49kw','1.0 CVVT',     49,  66,  998, 'petrol', 2011, 2017, 'G3LA', 'FWD'),
    ('picanto-ii',  '1.2-cvvt-63kw','1.2 CVVT',     63,  85, 1248, 'petrol', 2011, 2017, 'G4LA', 'FWD'),
    -- Rio III
    ('rio-iii',     '1.2-63kw',     '1.2 CVVT',     63,  85, 1248, 'petrol', 2011, 2017, 'G4LA', 'FWD'),
    ('rio-iii',     '1.4-79kw',     '1.4 CVVT',     79, 108, 1396, 'petrol', 2011, 2017, 'G4FA', 'FWD'),
    ('rio-iii',     '1.4-gdi-99kw', '1.4 GDi',      99, 135, 1396, 'petrol', 2014, 2017, 'G4FD', 'FWD'),
    ('rio-iii',     '1.1-crdi-55kw','1.1 CRDi',     55,  75, 1120, 'diesel', 2011, 2017, 'D3FA', 'FWD'),
    ('rio-iii',     '1.4-crdi-66kw','1.4 CRDi',     66,  90, 1396, 'diesel', 2011, 2017, 'D4FC', 'FWD'),
    -- Rio IV
    ('rio-iv',      '1.0-tgdi-74kw','1.0 T-GDi',    74, 100,  998, 'petrol', 2017, 2024, 'G3LC', 'FWD'),
    ('rio-iv',      '1.0-tgdi-88kw','1.0 T-GDi',    88, 120,  998, 'petrol', 2017, 2024, 'G3LE', 'FWD'),
    ('rio-iv',      '1.2-mpi-62kw', '1.2 MPi',      62,  84, 1248, 'petrol', 2017, 2024, 'G4LA', 'FWD'),
    ('rio-iv',      '1.4-mpi-74kw', '1.4 MPi',      74, 100, 1396, 'petrol', 2017, 2024, 'G4LC', 'FWD'),
    ('rio-iv',      '1.4-crdi-66kw','1.4 CRDi',     66,  90, 1396, 'diesel', 2017, 2024, 'D4FC', 'FWD'),
    -- Cee'd I
    ('ceed-i',      '1.4-80kw',     '1.4 16V',      80, 109, 1396, 'petrol', 2007, 2012, 'G4FA', 'FWD'),
    ('ceed-i',      '1.6-93kw',     '1.6 16V',      93, 126, 1591, 'petrol', 2007, 2012, 'G4FC', 'FWD'),
    ('ceed-i',      '2.0-105kw',    '2.0 16V',     105, 143, 1975, 'petrol', 2007, 2012, 'G4GC', 'FWD'),
    ('ceed-i',      '1.4-crdi-66kw','1.4 CRDi',     66,  90, 1396, 'diesel', 2008, 2012, 'D4FC', 'FWD'),
    ('ceed-i',      '1.6-crdi-66kw','1.6 CRDi',     66,  90, 1582, 'diesel', 2007, 2012, 'D4FB', 'FWD'),
    ('ceed-i',      '1.6-crdi-85kw','1.6 CRDi',     85, 115, 1582, 'diesel', 2007, 2012, 'D4FB', 'FWD'),
    ('ceed-i',      '2.0-crdi-103kw','2.0 CRDi',  103, 140, 1991, 'diesel', 2007, 2012, 'D4EA', 'FWD'),
    -- Cee'd II
    ('ceed-ii',     '1.4-cvvt-73kw','1.4 CVVT',     73,  99, 1396, 'petrol', 2012, 2018, 'G4FA', 'FWD'),
    ('ceed-ii',     '1.6-gdi-99kw', '1.6 GDi',      99, 135, 1591, 'petrol', 2012, 2018, 'G4FD', 'FWD'),
    ('ceed-ii',     '1.6-tgdi-150kw','1.6 T-GDi GT',150,204,1591,'petrol', 2013, 2018, 'G4FJ', 'FWD'),
    ('ceed-ii',     '1.4-crdi-66kw','1.4 CRDi',     66,  90, 1396, 'diesel', 2012, 2018, 'D4FC', 'FWD'),
    ('ceed-ii',     '1.6-crdi-81kw','1.6 CRDi',     81, 110, 1582, 'diesel', 2012, 2018, 'D4FB', 'FWD'),
    ('ceed-ii',     '1.6-crdi-94kw','1.6 CRDi',     94, 128, 1582, 'diesel', 2012, 2018, 'D4FB', 'FWD'),
    -- Ceed III
    ('ceed-iii',    '1.0-tgdi-74kw','1.0 T-GDi',    74, 100,  998, 'petrol', 2018, 2024, 'G3LC', 'FWD'),
    ('ceed-iii',    '1.0-tgdi-88kw','1.0 T-GDi',    88, 120,  998, 'petrol', 2018, 2024, 'G3LC', 'FWD'),
    ('ceed-iii',    '1.4-tgdi-103kw','1.4 T-GDi', 103, 140, 1353, 'petrol', 2018, 2020, 'G4LD', 'FWD'),
    ('ceed-iii',    '1.5-tgdi-117kw','1.5 T-GDi', 117, 159, 1482, 'petrol', 2020, 2024, 'G4FT', 'FWD'),
    ('ceed-iii',    '1.6-crdi-85kw','1.6 CRDi',     85, 116, 1598, 'diesel', 2018, 2024, 'D4FE', 'FWD'),
    ('ceed-iii',    '1.6-crdi-100kw','1.6 CRDi', 100, 136, 1598, 'diesel', 2018, 2024, 'D4FE', 'FWD'),
    -- Optima III
    ('optima-iii',  '2.0-cvvl-122kw','2.0 CVVL',  122, 165, 1998, 'petrol', 2010, 2015, 'G4KD', 'FWD'),
    ('optima-iii',  '2.4-gdi-148kw','2.4 GDi',    148, 201, 2359, 'petrol', 2010, 2015, 'G4KJ', 'FWD'),
    ('optima-iii',  '1.7-crdi-100kw','1.7 CRDi', 100, 136, 1685, 'diesel', 2010, 2015, 'D4FD', 'FWD'),
    -- Optima IV
    ('optima-iv',   '2.0-mpi-120kw','2.0 MPi',    120, 163, 1999, 'petrol', 2015, 2020, 'G4NC', 'FWD'),
    ('optima-iv',   '2.4-gdi-138kw','2.4 GDi',    138, 188, 2359, 'petrol', 2015, 2020, 'G4KJ', 'FWD'),
    ('optima-iv',   '1.7-crdi-104kw','1.7 CRDi', 104, 141, 1685, 'diesel', 2015, 2020, 'D4FD', 'FWD'),
    -- Sportage II
    ('sportage-ii', '2.0-104kw',    '2.0 16V',    104, 142, 1975, 'petrol', 2004, 2010, 'G4GC', 'AWD'),
    ('sportage-ii', '2.7-v6-129kw', '2.7 V6 24V', 129, 175, 2656, 'petrol', 2004, 2010, 'G6BA', 'AWD'),
    ('sportage-ii', '2.0-crdi-83kw','2.0 CRDi',    83, 113, 1991, 'diesel', 2004, 2010, 'D4EA', 'AWD'),
    ('sportage-ii', '2.0-crdi-103kw','2.0 CRDi', 103, 140, 1991, 'diesel', 2006, 2010, 'D4EA', 'AWD'),
    -- Sportage III
    ('sportage-iii','1.6-gdi-99kw', '1.6 GDi',     99, 135, 1591, 'petrol', 2010, 2016, 'G4FD', 'FWD'),
    ('sportage-iii','2.0-cvvt-120kw','2.0 16V',  120, 163, 1998, 'petrol', 2010, 2016, 'G4KD', 'AWD'),
    ('sportage-iii','1.7-crdi-85kw','1.7 CRDi',    85, 116, 1685, 'diesel', 2010, 2016, 'D4FD', 'FWD'),
    ('sportage-iii','2.0-crdi-100kw','2.0 CRDi', 100, 136, 1995, 'diesel', 2010, 2016, 'D4HA', 'AWD'),
    ('sportage-iii','2.0-crdi-135kw','2.0 CRDi', 135, 184, 1995, 'diesel', 2010, 2016, 'D4HA', 'AWD'),
    -- Sportage IV
    ('sportage-iv', '1.6-gdi-97kw', '1.6 GDi',     97, 132, 1591, 'petrol', 2015, 2021, 'G4FD', 'FWD'),
    ('sportage-iv', '1.6-tgdi-130kw','1.6 T-GDi',130,177, 1591,'petrol', 2015, 2021, 'G4FJ', 'AWD'),
    ('sportage-iv', '2.0-cvvt-114kw','2.0 16V',  114, 155, 1999, 'petrol', 2015, 2021, 'G4NA', 'AWD'),
    ('sportage-iv', '1.6-crdi-85kw','1.6 CRDi',    85, 116, 1598, 'diesel', 2018, 2021, 'D4FE', 'FWD'),
    ('sportage-iv', '1.6-crdi-100kw','1.6 CRDi', 100, 136, 1598, 'diesel', 2018, 2021, 'D4FE', 'AWD'),
    ('sportage-iv', '1.7-crdi-85kw','1.7 CRDi',    85, 116, 1685, 'diesel', 2015, 2018, 'D4FD', 'FWD'),
    ('sportage-iv', '2.0-crdi-100kw','2.0 CRDi', 100, 136, 1995, 'diesel', 2015, 2021, 'D4HA', 'AWD'),
    ('sportage-iv', '2.0-crdi-136kw','2.0 CRDi', 136, 185, 1995, 'diesel', 2015, 2021, 'D4HA', 'AWD'),
    -- Sorento II
    ('sorento-ii',  '2.4-cvvt-128kw','2.4 CVVT', 128, 174, 2359, 'petrol', 2009, 2014, 'G4KE', 'AWD'),
    ('sorento-ii',  '3.5-v6-204kw', '3.5 V6 24V',204, 277, 3470, 'petrol', 2009, 2014, 'G6DC', 'AWD'),
    ('sorento-ii',  '2.0-crdi-110kw','2.0 CRDi',110, 150, 1995, 'diesel', 2010, 2014, 'D4HA', 'AWD'),
    ('sorento-ii',  '2.2-crdi-145kw','2.2 CRDi',145, 197, 2199, 'diesel', 2009, 2014, 'D4HB', 'AWD'),
    -- Sorento III
    ('sorento-iii', '2.4-gdi-138kw','2.4 GDi',   138, 188, 2359, 'petrol', 2014, 2020, 'G4KJ', 'AWD'),
    ('sorento-iii', '3.3-v6-199kw', '3.3 V6 24V',199, 270, 3342, 'petrol', 2014, 2020, 'G6DH', 'AWD'),
    ('sorento-iii', '2.2-crdi-147kw','2.2 CRDi',147, 200, 2199, 'diesel', 2014, 2020, 'D4HB', 'AWD'),
    ('sorento-iii', '2.4-crdi-110kw','2.4 CRDi',110, 150, 2359, 'diesel', 2014, 2020, 'D4HC', 'AWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name, power_kw = excluded.power_kw, power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc, fuel = excluded.fuel,
    year_from = excluded.year_from, year_to = excluded.year_to,
    engine_code = excluded.engine_code, drive = excluded.drive, is_active = true;

-- ============================================================================
-- NISSAN — 13 models, ~70 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'nissan')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('micra-iii',     'Micra III (K12)',  2002, 2010, 'hatchback'),
    ('micra-iv',      'Micra IV (K13)',   2010, 2017, 'hatchback'),
    ('note-i',        'Note I (E11)',     2005, 2013, 'hatchback'),
    ('note-ii',       'Note II (E12)',    2013, 2020, 'hatchback'),
    ('almera-n16',    'Almera N16',       2000, 2006, 'sedan'),
    ('primera-p11',   'Primera P11',      1996, 2002, 'sedan'),
    ('primera-p12',   'Primera P12',      2001, 2008, 'sedan'),
    ('qashqai-i',     'Qashqai I (J10)',  2007, 2013, 'suv'),
    ('qashqai-ii',    'Qashqai II (J11)', 2013, 2021, 'suv'),
    ('juke-i',        'Juke I (F15)',     2010, 2019, 'suv'),
    ('juke-ii',       'Juke II (F16)',    2019, 2024, 'suv'),
    ('x-trail-t30',   'X-Trail T30',      2001, 2007, 'suv'),
    ('x-trail-t31',   'X-Trail T31',      2007, 2014, 'suv'),
    ('x-trail-t32',   'X-Trail T32',      2014, 2021, 'suv'),
    ('navara-d40',    'Navara D40',       2005, 2015, 'pickup')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'nissan'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Micra III
    ('micra-iii',  '1.0-48kw',     '1.0 16V',      48,  65,  998, 'petrol', 2002, 2010, 'CR10DE', 'FWD'),
    ('micra-iii',  '1.2-16v-48kw', '1.2 16V',      48,  65, 1240, 'petrol', 2002, 2010, 'CR12DE', 'FWD'),
    ('micra-iii',  '1.2-16v-59kw', '1.2 16V',      59,  80, 1240, 'petrol', 2002, 2010, 'CR12DE', 'FWD'),
    ('micra-iii',  '1.4-16v-65kw', '1.4 16V',      65,  88, 1386, 'petrol', 2002, 2010, 'CR14DE', 'FWD'),
    ('micra-iii',  '1.6-16v-81kw', '1.6 16V',      81, 110, 1598, 'petrol', 2005, 2010, 'HR16DE', 'FWD'),
    ('micra-iii',  '1.5-dci-48kw', '1.5 dCi',      48,  65, 1461, 'diesel', 2003, 2010, 'K9K',    'FWD'),
    ('micra-iii',  '1.5-dci-60kw', '1.5 dCi',      60,  82, 1461, 'diesel', 2003, 2010, 'K9K',    'FWD'),
    ('micra-iii',  '1.5-dci-78kw', '1.5 dCi',      78, 106, 1461, 'diesel', 2007, 2010, 'K9K',    'FWD'),
    -- Micra IV
    ('micra-iv',   '1.2-59kw',     '1.2 12V',      59,  80, 1198, 'petrol', 2010, 2017, 'HR12DE', 'FWD'),
    ('micra-iv',   '1.2-dig-s-72kw','1.2 DIG-S',   72,  98, 1198, 'petrol', 2011, 2017, 'HR12DDR','FWD'),
    ('micra-iv',   '1.5-dci-66kw', '1.5 dCi',      66,  90, 1461, 'diesel', 2010, 2014, 'K9K',    'FWD'),
    -- Note I
    ('note-i',     '1.4-65kw',     '1.4 16V',      65,  88, 1386, 'petrol', 2006, 2013, 'CR14DE', 'FWD'),
    ('note-i',     '1.6-16v-81kw', '1.6 16V',      81, 110, 1598, 'petrol', 2006, 2013, 'HR16DE', 'FWD'),
    ('note-i',     '1.5-dci-50kw', '1.5 dCi',      50,  68, 1461, 'diesel', 2006, 2013, 'K9K',    'FWD'),
    ('note-i',     '1.5-dci-63kw', '1.5 dCi',      63,  86, 1461, 'diesel', 2006, 2013, 'K9K',    'FWD'),
    ('note-i',     '1.5-dci-78kw', '1.5 dCi',      78, 106, 1461, 'diesel', 2006, 2013, 'K9K',    'FWD'),
    -- Note II
    ('note-ii',    '1.2-dig-s-72kw','1.2 DIG-S',   72,  98, 1198, 'petrol', 2013, 2020, 'HR12DDR','FWD'),
    ('note-ii',    '1.5-dci-66kw', '1.5 dCi',      66,  90, 1461, 'diesel', 2013, 2020, 'K9K',    'FWD'),
    -- Almera N16
    ('almera-n16', '1.5-66kw',     '1.5 16V',      66,  90, 1497, 'petrol', 2000, 2006, 'QG15DE', 'FWD'),
    ('almera-n16', '1.8-84kw',     '1.8 16V',      84, 114, 1769, 'petrol', 2000, 2006, 'QG18DE', 'FWD'),
    ('almera-n16', '2.0-103kw',    '2.0 16V',     103, 140, 1998, 'petrol', 2000, 2006, 'SR20DE', 'FWD'),
    ('almera-n16', '2.2-di-81kw',  '2.2 Di',       81, 110, 2184, 'diesel', 2000, 2006, 'YD22DDT','FWD'),
    ('almera-n16', '2.2-dci-100kw','2.2 dCi',     100, 136, 2184, 'diesel', 2003, 2006, 'YD22DDT','FWD'),
    -- Primera P11
    ('primera-p11','1.6-16v-66kw', '1.6 16V',      66,  90, 1597, 'petrol', 1996, 2002, 'GA16DE', 'FWD'),
    ('primera-p11','1.8-16v-84kw', '1.8 16V',      84, 114, 1769, 'petrol', 1999, 2002, 'QG18DE', 'FWD'),
    ('primera-p11','2.0-103kw',    '2.0 16V',     103, 140, 1998, 'petrol', 1996, 2002, 'SR20DE', 'FWD'),
    ('primera-p11','2.0-tdi-66kw', '2.0 TDi',      66,  90, 1974, 'diesel', 1997, 2002, 'CD20T',  'FWD'),
    -- Primera P12
    ('primera-p12','1.6-16v-79kw', '1.6 16V',      79, 109, 1597, 'petrol', 2002, 2008, 'QG16DE', 'FWD'),
    ('primera-p12','1.8-16v-85kw', '1.8 16V',      85, 116, 1769, 'petrol', 2002, 2008, 'QG18DE', 'FWD'),
    ('primera-p12','2.0-103kw',    '2.0 16V',     103, 140, 1998, 'petrol', 2002, 2008, 'QR20DE', 'FWD'),
    ('primera-p12','2.5-V6-125kw', '2.5 V6 24V',  125, 170, 2488, 'petrol', 2002, 2008, 'VQ25DD', 'FWD'),
    ('primera-p12','1.9-dci-88kw', '1.9 dCi',      88, 120, 1870, 'diesel', 2002, 2008, 'F9Q',    'FWD'),
    ('primera-p12','2.2-dci-93kw', '2.2 dCi',      93, 126, 2184, 'diesel', 2002, 2008, 'YD22DDT','FWD'),
    ('primera-p12','2.2-dci-102kw','2.2 dCi',     102, 139, 2184, 'diesel', 2003, 2008, 'YD22DDT','FWD'),
    -- Qashqai I
    ('qashqai-i',  '1.6-16v-84kw', '1.6 16V',      84, 114, 1598, 'petrol', 2007, 2013, 'HR16DE', 'FWD'),
    ('qashqai-i',  '2.0-104kw',    '2.0 16V',     104, 141, 1997, 'petrol', 2007, 2013, 'MR20DE', 'AWD'),
    ('qashqai-i',  '1.5-dci-78kw', '1.5 dCi',      78, 106, 1461, 'diesel', 2007, 2013, 'K9K',    'FWD'),
    ('qashqai-i',  '1.5-dci-81kw', '1.5 dCi',      81, 110, 1461, 'diesel', 2010, 2013, 'K9K',    'FWD'),
    ('qashqai-i',  '1.6-dci-96kw', '1.6 dCi',      96, 130, 1598, 'diesel', 2011, 2013, 'R9M',    'FWD'),
    ('qashqai-i',  '2.0-dci-110kw','2.0 dCi',     110, 150, 1995, 'diesel', 2007, 2013, 'M9R',    'AWD'),
    -- Qashqai II
    ('qashqai-ii', '1.2-dig-t-85kw','1.2 DIG-T',   85, 115, 1197, 'petrol', 2013, 2018, 'HRA2DDT','FWD'),
    ('qashqai-ii', '1.6-dig-t-120kw','1.6 DIG-T',120, 163, 1618, 'petrol', 2014, 2018, 'MR16DDT','FWD'),
    ('qashqai-ii', '1.3-dig-t-103kw','1.3 DIG-T',103, 140, 1332, 'petrol', 2018, 2021, 'HR13DDT','FWD'),
    ('qashqai-ii', '1.3-dig-t-117kw','1.3 DIG-T',117, 160, 1332, 'petrol', 2018, 2021, 'HR13DDT','FWD'),
    ('qashqai-ii', '1.5-dci-81kw', '1.5 dCi',      81, 110, 1461, 'diesel', 2013, 2018, 'K9K',    'FWD'),
    ('qashqai-ii', '1.5-dci-85kw', '1.5 Blue dCi', 85, 115, 1461, 'diesel', 2018, 2021, 'K9K',    'FWD'),
    ('qashqai-ii', '1.6-dci-96kw', '1.6 dCi',      96, 130, 1598, 'diesel', 2014, 2021, 'R9M',    'AWD'),
    -- Juke I
    ('juke-i',     '1.6-16v-69kw', '1.6 16V',      69,  94, 1598, 'petrol', 2010, 2019, 'HR16DE', 'FWD'),
    ('juke-i',     '1.6-16v-86kw', '1.6 16V',      86, 117, 1598, 'petrol', 2010, 2019, 'HR16DE', 'FWD'),
    ('juke-i',     '1.6-dig-t-140kw','1.6 DIG-T',140,190, 1618, 'petrol', 2010, 2019, 'MR16DDT','AWD'),
    ('juke-i',     '1.6-dig-t-160kw','1.6 DIG-T Nismo',160,218,1618,'petrol',2013,2019,'MR16DDT','AWD'),
    ('juke-i',     '1.5-dci-81kw', '1.5 dCi',      81, 110, 1461, 'diesel', 2010, 2019, 'K9K',    'FWD'),
    -- Juke II
    ('juke-ii',    '1.0-dig-t-86kw','1.0 DIG-T',   86, 117,  999, 'petrol', 2019, 2024, 'HR10DET','FWD'),
    -- X-Trail T30
    ('x-trail-t30','2.0-103kw',    '2.0 16V',     103, 140, 1998, 'petrol', 2001, 2007, 'QR20DE', 'AWD'),
    ('x-trail-t30','2.5-121kw',    '2.5 16V',     121, 165, 2488, 'petrol', 2001, 2007, 'QR25DE', 'AWD'),
    ('x-trail-t30','2.2-dci-100kw','2.2 dCi',     100, 136, 2184, 'diesel', 2003, 2007, 'YD22DDT','AWD'),
    -- X-Trail T31
    ('x-trail-t31','2.0-104kw',    '2.0 16V',     104, 141, 1997, 'petrol', 2007, 2014, 'MR20DE', 'AWD'),
    ('x-trail-t31','2.5-126kw',    '2.5 16V',     126, 169, 2488, 'petrol', 2007, 2014, 'QR25DE', 'AWD'),
    ('x-trail-t31','2.0-dci-110kw','2.0 dCi',     110, 150, 1995, 'diesel', 2007, 2014, 'M9R',    'AWD'),
    ('x-trail-t31','2.0-dci-127kw','2.0 dCi',     127, 173, 1995, 'diesel', 2007, 2014, 'M9R',    'AWD'),
    -- X-Trail T32
    ('x-trail-t32','1.6-dig-t-120kw','1.6 DIG-T',120, 163, 1618, 'petrol', 2014, 2021, 'MR16DDT','AWD'),
    ('x-trail-t32','2.0-106kw',    '2.0 16V',     106, 144, 1997, 'petrol', 2014, 2021, 'MR20DD', 'AWD'),
    ('x-trail-t32','1.6-dci-96kw', '1.6 dCi',      96, 130, 1598, 'diesel', 2014, 2021, 'R9M',    'AWD'),
    ('x-trail-t32','1.7-dci-110kw','1.7 dCi',     110, 150, 1749, 'diesel', 2019, 2021, 'R9N',    'AWD'),
    -- Navara D40
    ('navara-d40', '2.5-dci-128kw','2.5 dCi',     128, 174, 2488, 'diesel', 2005, 2015, 'YD25DDTi','AWD'),
    ('navara-d40', '2.5-dci-140kw','2.5 dCi',     140, 190, 2488, 'diesel', 2010, 2015, 'YD25DDTi','AWD'),
    ('navara-d40', '3.0-dci-170kw','3.0 dCi V6',  170, 231, 2993, 'diesel', 2010, 2015, 'V9X',    'AWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name, power_kw = excluded.power_kw, power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc, fuel = excluded.fuel,
    year_from = excluded.year_from, year_to = excluded.year_to,
    engine_code = excluded.engine_code, drive = excluded.drive, is_active = true;

-- ============================================================================
-- Link 5 universal products to ALL new engines
-- ============================================================================
insert into public.vehicle_part_link (vehicle_type_id, product_id)
select t.id, p.id
from public.vehicle_types t
cross join public.products p
where p.slug in (
    'castrol-edge-5w30-5l',
    'bosch-aerotwin-ar20u',
    'mann-cu-26-006-cabin-filter',
    'varta-blue-d24',
    'osram-h7-night-breaker'
)
on conflict (vehicle_type_id, product_id) do nothing;
