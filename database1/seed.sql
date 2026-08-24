-- ============================================================
-- SISLEY COLOMBIA - DATOS DE DEMOSTRACIÓN COMPLETOS
-- seed.sql
-- ============================================================
-- IMPORTANTE: Datos ficticios para demostración.
-- Contraseñas: admin123 / manager123 / staff123 / cliente123
-- Hash bcrypt: $2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_status_history;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE shipping_addresses;
TRUNCATE TABLE customers;
TRUNCATE TABLE product_images;
TRUNCATE TABLE inventory;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE warehouses;
TRUNCATE TABLE stores;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE shipping_methods;
TRUNCATE TABLE settings;
TRUNCATE TABLE users;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- ROLES (3)
-- ============================================================

INSERT INTO roles (id, name, description, is_system) VALUES
(1, 'ADMIN', 'Administrador del sistema', 1),
(2, 'MANAGER', 'Gerente / Supervisor', 0),
(3, 'STAFF', 'Empleado / Vendedor', 0);

-- ============================================================
-- PERMISOS (15 + 6 extra = 21 totales)
-- ============================================================

INSERT INTO permissions (id, name, module, action, description) VALUES
(1, 'users.create', 'users', 'create', 'Crear usuarios'),
(2, 'users.read', 'users', 'read', 'Leer usuarios'),
(3, 'users.update', 'users', 'update', 'Actualizar usuarios'),
(4, 'users.delete', 'users', 'delete', 'Eliminar usuarios'),
(5, 'products.create', 'products', 'create', 'Crear productos'),
(6, 'products.read', 'products', 'read', 'Leer productos'),
(7, 'products.update', 'products', 'update', 'Actualizar productos'),
(8, 'products.delete', 'products', 'delete', 'Eliminar productos'),
(9, 'categories.create', 'categories', 'create', 'Crear categorías'),
(10, 'categories.read', 'categories', 'read', 'Leer categorías'),
(11, 'categories.update', 'categories', 'update', 'Actualizar categorías'),
(12, 'categories.delete', 'categories', 'delete', 'Eliminar categorías'),
(13, 'orders.read', 'orders', 'read', 'Leer pedidos'),
(14, 'orders.update', 'orders', 'update', 'Actualizar pedidos'),
(15, 'inventory.read', 'inventory', 'read', 'Leer inventario'),
(16, 'inventory.update', 'inventory', 'update', 'Actualizar inventario'),
(17, 'customers.read', 'customers', 'read', 'Leer clientes'),
(18, 'customers.create', 'customers', 'create', 'Crear clientes'),
(19, 'customers.update', 'customers', 'update', 'Actualizar clientes'),
(20, 'reports.read', 'reports', 'read', 'Leer reportes'),
(21, 'settings.update', 'settings', 'update', 'Actualizar configuración');

-- ============================================================
-- ROLE_PERMISSIONS (40 asignaciones)
-- ============================================================

-- ADMIN: todos (1-21)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
(1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15),
(1, 16), (1, 17), (1, 18), (1, 19), (1, 20), (1, 21);

-- MANAGER: products(5,6,7), orders(13,14), inventory(15,16), reports(20), users(1,2,3), categories(9,10,11), customers(17,18,19)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3),
(2, 5), (2, 6), (2, 7),
(2, 9), (2, 10), (2, 11),
(2, 13), (2, 14),
(2, 15), (2, 16),
(2, 17), (2, 18), (2, 19),
(2, 20);

-- STAFF: read y update en products, orders, inventory, categories
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 6), (3, 7),
(3, 10), (3, 11),
(3, 13), (3, 14),
(3, 15), (3, 16);

-- ============================================================
-- USUARIOS (3)
-- ============================================================

INSERT INTO users (id, email, password_hash, first_name, last_name, role_id, phone, status, last_login_at) VALUES
(1, 'admin@sisley-demo.com', '$2b$10$uTygenO6s8oROBm6wcjSfurV4Dn.C.uvDyK/ttspH6BwzC.DuRsGG', 'Admin', 'Sisley', 1, '+573000000000', 'active', NOW()),
(2, 'manager@sisley-demo.com', '$2b$10$cCCAFIarDaH7XTxJs.qpY.5Zw1MW.AEuQRvoyLB3sWBgjF6VRG8Xq', 'María', 'González', 2, '+573100000001', 'active', NOW()),
(3, 'staff@sisley-demo.com', '$2b$10$pgVSwrIUGqoYkfQHC8BAoOxu2tv2x6tHKjt0vtY5O03BNGVdWz5bS', 'Carlos', 'Rodríguez', 3, '+573100000002', 'active', NULL);

-- ============================================================
-- SUCURSALES (3)
-- ============================================================

INSERT INTO stores (id, name, address, city, department, phone, email, status) VALUES
(1, 'Sisley Bogotá', 'Calle 100 # 15 - 20', 'Bogotá', 'Cundinamarca', '+5715000000', 'bogota@sisley-demo.com', 'active'),
(2, 'Sisley Mosquera', 'Carrera 5 # 10 - 30', 'Mosquera', 'Cundinamarca', '+5716000000', 'mosquera@sisley-demo.com', 'active'),
(3, 'Sisley Funza', 'Calle 8 # 12 - 45', 'Funza', 'Cundinamarca', '+5717000000', 'funza@sisley-demo.com', 'active');

-- ============================================================
-- BODEGAS (3)
-- ============================================================

INSERT INTO warehouses (id, name, store_id, address, status) VALUES
(1, 'Bodega Central Bogotá', 1, 'Calle 100 # 15 - 20', 'active'),
(2, 'Bodega Mosquera', 2, 'Carrera 5 # 10 - 30', 'active'),
(3, 'Bodega Funza', 3, 'Calle 8 # 12 - 45', 'active');

-- ============================================================
-- CATEGORÍAS (7)
-- ============================================================

INSERT INTO categories (id, name, slug, description, image_url, status, position) VALUES
(1, 'Mujer', 'mujer', 'Colección completa para mujer. Prendas atemporales y elegantes.', '/assets/catalog/blusa-satinada.webp', 'active', 1),
(2, 'Hombre', 'hombre', 'Colección completa para hombre. Estilo y sofisticación.', '/assets/catalog/pantalon-wide-leg.webp', 'active', 2),
(3, 'Nueva Colección', 'nueva-coleccion', 'Lo más reciente de Sisley. Tendencias actuales.', '/assets/catalog/Hero-Nueva-Colección.webp', 'active', 3),
(4, 'Ofertas', 'ofertas', 'Ofertas especiales por tiempo limitado.', '/assets/catalog/vestido-midi-plisado.webp', 'active', 4),
(5, 'Accesorios', 'accesorios', 'Complementos para completar tu look.', '/assets/catalog/1.webp', 'active', 5),
(6, 'Denim', 'denim', 'Jeans y prendas en denim de la mejor calidad.', '/assets/catalog/2.webp', 'active', 6),
(7, 'Outerwear', 'outerwear', 'Abrigos y chaquetas para todas las temporadas.', '/assets/catalog/3.webp', 'active', 7);

-- ============================================================
-- PRODUCTOS (30)
-- ============================================================

