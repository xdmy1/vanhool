-- ALL-IN-ONE Chunk 2/4 — Ford...Fiat (mega 2-6)
-- =============================================================================
-- Vehicle taxonomy MEGA seed — part 2/6
-- FORD + SKODA (~27 models, ~170 engines)
-- Idempotent. Run AFTER supabase-vehicles-seed-mega-1.sql.
-- =============================================================================

-- ============================================================================
-- FORD — 13 models, ~110 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'ford')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('focus-i',     'Focus I',     1998, 2004, 'hatchback'),
    ('focus-ii',    'Focus II',    2004, 2011, 'hatchback'),
    ('focus-iii',   'Focus III',   2011, 2018, 'hatchback'),
    ('focus-iv',    'Focus IV',    2018, 2024, 'hatchback'),
    ('fiesta-v',    'Fiesta V',    2002, 2008, 'hatchback'),
    ('fiesta-vi',   'Fiesta VI',   2008, 2017, 'hatchback'),
    ('fiesta-vii',  'Fiesta VII',  2017, 2023, 'hatchback'),
    ('mondeo-iii',  'Mondeo III',  2000, 2007, 'sedan'),
    ('mondeo-iv',   'Mondeo IV',   2007, 2014, 'sedan'),
    ('mondeo-v',    'Mondeo V',    2014, 2022, 'sedan'),
    ('galaxy-ii',   'Galaxy II',   2006, 2015, 'mpv'),
    ('s-max-i',     'S-Max I',     2006, 2014, 'mpv'),
    ('kuga-i',      'Kuga I',      2008, 2012, 'suv'),
    ('kuga-ii',     'Kuga II',     2013, 2019, 'suv')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'ford'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Focus I
    ('focus-i',   '1.4-16v-55kw',  '1.4 16V',     55,  75, 1388, 'petrol', 1998, 2004, 'FXDA',  'FWD'),
    ('focus-i',   '1.6-16v-74kw',  '1.6 16V',     74, 100, 1596, 'petrol', 1998, 2004, 'FYDA',  'FWD'),
    ('focus-i',   '1.8-16v-85kw',  '1.8 16V',     85, 115, 1796, 'petrol', 1998, 2004, 'EYDB',  'FWD'),
    ('focus-i',   '2.0-16v-96kw',  '2.0 16V',     96, 130, 1988, 'petrol', 1998, 2004, 'EDDB',  'FWD'),
    ('focus-i',   '2.0-st170-127kw','2.0 16V ST170',127,170,1988,'petrol',2002, 2004, 'ALDA',  'FWD'),
    ('focus-i',   '1.8-tddi-66kw', '1.8 TDDi',    66,  90, 1753, 'diesel', 1998, 2002, 'BHDB',  'FWD'),
    ('focus-i',   '1.8-tdci-74kw', '1.8 TDCi',    74, 100, 1753, 'diesel', 2001, 2004, 'F9DA',  'FWD'),
    ('focus-i',   '1.8-tdci-85kw', '1.8 TDCi',    85, 115, 1753, 'diesel', 2001, 2004, 'FFDA',  'FWD'),
    -- Focus II
    ('focus-ii',  '1.4-16v-59kw',  '1.4 16V',     59,  80, 1388, 'petrol', 2004, 2011, 'ASDA',  'FWD'),
    ('focus-ii',  '1.6-16v-74kw',  '1.6 16V',     74, 100, 1596, 'petrol', 2004, 2011, 'HWDA',  'FWD'),
    ('focus-ii',  '1.6-tivct-85kw','1.6 Ti-VCT',  85, 115, 1596, 'petrol', 2005, 2011, 'HXDA',  'FWD'),
    ('focus-ii',  '1.8-16v-92kw',  '1.8 16V',     92, 125, 1798, 'petrol', 2004, 2011, 'QQDB',  'FWD'),
    ('focus-ii',  '2.0-16v-107kw', '2.0 16V',    107, 145, 1999, 'petrol', 2004, 2011, 'AODA',  'FWD'),
    ('focus-ii',  '2.5-st-166kw',  '2.5 ST',     166, 225, 2522, 'petrol', 2005, 2011, 'HYDA',  'FWD'),
    ('focus-ii',  '2.5-rs-224kw',  '2.5 RS',     224, 305, 2522, 'petrol', 2009, 2011, 'JZDA',  'FWD'),
    ('focus-ii',  '1.6-tdci-66kw', '1.6 TDCi',    66,  90, 1560, 'diesel', 2004, 2011, 'HHDA',  'FWD'),
    ('focus-ii',  '1.6-tdci-80kw', '1.6 TDCi',    80, 109, 1560, 'diesel', 2004, 2011, 'HHDB',  'FWD'),
    ('focus-ii',  '1.6-tdci-100kw','1.6 TDCi',   100, 136, 1560, 'diesel', 2008, 2011, 'TYDA',  'FWD'),
    ('focus-ii',  '1.8-tdci-85kw', '1.8 TDCi',    85, 115, 1753, 'diesel', 2004, 2011, 'KKDA',  'FWD'),
    ('focus-ii',  '2.0-tdci-100kw','2.0 TDCi',   100, 136, 1997, 'diesel', 2004, 2011, 'G6DA',  'FWD'),
    -- Focus III
    ('focus-iii', '1.0-ecoboost-74kw','1.0 EcoBoost',74,100,998,'petrol',2012,2018, 'M2DA',  'FWD'),
    ('focus-iii', '1.0-ecoboost-92kw','1.0 EcoBoost',92,125,998,'petrol',2012,2018, 'M1DA',  'FWD'),
    ('focus-iii', '1.0-ecoboost-103kw','1.0 EcoBoost',103,140,998,'petrol',2014,2018,'M2DB','FWD'),
    ('focus-iii', '1.5-ecoboost-110kw','1.5 EcoBoost',110,150,1499,'petrol',2014,2018,'UNCA','FWD'),
    ('focus-iii', '1.5-ecoboost-134kw','1.5 EcoBoost',134,182,1499,'petrol',2014,2018,'M8DA','FWD'),
    ('focus-iii', '1.6-tivct-77kw','1.6 Ti-VCT',  77, 105, 1596, 'petrol', 2011, 2014, 'IQDB',  'FWD'),
    ('focus-iii', '1.6-tivct-92kw','1.6 Ti-VCT',  92, 125, 1596, 'petrol', 2011, 2014, 'PNDA',  'FWD'),
    ('focus-iii', '2.0-ecoboost-184kw','2.0 EcoBoost ST',184,250,1999,'petrol',2012,2018,'R9DA','FWD'),
    ('focus-iii', '2.3-ecoboost-257kw','2.3 EcoBoost RS',257,350,2261,'petrol',2016,2018,'YVDA','AWD'),
    ('focus-iii', '1.5-tdci-70kw','1.5 TDCi',    70,  95, 1499, 'diesel', 2014, 2018, 'XWDA',  'FWD'),
    ('focus-iii', '1.5-tdci-88kw','1.5 TDCi',    88, 120, 1499, 'diesel', 2014, 2018, 'XWDB',  'FWD'),
    ('focus-iii', '1.6-tdci-70kw','1.6 TDCi',    70,  95, 1560, 'diesel', 2010, 2014, 'T1DA',  'FWD'),
    ('focus-iii', '1.6-tdci-85kw','1.6 TDCi',    85, 115, 1560, 'diesel', 2010, 2018, 'T1DB',  'FWD'),
    ('focus-iii', '2.0-tdci-103kw','2.0 TDCi',  103, 140, 1997, 'diesel', 2010, 2018, 'TYDA',  'FWD'),
    ('focus-iii', '2.0-tdci-120kw','2.0 TDCi',  120, 163, 1997, 'diesel', 2010, 2018, 'UFDB',  'FWD'),
    ('focus-iii', '2.0-tdci-136kw','2.0 TDCi ST',136,185,1997,'diesel',2014,2018, 'T7DD',  'FWD'),
    -- Focus IV
    ('focus-iv',  '1.0-ecoboost-74kw','1.0 EcoBoost',74,100,999,'petrol',2018,2024, 'M3JK',  'FWD'),
    ('focus-iv',  '1.0-ecoboost-92kw','1.0 EcoBoost',92,125,999,'petrol',2018,2024, 'M2DA',  'FWD'),
    ('focus-iv',  '1.0-ecoboost-114kw','1.0 EcoBoost',114,155,999,'petrol',2020,2024,'M2GB','FWD'),
    ('focus-iv',  '1.5-ecoboost-110kw','1.5 EcoBoost',110,150,1499,'petrol',2018,2024,'YZDA','FWD'),
    ('focus-iv',  '1.5-ecoboost-134kw','1.5 EcoBoost',134,182,1499,'petrol',2018,2024,'YZDB','FWD'),
    ('focus-iv',  '2.3-ecoboost-206kw','2.3 EcoBoost ST',206,280,2261,'petrol',2019,2024,'M2DB','FWD'),
    ('focus-iv',  '1.5-ecoblue-70kw','1.5 EcoBlue',70,95,1499,'diesel',2018,2024, 'XYDA',  'FWD'),
    ('focus-iv',  '1.5-ecoblue-88kw','1.5 EcoBlue',88,120,1499,'diesel',2018,2024, 'XYDB',  'FWD'),
    ('focus-iv',  '2.0-ecoblue-110kw','2.0 EcoBlue',110,150,1996,'diesel',2018,2024,'BMDA','FWD'),
    ('focus-iv',  '2.0-ecoblue-140kw','2.0 EcoBlue',140,190,1996,'diesel',2018,2024,'BMDB','FWD'),
    -- Fiesta V
    ('fiesta-v',  '1.25-16v-51kw','1.25 16V',    51,  70, 1242, 'petrol', 2002, 2008, 'FUJA',  'FWD'),
    ('fiesta-v',  '1.25-16v-55kw','1.25 16V',    55,  75, 1242, 'petrol', 2002, 2008, 'FUJB',  'FWD'),
    ('fiesta-v',  '1.4-16v-59kw', '1.4 16V',     59,  80, 1388, 'petrol', 2002, 2008, 'FXJA',  'FWD'),
    ('fiesta-v',  '1.6-16v-74kw', '1.6 16V',     74, 100, 1596, 'petrol', 2002, 2008, 'FYJA',  'FWD'),
    ('fiesta-v',  '2.0-st-110kw', '2.0 ST',     110, 150, 1999, 'petrol', 2005, 2008, 'N4JA',  'FWD'),
    ('fiesta-v',  '1.4-tdci-50kw','1.4 TDCi',    50,  68, 1399, 'diesel', 2002, 2008, 'F6JA',  'FWD'),
    ('fiesta-v',  '1.6-tdci-66kw','1.6 TDCi',    66,  90, 1560, 'diesel', 2004, 2008, 'HHJA',  'FWD'),
    -- Fiesta VI
    ('fiesta-vi', '1.25-16v-44kw','1.25 16V',    44,  60, 1242, 'petrol', 2008, 2017, 'STJA',  'FWD'),
    ('fiesta-vi', '1.25-16v-60kw','1.25 16V',    60,  82, 1242, 'petrol', 2008, 2017, 'STJB',  'FWD'),
    ('fiesta-vi', '1.4-16v-71kw', '1.4 16V',     71,  96, 1388, 'petrol', 2008, 2014, 'SPJA',  'FWD'),
    ('fiesta-vi', '1.6-16v-88kw', '1.6 Ti-VCT',  88, 120, 1596, 'petrol', 2008, 2017, 'IQJA',  'FWD'),
    ('fiesta-vi', '1.6-st-134kw', '1.6 EcoBoost ST',134,182,1596,'petrol',2013,2017,'JTJA','FWD'),
    ('fiesta-vi', '1.0-ecoboost-74kw','1.0 EcoBoost',74,100,999,'petrol',2013,2017,'SFJA','FWD'),
    ('fiesta-vi', '1.0-ecoboost-92kw','1.0 EcoBoost',92,125,999,'petrol',2013,2017,'SFJB','FWD'),
    ('fiesta-vi', '1.4-tdci-51kw','1.4 TDCi',    51,  70, 1399, 'diesel', 2008, 2014, 'KVJA',  'FWD'),
    ('fiesta-vi', '1.5-tdci-55kw','1.5 TDCi',    55,  75, 1499, 'diesel', 2012, 2017, 'XUJA',  'FWD'),
    ('fiesta-vi', '1.6-tdci-70kw','1.6 TDCi',    70,  95, 1560, 'diesel', 2008, 2017, 'TZJA',  'FWD'),
    -- Fiesta VII
    ('fiesta-vii','1.0-ecoboost-70kw','1.0 EcoBoost',70,95,999,'petrol',2017,2023, 'M0JA',  'FWD'),
    ('fiesta-vii','1.0-ecoboost-74kw','1.0 EcoBoost',74,100,999,'petrol',2017,2023,'M1JA',  'FWD'),
    ('fiesta-vii','1.0-ecoboost-92kw','1.0 EcoBoost',92,125,999,'petrol',2017,2023,'M2JA',  'FWD'),
    ('fiesta-vii','1.0-ecoboost-103kw','1.0 EcoBoost',103,140,999,'petrol',2018,2023,'M3JA','FWD'),
    ('fiesta-vii','1.5-ecoboost-147kw','1.5 EcoBoost ST',147,200,1497,'petrol',2018,2023,'YYJA','FWD'),
    ('fiesta-vii','1.1-tivct-51kw','1.1 Ti-VCT', 51,  70, 1084, 'petrol', 2017, 2021, 'XYJA',  'FWD'),
    ('fiesta-vii','1.5-tdci-63kw','1.5 TDCi',    63,  85, 1499, 'diesel', 2017, 2023, 'XUJB',  'FWD'),
    -- Mondeo III
    ('mondeo-iii','1.8-16v-81kw', '1.8 16V',     81, 110, 1798, 'petrol', 2000, 2007, 'CHBA',  'FWD'),
    ('mondeo-iii','1.8-16v-92kw', '1.8 16V',     92, 125, 1798, 'petrol', 2000, 2007, 'CHBB',  'FWD'),
    ('mondeo-iii','2.0-16v-107kw','2.0 16V',    107, 145, 1999, 'petrol', 2000, 2007, 'CJBB',  'FWD'),
    ('mondeo-iii','2.5-v6-125kw','2.5 V6',     125, 170, 2495, 'petrol', 2000, 2007, 'LCBD',  'FWD'),
    ('mondeo-iii','3.0-v6-st220-166kw','3.0 V6 ST220',166,226,2967,'petrol',2002,2007,'MEBA','FWD'),
    ('mondeo-iii','2.0-tdci-66kw','2.0 TDCi',    66,  90, 1998, 'diesel', 2001, 2007, 'D5BA',  'FWD'),
    ('mondeo-iii','2.0-tdci-85kw','2.0 TDCi',    85, 115, 1998, 'diesel', 2001, 2007, 'HJBC',  'FWD'),
    ('mondeo-iii','2.0-tdci-96kw','2.0 TDCi',    96, 130, 1998, 'diesel', 2001, 2007, 'FMBA',  'FWD'),
    -- Mondeo IV
    ('mondeo-iv', '1.6-tivct-81kw','1.6 Ti-VCT', 81, 110, 1596, 'petrol', 2007, 2014, 'PNBA',  'FWD'),
    ('mondeo-iv', '1.6-tivct-92kw','1.6 Ti-VCT', 92, 125, 1596, 'petrol', 2007, 2014, 'PNBB',  'FWD'),
    ('mondeo-iv', '1.6-ecoboost-118kw','1.6 EcoBoost',118,160,1596,'petrol',2010,2014,'JTBB','FWD'),
    ('mondeo-iv', '2.0-16v-107kw','2.0 16V',    107, 145, 1999, 'petrol', 2007, 2014, 'AOBA',  'FWD'),
    ('mondeo-iv', '2.0-ecoboost-149kw','2.0 EcoBoost',149,203,1999,'petrol',2010,2014,'TBBA','FWD'),
    ('mondeo-iv', '2.0-ecoboost-176kw','2.0 EcoBoost',176,240,1999,'petrol',2010,2014,'TBBB','FWD'),
    ('mondeo-iv', '2.5-turbo-162kw','2.5 Turbo',162,220,2521,'petrol', 2007, 2014, 'HUBA',  'FWD'),
    ('mondeo-iv', '1.6-tdci-85kw','1.6 TDCi',    85, 115, 1560, 'diesel', 2007, 2014, 'T1BA',  'FWD'),
    ('mondeo-iv', '1.8-tdci-92kw','1.8 TDCi',    92, 125, 1753, 'diesel', 2007, 2014, 'QYBA',  'FWD'),
    ('mondeo-iv', '2.0-tdci-103kw','2.0 TDCi',  103, 140, 1997, 'diesel', 2007, 2014, 'QXBA',  'FWD'),
    ('mondeo-iv', '2.0-tdci-120kw','2.0 TDCi',  120, 163, 1997, 'diesel', 2010, 2014, 'TXBA',  'FWD'),
    ('mondeo-iv', '2.2-tdci-129kw','2.2 TDCi',  129, 175, 2179, 'diesel', 2007, 2014, 'KNBA',  'FWD'),
    ('mondeo-iv', '2.2-tdci-147kw','2.2 TDCi',  147, 200, 2179, 'diesel', 2010, 2014, 'KNBB',  'FWD'),
    -- Mondeo V
    ('mondeo-v',  '1.5-ecoboost-118kw','1.5 EcoBoost',118,160,1497,'petrol',2014,2022,'M8CB','FWD'),
    ('mondeo-v',  '1.5-ecoboost-121kw','1.5 EcoBoost',121,165,1497,'petrol',2014,2022,'M9CA','FWD'),
    ('mondeo-v',  '2.0-ecoboost-149kw','2.0 EcoBoost',149,203,1999,'petrol',2014,2022,'TPBA','FWD'),
    ('mondeo-v',  '2.0-ecoboost-177kw','2.0 EcoBoost',177,240,1999,'petrol',2014,2022,'TPCA','FWD'),
    ('mondeo-v',  '2.0-tdci-110kw','2.0 TDCi',  110, 150, 1997, 'diesel', 2014, 2022, 'T7CB',  'FWD'),
    ('mondeo-v',  '2.0-tdci-132kw','2.0 TDCi',  132, 180, 1997, 'diesel', 2014, 2022, 'T8CC',  'FWD'),
    ('mondeo-v',  '2.0-ecoblue-110kw','2.0 EcoBlue',110,150,1996,'diesel',2018,2022,'YNCA','FWD'),
    ('mondeo-v',  '2.0-ecoblue-140kw','2.0 EcoBlue',140,190,1996,'diesel',2018,2022,'YNCB','FWD'),
    -- Galaxy II
    ('galaxy-ii', '1.6-ecoboost-118kw','1.6 EcoBoost',118,160,1596,'petrol',2010,2015,'JTWA','FWD'),
    ('galaxy-ii', '2.0-16v-107kw','2.0 16V',    107, 145, 1999, 'petrol', 2006, 2015, 'AOWA',  'FWD'),
    ('galaxy-ii', '2.0-ecoboost-149kw','2.0 EcoBoost',149,203,1999,'petrol',2010,2015,'TNWA','FWD'),
    ('galaxy-ii', '2.3-16v-118kw','2.3 16V',   118, 161, 2261, 'petrol', 2006, 2015, 'SEWA',  'FWD'),
    ('galaxy-ii', '1.6-tdci-85kw','1.6 TDCi',    85, 115, 1560, 'diesel', 2010, 2015, 'T3WA',  'FWD'),
    ('galaxy-ii', '1.8-tdci-92kw','1.8 TDCi',    92, 125, 1753, 'diesel', 2006, 2015, 'QYWA',  'FWD'),
    ('galaxy-ii', '2.0-tdci-103kw','2.0 TDCi',  103, 140, 1997, 'diesel', 2006, 2015, 'QXWA',  'FWD'),
    ('galaxy-ii', '2.0-tdci-120kw','2.0 TDCi',  120, 163, 1997, 'diesel', 2010, 2015, 'TXWA',  'FWD'),
    ('galaxy-ii', '2.0-tdci-132kw','2.0 TDCi',  132, 180, 1997, 'diesel', 2010, 2015, 'UFWA',  'FWD'),
    ('galaxy-ii', '2.2-tdci-147kw','2.2 TDCi',  147, 200, 2179, 'diesel', 2008, 2015, 'KNWA',  'FWD'),
    -- S-Max I
    ('s-max-i',   '1.6-ecoboost-118kw','1.6 EcoBoost',118,160,1596,'petrol',2010,2014,'JTWA','FWD'),
    ('s-max-i',   '2.0-16v-107kw','2.0 16V',    107, 145, 1999, 'petrol', 2006, 2014, 'AOWA',  'FWD'),
    ('s-max-i',   '2.0-ecoboost-149kw','2.0 EcoBoost',149,203,1999,'petrol',2010,2014,'TNWA','FWD'),
    ('s-max-i',   '2.3-16v-118kw','2.3 16V',   118, 161, 2261, 'petrol', 2006, 2014, 'SEWA',  'FWD'),
    ('s-max-i',   '1.6-tdci-85kw','1.6 TDCi',    85, 115, 1560, 'diesel', 2010, 2014, 'T3WA',  'FWD'),
    ('s-max-i',   '2.0-tdci-103kw','2.0 TDCi',  103, 140, 1997, 'diesel', 2006, 2014, 'QXWA',  'FWD'),
    ('s-max-i',   '2.0-tdci-120kw','2.0 TDCi',  120, 163, 1997, 'diesel', 2010, 2014, 'TXWA',  'FWD'),
    ('s-max-i',   '2.2-tdci-129kw','2.2 TDCi',  129, 175, 2179, 'diesel', 2008, 2014, 'KNWA',  'FWD'),
    ('s-max-i',   '2.2-tdci-147kw','2.2 TDCi',  147, 200, 2179, 'diesel', 2010, 2014, 'KNWB',  'FWD'),
    -- Kuga I
    ('kuga-i',    '2.0-16v-107kw','2.0 16V',   107, 145, 1999, 'petrol', 2008, 2012, 'AODA',  'AWD'),
    ('kuga-i',    '2.5-turbo-147kw','2.5 Turbo',147,200,2522,'petrol', 2008, 2012, 'HYDB',  'AWD'),
    ('kuga-i',    '2.0-tdci-100kw','2.0 TDCi', 100, 136, 1997, 'diesel', 2008, 2012, 'G6DG',  'AWD'),
    ('kuga-i',    '2.0-tdci-103kw','2.0 TDCi', 103, 140, 1997, 'diesel', 2010, 2012, 'UFDA',  'AWD'),
    ('kuga-i',    '2.0-tdci-120kw','2.0 TDCi', 120, 163, 1997, 'diesel', 2010, 2012, 'UFDB',  'AWD'),
    -- Kuga II
    ('kuga-ii',   '1.5-ecoboost-88kw','1.5 EcoBoost',88,120,1498,'petrol',2014,2019,'M9MA','FWD'),
    ('kuga-ii',   '1.5-ecoboost-110kw','1.5 EcoBoost',110,150,1498,'petrol',2014,2019,'UNMA','FWD'),
    ('kuga-ii',   '1.5-ecoboost-134kw','1.5 EcoBoost',134,182,1498,'petrol',2014,2019,'M8MA','AWD'),
    ('kuga-ii',   '1.6-ecoboost-110kw','1.6 EcoBoost',110,150,1596,'petrol',2013,2014,'JQMA','FWD'),
    ('kuga-ii',   '1.6-ecoboost-134kw','1.6 EcoBoost',134,182,1596,'petrol',2013,2014,'JQMB','AWD'),
    ('kuga-ii',   '2.0-ecoboost-176kw','2.0 EcoBoost',176,240,1999,'petrol',2013,2019,'TNMA','AWD'),
    ('kuga-ii',   '2.0-tdci-88kw','2.0 TDCi',   88, 120, 1997, 'diesel', 2013, 2019, 'T7MA',  'FWD'),
    ('kuga-ii',   '2.0-tdci-103kw','2.0 TDCi', 103, 140, 1997, 'diesel', 2013, 2019, 'T8MA',  'AWD'),
    ('kuga-ii',   '2.0-tdci-110kw','2.0 TDCi', 110, 150, 1997, 'diesel', 2013, 2019, 'T8MB',  'AWD'),
    ('kuga-ii',   '2.0-tdci-132kw','2.0 TDCi', 132, 180, 1997, 'diesel', 2013, 2019, 'T8MC',  'AWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name, power_kw = excluded.power_kw, power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc, fuel = excluded.fuel,
    year_from = excluded.year_from, year_to = excluded.year_to,
    engine_code = excluded.engine_code, drive = excluded.drive, is_active = true;

-- ============================================================================
-- SKODA — 13 models, ~80 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'skoda')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('octavia-i',     'Octavia I',     1996, 2010, 'sedan'),
    ('octavia-ii',    'Octavia II',    2004, 2013, 'sedan'),
    ('octavia-iii',   'Octavia III',   2012, 2020, 'sedan'),
    ('octavia-iv',    'Octavia IV',    2019, 2024, 'sedan'),
    ('fabia-i',       'Fabia I',       1999, 2007, 'hatchback'),
    ('fabia-ii',      'Fabia II',      2007, 2014, 'hatchback'),
    ('fabia-iii',     'Fabia III',     2014, 2021, 'hatchback'),
    ('superb-i',      'Superb I',      2001, 2008, 'sedan'),
    ('superb-ii',     'Superb II',     2008, 2015, 'sedan'),
    ('superb-iii',    'Superb III',    2015, 2024, 'sedan'),
    ('yeti',          'Yeti',          2009, 2017, 'suv'),
    ('kodiaq',        'Kodiaq',        2016, 2024, 'suv'),
    ('karoq',         'Karoq',         2017, 2024, 'suv'),
    ('rapid',         'Rapid',         2012, 2019, 'sedan')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'skoda'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Octavia I
    ('octavia-i',   '1.4-44kw',     '1.4',          44,  60, 1397, 'petrol', 1996, 2003, 'AMD',  'FWD'),
    ('octavia-i',   '1.4-16v-55kw', '1.4 16V',      55,  75, 1390, 'petrol', 1999, 2010, 'AHW',  'FWD'),
    ('octavia-i',   '1.4-16v-74kw', '1.4 16V',      74, 100, 1390, 'petrol', 2000, 2010, 'BCA',  'FWD'),
    ('octavia-i',   '1.6-55kw',     '1.6',          55,  75, 1595, 'petrol', 1996, 2010, 'AEE',  'FWD'),
    ('octavia-i',   '1.6-74kw',     '1.6',          74, 100, 1595, 'petrol', 2000, 2010, 'AEH',  'FWD'),
    ('octavia-i',   '1.8-92kw',     '1.8',          92, 125, 1781, 'petrol', 1996, 2010, 'AGN',  'FWD'),
    ('octavia-i',   '1.8-t-110kw',  '1.8 T',       110, 150, 1781, 'petrol', 2000, 2010, 'AGU',  'FWD'),
    ('octavia-i',   '1.8-t-rs-132kw','1.8 T RS',   132, 180, 1781, 'petrol', 2001, 2005, 'AUM',  'FWD'),
    ('octavia-i',   '2.0-85kw',     '2.0',          85, 116, 1984, 'petrol', 1996, 2010, 'AEG',  'FWD'),
    ('octavia-i',   '1.9-tdi-66kw', '1.9 TDi',      66,  90, 1896, 'diesel', 1996, 2010, 'AGR',  'FWD'),
    ('octavia-i',   '1.9-tdi-74kw', '1.9 TDi',      74, 100, 1896, 'diesel', 2000, 2010, 'ATD',  'FWD'),
    ('octavia-i',   '1.9-tdi-81kw', '1.9 TDi',      81, 110, 1896, 'diesel', 1996, 2010, 'AHF',  'FWD'),
    ('octavia-i',   '1.9-tdi-96kw', '1.9 TDi',      96, 130, 1896, 'diesel', 2000, 2010, 'ASZ',  'FWD'),
    -- Octavia II
    ('octavia-ii',  '1.4-16v-59kw', '1.4 16V',      59,  80, 1390, 'petrol', 2004, 2013, 'BUD',  'FWD'),
    ('octavia-ii',  '1.4-tsi-90kw', '1.4 TSi',      90, 122, 1390, 'petrol', 2008, 2013, 'CAXA', 'FWD'),
    ('octavia-ii',  '1.6-75kw',     '1.6',          75, 102, 1595, 'petrol', 2004, 2013, 'BSE',  'FWD'),
    ('octavia-ii',  '1.6-fsi-85kw', '1.6 FSi',      85, 115, 1598, 'petrol', 2004, 2008, 'BLF',  'FWD'),
    ('octavia-ii',  '1.8-tsi-118kw','1.8 TSi',     118, 160, 1798, 'petrol', 2007, 2013, 'BZB',  'FWD'),
    ('octavia-ii',  '2.0-fsi-110kw','2.0 FSi',     110, 150, 1984, 'petrol', 2004, 2008, 'BLR',  'FWD'),
    ('octavia-ii',  '2.0-tfsi-rs-147kw','2.0 TFSi RS',147,200,1984,'petrol',2005,2013,'BWA','FWD'),
    ('octavia-ii',  '1.6-tdi-77kw', '1.6 TDi',      77, 105, 1598, 'diesel', 2009, 2013, 'CAYC', 'FWD'),
    ('octavia-ii',  '1.9-tdi-77kw', '1.9 TDi',      77, 105, 1896, 'diesel', 2004, 2010, 'BLS',  'FWD'),
    ('octavia-ii',  '2.0-tdi-103kw','2.0 TDi',     103, 140, 1968, 'diesel', 2004, 2013, 'BKD',  'FWD'),
    ('octavia-ii',  '2.0-tdi-125kw','2.0 TDi RS',  125, 170, 1968, 'diesel', 2006, 2013, 'BMN',  'FWD'),
    -- Octavia III
    ('octavia-iii', '1.0-tsi-85kw', '1.0 TSi',      85, 115,  999, 'petrol', 2017, 2020, 'CHZL', 'FWD'),
    ('octavia-iii', '1.2-tsi-63kw', '1.2 TSi',      63,  86, 1197, 'petrol', 2012, 2017, 'CJZB', 'FWD'),
    ('octavia-iii', '1.2-tsi-77kw', '1.2 TSi',      77, 105, 1197, 'petrol', 2012, 2017, 'CJZA', 'FWD'),
    ('octavia-iii', '1.4-tsi-103kw','1.4 TSi',     103, 140, 1395, 'petrol', 2012, 2020, 'CHPA', 'FWD'),
    ('octavia-iii', '1.5-tsi-110kw','1.5 TSi',     110, 150, 1498, 'petrol', 2017, 2020, 'DADA', 'FWD'),
    ('octavia-iii', '1.8-tsi-132kw','1.8 TSi',     132, 180, 1798, 'petrol', 2012, 2020, 'CJSA', 'FWD'),
    ('octavia-iii', '2.0-tsi-rs-162kw','2.0 TSi RS',162,220, 1984,'petrol', 2013, 2020, 'CHHB', 'FWD'),
    ('octavia-iii', '2.0-tsi-rs-180kw','2.0 TSi RS',180,245, 1984,'petrol', 2017, 2020, 'CXCB', 'FWD'),
    ('octavia-iii', '1.6-tdi-66kw', '1.6 TDi',      66,  90, 1598, 'diesel', 2013, 2020, 'CRKB', 'FWD'),
    ('octavia-iii', '1.6-tdi-81kw', '1.6 TDi',      81, 110, 1598, 'diesel', 2012, 2020, 'CLHA', 'FWD'),
    ('octavia-iii', '2.0-tdi-110kw','2.0 TDi',     110, 150, 1968, 'diesel', 2012, 2020, 'CRBC', 'FWD'),
    ('octavia-iii', '2.0-tdi-rs-135kw','2.0 TDi RS',135,184, 1968,'diesel', 2014, 2020, 'CUNA', 'FWD'),
    -- Octavia IV
    ('octavia-iv',  '1.0-tsi-81kw', '1.0 TSi',      81, 110,  999, 'petrol', 2019, 2024, 'DKLA', 'FWD'),
    ('octavia-iv',  '1.5-tsi-110kw','1.5 TSi',     110, 150, 1498, 'petrol', 2019, 2024, 'DXDA', 'FWD'),
    ('octavia-iv',  '2.0-tsi-rs-180kw','2.0 TSi RS',180,245, 1984,'petrol', 2020, 2024, 'DJHA', 'FWD'),
    ('octavia-iv',  '2.0-tdi-85kw', '2.0 TDi',      85, 116, 1968, 'diesel', 2019, 2024, 'DTRC', 'FWD'),
    ('octavia-iv',  '2.0-tdi-110kw','2.0 TDi',     110, 150, 1968, 'diesel', 2019, 2024, 'DTRA', 'FWD'),
    ('octavia-iv',  '2.0-tdi-rs-147kw','2.0 TDi RS',147,200, 1968,'diesel', 2020, 2024, 'DTSA', 'FWD'),
    -- Fabia I
    ('fabia-i',     '1.0-37kw',     '1.0',          37,  50,  997, 'petrol', 1999, 2007, 'AQV',  'FWD'),
    ('fabia-i',     '1.2-12v-40kw', '1.2 12V',      40,  54, 1198, 'petrol', 2001, 2007, 'AWY',  'FWD'),
    ('fabia-i',     '1.2-12v-47kw', '1.2 12V',      47,  64, 1198, 'petrol', 2001, 2007, 'AZQ',  'FWD'),
    ('fabia-i',     '1.4-50kw',     '1.4',          50,  68, 1397, 'petrol', 1999, 2007, 'AKK',  'FWD'),
    ('fabia-i',     '1.4-16v-55kw', '1.4 16V',      55,  75, 1390, 'petrol', 1999, 2007, 'AUA',  'FWD'),
    ('fabia-i',     '1.4-16v-74kw', '1.4 16V',      74, 100, 1390, 'petrol', 2003, 2007, 'BBY',  'FWD'),
    ('fabia-i',     '1.9-sdi-47kw', '1.9 SDi',      47,  64, 1896, 'diesel', 2000, 2007, 'ASY',  'FWD'),
    ('fabia-i',     '1.9-tdi-74kw', '1.9 TDi',      74, 100, 1896, 'diesel', 2000, 2007, 'ATD',  'FWD'),
    -- Fabia II
    ('fabia-ii',    '1.2-12v-44kw', '1.2 12V',      44,  60, 1198, 'petrol', 2007, 2014, 'BBM',  'FWD'),
    ('fabia-ii',    '1.2-htp-51kw', '1.2 HTP',      51,  70, 1198, 'petrol', 2007, 2014, 'CGPA', 'FWD'),
    ('fabia-ii',    '1.2-tsi-63kw', '1.2 TSi',      63,  86, 1197, 'petrol', 2010, 2014, 'CBZA', 'FWD'),
    ('fabia-ii',    '1.4-16v-63kw', '1.4 16V',      63,  86, 1390, 'petrol', 2007, 2014, 'BXW',  'FWD'),
    ('fabia-ii',    '1.4-tsi-rs-132kw','1.4 TSi RS',132,180,1390,'petrol', 2010, 2014, 'CAVE', 'FWD'),
    ('fabia-ii',    '1.6-77kw',     '1.6 16V',      77, 105, 1598, 'petrol', 2007, 2014, 'BTS',  'FWD'),
    ('fabia-ii',    '1.4-tdi-51kw', '1.4 TDi',      51,  70, 1422, 'diesel', 2007, 2010, 'BNM',  'FWD'),
    ('fabia-ii',    '1.6-tdi-55kw', '1.6 TDi',      55,  75, 1598, 'diesel', 2010, 2014, 'CAYA', 'FWD'),
    ('fabia-ii',    '1.6-tdi-66kw', '1.6 TDi',      66,  90, 1598, 'diesel', 2010, 2014, 'CAYB', 'FWD'),
    ('fabia-ii',    '1.6-tdi-77kw', '1.6 TDi',      77, 105, 1598, 'diesel', 2010, 2014, 'CAYC', 'FWD'),
    -- Fabia III
    ('fabia-iii',   '1.0-mpi-44kw', '1.0 MPi',      44,  60,  999, 'petrol', 2014, 2021, 'CHYA', 'FWD'),
    ('fabia-iii',   '1.0-mpi-55kw', '1.0 MPi',      55,  75,  999, 'petrol', 2014, 2021, 'CHYB', 'FWD'),
    ('fabia-iii',   '1.0-tsi-70kw', '1.0 TSi',      70,  95,  999, 'petrol', 2017, 2021, 'CHZB', 'FWD'),
    ('fabia-iii',   '1.0-tsi-81kw', '1.0 TSi',      81, 110,  999, 'petrol', 2017, 2021, 'CHZL', 'FWD'),
    ('fabia-iii',   '1.2-tsi-66kw', '1.2 TSi',      66,  90, 1197, 'petrol', 2014, 2017, 'CJZD', 'FWD'),
    ('fabia-iii',   '1.2-tsi-81kw', '1.2 TSi',      81, 110, 1197, 'petrol', 2014, 2017, 'CJZC', 'FWD'),
    ('fabia-iii',   '1.4-tdi-66kw', '1.4 TDi',      66,  90, 1422, 'diesel', 2014, 2018, 'CUSB', 'FWD'),
    ('fabia-iii',   '1.4-tdi-77kw', '1.4 TDi',      77, 105, 1422, 'diesel', 2014, 2018, 'CUTA', 'FWD'),
    -- Superb I
    ('superb-i',    '1.8-t-110kw',  '1.8 T',       110, 150, 1781, 'petrol', 2001, 2008, 'AWT',  'FWD'),
    ('superb-i',    '2.0-85kw',     '2.0',          85, 116, 1984, 'petrol', 2001, 2008, 'AZM',  'FWD'),
    ('superb-i',    '2.8-v6-142kw', '2.8 V6',      142, 193, 2771, 'petrol', 2001, 2008, 'BBG',  'FWD'),
    ('superb-i',    '1.9-tdi-74kw', '1.9 TDi',      74, 101, 1896, 'diesel', 2001, 2008, 'AVB',  'FWD'),
    ('superb-i',    '1.9-tdi-96kw', '1.9 TDi',      96, 130, 1896, 'diesel', 2001, 2008, 'AVF',  'FWD'),
    ('superb-i',    '2.5-tdi-114kw','2.5 TDi V6',  114, 155, 2496, 'diesel', 2001, 2008, 'BAU',  'FWD'),
    ('superb-i',    '2.5-tdi-132kw','2.5 TDi V6',  132, 180, 2496, 'diesel', 2001, 2008, 'BDH',  'FWD'),
    -- Superb II
    ('superb-ii',   '1.4-tsi-92kw', '1.4 TSi',      92, 125, 1390, 'petrol', 2008, 2015, 'CAXC', 'FWD'),
    ('superb-ii',   '1.8-tsi-118kw','1.8 TSi',     118, 160, 1798, 'petrol', 2008, 2015, 'BZB',  'FWD'),
    ('superb-ii',   '2.0-tsi-147kw','2.0 TSi',     147, 200, 1984, 'petrol', 2008, 2015, 'CCZA', 'FWD'),
    ('superb-ii',   '3.6-fsi-191kw','3.6 FSi V6',  191, 260, 3597, 'petrol', 2008, 2015, 'BLV',  'AWD'),
    ('superb-ii',   '1.9-tdi-77kw', '1.9 TDi',      77, 105, 1896, 'diesel', 2008, 2010, 'BXE',  'FWD'),
    ('superb-ii',   '2.0-tdi-103kw','2.0 TDi',     103, 140, 1968, 'diesel', 2008, 2015, 'CBAB', 'FWD'),
    ('superb-ii',   '2.0-tdi-125kw','2.0 TDi',     125, 170, 1968, 'diesel', 2008, 2015, 'CBBB', 'FWD'),
    -- Superb III
    ('superb-iii',  '1.4-tsi-92kw', '1.4 TSi',      92, 125, 1395, 'petrol', 2015, 2020, 'CMBA', 'FWD'),
    ('superb-iii',  '1.4-tsi-110kw','1.4 TSi',     110, 150, 1395, 'petrol', 2015, 2020, 'CZCA', 'FWD'),
    ('superb-iii',  '1.5-tsi-110kw','1.5 TSi',     110, 150, 1498, 'petrol', 2017, 2024, 'DADA', 'FWD'),
    ('superb-iii',  '1.8-tsi-132kw','1.8 TSi',     132, 180, 1798, 'petrol', 2015, 2020, 'CJSA', 'FWD'),
    ('superb-iii',  '2.0-tsi-162kw','2.0 TSi',     162, 220, 1984, 'petrol', 2015, 2024, 'CHHB', 'FWD'),
    ('superb-iii',  '2.0-tsi-200kw','2.0 TSi',     200, 272, 1984, 'petrol', 2015, 2024, 'CXCB', 'AWD'),
    ('superb-iii',  '1.6-tdi-88kw', '1.6 TDi',      88, 120, 1598, 'diesel', 2015, 2020, 'DDYB', 'FWD'),
    ('superb-iii',  '2.0-tdi-110kw','2.0 TDi',     110, 150, 1968, 'diesel', 2015, 2024, 'CRMB', 'FWD'),
    ('superb-iii',  '2.0-tdi-140kw','2.0 TDi',     140, 190, 1968, 'diesel', 2015, 2024, 'DFCA', 'AWD'),
    -- Yeti
    ('yeti',        '1.2-tsi-77kw', '1.2 TSi',      77, 105, 1197, 'petrol', 2009, 2017, 'CBZB', 'FWD'),
    ('yeti',        '1.4-tsi-90kw', '1.4 TSi',      90, 122, 1390, 'petrol', 2009, 2017, 'CAXA', 'FWD'),
    ('yeti',        '1.8-tsi-118kw','1.8 TSi',     118, 160, 1798, 'petrol', 2009, 2017, 'CDAA', 'AWD'),
    ('yeti',        '2.0-tdi-81kw', '2.0 TDi',      81, 110, 1968, 'diesel', 2009, 2017, 'CFHF', 'FWD'),
    ('yeti',        '2.0-tdi-103kw','2.0 TDi',     103, 140, 1968, 'diesel', 2009, 2017, 'CFHA', 'AWD'),
    ('yeti',        '2.0-tdi-125kw','2.0 TDi',     125, 170, 1968, 'diesel', 2009, 2017, 'CFJA', 'AWD'),
    -- Kodiaq
    ('kodiaq',      '1.4-tsi-110kw','1.4 TSi',     110, 150, 1395, 'petrol', 2016, 2018, 'CZCA', 'AWD'),
    ('kodiaq',      '1.5-tsi-110kw','1.5 TSi',     110, 150, 1498, 'petrol', 2018, 2024, 'DADA', 'FWD'),
    ('kodiaq',      '2.0-tsi-132kw','2.0 TSi',     132, 180, 1984, 'petrol', 2016, 2024, 'DKZA', 'AWD'),
    ('kodiaq',      '2.0-tdi-110kw','2.0 TDi',     110, 150, 1968, 'diesel', 2016, 2024, 'DFGA', 'AWD'),
    ('kodiaq',      '2.0-tdi-140kw','2.0 TDi',     140, 190, 1968, 'diesel', 2016, 2024, 'DFHA', 'AWD'),
    -- Karoq
    ('karoq',       '1.0-tsi-85kw', '1.0 TSi',      85, 115,  999, 'petrol', 2017, 2024, 'CHZL', 'FWD'),
    ('karoq',       '1.5-tsi-110kw','1.5 TSi',     110, 150, 1498, 'petrol', 2017, 2024, 'DADA', 'FWD'),
    ('karoq',       '2.0-tsi-140kw','2.0 TSi',     140, 190, 1984, 'petrol', 2017, 2024, 'DKZA', 'AWD'),
    ('karoq',       '1.6-tdi-85kw', '1.6 TDi',      85, 116, 1598, 'diesel', 2017, 2020, 'DDYB', 'FWD'),
    ('karoq',       '2.0-tdi-110kw','2.0 TDi',     110, 150, 1968, 'diesel', 2017, 2024, 'DFGA', 'AWD'),
    -- Rapid
    ('rapid',       '1.2-tsi-63kw', '1.2 TSi',      63,  86, 1197, 'petrol', 2012, 2019, 'CBZA', 'FWD'),
    ('rapid',       '1.2-tsi-77kw', '1.2 TSi',      77, 105, 1197, 'petrol', 2012, 2019, 'CBZB', 'FWD'),
    ('rapid',       '1.4-tsi-90kw', '1.4 TSi',     90, 122, 1390, 'petrol', 2012, 2019, 'CAXA', 'FWD'),
    ('rapid',       '1.6-77kw',     '1.6',          77, 105, 1598, 'petrol', 2012, 2019, 'CFNA', 'FWD'),
    ('rapid',       '1.6-tdi-66kw', '1.6 TDi',      66,  90, 1598, 'diesel', 2012, 2019, 'CAYB', 'FWD'),
    ('rapid',       '1.6-tdi-77kw', '1.6 TDi',      77, 105, 1598, 'diesel', 2012, 2019, 'CAYC', 'FWD')
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
-- =============================================================================
-- Vehicle taxonomy MEGA seed — part 3/6
-- RENAULT + PEUGEOT (~26 models, ~170 engines)
-- Idempotent. Run AFTER supabase-vehicles-seed-mega-2.sql.
-- =============================================================================

