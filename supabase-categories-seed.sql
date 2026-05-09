-- ============================================================================
-- INTER BUS — Categories & subcategories seed (Task 3 — full taxonomy)
-- Conține 12 categorii root + ~72 subcategorii (cf. screenshots).
-- Idempotent: UPSERT pe slug. Sigur de rulat de mai multe ori.
-- ============================================================================

-- 1. Update root category names to match the canonical taxonomy ----------------
update public.categories set
    name_ro = 'Frâne',
    name_en = 'Brakes',
    name_ru = 'Тормоза',
    sort_order = 10,
    is_active = true
where slug = 'brakes';

update public.categories set
    name_ro = 'Presiune a aerului',
    name_en = 'Air pressure',
    name_ru = 'Пневмосистема',
    sort_order = 20,
    is_active = true
where slug = 'air-pressure';

update public.categories set
    name_ro = 'Șasiu și suspensie',
    name_en = 'Chassis & suspension',
    name_ru = 'Шасси и подвеска',
    sort_order = 30,
    is_active = true
where slug = 'chassis';

update public.categories set
    name_ro = 'Electro',
    name_en = 'Electro',
    name_ru = 'Электро',
    sort_order = 40,
    is_active = true
where slug = 'electro';

update public.categories set
    name_ro = 'Motor și asamblare',
    name_en = 'Engine & assembly',
    name_ru = 'Двигатель и сборка',
    sort_order = 50,
    is_active = true
where slug = 'engine';

update public.categories set
    name_ro = 'Ambreiaj și cutie de viteze',
    name_en = 'Clutch & gearbox',
    name_ru = 'Сцепление и КПП',
    sort_order = 60,
    is_active = true
where slug = 'clutch';

update public.categories set
    name_ro = 'Direcție și butucuri',
    name_en = 'Steering & hubs',
    name_ru = 'Рулевое и ступицы',
    sort_order = 70,
    is_active = true
where slug = 'steering';

update public.categories set
    name_ro = 'Caroserie',
    name_en = 'Bodywork',
    name_ru = 'Кузов',
    sort_order = 80,
    is_active = true
where slug = 'body';

update public.categories set
    name_ro = 'Aer condiționat și încălzire',
    name_en = 'Air conditioning & heating',
    name_ru = 'Кондиционер и отопление',
    sort_order = 90,
    is_active = true
where slug = 'cooling';

update public.categories set
    name_ro = 'Interior',
    name_en = 'Interior',
    name_ru = 'Салон',
    sort_order = 100,
    is_active = true
where slug = 'interior';

update public.categories set
    name_ro = 'Țevi din silicon',
    name_en = 'Silicone hoses',
    name_ru = 'Силиконовые шланги',
    sort_order = 110,
    is_active = true
where slug = 'hoses';

update public.categories set
    name_ro = 'Cuplaje pneumatice ABC Raufoss',
    name_en = 'Pneumatic couplings ABC Raufoss',
    name_ru = 'Пневмосоединения ABC Raufoss',
    sort_order = 120,
    is_active = true
where slug = 'couplings';

