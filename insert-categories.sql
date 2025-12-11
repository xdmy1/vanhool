-- Insert all categories and subcategories for Van Hool Parts
-- Clear existing categories first
DELETE FROM categories;

-- Insert main categories and subcategories
INSERT INTO categories (name, parent_id, slug) VALUES 
-- Brake System
('Brake System', NULL, 'brake-system'),
('Brake Pads', (SELECT id FROM categories WHERE name = 'Brake System'), 'brake-pads'),
('Brake Discs', (SELECT id FROM categories WHERE name = 'Brake System'), 'brake-discs'),
('Brake Calipers', (SELECT id FROM categories WHERE name = 'Brake System'), 'brake-calipers'),
('Brake Calipers & Accessories', (SELECT id FROM categories WHERE name = 'Brake System'), 'brake-calipers-accessories'),
('Wear Indicators', (SELECT id FROM categories WHERE name = 'Brake System'), 'wear-indicators'),
('Brake Cylinders', (SELECT id FROM categories WHERE name = 'Brake System'), 'brake-cylinders'),
('Brake Drums', (SELECT id FROM categories WHERE name = 'Brake System'), 'brake-drums'),
('Brake Shoes & Accessories', (SELECT id FROM categories WHERE name = 'Brake System'), 'brake-shoes-accessories'),

-- Air Pressure
('Air Pressure', NULL, 'air-pressure'),
('Compressors & Accessories', (SELECT id FROM categories WHERE name = 'Air Pressure'), 'compressors-accessories'),
('Valves', (SELECT id FROM categories WHERE name = 'Air Pressure'), 'valves'),
('Air Couplings', (SELECT id FROM categories WHERE name = 'Air Pressure'), 'air-couplings'),
('Air Treatment', (SELECT id FROM categories WHERE name = 'Air Pressure'), 'air-treatment'),
('ABS-EBS', (SELECT id FROM categories WHERE name = 'Air Pressure'), 'abs-ebs'),

-- Chassis & Suspension
('Chassis & Suspension', NULL, 'chassis-suspension'),
('Shock Absorbers', (SELECT id FROM categories WHERE name = 'Chassis & Suspension'), 'shock-absorbers'),
('Reaction Rod', (SELECT id FROM categories WHERE name = 'Chassis & Suspension'), 'reaction-rod'),
('Leaf Spring', (SELECT id FROM categories WHERE name = 'Chassis & Suspension'), 'leaf-spring'),
('Air Suspension', (SELECT id FROM categories WHERE name = 'Chassis & Suspension'), 'air-suspension'),
('Stabilizer Triangle', (SELECT id FROM categories WHERE name = 'Chassis & Suspension'), 'stabilizer-triangle'),
('Connection – Stabilizer Bar', (SELECT id FROM categories WHERE name = 'Chassis & Suspension'), 'connection-stabilizer-bar'),

-- Electrical
('Electrical', NULL, 'electrical'),
('Alternators', (SELECT id FROM categories WHERE name = 'Electrical'), 'alternators'),
('Starters', (SELECT id FROM categories WHERE name = 'Electrical'), 'starters'),
('Batteries', (SELECT id FROM categories WHERE name = 'Electrical'), 'batteries'),
('Exterior Lighting', (SELECT id FROM categories WHERE name = 'Electrical'), 'exterior-lighting'),
('Interior Lighting', (SELECT id FROM categories WHERE name = 'Electrical'), 'interior-lighting'),
('Electrical Accessories', (SELECT id FROM categories WHERE name = 'Electrical'), 'electrical-accessories'),

-- Cooling
('Cooling', NULL, 'cooling'),
('Distribution', (SELECT id FROM categories WHERE name = 'Cooling'), 'distribution'),
('Filters', (SELECT id FROM categories WHERE name = 'Cooling'), 'filters'),
('Turbo & Intercoolers', (SELECT id FROM categories WHERE name = 'Cooling'), 'turbo-intercoolers'),
('Exhaust', (SELECT id FROM categories WHERE name = 'Cooling'), 'exhaust'),
('AdBlue', (SELECT id FROM categories WHERE name = 'Cooling'), 'adblue'),
('Engine', (SELECT id FROM categories WHERE name = 'Cooling'), 'engine'),
('Original MAN Filters', (SELECT id FROM categories WHERE name = 'Cooling'), 'original-man-filters'),

-- Clutch and Gearbox
('Clutch and Gearbox', NULL, 'clutch-gearbox'),
('Clutch', (SELECT id FROM categories WHERE name = 'Clutch and Gearbox'), 'clutch'),
('Clutch Control', (SELECT id FROM categories WHERE name = 'Clutch and Gearbox'), 'clutch-control'),
('Gearbox', (SELECT id FROM categories WHERE name = 'Clutch and Gearbox'), 'gearbox'),
('Transmission', (SELECT id FROM categories WHERE name = 'Clutch and Gearbox'), 'transmission'),

