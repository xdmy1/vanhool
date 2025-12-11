-- Update categories with Van Hool specific categories and subcategories
-- Run this in your Supabase SQL editor

-- Clear existing categories
DELETE FROM categories;

-- Insert main categories with subcategories

-- Brake System
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Brake System', 'Sistem Frânare', 'Тормозная система', 'brake-system', 1);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Brake Pads', 'Plăcuțe Frână', 'Тормозные колодки', 'brake-pads', (SELECT id FROM categories WHERE slug = 'brake-system'), 1),
('Brake Discs', 'Discuri Frână', 'Тормозные диски', 'brake-discs', (SELECT id FROM categories WHERE slug = 'brake-system'), 2),
('Brake Calipers', 'Etrieri Frână', 'Тормозные суппорты', 'brake-calipers', (SELECT id FROM categories WHERE slug = 'brake-system'), 3),
('Brake Calipers & Accessories', 'Etrieri Frână & Accesorii', 'Суппорты и аксессуары', 'brake-calipers-accessories', (SELECT id FROM categories WHERE slug = 'brake-system'), 4),
('Wear Indicators', 'Indicatori Uzură', 'Индикаторы износа', 'wear-indicators', (SELECT id FROM categories WHERE slug = 'brake-system'), 5),
('Brake Cylinders', 'Cilindri Frână', 'Тормозные цилиндры', 'brake-cylinders', (SELECT id FROM categories WHERE slug = 'brake-system'), 6),
('Brake Drums', 'Tamburi Frână', 'Тормозные барабаны', 'brake-drums', (SELECT id FROM categories WHERE slug = 'brake-system'), 7),
('Brake Shoes & Accessories', 'Saboti Frână & Accesorii', 'Тормозные колодки и аксессуары', 'brake-shoes-accessories', (SELECT id FROM categories WHERE slug = 'brake-system'), 8);

-- Air Pressure
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Air Pressure', 'Presiune Aer', 'Пневматика', 'air-pressure', 2);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Compressors & Accessories', 'Compresoare & Accesorii', 'Компрессоры и аксессуары', 'compressors-accessories', (SELECT id FROM categories WHERE slug = 'air-pressure'), 1),
('Valves', 'Supape', 'Клапаны', 'valves', (SELECT id FROM categories WHERE slug = 'air-pressure'), 2),
('Air Couplings', 'Cuplaje Pneumatice', 'Пневмосоединения', 'air-couplings', (SELECT id FROM categories WHERE slug = 'air-pressure'), 3),
('Air Treatment', 'Tratare Aer', 'Обработка воздуха', 'air-treatment', (SELECT id FROM categories WHERE slug = 'air-pressure'), 4),
('ABS-EBS', 'ABS-EBS', 'АБС-ЕБС', 'abs-ebs', (SELECT id FROM categories WHERE slug = 'air-pressure'), 5);

-- Chassis & Suspension
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Chassis & Suspension', 'Șasiu & Suspensie', 'Шасси и подвеска', 'chassis-suspension', 3);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Shock Absorbers', 'Amortizoare', 'Амортизаторы', 'shock-absorbers', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 1),
('Reaction Rod', 'Bară Reacție', 'Реактивная тяга', 'reaction-rod', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 2),
('Leaf Spring', 'Arc Lamelar', 'Рессора', 'leaf-spring', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 3),
('Air Suspension', 'Suspensie Pneumatică', 'Пневмоподвеска', 'air-suspension', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 4),
('Stabilizer Triangle', 'Triunghi Stabilizator', 'Треугольник стабилизатора', 'stabilizer-triangle', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 5),
('Connection – Stabilizer Bar', 'Conexiune – Bară Stabilizator', 'Соединение – стабилизатор', 'connection-stabilizer-bar', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 6);

