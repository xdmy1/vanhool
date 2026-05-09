-- =============================================================================
-- Vehicle taxonomy seed — EXPANDED
-- Honda (complete), BMW, Volkswagen, Toyota, Mercedes-Benz.
-- Plus 5 universal demo products linked to every engine type.
--
-- Data is hand-crafted from public TecDoc-style knowledge (Wikipedia, vehicle
-- manuals, ETK catalogues). NOT scraped from fixbox.md.
--
-- Idempotent. Run AFTER supabase-vehicles-seed.sql.
-- =============================================================================

-- ============================================================================
-- 0. Five UNIVERSAL demo products (fit any car)
-- ============================================================================
do $$
declare
    cat_engine    uuid;
    cat_filtre    uuid;
    cat_body      uuid;
    cat_electro   uuid;
    cat_lighting  uuid;
begin
    select id into cat_engine    from public.categories where slug = 'engine';
    select id into cat_filtre    from public.categories where slug = 'filtre';
    select id into cat_body      from public.categories where slug = 'body';
    select id into cat_electro   from public.categories where slug = 'electro';
    select id into cat_lighting  from public.categories where slug = 'lighting';

    insert into public.products
        (slug, part_code, brand, price, stock_quantity, category_id,
         name_en, name_ro, name_ru,
         description_en, description_ro, description_ru,
         is_active, is_featured, warranty_months)
    values
        ('castrol-edge-5w30-5l',
         'EDGE-5W30-5L', 'CASTROL', 580.00, 35, cat_engine,
         'Engine Oil Castrol EDGE 5W-30 LL 5L',
         'Ulei motor Castrol EDGE 5W-30 LL 5L',
         'Моторное масло Castrol EDGE 5W-30 LL 5L',
         'Full synthetic engine oil. Universal — fits most petrol/diesel engines.',
         'Ulei motor full synthetic. Universal — pentru benzină/diesel.',
         'Полностью синтетическое масло. Универсальное.',
         true, true, 0),

        ('bosch-aerotwin-ar20u',
         '3 397 008 538', 'BOSCH', 215.00, 60, cat_body,
         'Wiper Blades Bosch Aerotwin AR20U',
         'Lamele ștergător Bosch Aerotwin AR20U',
         'Щётки стеклоочистителя Bosch Aerotwin AR20U',
         'Universal flat-blade wiper, 500/475 mm. Hook arm fitting.',
         'Lamelă universală flat-blade, 500/475 mm. Prindere cârlig.',
         'Универсальная плоская щётка, 500/475 мм.',
         true, true, 12),

        ('mann-cu-26-006-cabin-filter',
         'CU 26 006', 'MANN-FILTER', 95.00, 30, cat_filtre,
         'Cabin Air Filter MANN CU 26 006',
         'Filtru polen MANN CU 26 006',
         'Салонный фильтр MANN CU 26 006',
         'Activated carbon cabin filter. Universal slot 260×130×30 mm.',
         'Filtru polen cu cărbune activ. Slot universal 260×130×30 mm.',
         'Угольный салонный фильтр, 260×130×30 мм.',
         true, false, 12),

        ('varta-blue-d24',
         '560 408 054', 'VARTA', 985.00, 14, cat_electro,
         'Battery Varta Blue Dynamic D24 60Ah',
         'Acumulator Varta Blue Dynamic D24 60Ah',
         'Аккумулятор Varta Blue Dynamic D24 60Ah',
         'Lead-acid battery 12V 60Ah 540A — fits most european cars.',
         'Acumulator 12V 60Ah 540A — pentru majoritatea mașinilor europene.',
         'Свинцово-кислотный аккумулятор 12В 60Ач 540А.',
         true, true, 24),

        ('osram-h7-night-breaker',
         '64210NL-HCB', 'OSRAM', 165.00, 80, cat_lighting,
         'Headlight Bulb Osram H7 Night Breaker Laser 55W',
         'Bec far Osram H7 Night Breaker Laser 55W',
         'Лампа Osram H7 Night Breaker Laser 55Вт',
         'Halogen H7 bulb, +150% brightness. Set of 2.',
         'Bec halogen H7, +150% luminozitate. Set 2 buc.',
         'Галогенная лампа H7, +150% яркости. Комплект 2 шт.',
         true, false, 12)
    on conflict (slug) do update
    set part_code = excluded.part_code,
        brand = excluded.brand,
        price = excluded.price,
        stock_quantity = excluded.stock_quantity,
        category_id = excluded.category_id,
        name_en = excluded.name_en,
        name_ro = excluded.name_ro,
        name_ru = excluded.name_ru,
        description_en = excluded.description_en,
        description_ro = excluded.description_ro,
        description_ru = excluded.description_ru,
        is_active = true,
        is_featured = excluded.is_featured;
end $$;

-- ============================================================================
-- 1. HONDA — extended (10 generations beyond Accord II)
-- ============================================================================
-- Honda models already seeded. Add engines for those + new generations.

with mk as (select id from public.vehicle_makes where slug = 'honda')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('accord-vi',  'Accord VI',   1998, 2002, 'sedan'),
    ('accord-vii', 'Accord VII',  2002, 2008, 'sedan'),
    ('accord-viii','Accord VIII', 2008, 2015, 'sedan'),
    ('civic-viii', 'Civic VIII',  2005, 2012, 'hatchback'),
    ('civic-ix',   'Civic IX',    2011, 2017, 'hatchback'),
    ('cr-v-iii',   'CR-V III',    2006, 2012, 'suv'),
    ('cr-v-iv',    'CR-V IV',     2012, 2018, 'suv'),
    ('jazz-ii',    'Jazz II',     2008, 2015, 'hatchback'),
    ('hr-v-ii',    'HR-V II',     2015, 2021, 'suv'),
    ('insight-ii', 'Insight II',  2009, 2014, 'hatchback')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    body_type = excluded.body_type,
    is_active = true;

