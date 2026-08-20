-- ============================================================
-- SISLEY COLOMBIA - DATOS DE DEMOSTRACIÓN
-- seed.sql
-- ============================================================

-- IMPORTANTE: Datos ficticios para demostración.
-- No utilizar información real de clientes, bancos, DIAN, etc.

USE sisley_platform;

-- ============================================================
-- ROLES
-- ============================================================

INSERT INTO roles (name, description, is_system) VALUES
('ADMIN', 'Administrador del sistema', 1),
('MANAGER', 'Gerente / Supervisor', 0),
('STAFF', 'Empleado / Vendedor', 0);

-- ============================================================
-- PERMISOS
-- ============================================================

INSERT INTO permissions (name, module, action, description) VALUES
('users.create', 'users', 'create', 'Crear usuarios'),
('users.read', 'users', 'read', 'Leer usuarios'),
('users.update', 'users', 'update', 'Actualizar usuarios'),
('users.delete', 'users', 'delete', 'Eliminar usuarios'),
('products.create', 'products', 'create', 'Crear productos'),
('products.read', 'products', 'read', 'Leer productos'),
('products.update', 'products', 'update', 'Actualizar productos'),
('products.delete', 'products', 'delete', 'Eliminar productos'),
('orders.read', 'orders', 'read', 'Leer pedidos'),
('orders.update', 'orders', 'update', 'Actualizar pedidos'),
('inventory.read', 'inventory', 'read', 'Leer inventario'),
('inventory.update', 'inventory', 'update', 'Actualizar inventario'),
('reports.read', 'reports', 'read', 'Leer reportes'),
('settings.update', 'settings', 'update', 'Actualizar configuración');

-- ============================================================
-- ROLE_PERMISSIONS
-- ============================================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'MANAGER'
  AND p.module IN ('products', 'orders', 'inventory', 'reports', 'users');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.name = 'STAFF'
  AND p.action IN ('read', 'update')
  AND p.module IN ('products', 'orders', 'inventory');

-- ============================================================
-- USUARIOS (DEMO)
-- Contraseña demo: admin123
-- Hash bcrypt generado para 'admin123'
-- ============================================================

INSERT INTO users (email, password_hash, first_name, last_name, role_id, phone, status, last_login_at) VALUES
('admin@sisley-demo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Sisley', 1, '+573000000000', 'active', NOW());

-- ============================================================
-- SUCURSALES
-- ============================================================

INSERT INTO stores (name, address, city, department, phone, email, status) VALUES
('Sisley Bogotá', 'Calle 100 # 15 - 20', 'Bogotá', 'Cundinamarca', '+5715000000', 'bogota@sisley-demo.com', 'active'),
('Sisley Medellín', 'Calle 50 # 30 - 10', 'Medellín', 'Antioquia', '+5743000000', 'medellin@sisley-demo.com', 'active');

-- ============================================================
-- BODEGAS
-- ============================================================

INSERT INTO warehouses (name, store_id, address, status) VALUES
('Bodega Central Bogotá', 1, 'Calle 100 # 15 - 20', 'active'),
('Bodega Central Medellín', 2, 'Calle 50 # 30 - 10', 'active');

-- ============================================================
-- CATEGORÍAS
-- ============================================================

INSERT INTO categories (name, slug, description, status) VALUES
('Mujer', 'mujer', 'Colección para mujer', 'active'),
('Hombre', 'hombre', 'Colección para hombre', 'active'),
('Nueva Colección', 'nueva-coleccion', 'Lo más reciente de Sisley', 'active'),
('Ofertas', 'ofertas', 'Ofertas especiales', 'active');

-- ============================================================
-- PRODUCTOS
-- ============================================================

INSERT INTO products (name, slug, description, price, sku, category_id, status, featured) VALUES
('Chaqueta Essential', 'chaqueta-essential', 'Chaqueta esencial en tejido premium. Corte moderno y elegante.', 450000.00, 'SIS-JKT-001', 1, 'active', 1),
('Camisa Slim Fit', 'camisa-slim-fit', 'Camisa slim fit en algodón egipcio. Perfecta para ocasiones formales.', 280000.00, 'SIS-SH-001', 2, 'active', 1),
('Vestido Minimal', 'vestido-minimal', 'Vestido minimal de líneas limpias. Elegancia atemporal.', 520000.00, 'SIS-DR-001', 1, 'active', 1),
('Pantalón Chino', 'pantalon-chino', 'Pantalón chino de corte recto. Confort y estilo.', 320000.00, 'SIS-PN-001', 2, 'active', 0),
('Blazer Clásico', 'blazer-clasico', 'Blazer clásico en lana italiana. Sofisticación.', 680000.00, 'SIS-BZ-001', 1, 'active', 1),
('Abrigo Urbano', 'abrigo-urbano', 'Abrigo urbano para climas fríos. Protección sin sacrificar estilo.', 750000.00, 'SIS-CO-001', 3, 'active', 0);

-- ============================================================
-- VARIANTES DE PRODUCTO
-- ============================================================