-- Steering and Axles
('Steering and Axles', NULL, 'steering-axles'),
('Steering Dampers', (SELECT id FROM categories WHERE name = 'Steering and Axles'), 'steering-dampers'),
('Steering Knuckle', (SELECT id FROM categories WHERE name = 'Steering and Axles'), 'steering-knuckle'),
('Steering Rods', (SELECT id FROM categories WHERE name = 'Steering and Axles'), 'steering-rods'),
('Track Rods', (SELECT id FROM categories WHERE name = 'Steering and Axles'), 'track-rods'),
('Hubs and Accessories', (SELECT id FROM categories WHERE name = 'Steering and Axles'), 'hubs-accessories'),
('Steering Gearboxes', (SELECT id FROM categories WHERE name = 'Steering and Axles'), 'steering-gearboxes'),

-- Bodywork
('Bodywork', NULL, 'bodywork'),
('Mirrors', (SELECT id FROM categories WHERE name = 'Bodywork'), 'mirrors'),
('Wipers', (SELECT id FROM categories WHERE name = 'Bodywork'), 'wipers'),
('Bumpers and Side Panels', (SELECT id FROM categories WHERE name = 'Bodywork'), 'bumpers-side-panels'),
('Sheet Metal', (SELECT id FROM categories WHERE name = 'Bodywork'), 'sheet-metal'),
('Windows', (SELECT id FROM categories WHERE name = 'Bodywork'), 'windows'),
('Roof Hatches', (SELECT id FROM categories WHERE name = 'Bodywork'), 'roof-hatches'),
('Wheels and Rims', (SELECT id FROM categories WHERE name = 'Bodywork'), 'wheels-rims'),

-- HVAC
('HVAC', NULL, 'hvac'),
('Air Conditioning', (SELECT id FROM categories WHERE name = 'HVAC'), 'air-conditioning'),
('Heating', (SELECT id FROM categories WHERE name = 'HVAC'), 'heating'),

-- Interior
('Interior', NULL, 'interior'),
('Seatbelts', (SELECT id FROM categories WHERE name = 'Interior'), 'seatbelts'),
('Seats', (SELECT id FROM categories WHERE name = 'Interior'), 'seats'),
('Sanitary', (SELECT id FROM categories WHERE name = 'Interior'), 'sanitary'),

-- Silicone Hose
('Silicone Hose', NULL, 'silicone-hose'),
('Silicone Hose Straight', (SELECT id FROM categories WHERE name = 'Silicone Hose'), 'silicone-hose-straight'),
('Silicone Hose 90°', (SELECT id FROM categories WHERE name = 'Silicone Hose'), 'silicone-hose-90'),
('Silicone Hose 135°', (SELECT id FROM categories WHERE name = 'Silicone Hose'), 'silicone-hose-135'),
('Silicone Hose Coupler', (SELECT id FROM categories WHERE name = 'Silicone Hose'), 'silicone-hose-coupler'),
('Silicone Hose Special Shape', (SELECT id FROM categories WHERE name = 'Silicone Hose'), 'silicone-hose-special-shape'),
('Silicone Hose Straight Reducer', (SELECT id FROM categories WHERE name = 'Silicone Hose'), 'silicone-hose-straight-reducer'),
('Silicone Hose Elbow Reducer', (SELECT id FROM categories WHERE name = 'Silicone Hose'), 'silicone-hose-elbow-reducer'),
('Clamp', (SELECT id FROM categories WHERE name = 'Silicone Hose'), 'clamp'),

-- ABC Raufoss Air Couplings
('ABC Raufoss Air Couplings', NULL, 'abc-raufoss-air-couplings'),
('Push-In New Line', (SELECT id FROM categories WHERE name = 'ABC Raufoss Air Couplings'), 'push-in-new-line'),
('Push-In Wireless', (SELECT id FROM categories WHERE name = 'ABC Raufoss Air Couplings'), 'push-in-wireless'),
('Bulkhead Coupling', (SELECT id FROM categories WHERE name = 'ABC Raufoss Air Couplings'), 'bulkhead-coupling'),
('Swivel', (SELECT id FROM categories WHERE name = 'ABC Raufoss Air Couplings'), 'swivel'),
('Rotolock', (SELECT id FROM categories WHERE name = 'ABC Raufoss Air Couplings'), 'rotolock'),
('Push-In 90° ABC', (SELECT id FROM categories WHERE name = 'ABC Raufoss Air Couplings'), 'push-in-90-abc'),
('Connector', (SELECT id FROM categories WHERE name = 'ABC Raufoss Air Couplings'), 'connector'),
('45° Coupling', (SELECT id FROM categories WHERE name = 'ABC Raufoss Air Couplings'), '45-coupling');