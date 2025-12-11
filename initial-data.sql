-- Initial Van Hool Categories Data
-- Insert main categories

-- Brake System
INSERT INTO categories (slug, name_en, name_ro, name_ru, sort_order) VALUES
('brake-system', 'Brake System', 'Sistem de Frânare', 'Тормозная система', 1);

-- Air Pressure
INSERT INTO categories (slug, name_en, name_ro, name_ru, sort_order) VALUES
('air-pressure', 'Air Pressure', 'Presiune Aer', 'Пневматическая система', 2);

-- Chassis & Suspension
INSERT INTO categories (slug, name_en, name_ro, name_ru, sort_order) VALUES
('chassis-suspension', 'Chassis & Suspension', 'Șasiu și Suspensie', 'Шасси и подвеска', 3);

-- Axles & Transmission
INSERT INTO categories (slug, name_en, name_ro, name_ru, sort_order) VALUES
('axles-transmission', 'Axles & Transmission', 'Punți și Transmisie', 'Мосты и трансмиссия', 4);

-- Body & Interior
INSERT INTO categories (slug, name_en, name_ro, name_ru, sort_order) VALUES
('body-interior', 'Body & Interior', 'Caroserie și Interior', 'Кузов и интерьер', 5);

-- Engine & Cooling
INSERT INTO categories (slug, name_en, name_ro, name_ru, sort_order) VALUES
('engine-cooling', 'Engine & Cooling', 'Motor și Răcire', 'Двигатель и охлаждение', 6);

-- Electrical System
INSERT INTO categories (slug, name_en, name_ro, name_ru, sort_order) VALUES
('electrical', 'Electrical System', 'Sistem Electric', 'Электрическая система', 7);

