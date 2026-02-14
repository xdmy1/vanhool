-- ============================================
-- INTER BUS: Replace all categories
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Unlink products from old categories, then remove all categories
UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL;
DELETE FROM categories WHERE parent_id IS NOT NULL;
DELETE FROM categories WHERE parent_id IS NULL;

-- Step 2: Insert 12 main (parent) categories
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active) VALUES
  (gen_random_uuid(), 'Brakes', 'Frâne', 'Тормоза', 'brakes', NULL, 1, true),
  (gen_random_uuid(), 'Air Pressure', 'Presiune Aer', 'Пневматика', 'air-pressure', NULL, 2, true),
  (gen_random_uuid(), 'Chassis & Suspension', 'Sasiu & Suspensie', 'Шасси и подвеска', 'chassis-suspension', NULL, 3, true),
  (gen_random_uuid(), 'Electro', 'Electro', 'Электрика', 'electro', NULL, 4, true),
  (gen_random_uuid(), 'Engine & Extension', 'Motor & Extensie', 'Двигатель и комплектующие', 'engine-extension', NULL, 5, true),
  (gen_random_uuid(), 'Clutch & Gearbox', 'Ambreiaj & Cutie de Viteze', 'Сцепление и КПП', 'clutch-gearbox', NULL, 6, true),
  (gen_random_uuid(), 'Steering & Axle Hubs', 'Direcție & Butuci Axe', 'Рулевое управление и ступицы', 'steering-axle-hubs', NULL, 7, true),
  (gen_random_uuid(), 'Bodywork', 'Caroserie', 'Кузов', 'bodywork', NULL, 8, true),
  (gen_random_uuid(), 'Air Conditioning & Heating', 'Aer Condiționat & Încălzire', 'Кондиционер и отопление', 'air-conditioning-heating', NULL, 9, true),
  (gen_random_uuid(), 'Interior', 'Interior', 'Интерьер', 'interior', NULL, 10, true),
  (gen_random_uuid(), 'Silicone Pipe', 'Țeavă Silicon', 'Силиконовые трубки', 'silicone-pipe', NULL, 11, true),
  (gen_random_uuid(), 'ABC Raufoss Air Couplings', 'Cuplaje Aer ABC Raufoss', 'Воздушные муфты ABC Raufoss', 'abc-raufoss-air-couplings', NULL, 12, true);

-- Step 3: Insert subcategories for BRAKES
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Brake Pads', 'Plăcuțe de Frână', 'Тормозные колодки', 'brake-pads', 1),
  ('Brake Discs', 'Discuri de Frână', 'Тормозные диски', 'brake-discs', 2),
  ('Brake Saddles', 'Șei de Frână', 'Тормозные суппорты', 'brake-saddles', 3),
  ('Brake Saddles & Accessories', 'Șei de Frână & Accesorii', 'Суппорты и аксессуары', 'brake-saddles-accessories', 4),
  ('Wear Indicators', 'Indicatori de Uzură', 'Индикаторы износа', 'wear-indicators', 5),
  ('Remcylinders', 'Cilindri de Frână', 'Тормозные цилиндры', 'remcylinders', 6),
  ('Brake Drums', 'Tamburi de Frână', 'Тормозные барабаны', 'brake-drums', 7),
  ('Brake Shoes & Accessories', 'Saboți de Frână & Accesorii', 'Тормозные колодки барабанные и аксессуары', 'brake-shoes-accessories', 8)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'brakes';

-- Step 4: Insert subcategories for AIR PRESSURE
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Compressors & Accessories', 'Compresoare & Accesorii', 'Компрессоры и аксессуары', 'compressors-accessories', 1),
  ('Valves', 'Supape', 'Клапаны', 'valves', 2),
  ('Air Couplings', 'Cuplaje Aer', 'Воздушные муфты', 'air-couplings', 3),
  ('Air Care', 'Îngrijire Aer', 'Обслуживание воздушной системы', 'air-care', 4),
  ('ABS-EBS', 'ABS-EBS', 'ABS-EBS', 'abs-ebs', 5)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'air-pressure';