INSERT INTO products (id, name, slug, description, price, sku, category_id, status, featured, created_at) VALUES
-- Mujer (IDs 1-12)
(1, 'Blusa Satinada Elegante', 'blusa-satinada-elegante', 'Blusa satinada con acabado premium. Corte fluido y elegante, perfecta para ocasiones especiales.', 385000.00, 'SIS-MUJ-001', 1, 'active', 1, NOW()),
(2, 'Pantalón Wide Leg', 'pantalon-wide-leg', 'Pantalón de pierna ancha con tiro alto. Silueta moderna y favorecedora.', 465000.00, 'SIS-MUJ-002', 1, 'active', 1, NOW()),
(3, 'Vestido Midi Plisado', 'vestido-midi-plisado', 'Vestido midi con falda plisada. Diseño femenino y romántico.', 520000.00, 'SIS-MUJ-003', 1, 'active', 1, NOW()),
(4, 'Chaqueta Oversized', 'chaqueta-oversized', 'Chaqueta de corte oversized. Silueta relajada y moderna.', 680000.00, 'SIS-MUJ-004', 1, 'active', 0, NOW()),
(5, 'Falda Lápiz Premium', 'falda-lapiz-premium', 'Falda lápiz de longitud por debajo de la rodilla. Tejido elástico.', 345000.00, 'SIS-MUJ-005', 1, 'active', 0, NOW()),
(6, 'Cropped Top Tejido', 'cropped-top-tejido', 'Top cropped en tejido de punto. Corte ajustado y moderno.', 225000.00, 'SIS-MUJ-006', 1, 'active', 1, NOW()),
(7, 'Cardigan Clásico', 'cardigan-clasico', 'Cardigan clásico en punto fino. Cierre con botones forrados.', 395000.00, 'SIS-MUJ-007', 1, 'active', 0, NOW()),
(8, 'Vestido Camisero', 'vestido-camisero', 'Vestido estilo camisa con cierre de botones. Cinturón desprendible.', 485000.00, 'SIS-MUJ-008', 1, 'active', 1, NOW()),
(9, 'Pantalón Sastre', 'pantalon-sastre', 'Pantalón sastre de vestir con raya marcada. Bolsillos laterales.', 425000.00, 'SIS-MUJ-009', 1, 'active', 0, NOW()),
(10, 'Sweater Cachemir', 'sweater-cachemir', 'Sweater en mezcla de cachemir y lana. Tejido suave y ligero.', 580000.00, 'SIS-MUJ-010', 1, 'active', 1, NOW()),
(11, 'Blusa Asimétrica', 'blusa-asimetrica', 'Blusa con corte asimétrico en el cuello. Manga larga acampanada.', 355000.00, 'SIS-MUJ-011', 1, 'active', 0, NOW()),
(12, 'Mono Enterito', 'mono-enterito', 'Mono enterito de largo completo. Tirantes ajustables.', 540000.00, 'SIS-MUJ-012', 1, 'active', 1, NOW()),
-- Hombre (IDs 13-22)
(13, 'Camisa Oxford Slim', 'camisa-oxford-slim', 'Camisa Oxford en algodón premium. Corte slim fit favorecedor.', 295000.00, 'SIS-HOM-001', 2, 'active', 1, NOW()),
(14, 'Pantalón Chino Stretch', 'pantalon-chino-stretch', 'Pantalón chino con stretch. Corte slim con raya.', 345000.00, 'SIS-HOM-002', 2, 'active', 0, NOW()),
(15, 'Blazer Unstructured', 'blazer-unstructured', 'Blazer sin estructura rígida. Perfecto para looks smart-casual.', 720000.00, 'SIS-HOM-003', 2, 'active', 1, NOW()),
(16, 'Polo Piqué Clásico', 'polo-pique-clasico', 'Polo en algodón piqué de primera calidad. Corte regular fit.', 195000.00, 'SIS-HOM-004', 2, 'active', 0, NOW()),
(17, 'Jeans Tapered Fit', 'jeans-tapered-fit', 'Jeans de corte tapered. Denim elástico de alta calidad.', 385000.00, 'SIS-HOM-005', 2, 'active', 1, NOW()),
(18, 'Chaqueta Bomber', 'chaqueta-bomber', 'Chaqueta bomber moderna con forro interior. Estilo urbano.', 595000.00, 'SIS-HOM-006', 2, 'active', 1, NOW()),
(19, 'Sweater V Ribbed', 'sweater-v-ribbed', 'Sweater de cuello V con textura ribbed. Slim fit favorecedor.', 345000.00, 'SIS-HOM-007', 2, 'active', 0, NOW()),
(20, 'Camisa Linen', 'camisa-linen', 'Camisa 100% lino. Tejido transpirable ideal para clima cálido.', 365000.00, 'SIS-HOM-008', 2, 'active', 0, NOW()),
(21, 'Pantalón Jogger Premium', 'pantalon-jogger-premium', 'Jogger premium en tejido técnico. Cintura elástica con cordón.', 285000.00, 'SIS-HOM-009', 2, 'active', 0, NOW()),
(22, 'Abrigo Peacoat', 'abrigo-peacoat', 'Abrigo estilo peacoat en mezcla de lana. Doble botonadura.', 890000.00, 'SIS-HOM-010', 2, 'active', 1, NOW()),
-- Accesorios (IDs 23-27)
(23, 'Cinturón Cuero Premium', 'cinturon-cuero-premium', 'Cinturón en cuero genuino italiano. Hebilla metálica pulida.', 245000.00, 'SIS-ACC-001', 5, 'active', 0, NOW()),
(24, 'Billetera Compacta', 'billetera-compacta', 'Billetera compacta en cuero. Múltiples compartimentos.', 185000.00, 'SIS-ACC-002', 5, 'active', 0, NOW()),
(25, 'Pañuelo Seda Natural', 'panuelo-seda-natural', 'Pañuelo en seda natural 100%. Estampado exclusivo Sisley.', 320000.00, 'SIS-ACC-003', 5, 'active', 1, NOW()),
(26, 'Gorra Logo Bordado', 'gorra-logo-bordado', 'Gorra de algodón con logo bordado. Cierre ajustable.', 145000.00, 'SIS-ACC-004', 5, 'active', 0, NOW()),
(27, 'Gafas de Sol Aviador', 'gafas-sol-aviador', 'Gafas de sol estilo aviador. Lentes polarizadas UV400.', 425000.00, 'SIS-ACC-005', 5, 'active', 1, NOW()),
-- Nueva Colección (IDs 28-30)
(28, 'Blazer Oversized Satin', 'blazer-oversized-satin', 'Blazer oversized con solapas de satín. De la nueva colección.', 820000.00, 'SIS-NC-001', 3, 'active', 1, NOW()),
(29, 'Vestido Cut-Out', 'vestido-cut-out', 'Vestido con detalles cut-out en cintura. Colección cápsula.', 595000.00, 'SIS-NC-002', 3, 'active', 1, NOW()),
(30, 'Pantalón Cargo Luxe', 'pantalon-cargo-luxe', 'Pantalón cargo versión premium. Estilo utilitario refinado.', 485000.00, 'SIS-NC-003', 3, 'active', 1, NOW());

-- ============================================================
-- VARIANTES DE PRODUCTO (150)
-- Stock: 5 con 0, 8 con 1-3, resto 4-20
-- ============================================================

