-- Safe insert of all categories and subcategories for Van Hool Parts
-- This script handles existing data by using UPSERT operations

-- First, let's insert main categories (parents) with ON CONFLICT handling
INSERT INTO categories (name, parent_id, slug) VALUES 
-- Main Categories
('Brake System', NULL, 'brake-system'),
('Air Pressure', NULL, 'air-pressure'),
('Chassis & Suspension', NULL, 'chassis-suspension'),
('Electrical', NULL, 'electrical'),
('Cooling', NULL, 'cooling'),
('Clutch and Gearbox', NULL, 'clutch-gearbox'),
('Steering and Axles', NULL, 'steering-axles'),
('Bodywork', NULL, 'bodywork'),
('HVAC', NULL, 'hvac'),
('Interior', NULL, 'interior'),
('Silicone Hose', NULL, 'silicone-hose'),
('ABC Raufoss Air Couplings', NULL, 'abc-raufoss-air-couplings')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- Now insert subcategories for each main category
-- Brake System subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Brake Pads', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-pads'),
('Brake Discs', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-discs'),
('Brake Calipers', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-calipers'),
('Brake Calipers & Accessories', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-calipers-accessories'),
('Wear Indicators', (SELECT id FROM categories WHERE slug = 'brake-system'), 'wear-indicators'),
('Brake Cylinders', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-cylinders'),
('Brake Drums', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-drums'),
('Brake Shoes & Accessories', (SELECT id FROM categories WHERE slug = 'brake-system'), 'brake-shoes-accessories')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- Air Pressure subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Compressors & Accessories', (SELECT id FROM categories WHERE slug = 'air-pressure'), 'compressors-accessories'),
('Valves', (SELECT id FROM categories WHERE slug = 'air-pressure'), 'valves'),
('Air Couplings', (SELECT id FROM categories WHERE slug = 'air-pressure'), 'air-couplings'),
('Air Treatment', (SELECT id FROM categories WHERE slug = 'air-pressure'), 'air-treatment'),
('ABS-EBS', (SELECT id FROM categories WHERE slug = 'air-pressure'), 'abs-ebs')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- Chassis & Suspension subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Shock Absorbers', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'shock-absorbers'),
('Reaction Rod', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'reaction-rod'),
('Leaf Spring', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'leaf-spring'),
('Air Suspension', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'air-suspension'),
('Stabilizer Triangle', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'stabilizer-triangle'),
('Connection – Stabilizer Bar', (SELECT id FROM categories WHERE slug = 'chassis-suspension'), 'connection-stabilizer-bar')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- Electrical subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Alternators', (SELECT id FROM categories WHERE slug = 'electrical'), 'alternators'),
('Starters', (SELECT id FROM categories WHERE slug = 'electrical'), 'starters'),
('Batteries', (SELECT id FROM categories WHERE slug = 'electrical'), 'batteries'),
('Exterior Lighting', (SELECT id FROM categories WHERE slug = 'electrical'), 'exterior-lighting'),
('Interior Lighting', (SELECT id FROM categories WHERE slug = 'electrical'), 'interior-lighting'),
('Electrical Accessories', (SELECT id FROM categories WHERE slug = 'electrical'), 'electrical-accessories')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- Cooling subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Distribution', (SELECT id FROM categories WHERE slug = 'cooling'), 'distribution'),
('Filters', (SELECT id FROM categories WHERE slug = 'cooling'), 'filters'),
('Turbo & Intercoolers', (SELECT id FROM categories WHERE slug = 'cooling'), 'turbo-intercoolers'),
('Exhaust', (SELECT id FROM categories WHERE slug = 'cooling'), 'exhaust'),
('AdBlue', (SELECT id FROM categories WHERE slug = 'cooling'), 'adblue'),
('Engine', (SELECT id FROM categories WHERE slug = 'cooling'), 'engine'),
('Original MAN Filters', (SELECT id FROM categories WHERE slug = 'cooling'), 'original-man-filters')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- Clutch and Gearbox subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Clutch', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 'clutch'),
('Clutch Control', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 'clutch-control'),
('Gearbox', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 'gearbox'),
('Transmission', (SELECT id FROM categories WHERE slug = 'clutch-gearbox'), 'transmission')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- Steering and Axles subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Steering Dampers', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'steering-dampers'),
('Steering Knuckle', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'steering-knuckle'),
('Steering Rods', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'steering-rods'),
('Track Rods', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'track-rods'),
('Hubs and Accessories', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'hubs-accessories'),
('Steering Gearboxes', (SELECT id FROM categories WHERE slug = 'steering-axles'), 'steering-gearboxes')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- Bodywork subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Mirrors', (SELECT id FROM categories WHERE slug = 'bodywork'), 'mirrors'),
('Wipers', (SELECT id FROM categories WHERE slug = 'bodywork'), 'wipers'),
('Bumpers and Side Panels', (SELECT id FROM categories WHERE slug = 'bodywork'), 'bumpers-side-panels'),
('Sheet Metal', (SELECT id FROM categories WHERE slug = 'bodywork'), 'sheet-metal'),
('Windows', (SELECT id FROM categories WHERE slug = 'bodywork'), 'windows'),
('Roof Hatches', (SELECT id FROM categories WHERE slug = 'bodywork'), 'roof-hatches'),
('Wheels and Rims', (SELECT id FROM categories WHERE slug = 'bodywork'), 'wheels-rims')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- HVAC subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Air Conditioning', (SELECT id FROM categories WHERE slug = 'hvac'), 'air-conditioning'),
('Heating', (SELECT id FROM categories WHERE slug = 'hvac'), 'heating')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- Interior subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Seatbelts', (SELECT id FROM categories WHERE slug = 'interior'), 'seatbelts'),
('Seats', (SELECT id FROM categories WHERE slug = 'interior'), 'seats'),
('Sanitary', (SELECT id FROM categories WHERE slug = 'interior'), 'sanitary')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- Silicone Hose subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Silicone Hose Straight', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-straight'),
('Silicone Hose 90°', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-90'),
('Silicone Hose 135°', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-135'),
('Silicone Hose Coupler', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-coupler'),
('Silicone Hose Special Shape', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-special-shape'),
('Silicone Hose Straight Reducer', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-straight-reducer'),
('Silicone Hose Elbow Reducer', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'silicone-hose-elbow-reducer'),
('Clamp', (SELECT id FROM categories WHERE slug = 'silicone-hose'), 'clamp')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;

-- ABC Raufoss Air Couplings subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
('Push-In New Line', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'push-in-new-line'),
('Push-In Wireless', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'push-in-wireless'),
('Bulkhead Coupling', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'bulkhead-coupling'),
('Swivel', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'swivel'),
('Rotolock', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'rotolock'),
('Push-In 90° ABC', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'push-in-90-abc'),
('Connector', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), 'connector'),
('45° Coupling', (SELECT id FROM categories WHERE slug = 'abc-raufoss-air-couplings'), '45-coupling')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id;