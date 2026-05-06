-- =============================================================================
-- Vehicle taxonomy MEGA seed — part 6/6
-- MAZDA + DACIA + FIAT (~28 models, ~135 engines)
-- Idempotent. Run AFTER supabase-vehicles-seed-mega-5.sql.
-- =============================================================================

-- ============================================================================
-- MAZDA — 9 models, ~50 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'mazda')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('2-de',         'Mazda2 DE',     2007, 2014, 'hatchback'),
    ('2-dj',         'Mazda2 DJ',     2014, 2024, 'hatchback'),
    ('3-bk',         'Mazda3 BK',     2003, 2009, 'hatchback'),
    ('3-bl',         'Mazda3 BL',     2009, 2013, 'hatchback'),
    ('3-bm',         'Mazda3 BM',     2013, 2019, 'hatchback'),
    ('3-bp',         'Mazda3 BP',     2019, 2024, 'hatchback'),
    ('6-gg',         'Mazda6 GG',     2002, 2008, 'sedan'),
    ('6-gh',         'Mazda6 GH',     2007, 2013, 'sedan'),
    ('6-gj',         'Mazda6 GJ',     2012, 2024, 'sedan'),
    ('cx-3',         'CX-3 DK',       2015, 2024, 'suv'),
    ('cx-5-i',       'CX-5 KE',       2012, 2017, 'suv'),
    ('cx-5-ii',      'CX-5 KF',       2017, 2024, 'suv'),
    ('mx-5-nb',      'MX-5 NB',       1998, 2005, 'roadster'),
    ('mx-5-nc',      'MX-5 NC',       2005, 2015, 'roadster'),
    ('mx-5-nd',      'MX-5 ND',       2015, 2024, 'roadster')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'mazda'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Mazda2 DE
    ('2-de',    '1.3-mzr-55kw',   '1.3 MZR',     55,  75, 1349, 'petrol', 2007, 2014, 'ZJ-VE',   'FWD'),
    ('2-de',    '1.3-mzr-63kw',   '1.3 MZR',     63,  86, 1349, 'petrol', 2007, 2014, 'ZJ-VE',   'FWD'),
    ('2-de',    '1.5-mzr-76kw',   '1.5 MZR',     76, 103, 1498, 'petrol', 2007, 2014, 'ZY-VE',   'FWD'),
    ('2-de',    '1.4-mzr-cd-50kw','1.4 MZR-CD',  50,  68, 1399, 'diesel', 2007, 2010, 'DV4TD',   'FWD'),
    -- Mazda2 DJ
    ('2-dj',    '1.5-skyactiv-66kw','1.5 SKYACTIV-G',66,90,1496,'petrol',2014,2024,'P5-VPS',   'FWD'),
    ('2-dj',    '1.5-skyactiv-85kw','1.5 SKYACTIV-G',85,115,1496,'petrol',2014,2024,'P5-VPS',  'FWD'),
    ('2-dj',    '1.5-skyactiv-d-77kw','1.5 SKYACTIV-D',77,105,1499,'diesel',2014,2019,'S5-DPTS','FWD'),
    -- Mazda3 BK
    ('3-bk',    '1.4-62kw',       '1.4 16V',     62,  84, 1349, 'petrol', 2003, 2009, 'ZJ-VE',   'FWD'),
    ('3-bk',    '1.6-77kw',       '1.6 16V',     77, 105, 1598, 'petrol', 2003, 2009, 'Z6',      'FWD'),
    ('3-bk',    '2.0-110kw',      '2.0 16V',    110, 150, 1999, 'petrol', 2003, 2009, 'LF17',    'FWD'),
    ('3-bk',    '2.3-mps-191kw',  '2.3 MPS Turbo',191,260,2261,'petrol',2006,2009, 'L3-VDT',   'FWD'),
    ('3-bk',    '1.6-cd-66kw',    '1.6 CD',      66,  90, 1560, 'diesel', 2003, 2009, 'Y6',      'FWD'),
    ('3-bk',    '1.6-cd-80kw',    '1.6 CD',      80, 109, 1560, 'diesel', 2005, 2009, 'Y6',      'FWD'),
    ('3-bk',    '2.0-cd-90kw',    '2.0 CD',      90, 122, 1998, 'diesel', 2003, 2009, 'RF',      'FWD'),
    ('3-bk',    '2.0-cd-105kw',   '2.0 CD',     105, 143, 1998, 'diesel', 2005, 2009, 'RF',      'FWD'),
    -- Mazda3 BL
    ('3-bl',    '1.6-77kw',       '1.6 MZR',     77, 105, 1598, 'petrol', 2009, 2013, 'Z6',      'FWD'),
    ('3-bl',    '2.0-disi-110kw', '2.0 DISI',   110, 150, 1999, 'petrol', 2009, 2013, 'LF',      'FWD'),
    ('3-bl',    '2.3-mps-191kw',  '2.3 MPS Turbo',191,260,2261,'petrol', 2009, 2013, 'L3-VDT',   'FWD'),
    ('3-bl',    '1.6-mzr-cd-66kw','1.6 MZR-CD',  66,  90, 1560, 'diesel', 2009, 2013, 'Y6',      'FWD'),
    ('3-bl',    '1.6-mzr-cd-80kw','1.6 MZR-CD',  80, 109, 1560, 'diesel', 2009, 2013, 'Y6',      'FWD'),
    ('3-bl',    '2.2-mzr-cd-110kw','2.2 MZR-CD',110, 150, 2184, 'diesel', 2009, 2013, 'R2AA',    'FWD'),
    ('3-bl',    '2.2-mzr-cd-136kw','2.2 MZR-CD',136, 185, 2184, 'diesel', 2009, 2013, 'R2AA',    'FWD'),
    -- Mazda3 BM
    ('3-bm',    '1.5-skyactiv-74kw','1.5 SKYACTIV-G',74,100,1496,'petrol',2013,2018,'P5-VPS',   'FWD'),
    ('3-bm',    '2.0-skyactiv-88kw','2.0 SKYACTIV-G',88,120,1998,'petrol',2013,2018,'PE-VPS',   'FWD'),
    ('3-bm',    '2.0-skyactiv-121kw','2.0 SKYACTIV-G',121,165,1998,'petrol',2013,2018,'PE-VPS', 'FWD'),
    ('3-bm',    '2.5-skyactiv-138kw','2.5 SKYACTIV-G',138,188,2488,'petrol',2013,2018,'PY-VPS', 'FWD'),
    ('3-bm',    '1.5-skyactiv-d-77kw','1.5 SKYACTIV-D',77,105,1499,'diesel',2015,2018,'S5-DPTS','FWD'),
    ('3-bm',    '2.2-skyactiv-d-110kw','2.2 SKYACTIV-D',110,150,2191,'diesel',2013,2018,'SH-VPTS','FWD'),
    -- Mazda3 BP
    ('3-bp',    '1.5-skyactiv-g-90kw','1.5 SKYACTIV-G',90,122,1496,'petrol',2019,2024,'P5-VPS', 'FWD'),
    ('3-bp',    '2.0-skyactiv-g-90kw','2.0 SKYACTIV-G',90,122,1998,'petrol',2019,2024,'PE-VPS', 'FWD'),
    ('3-bp',    '2.0-skyactiv-g-110kw','2.0 SKYACTIV-G',110,150,1998,'petrol',2019,2024,'PE-VPS','FWD'),
    ('3-bp',    '2.0-skyactiv-x-132kw','2.0 SKYACTIV-X',132,180,1998,'petrol',2019,2024,'PE-VPH','FWD'),
    ('3-bp',    '1.8-skyactiv-d-85kw','1.8 SKYACTIV-D',85,116,1759,'diesel',2019,2024,'S8-DPTS','FWD'),
    -- Mazda6 GG
    ('6-gg',    '1.8-88kw',       '1.8 MZR',     88, 120, 1798, 'petrol', 2002, 2008, 'L8',      'FWD'),
    ('6-gg',    '2.0-104kw',      '2.0 MZR',    104, 141, 1999, 'petrol', 2002, 2008, 'LF',      'FWD'),
    ('6-gg',    '2.3-122kw',      '2.3 MZR',    122, 166, 2261, 'petrol', 2002, 2008, 'L3',      'FWD'),
    ('6-gg',    '2.3-mps-191kw',  '2.3 MPS Turbo',191,260,2261,'petrol', 2005, 2008, 'L3-VDT',   'AWD'),
    ('6-gg',    '2.0-mzr-cd-89kw','2.0 MZR-CD',  89, 121, 1998, 'diesel', 2002, 2008, 'RF',      'FWD'),
    ('6-gg',    '2.0-mzr-cd-105kw','2.0 MZR-CD',105, 143, 1998, 'diesel', 2002, 2008, 'RF',      'FWD'),
    -- Mazda6 GH
    ('6-gh',    '1.8-88kw',       '1.8 MZR',     88, 120, 1798, 'petrol', 2007, 2013, 'L8',      'FWD'),
    ('6-gh',    '2.0-108kw',      '2.0 MZR',    108, 147, 1999, 'petrol', 2007, 2013, 'LF',      'FWD'),
    ('6-gh',    '2.5-125kw',      '2.5 MZR',    125, 170, 2488, 'petrol', 2007, 2013, 'L5',      'FWD'),
    ('6-gh',    '2.0-mzr-cd-103kw','2.0 MZR-CD',103, 140, 1998, 'diesel', 2007, 2013, 'RF',      'FWD'),
    ('6-gh',    '2.2-mzr-cd-93kw','2.2 MZR-CD',  93, 126, 2184, 'diesel', 2009, 2013, 'R2AA',    'FWD'),
    ('6-gh',    '2.2-mzr-cd-120kw','2.2 MZR-CD',120, 163, 2184, 'diesel', 2009, 2013, 'R2AA',    'FWD'),
    ('6-gh',    '2.2-mzr-cd-136kw','2.2 MZR-CD',136, 185, 2184, 'diesel', 2009, 2013, 'R2AA',    'FWD'),
    -- Mazda6 GJ
    ('6-gj',    '2.0-skyactiv-107kw','2.0 SKYACTIV-G',107,145,1998,'petrol',2012,2018,'PE-VPS', 'FWD'),
    ('6-gj',    '2.0-skyactiv-121kw','2.0 SKYACTIV-G',121,165,1998,'petrol',2012,2024,'PE-VPS', 'FWD'),
    ('6-gj',    '2.5-skyactiv-141kw','2.5 SKYACTIV-G',141,192,2488,'petrol',2012,2024,'PY-VPS', 'FWD'),
    ('6-gj',    '2.2-skyactiv-d-110kw','2.2 SKYACTIV-D',110,150,2191,'diesel',2012,2024,'SH-VPTS','FWD'),
    ('6-gj',    '2.2-skyactiv-d-129kw','2.2 SKYACTIV-D',129,175,2191,'diesel',2012,2024,'SH-VPTR','FWD'),
    -- CX-3
    ('cx-3',    '1.5-skyactiv-d-77kw','1.5 SKYACTIV-D',77,105,1499,'diesel',2015,2021,'S5-DPTS','FWD'),
    ('cx-3',    '2.0-skyactiv-g-89kw','2.0 SKYACTIV-G',89,121,1998,'petrol',2015,2024,'PE-VPS', 'FWD'),
    ('cx-3',    '2.0-skyactiv-g-110kw','2.0 SKYACTIV-G',110,150,1998,'petrol',2015,2024,'PE-VPS','AWD'),
    -- CX-5 I
    ('cx-5-i',  '2.0-skyactiv-121kw','2.0 SKYACTIV-G',121,165,1998,'petrol',2012,2017,'PE-VPS', 'AWD'),
    ('cx-5-i',  '2.5-skyactiv-141kw','2.5 SKYACTIV-G',141,192,2488,'petrol',2012,2017,'PY-VPS', 'AWD'),
    ('cx-5-i',  '2.2-skyactiv-d-110kw','2.2 SKYACTIV-D',110,150,2191,'diesel',2012,2017,'SH-VPTS','AWD'),
    ('cx-5-i',  '2.2-skyactiv-d-129kw','2.2 SKYACTIV-D',129,175,2191,'diesel',2012,2017,'SH-VPTR','AWD'),
    -- CX-5 II
    ('cx-5-ii', '2.0-skyactiv-121kw','2.0 SKYACTIV-G',121,165,1998,'petrol',2017,2024,'PE-VPS', 'AWD'),
    ('cx-5-ii', '2.5-skyactiv-143kw','2.5 SKYACTIV-G',143,194,2488,'petrol',2017,2024,'PY-VPS', 'AWD'),
    ('cx-5-ii', '2.2-skyactiv-d-110kw','2.2 SKYACTIV-D',110,150,2191,'diesel',2017,2024,'SH-VPTS','AWD'),
    ('cx-5-ii', '2.2-skyactiv-d-135kw','2.2 SKYACTIV-D',135,184,2191,'diesel',2017,2024,'SH-VPTR','AWD'),
    -- MX-5 NB
    ('mx-5-nb', '1.6-81kw',       '1.6 16V',     81, 110, 1597, 'petrol', 1998, 2005, 'B6-ZE',   'RWD'),
    ('mx-5-nb', '1.8-104kw',      '1.8 16V',    104, 141, 1839, 'petrol', 1998, 2005, 'BP-ZE',   'RWD'),
    -- MX-5 NC
    ('mx-5-nc', '1.8-93kw',       '1.8 MZR',     93, 126, 1798, 'petrol', 2005, 2015, 'L8-DE',   'RWD'),
    ('mx-5-nc', '2.0-118kw',      '2.0 MZR',    118, 160, 1999, 'petrol', 2005, 2015, 'LF-VE',   'RWD'),
    -- MX-5 ND
    ('mx-5-nd', '1.5-skyactiv-g-96kw','1.5 SKYACTIV-G',96,131,1496,'petrol',2015,2024,'P5-VP',  'RWD'),
    ('mx-5-nd', '2.0-skyactiv-g-118kw','2.0 SKYACTIV-G',118,160,1998,'petrol',2015,2018,'PE-VPS','RWD'),
    ('mx-5-nd', '2.0-skyactiv-g-135kw','2.0 SKYACTIV-G',135,184,1998,'petrol',2018,2024,'PE-VPR','RWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name, power_kw = excluded.power_kw, power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc, fuel = excluded.fuel,
    year_from = excluded.year_from, year_to = excluded.year_to,
    engine_code = excluded.engine_code, drive = excluded.drive, is_active = true;

-- ============================================================================
-- DACIA — 7 models, ~30 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'dacia')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('logan-i',     'Logan I',     2004, 2012, 'sedan'),
    ('logan-ii',    'Logan II',    2012, 2020, 'sedan'),
    ('logan-iii',   'Logan III',   2020, 2024, 'sedan'),
    ('sandero-i',   'Sandero I',   2008, 2012, 'hatchback'),
    ('sandero-ii',  'Sandero II',  2012, 2020, 'hatchback'),
    ('sandero-iii', 'Sandero III', 2020, 2024, 'hatchback'),
    ('duster-i',    'Duster I',    2010, 2017, 'suv'),
    ('duster-ii',   'Duster II',   2017, 2024, 'suv'),
    ('dokker',      'Dokker',      2012, 2021, 'mpv'),
    ('lodgy',       'Lodgy',       2012, 2021, 'mpv')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'dacia'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Logan I
    ('logan-i',     '1.2-16v-55kw',   '1.2 16V',   55,  75, 1149, 'petrol', 2008, 2012, 'D4F',   'FWD'),
    ('logan-i',     '1.4-55kw',       '1.4 8V',    55,  75, 1390, 'petrol', 2004, 2012, 'K7J',   'FWD'),
    ('logan-i',     '1.6-64kw',       '1.6 8V',    64,  87, 1598, 'petrol', 2004, 2012, 'K7M',   'FWD'),
    ('logan-i',     '1.6-16v-77kw',   '1.6 16V',   77, 105, 1598, 'petrol', 2008, 2012, 'K4M',   'FWD'),
    ('logan-i',     '1.5-dci-50kw',   '1.5 dCi',   50,  68, 1461, 'diesel', 2005, 2012, 'K9K',   'FWD'),
    ('logan-i',     '1.5-dci-63kw',   '1.5 dCi',   63,  86, 1461, 'diesel', 2008, 2012, 'K9K',   'FWD'),
    ('logan-i',     '1.5-dci-66kw',   '1.5 dCi',   66,  90, 1461, 'diesel', 2010, 2012, 'K9K',   'FWD'),
    -- Logan II
    ('logan-ii',    '0.9-tce-66kw',   '0.9 TCe',   66,  90,  898, 'petrol', 2012, 2020, 'H4Bt',  'FWD'),
    ('logan-ii',    '1.2-16v-54kw',   '1.2 16V',   54,  75, 1149, 'petrol', 2012, 2020, 'D4F',   'FWD'),
    ('logan-ii',    '1.6-mpi-60kw',   '1.6 MPi',   60,  82, 1598, 'petrol', 2012, 2020, 'K7M',   'FWD'),
    ('logan-ii',    '1.6-sce-75kw',   '1.6 SCe',   75, 102, 1598, 'petrol', 2015, 2020, 'H4M',   'FWD'),
    ('logan-ii',    '1.5-dci-55kw',   '1.5 dCi',   55,  75, 1461, 'diesel', 2012, 2020, 'K9K',   'FWD'),
    ('logan-ii',    '1.5-dci-66kw',   '1.5 dCi',   66,  90, 1461, 'diesel', 2012, 2020, 'K9K',   'FWD'),
    -- Logan III
    ('logan-iii',   '1.0-tce-66kw',   '1.0 TCe',   66,  90,  999, 'petrol', 2020, 2024, 'H4Dt',  'FWD'),
    ('logan-iii',   '1.0-sce-49kw',   '1.0 SCe',   49,  65,  999, 'petrol', 2020, 2024, 'B4D',   'FWD'),
    ('logan-iii',   '1.0-eco-g-74kw', '1.0 ECO-G LPG',74,100,999,'petrol', 2020, 2024, 'H4Dt',  'FWD'),
    -- Sandero I
    ('sandero-i',   '1.2-16v-55kw',   '1.2 16V',   55,  75, 1149, 'petrol', 2008, 2012, 'D4F',   'FWD'),
    ('sandero-i',   '1.4-55kw',       '1.4 8V',    55,  75, 1390, 'petrol', 2008, 2012, 'K7J',   'FWD'),
    ('sandero-i',   '1.6-64kw',       '1.6 8V',    64,  87, 1598, 'petrol', 2008, 2012, 'K7M',   'FWD'),
    ('sandero-i',   '1.6-16v-77kw',   '1.6 16V',   77, 105, 1598, 'petrol', 2008, 2012, 'K4M',   'FWD'),
    ('sandero-i',   '1.5-dci-50kw',   '1.5 dCi',   50,  68, 1461, 'diesel', 2008, 2012, 'K9K',   'FWD'),
    ('sandero-i',   '1.5-dci-63kw',   '1.5 dCi',   63,  86, 1461, 'diesel', 2008, 2012, 'K9K',   'FWD'),
    -- Sandero II
    ('sandero-ii',  '0.9-tce-66kw',   '0.9 TCe',   66,  90,  898, 'petrol', 2012, 2020, 'H4Bt',  'FWD'),
    ('sandero-ii',  '1.2-16v-54kw',   '1.2 16V',   54,  75, 1149, 'petrol', 2012, 2020, 'D4F',   'FWD'),
    ('sandero-ii',  '1.6-mpi-60kw',   '1.6 MPi',   60,  82, 1598, 'petrol', 2012, 2020, 'K7M',   'FWD'),
    ('sandero-ii',  '1.6-sce-75kw',   '1.6 SCe',   75, 102, 1598, 'petrol', 2015, 2020, 'H4M',   'FWD'),
    ('sandero-ii',  '1.5-dci-55kw',   '1.5 dCi',   55,  75, 1461, 'diesel', 2012, 2020, 'K9K',   'FWD'),
    ('sandero-ii',  '1.5-dci-66kw',   '1.5 dCi',   66,  90, 1461, 'diesel', 2012, 2020, 'K9K',   'FWD'),
    -- Sandero III
    ('sandero-iii', '1.0-sce-49kw',   '1.0 SCe',   49,  65,  999, 'petrol', 2020, 2024, 'B4D',   'FWD'),
    ('sandero-iii', '1.0-tce-66kw',   '1.0 TCe',   66,  90,  999, 'petrol', 2020, 2024, 'H4Dt',  'FWD'),
    ('sandero-iii', '1.0-tce-67kw',   '1.0 TCe',   67,  91,  999, 'petrol', 2020, 2024, 'H4Dt',  'FWD'),
    -- Duster I
    ('duster-i',    '1.6-77kw',       '1.6 16V',   77, 105, 1598, 'petrol', 2010, 2017, 'K4M',   'AWD'),
    ('duster-i',    '1.6-sce-84kw',   '1.6 SCe',   84, 114, 1598, 'petrol', 2015, 2017, 'H4M',   'FWD'),
    ('duster-i',    '2.0-99kw',       '2.0 16V',   99, 135, 1998, 'petrol', 2010, 2017, 'F4R',   'AWD'),
    ('duster-i',    '1.5-dci-66kw',   '1.5 dCi',   66,  90, 1461, 'diesel', 2010, 2017, 'K9K',   'AWD'),
    ('duster-i',    '1.5-dci-80kw',   '1.5 dCi',   80, 109, 1461, 'diesel', 2013, 2017, 'K9K',   'AWD'),
    -- Duster II
    ('duster-ii',   '1.0-tce-74kw',   '1.0 TCe',   74, 100,  999, 'petrol', 2019, 2024, 'H4Dt',  'FWD'),
    ('duster-ii',   '1.3-tce-96kw',   '1.3 TCe',   96, 130, 1332, 'petrol', 2019, 2024, 'H5Ht',  'AWD'),
    ('duster-ii',   '1.3-tce-110kw',  '1.3 TCe',  110, 150, 1332, 'petrol', 2019, 2024, 'H5Ht',  'AWD'),
    ('duster-ii',   '1.6-sce-84kw',   '1.6 SCe',   84, 114, 1598, 'petrol', 2017, 2020, 'H4M',   'FWD'),
    ('duster-ii',   '1.5-dci-70kw',   '1.5 dCi',   70,  95, 1461, 'diesel', 2017, 2024, 'K9K',   'FWD'),
    ('duster-ii',   '1.5-dci-85kw',   '1.5 Blue dCi',85,115,1461,'diesel', 2018, 2024, 'K9K',   'AWD'),
    -- Dokker
    ('dokker',      '1.6-mpi-60kw',   '1.6 MPi',   60,  82, 1598, 'petrol', 2012, 2021, 'K7M',   'FWD'),
    ('dokker',      '1.6-sce-75kw',   '1.6 SCe',   75, 102, 1598, 'petrol', 2015, 2021, 'H4M',   'FWD'),
    ('dokker',      '1.5-dci-55kw',   '1.5 dCi',   55,  75, 1461, 'diesel', 2012, 2021, 'K9K',   'FWD'),
    ('dokker',      '1.5-dci-66kw',   '1.5 dCi',   66,  90, 1461, 'diesel', 2012, 2021, 'K9K',   'FWD'),
    -- Lodgy
    ('lodgy',       '1.6-mpi-60kw',   '1.6 MPi',   60,  82, 1598, 'petrol', 2012, 2021, 'K7M',   'FWD'),
    ('lodgy',       '1.6-sce-75kw',   '1.6 SCe',   75, 102, 1598, 'petrol', 2015, 2021, 'H4M',   'FWD'),
    ('lodgy',       '1.2-tce-85kw',   '1.2 TCe',   85, 115, 1198, 'petrol', 2012, 2017, 'H5Ft',  'FWD'),
    ('lodgy',       '1.5-dci-66kw',   '1.5 dCi',   66,  90, 1461, 'diesel', 2012, 2021, 'K9K',   'FWD'),
    ('lodgy',       '1.5-dci-80kw',   '1.5 dCi',   80, 109, 1461, 'diesel', 2012, 2021, 'K9K',   'FWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name, power_kw = excluded.power_kw, power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc, fuel = excluded.fuel,
    year_from = excluded.year_from, year_to = excluded.year_to,
    engine_code = excluded.engine_code, drive = excluded.drive, is_active = true;

-- ============================================================================
-- FIAT — 11 models, ~55 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'fiat')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('punto-ii',     'Punto II',     1999, 2010, 'hatchback'),
    ('punto-iii',    'Punto III / Grande Punto', 2005, 2018, 'hatchback'),
    ('500',          '500',          2007, 2024, 'hatchback'),
    ('500l',         '500L',         2012, 2022, 'mpv'),
    ('panda-ii',     'Panda II',     2003, 2012, 'hatchback'),
    ('panda-iii',    'Panda III',    2011, 2024, 'hatchback'),
    ('bravo-ii',     'Bravo II',     2007, 2014, 'hatchback'),
    ('stilo',        'Stilo',        2001, 2007, 'hatchback'),
    ('tipo',         'Tipo',         2015, 2024, 'sedan'),
    ('doblo-ii',     'Doblo II',     2010, 2022, 'mpv'),
    ('ducato-iii',   'Ducato III',   2006, 2014, 'van'),
    ('ducato-iv',    'Ducato IV',    2014, 2024, 'van')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'fiat'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Punto II
    ('punto-ii',   '1.2-44kw',     '1.2 8V',    44,  60, 1242, 'petrol', 1999, 2010, '188A4', 'FWD'),
    ('punto-ii',   '1.2-16v-59kw', '1.2 16V',   59,  80, 1242, 'petrol', 1999, 2010, '188A5', 'FWD'),
    ('punto-ii',   '1.4-16v-70kw', '1.4 16V',   70,  95, 1368, 'petrol', 2003, 2010, '843A1', 'FWD'),
    ('punto-ii',   '1.8-16v-96kw', '1.8 16V HGT',96,130,1747,'petrol',  2000, 2003, '183A1', 'FWD'),
    ('punto-ii',   '1.9-d-44kw',   '1.9 D',     44,  60, 1910, 'diesel', 1999, 2003, '188A3', 'FWD'),
    ('punto-ii',   '1.9-jtd-59kw', '1.9 JTD',   59,  80, 1910, 'diesel', 2000, 2010, '188A2', 'FWD'),
    ('punto-ii',   '1.9-jtd-74kw', '1.9 JTD',   74, 100, 1910, 'diesel', 2003, 2010, '188A2', 'FWD'),
    ('punto-ii',   '1.3-mjtd-51kw','1.3 Multijet',51,69,1248,'diesel', 2003, 2010, '199A2', 'FWD'),
    ('punto-ii',   '1.3-mjtd-55kw','1.3 Multijet',55,75,1248,'diesel', 2003, 2010, '199A2', 'FWD'),
    -- Grande Punto
    ('punto-iii',  '1.2-48kw',     '1.2 8V',    48,  65, 1242, 'petrol', 2005, 2018, '199A4', 'FWD'),
    ('punto-iii',  '1.4-57kw',     '1.4 8V',    57,  77, 1368, 'petrol', 2005, 2018, '350A1', 'FWD'),
    ('punto-iii',  '1.4-16v-70kw', '1.4 16V',   70,  95, 1368, 'petrol', 2005, 2018, '843A1', 'FWD'),
    ('punto-iii',  '1.4-tjet-88kw','1.4 T-Jet', 88, 120, 1368, 'petrol', 2007, 2018, '198A4', 'FWD'),
    ('punto-iii',  '1.4-tjet-114kw','1.4 T-Jet Abarth',114,155,1368,'petrol',2008,2018,'198A4','FWD'),
    ('punto-iii',  '1.3-mjtd-55kw','1.3 Multijet',55,75,1248,'diesel', 2005, 2018, '199A2', 'FWD'),
    ('punto-iii',  '1.3-mjtd-66kw','1.3 Multijet',66,90,1248,'diesel', 2005, 2018, '199A2', 'FWD'),
    ('punto-iii',  '1.6-mjtd-88kw','1.6 Multijet',88,120,1598,'diesel',2008, 2018, '198A2', 'FWD'),
    ('punto-iii',  '1.9-mjtd-96kw','1.9 Multijet',96,130,1910,'diesel',2005, 2010, '186A8', 'FWD'),
    -- 500
    ('500',        '0.9-twinair-63kw','0.9 TwinAir',63,85,875,'petrol',2010, 2024, '312A2', 'FWD'),
    ('500',        '0.9-twinair-77kw','0.9 TwinAir',77,105,875,'petrol',2010,2024, '312A2', 'FWD'),
    ('500',        '1.2-51kw',     '1.2 8V',    51,  69, 1242, 'petrol', 2007, 2024, '169A4', 'FWD'),
    ('500',        '1.4-16v-74kw', '1.4 16V',   74, 100, 1368, 'petrol', 2007, 2014, '169A3', 'FWD'),
    ('500',        '1.4-abarth-99kw','1.4 T-Jet Abarth',99,135,1368,'petrol',2008,2024,'312A1','FWD'),
    ('500',        '1.4-abarth-118kw','1.4 T-Jet Abarth',118,160,1368,'petrol',2008,2024,'312A1','FWD'),
    ('500',        '1.3-mjtd-55kw','1.3 Multijet',55,75,1248,'diesel', 2007, 2018, '169A1', 'FWD'),
    -- 500L
    ('500l',       '0.9-twinair-77kw','0.9 TwinAir',77,105,875,'petrol',2012,2022, '312A2', 'FWD'),
    ('500l',       '1.4-95kw',     '1.4 16V',   70,  95, 1368, 'petrol', 2012, 2022, '843A1', 'FWD'),
    ('500l',       '1.6-mjtd-88kw','1.6 Multijet',88,120,1598,'diesel',2012, 2022, '198A2', 'FWD'),
    ('500l',       '1.6-mjtd-77kw','1.6 Multijet',77,105,1598,'diesel',2012, 2022, '198A2', 'FWD'),
    -- Panda II
    ('panda-ii',   '1.1-40kw',     '1.1',       40,  54, 1108, 'petrol', 2003, 2012, '187A1', 'FWD'),
    ('panda-ii',   '1.2-44kw',     '1.2 8V',    44,  60, 1242, 'petrol', 2003, 2012, '188A4', 'FWD'),
    ('panda-ii',   '1.2-51kw',     '1.2 8V',    51,  69, 1242, 'petrol', 2010, 2012, '169A4', 'FWD'),
    ('panda-ii',   '1.4-16v-74kw', '1.4 16V',   74, 100, 1368, 'petrol', 2007, 2012, '169A3', 'FWD'),
    ('panda-ii',   '1.3-mjtd-51kw','1.3 Multijet',51,70,1248,'diesel',  2003, 2012, '188A9', 'FWD'),
    ('panda-ii',   '1.3-mjtd-55kw','1.3 Multijet',55,75,1248,'diesel',  2003, 2012, '169A1', 'FWD'),
    -- Panda III
    ('panda-iii',  '0.9-twinair-63kw','0.9 TwinAir',63,85,875,'petrol',2011,2024, '312A2', 'FWD'),
    ('panda-iii',  '1.2-51kw',     '1.2 8V',    51,  69, 1242, 'petrol', 2011, 2024, '169A4', 'FWD'),
    ('panda-iii',  '1.3-mjtd-55kw','1.3 Multijet',55,75,1248,'diesel', 2011, 2018, '199B1', 'FWD'),
    ('panda-iii',  '1.3-mjtd-70kw','1.3 Multijet',70,95,1248,'diesel', 2011, 2018, '199B1', 'FWD'),
    -- Bravo II
    ('bravo-ii',   '1.4-66kw',     '1.4 16V',   66,  90, 1368, 'petrol', 2007, 2014, '198A4', 'FWD'),
    ('bravo-ii',   '1.4-tjet-88kw','1.4 T-Jet', 88, 120, 1368, 'petrol', 2007, 2014, '198A4', 'FWD'),
    ('bravo-ii',   '1.4-tjet-110kw','1.4 T-Jet',110,150,1368,'petrol', 2007, 2014, '198A4', 'FWD'),
    ('bravo-ii',   '1.6-mjtd-77kw','1.6 Multijet',77,105,1598,'diesel',2007, 2014, '198A2', 'FWD'),
    ('bravo-ii',   '1.6-mjtd-88kw','1.6 Multijet',88,120,1598,'diesel',2007, 2014, '198A2', 'FWD'),
    ('bravo-ii',   '1.9-mjtd-110kw','1.9 Multijet',110,150,1910,'diesel',2007,2010,'937A5','FWD'),
    ('bravo-ii',   '2.0-mjtd-121kw','2.0 Multijet',121,165,1956,'diesel',2008,2014,'198A6', 'FWD'),
    -- Stilo
    ('stilo',      '1.2-16v-59kw', '1.2 16V',   59,  80, 1242, 'petrol', 2001, 2007, '188A5', 'FWD'),
    ('stilo',      '1.4-16v-70kw', '1.4 16V',   70,  95, 1368, 'petrol', 2003, 2007, '843A1', 'FWD'),
    ('stilo',      '1.6-16v-76kw', '1.6 16V',   76, 103, 1596, 'petrol', 2001, 2007, '182B6', 'FWD'),
    ('stilo',      '1.8-16v-98kw', '1.8 16V',   98, 133, 1747, 'petrol', 2001, 2007, '192A4', 'FWD'),
    ('stilo',      '1.9-jtd-59kw', '1.9 JTD',   59,  80, 1910, 'diesel', 2001, 2007, '192A1', 'FWD'),
    ('stilo',      '1.9-jtd-85kw', '1.9 JTD',   85, 115, 1910, 'diesel', 2001, 2007, '192A1', 'FWD'),
    ('stilo',      '1.9-jtd-103kw','1.9 JTD',  103, 140, 1910, 'diesel', 2003, 2007, '937A5', 'FWD'),
    -- Tipo
    ('tipo',       '1.4-70kw',     '1.4 16V',   70,  95, 1368, 'petrol', 2015, 2024, '843A1', 'FWD'),
    ('tipo',       '1.4-tjet-88kw','1.4 T-Jet', 88, 120, 1368, 'petrol', 2015, 2024, '198A4', 'FWD'),
    ('tipo',       '1.6-mjtd-88kw','1.6 Multijet',88,120,1598,'diesel', 2015, 2024, '198A2', 'FWD'),
    -- Doblo II
    ('doblo-ii',   '1.4-70kw',     '1.4 16V',   70,  95, 1368, 'petrol', 2010, 2022, '843A1', 'FWD'),
    ('doblo-ii',   '1.4-tjet-88kw','1.4 T-Jet', 88, 120, 1368, 'petrol', 2010, 2022, '198A4', 'FWD'),
    ('doblo-ii',   '1.3-mjtd-66kw','1.3 Multijet',66,90,1248,'diesel', 2010, 2022, '199A2', 'FWD'),
    ('doblo-ii',   '1.6-mjtd-77kw','1.6 Multijet',77,105,1598,'diesel',2010, 2022, '198A2', 'FWD'),
    ('doblo-ii',   '1.6-mjtd-88kw','1.6 Multijet',88,120,1598,'diesel',2010, 2022, '198A2', 'FWD'),
    ('doblo-ii',   '2.0-mjtd-99kw','2.0 Multijet',99,135,1956,'diesel',2010, 2022, '198A6', 'FWD'),
    -- Ducato III
    ('ducato-iii', '2.0-jtd-62kw', '2.0 JTD',   62,  84, 1997, 'diesel', 2006, 2014, 'F1AE',  'FWD'),
    ('ducato-iii', '2.2-jtd-74kw', '2.2 JTD',   74, 100, 2198, 'diesel', 2006, 2014, '4HV',   'FWD'),
    ('ducato-iii', '2.3-jtd-88kw', '2.3 JTD',   88, 120, 2287, 'diesel', 2006, 2014, 'F1AE',  'FWD'),
    ('ducato-iii', '2.3-jtd-110kw','2.3 JTD',  110, 150, 2287, 'diesel', 2011, 2014, 'F1AE',  'FWD'),
    ('ducato-iii', '3.0-jtd-115kw','3.0 JTD',  115, 156, 2999, 'diesel', 2006, 2014, 'F1CE',  'FWD'),
    ('ducato-iii', '3.0-jtd-130kw','3.0 JTD',  130, 177, 2999, 'diesel', 2006, 2014, 'F1CE',  'FWD'),
    -- Ducato IV
    ('ducato-iv',  '2.0-mjt-85kw', '2.0 Multijet',85,115,1956,'diesel', 2014, 2024, '250A1', 'FWD'),
    ('ducato-iv',  '2.3-mjt-96kw', '2.3 Multijet',96,131,2287,'diesel', 2014, 2024, 'F1A',   'FWD'),
    ('ducato-iv',  '2.3-mjt-110kw','2.3 Multijet',110,150,2287,'diesel',2014, 2024, 'F1A',   'FWD'),
    ('ducato-iv',  '2.3-mjt-130kw','2.3 Multijet',130,177,2287,'diesel',2014, 2024, 'F1A',   'FWD'),
    ('ducato-iv',  '3.0-mjt-130kw','3.0 Multijet',130,177,2999,'diesel',2014, 2024, 'F1C',   'FWD')
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