-- Now get the category IDs and insert subcategories
DO $$ 
DECLARE 
    brake_id UUID;
    air_id UUID;
    chassis_id UUID;
    axles_id UUID;
    body_id UUID;
    engine_id UUID;
    electrical_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO brake_id FROM categories WHERE slug = 'brake-system';
    SELECT id INTO air_id FROM categories WHERE slug = 'air-pressure';
    SELECT id INTO chassis_id FROM categories WHERE slug = 'chassis-suspension';
    SELECT id INTO axles_id FROM categories WHERE slug = 'axles-transmission';
    SELECT id INTO body_id FROM categories WHERE slug = 'body-interior';
    SELECT id INTO engine_id FROM categories WHERE slug = 'engine-cooling';
    SELECT id INTO electrical_id FROM categories WHERE slug = 'electrical';

    -- Brake System subcategories
    INSERT INTO categories (slug, name_en, name_ro, name_ru, parent_id, sort_order) VALUES
    ('brake-pads', 'Brake Pads', 'Plăcuțe Frână', 'Тормозные колодки', brake_id, 1),
    ('brake-discs', 'Brake Discs', 'Discuri Frână', 'Тормозные диски', brake_id, 2),
    ('brake-drums', 'Brake Drums', 'Tamburi Frână', 'Тормозные барабаны', brake_id, 3),
    ('brake-calipers', 'Brake Calipers', 'Etrieri Frână', 'Тормозные суппорты', brake_id, 4),
    ('brake-lines', 'Brake Lines', 'Conducte Frână', 'Тормозные трубки', brake_id, 5),
    ('brake-valves', 'Brake Valves', 'Valve Frână', 'Тормозные клапаны', brake_id, 6),
    ('hand-brake', 'Hand Brake', 'Frână de Mână', 'Ручной тормоз', brake_id, 7);

    -- Air Pressure subcategories
    INSERT INTO categories (slug, name_en, name_ro, name_ru, parent_id, sort_order) VALUES
    ('compressors', 'Compressors', 'Compresoare', 'Компрессоры', air_id, 1),
    ('air-tanks', 'Air Tanks', 'Rezervoare Aer', 'Воздушные баки', air_id, 2),
    ('air-dryers', 'Air Dryers', 'Uscătoare Aer', 'Осушители воздуха', air_id, 3),
    ('pressure-regulators', 'Pressure Regulators', 'Regulatoare Presiune', 'Регуляторы давления', air_id, 4),
    ('air-lines', 'Air Lines', 'Conducte Aer', 'Пневмолинии', air_id, 5),
    ('quick-release-valves', 'Quick Release Valves', 'Valve Evacuare Rapidă', 'Клапаны быстрого сброса', air_id, 6);

    -- Chassis & Suspension subcategories
    INSERT INTO categories (slug, name_en, name_ro, name_ru, parent_id, sort_order) VALUES
    ('shock-absorbers', 'Shock Absorbers', 'Amortizoare', 'Амортизаторы', chassis_id, 1),
    ('leaf-springs', 'Leaf Springs', 'Arcuri Lamelare', 'Рессоры', chassis_id, 2),
    ('air-suspension', 'Air Suspension', 'Suspensie Pneumatică', 'Пневмоподвеска', chassis_id, 3),
    ('stabilizer-bars', 'Stabilizer Bars', 'Bare Stabilizatoare', 'Стабилизаторы', chassis_id, 4),
    ('bushings', 'Bushings', 'Bucșe', 'Втулки', chassis_id, 5),
    ('chassis-components', 'Chassis Components', 'Componente Șasiu', 'Компоненты шасси', chassis_id, 6);

    -- Axles & Transmission subcategories
    INSERT INTO categories (slug, name_en, name_ro, name_ru, parent_id, sort_order) VALUES
    ('drive-axles', 'Drive Axles', 'Punți Motoare', 'Ведущие мосты', axles_id, 1),
    ('differentials', 'Differentials', 'Diferențiale', 'Дифференциалы', axles_id, 2),
    ('gearboxes', 'Gearboxes', 'Cutii de Viteze', 'Коробки передач', axles_id, 3),
    ('driveshafts', 'Driveshafts', 'Cardane', 'Карданные валы', axles_id, 4),
    ('clutches', 'Clutches', 'Ambreiaje', 'Сцепления', axles_id, 5),
    ('propeller-shafts', 'Propeller Shafts', 'Arbori Cardanic', 'Карданные валы', axles_id, 6);

    -- Body & Interior subcategories
    INSERT INTO categories (slug, name_en, name_ro, name_ru, parent_id, sort_order) VALUES
    ('doors-windows', 'Doors & Windows', 'Uși și Geamuri', 'Двери и окна', body_id, 1),
    ('seats', 'Seats', 'Scaune', 'Сиденья', body_id, 2),
    ('panels-trim', 'Panels & Trim', 'Panouri și Ornamente', 'Панели и отделка', body_id, 3),
    ('mirrors', 'Mirrors', 'Oglinzi', 'Зеркала', body_id, 4),
    ('lighting-interior', 'Interior Lighting', 'Iluminat Interior', 'Внутреннее освещение', body_id, 5),
    ('luggage-compartments', 'Luggage Compartments', 'Compartimente Bagaje', 'Багажные отделения', body_id, 6);

    -- Engine & Cooling subcategories
    INSERT INTO categories (slug, name_en, name_ro, name_ru, parent_id, sort_order) VALUES
    ('radiators', 'Radiators', 'Radiatoare', 'Радиаторы', engine_id, 1),
    ('cooling-fans', 'Cooling Fans', 'Ventilatoare Răcire', 'Вентиляторы охлаждения', engine_id, 2),
    ('water-pumps', 'Water Pumps', 'Pompe Apă', 'Водяные насосы', engine_id, 3),
    ('thermostats', 'Thermostats', 'Termostate', 'Термостаты', engine_id, 4),
    ('fuel-system', 'Fuel System', 'Sistem Combustibil', 'Топливная система', engine_id, 5),
    ('exhaust-system', 'Exhaust System', 'Sistem Evacuare', 'Выхлопная система', engine_id, 6),
    ('filters', 'Filters', 'Filtre', 'Фильтры', engine_id, 7);

    -- Electrical System subcategories
    INSERT INTO categories (slug, name_en, name_ro, name_ru, parent_id, sort_order) VALUES
    ('lighting-external', 'External Lighting', 'Iluminat Exterior', 'Внешнее освещение', electrical_id, 1),
    ('wiring-harnesses', 'Wiring Harnesses', 'Cablaje', 'Жгуты проводов', electrical_id, 2),
    ('switches-controls', 'Switches & Controls', 'Întrerupătoare și Comenzi', 'Переключатели и управление', electrical_id, 3),
    ('batteries', 'Batteries', 'Baterii', 'Аккумуляторы', electrical_id, 4),
    ('alternators-starters', 'Alternators & Starters', 'Alternatoare și Demaroare', 'Генераторы и стартеры', electrical_id, 5),
    ('sensors', 'Sensors', 'Senzori', 'Датчики', electrical_id, 6),
    ('fuses-relays', 'Fuses & Relays', 'Siguranțe și Relee', 'Предохранители и реле', electrical_id, 7);

