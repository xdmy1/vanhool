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