-- Honda engines for ALL models (uses model slug to join)
with mdl as (
    select vm.id, vm.slug
    from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'honda'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Accord III (existing 'accord-iii' model in base seed)
    ('accord-iii', '2.0i-16v-100kw',   '2.0i 16V',     100, 137, 1958, 'petrol', 1989, 1993, 'B20A6', 'FWD'),
    ('accord-iii', '2.0-16v-110kw',    '2.0 16V',      110, 150, 1997, 'petrol', 1989, 1993, 'B20A',  'FWD'),
    ('accord-iii', '2.2-16v-110kw',    '2.2 16V',      110, 150, 2156, 'petrol', 1990, 1993, 'F22A',  'FWD'),
    -- Accord IV
    ('accord-iv',  '1.8-i-95kw',       '1.8 i',         95, 130, 1849, 'petrol', 1993, 1998, 'F18A3', 'FWD'),
    ('accord-iv',  '2.0-i-100kw',      '2.0 i',        100, 136, 1997, 'petrol', 1993, 1998, 'F20A4', 'FWD'),
    ('accord-iv',  '2.2-i-vtec-110kw', '2.2 i VTEC',   110, 150, 2156, 'petrol', 1993, 1998, 'F22B6', 'FWD'),
    -- Accord V
    ('accord-v',   '1.6-i-77kw',       '1.6 i',         77, 105, 1590, 'petrol', 1998, 2002, 'D16Y3', 'FWD'),
    ('accord-v',   '1.8-i-100kw',      '1.8 i',        100, 136, 1850, 'petrol', 1998, 2002, 'F18B2', 'FWD'),
    ('accord-v',   '2.0-i-108kw',      '2.0 i',        108, 147, 1997, 'petrol', 1998, 2002, 'F20B6', 'FWD'),
    ('accord-v',   '2.0-type-r-156kw', '2.0 Type R',   156, 212, 1997, 'petrol', 1998, 2002, 'H22A7', 'FWD'),
    -- Accord VI
    ('accord-vi',  '2.0-i-vtec-110kw', '2.0 i-VTEC',   110, 150, 1997, 'petrol', 2002, 2008, 'K20A6', 'FWD'),
    ('accord-vi',  '2.4-i-vtec-140kw', '2.4 i-VTEC',   140, 190, 2354, 'petrol', 2002, 2008, 'K24A3', 'FWD'),
    ('accord-vi',  '2.2-ctdi-103kw',   '2.2 i-CTDi',   103, 140, 2204, 'diesel', 2004, 2008, 'N22A1', 'FWD'),
    -- Accord VII
    ('accord-vii', '2.0-i-vtec-115kw', '2.0 i-VTEC',   115, 156, 1997, 'petrol', 2002, 2008, 'K20A6', 'FWD'),
    ('accord-vii', '2.4-i-vtec-140kw', '2.4 i-VTEC',   140, 190, 2354, 'petrol', 2002, 2008, 'K24A3', 'FWD'),
    ('accord-vii', '2.2-ctdi-103kw',   '2.2 i-CTDi',   103, 140, 2204, 'diesel', 2004, 2008, 'N22A1', 'FWD'),
    -- Accord VIII
    ('accord-viii','2.0-i-vtec-115kw', '2.0 i-VTEC',   115, 156, 1997, 'petrol', 2008, 2015, 'R20A3', 'FWD'),
    ('accord-viii','2.4-i-vtec-148kw', '2.4 i-VTEC',   148, 201, 2354, 'petrol', 2008, 2015, 'K24Z3', 'FWD'),
    ('accord-viii','2.2-i-dtec-110kw', '2.2 i-DTEC',   110, 150, 2199, 'diesel', 2008, 2015, 'N22B1', 'FWD'),
    -- Civic V
    ('civic-v',    '1.3-16v-55kw',     '1.3 16V',       55,  75, 1343, 'petrol', 1991, 1995, 'D13B2', 'FWD'),
    ('civic-v',    '1.5-16v-66kw',     '1.5 16V',       66,  90, 1493, 'petrol', 1991, 1995, 'D15B2', 'FWD'),
    ('civic-v',    '1.6-vtec-92kw',    '1.6 VTEC',      92, 125, 1595, 'petrol', 1991, 1995, 'D16Z6', 'FWD'),
    -- Civic VI
    ('civic-vi',   '1.4-16v-66kw',     '1.4 16V',       66,  90, 1396, 'petrol', 1995, 2001, 'D14A1', 'FWD'),
    ('civic-vi',   '1.5-vtec-e-84kw',  '1.5 VTEC-E',    84, 114, 1493, 'petrol', 1995, 2001, 'D15Z6', 'FWD'),
    ('civic-vi',   '1.6-vtec-92kw',    '1.6 VTEC',      92, 125, 1590, 'petrol', 1995, 2001, 'D16W3', 'FWD'),
    ('civic-vi',   '1.8-vti-124kw',    '1.8 VTi',      124, 169, 1797, 'petrol', 1995, 2001, 'B18C4', 'FWD'),
    -- Civic VII
    ('civic-vii',  '1.4-16v-66kw',     '1.4 i',         66,  90, 1396, 'petrol', 2001, 2005, 'D14Z5', 'FWD'),
    ('civic-vii',  '1.6-vtec-81kw',    '1.6 i-VTEC',    81, 110, 1590, 'petrol', 2001, 2005, 'D16V1', 'FWD'),
    ('civic-vii',  '2.0-type-r-147kw', '2.0 Type R',   147, 200, 1998, 'petrol', 2001, 2005, 'K20A2', 'FWD'),
    ('civic-vii',  '1.7-ctdi-74kw',    '1.7 CTDi',      74, 100, 1686, 'diesel', 2001, 2005, '4EE-2', 'FWD'),
    -- Civic VIII
    ('civic-viii', '1.4-i-83kw',       '1.4 i',         83, 113, 1399, 'petrol', 2005, 2012, 'L13A8', 'FWD'),
    ('civic-viii', '1.8-i-vtec-103kw', '1.8 i-VTEC',   103, 140, 1799, 'petrol', 2005, 2012, 'R18A2', 'FWD'),
    ('civic-viii', '2.0-type-r-148kw', '2.0 i-VTEC Type R', 148, 201, 1998, 'petrol', 2007, 2011, 'K20Z4', 'FWD'),
    ('civic-viii', '2.2-i-ctdi-103kw', '2.2 i-CTDi',   103, 140, 2204, 'diesel', 2005, 2012, 'N22A2', 'FWD'),
    -- Civic IX
    ('civic-ix',   '1.4-i-vtec-73kw',  '1.4 i-VTEC',    73,  99, 1399, 'petrol', 2011, 2017, 'L13Z1', 'FWD'),
    ('civic-ix',   '1.8-i-vtec-104kw', '1.8 i-VTEC',   104, 142, 1798, 'petrol', 2011, 2017, 'R18Z4', 'FWD'),
    ('civic-ix',   '2.2-i-dtec-110kw', '2.2 i-DTEC',   110, 150, 2199, 'diesel', 2011, 2017, 'N22B1', 'FWD'),
    ('civic-ix',   '1.6-i-dtec-88kw',  '1.6 i-DTEC',    88, 120, 1597, 'diesel', 2013, 2017, 'N16A1', 'FWD'),
    -- CR-V I
    ('cr-v-i',     '2.0-16v-94kw',     '2.0 16V',       94, 128, 1973, 'petrol', 1995, 2002, 'B20B3', 'AWD'),
    -- CR-V II
    ('cr-v-ii',    '2.0-i-vtec-110kw', '2.0 i-VTEC',   110, 150, 1998, 'petrol', 2002, 2006, 'K20A4', 'AWD'),
    ('cr-v-ii',    '2.4-i-vtec-117kw', '2.4 i-VTEC',   117, 160, 2354, 'petrol', 2002, 2006, 'K24A1', 'AWD'),
    ('cr-v-ii',    '2.2-ctdi-103kw',   '2.2 i-CTDi',   103, 140, 2204, 'diesel', 2005, 2006, 'N22A2', 'AWD'),
    -- CR-V III
    ('cr-v-iii',   '2.0-i-vtec-110kw', '2.0 i-VTEC',   110, 150, 1997, 'petrol', 2006, 2012, 'R20A2', 'AWD'),
    ('cr-v-iii',   '2.4-i-vtec-125kw', '2.4 i-VTEC',   125, 170, 2354, 'petrol', 2006, 2012, 'K24Z1', 'AWD'),
    ('cr-v-iii',   '2.2-i-ctdi-103kw', '2.2 i-CTDi',   103, 140, 2204, 'diesel', 2006, 2012, 'N22A2', 'AWD'),
    -- CR-V IV
    ('cr-v-iv',    '2.0-i-vtec-114kw', '2.0 i-VTEC',   114, 155, 1997, 'petrol', 2012, 2018, 'R20A9', 'AWD'),
    ('cr-v-iv',    '2.4-i-vtec-140kw', '2.4 i-VTEC',   140, 190, 2354, 'petrol', 2012, 2018, 'K24Z9', 'AWD'),
    ('cr-v-iv',    '1.6-i-dtec-88kw',  '1.6 i-DTEC',    88, 120, 1597, 'diesel', 2013, 2018, 'N16A1', 'AWD'),
    ('cr-v-iv',    '2.2-i-dtec-110kw', '2.2 i-DTEC',   110, 150, 2199, 'diesel', 2012, 2018, 'N22B1', 'AWD'),
    -- Jazz I
    ('jazz-i',     '1.2-i-56kw',       '1.2 i',         56,  76, 1246, 'petrol', 2001, 2008, 'L12A1', 'FWD'),
    ('jazz-i',     '1.4-i-61kw',       '1.4 i',         61,  83, 1339, 'petrol', 2001, 2008, 'L13A1', 'FWD'),
    -- Jazz II
    ('jazz-ii',    '1.2-i-vtec-66kw',  '1.2 i-VTEC',    66,  90, 1198, 'petrol', 2008, 2015, 'L12B1', 'FWD'),
    ('jazz-ii',    '1.4-i-vtec-73kw',  '1.4 i-VTEC',    73, 100, 1339, 'petrol', 2008, 2015, 'L13Z1', 'FWD'),
    -- HR-V I
    ('hr-v-i',     '1.6-16v-77kw',     '1.6 16V',       77, 105, 1590, 'petrol', 1999, 2006, 'D16W1', 'AWD'),
    ('hr-v-i',     '1.6-vtec-91kw',    '1.6 VTEC',      91, 124, 1590, 'petrol', 1999, 2006, 'D16W5', 'AWD'),
    -- HR-V II
    ('hr-v-ii',    '1.5-i-vtec-96kw',  '1.5 i-VTEC',    96, 130, 1498, 'petrol', 2015, 2021, 'L15B7', 'FWD'),
    ('hr-v-ii',    '1.6-i-dtec-88kw',  '1.6 i-DTEC',    88, 120, 1597, 'diesel', 2015, 2021, 'N16A1', 'FWD'),
    -- Prelude IV
    ('prelude-iv', '2.0-i-96kw',       '2.0 i',         96, 130, 1997, 'petrol', 1992, 1996, 'F20A4', 'FWD'),
    ('prelude-iv', '2.2-vtec-138kw',   '2.2 16V VTEC', 138, 188, 2157, 'petrol', 1992, 1996, 'H22A1', 'FWD'),
    -- S2000
    ('s2000',      '2.0-vtec-177kw',   '2.0 VTEC',     177, 240, 1997, 'petrol', 1999, 2003, 'F20C1', 'RWD'),
    ('s2000',      '2.2-vtec-177kw',   '2.2 VTEC',     177, 240, 2157, 'petrol', 2003, 2009, 'F22C1', 'RWD'),
    -- Legend II
    ('legend-ii',  '3.2-v6-154kw',     '3.2 V6',       154, 209, 3206, 'petrol', 1991, 1996, 'C32A1', 'FWD'),
    -- Insight II
    ('insight-ii', '1.3-hybrid-65kw',  '1.3 IMA Hybrid', 65, 88, 1339, 'hybrid', 2009, 2014, 'LDA3',  'FWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name,
    power_kw = excluded.power_kw,
    power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel = excluded.fuel,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    engine_code = excluded.engine_code,
    drive = excluded.drive,
    is_active = true;

-- ============================================================================
-- 2. BMW — 12 popular models with engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'bmw')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('1-series-e87',  '1 Series E87',  2004, 2011, 'hatchback'),
    ('3-series-e30',  '3 Series E30',  1982, 1991, 'sedan'),
    ('3-series-e36',  '3 Series E36',  1990, 2000, 'sedan'),
    ('3-series-e46',  '3 Series E46',  1998, 2007, 'sedan'),
    ('3-series-e90',  '3 Series E90',  2005, 2013, 'sedan'),
    ('3-series-f30',  '3 Series F30',  2012, 2019, 'sedan'),
    ('5-series-e34',  '5 Series E34',  1988, 1996, 'sedan'),
    ('5-series-e39',  '5 Series E39',  1995, 2003, 'sedan'),
    ('5-series-e60',  '5 Series E60',  2003, 2010, 'sedan'),
    ('5-series-f10',  '5 Series F10',  2010, 2017, 'sedan'),
    ('7-series-e38',  '7 Series E38',  1994, 2001, 'sedan'),
    ('x3-e83',        'X3 E83',        2003, 2010, 'suv'),
    ('x5-e53',        'X5 E53',        1999, 2006, 'suv'),
    ('x5-e70',        'X5 E70',        2006, 2013, 'suv'),
    ('z4-e85',        'Z4 E85',        2002, 2008, 'roadster')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    body_type = excluded.body_type,
    is_active = true;

with mdl as (
    select vm.id, vm.slug
    from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'bmw'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- 1 Series E87
    ('1-series-e87', '116i-85kw',  '116i',  85, 116, 1596, 'petrol', 2004, 2011, 'N45B16', 'RWD'),
    ('1-series-e87', '118i-105kw', '118i', 105, 143, 1995, 'petrol', 2004, 2011, 'N46B20', 'RWD'),
    ('1-series-e87', '120i-125kw', '120i', 125, 170, 1995, 'petrol', 2004, 2011, 'N46B20', 'RWD'),
    ('1-series-e87', '130i-195kw', '130i', 195, 265, 2996, 'petrol', 2005, 2011, 'N52B30', 'RWD'),
    ('1-series-e87', '116d-85kw',  '116d',  85, 116, 1995, 'diesel', 2009, 2011, 'N47D20', 'RWD'),
    ('1-series-e87', '118d-105kw', '118d', 105, 143, 1995, 'diesel', 2007, 2011, 'N47D20', 'RWD'),
    ('1-series-e87', '120d-130kw', '120d', 130, 177, 1995, 'diesel', 2007, 2011, 'N47D20', 'RWD'),
    -- 3 Series E30
    ('3-series-e30', '316i-73kw',  '316i',  73, 100, 1796, 'petrol', 1987, 1991, 'M40B18', 'RWD'),
    ('3-series-e30', '318i-83kw',  '318i',  83, 113, 1796, 'petrol', 1987, 1991, 'M40B18', 'RWD'),
    ('3-series-e30', '320i-95kw',  '320i',  95, 129, 1990, 'petrol', 1982, 1991, 'M20B20', 'RWD'),
    ('3-series-e30', '325i-125kw', '325i', 125, 170, 2494, 'petrol', 1985, 1991, 'M20B25', 'RWD'),
    ('3-series-e30', '324d-63kw',  '324d',  63,  86, 2443, 'diesel', 1985, 1991, 'M21D24', 'RWD'),
    -- 3 Series E36
    ('3-series-e36', '316i-75kw',  '316i',  75, 102, 1596, 'petrol', 1993, 1999, 'M43B16', 'RWD'),
    ('3-series-e36', '318i-85kw',  '318i',  85, 115, 1796, 'petrol', 1993, 1999, 'M43B18', 'RWD'),
    ('3-series-e36', '320i-110kw', '320i', 110, 150, 1991, 'petrol', 1990, 1999, 'M50B20', 'RWD'),
    ('3-series-e36', '325i-141kw', '325i', 141, 192, 2494, 'petrol', 1990, 1995, 'M50B25', 'RWD'),
    ('3-series-e36', '328i-142kw', '328i', 142, 193, 2793, 'petrol', 1995, 1999, 'M52B28', 'RWD'),
    ('3-series-e36', '318tds-66kw','318tds', 66,  90, 1665, 'diesel', 1995, 1999, 'M41D17', 'RWD'),
    ('3-series-e36', '325tds-105kw','325tds',105, 143, 2498, 'diesel', 1993, 1999, 'M51D25', 'RWD'),
    -- 3 Series E46
    ('3-series-e46', '316i-77kw',  '316i',  77, 105, 1596, 'petrol', 1998, 2005, 'N45B16', 'RWD'),
    ('3-series-e46', '318i-87kw',  '318i',  87, 118, 1995, 'petrol', 2001, 2005, 'N42B20', 'RWD'),
    ('3-series-e46', '320i-110kw', '320i', 110, 150, 2171, 'petrol', 1998, 2005, 'M54B22', 'RWD'),
    ('3-series-e46', '325i-141kw', '325i', 141, 192, 2494, 'petrol', 2000, 2005, 'M54B25', 'RWD'),
    ('3-series-e46', '330i-170kw', '330i', 170, 231, 2979, 'petrol', 2000, 2005, 'M54B30', 'RWD'),
    ('3-series-e46', '320d-110kw', '320d', 110, 150, 1995, 'diesel', 2001, 2005, 'M47D20TU','RWD'),
    ('3-series-e46', '330d-150kw', '330d', 150, 204, 2926, 'diesel', 2003, 2005, 'M57D30',  'RWD'),
    ('3-series-e46', 'm3-252kw',   'M3',   252, 343, 3246, 'petrol', 2000, 2006, 'S54B32',  'RWD'),
    -- 3 Series E90
    ('3-series-e90', '320i-125kw', '320i', 125, 170, 1995, 'petrol', 2007, 2013, 'N43B20', 'RWD'),
    ('3-series-e90', '325i-160kw', '325i', 160, 218, 2497, 'petrol', 2005, 2013, 'N52B25', 'RWD'),
    ('3-series-e90', '330i-200kw', '330i', 200, 272, 2996, 'petrol', 2005, 2013, 'N52B30', 'RWD'),
    ('3-series-e90', '335i-225kw', '335i', 225, 306, 2979, 'petrol', 2007, 2013, 'N54B30', 'RWD'),
    ('3-series-e90', '320d-130kw', '320d', 130, 177, 1995, 'diesel', 2007, 2013, 'N47D20', 'RWD'),
    ('3-series-e90', '325d-145kw', '325d', 145, 197, 2993, 'diesel', 2006, 2013, 'M57D30', 'RWD'),
    ('3-series-e90', '330d-180kw', '330d', 180, 245, 2993, 'diesel', 2008, 2013, 'N57D30', 'RWD'),
    -- 3 Series F30
    ('3-series-f30', '320i-135kw', '320i', 135, 184, 1997, 'petrol', 2012, 2019, 'N20B20', 'RWD'),
    ('3-series-f30', '328i-180kw', '328i', 180, 245, 1997, 'petrol', 2012, 2015, 'N20B20', 'RWD'),
    ('3-series-f30', '335i-225kw', '335i', 225, 306, 2979, 'petrol', 2012, 2015, 'N55B30', 'RWD'),
    ('3-series-f30', '320d-135kw', '320d', 135, 184, 1995, 'diesel', 2012, 2019, 'N47D20', 'RWD'),
    ('3-series-f30', '330d-190kw', '330d', 190, 258, 2993, 'diesel', 2012, 2019, 'N57D30', 'RWD'),
    -- 5 Series E34
    ('5-series-e34', '520i-110kw', '520i', 110, 150, 1991, 'petrol', 1988, 1995, 'M50B20', 'RWD'),
    ('5-series-e34', '525i-141kw', '525i', 141, 192, 2494, 'petrol', 1988, 1995, 'M50B25', 'RWD'),
    ('5-series-e34', '530i-155kw', '530i', 155, 211, 2997, 'petrol', 1992, 1995, 'M60B30', 'RWD'),
    ('5-series-e34', '540i-210kw', '540i', 210, 286, 3982, 'petrol', 1992, 1995, 'M60B40', 'RWD'),
    ('5-series-e34', '525tds-105kw','525tds',105, 143, 2498, 'diesel', 1991, 1996, 'M51D25', 'RWD'),
    -- 5 Series E39
    ('5-series-e39', '520i-110kw', '520i', 110, 150, 2171, 'petrol', 1996, 2003, 'M54B22', 'RWD'),
    ('5-series-e39', '525i-141kw', '525i', 141, 192, 2494, 'petrol', 2000, 2003, 'M54B25', 'RWD'),
    ('5-series-e39', '528i-142kw', '528i', 142, 193, 2793, 'petrol', 1995, 2000, 'M52B28', 'RWD'),
    ('5-series-e39', '535i-173kw', '535i', 173, 235, 3498, 'petrol', 1996, 2003, 'M62B35', 'RWD'),
    ('5-series-e39', '540i-210kw', '540i', 210, 286, 4398, 'petrol', 1996, 2003, 'M62B44', 'RWD'),
    ('5-series-e39', '520d-100kw', '520d', 100, 136, 1951, 'diesel', 2000, 2003, 'M47D20', 'RWD'),
    ('5-series-e39', '525d-120kw', '525d', 120, 163, 2497, 'diesel', 2000, 2003, 'M57D25', 'RWD'),
    ('5-series-e39', '530d-142kw', '530d', 142, 193, 2926, 'diesel', 1998, 2003, 'M57D30', 'RWD'),
    -- 5 Series E60
    ('5-series-e60', '520i-125kw', '520i', 125, 170, 2171, 'petrol', 2003, 2010, 'M54B22', 'RWD'),
    ('5-series-e60', '525i-160kw', '525i', 160, 218, 2497, 'petrol', 2005, 2010, 'N52B25', 'RWD'),
    ('5-series-e60', '530i-200kw', '530i', 200, 272, 2996, 'petrol', 2005, 2010, 'N52B30', 'RWD'),
    ('5-series-e60', '535i-225kw', '535i', 225, 306, 2979, 'petrol', 2007, 2010, 'N54B30', 'RWD'),
    ('5-series-e60', '520d-130kw', '520d', 130, 177, 1995, 'diesel', 2007, 2010, 'N47D20', 'RWD'),
    ('5-series-e60', '525d-145kw', '525d', 145, 197, 2993, 'diesel', 2007, 2010, 'M57D30', 'RWD'),
    ('5-series-e60', '530d-170kw', '530d', 170, 231, 2993, 'diesel', 2007, 2010, 'M57D30', 'RWD'),
    ('5-series-e60', '535d-200kw', '535d', 200, 272, 2993, 'diesel', 2004, 2010, 'M57D30', 'RWD'),
    -- 5 Series F10
    ('5-series-f10', '520i-135kw', '520i', 135, 184, 1997, 'petrol', 2010, 2017, 'N20B20', 'RWD'),
    ('5-series-f10', '528i-180kw', '528i', 180, 245, 1997, 'petrol', 2011, 2017, 'N20B20', 'RWD'),
    ('5-series-f10', '535i-225kw', '535i', 225, 306, 2979, 'petrol', 2010, 2017, 'N55B30', 'RWD'),
    ('5-series-f10', '550i-300kw', '550i', 300, 408, 4395, 'petrol', 2010, 2017, 'N63B44', 'RWD'),
    ('5-series-f10', '520d-135kw', '520d', 135, 184, 1995, 'diesel', 2011, 2017, 'N47D20', 'RWD'),
    ('5-series-f10', '525d-160kw', '525d', 160, 218, 2993, 'diesel', 2011, 2017, 'N57D30', 'RWD'),
    ('5-series-f10', '530d-190kw', '530d', 190, 258, 2993, 'diesel', 2011, 2017, 'N57D30', 'RWD'),
    -- 7 Series E38
    ('7-series-e38', '728i-142kw', '728i', 142, 193, 2793, 'petrol', 1995, 2001, 'M52B28', 'RWD'),
    ('7-series-e38', '735i-173kw', '735i', 173, 235, 3498, 'petrol', 1996, 2001, 'M62B35', 'RWD'),
    ('7-series-e38', '740i-210kw', '740i', 210, 286, 4398, 'petrol', 1996, 2001, 'M62B44', 'RWD'),
    ('7-series-e38', '750i-240kw', '750i', 240, 326, 5379, 'petrol', 1995, 2001, 'M73B54', 'RWD'),
    ('7-series-e38', '730d-135kw', '730d', 135, 184, 2926, 'diesel', 1998, 2001, 'M57D30', 'RWD'),
    ('7-series-e38', '740d-180kw', '740d', 180, 245, 3901, 'diesel', 1999, 2001, 'M67D40', 'RWD'),
    -- X3 E83
    ('x3-e83',       '2.0i-110kw',  '2.0i', 110, 150, 1995, 'petrol', 2004, 2010, 'N46B20', 'AWD'),
    ('x3-e83',       '2.5i-141kw',  '2.5i', 141, 192, 2494, 'petrol', 2004, 2010, 'M54B25', 'AWD'),
    ('x3-e83',       '3.0i-170kw',  '3.0i', 170, 231, 2979, 'petrol', 2004, 2010, 'M54B30', 'AWD'),
    ('x3-e83',       '2.0d-110kw',  '2.0d', 110, 150, 1995, 'diesel', 2005, 2010, 'M47D20', 'AWD'),
    ('x3-e83',       '3.0d-160kw',  '3.0d', 160, 218, 2993, 'diesel', 2003, 2010, 'M57D30', 'AWD'),
    -- X5 E53
    ('x5-e53',       '3.0i-170kw',  '3.0i', 170, 231, 2979, 'petrol', 1999, 2006, 'M54B30', 'AWD'),
    ('x5-e53',       '4.4i-210kw',  '4.4i', 210, 286, 4398, 'petrol', 1999, 2006, 'M62B44', 'AWD'),
    ('x5-e53',       '4.6is-250kw', '4.6is',250, 340, 4619, 'petrol', 2002, 2003, 'M62B46', 'AWD'),
    ('x5-e53',       '4.8is-265kw', '4.8is',265, 360, 4799, 'petrol', 2003, 2006, 'N62B48', 'AWD'),
    ('x5-e53',       '3.0d-135kw',  '3.0d', 135, 184, 2926, 'diesel', 2001, 2006, 'M57D30', 'AWD'),
    ('x5-e53',       '4.4d-160kw',  '4.4d', 160, 218, 4423, 'diesel', 2003, 2006, 'M67D44', 'AWD'),
    -- X5 E70
    ('x5-e70',       '3.0si-200kw', '3.0si',200, 272, 2996, 'petrol', 2007, 2010, 'N52B30', 'AWD'),
    ('x5-e70',       '4.8i-261kw',  '4.8i', 261, 355, 4799, 'petrol', 2007, 2010, 'N62B48', 'AWD'),
    ('x5-e70',       'm-408kw',     'M',    408, 555, 4395, 'petrol', 2009, 2013, 'S63B44', 'AWD'),
    ('x5-e70',       '3.0d-173kw',  '3.0d', 173, 235, 2993, 'diesel', 2007, 2013, 'N57D30', 'AWD'),
    -- Z4 E85
    ('z4-e85',       '2.5i-141kw',  '2.5i', 141, 192, 2494, 'petrol', 2002, 2005, 'M54B25', 'RWD'),
    ('z4-e85',       '3.0i-170kw',  '3.0i', 170, 231, 2979, 'petrol', 2002, 2005, 'M54B30', 'RWD'),
    ('z4-e85',       '3.0si-195kw', '3.0si',195, 265, 2996, 'petrol', 2006, 2008, 'N52B30', 'RWD'),
    ('z4-e85',       'm-252kw',     'M',    252, 343, 3246, 'petrol', 2006, 2008, 'S54B32', 'RWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name,
    power_kw = excluded.power_kw,
    power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel = excluded.fuel,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    engine_code = excluded.engine_code,
    drive = excluded.drive,
    is_active = true;

-- ============================================================================
-- 3. VOLKSWAGEN — 14 popular models with engines
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'volkswagen')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('golf-iii',     'Golf III',     1991, 1997, 'hatchback'),
    ('golf-iv',      'Golf IV',      1997, 2003, 'hatchback'),
    ('golf-v',       'Golf V',       2003, 2009, 'hatchback'),
    ('golf-vi',      'Golf VI',      2008, 2013, 'hatchback'),
    ('golf-vii',     'Golf VII',     2012, 2020, 'hatchback'),
    ('passat-b5',    'Passat B5',    1996, 2005, 'sedan'),
    ('passat-b6',    'Passat B6',    2005, 2010, 'sedan'),
    ('passat-b7',    'Passat B7',    2010, 2015, 'sedan'),
    ('polo-iv',      'Polo IV',      2001, 2009, 'hatchback'),
    ('polo-v',       'Polo V',       2009, 2017, 'hatchback'),
    ('touareg-i',    'Touareg I',    2002, 2010, 'suv'),
    ('tiguan-i',     'Tiguan I',     2007, 2016, 'suv'),
    ('caddy-iii',    'Caddy III',    2004, 2015, 'mpv'),
    ('transporter-t5','Transporter T5',2003, 2015, 'van')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    body_type = excluded.body_type,
    is_active = true;

with mdl as (
    select vm.id, vm.slug
    from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'volkswagen'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- Golf III
    ('golf-iii', '1.4-44kw',     '1.4',         44,  60, 1390, 'petrol', 1991, 1997, 'ABD', 'FWD'),
    ('golf-iii', '1.6-55kw',     '1.6',         55,  75, 1598, 'petrol', 1992, 1997, 'AEK', 'FWD'),
    ('golf-iii', '1.8-66kw',     '1.8',         66,  90, 1781, 'petrol', 1991, 1997, 'AAM', 'FWD'),
    ('golf-iii', '2.0-gti-110kw','2.0 GTi 16V',110, 150, 1984, 'petrol', 1992, 1997, 'ABF', 'FWD'),
    ('golf-iii', '1.9-d-47kw',   '1.9 D',       47,  64, 1896, 'diesel', 1991, 1997, '1Y',  'FWD'),
    ('golf-iii', '1.9-tdi-66kw', '1.9 TDi',     66,  90, 1896, 'diesel', 1993, 1997, '1Z',  'FWD'),
    ('golf-iii', '1.9-tdi-81kw', '1.9 TDi',     81, 110, 1896, 'diesel', 1996, 1997, 'AHU', 'FWD'),
    -- Golf IV
    ('golf-iv',  '1.4-16v-55kw', '1.4 16V',     55,  75, 1390, 'petrol', 1997, 2003, 'AHW', 'FWD'),
    ('golf-iv',  '1.4-16v-74kw', '1.4 16V',     74, 100, 1390, 'petrol', 2000, 2003, 'BCA', 'FWD'),
    ('golf-iv',  '1.6-74kw',     '1.6',         74, 100, 1595, 'petrol', 1997, 2003, 'AEH', 'FWD'),
    ('golf-iv',  '1.6-16v-77kw', '1.6 16V',     77, 105, 1598, 'petrol', 2000, 2003, 'AZD', 'FWD'),
    ('golf-iv',  '1.8-t-110kw',  '1.8 T',      110, 150, 1781, 'petrol', 1997, 2003, 'AGU', 'FWD'),
    ('golf-iv',  '1.8-t-132kw',  '1.8 T 20V',  132, 180, 1781, 'petrol', 1999, 2002, 'AUM', 'FWD'),
    ('golf-iv',  '2.3-v5-110kw', '2.3 V5',     110, 150, 2324, 'petrol', 1997, 2000, 'AGZ', 'FWD'),
    ('golf-iv',  '1.9-tdi-66kw', '1.9 TDi',     66,  90, 1896, 'diesel', 1997, 2003, 'ALH', 'FWD'),
    ('golf-iv',  '1.9-tdi-74kw', '1.9 TDi',     74, 100, 1896, 'diesel', 2000, 2003, 'ATD', 'FWD'),
    ('golf-iv',  '1.9-tdi-85kw', '1.9 TDi',     85, 115, 1896, 'diesel', 1998, 2003, 'AHF', 'FWD'),
    ('golf-iv',  '1.9-tdi-96kw', '1.9 TDi',     96, 130, 1896, 'diesel', 2000, 2003, 'ASZ', 'FWD'),
    ('golf-iv',  'r32-177kw',    'R32',        177, 240, 3189, 'petrol', 2002, 2003, 'BFH', 'AWD'),
    -- Golf V
    ('golf-v',   '1.4-16v-55kw', '1.4 16V',     55,  75, 1390, 'petrol', 2003, 2008, 'BCA', 'FWD'),
    ('golf-v',   '1.4-16v-59kw', '1.4 16V',     59,  80, 1390, 'petrol', 2006, 2009, 'BUD', 'FWD'),
    ('golf-v',   '1.4-tsi-90kw', '1.4 TSi',     90, 122, 1390, 'petrol', 2007, 2009, 'CAXA','FWD'),
    ('golf-v',   '1.6-75kw',     '1.6',         75, 102, 1595, 'petrol', 2003, 2009, 'BSE', 'FWD'),
    ('golf-v',   '1.6-fsi-85kw', '1.6 FSi',     85, 115, 1598, 'petrol', 2003, 2008, 'BAG', 'FWD'),
    ('golf-v',   '2.0-fsi-110kw','2.0 FSi',    110, 150, 1984, 'petrol', 2003, 2008, 'BLR', 'FWD'),
    ('golf-v',   '2.0-tfsi-147kw','2.0 TFSi GTi',147,200,1984,'petrol', 2004, 2009, 'AXX', 'FWD'),
    ('golf-v',   '1.9-tdi-77kw', '1.9 TDi',     77, 105, 1896, 'diesel', 2003, 2009, 'BLS', 'FWD'),
    ('golf-v',   '1.9-tdi-85kw', '1.9 TDi',     85, 115, 1896, 'diesel', 2003, 2008, 'BKC', 'FWD'),
    ('golf-v',   '2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2003, 2009, 'BKD', 'FWD'),
    ('golf-v',   '2.0-tdi-125kw','2.0 TDi GT', 125, 170, 1968, 'diesel', 2005, 2009, 'BMN', 'FWD'),
    -- Golf VI
    ('golf-vi',  '1.2-tsi-63kw', '1.2 TSi',     63,  86, 1197, 'petrol', 2010, 2013, 'CBZA','FWD'),
    ('golf-vi',  '1.2-tsi-77kw', '1.2 TSi',     77, 105, 1197, 'petrol', 2010, 2013, 'CBZB','FWD'),
    ('golf-vi',  '1.4-tsi-90kw', '1.4 TSi',     90, 122, 1390, 'petrol', 2008, 2013, 'CAXA','FWD'),
    ('golf-vi',  '1.4-tsi-118kw','1.4 TSi',    118, 160, 1390, 'petrol', 2008, 2013, 'CAVD','FWD'),
    ('golf-vi',  '1.6-tdi-66kw', '1.6 TDi',     66,  90, 1598, 'diesel', 2009, 2013, 'CAYB','FWD'),
    ('golf-vi',  '1.6-tdi-77kw', '1.6 TDi',     77, 105, 1598, 'diesel', 2009, 2013, 'CAYC','FWD'),
    ('golf-vi',  '2.0-tdi-81kw', '2.0 TDi',     81, 110, 1968, 'diesel', 2009, 2013, 'CBDC','FWD'),
    ('golf-vi',  '2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2008, 2013, 'CBAB','FWD'),
    ('golf-vi',  '2.0-tfsi-155kw','2.0 TFSi GTi',155,210, 1984,'petrol', 2008, 2013, 'CCZB','FWD'),
    -- Golf VII
    ('golf-vii', '1.2-tsi-77kw', '1.2 TSi',     77, 105, 1197, 'petrol', 2012, 2017, 'CJZA','FWD'),
    ('golf-vii', '1.4-tsi-90kw', '1.4 TSi',     90, 122, 1395, 'petrol', 2012, 2017, 'CMBA','FWD'),
    ('golf-vii', '1.4-tsi-103kw','1.4 TSi',    103, 140, 1395, 'petrol', 2012, 2017, 'CHPA','FWD'),
    ('golf-vii', '2.0-tsi-162kw','2.0 TSi GTi',162, 220, 1984, 'petrol', 2012, 2020, 'CHHB','FWD'),
    ('golf-vii', '1.6-tdi-77kw', '1.6 TDi',     77, 105, 1598, 'diesel', 2012, 2020, 'CLHA','FWD'),
    ('golf-vii', '2.0-tdi-110kw','2.0 TDi',    110, 150, 1968, 'diesel', 2012, 2020, 'CRBC','FWD'),
    ('golf-vii', '2.0-r-221kw',  '2.0 R',      221, 300, 1984, 'petrol', 2013, 2020, 'CJXC','AWD'),
    -- Passat B5
    ('passat-b5','1.6-74kw',     '1.6',         74, 101, 1595, 'petrol', 1996, 2005, 'AHL', 'FWD'),
    ('passat-b5','1.8-92kw',     '1.8',         92, 125, 1781, 'petrol', 1996, 2005, 'ADR', 'FWD'),
    ('passat-b5','1.8-t-110kw',  '1.8 T',      110, 150, 1781, 'petrol', 1996, 2005, 'AEB', 'FWD'),
    ('passat-b5','2.0-85kw',     '2.0',         85, 115, 1984, 'petrol', 1996, 2005, 'AZM', 'FWD'),
    ('passat-b5','2.8-v6-142kw', '2.8 V6',     142, 193, 2771, 'petrol', 1996, 2005, 'AMX', 'FWD'),
    ('passat-b5','1.9-tdi-66kw', '1.9 TDi',     66,  90, 1896, 'diesel', 1996, 2000, 'AHU', 'FWD'),
    ('passat-b5','1.9-tdi-85kw', '1.9 TDi',     85, 115, 1896, 'diesel', 1998, 2005, 'AVB', 'FWD'),
    ('passat-b5','1.9-tdi-96kw', '1.9 TDi',     96, 130, 1896, 'diesel', 2000, 2005, 'AVF', 'FWD'),
    ('passat-b5','2.5-tdi-110kw','2.5 TDi V6', 110, 150, 2496, 'diesel', 1998, 2005, 'AFB', 'FWD'),
    ('passat-b5','2.5-tdi-132kw','2.5 TDi V6', 132, 180, 2496, 'diesel', 2003, 2005, 'BDH', 'FWD'),
    -- Passat B6
    ('passat-b6','1.6-75kw',     '1.6',         75, 102, 1595, 'petrol', 2005, 2008, 'BSE', 'FWD'),
    ('passat-b6','1.6-fsi-85kw', '1.6 FSi',     85, 115, 1598, 'petrol', 2005, 2008, 'BLF', 'FWD'),
    ('passat-b6','2.0-fsi-110kw','2.0 FSi',    110, 150, 1984, 'petrol', 2005, 2010, 'BLR', 'FWD'),
    ('passat-b6','2.0-tfsi-147kw','2.0 TFSi', 147, 200, 1984, 'petrol', 2005, 2010, 'BPY', 'FWD'),
    ('passat-b6','1.9-tdi-77kw', '1.9 TDi',     77, 105, 1896, 'diesel', 2005, 2009, 'BXE', 'FWD'),
    ('passat-b6','2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2005, 2010, 'BMP', 'FWD'),
    ('passat-b6','2.0-tdi-125kw','2.0 TDi',    125, 170, 1968, 'diesel', 2005, 2010, 'BMR', 'FWD'),
    -- Passat B7
    ('passat-b7','1.4-tsi-90kw', '1.4 TSi',     90, 122, 1390, 'petrol', 2010, 2014, 'CAXA','FWD'),
    ('passat-b7','1.8-tsi-118kw','1.8 TSi',    118, 160, 1798, 'petrol', 2010, 2014, 'CDAA','FWD'),
    ('passat-b7','2.0-tsi-155kw','2.0 TSi',    155, 210, 1984, 'petrol', 2010, 2014, 'CCZA','FWD'),
    ('passat-b7','1.6-tdi-77kw', '1.6 TDi',     77, 105, 1598, 'diesel', 2010, 2015, 'CAYC','FWD'),
    ('passat-b7','2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2010, 2015, 'CFFB','FWD'),
    ('passat-b7','2.0-tdi-125kw','2.0 TDi',    125, 170, 1968, 'diesel', 2010, 2015, 'CFGB','FWD'),
    -- Polo IV
    ('polo-iv',  '1.2-40kw',     '1.2',         40,  54, 1198, 'petrol', 2001, 2009, 'AWY', 'FWD'),
    ('polo-iv',  '1.2-47kw',     '1.2',         47,  64, 1198, 'petrol', 2001, 2009, 'AZQ', 'FWD'),
    ('polo-iv',  '1.4-16v-55kw', '1.4 16V',     55,  75, 1390, 'petrol', 2001, 2009, 'AUA', 'FWD'),
    ('polo-iv',  '1.4-16v-74kw', '1.4 16V',     74, 100, 1390, 'petrol', 2001, 2009, 'BBY', 'FWD'),
    ('polo-iv',  '1.8-gti-110kw','1.8 T GTi',  110, 150, 1781, 'petrol', 2005, 2007, 'BJX', 'FWD'),
    ('polo-iv',  '1.4-tdi-51kw', '1.4 TDi',     51,  70, 1422, 'diesel', 2001, 2009, 'AMF', 'FWD'),
    ('polo-iv',  '1.4-tdi-59kw', '1.4 TDi',     59,  80, 1422, 'diesel', 2001, 2009, 'BNV', 'FWD'),
    ('polo-iv',  '1.9-tdi-74kw', '1.9 TDi',     74, 100, 1896, 'diesel', 2001, 2009, 'ATD', 'FWD'),
    -- Polo V
    ('polo-v',   '1.0-44kw',     '1.0',         44,  60, 999,  'petrol', 2014, 2017, 'CHYA','FWD'),
    ('polo-v',   '1.2-tsi-66kw', '1.2 TSi',     66,  90, 1197, 'petrol', 2009, 2017, 'CBZA','FWD'),
    ('polo-v',   '1.4-tsi-90kw', '1.4 TSi',     90, 122, 1390, 'petrol', 2010, 2014, 'CAVE','FWD'),
    ('polo-v',   '1.4-tsi-110kw','1.4 TSi GTi',110, 150, 1395, 'petrol', 2014, 2017, 'CZEA','FWD'),
    ('polo-v',   '1.6-77kw',     '1.6',         77, 105, 1598, 'petrol', 2009, 2014, 'CFNA','FWD'),
    ('polo-v',   '1.6-tdi-66kw', '1.6 TDi',     66,  90, 1598, 'diesel', 2009, 2017, 'CAYB','FWD'),
    ('polo-v',   '1.6-tdi-77kw', '1.6 TDi',     77, 105, 1598, 'diesel', 2009, 2017, 'CAYC','FWD'),
    -- Touareg I
    ('touareg-i','3.2-v6-162kw', '3.2 V6',     162, 220, 3189, 'petrol', 2003, 2007, 'BMV', 'AWD'),
    ('touareg-i','3.6-v6-206kw', '3.6 V6 FSi', 206, 280, 3597, 'petrol', 2006, 2010, 'BHK', 'AWD'),
    ('touareg-i','4.2-v8-228kw', '4.2 V8',     228, 310, 4172, 'petrol', 2003, 2010, 'AXQ', 'AWD'),
    ('touareg-i','2.5-r5-tdi-128kw','2.5 R5 TDi',128,174,2461,'diesel', 2003, 2010, 'BAC', 'AWD'),
    ('touareg-i','3.0-v6-tdi-165kw','3.0 V6 TDi',165,225,2967,'diesel', 2004, 2010, 'BKS', 'AWD'),
    ('touareg-i','5.0-v10-tdi-230kw','5.0 V10 TDi',230,313,4921,'diesel',2003,2010, 'AYH', 'AWD'),
    -- Tiguan I
    ('tiguan-i', '1.4-tsi-110kw','1.4 TSi',    110, 150, 1390, 'petrol', 2007, 2016, 'CAVA','AWD'),
    ('tiguan-i', '1.4-tsi-118kw','1.4 TSi',    118, 160, 1390, 'petrol', 2010, 2016, 'CAVD','AWD'),
    ('tiguan-i', '2.0-tsi-132kw','2.0 TSi',    132, 180, 1984, 'petrol', 2007, 2016, 'CCTA','AWD'),
    ('tiguan-i', '2.0-tsi-155kw','2.0 TSi',    155, 210, 1984, 'petrol', 2007, 2016, 'CAWB','AWD'),
    ('tiguan-i', '2.0-tdi-81kw', '2.0 TDi',     81, 110, 1968, 'diesel', 2008, 2016, 'CBAA','AWD'),
    ('tiguan-i', '2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2007, 2016, 'CBAB','AWD'),
    ('tiguan-i', '2.0-tdi-125kw','2.0 TDi',    125, 170, 1968, 'diesel', 2008, 2016, 'CBBB','AWD'),
    -- Caddy III
    ('caddy-iii','1.4-16v-55kw', '1.4 16V',     55,  75, 1390, 'petrol', 2004, 2010, 'BCA', 'FWD'),
    ('caddy-iii','1.6-75kw',     '1.6',         75, 102, 1595, 'petrol', 2004, 2010, 'BSE', 'FWD'),
    ('caddy-iii','2.0-sdi-51kw', '2.0 SDi',     51,  70, 1968, 'diesel', 2004, 2010, 'BDJ', 'FWD'),
    ('caddy-iii','1.9-tdi-77kw', '1.9 TDi',     77, 105, 1896, 'diesel', 2004, 2010, 'BLS', 'FWD'),
    ('caddy-iii','2.0-tdi-103kw','2.0 TDi',    103, 140, 1968, 'diesel', 2010, 2015, 'CFHC','FWD'),
    -- Transporter T5
    ('transporter-t5','2.0-85kw','2.0',          85, 115, 1984, 'petrol', 2003, 2009, 'AXA', 'FWD'),
    ('transporter-t5','3.2-v6-173kw','3.2 V6', 173, 235, 3189, 'petrol', 2003, 2009, 'AXK', 'AWD'),
    ('transporter-t5','1.9-tdi-63kw','1.9 TDi', 63,  86, 1896, 'diesel', 2003, 2009, 'AXB', 'FWD'),
    ('transporter-t5','1.9-tdi-77kw','1.9 TDi', 77, 105, 1896, 'diesel', 2003, 2009, 'AXC', 'FWD'),
    ('transporter-t5','2.5-tdi-96kw','2.5 TDi', 96, 130, 2461, 'diesel', 2003, 2009, 'AXD', 'FWD'),
    ('transporter-t5','2.5-tdi-128kw','2.5 TDi',128,174, 2461, 'diesel', 2003, 2009, 'BPC', 'FWD'),
    ('transporter-t5','2.0-tdi-103kw','2.0 TDi',103,140, 1968, 'diesel', 2009, 2015, 'CAAC','FWD'),
    ('transporter-t5','2.0-bitdi-132kw','2.0 BiTDi',132,180,1968,'diesel',2009,2015, 'CFCA','AWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name,
    power_kw = excluded.power_kw,
    power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel = excluded.fuel,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    engine_code = excluded.engine_code,
    drive = excluded.drive,
    is_active = true;

-- ============================================================================
-- 4. TOYOTA — popular models
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'toyota')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('corolla-e110', 'Corolla E110', 1995, 2002, 'sedan'),
    ('corolla-e120', 'Corolla E120', 2001, 2007, 'sedan'),
    ('corolla-e150', 'Corolla E150', 2006, 2013, 'sedan'),
    ('yaris-xp10',   'Yaris XP10',   1999, 2005, 'hatchback'),
    ('yaris-xp90',   'Yaris XP90',   2005, 2011, 'hatchback'),
    ('avensis-t220', 'Avensis T220', 1997, 2003, 'sedan'),
    ('avensis-t250', 'Avensis T250', 2003, 2008, 'sedan'),
    ('camry-xv30',   'Camry XV30',   2002, 2006, 'sedan'),
    ('rav4-xa20',    'RAV4 XA20',    2000, 2006, 'suv'),
    ('rav4-xa30',    'RAV4 XA30',    2005, 2012, 'suv'),
    ('prius-xw20',   'Prius XW20',   2003, 2009, 'hatchback'),
    ('prius-xw30',   'Prius XW30',   2009, 2015, 'hatchback'),
    ('aygo-i',       'Aygo I',       2005, 2014, 'hatchback'),
    ('hilux-an10',   'Hilux AN10',   2004, 2015, 'pickup')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    body_type = excluded.body_type,
    is_active = true;

with mdl as (
    select vm.id, vm.slug
    from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'toyota'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    ('corolla-e110', '1.3-63kw',     '1.3 16V',      63,  86, 1332, 'petrol', 1995, 2002, '4E-FE', 'FWD'),
    ('corolla-e110', '1.4-71kw',     '1.4 16V',      71,  97, 1398, 'petrol', 1997, 2002, '4ZZ-FE','FWD'),
    ('corolla-e110', '1.6-81kw',     '1.6 16V',      81, 110, 1587, 'petrol', 1995, 2002, '4A-FE', 'FWD'),
    ('corolla-e110', '2.0-d-53kw',   '2.0 D',        53,  72, 1975, 'diesel', 1995, 2002, '2C-E',  'FWD'),
    ('corolla-e120', '1.4-71kw',     '1.4 VVT-i',    71,  97, 1398, 'petrol', 2001, 2007, '4ZZ-FE','FWD'),
    ('corolla-e120', '1.6-81kw',     '1.6 VVT-i',    81, 110, 1598, 'petrol', 2001, 2007, '3ZZ-FE','FWD'),
    ('corolla-e120', '1.8-100kw',    '1.8 VVT-i',   100, 136, 1796, 'petrol', 2001, 2007, '1ZZ-FE','FWD'),
    ('corolla-e120', '2.0-d4d-65kw', '2.0 D-4D',     65,  90, 1995, 'diesel', 2001, 2007, '1CD-FTV','FWD'),
    ('corolla-e120', '2.0-d4d-85kw', '2.0 D-4D',     85, 116, 1995, 'diesel', 2002, 2007, '1CD-FTV','FWD'),
    ('corolla-e150', '1.4-71kw',     '1.4 VVT-i',    71,  97, 1398, 'petrol', 2007, 2013, '4ZZ-FE','FWD'),
    ('corolla-e150', '1.6-91kw',     '1.6 VVT-i',    91, 124, 1598, 'petrol', 2007, 2013, '1ZR-FE','FWD'),
    ('corolla-e150', '1.8-97kw',     '1.8 VVT-i',    97, 132, 1798, 'petrol', 2007, 2013, '2ZR-FE','FWD'),
    ('corolla-e150', '2.0-d4d-93kw', '2.0 D-4D',     93, 126, 1998, 'diesel', 2007, 2013, '1AD-FTV','FWD'),
    ('yaris-xp10',   '1.0-50kw',     '1.0 VVT-i',    50,  68, 998,  'petrol', 1999, 2005, '1SZ-FE','FWD'),
    ('yaris-xp10',   '1.3-65kw',     '1.3 VVT-i',    65,  87, 1299, 'petrol', 1999, 2005, '2NZ-FE','FWD'),
    ('yaris-xp10',   '1.5-78kw',     '1.5 VVT-i',    78, 106, 1497, 'petrol', 1999, 2005, '1NZ-FE','FWD'),
    ('yaris-xp10',   '1.4-d4d-55kw', '1.4 D-4D',     55,  75, 1364, 'diesel', 2001, 2005, '1ND-TV','FWD'),
    ('yaris-xp90',   '1.0-51kw',     '1.0 VVT-i',    51,  69, 998,  'petrol', 2005, 2011, '1KR-FE','FWD'),
    ('yaris-xp90',   '1.3-64kw',     '1.3 VVT-i',    64,  87, 1298, 'petrol', 2005, 2011, '2NZ-FE','FWD'),
    ('yaris-xp90',   '1.4-d4d-66kw', '1.4 D-4D',     66,  90, 1364, 'diesel', 2005, 2011, '1ND-TV','FWD'),
    ('avensis-t220', '1.6-81kw',     '1.6 VVT-i',    81, 110, 1598, 'petrol', 1997, 2003, '3ZZ-FE','FWD'),
    ('avensis-t220', '1.8-95kw',     '1.8 VVT-i',    95, 129, 1794, 'petrol', 2000, 2003, '1ZZ-FE','FWD'),
    ('avensis-t220', '2.0-d4d-81kw', '2.0 D-4D',     81, 110, 1995, 'diesel', 1999, 2003, '1CD-FTV','FWD'),
    ('avensis-t250', '1.6-81kw',     '1.6 VVT-i',    81, 110, 1598, 'petrol', 2003, 2008, '3ZZ-FE','FWD'),
    ('avensis-t250', '1.8-95kw',     '1.8 VVT-i',    95, 129, 1794, 'petrol', 2003, 2008, '1ZZ-FE','FWD'),
    ('avensis-t250', '2.0-108kw',    '2.0 VVT-i',   108, 147, 1998, 'petrol', 2003, 2008, '1AZ-FSE','FWD'),
    ('avensis-t250', '2.0-d4d-85kw', '2.0 D-4D',     85, 116, 1995, 'diesel', 2003, 2008, '1CD-FTV','FWD'),
    ('avensis-t250', '2.2-d4d-110kw','2.2 D-4D',    110, 150, 2231, 'diesel', 2005, 2008, '2AD-FTV','FWD'),
    ('camry-xv30',   '2.4-112kw',    '2.4 VVT-i',   112, 152, 2362, 'petrol', 2002, 2006, '2AZ-FE','FWD'),
    ('camry-xv30',   '3.0-v6-142kw', '3.0 V6 VVT-i',142,194, 2994,'petrol', 2002, 2006, '1MZ-FE','FWD'),
    ('rav4-xa20',    '1.8-92kw',     '1.8 VVT-i',    92, 125, 1794, 'petrol', 2000, 2006, '1ZZ-FE','AWD'),
    ('rav4-xa20',    '2.0-110kw',    '2.0 VVT-i',   110, 150, 1998, 'petrol', 2000, 2006, '1AZ-FE','AWD'),
    ('rav4-xa20',    '2.0-d4d-85kw', '2.0 D-4D',     85, 115, 1995, 'diesel', 2001, 2006, '1CD-FTV','AWD'),
    ('rav4-xa30',    '2.0-112kw',    '2.0 VVT-i',   112, 152, 1998, 'petrol', 2005, 2012, '1AZ-FE','AWD'),
    ('rav4-xa30',    '2.4-125kw',    '2.4 VVT-i',   125, 170, 2362, 'petrol', 2005, 2012, '2AZ-FE','AWD'),
    ('rav4-xa30',    '2.2-d4d-100kw','2.2 D-4D',    100, 136, 2231, 'diesel', 2005, 2012, '2AD-FTV','AWD'),
    ('rav4-xa30',    '2.2-d4d-130kw','2.2 D-CAT',   130, 177, 2231, 'diesel', 2006, 2012, '2AD-FHV','AWD'),
    ('prius-xw20',   '1.5-hybrid-57kw','1.5 Hybrid',57,  78, 1497, 'hybrid', 2003, 2009, '1NZ-FXE','FWD'),
    ('prius-xw30',   '1.8-hybrid-73kw','1.8 Hybrid',73,  99, 1798, 'hybrid', 2009, 2015, '2ZR-FXE','FWD'),
    ('aygo-i',       '1.0-50kw',     '1.0 VVT-i',    50,  68, 998,  'petrol', 2005, 2014, '1KR-FE','FWD'),
    ('aygo-i',       '1.4-d4d-40kw', '1.4 D-4D',     40,  54, 1364, 'diesel', 2005, 2010, '1ND-TV','FWD'),
    ('hilux-an10',   '2.5-d4d-75kw', '2.5 D-4D',     75, 102, 2494, 'diesel', 2004, 2015, '2KD-FTV','AWD'),
    ('hilux-an10',   '2.5-d4d-106kw','2.5 D-4D',    106, 144, 2494, 'diesel', 2004, 2015, '2KD-FTV','AWD'),
    ('hilux-an10',   '3.0-d4d-126kw','3.0 D-4D',    126, 171, 2982, 'diesel', 2006, 2015, '1KD-FTV','AWD'),
    ('hilux-an10',   '4.0-v6-175kw', '4.0 V6',      175, 238, 3956, 'petrol', 2005, 2015, '1GR-FE','AWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name,
    power_kw = excluded.power_kw,
    power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel = excluded.fuel,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    engine_code = excluded.engine_code,
    drive = excluded.drive,
    is_active = true;

-- ============================================================================
-- 5. MERCEDES-BENZ — popular models
-- ============================================================================
with mk as (select id from public.vehicle_makes where slug = 'mercedes-benz')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select mk.id, m.slug, m.name, m.yf::integer, m.yt::integer, m.body
from mk, (values
    ('c-class-w202',  'C-Class W202',  1993, 2000, 'sedan'),
    ('c-class-w203',  'C-Class W203',  2000, 2007, 'sedan'),
    ('c-class-w204',  'C-Class W204',  2007, 2014, 'sedan'),
    ('e-class-w210',  'E-Class W210',  1995, 2002, 'sedan'),
    ('e-class-w211',  'E-Class W211',  2002, 2009, 'sedan'),
    ('e-class-w212',  'E-Class W212',  2009, 2016, 'sedan'),
    ('s-class-w220',  'S-Class W220',  1998, 2005, 'sedan'),
    ('s-class-w221',  'S-Class W221',  2005, 2013, 'sedan'),
    ('a-class-w168',  'A-Class W168',  1997, 2004, 'hatchback'),
    ('a-class-w169',  'A-Class W169',  2004, 2012, 'hatchback'),
    ('ml-w164',       'ML W164',       2005, 2011, 'suv'),
    ('vito-w638',     'Vito W638',     1996, 2003, 'van'),
    ('vito-w639',     'Vito W639',     2003, 2014, 'van'),
    ('sprinter-w906', 'Sprinter W906', 2006, 2018, 'van')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name = excluded.name,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    body_type = excluded.body_type,
    is_active = true;

with mdl as (
    select vm.id, vm.slug
    from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'mercedes-benz'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select mdl.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from mdl
join (values
    -- C-Class W202
    ('c-class-w202', 'c180-90kw',    'C 180',         90, 122, 1799, 'petrol', 1993, 2000, 'M111.920','RWD'),
    ('c-class-w202', 'c200-100kw',   'C 200',        100, 136, 1998, 'petrol', 1993, 2000, 'M111.945','RWD'),
    ('c-class-w202', 'c220-110kw',   'C 220',        110, 150, 2199, 'petrol', 1993, 2000, 'M111.961','RWD'),
    ('c-class-w202', 'c280-142kw',   'C 280',        142, 193, 2799, 'petrol', 1993, 2000, 'M104.941','RWD'),
    ('c-class-w202', 'c200-cdi-75kw','C 200 CDi',     75, 102, 2151, 'diesel', 1998, 2000, 'OM611.960','RWD'),
    ('c-class-w202', 'c220-cdi-92kw','C 220 CDi',     92, 125, 2151, 'diesel', 1997, 2000, 'OM611.961','RWD'),
    ('c-class-w202', 'c250-td-110kw','C 250 TD',     110, 150, 2497, 'diesel', 1995, 2000, 'OM605.960','RWD'),
    -- C-Class W203
    ('c-class-w203', 'c180-k-105kw', 'C 180 K',      105, 143, 1796, 'petrol', 2002, 2007, 'M271.946','RWD'),
    ('c-class-w203', 'c200-k-120kw', 'C 200 K',      120, 163, 1796, 'petrol', 2002, 2007, 'M271.940','RWD'),
    ('c-class-w203', 'c230-k-145kw', 'C 230 K',      145, 197, 1796, 'petrol', 2004, 2007, 'M271.948','RWD'),
    ('c-class-w203', 'c320-v6-160kw','C 320 V6',     160, 218, 3199, 'petrol', 2000, 2007, 'M112.946','RWD'),
    ('c-class-w203', 'c200-cdi-90kw','C 200 CDi',     90, 122, 2148, 'diesel', 2003, 2007, 'OM646.962','RWD'),
    ('c-class-w203', 'c220-cdi-110kw','C 220 CDi',  110, 150, 2148, 'diesel', 2003, 2007, 'OM646.963','RWD'),
    ('c-class-w203', 'c270-cdi-125kw','C 270 CDi',  125, 170, 2685, 'diesel', 2000, 2005, 'OM612.962','RWD'),
    -- C-Class W204
    ('c-class-w204', 'c180-k-115kw', 'C 180 K',      115, 156, 1796, 'petrol', 2007, 2009, 'M271.910','RWD'),
    ('c-class-w204', 'c200-k-135kw', 'C 200 K',      135, 184, 1796, 'petrol', 2007, 2009, 'M271.911','RWD'),
    ('c-class-w204', 'c250-cgi-150kw','C 250 CGi',  150, 204, 1796, 'petrol', 2009, 2014, 'M271.821','RWD'),
    ('c-class-w204', 'c350-220kw',   'C 350',        220, 299, 3498, 'petrol', 2007, 2014, 'M272.984','RWD'),
    ('c-class-w204', 'c200-cdi-100kw','C 200 CDi', 100, 136, 2143, 'diesel', 2007, 2014, 'OM651.911','RWD'),
    ('c-class-w204', 'c220-cdi-125kw','C 220 CDi', 125, 170, 2143, 'diesel', 2007, 2014, 'OM651.911','RWD'),
    ('c-class-w204', 'c350-cdi-195kw','C 350 CDi', 195, 265, 2987, 'diesel', 2009, 2014, 'OM642.961','RWD'),
    -- E-Class W210
    ('e-class-w210', 'e200-100kw',   'E 200',        100, 136, 1998, 'petrol', 1995, 2002, 'M111.957','RWD'),
    ('e-class-w210', 'e240-v6-125kw','E 240 V6',    125, 170, 2398, 'petrol', 1997, 2002, 'M112.911','RWD'),
    ('e-class-w210', 'e280-v6-142kw','E 280 V6',    142, 193, 2799, 'petrol', 1995, 2002, 'M112.921','RWD'),
    ('e-class-w210', 'e320-v6-165kw','E 320 V6',    165, 224, 3199, 'petrol', 1997, 2002, 'M112.941','RWD'),
    ('e-class-w210', 'e220-cdi-92kw','E 220 CDi',    92, 125, 2151, 'diesel', 1999, 2002, 'OM611.961','RWD'),
    ('e-class-w210', 'e270-cdi-125kw','E 270 CDi', 125, 170, 2685, 'diesel', 1999, 2002, 'OM612.961','RWD'),
    ('e-class-w210', 'e320-cdi-145kw','E 320 CDi', 145, 197, 3222, 'diesel', 1999, 2002, 'OM613.961','RWD'),
    -- E-Class W211
    ('e-class-w211', 'e200-k-135kw', 'E 200 K',      135, 184, 1796, 'petrol', 2002, 2009, 'M271.940','RWD'),
    ('e-class-w211', 'e240-v6-130kw','E 240 V6',    130, 177, 2597, 'petrol', 2002, 2005, 'M112.913','RWD'),
    ('e-class-w211', 'e320-v6-165kw','E 320 V6',    165, 224, 3199, 'petrol', 2002, 2005, 'M112.949','RWD'),
    ('e-class-w211', 'e350-200kw',   'E 350',        200, 272, 3498, 'petrol', 2004, 2009, 'M272.964','RWD'),
    ('e-class-w211', 'e500-v8-225kw','E 500 V8',    225, 306, 4966, 'petrol', 2002, 2006, 'M113.967','RWD'),
    ('e-class-w211', 'e220-cdi-125kw','E 220 CDi', 125, 170, 2148, 'diesel', 2006, 2009, 'OM646.961','RWD'),
    ('e-class-w211', 'e270-cdi-130kw','E 270 CDi', 130, 177, 2685, 'diesel', 2002, 2005, 'OM647.961','RWD'),
    ('e-class-w211', 'e320-cdi-150kw','E 320 CDi', 150, 204, 3222, 'diesel', 2002, 2005, 'OM648.961','RWD'),
    ('e-class-w211', 'e320-cdi-165kw','E 320 CDi', 165, 224, 2987, 'diesel', 2005, 2009, 'OM642.920','RWD'),
    -- E-Class W212
    ('e-class-w212', 'e200-cgi-135kw','E 200 CGi', 135, 184, 1796, 'petrol', 2009, 2016, 'M271.860','RWD'),
    ('e-class-w212', 'e250-cgi-150kw','E 250 CGi', 150, 204, 1796, 'petrol', 2009, 2014, 'M271.820','RWD'),
    ('e-class-w212', 'e350-v6-200kw','E 350 V6',  200, 272, 3498, 'petrol', 2009, 2014, 'M272.967','RWD'),
    ('e-class-w212', 'e500-v8-285kw','E 500 V8',  285, 388, 4663, 'petrol', 2011, 2016, 'M278.922','RWD'),
    ('e-class-w212', 'e200-cdi-100kw','E 200 CDi',100, 136, 2143, 'diesel', 2009, 2016, 'OM651.911','RWD'),
    ('e-class-w212', 'e220-cdi-125kw','E 220 CDi',125, 170, 2143, 'diesel', 2009, 2016, 'OM651.924','RWD'),
    ('e-class-w212', 'e250-cdi-150kw','E 250 CDi',150, 204, 2143, 'diesel', 2009, 2016, 'OM651.924','RWD'),
    ('e-class-w212', 'e350-cdi-195kw','E 350 CDi',195, 265, 2987, 'diesel', 2009, 2016, 'OM642.852','RWD'),
    -- S-Class W220
    ('s-class-w220', 's280-v6-150kw','S 280 V6',  150, 204, 2799, 'petrol', 1998, 2005, 'M112.922','RWD'),
    ('s-class-w220', 's320-v6-165kw','S 320 V6',  165, 224, 3199, 'petrol', 1998, 2005, 'M112.944','RWD'),
    ('s-class-w220', 's430-v8-205kw','S 430 V8',  205, 279, 4266, 'petrol', 1998, 2005, 'M113.941','RWD'),
    ('s-class-w220', 's500-v8-225kw','S 500 V8',  225, 306, 4966, 'petrol', 1998, 2005, 'M113.960','RWD'),
    ('s-class-w220', 's600-v12-270kw','S 600 V12',270, 367, 5786, 'petrol', 1999, 2002, 'M137.970','RWD'),
    ('s-class-w220', 's320-cdi-145kw','S 320 CDi',145, 197, 3222, 'diesel', 1999, 2005, 'OM613.960','RWD'),
    ('s-class-w220', 's400-cdi-184kw','S 400 CDi',184, 250, 3996, 'diesel', 2000, 2005, 'OM628.960','RWD'),
    -- S-Class W221
    ('s-class-w221', 's350-200kw',   'S 350',        200, 272, 3498, 'petrol', 2005, 2013, 'M272.967','RWD'),
    ('s-class-w221', 's500-v8-285kw','S 500 V8',    285, 388, 4663, 'petrol', 2010, 2013, 'M278.929','RWD'),
    ('s-class-w221', 's600-v12-380kw','S 600 V12', 380, 517, 5513, 'petrol', 2005, 2013, 'M275.953','RWD'),
    ('s-class-w221', 's320-cdi-173kw','S 320 CDi', 173, 235, 2987, 'diesel', 2005, 2009, 'OM642.930','RWD'),
    ('s-class-w221', 's350-cdi-195kw','S 350 CDi', 195, 265, 2987, 'diesel', 2009, 2013, 'OM642.853','RWD'),
    ('s-class-w221', 's420-cdi-235kw','S 420 CDi', 235, 320, 3996, 'diesel', 2005, 2010, 'OM629.910','RWD'),
    -- A-Class W168
    ('a-class-w168', 'a140-60kw',    'A 140',         60,  82, 1397, 'petrol', 1997, 2004, 'M166.940','FWD'),
    ('a-class-w168', 'a160-75kw',    'A 160',         75, 102, 1598, 'petrol', 1997, 2004, 'M166.960','FWD'),
    ('a-class-w168', 'a190-92kw',    'A 190',         92, 125, 1898, 'petrol', 1999, 2004, 'M166.990','FWD'),
    ('a-class-w168', 'a160-cdi-44kw','A 160 CDi',     44,  60, 1689, 'diesel', 1998, 2004, 'OM668.940','FWD'),
    ('a-class-w168', 'a170-cdi-70kw','A 170 CDi',     70,  95, 1689, 'diesel', 1998, 2004, 'OM668.942','FWD'),
    -- A-Class W169
    ('a-class-w169', 'a150-70kw',    'A 150',         70,  95, 1498, 'petrol', 2004, 2012, 'M266.920','FWD'),
    ('a-class-w169', 'a160-70kw',    'A 160',         70,  95, 1498, 'petrol', 2008, 2012, 'M266.920','FWD'),
    ('a-class-w169', 'a170-85kw',    'A 170',         85, 116, 1699, 'petrol', 2004, 2008, 'M266.940','FWD'),
    ('a-class-w169', 'a200-100kw',   'A 200',        100, 136, 2034, 'petrol', 2004, 2012, 'M266.960','FWD'),
    ('a-class-w169', 'a200-turbo-142kw','A 200 Turbo',142,193,2034, 'petrol', 2004, 2012, 'M266.980','FWD'),
    ('a-class-w169', 'a160-cdi-60kw','A 160 CDi',     60,  82, 1991, 'diesel', 2004, 2012, 'OM640.941','FWD'),
    ('a-class-w169', 'a180-cdi-80kw','A 180 CDi',     80, 109, 1991, 'diesel', 2004, 2012, 'OM640.940','FWD'),
    ('a-class-w169', 'a200-cdi-100kw','A 200 CDi',  100, 136, 1991, 'diesel', 2004, 2012, 'OM640.942','FWD'),
    -- ML W164
    ('ml-w164',      'ml-280-cdi-140kw','ML 280 CDi',140,190, 2987, 'diesel', 2005, 2009, 'OM642.940','AWD'),
    ('ml-w164',      'ml-300-cdi-140kw','ML 300 CDi',140,190, 2987, 'diesel', 2009, 2011, 'OM642.940','AWD'),
    ('ml-w164',      'ml-320-cdi-165kw','ML 320 CDi',165,224, 2987, 'diesel', 2005, 2009, 'OM642.940','AWD'),
    ('ml-w164',      'ml-350-200kw', 'ML 350 V6',   200, 272, 3498, 'petrol', 2005, 2011, 'M272.967','AWD'),
    ('ml-w164',      'ml-500-v8-285kw','ML 500 V8',285, 388, 5461, 'petrol', 2005, 2011, 'M273.963','AWD'),
    -- Vito W638
    ('vito-w638',    '108-d-58kw',   '108 D',         58,  79, 2299, 'diesel', 1995, 2003, 'OM601.942','RWD'),
    ('vito-w638',    '110-cdi-75kw', '110 CDi',       75, 102, 2151, 'diesel', 1999, 2003, 'OM611.980','RWD'),
    ('vito-w638',    '112-cdi-90kw', '112 CDi',       90, 122, 2151, 'diesel', 1999, 2003, 'OM611.980','RWD'),
    ('vito-w638',    '113-92kw',     '113',           92, 125, 2295, 'petrol', 1996, 2003, 'M111.949','RWD'),
    -- Vito W639
    ('vito-w639',    '109-cdi-65kw', '109 CDi',       65,  88, 2148, 'diesel', 2003, 2010, 'OM646.982','RWD'),
    ('vito-w639',    '111-cdi-80kw', '111 CDi',       80, 109, 2148, 'diesel', 2003, 2010, 'OM646.983','RWD'),
    ('vito-w639',    '115-cdi-110kw','115 CDi',      110, 150, 2148, 'diesel', 2003, 2010, 'OM646.980','RWD'),
    ('vito-w639',    '120-cdi-150kw','120 CDi',      150, 204, 2987, 'diesel', 2006, 2014, 'OM642.990','RWD'),
    -- Sprinter W906
    ('sprinter-w906','311-cdi-80kw', '311 CDi',       80, 109, 2148, 'diesel', 2006, 2018, 'OM646.989','RWD'),
    ('sprinter-w906','313-cdi-95kw', '313 CDi',       95, 129, 2143, 'diesel', 2009, 2018, 'OM651.957','RWD'),
    ('sprinter-w906','315-cdi-110kw','315 CDi',      110, 150, 2148, 'diesel', 2006, 2009, 'OM646.985','RWD'),
    ('sprinter-w906','318-cdi-135kw','318 CDi V6',   135, 184, 2987, 'diesel', 2006, 2018, 'OM642.992','RWD'),
    ('sprinter-w906','316-95kw',     '316',           95, 129, 1796, 'petrol', 2009, 2018, 'M271.948','RWD')
) as t(model_slug, slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
    on t.model_slug = mdl.slug
on conflict (model_id, slug) do update
set name = excluded.name,
    power_kw = excluded.power_kw,
    power_hp = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel = excluded.fuel,
    year_from = excluded.year_from,
    year_to = excluded.year_to,
    engine_code = excluded.engine_code,
    drive = excluded.drive,
    is_active = true;

-- ============================================================================
-- 6. Link 5 universal products to ALL engine types (every page has products)
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
-- Verify with:
--   select count(*) from public.vehicle_makes where is_active;        -- 35
--   select count(*) from public.vehicle_models where is_active;       -- ~75
--   select count(*) from public.vehicle_types where is_active;        -- ~330
--   select count(*) from public.vehicle_part_link;                    -- ~1700+
--
-- Sample any engine page now has 5 universal products + Honda Accord II also
-- has 8 brand-specific products in their categories.
-- =============================================================================