INSERT INTO product_variants (id, product_id, sku, price, color, size, stock, status) VALUES
-- P1: Blusa Satinada (6)
(1, 1, 'SIS-MUJ-001-BLA-XS', 385000.00, 'Blanco', 'XS', 5, 'active'),
(2, 1, 'SIS-MUJ-001-BLA-S', 385000.00, 'Blanco', 'S', 8, 'active'),
(3, 1, 'SIS-MUJ-001-BLA-M', 385000.00, 'Blanco', 'M', 0, 'active'),
(4, 1, 'SIS-MUJ-001-NEG-S', 385000.00, 'Negro', 'S', 3, 'active'),
(5, 1, 'SIS-MUJ-001-NEG-M', 385000.00, 'Negro', 'M', 12, 'active'),
(6, 1, 'SIS-MUJ-001-NEG-L', 385000.00, 'Negro', 'L', 7, 'active'),
-- P2: Pantalón Wide Leg (5)
(7, 2, 'SIS-MUJ-002-NEG-S', 465000.00, 'Negro', 'S', 6, 'active'),
(8, 2, 'SIS-MUJ-002-NEG-M', 465000.00, 'Negro', 'M', 10, 'active'),
(9, 2, 'SIS-MUJ-002-BEI-S', 465000.00, 'Beige', 'S', 2, 'active'),
(10, 2, 'SIS-MUJ-002-BEI-M', 465000.00, 'Beige', 'M', 9, 'active'),
(11, 2, 'SIS-MUJ-002-BEI-L', 465000.00, 'Beige', 'L', 0, 'active'),
-- P3: Vestido Midi (5)
(12, 3, 'SIS-MUJ-003-NEG-XS', 520000.00, 'Negro', 'XS', 4, 'active'),
(13, 3, 'SIS-MUJ-003-NEG-S', 520000.00, 'Negro', 'S', 7, 'active'),
(14, 3, 'SIS-MUJ-003-CAM-S', 520000.00, 'Camel', 'S', 1, 'active'),
(15, 3, 'SIS-MUJ-003-CAM-M', 520000.00, 'Camel', 'M', 5, 'active'),
(16, 3, 'SIS-MUJ-003-CAM-L', 520000.00, 'Camel', 'L', 3, 'active'),
-- P4: Chaqueta Oversized (5)
(17, 4, 'SIS-MUJ-004-GRI-S', 680000.00, 'Gris', 'S', 8, 'active'),
(18, 4, 'SIS-MUJ-004-GRI-M', 680000.00, 'Gris', 'M', 0, 'active'),
(19, 4, 'SIS-MUJ-004-GRI-L', 680000.00, 'Gris', 'L', 6, 'active'),
(20, 4, 'SIS-MUJ-004-NEG-M', 680000.00, 'Negro', 'M', 11, 'active'),
(21, 4, 'SIS-MUJ-004-NEG-L', 680000.00, 'Negro', 'L', 4, 'active'),
-- P5: Falda Lápiz (4)
(22, 5, 'SIS-MUJ-005-NEG-S', 345000.00, 'Negro', 'S', 7, 'active'),
(23, 5, 'SIS-MUJ-005-NEG-M', 345000.00, 'Negro', 'M', 9, 'active'),
(24, 5, 'SIS-MUJ-005-AZS-S', 345000.00, 'Azul Marino', 'S', 2, 'active'),
(25, 5, 'SIS-MUJ-005-AZS-M', 345000.00, 'Azul Marino', 'M', 5, 'active'),
-- P6: Cropped Top (4)
(26, 6, 'SIS-MUJ-006-BLA-S', 225000.00, 'Blanco', 'S', 10, 'active'),
(27, 6, 'SIS-MUJ-006-BLA-M', 225000.00, 'Blanco', 'M', 14, 'active'),
(28, 6, 'SIS-MUJ-006-NEG-S', 225000.00, 'Negro', 'S', 6, 'active'),
(29, 6, 'SIS-MUJ-006-NEG-M', 225000.00, 'Negro', 'M', 0, 'active'),
-- P7: Cardigan (4)
(30, 7, 'SIS-MUJ-007-CRR-XS', 395000.00, 'Crema', 'XS', 8, 'active'),
(31, 7, 'SIS-MUJ-007-CRR-S', 395000.00, 'Crema', 'S', 11, 'active'),
(32, 7, 'SIS-MUJ-007-BEI-M', 395000.00, 'Beige', 'M', 4, 'active'),
(33, 7, 'SIS-MUJ-007-GRI-S', 395000.00, 'Gris', 'S', 7, 'active'),
-- P8: Vestido Camisero (5)
(34, 8, 'SIS-MUJ-008-BLA-XS', 485000.00, 'Blanco', 'XS', 5, 'active'),
(35, 8, 'SIS-MUJ-008-BLA-S', 485000.00, 'Blanco', 'S', 9, 'active'),
(36, 8, 'SIS-MUJ-008-AZS-M', 485000.00, 'Azul', 'M', 1, 'active'),
(37, 8, 'SIS-MUJ-008-AZS-L', 485000.00, 'Azul', 'L', 6, 'active'),
(38, 8, 'SIS-MUJ-008-NEG-S', 485000.00, 'Negro', 'S', 3, 'active'),
-- P9: Pantalón Sastre (5)
(39, 9, 'SIS-MUJ-009-NEG-S', 425000.00, 'Negro', 'S', 7, 'active'),
(40, 9, 'SIS-MUJ-009-NEG-M', 425000.00, 'Negro', 'M', 10, 'active'),
(41, 9, 'SIS-MUJ-009-GRI-S', 425000.00, 'Gris', 'S', 4, 'active'),
(42, 9, 'SIS-MUJ-009-GRI-M', 425000.00, 'Gris', 'M', 8, 'active'),
(43, 9, 'SIS-MUJ-009-BEI-M', 425000.00, 'Beige', 'M', 2, 'active'),
-- P10: Sweater Cachemir (4)
(44, 10, 'SIS-MUJ-010-CRR-S', 580000.00, 'Crema', 'S', 6, 'active'),
(45, 10, 'SIS-MUJ-010-CRR-M', 580000.00, 'Crema', 'M', 9, 'active'),
(46, 10, 'SIS-MUJ-010-NEG-S', 580000.00, 'Negro', 'S', 0, 'active'),
(47, 10, 'SIS-MUJ-010-NEG-M', 580000.00, 'Negro', 'M', 5, 'active'),
-- P11: Blusa Asimétrica (4)
(48, 11, 'SIS-MUJ-011-BLA-S', 355000.00, 'Blanco', 'S', 8, 'active'),
(49, 11, 'SIS-MUJ-011-BLA-M', 355000.00, 'Blanco', 'M', 12, 'active'),
(50, 11, 'SIS-MUJ-011-ROS-S', 355000.00, 'Rosa', 'S', 4, 'active'),
(51, 11, 'SIS-MUJ-011-ROS-M', 355000.00, 'Rosa', 'M', 7, 'active'),
-- P12: Mono Enterito (4)
(52, 12, 'SIS-MUJ-012-NEG-S', 540000.00, 'Negro', 'S', 5, 'active'),
(53, 12, 'SIS-MUJ-012-NEG-M', 540000.00, 'Negro', 'M', 9, 'active'),
(54, 12, 'SIS-MUJ-012-VER-S', 540000.00, 'Verde', 'S', 3, 'active'),
(55, 12, 'SIS-MUJ-012-VER-M', 540000.00, 'Verde', 'M', 6, 'active'),
-- P13: Camisa Oxford (6)
(56, 13, 'SIS-HOM-001-BLA-S', 295000.00, 'Blanco', 'S', 12, 'active'),
(57, 13, 'SIS-HOM-001-BLA-M', 295000.00, 'Blanco', 'M', 15, 'active'),
(58, 13, 'SIS-HOM-001-BLA-L', 295000.00, 'Blanco', 'L', 8, 'active'),
(59, 13, 'SIS-HOM-001-AZL-M', 295000.00, 'Azul', 'M', 10, 'active'),
(60, 13, 'SIS-HOM-001-AZL-L', 295000.00, 'Azul', 'L', 0, 'active'),
(61, 13, 'SIS-HOM-001-AZL-XL', 295000.00, 'Azul', 'XL', 4, 'active'),
-- P14: Pantalón Chino (5)
(62, 14, 'SIS-HOM-002-BEI-30', 345000.00, 'Beige', '30', 10, 'active'),
(63, 14, 'SIS-HOM-002-BEI-32', 345000.00, 'Beige', '32', 14, 'active'),
(64, 14, 'SIS-HOM-002-GRI-30', 345000.00, 'Gris', '30', 6, 'active'),
(65, 14, 'SIS-HOM-002-GRI-32', 345000.00, 'Gris', '32', 9, 'active'),
(66, 14, 'SIS-HOM-002-NEG-32', 345000.00, 'Negro', '32', 2, 'active'),
-- P15: Blazer Unstructured (5)
(67, 15, 'SIS-HOM-003-AZL-S', 720000.00, 'Azul', 'S', 4, 'active'),
(68, 15, 'SIS-HOM-003-AZL-M', 720000.00, 'Azul', 'M', 7, 'active'),
(69, 15, 'SIS-HOM-003-AZL-L', 720000.00, 'Azul', 'L', 5, 'active'),
(70, 15, 'SIS-HOM-003-GRI-M', 720000.00, 'Gris', 'M', 8, 'active'),
(71, 15, 'SIS-HOM-003-GRI-L', 720000.00, 'Gris', 'L', 3, 'active'),
-- P16: Polo Piqué (5)
(72, 16, 'SIS-HOM-004-BLA-S', 195000.00, 'Blanco', 'S', 15, 'active'),
(73, 16, 'SIS-HOM-004-BLA-M', 195000.00, 'Blanco', 'M', 18, 'active'),
(74, 16, 'SIS-HOM-004-AZL-L', 195000.00, 'Azul', 'L', 12, 'active'),
(75, 16, 'SIS-HOM-004-AZL-XL', 195000.00, 'Azul', 'XL', 0, 'active'),
(76, 16, 'SIS-HOM-004-NEG-M', 195000.00, 'Negro', 'M', 10, 'active'),
-- P17: Jeans Tapered (5)
(77, 17, 'SIS-HOM-005-AZL-28', 385000.00, 'Azul', '28', 8, 'active'),
(78, 17, 'SIS-HOM-005-AZL-30', 385000.00, 'Azul', '30', 12, 'active'),
(79, 17, 'SIS-HOM-005-AZL-32', 385000.00, 'Azul', '32', 6, 'active'),
(80, 17, 'SIS-HOM-005-NEG-30', 385000.00, 'Negro', '30', 9, 'active'),
(81, 17, 'SIS-HOM-005-NEG-32', 385000.00, 'Negro', '32', 4, 'active'),
-- P18: Chaqueta Bomber (4)
(82, 18, 'SIS-HOM-006-NEG-S', 595000.00, 'Negro', 'S', 5, 'active'),
(83, 18, 'SIS-HOM-006-NEG-M', 595000.00, 'Negro', 'M', 7, 'active'),
(84, 18, 'SIS-HOM-006-VER-L', 595000.00, 'Verde', 'L', 3, 'active'),
(85, 18, 'SIS-HOM-006-VER-XL', 595000.00, 'Verde', 'XL', 6, 'active'),
-- P19: Sweater V (4)
(86, 19, 'SIS-HOM-007-AZL-S', 345000.00, 'Azul', 'S', 8, 'active'),
(87, 19, 'SIS-HOM-007-AZL-M', 345000.00, 'Azul', 'M', 11, 'active'),
(88, 19, 'SIS-HOM-007-GRI-L', 345000.00, 'Gris', 'L', 4, 'active'),
(89, 19, 'SIS-HOM-007-GRI-XL', 345000.00, 'Gris', 'XL', 7, 'active'),
-- P20: Camisa Linen (5)
(90, 20, 'SIS-HOM-008-BLA-S', 365000.00, 'Blanco', 'S', 9, 'active'),
(91, 20, 'SIS-HOM-008-BLA-M', 365000.00, 'Blanco', 'M', 13, 'active'),
(92, 20, 'SIS-HOM-008-CRR-L', 365000.00, 'Crema', 'L', 5, 'active'),
(93, 20, 'SIS-HOM-008-CRR-XL', 365000.00, 'Crema', 'XL', 8, 'active'),
(94, 20, 'SIS-HOM-008-AZL-M', 365000.00, 'Azul', 'M', 10, 'active'),
-- P21: Jogger Premium (4)
(95, 21, 'SIS-HOM-009-NEG-S', 285000.00, 'Negro', 'S', 14, 'active'),
(96, 21, 'SIS-HOM-009-NEG-M', 285000.00, 'Negro', 'M', 16, 'active'),
(97, 21, 'SIS-HOM-009-GRI-L', 285000.00, 'Gris', 'L', 10, 'active'),
(98, 21, 'SIS-HOM-009-GRI-XL', 285000.00, 'Gris', 'XL', 12, 'active'),
-- P22: Abrigo Peacoat (4)
(99, 22, 'SIS-HOM-010-NEG-S', 890000.00, 'Negro', 'S', 4, 'active'),
(100, 22, 'SIS-HOM-010-NEG-M', 890000.00, 'Negro', 'M', 6, 'active'),
(101, 22, 'SIS-HOM-010-AZL-L', 890000.00, 'Azul', 'L', 2, 'active'),
(102, 22, 'SIS-HOM-010-AZL-XL', 890000.00, 'Azul', 'XL', 3, 'active'),
-- P23: Cinturón (4)
(103, 23, 'SIS-ACC-001-NEG-90', 245000.00, 'Negro', '90', 10, 'active'),
(104, 23, 'SIS-ACC-001-NEG-100', 245000.00, 'Negro', '100', 14, 'active'),
(105, 23, 'SIS-ACC-001-MAR-90', 245000.00, 'Marrón', '90', 8, 'active'),
(106, 23, 'SIS-ACC-001-MAR-100', 245000.00, 'Marrón', '100', 12, 'active'),
-- P24: Billetera (3)
(107, 24, 'SIS-ACC-002-NEG-OS', 185000.00, 'Negro', 'OS', 18, 'active'),
(108, 24, 'SIS-ACC-002-MAR-OS', 185000.00, 'Marrón', 'OS', 15, 'active'),
(109, 24, 'SIS-ACC-002-AZL-OS', 185000.00, 'Azul', 'OS', 0, 'active'),
-- P25: Pañuelo Seda (4)
(110, 25, 'SIS-ACC-003-AZS-OS', 320000.00, 'Azul', 'OS', 6, 'active'),
(111, 25, 'SIS-ACC-003-ROS-OS', 320000.00, 'Rosa', 'OS', 9, 'active'),
(112, 25, 'SIS-ACC-003-VER-OS', 320000.00, 'Verde', 'OS', 4, 'active'),
(113, 25, 'SIS-ACC-003-BOR-OS', 320000.00, 'Borgoña', 'OS', 7, 'active'),
-- P26: Gorra (3)
(114, 26, 'SIS-ACC-004-NEG-OS', 145000.00, 'Negro', 'OS', 20, 'active'),
(115, 26, 'SIS-ACC-004-BLA-OS', 145000.00, 'Blanco', 'OS', 16, 'active'),
(116, 26, 'SIS-ACC-004-AZL-OS', 145000.00, 'Azul', 'OS', 12, 'active'),
-- P27: Gafas (3)
(117, 27, 'SIS-ACC-005-NEG-OS', 425000.00, 'Negro', 'OS', 8, 'active'),
(118, 27, 'SIS-ACC-005-DOR-OS', 425000.00, 'Dorado', 'OS', 5, 'active'),
(119, 27, 'SIS-ACC-005-MAR-OS', 425000.00, 'Marrón', 'OS', 10, 'active'),
-- P28: Blazer Satin (5)
(120, 28, 'SIS-NC-001-NEG-XS', 820000.00, 'Negro', 'XS', 4, 'active'),
(121, 28, 'SIS-NC-001-NEG-S', 820000.00, 'Negro', 'S', 7, 'active'),
(122, 28, 'SIS-NC-001-CRR-M', 820000.00, 'Crema', 'M', 3, 'active'),
(123, 28, 'SIS-NC-001-CRR-L', 820000.00, 'Crema', 'L', 6, 'active'),
(124, 28, 'SIS-NC-001-AZS-S', 820000.00, 'Azul', 'S', 5, 'active'),
-- P29: Vestido Cut-Out (5)
(125, 29, 'SIS-NC-002-NEG-XS', 595000.00, 'Negro', 'XS', 6, 'active'),
(126, 29, 'SIS-NC-002-NEG-S', 595000.00, 'Negro', 'S', 9, 'active'),
(127, 29, 'SIS-NC-002-BLA-M', 595000.00, 'Blanco', 'M', 4, 'active'),
(128, 29, 'SIS-NC-002-BLA-L', 595000.00, 'Blanco', 'L', 7, 'active'),
(129, 29, 'SIS-NC-002-ROS-S', 595000.00, 'Rosa', 'S', 2, 'active'),
-- P30: Pantalón Cargo (5)
(130, 30, 'SIS-NC-003-NEG-S', 485000.00, 'Negro', 'S', 5, 'active'),
(131, 30, 'SIS-NC-003-NEG-M', 485000.00, 'Negro', 'M', 8, 'active'),
(132, 30, 'SIS-NC-003-VER-S', 485000.00, 'Verde', 'S', 3, 'active'),
(133, 30, 'SIS-NC-003-VER-M', 485000.00, 'Verde', 'M', 6, 'active'),
(134, 30, 'SIS-NC-003-BEI-M', 485000.00, 'Beige', 'M', 4, 'active'),
-- Variantes extra para llegar a 150
-- P1 extra
(135, 1, 'SIS-MUJ-001-ROS-XS', 385000.00, 'Rosa', 'XS', 6, 'active'),
-- P2 extra
(136, 2, 'SIS-MUJ-002-GRI-S', 465000.00, 'Gris', 'S', 8, 'active'),
-- P8 extra
(137, 8, 'SIS-MUJ-008-NEG-M', 485000.00, 'Negro', 'M', 7, 'active'),
-- P13 extra
(138, 13, 'SIS-HOM-001-BLA-XL', 295000.00, 'Blanco', 'XL', 3, 'active'),
-- P15 extra
(139, 15, 'SIS-HOM-003-AZL-XL', 720000.00, 'Azul', 'XL', 2, 'active'),
-- P17 extra
(140, 17, 'SIS-HOM-005-AZL-34', 385000.00, 'Azul', '34', 5, 'active'),
-- P18 extra
(141, 18, 'SIS-HOM-006-NEG-L', 595000.00, 'Negro', 'L', 4, 'active'),
-- P20 extra
(142, 20, 'SIS-HOM-008-BLA-L', 365000.00, 'Blanco', 'L', 7, 'active'),
-- P22 extra
(143, 22, 'SIS-HOM-010-NEG-L', 890000.00, 'Negro', 'L', 3, 'active'),
-- P28 extra
(144, 28, 'SIS-NC-001-NEG-M', 820000.00, 'Negro', 'M', 5, 'active'),
-- P29 extra
(145, 29, 'SIS-NC-002-NEG-M', 595000.00, 'Negro', 'M', 8, 'active'),
-- P30 extra
(146, 30, 'SIS-NC-003-NEG-L', 485000.00, 'Negro', 'L', 7, 'active'),
-- Extras para variedad de stock
(147, 4, 'SIS-MUJ-004-BEI-S', 680000.00, 'Beige', 'S', 1, 'active'),
(148, 10, 'SIS-MUJ-010-GRI-M', 580000.00, 'Gris', 'M', 0, 'active'),
(149, 16, 'SIS-HOM-004-GRI-L', 195000.00, 'Gris', 'L', 9, 'active'),
(150, 23, 'SIS-ACC-001-NEG-110', 245000.00, 'Negro', '110', 6, 'active');