-- Step 5: Insert subcategories for CHASSIS & SUSPENSION
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Shock Absorbers', 'Amortizoare', 'Амортизаторы', 'shock-absorbers', 1),
  ('Reaction Rod', 'Bară de Reacție', 'Реактивная тяга', 'reaction-rod', 2),
  ('Leaf Suspension', 'Suspensie cu Foi', 'Рессорная подвеска', 'leaf-suspension', 3),
  ('Air Suspension', 'Suspensie Pneumatică', 'Пневматическая подвеска', 'air-suspension', 4),
  ('Stabilization Triangle', 'Triunghi de Stabilizare', 'Стабилизирующий треугольник', 'stabilization-triangle', 5),
  ('Connection - Stabilization Rod', 'Conexiune - Bară de Stabilizare', 'Соединение - стабилизатор', 'connection-stabilization-rod', 6),
  ('Suspension', 'Suspensie', 'Подвеска', 'suspension', 7)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'chassis-suspension';

-- Step 6: Insert subcategories for ELECTRO
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Alternators', 'Alternatoare', 'Генераторы', 'alternators', 1),
  ('Starters', 'Startere', 'Стартеры', 'starters', 2),
  ('Batteries', 'Baterii', 'Аккумуляторы', 'batteries', 3),
  ('Exterior Lighting', 'Iluminare Exterioară', 'Наружное освещение', 'exterior-lighting', 4),
  ('Lighting Interior', 'Iluminare Interioară', 'Внутреннее освещение', 'lighting-interior', 5),
  ('Electro Accessories', 'Accesorii Electro', 'Электро аксессуары', 'electro-accessories', 6)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'electro';

-- Step 7: Insert subcategories for ENGINE & EXTENSION
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Cooling', 'Răcire', 'Охлаждение', 'cooling', 1),
  ('Distribution', 'Distribuție', 'Газораспределение', 'distribution', 2),
  ('Filters', 'Filtre', 'Фильтры', 'filters', 3),
  ('Turbo & Intercoolers', 'Turbo & Intercoolere', 'Турбины и интеркулеры', 'turbo-intercoolers', 4),
  ('Exhaust', 'Evacuare', 'Выхлоп', 'exhaust', 5),
  ('Ad Blue', 'Ad Blue', 'Ad Blue', 'ad-blue', 6),
  ('Motor', 'Motor', 'Двигатель', 'motor', 7),
  ('Filters Man Original', 'Filtre Man Original', 'Фильтры Man оригинал', 'filters-man-original', 8)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'engine-extension';

-- Step 8: Insert subcategories for CLUTCH & GEARBOX
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Link', 'Legătură', 'Звено', 'link', 1),
  ('Clutch Control', 'Control Ambreiaj', 'Управление сцеплением', 'clutch-control', 2),
  ('Gearbox', 'Cutie de Viteze', 'Коробка передач', 'gearbox', 3),
  ('Transmission', 'Transmisie', 'Трансмиссия', 'transmission', 4)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'clutch-gearbox';

-- Step 9: Insert subcategories for STEERING & AXLE HUBS
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Steering Dampers', 'Amortizoare de Direcție', 'Рулевые демпферы', 'steering-dampers', 1),
  ('Fusee', 'Fuzete', 'Поворотные кулаки', 'fusee', 2),
  ('Steering Rods', 'Bare de Direcție', 'Рулевые тяги', 'steering-rods', 3),
  ('Rail Bars', 'Bare Transversale', 'Поперечные тяги', 'rail-bars', 4),
  ('Hubs & Accessories', 'Butuci & Accesorii', 'Ступицы и аксессуары', 'hubs-accessories', 5),
  ('Wheelhouses', 'Carcasă Roți', 'Колёсные арки', 'wheelhouses', 6)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'steering-axle-hubs';