-- ============================================================================
-- RENAULT — 13 models, ~95 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'renault')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('megane-i',     'Mégane I',     1995, 2003, 'hatchback'),
    ('megane-ii',    'Mégane II',    2002, 2009, 'hatchback'),
    ('megane-iii',   'Mégane III',   2008, 2016, 'hatchback'),
    ('megane-iv',    'Mégane IV',    2015, 2022, 'hatchback'),
    ('clio-ii',      'Clio II',      1998, 2005, 'hatchback'),
    ('clio-iii',     'Clio III',     2005, 2012, 'hatchback'),
    ('clio-iv',      'Clio IV',      2012, 2019, 'hatchback'),
    ('clio-v',       'Clio V',       2019, 2024, 'hatchback'),
    ('laguna-ii',    'Laguna II',    2001, 2007, 'sedan'),
    ('laguna-iii',   'Laguna III',   2007, 2015, 'sedan'),
    ('scenic-ii',    'Scénic II',    2003, 2009, 'mpv'),
    ('scenic-iii',   'Scénic III',   2009, 2016, 'mpv'),
    ('scenic-iv',    'Scénic IV',    2016, 2022, 'mpv'),
    ('kangoo-ii',    'Kangoo II',    2008, 2021, 'mpv'),
    ('trafic-ii',    'Trafic II',    2001, 2014, 'van'),
    ('trafic-iii',   'Trafic III',   2014, 2024, 'van'),
    ('captur-i',     'Captur I',     2013, 2019, 'suv')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'renault'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Mégane I
    ('megane-i',  '1.4-16v-70kw',  '1.4 16V',     70,  95, 1390, 'petrol', 1999, 2003, 'K4J',   'FWD'),
    ('megane-i',  '1.6-16v-79kw',  '1.6 16V',     79, 107, 1598, 'petrol', 1999, 2003, 'K4M',   'FWD'),
    ('megane-i',  '1.8-16v-86kw',  '1.8 16V',     86, 117, 1783, 'petrol', 1999, 2003, 'F4P',   'FWD'),
    ('megane-i',  '2.0-16v-103kw', '2.0 16V',    103, 140, 1998, 'petrol', 1999, 2003, 'F4R',   'FWD'),
    ('megane-i',  '1.9-dti-72kw',  '1.9 dTi',     72,  98, 1870, 'diesel', 2000, 2003, 'F9Q',   'FWD'),
    ('megane-i',  '1.9-dci-75kw',  '1.9 dCi',     75, 102, 1870, 'diesel', 2001, 2003, 'F9Q',   'FWD'),
    -- Mégane II
    ('megane-ii', '1.4-16v-72kw',  '1.4 16V',     72,  98, 1390, 'petrol', 2002, 2009, 'K4J',   'FWD'),
    ('megane-ii', '1.6-16v-83kw',  '1.6 16V',     83, 113, 1598, 'petrol', 2002, 2009, 'K4M',   'FWD'),
    ('megane-ii', '1.6-16v-82kw',  '1.6 16V',     82, 112, 1598, 'petrol', 2003, 2009, 'K4M',   'FWD'),
    ('megane-ii', '2.0-16v-99kw',  '2.0 16V',     99, 135, 1998, 'petrol', 2002, 2009, 'F4R',   'FWD'),
    ('megane-ii', '2.0-rs-165kw',  '2.0 16V RS', 165, 225, 1998, 'petrol', 2004, 2009, 'F4Rt',  'FWD'),
    ('megane-ii', '1.5-dci-60kw',  '1.5 dCi',     60,  82, 1461, 'diesel', 2002, 2009, 'K9K',   'FWD'),
    ('megane-ii', '1.5-dci-78kw',  '1.5 dCi',     78, 106, 1461, 'diesel', 2005, 2009, 'K9K',   'FWD'),
    ('megane-ii', '1.9-dci-88kw',  '1.9 dCi',     88, 120, 1870, 'diesel', 2002, 2009, 'F9Q',   'FWD'),
    ('megane-ii', '2.0-dci-110kw', '2.0 dCi',    110, 150, 1995, 'diesel', 2005, 2009, 'M9R',   'FWD'),
    -- Mégane III
    ('megane-iii','1.2-tce-85kw',  '1.2 TCe',     85, 116, 1198, 'petrol', 2012, 2016, 'H5Ft',  'FWD'),
    ('megane-iii','1.4-tce-96kw',  '1.4 TCe',     96, 130, 1397, 'petrol', 2008, 2014, 'H4Jt',  'FWD'),
    ('megane-iii','1.6-16v-81kw',  '1.6 16V',     81, 110, 1598, 'petrol', 2008, 2016, 'K4M',   'FWD'),
    ('megane-iii','2.0-16v-103kw', '2.0 16V',    103, 140, 1998, 'petrol', 2008, 2016, 'M4R',   'FWD'),
    ('megane-iii','2.0-rs-184kw',  '2.0 RS',     184, 250, 1998, 'petrol', 2009, 2016, 'F4Rt',  'FWD'),
    ('megane-iii','1.5-dci-66kw',  '1.5 dCi',     66,  90, 1461, 'diesel', 2008, 2016, 'K9K',   'FWD'),
    ('megane-iii','1.5-dci-81kw',  '1.5 dCi',     81, 110, 1461, 'diesel', 2008, 2016, 'K9K',   'FWD'),
    ('megane-iii','1.6-dci-96kw',  '1.6 dCi',     96, 130, 1598, 'diesel', 2011, 2016, 'R9M',   'FWD'),
    ('megane-iii','1.9-dci-96kw',  '1.9 dCi',     96, 130, 1870, 'diesel', 2008, 2014, 'F9Q',   'FWD'),
    ('megane-iii','2.0-dci-110kw', '2.0 dCi',    110, 150, 1995, 'diesel', 2008, 2016, 'M9R',   'FWD'),
    ('megane-iii','2.0-dci-118kw', '2.0 dCi',    118, 160, 1995, 'diesel', 2008, 2016, 'M9R',   'FWD'),
    -- Mégane IV
    ('megane-iv', '1.2-tce-74kw',  '1.2 TCe',     74, 100, 1197, 'petrol', 2015, 2018, 'H5Ft',  'FWD'),
    ('megane-iv', '1.2-tce-97kw',  '1.2 TCe',     97, 132, 1197, 'petrol', 2015, 2018, 'H5Ft',  'FWD'),
    ('megane-iv', '1.3-tce-103kw', '1.3 TCe',    103, 140, 1332, 'petrol', 2018, 2022, 'H5Ht',  'FWD'),
    ('megane-iv', '1.3-tce-117kw', '1.3 TCe',    117, 159, 1332, 'petrol', 2018, 2022, 'H5Ht',  'FWD'),
    ('megane-iv', '1.6-tce-rs-205kw','1.6 TCe RS',205,280,1618,'petrol', 2018, 2022, 'M5Mt',   'FWD'),
    ('megane-iv', '1.5-dci-66kw',  '1.5 dCi',     66,  90, 1461, 'diesel', 2015, 2022, 'K9K',   'FWD'),
    ('megane-iv', '1.5-dci-81kw',  '1.5 dCi',     81, 110, 1461, 'diesel', 2015, 2022, 'K9K',   'FWD'),
    ('megane-iv', '1.6-dci-96kw',  '1.6 dCi',     96, 130, 1598, 'diesel', 2015, 2022, 'R9M',   'FWD'),
    ('megane-iv', '1.6-dci-118kw', '1.6 dCi',    118, 160, 1598, 'diesel', 2015, 2022, 'R9M',   'FWD'),
    -- Clio II
    ('clio-ii',   '1.2-43kw',      '1.2',         43,  58, 1149, 'petrol', 1998, 2005, 'D7F',   'FWD'),
    ('clio-ii',   '1.2-16v-55kw',  '1.2 16V',     55,  75, 1149, 'petrol', 2001, 2005, 'D4F',   'FWD'),
    ('clio-ii',   '1.4-16v-72kw',  '1.4 16V',     72,  98, 1390, 'petrol', 1999, 2005, 'K4J',   'FWD'),
    ('clio-ii',   '1.6-16v-79kw',  '1.6 16V',     79, 107, 1598, 'petrol', 1999, 2005, 'K4M',   'FWD'),
    ('clio-ii',   '2.0-16v-rs-127kw','2.0 16V RS',127,172,1998,'petrol', 2001, 2005, 'F4R',    'FWD'),
    ('clio-ii',   '1.5-dci-48kw',  '1.5 dCi',     48,  65, 1461, 'diesel', 2001, 2005, 'K9K',   'FWD'),
    ('clio-ii',   '1.5-dci-60kw',  '1.5 dCi',     60,  82, 1461, 'diesel', 2001, 2005, 'K9K',   'FWD'),
    ('clio-ii',   '1.9-d-47kw',    '1.9 D',       47,  64, 1870, 'diesel', 1998, 2003, 'F8Q',   'FWD'),
    -- Clio III
    ('clio-iii',  '1.2-16v-55kw',  '1.2 16V',     55,  75, 1149, 'petrol', 2005, 2012, 'D4F',   'FWD'),
    ('clio-iii',  '1.2-tce-74kw',  '1.2 TCe',     74, 100, 1149, 'petrol', 2007, 2012, 'D4Ft',  'FWD'),
    ('clio-iii',  '1.4-16v-72kw',  '1.4 16V',     72,  98, 1390, 'petrol', 2005, 2012, 'K4J',   'FWD'),
    ('clio-iii',  '1.6-16v-82kw',  '1.6 16V',     82, 112, 1598, 'petrol', 2005, 2012, 'K4M',   'FWD'),
    ('clio-iii',  '2.0-16v-rs-149kw','2.0 16V RS',149,203,1998,'petrol', 2006, 2012, 'F4R',    'FWD'),
    ('clio-iii',  '1.5-dci-50kw',  '1.5 dCi',     50,  68, 1461, 'diesel', 2005, 2012, 'K9K',   'FWD'),
    ('clio-iii',  '1.5-dci-63kw',  '1.5 dCi',     63,  86, 1461, 'diesel', 2005, 2012, 'K9K',   'FWD'),
    ('clio-iii',  '1.5-dci-78kw',  '1.5 dCi',     78, 106, 1461, 'diesel', 2005, 2012, 'K9K',   'FWD'),
    -- Clio IV
    ('clio-iv',   '0.9-tce-66kw',  '0.9 TCe',     66,  90,  898, 'petrol', 2012, 2019, 'H4Bt',  'FWD'),
    ('clio-iv',   '1.2-16v-54kw',  '1.2 16V',     54,  73, 1149, 'petrol', 2012, 2019, 'D4F',   'FWD'),
    ('clio-iv',   '1.2-tce-87kw',  '1.2 TCe',     87, 118, 1197, 'petrol', 2012, 2019, 'H5Ft',  'FWD'),
    ('clio-iv',   '1.6-tce-rs-147kw','1.6 TCe RS',147,200,1618,'petrol', 2012, 2019, 'M5Mt',   'FWD'),
    ('clio-iv',   '1.5-dci-55kw',  '1.5 dCi',     55,  75, 1461, 'diesel', 2012, 2019, 'K9K',   'FWD'),
    ('clio-iv',   '1.5-dci-66kw',  '1.5 dCi',     66,  90, 1461, 'diesel', 2012, 2019, 'K9K',   'FWD'),
    ('clio-iv',   '1.5-dci-81kw',  '1.5 dCi',     81, 110, 1461, 'diesel', 2012, 2019, 'K9K',   'FWD'),
    -- Clio V
    ('clio-v',    '1.0-sce-49kw',  '1.0 SCe',     49,  65,  999, 'petrol', 2019, 2024, 'B4D',   'FWD'),
    ('clio-v',    '1.0-tce-74kw',  '1.0 TCe',     74, 100,  999, 'petrol', 2019, 2024, 'H4Dt',  'FWD'),
    ('clio-v',    '1.3-tce-96kw',  '1.3 TCe',     96, 130, 1332, 'petrol', 2019, 2024, 'H5Ht',  'FWD'),
    ('clio-v',    '1.5-dci-63kw',  '1.5 Blue dCi',63,  85, 1461, 'diesel', 2019, 2024, 'K9K',   'FWD'),
    ('clio-v',    '1.5-dci-85kw',  '1.5 Blue dCi',85, 115, 1461, 'diesel', 2019, 2024, 'K9K',   'FWD'),
    -- Laguna II
    ('laguna-ii', '1.6-16v-79kw',  '1.6 16V',     79, 107, 1598, 'petrol', 2001, 2007, 'K4M',   'FWD'),
    ('laguna-ii', '1.8-16v-86kw',  '1.8 16V',     86, 117, 1783, 'petrol', 2001, 2007, 'F4P',   'FWD'),
    ('laguna-ii', '2.0-16v-99kw',  '2.0 16V',     99, 135, 1998, 'petrol', 2001, 2007, 'F4R',   'FWD'),
    ('laguna-ii', '2.0-turbo-120kw','2.0 Turbo', 120, 165, 1998, 'petrol', 2002, 2007, 'F4Rt',  'FWD'),
    ('laguna-ii', '3.0-v6-152kw',  '3.0 V6 24V', 152, 207, 2946, 'petrol', 2001, 2005, 'L7X',   'FWD'),
    ('laguna-ii', '1.9-dci-79kw',  '1.9 dCi',     79, 107, 1870, 'diesel', 2001, 2007, 'F9Q',   'FWD'),
    ('laguna-ii', '1.9-dci-96kw',  '1.9 dCi',     96, 130, 1870, 'diesel', 2003, 2007, 'F9Q',   'FWD'),
    ('laguna-ii', '2.0-dci-110kw', '2.0 dCi',    110, 150, 1995, 'diesel', 2005, 2007, 'M9R',   'FWD'),
    ('laguna-ii', '2.2-dci-110kw', '2.2 dCi',    110, 150, 2188, 'diesel', 2001, 2005, 'G9T',   'FWD'),
    -- Laguna III
    ('laguna-iii','1.6-16v-81kw',  '1.6 16V',     81, 110, 1598, 'petrol', 2007, 2015, 'K4M',   'FWD'),
    ('laguna-iii','2.0-16v-103kw', '2.0 16V',    103, 140, 1998, 'petrol', 2007, 2015, 'M4R',   'FWD'),
    ('laguna-iii','2.0-tce-150kw', '2.0 TCe',    150, 204, 1998, 'petrol', 2008, 2015, 'F4Rt',  'FWD'),
    ('laguna-iii','3.5-v6-175kw',  '3.5 V6',     175, 238, 3498, 'petrol', 2008, 2015, 'V4Y',   'FWD'),
    ('laguna-iii','1.5-dci-81kw',  '1.5 dCi',     81, 110, 1461, 'diesel', 2007, 2015, 'K9K',   'FWD'),
    ('laguna-iii','2.0-dci-96kw',  '2.0 dCi',     96, 131, 1995, 'diesel', 2007, 2015, 'M9R',   'FWD'),
    ('laguna-iii','2.0-dci-110kw', '2.0 dCi',    110, 150, 1995, 'diesel', 2007, 2015, 'M9R',   'FWD'),
    ('laguna-iii','2.0-dci-127kw', '2.0 dCi',    127, 173, 1995, 'diesel', 2007, 2015, 'M9R',   'FWD'),
    ('laguna-iii','3.0-dci-173kw', '3.0 dCi V6', 173, 235, 2993, 'diesel', 2007, 2015, 'V9X',   'FWD'),
    -- Scenic II
    ('scenic-ii', '1.4-16v-72kw',  '1.4 16V',     72,  98, 1390, 'petrol', 2003, 2009, 'K4J',   'FWD'),
    ('scenic-ii', '1.6-16v-83kw',  '1.6 16V',     83, 113, 1598, 'petrol', 2003, 2009, 'K4M',   'FWD'),
    ('scenic-ii', '2.0-16v-99kw',  '2.0 16V',     99, 135, 1998, 'petrol', 2003, 2009, 'F4R',   'FWD'),
    ('scenic-ii', '1.5-dci-60kw',  '1.5 dCi',     60,  82, 1461, 'diesel', 2003, 2009, 'K9K',   'FWD'),
    ('scenic-ii', '1.5-dci-78kw',  '1.5 dCi',     78, 106, 1461, 'diesel', 2005, 2009, 'K9K',   'FWD'),
    ('scenic-ii', '1.9-dci-88kw',  '1.9 dCi',     88, 120, 1870, 'diesel', 2003, 2009, 'F9Q',   'FWD'),
    ('scenic-ii', '2.0-dci-110kw', '2.0 dCi',    110, 150, 1995, 'diesel', 2005, 2009, 'M9R',   'FWD'),
    -- Scenic III
    ('scenic-iii','1.2-tce-85kw',  '1.2 TCe',     85, 116, 1198, 'petrol', 2012, 2016, 'H5Ft',  'FWD'),
    ('scenic-iii','1.4-tce-96kw',  '1.4 TCe',     96, 130, 1397, 'petrol', 2009, 2016, 'H4Jt',  'FWD'),
    ('scenic-iii','1.6-16v-81kw',  '1.6 16V',     81, 110, 1598, 'petrol', 2009, 2016, 'K4M',   'FWD'),
    ('scenic-iii','2.0-16v-103kw', '2.0 16V',    103, 140, 1998, 'petrol', 2009, 2016, 'M4R',   'FWD'),
    ('scenic-iii','1.5-dci-78kw',  '1.5 dCi',     78, 106, 1461, 'diesel', 2009, 2016, 'K9K',   'FWD'),
    ('scenic-iii','1.5-dci-81kw',  '1.5 dCi',     81, 110, 1461, 'diesel', 2009, 2016, 'K9K',   'FWD'),
    ('scenic-iii','1.6-dci-96kw',  '1.6 dCi',     96, 130, 1598, 'diesel', 2011, 2016, 'R9M',   'FWD'),
    ('scenic-iii','1.9-dci-96kw',  '1.9 dCi',     96, 130, 1870, 'diesel', 2009, 2014, 'F9Q',   'FWD'),
    ('scenic-iii','2.0-dci-110kw', '2.0 dCi',    110, 150, 1995, 'diesel', 2009, 2016, 'M9R',   'FWD'),
    -- Scenic IV
    ('scenic-iv', '1.2-tce-85kw',  '1.2 TCe',     85, 115, 1197, 'petrol', 2016, 2020, 'H5Ft',  'FWD'),
    ('scenic-iv', '1.2-tce-97kw',  '1.2 TCe',     97, 132, 1197, 'petrol', 2016, 2020, 'H5Ft',  'FWD'),
    ('scenic-iv', '1.3-tce-103kw', '1.3 TCe',    103, 140, 1332, 'petrol', 2018, 2022, 'H5Ht',  'FWD'),
    ('scenic-iv', '1.5-dci-81kw',  '1.5 dCi',     81, 110, 1461, 'diesel', 2016, 2022, 'K9K',   'FWD'),
    ('scenic-iv', '1.6-dci-96kw',  '1.6 dCi',     96, 130, 1598, 'diesel', 2016, 2022, 'R9M',   'FWD'),
    ('scenic-iv', '1.6-dci-118kw', '1.6 dCi',    118, 160, 1598, 'diesel', 2016, 2022, 'R9M',   'FWD'),
    -- Kangoo II
    ('kangoo-ii', '1.2-tce-84kw',  '1.2 TCe',     84, 115, 1197, 'petrol', 2013, 2021, 'H5Ft',  'FWD'),
    ('kangoo-ii', '1.6-78kw',      '1.6',         78, 106, 1598, 'petrol', 2008, 2021, 'K7M',   'FWD'),
    ('kangoo-ii', '1.5-dci-50kw',  '1.5 dCi',     50,  68, 1461, 'diesel', 2008, 2021, 'K9K',   'FWD'),
    ('kangoo-ii', '1.5-dci-66kw',  '1.5 dCi',     66,  90, 1461, 'diesel', 2008, 2021, 'K9K',   'FWD'),
    ('kangoo-ii', '1.5-dci-81kw',  '1.5 dCi',     81, 110, 1461, 'diesel', 2008, 2021, 'K9K',   'FWD'),
    -- Trafic II
    ('trafic-ii', '2.0-85kw',      '2.0 16V',     85, 115, 1998, 'petrol', 2001, 2014, 'F4R',   'FWD'),
    ('trafic-ii', '1.9-dci-60kw',  '1.9 dCi',     60,  82, 1870, 'diesel', 2001, 2006, 'F9Q',   'FWD'),
    ('trafic-ii', '1.9-dci-74kw',  '1.9 dCi',     74, 101, 1870, 'diesel', 2001, 2006, 'F9Q',   'FWD'),
    ('trafic-ii', '2.0-dci-66kw',  '2.0 dCi',     66,  90, 1995, 'diesel', 2006, 2014, 'M9R',   'FWD'),
    ('trafic-ii', '2.0-dci-84kw',  '2.0 dCi',     84, 114, 1995, 'diesel', 2006, 2014, 'M9R',   'FWD'),
    ('trafic-ii', '2.0-dci-107kw', '2.0 dCi',    107, 145, 1995, 'diesel', 2006, 2014, 'M9R',   'FWD'),
    ('trafic-ii', '2.5-dci-99kw',  '2.5 dCi',     99, 135, 2463, 'diesel', 2003, 2014, 'G9U',   'FWD'),
    ('trafic-ii', '2.5-dci-107kw', '2.5 dCi',    107, 145, 2463, 'diesel', 2006, 2014, 'G9U',   'FWD'),
    -- Trafic III
    ('trafic-iii','1.6-dci-66kw',  '1.6 dCi',     66,  90, 1598, 'diesel', 2014, 2024, 'R9M',   'FWD'),
    ('trafic-iii','1.6-dci-85kw',  '1.6 dCi',     85, 115, 1598, 'diesel', 2014, 2024, 'R9M',   'FWD'),
    ('trafic-iii','1.6-dci-89kw',  '1.6 dCi',     89, 120, 1598, 'diesel', 2014, 2024, 'R9M',   'FWD'),
    ('trafic-iii','1.6-dci-107kw', '1.6 dCi',    107, 145, 1598, 'diesel', 2014, 2024, 'R9M',   'FWD'),
    ('trafic-iii','2.0-dci-80kw',  '2.0 Blue dCi',80,  110, 1997,'diesel', 2019, 2024, 'M9R',   'FWD'),
    ('trafic-iii','2.0-dci-110kw', '2.0 Blue dCi',110,150, 1997,'diesel', 2019, 2024, 'M9R',   'FWD'),
    ('trafic-iii','2.0-dci-125kw', '2.0 Blue dCi',125,170, 1997,'diesel', 2019, 2024, 'M9R',   'FWD'),
    -- Captur I
    ('captur-i',  '0.9-tce-66kw',  '0.9 TCe',     66,  90,  898, 'petrol', 2013, 2019, 'H4Bt',  'FWD'),
    ('captur-i',  '1.2-tce-87kw',  '1.2 TCe',     87, 120, 1197, 'petrol', 2013, 2019, 'H5Ft',  'FWD'),
    ('captur-i',  '1.2-tce-110kw', '1.2 TCe',    110, 150, 1197, 'petrol', 2013, 2019, 'H5Ft',  'FWD'),
    ('captur-i',  '1.5-dci-66kw',  '1.5 dCi',     66,  90, 1461, 'diesel', 2013, 2019, 'K9K',   'FWD'),
    ('captur-i',  '1.5-dci-81kw',  '1.5 dCi',     81, 110, 1461, 'diesel', 2013, 2019, 'K9K',   'FWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name, power_kw = excluded.power_kw, power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc, fuel = excluded.fuel,
    year_from = excluded.year_from, year_to = excluded.year_to,
    engine_code = excluded.engine_code, drive = excluded.drive, is_active = true;

-- ============================================================================
-- PEUGEOT — 13 models, ~80 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'peugeot')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('206',         '206',        1998, 2010, 'hatchback'),
    ('207',         '207',        2006, 2014, 'hatchback'),
    ('208-i',       '208 I',      2012, 2019, 'hatchback'),
    ('208-ii',      '208 II',     2019, 2024, 'hatchback'),
    ('307',         '307',        2001, 2008, 'hatchback'),
    ('308-i',       '308 I',      2007, 2013, 'hatchback'),
    ('308-ii',      '308 II',     2013, 2021, 'hatchback'),
    ('407',         '407',        2004, 2011, 'sedan'),
    ('508-i',       '508 I',      2010, 2018, 'sedan'),
    ('508-ii',      '508 II',     2018, 2024, 'sedan'),
    ('3008-i',      '3008 I',     2008, 2016, 'suv'),
    ('3008-ii',     '3008 II',    2016, 2024, 'suv'),
    ('5008-i',      '5008 I',     2009, 2017, 'mpv'),
    ('partner-ii',  'Partner II', 2008, 2018, 'mpv')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'peugeot'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- 206
    ('206',     '1.1-44kw',     '1.1',          44,  60, 1124, 'petrol', 1998, 2010, 'TU1',  'FWD'),
    ('206',     '1.4-55kw',     '1.4',          55,  75, 1360, 'petrol', 1998, 2010, 'TU3',  'FWD'),
    ('206',     '1.4-16v-65kw', '1.4 16V',      65,  88, 1360, 'petrol', 2003, 2010, 'TU3JP4','FWD'),
    ('206',     '1.6-16v-80kw', '1.6 16V',      80, 109, 1587, 'petrol', 1998, 2010, 'TU5JP4','FWD'),
    ('206',     '2.0-16v-100kw','2.0 16V',     100, 136, 1997, 'petrol', 1999, 2010, 'EW10J4','FWD'),
    ('206',     '2.0-16v-rs-130kw','2.0 16V RS',130,177,1997,'petrol', 2003, 2007, 'EW10J4S','FWD'),
    ('206',     '1.4-hdi-50kw', '1.4 HDi',      50,  68, 1398, 'diesel', 2002, 2010, 'DV4TD', 'FWD'),
    ('206',     '1.6-hdi-66kw', '1.6 HDi',      66,  90, 1560, 'diesel', 2005, 2010, 'DV6ATED4','FWD'),
    ('206',     '2.0-hdi-66kw', '2.0 HDi',      66,  90, 1997, 'diesel', 1999, 2010, 'DW10TD','FWD'),
    -- 207
    ('207',     '1.4-54kw',     '1.4',          54,  73, 1360, 'petrol', 2006, 2014, 'TU3JP', 'FWD'),
    ('207',     '1.4-16v-65kw', '1.4 16V',      65,  88, 1360, 'petrol', 2006, 2014, 'TU3JP4','FWD'),
    ('207',     '1.4-vti-70kw', '1.4 VTi',      70,  95, 1397, 'petrol', 2007, 2014, 'EP3',   'FWD'),
    ('207',     '1.6-vti-88kw', '1.6 VTi',      88, 120, 1598, 'petrol', 2007, 2014, 'EP6',   'FWD'),
    ('207',     '1.6-thp-110kw','1.6 THP',     110, 150, 1598, 'petrol', 2007, 2014, 'EP6CDT','FWD'),
    ('207',     '1.6-thp-rc-128kw','1.6 THP RC',128,175,1598,'petrol', 2007, 2014, 'EP6DT', 'FWD'),
    ('207',     '1.4-hdi-50kw', '1.4 HDi',      50,  68, 1398, 'diesel', 2006, 2014, 'DV4TD', 'FWD'),
    ('207',     '1.4-hdi-fap-50kw','1.4 HDi FAP',50,68, 1398, 'diesel', 2006, 2014, 'DV4TED4','FWD'),
    ('207',     '1.6-hdi-66kw', '1.6 HDi',      66,  90, 1560, 'diesel', 2006, 2014, 'DV6ATED4','FWD'),
    ('207',     '1.6-hdi-80kw', '1.6 HDi',      80, 110, 1560, 'diesel', 2006, 2014, 'DV6TED4','FWD'),
    -- 208 I
    ('208-i',   '1.0-vti-50kw', '1.0 VTi',      50,  68,  999, 'petrol', 2012, 2019, 'EB0',   'FWD'),
    ('208-i',   '1.2-vti-60kw', '1.2 VTi',      60,  82, 1199, 'petrol', 2012, 2019, 'EB2',   'FWD'),
    ('208-i',   '1.2-puretech-60kw','1.2 PureTech',60,82,1199,'petrol',2014, 2019, 'EB2',   'FWD'),
    ('208-i',   '1.2-puretech-81kw','1.2 PureTech',81,110,1199,'petrol',2014,2019, 'EB2DT', 'FWD'),
    ('208-i',   '1.4-vti-70kw', '1.4 VTi',      70,  95, 1397, 'petrol', 2012, 2014, 'EP3',   'FWD'),
    ('208-i',   '1.6-vti-88kw', '1.6 VTi',      88, 120, 1598, 'petrol', 2012, 2014, 'EP6',   'FWD'),
    ('208-i',   '1.6-thp-gti-153kw','1.6 THP GTi',153,208,1598,'petrol',2012,2019,'EP6CDT','FWD'),
    ('208-i',   '1.4-hdi-50kw', '1.4 HDi',      50,  68, 1398, 'diesel', 2012, 2014, 'DV4',   'FWD'),
    ('208-i',   '1.6-hdi-55kw', '1.6 HDi',      55,  75, 1560, 'diesel', 2012, 2019, 'DV6ETED','FWD'),
    ('208-i',   '1.6-bluehdi-73kw','1.6 BlueHDi',73,100,1560,'diesel', 2014, 2019, 'DV6FD',  'FWD'),
    ('208-i',   '1.6-bluehdi-88kw','1.6 BlueHDi',88,120,1560,'diesel', 2014, 2019, 'DV6FC',  'FWD'),
    -- 208 II
    ('208-ii',  '1.2-puretech-55kw','1.2 PureTech',55,75,1199,'petrol',2019,2024, 'EB2',   'FWD'),
    ('208-ii',  '1.2-puretech-74kw','1.2 PureTech',74,100,1199,'petrol',2019,2024,'EB2',   'FWD'),
    ('208-ii',  '1.2-puretech-96kw','1.2 PureTech',96,131,1199,'petrol',2019,2024,'EB2DT', 'FWD'),
    ('208-ii',  '1.5-bluehdi-74kw','1.5 BlueHDi',74,100,1499,'diesel', 2019, 2024, 'DV5RC', 'FWD'),
    -- 307
    ('307',     '1.4-65kw',     '1.4',          65,  88, 1360, 'petrol', 2001, 2008, 'TU3JP4','FWD'),
    ('307',     '1.4-16v-65kw', '1.4 16V',      65,  88, 1360, 'petrol', 2001, 2008, 'TU3JP4','FWD'),
    ('307',     '1.6-16v-80kw', '1.6 16V',      80, 109, 1587, 'petrol', 2001, 2008, 'TU5JP4','FWD'),
    ('307',     '2.0-16v-100kw','2.0 16V',     100, 136, 1997, 'petrol', 2001, 2008, 'EW10J4','FWD'),
    ('307',     '2.0-16v-rs-130kw','2.0 16V RS',130,177,1997,'petrol', 2003, 2008, 'EW10J4S','FWD'),
    ('307',     '1.4-hdi-50kw', '1.4 HDi',      50,  68, 1398, 'diesel', 2001, 2008, 'DV4TD', 'FWD'),
    ('307',     '1.6-hdi-66kw', '1.6 HDi',      66,  90, 1560, 'diesel', 2004, 2008, 'DV6ATED4','FWD'),
    ('307',     '1.6-hdi-80kw', '1.6 HDi',      80, 110, 1560, 'diesel', 2004, 2008, 'DV6TED4','FWD'),
    ('307',     '2.0-hdi-66kw', '2.0 HDi',      66,  90, 1997, 'diesel', 2001, 2008, 'DW10TD','FWD'),
    ('307',     '2.0-hdi-100kw','2.0 HDi',     100, 136, 1997, 'diesel', 2003, 2008, 'DW10BTED4','FWD'),
    -- 308 I
    ('308-i',   '1.4-vti-70kw', '1.4 VTi',      70,  95, 1397, 'petrol', 2007, 2013, 'EP3',   'FWD'),
    ('308-i',   '1.6-vti-88kw', '1.6 VTi',      88, 120, 1598, 'petrol', 2007, 2013, 'EP6',   'FWD'),
    ('308-i',   '1.6-thp-110kw','1.6 THP',     110, 150, 1598, 'petrol', 2007, 2013, 'EP6CDT','FWD'),
    ('308-i',   '1.6-thp-gti-147kw','1.6 THP GTi',147,200,1598,'petrol',2010,2013,'EP6CDTX','FWD'),
    ('308-i',   '1.6-hdi-66kw', '1.6 HDi',      66,  90, 1560, 'diesel', 2007, 2013, 'DV6ATED4','FWD'),
    ('308-i',   '1.6-hdi-80kw', '1.6 HDi',      80, 110, 1560, 'diesel', 2007, 2013, 'DV6TED4','FWD'),
    ('308-i',   '1.6-hdi-82kw', '1.6 e-HDi',    82, 112, 1560, 'diesel', 2010, 2013, 'DV6CTED','FWD'),
    ('308-i',   '2.0-hdi-100kw','2.0 HDi',     100, 136, 1997, 'diesel', 2007, 2013, 'DW10BTED4','FWD'),
    ('308-i',   '2.0-hdi-110kw','2.0 HDi',     110, 150, 1997, 'diesel', 2010, 2013, 'DW10C', 'FWD'),
    -- 308 II
    ('308-ii',  '1.2-vti-60kw', '1.2 VTi',      60,  82, 1199, 'petrol', 2013, 2018, 'EB2',   'FWD'),
    ('308-ii',  '1.2-puretech-81kw','1.2 PureTech',81,110,1199,'petrol',2014,2021, 'EB2DT', 'FWD'),
    ('308-ii',  '1.2-puretech-96kw','1.2 PureTech',96,130,1199,'petrol',2014,2021, 'EB2DT', 'FWD'),
    ('308-ii',  '1.6-thp-114kw','1.6 THP',     114, 155, 1598, 'petrol', 2013, 2017, 'EP6FDTM','FWD'),
    ('308-ii',  '1.6-thp-gti-200kw','1.6 THP GTi',200,272,1598,'petrol',2015,2021,'EP6FDTX','FWD'),
    ('308-ii',  '1.6-bluehdi-73kw','1.6 BlueHDi',73,100,1560,'diesel', 2014, 2021, 'DV6FD',  'FWD'),
    ('308-ii',  '1.6-bluehdi-88kw','1.6 BlueHDi',88,120,1560,'diesel', 2014, 2021, 'DV6FC',  'FWD'),
    ('308-ii',  '2.0-bluehdi-110kw','2.0 BlueHDi',110,150,1997,'diesel',2014,2021,'DW10FC',  'FWD'),
    ('308-ii',  '2.0-bluehdi-133kw','2.0 BlueHDi',133,180,1997,'diesel',2014,2021,'DW10FD',  'FWD'),
    -- 407
    ('407',     '1.8-16v-92kw', '1.8 16V',      92, 125, 1749, 'petrol', 2004, 2011, 'EW7A',  'FWD'),
    ('407',     '2.0-16v-103kw','2.0 16V',     103, 140, 1997, 'petrol', 2004, 2011, 'EW10A', 'FWD'),
    ('407',     '2.2-16v-120kw','2.2 16V',     120, 163, 2230, 'petrol', 2004, 2011, 'EW12J4','FWD'),
    ('407',     '3.0-v6-155kw', '3.0 V6 24V',  155, 211, 2946, 'petrol', 2005, 2011, 'ES9A',  'FWD'),
    ('407',     '1.6-hdi-80kw', '1.6 HDi',      80, 110, 1560, 'diesel', 2004, 2011, 'DV6TED4','FWD'),
    ('407',     '2.0-hdi-100kw','2.0 HDi',     100, 136, 1997, 'diesel', 2004, 2011, 'DW10BTED4','FWD'),
    ('407',     '2.2-hdi-125kw','2.2 HDi',     125, 170, 2179, 'diesel', 2006, 2011, 'DW12BTED4','FWD'),
    ('407',     '2.7-hdi-150kw','2.7 HDi V6',  150, 204, 2720, 'diesel', 2005, 2011, 'DT17',  'FWD'),
    ('407',     '3.0-hdi-177kw','3.0 HDi V6',  177, 241, 2993, 'diesel', 2009, 2011, 'DT20',  'FWD'),
    -- 508 I
    ('508-i',   '1.6-vti-88kw', '1.6 VTi',      88, 120, 1598, 'petrol', 2010, 2018, 'EP6C',  'FWD'),
    ('508-i',   '1.6-thp-115kw','1.6 THP',     115, 156, 1598, 'petrol', 2010, 2018, 'EP6CDT','FWD'),
    ('508-i',   '1.6-thp-121kw','1.6 THP',     121, 165, 1598, 'petrol', 2010, 2018, 'EP6FDT','FWD'),
    ('508-i',   '2.0-hdi-103kw','2.0 HDi',     103, 140, 1997, 'diesel', 2010, 2014, 'DW10C', 'FWD'),
    ('508-i',   '2.0-hdi-120kw','2.0 HDi',     120, 163, 1997, 'diesel', 2010, 2014, 'DW10F', 'FWD'),
    ('508-i',   '2.0-bluehdi-110kw','2.0 BlueHDi',110,150,1997,'diesel',2014,2018,'DW10FC',  'FWD'),
    ('508-i',   '2.0-bluehdi-133kw','2.0 BlueHDi',133,180,1997,'diesel',2014,2018,'DW10FD',  'FWD'),
    ('508-i',   '2.2-hdi-150kw','2.2 HDi',     150, 204, 2179, 'diesel', 2011, 2018, 'DW12C', 'FWD'),
    -- 3008 I
    ('3008-i',  '1.6-vti-88kw', '1.6 VTi',      88, 120, 1598, 'petrol', 2009, 2016, 'EP6C',  'FWD'),
    ('3008-i',  '1.6-thp-115kw','1.6 THP',     115, 156, 1598, 'petrol', 2009, 2016, 'EP6CDT','FWD'),
    ('3008-i',  '1.6-hdi-82kw', '1.6 e-HDi',    82, 112, 1560, 'diesel', 2009, 2016, 'DV6CTED','FWD'),
    ('3008-i',  '2.0-hdi-110kw','2.0 HDi',     110, 150, 1997, 'diesel', 2009, 2016, 'DW10F', 'FWD'),
    ('3008-i',  '2.0-hdi-120kw','2.0 HDi',     120, 163, 1997, 'diesel', 2009, 2016, 'DW10F', 'FWD'),
    ('3008-i',  '2.0-bluehdi-110kw','2.0 BlueHDi',110,150,1997,'diesel',2014,2016,'DW10FC',  'FWD'),
    -- 3008 II
    ('3008-ii', '1.2-puretech-96kw','1.2 PureTech',96,130,1199,'petrol',2016,2024,'EB2DT', 'FWD'),
    ('3008-ii', '1.6-puretech-133kw','1.6 PureTech',133,180,1598,'petrol',2016,2024,'EP6FDT','FWD'),
    ('3008-ii', '1.5-bluehdi-96kw','1.5 BlueHDi',96,130,1499,'diesel', 2018, 2024, 'DV5RC', 'FWD'),
    ('3008-ii', '2.0-bluehdi-110kw','2.0 BlueHDi',110,150,1997,'diesel',2016,2024,'DW10FC',  'FWD'),
    ('3008-ii', '2.0-bluehdi-133kw','2.0 BlueHDi',133,180,1997,'diesel',2016,2024,'DW10FD',  'FWD'),
    -- 5008 I
    ('5008-i',  '1.6-vti-88kw', '1.6 VTi',      88, 120, 1598, 'petrol', 2009, 2017, 'EP6C',  'FWD'),
    ('5008-i',  '1.6-thp-115kw','1.6 THP',     115, 156, 1598, 'petrol', 2009, 2017, 'EP6CDT','FWD'),
    ('5008-i',  '1.6-hdi-82kw', '1.6 e-HDi',    82, 112, 1560, 'diesel', 2009, 2017, 'DV6CTED','FWD'),
    ('5008-i',  '2.0-hdi-110kw','2.0 HDi',     110, 150, 1997, 'diesel', 2009, 2017, 'DW10F', 'FWD'),
    ('5008-i',  '2.0-hdi-120kw','2.0 HDi',     120, 163, 1997, 'diesel', 2009, 2017, 'DW10F', 'FWD'),
    -- Partner II
    ('partner-ii', '1.6-vti-66kw','1.6 VTi',    66,  90, 1598, 'petrol', 2008, 2018, 'TU5JP4','FWD'),
    ('partner-ii', '1.6-vti-88kw','1.6 VTi',    88, 120, 1598, 'petrol', 2008, 2018, 'EP6',   'FWD'),
    ('partner-ii', '1.6-hdi-55kw','1.6 HDi',    55,  75, 1560, 'diesel', 2008, 2018, 'DV6ETED','FWD'),
    ('partner-ii', '1.6-hdi-66kw','1.6 HDi',    66,  90, 1560, 'diesel', 2008, 2018, 'DV6ATED4','FWD'),
    ('partner-ii', '1.6-hdi-80kw','1.6 HDi',    80, 110, 1560, 'diesel', 2008, 2018, 'DV6TED4','FWD'),
    ('partner-ii', '1.6-bluehdi-73kw','1.6 BlueHDi',73,100,1560,'diesel',2014,2018,'DV6FD',  'FWD')
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
-- =============================================================================
-- Vehicle taxonomy MEGA seed — part 4/6
-- CITROËN + HYUNDAI (~25 models, ~150 engines)
-- Idempotent. Run AFTER supabase-vehicles-seed-mega-3.sql.
-- =============================================================================

