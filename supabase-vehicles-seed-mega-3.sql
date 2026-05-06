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