-- Electrical
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Electrical', 'Sistem Electric', 'Электрооборудование', 'electrical', 4);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Alternators', 'Alternatoare', 'Генераторы', 'alternators', (SELECT id FROM categories WHERE slug = 'electrical'), 1),
('Starters', 'Demaroare', 'Стартеры', 'starters', (SELECT id FROM categories WHERE slug = 'electrical'), 2),
('Batteries', 'Baterii', 'Батареи', 'batteries', (SELECT id FROM categories WHERE slug = 'electrical'), 3),
('Exterior Lighting', 'Iluminat Exterior', 'Наружное освещение', 'exterior-lighting', (SELECT id FROM categories WHERE slug = 'electrical'), 4),
('Interior Lighting', 'Iluminat Interior', 'Внутреннее освещение', 'interior-lighting', (SELECT id FROM categories WHERE slug = 'electrical'), 5),
('Electrical Accessories', 'Accesorii Electrice', 'Электрические аксессуары', 'electrical-accessories', (SELECT id FROM categories WHERE slug = 'electrical'), 6);

-- Cooling
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Cooling', 'Răcire', 'Охлаждение', 'cooling', 5);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Cooling', 'Răcire', 'Охлаждение', 'cooling-sub', (SELECT id FROM categories WHERE slug = 'cooling'), 1),
('Distribution', 'Distribuție', 'Газораспределение', 'distribution', (SELECT id FROM categories WHERE slug = 'cooling'), 2),
('Filters', 'Filtre', 'Фильтры', 'filters', (SELECT id FROM categories WHERE slug = 'cooling'), 3),
('Turbo & Intercoolers', 'Turbo & Intercooler', 'Турбо и интеркулеры', 'turbo-intercoolers', (SELECT id FROM categories WHERE slug = 'cooling'), 4),
('Exhaust', 'Evacuare', 'Выхлопная система', 'exhaust', (SELECT id FROM categories WHERE slug = 'cooling'), 5),
('AdBlue', 'AdBlue', 'AdBlue', 'adblue', (SELECT id FROM categories WHERE slug = 'cooling'), 6),
('Engine', 'Motor', 'Двигатель', 'engine', (SELECT id FROM categories WHERE slug = 'cooling'), 7),
('Original MAN Filters', 'Filtre Originale MAN', 'Оригинальные фильтры MAN', 'original-man-filters', (SELECT id FROM categories WHERE slug = 'cooling'), 8);

-- Clutch & Gearbox
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Clutch & Gearbox', 'Ambreiaj & Cutie Viteze', 'Сцепление и КПП', 'clutch-gearbox', 6);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Clutch', 'Ambreiaj', 'Сцепление', 'clutch', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 1),
('Clutch Control', 'Control Ambreiaj', 'Управление сцеплением', 'clutch-control', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 2),
('Gearbox', 'Cutie Viteze', 'Коробка передач', 'gearbox', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 3),
('Transmission', 'Transmisie', 'Трансмиссия', 'transmission', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 4);

-- Steering & Axles
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Steering & Axles', 'Direcție & Punți', 'Рулевое управление и оси', 'steering-axles', 7);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Steering Dampers', 'Amortizoare Direcție', 'Рулевые демпферы', 'steering-dampers', (SELECT id FROM categories WHERE slug = 'steering-axles'), 1),
('Steering Knuckle', 'Articulație Direcție', 'Поворотный кулак', 'steering-knuckle', (SELECT id FROM categories WHERE slug = 'steering-axles'), 2),
('Steering Rods', 'Tije Direcție', 'Рулевые тяги', 'steering-rods', (SELECT id FROM categories WHERE slug = 'steering-axles'), 3),
('Track Rods', 'Tije Urmărire', 'Рулевые тяги', 'track-rods', (SELECT id FROM categories WHERE slug = 'steering-axles'), 4),
('Hubs & Accessories', 'Butucuri & Accesorii', 'Ступицы и аксессуары', 'hubs-accessories', (SELECT id FROM categories WHERE slug = 'steering-axles'), 5),
('Steering Gearboxes', 'Cutii Direcție', 'Рулевые редукторы', 'steering-gearboxes', (SELECT id FROM categories WHERE slug = 'steering-axles'), 6);

