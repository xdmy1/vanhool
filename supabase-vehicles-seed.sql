-- =============================================================================
-- Vehicle taxonomy seed — global make list, Honda full tree, Honda Accord II
-- end-to-end (4 engine variants), demo categories, demo products linked to types.
--
-- Idempotent: re-runnable. Uses INSERT ... ON CONFLICT DO UPDATE.
-- Run AFTER supabase-vehicles-migration.sql.
-- =============================================================================

-- 0. Extend categories (idempotent) ----------------------------------------------
insert into public.categories (slug, name_en, name_ro, name_ru, sort_order, is_active)
values
    ('brakes',       'Brakes',         'Frâne',                 'Тормоза',         10, true),
    ('engine',       'Engine',         'Motor',                 'Двигатель',       20, true),
    ('filtre',       'Filters',        'Filtre',                'Фильтры',         30, true),
    ('suspension',   'Suspension',     'Suspensie',             'Подвеска',        40, true),
    ('transmission', 'Transmission',   'Transmisie',            'Трансмиссия',     50, true),
    ('cooling',      'Cooling',        'Răcire',                'Охлаждение',      60, true),
    ('electro',      'Electrical',     'Sistem electric',       'Электрика',       70, true),
    ('exhaust',      'Exhaust',        'Sistem de evacuare',    'Выхлоп',          80, true),
    ('steering',     'Steering',       'Direcție',              'Рулевое',         90, true),
    ('body',         'Body',           'Caroserie',             'Кузов',          100, true),
    ('interior',     'Interior',       'Interior',              'Интерьер',       110, true),
    ('lighting',     'Lighting',       'Iluminat',              'Освещение',      120, true)
on conflict (slug) do update
set name_en   = excluded.name_en,
    name_ro   = excluded.name_ro,
    name_ru   = excluded.name_ru,
    sort_order = excluded.sort_order,
    is_active = true;

-- 1. Vehicle makes (35 popular brands, top 12 marked popular) -----------------
insert into public.vehicle_makes (slug, name, sort_order, is_popular) values
    ('audi',          'Audi',           10,  true),
    ('bmw',           'BMW',            20,  true),
    ('mercedes-benz', 'Mercedes-Benz',  30,  true),
    ('volkswagen',    'Volkswagen',     40,  true),
    ('skoda',         'Škoda',          50,  true),
    ('opel',          'Opel',           60,  true),
    ('ford',          'Ford',           70,  true),
    ('renault',       'Renault',        80,  true),
    ('peugeot',       'Peugeot',        90,  true),
    ('citroen',       'Citroën',       100,  true),
    ('toyota',        'Toyota',        110,  true),
    ('honda',         'Honda',         120,  true),
    ('nissan',        'Nissan',        130, false),
    ('mazda',         'Mazda',         140, false),
    ('mitsubishi',    'Mitsubishi',    150, false),
    ('subaru',        'Subaru',        160, false),
    ('suzuki',        'Suzuki',        170, false),
    ('hyundai',       'Hyundai',       180,  true),
    ('kia',           'Kia',           190, false),
    ('chevrolet',     'Chevrolet',     200, false),
    ('volvo',         'Volvo',         210, false),
    ('saab',          'Saab',          220, false),
    ('mini',          'Mini',          230, false),
    ('smart',         'Smart',         240, false),
    ('dacia',         'Dacia',         250,  true),
    ('lada',          'Lada',          260, false),
    ('fiat',          'Fiat',          270, false),
    ('alfa-romeo',    'Alfa Romeo',    280, false),
    ('lancia',        'Lancia',        290, false),
    ('seat',          'SEAT',          300, false),
    ('land-rover',    'Land Rover',    310, false),
    ('jaguar',        'Jaguar',        320, false),
    ('porsche',       'Porsche',       330, false),
    ('jeep',          'Jeep',          340, false),
    ('tesla',         'Tesla',         350, false)
on conflict (slug) do update
set name       = excluded.name,
    sort_order = excluded.sort_order,
    is_popular = excluded.is_popular,
    is_active  = true;

