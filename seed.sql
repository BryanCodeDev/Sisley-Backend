-- Seed data for Sisley
-- This file is intended to be run manually after migrations
-- It does NOT contain demo/test data

-- Clean up existing products
DELETE FROM `product_images` WHERE `product_id` IN (
  SELECT `id` FROM `products` WHERE `sku` LIKE 'AIR-%'
);

DELETE FROM `products` WHERE `sku` LIKE 'AIR-%';

-- Insert seed users (1 per role, password: Admin1012@)
INSERT IGNORE INTO `users` (`first_name`, `last_name`, `email`, `password_hash`, `role_id`, `is_active`, `email_verified`) VALUES
('Admin', 'Sisley', 'admin@sisley.com', '$2a$12$kzlsqHY/QgEcOxqnX22zv.P1h.oRrupoNzW.2jBDdUfy5lAu1nRyi', 1, TRUE, TRUE),
('User', 'Test', 'user@sisley.com', '$2a$12$kzlsqHY/QgEcOxqnX22zv.P1h.oRrupoNzW.2jBDdUfy5lAu1nRyi', 2, TRUE, TRUE),
('Guest', 'Test', 'guest@sisley.com', '$2a$12$kzlsqHY/QgEcOxqnX22zv.P1h.oRrupoNzW.2jBDdUfy5lAu1nRyi', 3, TRUE, FALSE);

-- Insert AirPods products
INSERT INTO `products` (
  `category_id`, `brand_id`, `name`, `slug`, `sku`, `short_description`, `description`,
  `specifications`, `features`, `warranty`, `price`, `original_price`, `discount_percent`,
  `cost_price`, `stock`, `min_stock`, `weight`, `dimensions`, `is_active`, `is_featured`,
  `is_new`, `is_on_sale`, `sale_starts_at`, `sale_ends_at`, `meta_title`, `meta_description`
) VALUES
(1, 1, 'AirPods Pro 2', 'airpods-pro-2', 'AIR-PRO-001',
 'Sonido que te envuelve. Excelente calidad de sonido, gran duración de batería y carga USB-C.',
 '<p>AirPods Pro 2 con cancelación de ruido activa, modo transparencia y diseño ergonómico. Sonido envolvente, batería de larga duración y carga USB-C.</p>',
 JSON_OBJECT('Tipo', 'In-ear', 'Conectividad', 'Bluetooth 5.3', 'Batería', '6 horas', 'Cancelación', 'Activos', 'Carga', 'USB-C'),
 JSON_ARRAY('Cancelación de ruido', 'Modo transparencia', 'Carga USB-C', 'Batería 6h', 'Micrófono HD'),
 '12 meses', 89900, 119900, 25, 62930, 20, 5, 0.05, '5 x 4 x 2 cm',
 TRUE, TRUE, FALSE, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY),
 'AirPods Pro 2', 'AirPods Pro 2 con cancelación de ruido activa y carga USB-C.'),

(1, 1, 'AirPods 4', 'airpods-4', 'AIR-STD-001',
 'Diseño renovado con sonido de alta calidad, gran duración de batería y carga USB-C.',
 '<p>AirPods 4 con diseño renovado, sonido de alta fidelidad y comodidad superior. Gran duración de batería y carga USB-C.</p>',
 JSON_OBJECT('Tipo', 'In-ear', 'Conectividad', 'Bluetooth 5.3', 'Batería', '5 horas', 'Carga', 'USB-C'),
 JSON_ARRAY('Sonido de alta calidad', 'Batería 5h', 'Carga USB-C', 'Diseño renovado', 'Ligero'),
 '12 meses', 99900, 129900, 23, 69930, 20, 5, 0.04, '4.5 x 3.5 x 2 cm',
 TRUE, TRUE, FALSE, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY),
 'AirPods 4', 'AirPods 4 con diseño renovado y carga USB-C.'),

(1, 1, 'AirPods Pro 3', 'airpods-pro-3', 'AIR-PRO-003',
 'Más que unos audífonos. Experiencia premium, excelente sonido, batería de larga duración y carga USB-C.',
 '<p>AirPods Pro 3: la experiencia premium definitiva. Excelente sonido, cancelación de ruido avanzada, batería de larga duración y carga USB-C.</p>',
 JSON_OBJECT('Tipo', 'In-ear', 'Conectividad', 'Bluetooth 5.3', 'Batería', '8 horas', 'Cancelación', 'Avanzada', 'Carga', 'USB-C'),
 JSON_ARRAY('Cancelación de ruido avanzada', 'Batería 8h', 'Carga USB-C', 'Experiencia premium', 'Micrófono HD'),
 '12 meses', 119900, 149900, 20, 83930, 20, 5, 0.05, '5 x 4 x 2 cm',
 TRUE, TRUE, FALSE, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY),
 'AirPods Pro 3', 'AirPods Pro 3 con experiencia premium y carga USB-C.');

-- Note: Product images should be managed through the admin interface or Cloudinary uploads.
-- Default image: /assets/images/producto1.webp
