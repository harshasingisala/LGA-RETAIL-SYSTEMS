-- ============================================================
-- LGA RETAIL SYSTEMS — Seed Data (replaces sampleData.js)
-- Run AFTER 001_core_schema.sql
-- ============================================================

insert into public.products (sku, barcode, name, category, unit, unit_price, cost_price, gst_rate, hsn_code, stock, reorder_level, max_stock) values
  ('P-1001', '8901030748041', 'Clinic Plus Shampoo 175ml',     'Shampoos',       'bottle', 95,  72,  18, '3305',  42, 20, 120),
  ('P-1002', '8901234567890', 'Head & Shoulders 180ml',        'Shampoos',       'bottle', 185, 140, 18, '3305',  18, 20, 100),
  ('P-1003', '8901030025025', 'Dove Soap 100g',                'Soaps',          'bar',    62,  45,  18, '3401',  96, 30, 200),
  ('P-1004', '8901030040325', 'Lux Soap 100g',                 'Soaps',          'bar',    42,  30,  18, '3401',  24, 30, 200),
  ('P-1005', '8901696165052', 'Fortune Sunflower Oil 1L',      'Oils',           'pouch', 145, 118,   5, '1512',  36, 24, 150),
  ('P-1006', '8901765120070', 'Freedom Refined Oil 1L',        'Oils',           'pouch', 138, 112,   5, '1512',  12, 24, 150),
  ('P-1007', '8901058805685', 'Maggi 2-Minute Noodles 70g',   'Noodles',        'pack',   14,  10,  18, '1902', 180, 60, 500),
  ('P-1008', '8901725131163', 'Yippee Noodles 70g',           'Noodles',        'pack',   15,  11,  18, '1902',  52, 60, 500),
  ('P-1009', '8901120013786', 'Tata Tea Premium 250g',         'Tea/Coffee',     'pack',  155, 120,   5, '0902',  34, 20, 150),
  ('P-1010', '8901725103375', 'Bru Instant Coffee 100g',       'Tea/Coffee',     'jar',   245, 190,  18, '2101',  14, 15, 80),
  ('P-1011', '8901826100078', 'Parle-G Biscuit 250g',          'Snacks',         'pack',   35,  26,  18, '1905', 140, 50, 400),
  ('P-1012', '8901737005038', 'Lays Classic Salted 52g',       'Snacks',         'pack',   20,  14,  18, '2008',  48, 50, 300),
  ('P-1013', '8901030837538', 'Surf Excel Detergent 1kg',      'Cleaning',       'pack',  225, 175,  18, '3402',  28, 18, 100),
  ('P-1014', '8901485003018', 'Harpic Bathroom Cleaner 500ml', 'Cleaning',       'bottle',105,  78,  18, '3402',  16, 18, 80),
  ('P-1015', '8901030952018', 'Colgate Strong Teeth 200g',     'Personal Care',  'tube',  125,  92,  18, '3306',  44, 15, 120),
  ('P-1016', '8901030008062', 'Ponds Cold Cream 100ml',        'Personal Care',  'jar',   165, 124,  18, '3304',  11, 15, 80),
  ('P-1017', '8906001900031', 'India Gate Rice 5kg',           'Staples',        'bag',   520, 430,   5, '1006',  62, 50, 200),
  ('P-1018', '8901719130670', 'Aashirvaad Atta 5kg',           'Staples',        'bag',   245, 198,   5, '1101',  38, 50, 200),
  ('P-1019', '8901030862999', 'Tata Salt 1kg',                 'Staples',        'pack',   28,  20,   5, '2501',  90, 50, 400),
  ('P-1020', '8901120060032', 'Red Label Tea 500g',            'Tea/Coffee',     'pack',  315, 248,   5, '0902',  22, 20, 120),
  ('P-1021', '8901030834026', 'Vim Dishwash Bar 300g',         'Cleaning',       'bar',    30,  22,  18, '3402',  58, 25, 200),
  ('P-1022', '8901726022017', 'Good Day Cashew 200g',          'Snacks',         'pack',   45,  33,  18, '1905',  64, 40, 200);