-- 2. Honda models (12 representative) ----------------------------------------
with h as (select id from public.vehicle_makes where slug = 'honda')
insert into public.vehicle_models (make_id, slug, name, year_from, year_to, body_type)
select h.id, m.slug, m.name, m.yf, m.yt, m.body
from h, (values
    ('accord-ii',  'Accord II',   1985, 1989, 'sedan'),
    ('accord-iii', 'Accord III',  1989, 1993, 'sedan'),
    ('accord-iv',  'Accord IV',   1993, 1998, 'sedan'),
    ('accord-v',   'Accord V',    1998, 2002, 'sedan'),
    ('civic-v',    'Civic V',     1991, 1995, 'hatchback'),
    ('civic-vi',   'Civic VI',    1995, 2001, 'hatchback'),
    ('civic-vii',  'Civic VII',   2001, 2005, 'hatchback'),
    ('cr-v-i',     'CR-V I',      1995, 2002, 'suv'),
    ('cr-v-ii',    'CR-V II',     2002, 2006, 'suv'),
    ('jazz-i',     'Jazz I',      2001, 2008, 'hatchback'),
    ('hr-v-i',     'HR-V I',      1999, 2006, 'suv'),
    ('prelude-iv', 'Prelude IV',  1992, 1996, 'coupe'),
    ('s2000',      'S2000',       1999, 2009, 'roadster'),
    ('legend-ii',  'Legend II',   1991, 1996, 'sedan')
) as m(slug, name, yf, yt, body)
on conflict (make_id, slug) do update
set name       = excluded.name,
    year_from  = excluded.year_from,
    year_to    = excluded.year_to,
    body_type  = excluded.body_type,
    is_active  = true;

-- 3. Honda Accord II — 4 engine variants (incl. exact "1.6-ex-ac-65kw") ------
with m as (
    select vm.id from public.vehicle_models vm
    join public.vehicle_makes mk on mk.id = vm.make_id
    where mk.slug = 'honda' and vm.slug = 'accord-ii'
)
insert into public.vehicle_types
    (model_id, slug, name, power_kw, power_hp, capacity_cc, fuel, year_from, year_to, engine_code, drive)
select m.id, t.slug, t.name, t.kw, t.hp, t.cc, t.fuel, t.yf, t.yt, t.code, t.drive
from m, (values
    ('1.6-ex-ac-65kw', '1.6 EX AC',  65,  88, 1598, 'petrol', 1985, 1989, 'EW3',  'FWD'),
    ('1.8-ex-74kw',    '1.8 EX',     74, 101, 1829, 'petrol', 1985, 1989, 'ET2',  'FWD'),
    ('2.0-ex-79kw',    '2.0 EX',     79, 107, 1955, 'petrol', 1986, 1989, 'BS1',  'FWD'),
    ('2.0-exi-90kw',   '2.0 EXi',    90, 122, 1955, 'petrol', 1986, 1989, 'B20A', 'FWD')
) as t(slug, name, kw, hp, cc, fuel, yf, yt, code, drive)
on conflict (model_id, slug) do update
set name        = excluded.name,
    power_kw    = excluded.power_kw,
    power_hp    = excluded.power_hp,
    capacity_cc = excluded.capacity_cc,
    fuel        = excluded.fuel,
    year_from   = excluded.year_from,
    year_to     = excluded.year_to,
    engine_code = excluded.engine_code,
    drive       = excluded.drive,
    is_active   = true;

-- 4. Demo products: 8 Honda Accord II compatible parts -----------------------
-- Categories used: filtre, brakes, engine, suspension, electro, cooling
do $$
declare
    cat_filtre     uuid;
    cat_brakes     uuid;
    cat_engine     uuid;
    cat_suspension uuid;
    cat_electro    uuid;
    cat_cooling    uuid;