-- ============================================================
-- IMÁGENES (1 por producto = 30)
-- ============================================================

INSERT INTO product_images (id, product_id, variant_id, url, alt_text, position, created_at) VALUES
(1, 1, NULL, '/assets/catalog/blusa-satinada.webp', 'Blusa Satinada Elegante', 1, NOW()),
(2, 2, NULL, '/assets/catalog/pantalon-wide-leg.webp', 'Pantalón Wide Leg', 1, NOW()),
(3, 3, NULL, '/assets/catalog/vestido-midi-plisado.webp', 'Vestido Midi Plisado', 1, NOW()),
(4, 4, NULL, '/assets/catalog/4.webp', 'Chaqueta Oversized', 1, NOW()),
(5, 5, NULL, '/assets/catalog/5.webp', 'Falda Lápiz Premium', 1, NOW()),
(6, 6, NULL, '/assets/catalog/6.webp', 'Cropped Top Tejido', 1, NOW()),
(7, 7, NULL, '/assets/catalog/7.webp', 'Cardigan Clásico', 1, NOW()),
(8, 8, NULL, '/assets/catalog/8.webp', 'Vestido Camisero', 1, NOW()),
(9, 9, NULL, '/assets/catalog/9.webp', 'Pantalón Sastre', 1, NOW()),
(10, 10, NULL, '/assets/catalog/1.webp', 'Sweater Cachemir', 1, NOW()),
(11, 11, NULL, '/assets/catalog/2.webp', 'Blusa Asimétrica', 1, NOW()),
(12, 12, NULL, '/assets/catalog/3.webp', 'Mono Enterito', 1, NOW()),
(13, 13, NULL, '/assets/catalog/Hero-principal.webp', 'Camisa Oxford Slim', 1, NOW()),
(14, 14, NULL, '/assets/catalog/Hero-alterno.webp', 'Pantalón Chino Stretch', 1, NOW()),
(15, 15, NULL, '/assets/catalog/Hero-Nueva-Colección.webp', 'Blazer Unstructured', 1, NOW()),
(16, 16, NULL, '/assets/catalog/1.webp', 'Polo Piqué Clásico', 1, NOW()),
(17, 17, NULL, '/assets/catalog/2.webp', 'Jeans Tapered Fit', 1, NOW()),
(18, 18, NULL, '/assets/catalog/3.webp', 'Chaqueta Bomber', 1, NOW()),
(19, 19, NULL, '/assets/catalog/4.webp', 'Sweater V Ribbed', 1, NOW()),
(20, 20, NULL, '/assets/catalog/5.webp', 'Camisa Linen', 1, NOW()),
(21, 21, NULL, '/assets/catalog/6.webp', 'Pantalón Jogger Premium', 1, NOW()),
(22, 22, NULL, '/assets/catalog/7.webp', 'Abrigo Peacoat', 1, NOW()),
(23, 23, NULL, '/assets/catalog/8.webp', 'Cinturón Cuero Premium', 1, NOW()),
(24, 24, NULL, '/assets/catalog/9.webp', 'Billetera Compacta', 1, NOW()),
(25, 25, NULL, '/assets/catalog/blusa-satinada.webp', 'Pañuelo Seda Natural', 1, NOW()),
(26, 26, NULL, '/assets/catalog/pantalon-wide-leg.webp', 'Gorra Logo Bordado', 1, NOW()),
(27, 27, NULL, '/assets/catalog/vestido-midi-plisado.webp', 'Gafas de Sol Aviador', 1, NOW()),
(28, 28, NULL, '/assets/catalog/4.webp', 'Blazer Oversized Satin', 1, NOW()),
(29, 29, NULL, '/assets/catalog/5.webp', 'Vestido Cut-Out', 1, NOW()),
(30, 30, NULL, '/assets/catalog/6.webp', 'Pantalón Cargo Luxe', 1, NOW());