-- ============================================================================
-- CITROËN — 12 models, ~75 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'citroen')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('c1-i',         'C1 I',          2005, 2014, 'hatchback'),
    ('c1-ii',        'C1 II',         2014, 2022, 'hatchback'),
    ('c3-i',         'C3 I',          2002, 2009, 'hatchback'),
    ('c3-ii',        'C3 II',         2009, 2016, 'hatchback'),
    ('c3-iii',       'C3 III',        2016, 2024, 'hatchback'),
    ('c4-i',         'C4 I',          2004, 2010, 'hatchback'),
    ('c4-ii',        'C4 II',         2010, 2018, 'hatchback'),
    ('c5-i',         'C5 I',          2001, 2008, 'sedan'),
    ('c5-ii',        'C5 II',         2008, 2017, 'sedan'),
    ('berlingo-ii',  'Berlingo II',   2008, 2018, 'mpv'),
    ('xsara',        'Xsara',         1997, 2006, 'hatchback'),
    ('xsara-picasso','Xsara Picasso', 1999, 2010, 'mpv'),
    ('c4-picasso-i', 'C4 Picasso I',  2006, 2013, 'mpv'),
    ('c4-picasso-ii','C4 Picasso II', 2013, 2018, 'mpv'),
    ('jumper-iii',   'Jumper III',    2006, 2014, 'van')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'citroen'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- C1 I
    ('c1-i',          '1.0-i-50kw',     '1.0 i',         50,  68,  998, 'petrol', 2005, 2014, '1KR-FE', 'FWD'),
    ('c1-i',          '1.4-hdi-40kw',   '1.4 HDi',       40,  54, 1398, 'diesel', 2005, 2010, 'DV4TD',  'FWD'),
    -- C1 II
    ('c1-ii',         '1.0-vti-51kw',   '1.0 VTi',       51,  68,  998, 'petrol', 2014, 2022, '1KR-FE', 'FWD'),
    ('c1-ii',         '1.2-vti-60kw',   '1.2 VTi PureTech',60,82,1199,'petrol', 2014, 2022, 'EB2',    'FWD'),
    -- C3 I
    ('c3-i',          '1.1-44kw',       '1.1',           44,  60, 1124, 'petrol', 2002, 2009, 'TU1JP',  'FWD'),
    ('c3-i',          '1.4-54kw',       '1.4',           54,  73, 1360, 'petrol', 2002, 2009, 'TU3JP',  'FWD'),
    ('c3-i',          '1.4-16v-65kw',   '1.4 16V',       65,  88, 1360, 'petrol', 2003, 2009, 'TU3JP4', 'FWD'),
    ('c3-i',          '1.6-16v-80kw',   '1.6 16V',       80, 109, 1587, 'petrol', 2002, 2009, 'TU5JP4', 'FWD'),
    ('c3-i',          '1.4-hdi-50kw',   '1.4 HDi',       50,  68, 1398, 'diesel', 2002, 2009, 'DV4TD',  'FWD'),
    ('c3-i',          '1.6-hdi-66kw',   '1.6 HDi',       66,  90, 1560, 'diesel', 2005, 2009, 'DV6ATED4','FWD'),
    -- C3 II
    ('c3-ii',         '1.1-44kw',       '1.1',           44,  60, 1124, 'petrol', 2009, 2016, 'TU1JP',  'FWD'),
    ('c3-ii',         '1.4-vti-70kw',   '1.4 VTi',       70,  95, 1397, 'petrol', 2009, 2016, 'EP3',    'FWD'),
    ('c3-ii',         '1.6-vti-88kw',   '1.6 VTi',       88, 120, 1598, 'petrol', 2009, 2016, 'EP6',    'FWD'),
    ('c3-ii',         '1.2-puretech-60kw','1.2 PureTech',60,82, 1199,'petrol', 2014, 2016, 'EB2',    'FWD'),
    ('c3-ii',         '1.4-hdi-50kw',   '1.4 HDi',       50,  68, 1398, 'diesel', 2009, 2014, 'DV4TD',  'FWD'),
    ('c3-ii',         '1.6-hdi-55kw',   '1.6 HDi',       55,  75, 1560, 'diesel', 2010, 2016, 'DV6ETED','FWD'),
    ('c3-ii',         '1.6-hdi-66kw',   '1.6 HDi',       66,  90, 1560, 'diesel', 2009, 2016, 'DV6ATED4','FWD'),
    -- C3 III
    ('c3-iii',        '1.0-puretech-50kw','1.0 PureTech',50, 68,  999,'petrol', 2016, 2024, 'EB0',    'FWD'),
    ('c3-iii',        '1.2-puretech-60kw','1.2 PureTech',60, 82, 1199,'petrol', 2016, 2024, 'EB2',    'FWD'),
    ('c3-iii',        '1.2-puretech-81kw','1.2 PureTech',81,110,1199,'petrol', 2016, 2024, 'EB2DT',  'FWD'),
    ('c3-iii',        '1.6-bluehdi-55kw','1.6 BlueHDi', 55,  75, 1560,'diesel', 2016, 2018, 'DV6FE',  'FWD'),
    ('c3-iii',        '1.6-bluehdi-73kw','1.6 BlueHDi', 73, 100, 1560,'diesel', 2016, 2018, 'DV6FD',  'FWD'),
    -- C4 I
    ('c4-i',          '1.4-16v-65kw',   '1.4 16V',       65,  88, 1360, 'petrol', 2004, 2010, 'TU3JP4', 'FWD'),
    ('c4-i',          '1.6-16v-80kw',   '1.6 16V',       80, 109, 1587, 'petrol', 2004, 2010, 'TU5JP4', 'FWD'),
    ('c4-i',          '1.6-vti-88kw',   '1.6 VTi',       88, 120, 1598, 'petrol', 2008, 2010, 'EP6',    'FWD'),
    ('c4-i',          '2.0-16v-100kw',  '2.0 16V',      100, 136, 1997, 'petrol', 2004, 2010, 'EW10A',  'FWD'),
    ('c4-i',          '1.6-hdi-66kw',   '1.6 HDi',       66,  90, 1560, 'diesel', 2004, 2010, 'DV6ATED4','FWD'),
    ('c4-i',          '1.6-hdi-80kw',   '1.6 HDi',       80, 110, 1560, 'diesel', 2004, 2010, 'DV6TED4','FWD'),
    ('c4-i',          '2.0-hdi-100kw',  '2.0 HDi',      100, 136, 1997, 'diesel', 2004, 2010, 'DW10BTED4','FWD'),
    -- C4 II
    ('c4-ii',         '1.4-vti-70kw',   '1.4 VTi',       70,  95, 1397, 'petrol', 2010, 2018, 'EP3',    'FWD'),
    ('c4-ii',         '1.6-vti-88kw',   '1.6 VTi',       88, 120, 1598, 'petrol', 2010, 2018, 'EP6',    'FWD'),
    ('c4-ii',         '1.6-thp-110kw',  '1.6 THP',      110, 150, 1598, 'petrol', 2010, 2018, 'EP6CDT', 'FWD'),
    ('c4-ii',         '1.2-puretech-81kw','1.2 PureTech',81,110,1199, 'petrol', 2014, 2018, 'EB2DT',  'FWD'),
    ('c4-ii',         '1.6-hdi-66kw',   '1.6 HDi',       66,  90, 1560, 'diesel', 2010, 2014, 'DV6ATED4','FWD'),
    ('c4-ii',         '1.6-hdi-82kw',   '1.6 e-HDi',     82, 112, 1560, 'diesel', 2010, 2018, 'DV6CTED','FWD'),
    ('c4-ii',         '2.0-hdi-110kw',  '2.0 HDi',      110, 150, 1997, 'diesel', 2010, 2018, 'DW10F',  'FWD'),
    ('c4-ii',         '1.6-bluehdi-88kw','1.6 BlueHDi', 88, 120, 1560, 'diesel', 2014, 2018, 'DV6FC',  'FWD'),
    -- C5 I
    ('c5-i',          '1.8-16v-85kw',   '1.8 16V',       85, 116, 1749, 'petrol', 2001, 2008, 'EW7A',   'FWD'),
    ('c5-i',          '2.0-16v-103kw',  '2.0 16V',      103, 140, 1997, 'petrol', 2001, 2008, 'EW10A',  'FWD'),
    ('c5-i',          '3.0-v6-152kw',   '3.0 V6 24V',   152, 207, 2946, 'petrol', 2001, 2008, 'ES9A',   'FWD'),
    ('c5-i',          '1.6-hdi-80kw',   '1.6 HDi',       80, 110, 1560, 'diesel', 2004, 2008, 'DV6TED4','FWD'),
    ('c5-i',          '2.0-hdi-79kw',   '2.0 HDi',       79, 109, 1997, 'diesel', 2001, 2008, 'DW10ATED','FWD'),
    ('c5-i',          '2.0-hdi-100kw',  '2.0 HDi',      100, 136, 1997, 'diesel', 2004, 2008, 'DW10BTED4','FWD'),
    ('c5-i',          '2.2-hdi-98kw',   '2.2 HDi',       98, 133, 2179, 'diesel', 2001, 2008, 'DW12TED4','FWD'),
    -- C5 II
    ('c5-ii',         '1.6-vti-88kw',   '1.6 VTi',       88, 120, 1598, 'petrol', 2008, 2017, 'EP6',    'FWD'),
    ('c5-ii',         '1.6-thp-115kw',  '1.6 THP',      115, 156, 1598, 'petrol', 2008, 2017, 'EP6CDT', 'FWD'),
    ('c5-ii',         '2.0-16v-105kw',  '2.0 16V',      105, 143, 1997, 'petrol', 2008, 2017, 'EW10A',  'FWD'),
    ('c5-ii',         '3.0-v6-155kw',   '3.0 V6 24V',   155, 211, 2946, 'petrol', 2008, 2017, 'ES9A',   'FWD'),
    ('c5-ii',         '1.6-hdi-82kw',   '1.6 e-HDi',     82, 112, 1560, 'diesel', 2010, 2017, 'DV6CTED','FWD'),
    ('c5-ii',         '2.0-hdi-103kw',  '2.0 HDi',      103, 140, 1997, 'diesel', 2008, 2017, 'DW10C',  'FWD'),
    ('c5-ii',         '2.0-hdi-120kw',  '2.0 HDi',      120, 163, 1997, 'diesel', 2010, 2017, 'DW10F',  'FWD'),
    ('c5-ii',         '2.2-hdi-125kw',  '2.2 HDi',      125, 173, 2179, 'diesel', 2008, 2017, 'DW12C',  'FWD'),
    ('c5-ii',         '2.7-hdi-150kw',  '2.7 HDi V6',   150, 204, 2720, 'diesel', 2008, 2012, 'DT17',   'FWD'),
    ('c5-ii',         '3.0-hdi-177kw',  '3.0 HDi V6',   177, 240, 2993, 'diesel', 2009, 2017, 'DT20',   'FWD'),
    -- Berlingo II
    ('berlingo-ii',   '1.6-vti-66kw',   '1.6 VTi',       66,  90, 1598, 'petrol', 2008, 2018, 'TU5JP4', 'FWD'),
    ('berlingo-ii',   '1.6-vti-88kw',   '1.6 VTi',       88, 120, 1598, 'petrol', 2008, 2018, 'EP6',    'FWD'),
    ('berlingo-ii',   '1.6-hdi-55kw',   '1.6 HDi',       55,  75, 1560, 'diesel', 2008, 2018, 'DV6ETED','FWD'),
    ('berlingo-ii',   '1.6-hdi-66kw',   '1.6 HDi',       66,  90, 1560, 'diesel', 2008, 2018, 'DV6ATED4','FWD'),
    ('berlingo-ii',   '1.6-hdi-82kw',   '1.6 HDi',       82, 112, 1560, 'diesel', 2008, 2018, 'DV6CTED','FWD'),
    -- Xsara
    ('xsara',         '1.4-55kw',       '1.4',           55,  75, 1360, 'petrol', 1997, 2006, 'TU3',    'FWD'),
    ('xsara',         '1.6-65kw',       '1.6',           65,  88, 1587, 'petrol', 1997, 2006, 'TU5',    'FWD'),
    ('xsara',         '1.6-16v-80kw',   '1.6 16V',       80, 109, 1587, 'petrol', 1999, 2006, 'TU5JP4', 'FWD'),
    ('xsara',         '1.8-16v-81kw',   '1.8 16V',       81, 110, 1761, 'petrol', 1997, 2002, 'XU7',    'FWD'),
    ('xsara',         '2.0-16v-100kw',  '2.0 16V',      100, 136, 1997, 'petrol', 1999, 2006, 'EW10J4', 'FWD'),
    ('xsara',         '1.4-hdi-50kw',   '1.4 HDi',       50,  68, 1398, 'diesel', 2002, 2006, 'DV4TD',  'FWD'),
    ('xsara',         '1.9-d-51kw',     '1.9 D',         51,  70, 1868, 'diesel', 1997, 2002, 'XUD9',   'FWD'),
    ('xsara',         '2.0-hdi-66kw',   '2.0 HDi',       66,  90, 1997, 'diesel', 1999, 2006, 'DW10TD', 'FWD'),
    ('xsara',         '2.0-hdi-80kw',   '2.0 HDi',       80, 109, 1997, 'diesel', 2001, 2006, 'DW10ATED','FWD'),
    -- Xsara Picasso
    ('xsara-picasso', '1.6-65kw',       '1.6',           65,  88, 1587, 'petrol', 1999, 2010, 'TU5',    'FWD'),
    ('xsara-picasso', '1.6-16v-80kw',   '1.6 16V',       80, 109, 1587, 'petrol', 2002, 2010, 'TU5JP4', 'FWD'),
    ('xsara-picasso', '1.8-16v-86kw',   '1.8 16V',       86, 117, 1761, 'petrol', 2000, 2005, 'EW7J4',  'FWD'),
    ('xsara-picasso', '2.0-16v-100kw',  '2.0 16V',      100, 136, 1997, 'petrol', 2000, 2010, 'EW10J4', 'FWD'),
    ('xsara-picasso', '1.6-hdi-66kw',   '1.6 HDi',       66,  90, 1560, 'diesel', 2004, 2010, 'DV6ATED4','FWD'),
    ('xsara-picasso', '1.6-hdi-80kw',   '1.6 HDi',       80, 110, 1560, 'diesel', 2004, 2010, 'DV6TED4','FWD'),
    ('xsara-picasso', '2.0-hdi-66kw',   '2.0 HDi',       66,  90, 1997, 'diesel', 1999, 2010, 'DW10TD', 'FWD'),
    -- C4 Picasso I
    ('c4-picasso-i',  '1.6-vti-88kw',   '1.6 VTi',       88, 120, 1598, 'petrol', 2006, 2013, 'EP6',    'FWD'),
    ('c4-picasso-i',  '1.6-thp-110kw',  '1.6 THP',      110, 150, 1598, 'petrol', 2008, 2013, 'EP6CDT', 'FWD'),
    ('c4-picasso-i',  '2.0-16v-105kw',  '2.0 16V',      105, 143, 1997, 'petrol', 2006, 2013, 'EW10A',  'FWD'),
    ('c4-picasso-i',  '1.6-hdi-80kw',   '1.6 HDi',       80, 110, 1560, 'diesel', 2006, 2013, 'DV6TED4','FWD'),
    ('c4-picasso-i',  '1.6-hdi-82kw',   '1.6 e-HDi',     82, 112, 1560, 'diesel', 2010, 2013, 'DV6CTED','FWD'),
    ('c4-picasso-i',  '2.0-hdi-100kw',  '2.0 HDi',      100, 136, 1997, 'diesel', 2006, 2013, 'DW10BTED4','FWD'),
    ('c4-picasso-i',  '2.0-hdi-110kw',  '2.0 HDi',      110, 150, 1997, 'diesel', 2009, 2013, 'DW10F',  'FWD'),
    -- C4 Picasso II
    ('c4-picasso-ii', '1.2-puretech-96kw','1.2 PureTech',96,130,1199, 'petrol', 2013, 2018, 'EB2DT',  'FWD'),
    ('c4-picasso-ii', '1.6-thp-114kw',  '1.6 THP',      114, 155, 1598, 'petrol', 2013, 2018, 'EP6FDTM','FWD'),
    ('c4-picasso-ii', '1.6-bluehdi-73kw','1.6 BlueHDi', 73, 100, 1560, 'diesel', 2014, 2018, 'DV6FD',  'FWD'),
    ('c4-picasso-ii', '1.6-bluehdi-88kw','1.6 BlueHDi', 88, 120, 1560, 'diesel', 2014, 2018, 'DV6FC',  'FWD'),
    ('c4-picasso-ii', '2.0-bluehdi-110kw','2.0 BlueHDi',110,150,1997,'diesel', 2014, 2018, 'DW10FC',  'FWD'),
    ('c4-picasso-ii', '2.0-bluehdi-133kw','2.0 BlueHDi',133,180,1997,'diesel', 2014, 2018, 'DW10FD',  'FWD'),
    -- Jumper III
    ('jumper-iii',    '2.2-hdi-74kw',   '2.2 HDi',       74, 100, 2198, 'diesel', 2006, 2014, 'DW12B',  'FWD'),
    ('jumper-iii',    '2.2-hdi-88kw',   '2.2 HDi',       88, 120, 2198, 'diesel', 2006, 2014, 'DW12B',  'FWD'),
    ('jumper-iii',    '2.2-hdi-110kw',  '2.2 HDi',      110, 150, 2198, 'diesel', 2006, 2014, 'DW12C',  'FWD'),
    ('jumper-iii',    '3.0-hdi-130kw',  '3.0 HDi',      130, 177, 2999, 'diesel', 2006, 2014, 'F1CE',   'FWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name, power_kw = excluded.power_kw, power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc, fuel = excluded.fuel,
    year_from = excluded.year_from, year_to = excluded.year_to,
    engine_code = excluded.engine_code, drive = excluded.drive, is_active = true;

-- ============================================================================
-- HYUNDAI — 13 models, ~85 engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'hyundai')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('accent-iii',     'Accent III',     2005, 2010, 'sedan'),
    ('accent-iv',      'Accent IV',      2010, 2017, 'sedan'),
    ('i10-i',          'i10 I',          2007, 2013, 'hatchback'),
    ('i10-ii',         'i10 II',         2013, 2019, 'hatchback'),
    ('i20-i',          'i20 I',          2008, 2014, 'hatchback'),
    ('i20-ii',         'i20 II',         2014, 2020, 'hatchback'),
    ('i30-i',          'i30 I',          2007, 2012, 'hatchback'),
    ('i30-ii',         'i30 II',         2011, 2017, 'hatchback'),
    ('i30-iii',        'i30 III',        2016, 2024, 'hatchback'),
    ('i40',            'i40',            2011, 2019, 'sedan'),
    ('elantra-iv',     'Elantra IV',     2006, 2010, 'sedan'),
    ('elantra-v',      'Elantra V',      2010, 2016, 'sedan'),
    ('sonata-vi',      'Sonata VI',      2009, 2014, 'sedan'),
    ('tucson-i',       'Tucson I',       2004, 2010, 'suv'),
    ('tucson-ii-ix35', 'ix35 / Tucson II',2009, 2015, 'suv'),
    ('tucson-iii',     'Tucson III',     2015, 2021, 'suv'),
    ('santa-fe-i',     'Santa Fe I',     2000, 2006, 'suv'),
    ('santa-fe-ii',    'Santa Fe II',    2006, 2012, 'suv'),
    ('santa-fe-iii',   'Santa Fe III',   2012, 2018, 'suv')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name, year_from = excluded.year_from, year_to = excluded.year_to,
    body_type = excluded.body_type, is_active = true;