END $$;

-- Sample products for demonstration
INSERT INTO products (slug, part_code, name_en, name_ro, name_ru, description_en, description_ro, description_ru, category_id, price, stock_quantity, is_featured) 
SELECT 
    'brake-pad-front-vanhool-' || REPLACE(c.slug, '-', ''),
    'VH-BP-F-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
    'Front Brake Pads Van Hool',
    'Plăcuțe Frână Față Van Hool',
    'Передние тормозные колодки Van Hool',
    'High-quality front brake pads specifically designed for Van Hool buses. OEM specification with excellent stopping power and durability.',
    'Plăcuțe de frână față de înaltă calitate special concepute pentru autobuzele Van Hool. Specificație OEM cu putere de frânare excelentă și durabilitate.',
    'Высококачественные передние тормозные колодки, специально разработанные для автобусов Van Hool. Спецификация OEM с отличной тормозной мощностью и долговечностью.',
    c.id,
    299.99,
    15,
    true
FROM categories c 
WHERE c.slug = 'brake-pads'
LIMIT 1;

INSERT INTO products (slug, part_code, name_en, name_ro, name_ru, description_en, description_ro, description_ru, category_id, price, stock_quantity) 
SELECT 
    'air-compressor-vanhool-ag9',
    'VH-AC-AG9-001',
    'Air Compressor Van Hool AG9',
    'Compresor Aer Van Hool AG9',
    'Воздушный компрессор Van Hool AG9',
    'Original air compressor for Van Hool AG9 series buses. Essential component for pneumatic brake and suspension systems.',
    'Compresor de aer original pentru autobuzele Van Hool seria AG9. Componentă esențială pentru sistemele pneumatice de frânare și suspensie.',
    'Оригинальный воздушный компрессор для автобусов Van Hool серии AG9. Важный компонент для пневматических тормозных систем и подвески.',
    c.id,
    1299.99,
    5
FROM categories c 
WHERE c.slug = 'compressors'
LIMIT 1;

INSERT INTO products (slug, part_code, name_en, name_ro, name_ru, description_en, description_ro, description_ru, category_id, price, stock_quantity, is_featured) 
SELECT 
    'shock-absorber-rear-vanhool',
    'VH-SA-R-002',
    'Rear Shock Absorber Van Hool',
    'Amortizor Spate Van Hool',
    'Задний амортизатор Van Hool',
    'Heavy-duty rear shock absorber for Van Hool buses. Provides excellent ride comfort and vehicle stability.',
    'Amortizor spate pentru serviciu greu pentru autobuzele Van Hool. Oferă confort excelent la conducere și stabilitate a vehiculului.',
    'Задний амортизатор для тяжелых условий эксплуатации для автобусов Van Hool. Обеспечивает отличный комфорт езды и устойчивость автомобиля.',
    c.id,
    459.99,
    8,
    true
FROM categories c 
WHERE c.slug = 'shock-absorbers'
LIMIT 1;

-- Create first admin user (replace with your actual email)
-- This should be run after first user registration through Supabase Auth
-- UPDATE profiles SET is_admin = true WHERE email = 'your-admin-email@example.com';