-- 2. Subcategories ------------------------------------------------------------
-- One big UPSERT joining a literal table of (parent_slug + sub) → resolves
-- parent_id, conflict on slug updates names + parent + sort.
with roots as (
    select id, slug from public.categories where parent_id is null
)
insert into public.categories (slug, name_ro, name_en, name_ru, parent_id, sort_order, is_active)
select v.slug, v.name_ro, v.name_en, v.name_ru, r.id, v.sort_order, true
from (values
    -- Frâne ----------------------------------------------------------------
    ('brakes-pads',           'Plăcuțe de frână',                'Brake pads',                'Тормозные колодки',                'brakes',       10),
    ('brakes-discs',          'Discuri de frână',                'Brake discs',               'Тормозные диски',                  'brakes',       20),
    ('brakes-cap',            'Capac de frână',                  'Brake caliper cap',         'Крышка суппорта',                  'brakes',       30),
    ('brakes-calipers',       'Capacități de frână și accesorii','Brake calipers & accessories','Тормозные суппорты и аксессуары','brakes',       40),
    ('brakes-wear-indicator', 'Indicatori de uzură',             'Wear indicators',           'Индикаторы износа',                'brakes',       50),
    ('brakes-trailer-cyl',    'Remorcare cilindri',              'Trailer cylinders',         'Цилиндры прицепа',                 'brakes',       60),
    ('brakes-drums',          'Tambure de frână',                'Brake drums',               'Тормозные барабаны',               'brakes',       70),
    ('brakes-shoes',          'Saboți de frână și accesorii',    'Brake shoes & accessories', 'Тормозные колодки барабанные и аксессуары','brakes',80),

    -- Presiune a aerului ---------------------------------------------------
    ('air-compressors',       'Compresoare și accesorii',        'Compressors & accessories', 'Компрессоры и аксессуары',         'air-pressure', 10),
    ('air-valves',            'Valve',                           'Valves',                    'Клапаны',                          'air-pressure', 20),
    ('air-couplings-line',    'Cuplaje de aer',                  'Air couplings',             'Пневмосоединения',                 'air-pressure', 30),
    ('air-treatment',         'Tratare a aerului',               'Air treatment',             'Подготовка воздуха',               'air-pressure', 40),
    ('air-abs-ebs',           'ABS-EBS',                         'ABS-EBS',                   'ABS-EBS',                          'air-pressure', 50),

    -- Șasiu și suspensie ---------------------------------------------------
    ('chassis-shocks',        'Amortizoare',                     'Shock absorbers',           'Амортизаторы',                     'chassis',      10),
    ('chassis-reaction-rod',  'Tijă de reacție',                 'Reaction rod',              'Реактивная штанга',                'chassis',      20),
    ('chassis-leaf-spring',   'Arc lamelar',                     'Leaf spring',               'Рессора',                          'chassis',      30),
    ('chassis-air-susp',      'Suspensie pneumatică',            'Air suspension',            'Пневмоподвеска',                   'chassis',      40),
    ('chassis-stab-triangle', 'Triunghiul de stabilizare',       'Stabilizer triangle',       'Стабилизатор треугольный',         'chassis',      50),
    ('chassis-stab-link',     'Conexiune - tijă de stabilizare', 'Stabilizer link rod',       'Тяга стабилизатора',               'chassis',      60),
    ('chassis-suspension',    'Suspensie',                       'Suspension',                'Подвеска',                         'chassis',      70),

    -- Electro --------------------------------------------------------------
    ('electro-alternators',   'Alternatoare',                    'Alternators',               'Генераторы',                       'electro',      10),
    ('electro-aperitive',     'Aperitive',                       'Aperitive',                 'Аперитив',                         'electro',      20),
    ('electro-batteries',     'Baterii',                         'Batteries',                 'Аккумуляторы',                     'electro',      30),
    ('electro-ext-lighting',  'Iluminat exterior',               'Exterior lighting',         'Внешнее освещение',                'electro',      40),
    ('electro-int-lighting',  'Iluminare interioară',            'Interior lighting',         'Внутреннее освещение',             'electro',      50),
    ('electro-accessories',   'Accesorii electrice',             'Electrical accessories',    'Электрические аксессуары',         'electro',      60),

    -- Motor și asamblare ---------------------------------------------------
    ('engine-cooling',        'Răcire',                          'Cooling',                   'Охлаждение',                       'engine',       10),
    ('engine-timing',         'Distribuție',                     'Timing',                    'Газораспределение',                'engine',       20),
    ('engine-filters',        'Filtre',                          'Filters',                   'Фильтры',                          'engine',       30),
    ('engine-turbo',          'Turbo & intercoolere',            'Turbo & intercoolers',      'Турбо и интеркулеры',              'engine',       40),
    ('engine-exhaust',        'Epuiza',                          'Exhaust',                   'Выхлопная система',                'engine',       50),
    ('engine-adblue',         'AdBlue',                          'AdBlue',                    'AdBlue',                           'engine',       60),
    ('engine-block',          'Motor',                           'Engine block',              'Двигатель',                        'engine',       70),
    ('engine-filters-man',    'Filtre MAN originale',            'Original MAN filters',      'Оригинальные фильтры MAN',         'engine',       80),

    -- Ambreiaj și cutie de viteze -----------------------------------------
    ('clutch-clutch',         'Ambreiaj',                        'Clutch',                    'Сцепление',                        'clutch',       10),
    ('clutch-control',        'Control ambreiaj',                'Clutch control',            'Управление сцеплением',            'clutch',       20),
    ('clutch-gearbox',        'Cutie de viteze',                 'Gearbox',                   'Коробка передач',                  'clutch',       30),
    ('clutch-transmission',   'Transmitere',                     'Transmission',              'Трансмиссия',                      'clutch',       40),

    -- Sistem de direcție și butucuri ax -----------------------------------
    ('steering-shocks',       'Amortizoare de direcție',         'Steering shock absorbers',  'Рулевые амортизаторы',             'steering',     10),
    ('steering-knuckle',      'Fuzetă',                          'Steering knuckle',          'Поворотный кулак',                 'steering',     20),
    ('steering-rods',         'Tije de direcție',                'Steering rods',             'Рулевые тяги',                     'steering',     30),
    ('steering-track-rods',   'Tije de șenilă',                  'Track rods',                'Поперечные тяги',                  'steering',     40),
    ('steering-hubs',         'Mutui și accesorii',              'Hubs & accessories',        'Ступицы и аксессуары',             'steering',     50),
    ('steering-housings',     'Carcase de direcție',             'Steering housings',         'Корпусы рулевого механизма',       'steering',     60),

    -- Caroserie -----------------------------------------------------------
    ('body-mirrors',          'Oglinzi',                         'Mirrors',                   'Зеркала',                          'body',         10),
    ('body-wipers',           'Ștergătoare de parbriz',          'Windshield wipers',         'Стеклоочистители',                 'body',         20),
    ('body-bumper',           'Bară de protecție și panouri laterale','Bumper & side panels','Бампер и боковые панели',           'body',         30),
    ('body-sheet',            'Tablă metalică',                  'Sheet metal',               'Металлические панели',             'body',         40),
    ('body-windows',          'Ferestre',                        'Windows',                   'Окна',                             'body',         50),
    ('body-roof-hatch',       'Trape de acoperiș',               'Roof hatches',              'Крышные люки',                     'body',         60),
    ('body-wheels',           'Jante și roți',                   'Wheels & rims',             'Диски и колёса',                   'body',         70),

    -- Aer condiționat și încălzire ----------------------------------------
    ('cooling-ac',            'Aer condiționat',                 'Air conditioning',          'Кондиционер',                      'cooling',      10),
    ('cooling-heating',       'Încălzire',                       'Heating',                   'Отопление',                        'cooling',      20),

    -- Interior ------------------------------------------------------------
    ('interior-belts',        'Centuri de siguranță',            'Safety belts',              'Ремни безопасности',               'interior',     10),
    ('interior-seats',        'Scaune',                          'Seats',                     'Сиденья',                          'interior',     20),
    ('interior-sanitary',     'Instalații sanitare',             'Sanitary fittings',         'Санитарные приборы',               'interior',     30),

    -- Țevi din silicon ----------------------------------------------------
    ('hoses-straight',        'Țeavă dreaptă din silicon',       'Straight silicone hose',    'Прямой силиконовый шланг',         'hoses',        10),
    ('hoses-90',              'Țeavă de silicon 90°',            'Silicone hose 90°',         'Силиконовый шланг 90°',            'hoses',        20),
    ('hoses-135',             'Țeavă de silicon 135°',           'Silicone hose 135°',        'Силиконовый шланг 135°',           'hoses',        30),
    ('hoses-sleeve',          'Manșon de țeavă din silicon',     'Silicone hose sleeve',      'Силиконовый рукав',                'hoses',        40),
    ('hoses-special',         'Țevi din silicon cu formă specială','Silicone hose special shape','Силиконовый шланг особой формы','hoses',        50),
    ('hoses-reducer-straight','Țeavă din silicon reducție dreaptă','Straight reducer silicone hose','Прямой переходник силикон', 'hoses',        60),
    ('hoses-reducer-curved',  'Țeavă de silicon cu reducție curbată','Curved reducer silicone hose','Изогнутый переходник силикон','hoses',     70),
    ('hoses-clamp-band',      'Bandă de clemare',                'Clamping band',             'Хомутная лента',                   'hoses',        80),

    -- Cuplaje pneumatice ABC Raufoss --------------------------------------
    ('couplings-push-new',    'Împingeți linie nouă',            'New line push-in',          'Push-in для новой линии',          'couplings',    10),
    ('couplings-wireless',    'Împingere fără fir',              'Wireless push-in',          'Беспроводной push-in',             'couplings',    20),
    ('couplings-shot',        'Cuplare shot',                    'Shot coupling',             'Соединение shot',                  'couplings',    30),
    ('couplings-pivot',       'Pivotare',                        'Pivot',                     'Поворотный',                       'couplings',    40),
    ('couplings-rotolock',    'Rotolock',                        'Rotolock',                  'Rotolock',                         'couplings',    50),
    ('couplings-push-90',     'Împingeți la 90° ABC',            '90° push-in ABC',           'Push-in 90° ABC',                  'couplings',    60),
    ('couplings-converter',   'Convertor',                       'Converter',                 'Преобразователь',                  'couplings',    70),
    ('couplings-45',          'Cuplaj la 45°',                   '45° coupling',              'Соединение 45°',                   'couplings',    80)
) as v(slug, name_ro, name_en, name_ru, parent_slug, sort_order)
join roots r on r.slug = v.parent_slug
on conflict (slug) do update set
    name_ro    = excluded.name_ro,
    name_en    = excluded.name_en,
    name_ru    = excluded.name_ru,
    parent_id  = excluded.parent_id,
    sort_order = excluded.sort_order,
    is_active  = true;

-- 3. Cleanup: dezactivează orice rădăcină non-canonică ----------------------
-- Rămân în DB (păstrează istoricul + produsele atașate), dar nu mai apar pe
-- storefront. Reactivează manual din /admin/categories dacă ai nevoie.
update public.categories
   set is_active = false
 where parent_id is null
   and slug not in (
       'brakes','air-pressure','chassis','electro','engine','clutch',
       'steering','body','cooling','interior','hoses','couplings'
   );

-- ============================================================================
-- Verify:
--   select c.slug, c.name_ro, p.slug as parent
--     from public.categories c
--     left join public.categories p on p.id = c.parent_id
--    order by p.sort_order nulls first, c.sort_order;
--
--   select count(*) from public.categories where parent_id is null and is_active = true;     -- 12
--   select count(*) from public.categories where parent_id is not null and is_active = true; -- ~72
-- ============================================================================
