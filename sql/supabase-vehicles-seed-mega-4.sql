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