INSERT INTO product_variants (product_id, sku, price, color, size, stock, status) VALUES
(1, 'SIS-JKT-001-NEG-S', 450000.00, 'Negro', 'S', 5, 'active'),
(1, 'SIS-JKT-001-NEG-M', 450000.00, 'Negro', 'M', 8, 'active'),
(1, 'SIS-JKT-001-NEG-L', 450000.00, 'Negro', 'L', 4, 'active'),
(1, 'SIS-JKT-001-VER-S', 450000.00, 'Verde', 'S', 3, 'active'),
(1, 'SIS-JKT-001-VER-M', 450000.00, 'Verde', 'M', 6, 'active'),
(2, 'SIS-SH-001-BLA-S', 280000.00, 'Blanco', 'S', 10, 'active'),
(2, 'SIS-SH-001-BLA-M', 280000.00, 'Blanco', 'M', 12, 'active'),
(2, 'SIS-SH-001-AZU-M', 280000.00, 'Azul', 'M', 7, 'active'),
(2, 'SIS-SH-001-AZU-L', 280000.00, 'Azul', 'L', 9, 'active'),
(3, 'SIS-DR-001-NEG-S', 520000.00, 'Negro', 'S', 4, 'active'),
(3, 'SIS-DR-001-NEG-M', 520000.00, 'Negro', 'M', 5, 'active'),
(3, 'SIS-DR-001-BLA-S', 520000.00, 'Blanco', 'S', 3, 'active'),
(4, 'SIS-PN-001-BEI-30', 320000.00, 'Beige', '30', 15, 'active'),
(4, 'SIS-PN-001-BEI-32', 320000.00, 'Beige', '32', 18, 'active'),
(4, 'SIS-PN-001-NEG-30', 320000.00, 'Negro', '30', 12, 'active'),
(5, 'SIS-BZ-001-NEG-S', 680000.00, 'Negro', 'S', 2, 'active'),
(5, 'SIS-BZ-001-NEG-M', 680000.00, 'Negro', 'M', 3, 'active'),
(5, 'SIS-BZ-001-GRI-M', 680000.00, 'Gris', 'M', 4, 'active'),
(6, 'SIS-CO-001-NEG-M', 750000.00, 'Negro', 'M', 2, 'active'),
(6, 'SIS-CO-001-NEG-L', 750000.00, 'Negro', 'L', 3, 'active');

-- ============================================================
-- INVENTARIO
-- ============================================================

INSERT INTO inventory (variant_id, store_id, warehouse_id, stock, min_stock) VALUES
(1, 1, 1, 5, 2),
(2, 1, 1, 8, 2),
(3, 1, 1, 4, 2),
(4, 1, 1, 3, 1),
(5, 1, 1, 6, 2),
(6, 1, 1, 10, 3),
(7, 1, 1, 12, 3),
(8, 1, 1, 7, 2),
(9, 1, 1, 9, 2),
(10, 1, 1, 4, 2),
(11, 1, 1, 5, 2),
(12, 1, 1, 3, 1),
(13, 1, 1, 15, 4),
(14, 1, 1, 18, 4),
(15, 1, 1, 12, 3),
(16, 1, 1, 2, 1),
(17, 1, 1, 3, 1),
(18, 1, 1, 4, 1),
(19, 2, 2, 2, 1),
(20, 2, 2, 3, 1);

-- ============================================================
-- CLIENTES DEMO
-- Contraseña demo: cliente123
-- ============================================================

INSERT INTO customers (email, password_hash, first_name, last_name, phone, document_type, document_number, status) VALUES
('cliente.demo@sisley.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cliente', 'Demo', '+573111111111', 'CC', '1234567890', 'active');

-- ============================================================
-- DIRECCIONES DE ENVÍO
-- ============================================================

INSERT INTO shipping_addresses (customer_id, first_name, last_name, address, city, department, phone, is_default) VALUES
(1, 'Cliente', 'Demo', 'Calle 50 # 20 - 15', 'Bogotá', 'Cundinamarca', '+573111111111', 1);

-- ============================================================
-- MÉTODOS DE ENVÍO
-- ============================================================

INSERT INTO shipping_methods (name, description, price, estimated_days, status) VALUES
('Envío Estándar', 'Envío estándar a todo el país', 15000.00, '3-5 días hábiles', 'active'),
('Envío Express', 'Envío express a principales ciudades', 25000.00, '1-2 días hábiles', 'active'),
('Recogida en tienda', 'Recoge tu pedido en tienda', 0.00, 'Inmediato', 'active');

-- ============================================================
-- CARRITO
-- ============================================================

INSERT INTO carts (customer_id, session_id, status) VALUES
(1, 'demo-session-001', 'active');

-- ============================================================
-- CART_ITEMS
-- ============================================================

INSERT INTO cart_items (cart_id, variant_id, quantity, unit_price) VALUES
(1, 2, 1, 450000.00),
(1, 7, 2, 280000.00);

-- ============================================================
-- CONFIGURACIÓN
-- ============================================================

INSERT INTO settings (`key`, value, type, description) VALUES
('site_name', 'Sisley Colombia', 'string', 'Nombre del sitio'),
('site_email', 'contacto@sisley-demo.com', 'string', 'Email de contacto'),
('currency', 'COP', 'string', 'Moneda'),
('tax_rate', '0.19', 'number', 'Tasa de IVA'),
('shipping_standard', '15000', 'number', 'Costo envío estándar'),
('shipping_express', '25000', 'number', 'Costo envío express'),
('allow_guest_checkout', 'true', 'boolean', 'Permitir checkout sin registro');
