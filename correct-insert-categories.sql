-- Safe insert of all categories and subcategories for Van Hool Parts
-- Using correct column names (name_en, name_ro, name_ru)

-- First, let's insert main categories (parents) with ON CONFLICT handling
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
-- Main Categories
('Brake System', 'Sistem Frânare', 'Тормозная система', NULL, 'brake-system', 1),
('Air Pressure', 'Presiune Aer', 'Пневматическая система', NULL, 'air-pressure', 2),
('Chassis & Suspension', 'Șasiu și Suspensie', 'Шасси и подвеска', NULL, 'chassis-suspension', 3),
('Electrical', 'Sistem Electric', 'Электрическая система', NULL, 'electrical', 4),
('Cooling', 'Sistem Răcire', 'Система охлаждения', NULL, 'cooling', 5),
('Clutch and Gearbox', 'Ambreiaj și Cutie Viteze', 'Сцепление и коробка передач', NULL, 'clutch-gearbox', 6),
('Steering and Axles', 'Direcție și Punți', 'Рулевое управление и оси', NULL, 'steering-axles', 7),
('Bodywork', 'Caroserie', 'Кузов', NULL, 'bodywork', 8),
('HVAC', 'Încălzire Ventilație AC', 'Отопление вентиляция кондиционер', NULL, 'hvac', 9),
('Interior', 'Interior', 'Интерьер', NULL, 'interior', 10),
('Silicone Hose', 'Furtunuri Silicon', 'Силиконовые шланги', NULL, 'silicone-hose', 11),
('ABC Raufoss Air Couplings', 'Cuplaje Aer ABC Raufoss', 'Пневматические муфты ABC Raufoss', NULL, 'abc-raufoss-air-couplings', 12)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- Brake System subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Brake Pads', 'Plăcuțe Frână', 'Тормозные колодки', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-pads', 1),
('Brake Discs', 'Discuri Frână', 'Тормозные диски', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-discs', 2),
('Brake Calipers', 'Etrieri Frână', 'Тормозные суппорты', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-calipers', 3),
('Brake Calipers & Accessories', 'Etrieri Frână și Accesorii', 'Суппорты и аксессуары', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-calipers-accessories', 4),
('Wear Indicators', 'Indicatori Uzură', 'Индикаторы износа', (SELECT id FROM categories WHERE slug = 'brake-system'), 'wear-indicators', 5),
('Brake Cylinders', 'Cilindri Frână', 'Тормозные цилиндры', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-cylinders', 6),
('Brake Drums', 'Tamburi Frână', 'Тормозные барабаны', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-drums', 7),
('Brake Shoes & Accessories', 'Saboți Frână și Accesorii', 'Тормозные колодки и аксессуары', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-shoes-accessories', 8)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- Air Pressure subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Compressors & Accessories', 'Compresoare și Accesorii', 'Компрессоры и аксессуары', (SELECT id FROM categories WHERE slug = 'air-pressure'), 'compressors-accessories', 1),
('Valves', 'Valve', 'Клапаны', (SELECT id FROM categories WHERE slug = 'air-pressure'), 'valves', 2),
('Air Couplings', 'Cuplaje Aer', 'Пневматические муфты', (SELECT id FROM categories WHERE slug = 'air-pressure'), 'air-couplings', 3),
('Air Treatment', 'Tratarea Aerului', 'Обработка воздуха', (SELECT id FROM categories WHERE slug = 'air-pressure'), 'air-treatment', 4),
('ABS-EBS', 'ABS-EBS', 'АБС-ЕБС', (SELECT id FROM categories WHERE slug = 'air-pressure'), 'abs-ebs', 5)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- Chassis & Suspension subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Shock Absorbers', 'Amortizoare', 'Амортизаторы', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'shock-absorbers', 1),
('Reaction Rod', 'Tijă Reacție', 'Реактивная тяга', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'reaction-rod', 2),
('Leaf Spring', 'Arc Lamă', 'Листовая рессора', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'leaf-spring', 3),
('Air Suspension', 'Suspensie Pneumatică', 'Пневматическая подвеска', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'air-suspension', 4),
('Stabilizer Triangle', 'Triunghi Stabilizator', 'Стабилизирующий треугольник', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'stabilizer-triangle', 5),
('Connection – Stabilizer Bar', 'Conexiune – Bară Stabilizatoare', 'Соединение – стабилизатор', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'connection-stabilizer-bar', 6)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- Electrical subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Alternators', 'Alternatoare', 'Генераторы', (SELECT id FROM categories WHERE slug = 'electrical'), 'alternators', 1),
('Starters', 'Demaroare', 'Стартеры', (SELECT id FROM categories WHERE slug = 'electrical'), 'starters', 2),
('Batteries', 'Baterii', 'Батареи', (SELECT id FROM categories WHERE slug = 'electrical'), 'batteries', 3),
('Exterior Lighting', 'Iluminat Exterior', 'Наружное освещение', (SELECT id FROM categories WHERE slug = 'electrical'), 'exterior-lighting', 4),
('Interior Lighting', 'Iluminat Interior', 'Внутреннее освещение', (SELECT id FROM categories WHERE slug = 'electrical'), 'interior-lighting', 5),
('Electrical Accessories', 'Accesorii Electrice', 'Электрические аксессуары', (SELECT id FROM categories WHERE slug = 'electrical'), 'electrical-accessories', 6)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- Cooling subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Distribution', 'Distribuție', 'Распределение', (SELECT id FROM categories WHERE slug = 'cooling'), 'distribution', 1),
('Filters', 'Filtre', 'Фильтры', (SELECT id FROM categories WHERE slug = 'cooling'), 'filters', 2),
('Turbo & Intercoolers', 'Turbo și Intercoolere', 'Турбо и интеркулеры', (SELECT id FROM categories WHERE slug = 'cooling'), 'turbo-intercoolers', 3),
('Exhaust', 'Evacuare', 'Выхлопная система', (SELECT id FROM categories WHERE slug = 'cooling'), 'exhaust', 4),
('AdBlue', 'AdBlue', 'АдБлю', (SELECT id FROM categories WHERE slug = 'cooling'), 'adblue', 5),
('Engine', 'Motor', 'Двигатель', (SELECT id FROM categories WHERE slug = 'cooling'), 'engine', 6),
('Original MAN Filters', 'Filtre Originale MAN', 'Оригинальные фильтры MAN', (SELECT id FROM categories WHERE slug = 'cooling'), 'original-man-filters', 7)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- Clutch and Gearbox subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Clutch', 'Ambreiaj', 'Сцепление', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 'clutch', 1),
('Clutch Control', 'Control Ambreiaj', 'Управление сцеплением', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 'clutch-control', 2),
('Gearbox', 'Cutie Viteze', 'Коробка передач', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 'gearbox', 3),
('Transmission', 'Transmisie', 'Трансмиссия', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 'transmission', 4)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- Steering and Axles subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Steering Dampers', 'Amortizoare Direcție', 'Амортизаторы рулевого управления', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'steering-dampers', 1),
('Steering Knuckle', 'Fuzeta Direcție', 'Поворотный кулак', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'steering-knuckle', 2),
('Steering Rods', 'Tije Direcție', 'Рулевые тяги', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'steering-rods', 3),
('Track Rods', 'Tije Urmărire', 'Тяги рулевой трапеции', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'track-rods', 4),
('Hubs and Accessories', 'Butucuri și Accesorii', 'Ступицы и аксессуары', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'hubs-accessories', 5),
('Steering Gearboxes', 'Cutii Direcție', 'Рулевые механизмы', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'steering-gearboxes', 6)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- Bodywork subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Mirrors', 'Oglinzi', 'Зеркала', (SELECT id FROM categories WHERE slug = 'bodywork'), 'mirrors', 1),
('Wipers', 'Ștergătoare', 'Дворники', (SELECT id FROM categories WHERE slug = 'bodywork'), 'wipers', 2),
('Bumpers and Side Panels', 'Pare-șocuri și Panouri Laterale', 'Бамперы и боковые панели', (SELECT id FROM categories WHERE slug = 'bodywork'), 'bumpers-side-panels', 3),
('Sheet Metal', 'Tablă Caroserie', 'Листовой металл', (SELECT id FROM categories WHERE slug = 'bodywork'), 'sheet-metal', 4),
('Windows', 'Ferestre', 'Окна', (SELECT id FROM categories WHERE slug = 'bodywork'), 'windows', 5),
('Roof Hatches', 'Trapă Plafon', 'Люки крыши', (SELECT id FROM categories WHERE slug = 'bodywork'), 'roof-hatches', 6),
('Wheels and Rims', 'Roți și Jante', 'Колеса и диски', (SELECT id FROM categories WHERE slug = 'bodywork'), 'wheels-rims', 7)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- HVAC subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Air Conditioning', 'Aer Condiționat', 'Кондиционирование воздуха', (SELECT id FROM categories WHERE slug = 'hvac'), 'air-conditioning', 1),
('Heating', 'Încălzire', 'Отопление', (SELECT id FROM categories WHERE slug = 'hvac'), 'heating', 2)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- Interior subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Seatbelts', 'Centuri Siguranță', 'Ремни безопасности', (SELECT id FROM categories WHERE slug = 'interior'), 'seatbelts', 1),
('Seats', 'Scaune', 'Сиденья', (SELECT id FROM categories WHERE slug = 'interior'), 'seats', 2),
('Sanitary', 'Sanitare', 'Санитарные', (SELECT id FROM categories WHERE slug = 'interior'), 'sanitary', 3)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- Silicone Hose subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Silicone Hose Straight', 'Furtun Silicon Drept', 'Силиконовый шланг прямой', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-straight', 1),
('Silicone Hose 90°', 'Furtun Silicon 90°', 'Силиконовый шланг 90°', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-90', 2),
('Silicone Hose 135°', 'Furtun Silicon 135°', 'Силиконовый шланг 135°', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-135', 3),
('Silicone Hose Coupler', 'Cuplaj Furtun Silicon', 'Муфта силиконового шланга', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-coupler', 4),
('Silicone Hose Special Shape', 'Furtun Silicon Formă Specială', 'Силиконовый шланг особой формы', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-special-shape', 5),
('Silicone Hose Straight Reducer', 'Reductor Furtun Silicon Drept', 'Переходник прямого силиконового шланга', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-straight-reducer', 6),
('Silicone Hose Elbow Reducer', 'Reductor Furtun Silicon Cot', 'Переходник углового силиконового шланга', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-elbow-reducer', 7),
('Clamp', 'Clemă', 'Зажим', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'clamp', 8)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;

-- ABC Raufoss Air Couplings subcategories
INSERT INTO categories (name_en, name_ro, name_ru, parent_id, slug, sort_order) VALUES 
('Push-In New Line', 'Împingere Nouă Linie', 'Новая линия push-in', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'push-in-new-line', 1),
('Push-In Wireless', 'Împingere Fără Fir', 'Push-in беспроводной', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'push-in-wireless', 2),
('Bulkhead Coupling', 'Cuplaj Perete', 'Переборочная муфта', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'bulkhead-coupling', 3),
('Swivel', 'Pivotant', 'Поворотный', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'swivel', 4),
('Rotolock', 'Rotolock', 'Ротолок', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'rotolock', 5),
('Push-In 90° ABC', 'Împingere 90° ABC', 'Push-in 90° ABC', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'push-in-90-abc', 6),
('Connector', 'Conector', 'Соединитель', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'connector', 7),
('45° Coupling', 'Cuplaj 45°', 'Муфта 45°', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), '45-coupling', 8)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ro = EXCLUDED.name_ro,
    name_ru = EXCLUDED.name_ru,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order;