begin
    select id into cat_filtre     from public.categories where slug = 'filtre';
    select id into cat_brakes     from public.categories where slug = 'brakes';
    select id into cat_engine     from public.categories where slug = 'engine';
    select id into cat_suspension from public.categories where slug = 'suspension';
    select id into cat_electro    from public.categories where slug = 'electro';
    select id into cat_cooling    from public.categories where slug = 'cooling';

    insert into public.products
        (slug, part_code, brand, price, stock_quantity, category_id,
         name_en, name_ro, name_ru,
         description_en, description_ro, description_ru,
         is_active, is_featured, warranty_months)
    values
        ('mann-w610-3-oil-filter',
         'W 610/3', 'MANN-FILTER', 89.00, 24, cat_filtre,
         'Oil Filter MANN W 610/3',
         'Filtru ulei MANN W 610/3',
         'Масляный фильтр MANN W 610/3',
         'Spin-on oil filter compatible with Honda Accord II 1.6/1.8/2.0.',
         'Filtru ulei spin-on compatibil Honda Accord II 1.6/1.8/2.0.',
         'Масляный фильтр для Honda Accord II 1.6/1.8/2.0.',
         true, true, 12),

        ('bosch-1457433008-air-filter',
         '1 457 433 008', 'BOSCH', 145.00, 18, cat_filtre,
         'Air Filter BOSCH S 3008',
         'Filtru aer BOSCH S 3008',
         'Воздушный фильтр BOSCH S 3008',
         'High-flow air filter for Honda Accord II petrol engines.',
         'Filtru aer high-flow pentru motoarele pe benzină Honda Accord II.',
         'Воздушный фильтр повышенной пропускной способности.',
         true, true, 12),

        ('mann-wk-612-fuel-filter',
         'WK 612/2', 'MANN-FILTER', 175.00, 12, cat_filtre,
         'Fuel Filter MANN WK 612/2',
         'Filtru combustibil MANN WK 612/2',
         'Топливный фильтр MANN WK 612/2',
         'In-line fuel filter for carburettor petrol engines.',
         'Filtru combustibil in-line pentru motoare cu carburator.',
         'Топливный фильтр для карбюраторных двигателей.',
         true, false, 12),

        ('bosch-0986424513-brake-pads-front',
         '0 986 424 513', 'BOSCH', 540.00, 9, cat_brakes,
         'Brake Pads Front BOSCH BP913',
         'Plăcuțe frână față BOSCH BP913',
         'Тормозные колодки передние BOSCH BP913',
         'Front axle brake pad set for Honda Accord II — ECE R90 approved.',
         'Set plăcuțe frână față pentru Honda Accord II — omologate ECE R90.',
         'Комплект передних колодок — ECE R90.',
         true, true, 24),

        ('ngk-bpr6es-spark-plug',
         'BPR6ES', 'NGK', 38.00, 80, cat_engine,
         'Spark Plug NGK BPR6ES',
         'Bujie NGK BPR6ES',
         'Свеча зажигания NGK BPR6ES',
         'Standard nickel spark plug — set of 4 recommended for Accord II.',
         'Bujie nichel standard — set de 4 recomandat pentru Accord II.',
         'Стандартная никелевая свеча — рекомендуется комплект из 4.',
         true, false, 12),

        ('sachs-3000951032-clutch-kit',
         '3000 951 032', 'SACHS', 1850.00, 4, cat_engine,
         'Clutch Kit SACHS 3000 951 032',
         'Kit ambreiaj SACHS 3000 951 032',
         'Комплект сцепления SACHS 3000 951 032',
         'Complete clutch kit (disc + pressure plate + release bearing).',
         'Kit ambreiaj complet (disc + placă presiune + rulment presiune).',
         'Полный комплект сцепления (диск + корзина + выжимной).',
         true, true, 24),

        ('monroe-g7367-shock-front',
         'G7367', 'MONROE', 720.00, 6, cat_suspension,
         'Shock Absorber Front MONROE G7367',
         'Amortizor față MONROE G7367',
         'Амортизатор передний MONROE G7367',
         'Gas-pressure front shock absorber.',
         'Amortizor față cu presiune de gaz.',
         'Передний газовый амортизатор.',
         true, false, 24),

        ('valeo-732556-radiator',
         '732556', 'VALEO', 1290.00, 3, cat_cooling,
         'Radiator VALEO 732556',
         'Radiator răcire VALEO 732556',
         'Радиатор охлаждения VALEO 732556',
         'Engine cooling radiator with plastic side tanks.',
         'Radiator răcire cu rezervoare laterale plastic.',
         'Радиатор с пластиковыми бачками.',
         true, false, 24)
    on conflict (slug) do update
    set part_code        = excluded.part_code,
        brand            = excluded.brand,
        price            = excluded.price,
        stock_quantity   = excluded.stock_quantity,
        category_id      = excluded.category_id,
        name_en          = excluded.name_en,
        name_ro          = excluded.name_ro,
        name_ru          = excluded.name_ru,
        description_en   = excluded.description_en,
        description_ro   = excluded.description_ro,
        description_ru   = excluded.description_ru,
        is_active        = true,
        is_featured      = excluded.is_featured,
        warranty_months  = excluded.warranty_months;
end $$;

-- 5. Link all 8 products to all 4 Accord II engine variants ------------------
-- (Demo: same parts fit all 4 engines — for real life this is per-type)
insert into public.vehicle_part_link (vehicle_type_id, product_id)
select t.id, p.id
from public.vehicle_types t
join public.vehicle_models m on m.id = t.model_id
join public.vehicle_makes  mk on mk.id = m.make_id
cross join public.products p
where mk.slug = 'honda'
  and m.slug = 'accord-ii'
  and p.slug in (
      'mann-w610-3-oil-filter',
      'bosch-1457433008-air-filter',
      'mann-wk-612-fuel-filter',
      'bosch-0986424513-brake-pads-front',
      'ngk-bpr6es-spark-plug',
      'sachs-3000951032-clutch-kit',
      'monroe-g7367-shock-front',
      'valeo-732556-radiator'
  )
on conflict (vehicle_type_id, product_id) do nothing;

-- =============================================================================
-- Done. Verify with:
--   select count(*) from public.vehicle_makes;        -- 35
--   select count(*) from public.vehicle_models where make_id = (select id from public.vehicle_makes where slug='honda');  -- 14
--   select count(*) from public.vehicle_types;        -- 4 (just Accord II for now)
--   select count(*) from public.vehicle_part_link;    -- 32 (8 parts × 4 engines)
-- =============================================================================