with mdl as (
    select vm.id, vm.slug from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'hyundai'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Accent III
    ('accent-iii',     '1.4-71kw',     '1.4 16V',      71,  97, 1399, 'petrol', 2005, 2010, 'G4EE', 'FWD'),
    ('accent-iii',     '1.6-82kw',     '1.6 16V',      82, 112, 1599, 'petrol', 2005, 2010, 'G4ED', 'FWD'),
    ('accent-iii',     '1.5-crdi-81kw','1.5 CRDi VGT', 81, 110, 1493, 'diesel', 2005, 2010, 'D3EA', 'FWD'),
    -- Accent IV
    ('accent-iv',      '1.4-79kw',     '1.4 16V',      79, 108, 1396, 'petrol', 2010, 2017, 'G4FA', 'FWD'),
    ('accent-iv',      '1.6-91kw',     '1.6 16V',      91, 124, 1591, 'petrol', 2010, 2017, 'G4FC', 'FWD'),
    ('accent-iv',      '1.6-crdi-94kw','1.6 CRDi',     94, 128, 1582, 'diesel', 2010, 2017, 'D4FB', 'FWD'),
    -- i10 I
    ('i10-i',          '1.0-49kw',     '1.0',          49,  67,  998, 'petrol', 2008, 2013, 'G4HG', 'FWD'),
    ('i10-i',          '1.1-49kw',     '1.1',          49,  67, 1086, 'petrol', 2008, 2013, 'G4HG', 'FWD'),
    ('i10-i',          '1.2-57kw',     '1.2',          57,  78, 1248, 'petrol', 2008, 2013, 'G4LA', 'FWD'),
    ('i10-i',          '1.1-crdi-55kw','1.1 CRDi',     55,  75, 1120, 'diesel', 2008, 2013, 'D3FA', 'FWD'),
    -- i10 II
    ('i10-ii',         '1.0-49kw',     '1.0',          49,  66,  998, 'petrol', 2013, 2019, 'G4HG', 'FWD'),
    ('i10-ii',         '1.0-50kw',     '1.0 MPi',      50,  68,  998, 'petrol', 2017, 2019, 'G3LA', 'FWD'),
    ('i10-ii',         '1.2-65kw',     '1.2 MPi',      65,  87, 1248, 'petrol', 2013, 2019, 'G4LA', 'FWD'),
    -- i20 I
    ('i20-i',          '1.2-57kw',     '1.2',          57,  78, 1248, 'petrol', 2008, 2014, 'G4LA', 'FWD'),
    ('i20-i',          '1.4-74kw',     '1.4',          74, 100, 1396, 'petrol', 2008, 2014, 'G4FA', 'FWD'),
    ('i20-i',          '1.6-91kw',     '1.6',          91, 124, 1591, 'petrol', 2008, 2014, 'G4FC', 'FWD'),
    ('i20-i',          '1.1-crdi-55kw','1.1 CRDi',     55,  75, 1120, 'diesel', 2009, 2014, 'D3FA', 'FWD'),
    ('i20-i',          '1.4-crdi-66kw','1.4 CRDi',     66,  90, 1396, 'diesel', 2008, 2014, 'D4FC', 'FWD'),
    ('i20-i',          '1.6-crdi-85kw','1.6 CRDi',     85, 116, 1582, 'diesel', 2008, 2014, 'D4FB', 'FWD'),
    -- i20 II
    ('i20-ii',         '1.2-55kw',     '1.2',          55,  75, 1248, 'petrol', 2014, 2020, 'G4LA', 'FWD'),
    ('i20-ii',         '1.4-74kw',     '1.4 16V',      74, 100, 1396, 'petrol', 2014, 2020, 'G4LC', 'FWD'),
    ('i20-ii',         '1.0-tgdi-74kw','1.0 T-GDi',    74, 100,  998, 'petrol', 2015, 2020, 'G3LC', 'FWD'),
    ('i20-ii',         '1.0-tgdi-88kw','1.0 T-GDi',    88, 120,  998, 'petrol', 2015, 2020, 'G3LE', 'FWD'),
    ('i20-ii',         '1.4-crdi-66kw','1.4 CRDi',     66,  90, 1396, 'diesel', 2014, 2020, 'D4FC', 'FWD'),
    -- i30 I
    ('i30-i',          '1.4-80kw',     '1.4 16V',      80, 109, 1396, 'petrol', 2007, 2012, 'G4FA', 'FWD'),
    ('i30-i',          '1.6-93kw',     '1.6 16V',      93, 126, 1591, 'petrol', 2007, 2012, 'G4FC', 'FWD'),
    ('i30-i',          '2.0-105kw',    '2.0 16V',     105, 143, 1975, 'petrol', 2007, 2012, 'G4GC', 'FWD'),
    ('i30-i',          '1.4-crdi-66kw','1.4 CRDi',     66,  90, 1396, 'diesel', 2007, 2012, 'D4FC', 'FWD'),
    ('i30-i',          '1.6-crdi-66kw','1.6 CRDi',     66,  90, 1582, 'diesel', 2007, 2012, 'D4FB', 'FWD'),
    ('i30-i',          '1.6-crdi-85kw','1.6 CRDi',     85, 116, 1582, 'diesel', 2007, 2012, 'D4FB', 'FWD'),
    ('i30-i',          '2.0-crdi-103kw','2.0 CRDi',   103, 140, 1991, 'diesel', 2007, 2012, 'D4EA', 'FWD'),
    -- i30 II
    ('i30-ii',         '1.4-73kw',     '1.4 16V',      73,  99, 1396, 'petrol', 2011, 2017, 'G4FA', 'FWD'),
    ('i30-ii',         '1.6-gdi-99kw', '1.6 GDi',      99, 135, 1591, 'petrol', 2011, 2017, 'G4FD', 'FWD'),
    ('i30-ii',         '1.6-tgdi-137kw','1.6 T-GDi',  137, 186, 1591, 'petrol', 2014, 2017, 'G4FJ', 'FWD'),
    ('i30-ii',         '1.4-crdi-66kw','1.4 CRDi',     66,  90, 1396, 'diesel', 2011, 2017, 'D4FC', 'FWD'),
    ('i30-ii',         '1.6-crdi-81kw','1.6 CRDi',     81, 110, 1582, 'diesel', 2011, 2017, 'D4FB', 'FWD'),
    ('i30-ii',         '1.6-crdi-94kw','1.6 CRDi',     94, 128, 1582, 'diesel', 2011, 2017, 'D4FB', 'FWD'),
    -- i30 III
    ('i30-iii',        '1.0-tgdi-88kw','1.0 T-GDi',    88, 120,  998, 'petrol', 2017, 2024, 'G3LC', 'FWD'),
    ('i30-iii',        '1.4-tgdi-103kw','1.4 T-GDi',  103, 140, 1353, 'petrol', 2017, 2020, 'G4LD', 'FWD'),
    ('i30-iii',        '1.5-tgdi-117kw','1.5 T-GDi',  117, 159, 1482, 'petrol', 2020, 2024, 'G4FT', 'FWD'),
    ('i30-iii',        '2.0-tgdi-n-184kw','2.0 T-GDi N',184,250,1998,'petrol', 2017, 2024, 'G4KH', 'FWD'),
    ('i30-iii',        '2.0-tgdi-n-202kw','2.0 T-GDi N',202,275,1998,'petrol', 2017, 2024, 'G4KH', 'FWD'),
    ('i30-iii',        '1.6-crdi-70kw','1.6 CRDi',     70,  95, 1598, 'diesel', 2017, 2020, 'D4FE', 'FWD'),
    ('i30-iii',        '1.6-crdi-85kw','1.6 CRDi',     85, 116, 1598, 'diesel', 2017, 2020, 'D4FE', 'FWD'),
    ('i30-iii',        '1.6-crdi-100kw','1.6 CRDi',   100, 136, 1598, 'diesel', 2017, 2020, 'D4FE', 'FWD'),
    -- i40
    ('i40',            '1.6-99kw',     '1.6 GDi',      99, 135, 1591, 'petrol', 2011, 2019, 'G4FD', 'FWD'),
    ('i40',            '2.0-gdi-130kw','2.0 GDi',     130, 177, 1999, 'petrol', 2011, 2019, 'G4NC', 'FWD'),
    ('i40',            '1.7-crdi-85kw','1.7 CRDi',     85, 116, 1685, 'diesel', 2011, 2019, 'D4FD', 'FWD'),
    ('i40',            '1.7-crdi-100kw','1.7 CRDi',  100, 136, 1685, 'diesel', 2011, 2019, 'D4FD', 'FWD'),
    -- Elantra IV
    ('elantra-iv',     '1.6-90kw',     '1.6 16V',      90, 122, 1599, 'petrol', 2006, 2010, 'G4ED', 'FWD'),
    ('elantra-iv',     '2.0-105kw',    '2.0 16V',     105, 143, 1975, 'petrol', 2006, 2010, 'G4GC', 'FWD'),
    ('elantra-iv',     '1.6-crdi-85kw','1.6 CRDi',     85, 116, 1582, 'diesel', 2006, 2010, 'D4FB', 'FWD'),
    -- Elantra V
    ('elantra-v',      '1.6-mpi-95kw', '1.6 MPi',      95, 129, 1591, 'petrol', 2010, 2016, 'G4FC', 'FWD'),
    ('elantra-v',      '1.8-mpi-110kw','1.8 MPi',     110, 150, 1797, 'petrol', 2010, 2016, 'G4NB', 'FWD'),
    ('elantra-v',      '1.6-crdi-94kw','1.6 CRDi',     94, 128, 1582, 'diesel', 2010, 2016, 'D4FB', 'FWD'),
    -- Sonata VI
    ('sonata-vi',      '2.0-110kw',    '2.0 16V',     110, 150, 1998, 'petrol', 2009, 2014, 'G4KD', 'FWD'),
    ('sonata-vi',      '2.4-148kw',    '2.4 GDi',     148, 201, 2359, 'petrol', 2009, 2014, 'G4KJ', 'FWD'),
    -- Tucson I
    ('tucson-i',       '2.0-104kw',    '2.0 16V',     104, 142, 1975, 'petrol', 2004, 2010, 'G4GC', 'AWD'),
    ('tucson-i',       '2.7-v6-129kw', '2.7 V6 24V',  129, 175, 2656, 'petrol', 2004, 2010, 'G6BA', 'AWD'),
    ('tucson-i',       '2.0-crdi-83kw','2.0 CRDi',     83, 113, 1991, 'diesel', 2004, 2010, 'D4EA', 'AWD'),
    ('tucson-i',       '2.0-crdi-103kw','2.0 CRDi',  103, 140, 1991, 'diesel', 2006, 2010, 'D4EA', 'AWD'),
    -- Tucson II / ix35
    ('tucson-ii-ix35', '1.6-gdi-99kw', '1.6 GDi',      99, 135, 1591, 'petrol', 2010, 2015, 'G4FD', 'FWD'),
    ('tucson-ii-ix35', '2.0-cvvt-120kw','2.0 16V CVVT',120,163,1998,'petrol', 2010, 2015, 'G4KD', 'AWD'),
    ('tucson-ii-ix35', '1.7-crdi-85kw','1.7 CRDi',     85, 116, 1685, 'diesel', 2010, 2015, 'D4FD', 'FWD'),
    ('tucson-ii-ix35', '2.0-crdi-100kw','2.0 CRDi',  100, 136, 1995, 'diesel', 2010, 2015, 'D4HA', 'AWD'),
    ('tucson-ii-ix35', '2.0-crdi-135kw','2.0 CRDi',  135, 184, 1995, 'diesel', 2010, 2015, 'D4HA', 'AWD'),
    -- Tucson III
    ('tucson-iii',     '1.6-gdi-97kw', '1.6 GDi',      97, 132, 1591, 'petrol', 2015, 2021, 'G4FD', 'FWD'),
    ('tucson-iii',     '1.6-tgdi-130kw','1.6 T-GDi', 130, 177, 1591, 'petrol', 2015, 2021, 'G4FJ', 'AWD'),
    ('tucson-iii',     '2.0-cvvt-114kw','2.0 16V',   114, 155, 1999, 'petrol', 2015, 2021, 'G4NA', 'AWD'),
    ('tucson-iii',     '1.6-crdi-85kw','1.6 CRDi',     85, 116, 1598, 'diesel', 2018, 2021, 'D4FE', 'FWD'),
    ('tucson-iii',     '1.6-crdi-100kw','1.6 CRDi', 100, 136, 1598, 'diesel', 2018, 2021, 'D4FE', 'AWD'),
    ('tucson-iii',     '1.7-crdi-85kw','1.7 CRDi',     85, 116, 1685, 'diesel', 2015, 2018, 'D4FD', 'FWD'),
    ('tucson-iii',     '2.0-crdi-100kw','2.0 CRDi', 100, 136, 1995, 'diesel', 2015, 2021, 'D4HA', 'AWD'),
    ('tucson-iii',     '2.0-crdi-136kw','2.0 CRDi', 136, 185, 1995, 'diesel', 2015, 2021, 'D4HA', 'AWD'),
    -- Santa Fe I
    ('santa-fe-i',     '2.0-95kw',     '2.0 16V',      95, 129, 1997, 'petrol', 2000, 2006, 'G4JP', 'AWD'),
    ('santa-fe-i',     '2.4-110kw',    '2.4 16V',     110, 150, 2351, 'petrol', 2000, 2006, 'G4JS', 'AWD'),
    ('santa-fe-i',     '2.7-v6-127kw', '2.7 V6 24V',  127, 173, 2656, 'petrol', 2000, 2006, 'G6BA', 'AWD'),
    ('santa-fe-i',     '2.0-crdi-83kw','2.0 CRDi',     83, 113, 1991, 'diesel', 2001, 2006, 'D4EA', 'AWD'),
    ('santa-fe-i',     '2.0-crdi-92kw','2.0 CRDi',     92, 125, 1991, 'diesel', 2003, 2006, 'D4EA', 'AWD'),
    -- Santa Fe II
    ('santa-fe-ii',    '2.7-v6-138kw', '2.7 V6 24V',  138, 188, 2656, 'petrol', 2006, 2012, 'G6EA', 'AWD'),
    ('santa-fe-ii',    '2.2-crdi-114kw','2.2 CRDi', 114, 155, 2188, 'diesel', 2006, 2012, 'D4EB', 'AWD'),
    ('santa-fe-ii',    '2.2-crdi-145kw','2.2 CRDi', 145, 197, 2199, 'diesel', 2009, 2012, 'D4HB', 'AWD'),
    -- Santa Fe III
    ('santa-fe-iii',   '2.4-gdi-138kw','2.4 GDi',     138, 188, 2359, 'petrol', 2012, 2018, 'G4KE', 'AWD'),
    ('santa-fe-iii',   '3.3-v6-199kw', '3.3 V6 24V',  199, 270, 3342, 'petrol', 2012, 2018, 'G6DH', 'AWD'),
    ('santa-fe-iii',   '2.0-crdi-110kw','2.0 CRDi', 110, 150, 1995, 'diesel', 2012, 2018, 'D4HA', 'AWD'),
    ('santa-fe-iii',   '2.2-crdi-145kw','2.2 CRDi', 145, 197, 2199, 'diesel', 2012, 2018, 'D4HB', 'AWD'),
    ('santa-fe-iii',   '2.2-crdi-147kw','2.2 CRDi', 147, 200, 2199, 'diesel', 2015, 2018, 'D4HB', 'AWD')
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