-- Step 10: Insert subcategories for BODYWORK
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Mirrors', 'Oglinzi', 'Зеркала', 'mirrors', 1),
  ('Windshield Wipers', 'Ștergătoare de Parbriz', 'Стеклоочистители', 'windshield-wipers', 2),
  ('Bumpers & Side Panels', 'Bare & Panouri Laterale', 'Бамперы и боковые панели', 'bumpers-side-panels', 3),
  ('Sheet Metal', 'Tablă', 'Листовой металл', 'sheet-metal', 4),
  ('Diamonds', 'Diamante', 'Алмазы', 'diamonds', 5),
  ('Roof Shutters', 'Obloane de Acoperiș', 'Люки крыши', 'roof-shutters', 6),
  ('Wheels & Rims', 'Roți & Jante', 'Колёса и диски', 'wheels-rims', 7)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'bodywork';

-- Step 11: Insert subcategories for AIR CONDITIONING & HEATING
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Air Conditioning', 'Aer Condiționat', 'Кондиционер', 'air-conditioning', 1),
  ('Heating', 'Încălzire', 'Отопление', 'heating', 2)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'air-conditioning-heating';

-- Step 12: Insert subcategories for INTERIOR
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Belts', 'Curele', 'Ремни', 'belts', 1),
  ('Chairs', 'Scaune', 'Сиденья', 'chairs', 2),
  ('Sanitary Facilities', 'Instalații Sanitare', 'Сантехника', 'sanitary-facilities', 3)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'interior';

-- Step 13: Insert subcategories for SILICONE PIPE
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Silicone Line Straight', 'Linie Silicon Dreaptă', 'Силиконовая трубка прямая', 'silicone-line-straight', 1),
  ('Silicone Pipe 90°', 'Țeavă Silicon 90°', 'Силиконовая труба 90°', 'silicone-pipe-90', 2),
  ('Silicone Pipe 135°', 'Țeavă Silicon 135°', 'Силиконовая труба 135°', 'silicone-pipe-135', 3),
  ('Silicone Pipe Socket', 'Mufă Țeavă Silicon', 'Силиконовая муфта', 'silicone-pipe-socket', 4),
  ('Silicone Pipe Special Shape', 'Țeavă Silicon Formă Specială', 'Силиконовая труба специальной формы', 'silicone-pipe-special-shape', 5),
  ('Silicone Pipe Straight Reduction', 'Reducție Dreaptă Silicon', 'Силиконовый переход прямой', 'silicone-pipe-straight-reduction', 6),
  ('Silicone Pipe Curved Reduction', 'Reducție Curbată Silicon', 'Силиконовый переход изогнутый', 'silicone-pipe-curved-reduction', 7),
  ('Clamping Tape', 'Bandă de Strângere', 'Зажимная лента', 'clamping-tape', 8)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'silicone-pipe';

-- Step 14: Insert subcategories for ABC RAUFOSS AIR COUPLINGS
INSERT INTO categories (id, name_en, name_ro, name_ru, slug, parent_id, sort_order, is_active)
SELECT gen_random_uuid(), sub.name_en, sub.name_ro, sub.name_ru, sub.slug, p.id, sub.sort_order, true
FROM (VALUES
  ('Push In New Line', 'Push In Linie Nouă', 'Push In новая линия', 'push-in-new-line', 1),
  ('Push In Wireless', 'Push In Wireless', 'Push In беспроводной', 'push-in-wireless', 2),
  ('Shot Coupling', 'Cuplaj Shot', 'Быстроразъёмная муфта', 'shot-coupling', 3),
  ('Swivel', 'Swivel', 'Шарнир', 'swivel', 4),
  ('Rotolock', 'Rotolock', 'Rotolock', 'rotolock', 5),
  ('Push In 90° ABC', 'Push In 90° ABC', 'Push In 90° ABC', 'push-in-90-abc', 6),
  ('Transferor', 'Transferor', 'Переходник', 'transferor', 7),
  ('Coupling 45°', 'Cuplaj 45°', 'Муфта 45°', 'coupling-45', 8)
) AS sub(name_en, name_ro, name_ru, slug, sort_order)
CROSS JOIN categories p WHERE p.slug = 'abc-raufoss-air-couplings';

-- Verify results
SELECT
  CASE WHEN parent_id IS NULL THEN '📁 MAIN' ELSE '  └─ SUB' END as type,
  name_en, name_ro, name_ru, slug, sort_order
FROM categories
ORDER BY
  COALESCE(parent_id, id),
  CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
  sort_order;
