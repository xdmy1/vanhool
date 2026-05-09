-- ============================================================================
-- INTER BUS — Bus makes seed (vehicle_makes)
-- 24 mărci/modele de autobuze folosite în formularul "Mărci compatibile" la
-- piesa de schimb. Conține și brand-ul gol (ex. "MAN") + variantele model
-- ("MAN Lion's City") ca să poți marca compatibilitatea fie la nivel general,
-- fie la nivel de model specific.
--
-- Idempotent: UPSERT pe slug. Sigur de rulat de mai multe ori.
-- ============================================================================

insert into public.vehicle_makes (slug, name, sort_order, is_active, is_popular)
values
    -- IVECO ---------------------------------------------------------------
    ('iveco-crossway',         'Iveco Crossway',          110, true, false),
    ('iveco-daily',            'Iveco Daily',             111, true, false),

    -- MAN -----------------------------------------------------------------
    ('man',                    'MAN',                     200, true, true),
    ('man-lions-city',         'MAN Lion''s City',        210, true, false),
    ('man-lions-coach',        'MAN Lion''s Coach',       211, true, false),
    ('man-lions-regio',        'MAN Lion''s Regio',       212, true, false),
    ('man-lions-intercity',    'MAN Lion''s Intercity',   213, true, false),

    -- Mercedes-Benz -------------------------------------------------------
    ('mercedes-benz',          'Mercedes-Benz',           300, true, true),
    ('mercedes-benz-citaro',   'Mercedes-Benz Citaro',    310, true, false),
    ('mercedes-benz-integro',  'Mercedes-Benz Integro',   311, true, false),
    ('mercedes-benz-tourismo', 'Mercedes-Benz Tourismo',  312, true, false),
    ('mercedes-benz-vario',    'Mercedes-Benz Vario',     313, true, false),

    -- Temsa ---------------------------------------------------------------
    ('temsa-md9',              'Temsa MD9',               400, true, false),

    -- Van Hool ------------------------------------------------------------
    ('van-hool',               'Van Hool',                500, true, true),
    ('van-hool-a360h',         'Van Hool A360H',          510, true, false),
    ('van-hool-newa360',       'Van Hool NEWA360',        511, true, false),
    ('van-hool-a330',          'Van Hool A330',           512, true, false),
    ('van-hool-newag300',      'Van Hool NEWAG300',       513, true, false),
    ('van-hool-t9',            'Van Hool T9',             514, true, false),
    ('van-hool-tx',            'Van Hool TX',             515, true, false),
    ('van-hool-ex',            'Van Hool EX',             516, true, false),

    -- VDL -----------------------------------------------------------------
    ('vdl',                    'VDL',                     600, true, true),
    ('vdl-citea',              'VDL Citea',               610, true, false),
    ('vdl-futura',             'VDL Futura',              611, true, false)
on conflict (slug) do update set
    name       = excluded.name,
    sort_order = excluded.sort_order,
    is_active  = excluded.is_active,
    is_popular = excluded.is_popular;

-- ============================================================================
-- Verify:
--   select slug, name, sort_order, is_popular from public.vehicle_makes
--    where slug in ('man','mercedes-benz','iveco-crossway','van-hool','vdl')
--       or name ilike '%lion%' or name ilike '%vdl%' or name ilike '%van hool%'
--    order by sort_order;
--
--   select count(*) from public.vehicle_makes where is_active = true;
-- ============================================================================