-- ============================================================
-- CLIENTES (20)
-- Distribución: 8 Bogotá, 6 Medellín, 4 Cali, 2 Barranquilla
-- ============================================================

INSERT INTO customers (id, email, password_hash, first_name, last_name, phone, document_type, document_number, status, created_at) VALUES
(1, 'ana.martinez@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Ana', 'Martínez', '+573120000001', 'CC', '1010101001', 'active', NOW()),
(2, 'carlos.lopez@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Carlos', 'López', '+573120000002', 'CC', '1010101002', 'active', NOW()),
(3, 'maria.garcia@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'María', 'García', '+573120000003', 'CC', '1010101003', 'active', NOW()),
(4, 'juan.rodriguez@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Juan', 'Rodríguez', '+573120000004', 'CC', '1010101004', 'active', NOW()),
(5, 'laura.hernandez@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Laura', 'Hernández', '+573120000005', 'CC', '1010101005', 'active', NOW()),
(6, 'pedro.sanchez@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Pedro', 'Sánchez', '+573120000006', 'CC', '1010101006', 'active', NOW()),
(7, 'sandra.diaz@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Sandra', 'Díaz', '+573120000007', 'CC', '1010101007', 'active', NOW()),
(8, 'diego.moreno@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Diego', 'Moreno', '+573120000008', 'CC', '1010101008', 'active', NOW()),
(9, 'valentina.torres@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Valentina', 'Torres', '+573120000009', 'CC', '1010101009', 'active', NOW()),
(10, 'andres.ramirez@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Andrés', 'Ramírez', '+573120000010', 'CC', '1010101010', 'active', NOW()),
(11, 'camila.vargas@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Camila', 'Vargas', '+573120000011', 'CC', '1010101011', 'active', NOW()),
(12, 'felipe.castro@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Felipe', 'Castro', '+573120000012', 'CC', '1010101012', 'active', NOW()),
(13, 'daniela.ortiz@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Daniela', 'Ortiz', '+573120000013', 'CC', '1010101013', 'active', NOW()),
(14, 'oscar.ruiz@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Óscar', 'Ruiz', '+573120000014', 'CC', '1010101014', 'active', NOW()),
(15, 'patricia.mendoza@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Patricia', 'Mendoza', '+573120000015', 'CC', '1010101015', 'active', NOW()),
(16, 'ricardo.gomez@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Ricardo', 'Gómez', '+573120000016', 'CC', '1010101016', 'active', NOW()),
(17, 'isabella.jimenez@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Isabella', 'Jiménez', '+573120000017', 'CC', '1010101017', 'active', NOW()),
(18, 'alejandro.vega@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Alejandro', 'Vega', '+573120000018', 'CC', '1010101018', 'active', NOW()),
(19, 'paula.acosta@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Paula', 'Acosta', '+573120000019', 'CC', '1010101019', 'active', NOW()),
(20, 'sebastian.pena@email.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Sebastián', 'Peña', '+573120000020', 'CC', '1010101020', 'active', NOW()),
(21, 'cliente.demo@sisley.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Cliente', 'Demo', '+573000000021', 'CC', '1010101021', 'active', NOW()),
(22, 'maria.garcia@sisley.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'María', 'García', '+573000000022', 'CC', '1010101022', 'active', NOW()),
(23, 'carlos.rodriguez@sisley.com', '$2b$10$p7.6.7IwgiI9s7.r0PJ7YODZrRX4UUnAD1Qg8svwlo6vRvRHJdyPO', 'Carlos', 'Rodríguez', '+573000000023', 'CC', '1010101023', 'active', NOW());

-- ============================================================
-- DIRECCIONES (24)
-- ============================================================

INSERT INTO shipping_addresses (id, customer_id, first_name, last_name, address, city, department, phone, is_default, created_at) VALUES
(1, 1, 'Ana', 'Martínez', 'Calle 72 # 10 - 25', 'Bogotá', 'Cundinamarca', '+573120000001', 1, NOW()),
(2, 2, 'Carlos', 'López', 'Carrera 15 # 80 - 30', 'Bogotá', 'Cundinamarca', '+573120000002', 1, NOW()),
(3, 3, 'María', 'García', 'Calle 45 # 60 - 15', 'Bogotá', 'Cundinamarca', '+573120000003', 1, NOW()),
(4, 4, 'Juan', 'Rodríguez', 'Diagonal 30 # 25 - 10', 'Bogotá', 'Cundinamarca', '+573120000004', 1, NOW()),
(5, 5, 'Laura', 'Hernández', 'Calle 55 # 20 - 40', 'Bogotá', 'Cundinamarca', '+573120000005', 1, NOW()),
(6, 6, 'Pedro', 'Sánchez', 'Carrera 80 # 12 - 50', 'Bogotá', 'Cundinamarca', '+573120000006', 1, NOW()),
(7, 7, 'Sandra', 'Díaz', 'Calle 90 # 18 - 22', 'Bogotá', 'Cundinamarca', '+573120000007', 1, NOW()),
(8, 8, 'Diego', 'Moreno', 'Carrera 70 # 15 - 35', 'Bogotá', 'Cundinamarca', '+573120000008', 1, NOW()),
(9, 9, 'Valentina', 'Torres', 'Calle 100 # 30 - 20', 'Medellín', 'Antioquia', '+573120000009', 1, NOW()),
(10, 10, 'Andrés', 'Ramírez', 'Carrera 45 # 25 - 10', 'Medellín', 'Antioquia', '+573120000010', 1, NOW()),
(11, 11, 'Camila', 'Vargas', 'Calle 20 # 35 - 40', 'Medellín', 'Antioquia', '+573120000011', 1, NOW()),
(12, 12, 'Felipe', 'Castro', 'Diagonal 50 # 15 - 30', 'Medellín', 'Antioquia', '+573120000012', 1, NOW()),
(13, 13, 'Daniela', 'Ortiz', 'Carrera 60 # 20 - 25', 'Medellín', 'Antioquia', '+573120000013', 1, NOW()),
(14, 14, 'Óscar', 'Ruiz', 'Calle 30 # 40 - 15', 'Medellín', 'Antioquia', '+573120000014', 1, NOW()),
(15, 15, 'Patricia', 'Mendoza', 'Carrera 25 # 15 - 30', 'Cali', 'Valle del Cauca', '+573120000015', 1, NOW()),
(16, 16, 'Ricardo', 'Gómez', 'Calle 40 # 35 - 20', 'Cali', 'Valle del Cauca', '+573120000016', 1, NOW()),
(17, 17, 'Isabella', 'Jiménez', 'Carrera 15 # 20 - 10', 'Cali', 'Valle del Cauca', '+573120000017', 1, NOW()),
(18, 18, 'Alejandro', 'Vega', 'Calle 55 # 25 - 40', 'Cali', 'Valle del Cauca', '+573120000018', 1, NOW()),
(19, 19, 'Paula', 'Acosta', 'Carrera 10 # 20 - 15', 'Barranquilla', 'Atlántico', '+573120000019', 1, NOW()),
(20, 20, 'Sebastián', 'Peña', 'Calle 35 # 15 - 30', 'Barranquilla', 'Atlántico', '+573120000020', 1, NOW()),
-- Direcciones adicionales (4 clientes con 2 direcciones)
(21, 1, 'Ana', 'Martínez', 'Carrera 20 # 45 - 10', 'Bogotá', 'Cundinamarca', '+573120000001', 0, NOW()),
(22, 9, 'Valentina', 'Torres', 'Calle 50 # 25 - 35', 'Medellín', 'Antioquia', '+573120000009', 0, NOW()),
(23, 15, 'Patricia', 'Mendoza', 'Carrera 30 # 10 - 20', 'Cali', 'Valle del Cauca', '+573120000015', 0, NOW()),
(24, 19, 'Paula', 'Acosta', 'Calle 45 # 20 - 25', 'Barranquilla', 'Atlántico', '+573120000019', 0, NOW());

-- ============================================================
-- MÉTODOS DE ENVÍO (3)
-- ============================================================

INSERT INTO shipping_methods (id, name, description, price, estimated_days, status) VALUES
(1, 'Envío Estándar', 'Envío estándar a todo el país', 15000.00, '3-5 días hábiles', 'active'),
(2, 'Envío Express', 'Envío express a principales ciudades', 25000.00, '1-2 días hábiles', 'active'),
(3, 'Recogida en tienda', 'Recoge tu pedido en tienda', 0.00, 'Inmediato', 'active');

-- ============================================================
-- PEDIDOS (15)
-- Estados: PENDING(3), PAYMENT_PENDING(2), PAID(2), PROCESSING(2),
--          SHIPPED(2), DELIVERED(2), CANCELLED(1), REFUNDED(1)
-- ============================================================

INSERT INTO orders (id, customer_id, order_number, status, subtotal, discount, tax, shipping, total, shipping_address_id, payment_method, notes, created_at, updated_at) VALUES
(1, 1, 'SIS-2026-00001', 'DELIVERED', 850000.00, 0.00, 161500.00, 15000.00, 1026500.00, 1, 'card', 'Entregar en portería', DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(2, 2, 'SIS-2026-00002', 'DELIVERED', 1250000.00, 0.00, 237500.00, 0.00, 1487500.00, 2, 'card', NULL, DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
(3, 3, 'SIS-2026-00003', 'SHIPPED', 680000.00, 0.00, 129200.00, 25000.00, 834200.00, 3, 'card', NULL, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(4, 4, 'SIS-2026-00004', 'SHIPPED', 540000.00, 0.00, 102600.00, 15000.00, 657600.00, 4, 'card', 'Llamar antes de entregar', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
(5, 5, 'SIS-2026-00005', 'PROCESSING', 920000.00, 0.00, 174800.00, 25000.00, 1119800.00, 5, 'card', NULL, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),
(6, 6, 'SIS-2026-00006', 'PROCESSING', 750000.00, 0.00, 142500.00, 15000.00, 907500.00, 6, 'card', NULL, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),
(7, 7, 'SIS-2026-00007', 'PAID', 465000.00, 0.00, 88350.00, 0.00, 553350.00, 7, 'transfer', NULL, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(8, 8, 'SIS-2026-00008', 'PAID', 1100000.00, 0.00, 209000.00, 25000.00, 1334000.00, 8, 'card', 'Regalo, envolver', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(9, 9, 'SIS-2026-00009', 'PAYMENT_PENDING', 385000.00, 0.00, 73150.00, 15000.00, 473150.00, 9, 'cash', NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(10, 10, 'SIS-2026-00010', 'PAYMENT_PENDING', 595000.00, 0.00, 113050.00, 25000.00, 733050.00, 10, 'cash', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(11, 11, 'SIS-2026-00011', 'PENDING', 720000.00, 0.00, 136800.00, 15000.00, 871800.00, 11, 'card', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(12, 12, 'SIS-2026-00012', 'PENDING', 345000.00, 0.00, 65550.00, 0.00, 410550.00, 12, 'card', 'Dirección de trabajo', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(13, 13, 'SIS-2026-00013', 'PENDING', 485000.00, 0.00, 92150.00, 25000.00, 602150.00, 13, 'card', NULL, NOW(), NOW()),
(14, 14, 'SIS-2026-00014', 'CANCELLED', 890000.00, 0.00, 169100.00, 25000.00, 1084100.00, 14, 'card', 'Canceló el cliente', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),
(15, 15, 'SIS-2026-00015', 'REFUNDED', 520000.00, 0.00, 98800.00, 15000.00, 633800.00, 15, 'card', 'Devolución completa', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY));
INSERT INTO order_items (id, order_id, variant_id, product_id, quantity, unit_price, total, created_at) VALUES
(1, 1, 2, 1, 1, 385000.00, 385000.00, NOW()),
(2, 1, 7, 2, 1, 465000.00, 465000.00, NOW()),
(3, 2, 13, 3, 1, 520000.00, 520000.00, NOW()),
(4, 2, 56, 13, 2, 295000.00, 590000.00, NOW()),
(5, 2, 103, 23, 1, 245000.00, 245000.00, NOW()),
(6, 3, 17, 4, 1, 680000.00, 680000.00, NOW()),
(7, 4, 52, 8, 1, 540000.00, 540000.00, NOW()),
(8, 5, 44, 10, 1, 580000.00, 580000.00, NOW()),
(9, 5, 26, 6, 1, 225000.00, 225000.00, NOW()),
(10, 5, 110, 25, 1, 320000.00, 320000.00, NOW()),
(11, 6, 7, 2, 1, 465000.00, 465000.00, NOW()),
(12, 6, 107, 24, 1, 185000.00, 185000.00, NOW()),
(13, 7, 7, 2, 1, 465000.00, 465000.00, NOW()),
(14, 8, 67, 15, 1, 720000.00, 720000.00, NOW()),
(15, 8, 72, 16, 2, 195000.00, 390000.00, NOW()),
(16, 9, 2, 1, 1, 385000.00, 385000.00, NOW()),
(17, 9, 30, 7, 1, 395000.00, 395000.00, NOW()),
(18, 10, 90, 20, 2, 365000.00, 730000.00, NOW()),
(19, 11, 98, 21, 2, 285000.00, 570000.00, NOW()),
(20, 11, 103, 23, 1, 245000.00, 245000.00, NOW()),
(21, 12, 47, 10, 1, 580000.00, 580000.00, NOW()),
(22, 13, 135, 1, 1, 385000.00, 385000.00, NOW()),
(23, 14, 99, 22, 1, 890000.00, 890000.00, NOW()),
(24, 15, 12, 3, 1, 520000.00, 520000.00, NOW());
INSERT INTO order_status_history (id, order_id, status, notes, created_at) VALUES
(1, 1, 'PENDING', 'Pedido creado', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(2, 1, 'PAID', 'Pago confirmado', DATE_SUB(NOW(), INTERVAL 24 DAY)),
(3, 1, 'PROCESSING', 'En preparación', DATE_SUB(NOW(), INTERVAL 23 DAY)),
(4, 1, 'SHIPPED', 'Enviado', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(5, 1, 'DELIVERED', 'Entregado', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(6, 2, 'PENDING', 'Pedido creado', DATE_SUB(NOW(), INTERVAL 22 DAY)),
(7, 2, 'PAID', 'Pago confirmado', DATE_SUB(NOW(), INTERVAL 21 DAY)),
(8, 2, 'PROCESSING', 'En preparación', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(9, 2, 'SHIPPED', 'Enviado', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(10, 2, 'DELIVERED', 'Entregado en tienda', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(11, 3, 'PENDING', 'Pedido creado', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(12, 3, 'PAID', 'Pago confirmado', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(13, 3, 'SHIPPED', 'Enviado vía express', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(14, 4, 'PENDING', 'Pedido creado', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(15, 4, 'PAID', 'Pago confirmado', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(16, 4, 'SHIPPED', 'Enviado', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(17, 5, 'PENDING', 'Pedido creado', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(18, 5, 'PROCESSING', 'En preparación', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(19, 14, 'PENDING', 'Pedido creado', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(20, 14, 'CANCELLED', 'Cancelado por cliente', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(21, 15, 'PENDING', 'Pedido creado', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(22, 15, 'PAID', 'Pago confirmado', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(23, 15, 'REFUNDED', 'Devolución completa procesada', DATE_SUB(NOW(), INTERVAL 8 DAY));

INSERT INTO settings (`key`, value, type, description) VALUES
('site_name', 'Sisley Colombia', 'string', 'Nombre del sitio'),
('currency', 'COP', 'string', 'Moneda'),
('tax_rate', '0.19', 'number', 'Tasa de IVA'),
('shipping_standard', '15000', 'number', 'Costo envío estándar'),
('shipping_express', '25000', 'number', 'Costo envío express'),
('allow_guest_checkout', 'true', 'boolean', 'Permitir checkout sin registro');

-- ============================================================
-- INVENTARIO POR VARIANTE Y BODEGA
-- ============================================================
-- Regla: stock por variante por bodega.
-- Variantes agotadas: 3, 11, 18, 24, 29, 42, 46, 60, 75, 109, 148
-- Variantes bajo stock: 9, 14, 36, 41, 63, 66, 101, 122, 129, 134, 147

INSERT INTO inventory (variant_id, store_id, warehouse_id, stock, min_stock) VALUES
(1, NULL, 1, 3, 2), (1, NULL, 2, 2, 2), (1, NULL, 3, 0, 2),
(2, NULL, 1, 4, 2), (2, NULL, 2, 3, 2), (2, NULL, 3, 1, 2),
(3, NULL, 1, 0, 2), (3, NULL, 2, 0, 2), (3, NULL, 3, 0, 2),
(7, NULL, 1, 3, 2), (7, NULL, 2, 2, 2), (7, NULL, 3, 1, 2),
(9, NULL, 1, 1, 2), (9, NULL, 2, 0, 2), (9, NULL, 3, 1, 2),
(11, NULL, 1, 0, 2), (11, NULL, 2, 0, 2), (11, NULL, 3, 0, 2),
(14, NULL, 1, 1, 2), (14, NULL, 2, 0, 2), (14, NULL, 3, 0, 2),
(18, NULL, 1, 0, 2), (18, NULL, 2, 0, 2), (18, NULL, 3, 0, 2),
(24, NULL, 1, 0, 2), (24, NULL, 2, 0, 2), (24, NULL, 3, 0, 2),
(29, NULL, 1, 0, 2), (29, NULL, 2, 0, 2), (29, NULL, 3, 0, 2),
(36, NULL, 1, 1, 2), (36, NULL, 2, 0, 2), (36, NULL, 3, 0, 2),
(41, NULL, 1, 1, 2), (41, NULL, 2, 1, 2), (41, NULL, 3, 0, 2),
(42, NULL, 1, 0, 2), (42, NULL, 2, 0, 2), (42, NULL, 3, 0, 2),
(46, NULL, 1, 0, 2), (46, NULL, 2, 0, 2), (46, NULL, 3, 0, 2),
(60, NULL, 1, 0, 2), (60, NULL, 2, 0, 2), (60, NULL, 3, 0, 2),
(63, NULL, 1, 1, 2), (63, NULL, 2, 0, 2), (63, NULL, 3, 0, 2),
(66, NULL, 1, 1, 2), (66, NULL, 2, 0, 2), (66, NULL, 3, 0, 2),
(75, NULL, 1, 0, 2), (75, NULL, 2, 0, 2), (75, NULL, 3, 0, 2),
(101, NULL, 1, 1, 2), (101, NULL, 2, 0, 2), (101, NULL, 3, 0, 2),
(109, NULL, 1, 0, 2), (109, NULL, 2, 0, 2), (109, NULL, 3, 0, 2),
(122, NULL, 1, 1, 2), (122, NULL, 2, 0, 2), (122, NULL, 3, 0, 2),
(129, NULL, 1, 1, 2), (129, NULL, 2, 0, 2), (129, NULL, 3, 0, 2),
(134, NULL, 1, 1, 2), (134, NULL, 2, 0, 2), (134, NULL, 3, 0, 2),
(147, NULL, 1, 1, 2), (147, NULL, 2, 0, 2), (147, NULL, 3, 0, 2),
(148, NULL, 1, 0, 2), (148, NULL, 2, 0, 2), (148, NULL, 3, 0, 2);

INSERT INTO inventory_movements (variant_id, store_id, warehouse_id, type, quantity, reason, reference, user_id) VALUES
(1, NULL, 1, 'in', 5, 'Stock inicial demo', 'SEED-001', 1),
(1, NULL, 2, 'in', 5, 'Stock inicial demo', 'SEED-002', 1),
(1, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-003', 1),
(2, NULL, 1, 'in', 4, 'Stock inicial demo', 'SEED-004', 1),
(2, NULL, 2, 'in', 3, 'Stock inicial demo', 'SEED-005', 1),
(2, NULL, 3, 'in', 1, 'Stock inicial demo', 'SEED-006', 1),
(3, NULL, 1, 'in', 0, 'Stock inicial demo', 'SEED-007', 1),
(3, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-008', 1),
(3, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-009', 1),
(7, NULL, 1, 'in', 3, 'Stock inicial demo', 'SEED-010', 1),
(7, NULL, 2, 'in', 2, 'Stock inicial demo', 'SEED-011', 1),
(7, NULL, 3, 'in', 1, 'Stock inicial demo', 'SEED-012', 1),
(9, NULL, 1, 'in', 1, 'Stock inicial demo', 'SEED-013', 1),
(9, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-014', 1),
(9, NULL, 3, 'in', 1, 'Stock inicial demo', 'SEED-015', 1),
(11, NULL, 1, 'in', 0, 'Stock inicial demo', 'SEED-016', 1),
(11, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-017', 1),
(11, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-018', 1),
(14, NULL, 1, 'in', 1, 'Stock inicial demo', 'SEED-019', 1),
(14, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-020', 1),
(14, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-021', 1),
(18, NULL, 1, 'in', 0, 'Stock inicial demo', 'SEED-022', 1),
(18, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-023', 1),
(18, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-024', 1),
(24, NULL, 1, 'in', 0, 'Stock inicial demo', 'SEED-025', 1),
(24, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-026', 1),
(24, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-027', 1),
(29, NULL, 1, 'in', 0, 'Stock inicial demo', 'SEED-028', 1),
(29, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-029', 1),
(29, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-030', 1),
(36, NULL, 1, 'in', 1, 'Stock inicial demo', 'SEED-031', 1),
(36, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-032', 1),
(36, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-033', 1),
(41, NULL, 1, 'in', 1, 'Stock inicial demo', 'SEED-034', 1),
(41, NULL, 2, 'in', 1, 'Stock inicial demo', 'SEED-035', 1),
(41, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-036', 1),
(42, NULL, 1, 'in', 0, 'Stock inicial demo', 'SEED-037', 1),
(42, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-038', 1),
(42, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-039', 1),
(46, NULL, 1, 'in', 0, 'Stock inicial demo', 'SEED-040', 1),
(46, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-041', 1),
(46, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-042', 1),
(60, NULL, 1, 'in', 0, 'Stock inicial demo', 'SEED-043', 1),
(60, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-044', 1),
(60, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-045', 1),
(63, NULL, 1, 'in', 1, 'Stock inicial demo', 'SEED-046', 1),
(63, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-047', 1),
(63, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-048', 1),
(66, NULL, 1, 'in', 1, 'Stock inicial demo', 'SEED-049', 1),
(66, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-050', 1),
(66, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-051', 1),
(75, NULL, 1, 'in', 0, 'Stock inicial demo', 'SEED-052', 1),
(75, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-053', 1),
(75, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-054', 1),
(101, NULL, 1, 'in', 1, 'Stock inicial demo', 'SEED-055', 1),
(101, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-056', 1),
(101, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-057', 1),
(109, NULL, 1, 'in', 0, 'Stock inicial demo', 'SEED-058', 1),
(109, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-059', 1),
(109, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-060', 1),
(122, NULL, 1, 'in', 1, 'Stock inicial demo', 'SEED-061', 1),
(122, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-062', 1),
(122, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-063', 1),
(129, NULL, 1, 'in', 1, 'Stock inicial demo', 'SEED-064', 1),
(129, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-065', 1),
(129, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-066', 1),
(134, NULL, 1, 'in', 1, 'Stock inicial demo', 'SEED-067', 1),
(134, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-068', 1),
(134, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-069', 1),
(147, NULL, 1, 'in', 1, 'Stock inicial demo', 'SEED-070', 1),
(147, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-071', 1),
(147, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-072', 1),
(148, NULL, 1, 'in', 0, 'Stock inicial demo', 'SEED-073', 1),
(148, NULL, 2, 'in', 0, 'Stock inicial demo', 'SEED-074', 1),
(148, NULL, 3, 'in', 0, 'Stock inicial demo', 'SEED-075', 1);

-- Sincronizar stock de product_variants desde inventory para las variantes demo
UPDATE product_variants pv
JOIN (
  SELECT variant_id, SUM(stock) AS total_stock
  FROM inventory
  WHERE variant_id IN (1,2,3,7,9,11,14,18,24,29,36,41,42,46,60,63,66,75,101,109,122,129,134,147,148)
  GROUP BY variant_id
) inv ON inv.variant_id = pv.id
SET pv.stock = inv.total_stock;