-- Bodywork
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Bodywork', 'Caroserie', 'Кузов', 'bodywork', 8);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Mirrors', 'Oglinzi', 'Зеркала', 'mirrors', (SELECT id FROM categories WHERE slug = 'bodywork'), 1),
('Wipers', 'Ștergătoare', 'Стеклоочистители', 'wipers', (SELECT id FROM categories WHERE slug = 'bodywork'), 2),
('Bumpers & Side Panels', 'Pare-șocuri & Panouri', 'Бамперы и боковые панели', 'bumpers-side-panels', (SELECT id FROM categories WHERE slug = 'bodywork'), 3),
('Sheet Metal', 'Tablă', 'Листовой металл', 'sheet-metal', (SELECT id FROM categories WHERE slug = 'bodywork'), 4),
('Windows', 'Geamuri', 'Окна', 'windows', (SELECT id FROM categories WHERE slug = 'bodywork'), 5),
('Roof Hatches', 'Trapă Plafon', 'Люки крыши', 'roof-hatches', (SELECT id FROM categories WHERE slug = 'bodywork'), 6),
('Wheels & Rims', 'Roți & Jante', 'Колеса и диски', 'wheels-rims', (SELECT id FROM categories WHERE slug = 'bodywork'), 7);

-- HVAC
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('HVAC', 'Climatizare', 'ОВКВ', 'hvac', 9);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Air Conditioning', 'Aer Condiționat', 'Кондиционирование воздуха', 'air-conditioning', (SELECT id FROM categories WHERE slug = 'hvac'), 1),
('Heating', 'Încălzire', 'Отопление', 'heating', (SELECT id FROM categories WHERE slug = 'hvac'), 2);

-- Interior
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Interior', 'Interior', 'Салон', 'interior', 10);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Seatbelts', 'Centuri Siguranță', 'Ремни безопасности', 'seatbelts', (SELECT id FROM categories WHERE slug = 'interior'), 1),
('Seats', 'Scaune', 'Сиденья', 'seats', (SELECT id FROM categories WHERE slug = 'interior'), 2),
('Sanitary', 'Sanitare', 'Санитария', 'sanitary', (SELECT id FROM categories WHERE slug = 'interior'), 3);

-- Silicone Hose
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('Silicone Hose', 'Furtun Silicon', 'Силиконовые шланги', 'silicone-hose', 11);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Silicone Hose Straight', 'Furtun Silicon Drept', 'Прямые силиконовые шланги', 'silicone-hose-straight', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 1),
('Silicone Hose 90°', 'Furtun Silicon 90°', 'Силиконовые шланги 90°', 'silicone-hose-90', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 2),
('Silicone Hose 135°', 'Furtun Silicon 135°', 'Силиконовые шланги 135°', 'silicone-hose-135', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 3),
('Silicone Hose Coupler', 'Cuplaj Furtun Silicon', 'Соединители силиконовых шлангов', 'silicone-hose-coupler', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 4),
('Silicone Hose Special Shape', 'Furtun Silicon Formă Specială', 'Специальные силиконовые шланги', 'silicone-hose-special-shape', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 5),
('Silicone Hose Straight Reducer', 'Reductor Furtun Silicon Drept', 'Прямые редукторы силиконовых шлангов', 'silicone-hose-straight-reducer', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 6),
('Silicone Hose Elbow Reducer', 'Reductor Furtun Silicon Cot', 'Угловые редукторы силиконовых шлангов', 'silicone-hose-elbow-reducer', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 7),
('Clamp', 'Colier', 'Хомут', 'clamp', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 8);

-- ABC Raufoss Air Couplings
INSERT INTO categories (name_en, name_ro, name_ru, slug, sort_order) VALUES 
('ABC Raufoss Air Couplings', 'Cuplaje Pneumatice ABC Raufoss', 'Пневмосоединения ABC Raufoss', 'abc-raufoss-air-couplings', 12);

INSERT INTO categories (name_en, name_ro, name_ru, slug, parent_id, sort_order) VALUES 
('Push-In New Line', 'Push-In New Line', 'Push-In New Line', 'push-in-new-line', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 1),
('Push-In Wireless', 'Push-In Wireless', 'Push-In Wireless', 'push-in-wireless', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 2),
('Bulkhead Coupling', 'Cuplaj Bulkhead', 'Bulkhead Coupling', 'bulkhead-coupling', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 3),
('Swivel', 'Swivel', 'Swivel', 'swivel', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 4),
('Rotolock', 'Rotolock', 'Rotolock', 'rotolock', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 5),
('Push-In 90° ABC', 'Push-In 90° ABC', 'Push-In 90° ABC', 'push-in-90-abc', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 6),
('Connector', 'Conector', 'Соединитель', 'connector', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 7),
('45° Coupling', 'Cuplaj 45°', 'Соединение 45°', 'coupling-45', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 8);