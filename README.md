# SISLEY COLOMBIA — Plataforma Tecnológica

Plataforma tecnológica para modernizar progresivamente la operación comercial y digital de **Sisley Colombia**.

## Contexto

Sisley Colombia es una marca del sector de moda y ropa con presencia física y digital. Actualmente cuenta con un sistema interno antiguo que recientemente sufrió una falla eléctrica. Esta plataforma representa la propuesta de modernización tecnológica, escalable, mantenible y preparada para las necesidades actuales de la empresa.

## Objetivo General

Crear una plataforma empresarial que centralice progresivamente la operación comercial y digital, evolucionando hacia ecommerce, catálogo, inventario, facturación, multi-sucursal, pagos, reportes y administración.

## Posicionamiento

No es solo "una página web" ni únicamente "una tienda online". Es una **plataforma tecnológica para modernizar progresivamente la operación comercial y digital de Sisley Colombia**.

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Frontend | React + Next.js + Tailwind CSS |
| Backend | Next.js (API REST) |
| Base de Datos | MySQL |
| Driver DB | mysql2/promise |
| Auth | JWT + bcrypt |

**No se utilizan ORMs** (sin Prisma, Sequelize, TypeORM, Drizzle). La aplicación se comunica directamente con MySQL mediante `mysql2` y SQL.

## Estructura del Proyecto

```
sisley-platform/
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   ├── data/
│   │   ├── services/
│   │   ├── admin/
│   │   ├── catalogo/
│   │   ├── carrito/
│   │   ├── checkout/
│   │   ├── login/
│   │   ├── registro/
│   │   ├── mi-cuenta/
│   │   ├── mis-pedidos/
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.jsx
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
├── backend/
│   ├── app/
│   │   └── api/
│   │       ├── health/
│   │       │   └── route.js
│   │       ├── categories/
│   │       │   ├── route.js
│   │       │   └── [id]/route.js
│   │       ├── products/
│   │       │   ├── route.js
│   │       │   └── [id]/route.js
│   │       ├── customers/
│   │       │   ├── route.js
│   │       │   └── [id]/route.js
│   │       └── orders/
│   │           ├── route.js
│   │           └── [id]/route.js
│   ├── modules/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── customers/
│   │   └── orders/
│   ├── database/
│   │   ├── connection.js
│   │   └── repositories/
│   ├── utils/
│   ├── config/
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── package.json
├── database/
│   ├── migrate.js
│   ├── schema.sql
│   └── seed.sql
├── docs/
├── .env.example
├── .gitignore
└── package.json
```

## Arquitectura

```
USUARIO
   |
   v
NEXT.JS / REACT
   |
   v
API REST
   |
   v
CONTROLLERS (Route Handlers)
   |
   v
SERVICES
   |
   v
REPOSITORIES
   |
   v
MYSQL2
   |
   v
MYSQL
```

## Instalación

```bash
# Instalar dependencias del frontend
cd frontend && npm install

# Instalar dependencias del backend
cd backend && npm install

# Configurar variables de entorno
cp .env.example .env
cp frontend/.env.example frontend/.env.local
# Editar .env y frontend/.env.local con tus credenciales locales
```

## Variables de Entorno

### Raíz / Backend

```env
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USER=sisley_user
DB_PASSWORD=sisley_password
DB_NAME=sisley_platform

JWT_SECRET=your_jwt_secret_here_change_in_production

NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

FACTUS_API_URL=
FACTUS_API_KEY=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Base de Datos

### Migración

```bash
npm run db:setup
```

Este comando ejecuta `node database/migrate.js`, que:
1. Lee variables de entorno.
2. Se conecta a MySQL.
3. Ejecuta `database/schema.sql`.
4. Ejecuta `database/seed.sql`.
5. Muestra mensajes claros y errores si existen.
6. Cierra la conexión.

## Desarrollo

```bash
# Desarrollo frontend (puerto 3000)
npm run dev:frontend

# Desarrollo backend (puerto 3001)
npm run dev:backend

# Migrar base de datos
npm run db:setup
```

## API — Endpoints (Fase 2)

### Health
- `GET /api/health` — Verifica backend y conexión MySQL.

### Categories
- `GET /api/categories` — Listar categorías.
- `GET /api/categories/:id` — Obtener categoría por ID.
- `POST /api/categories` — Crear categoría.
- `PUT /api/categories/:id` — Actualizar categoría.
- `DELETE /api/categories/:id` — Desactivar categoría.

### Products
- `GET /api/products` — Listar productos.
- `GET /api/products/:id` — Obtener producto por ID.
- `POST /api/products` — Crear producto.
- `PUT /api/products/:id` — Actualizar producto.
- `DELETE /api/products/:id` — Desactivar producto.

### Customers
- `GET /api/customers` — Listar clientes.
- `GET /api/customers/:id` — Obtener cliente por ID.
- `POST /api/customers` — Crear cliente.
- `PUT /api/customers/:id` — Actualizar cliente.

### Orders
- `GET /api/orders` — Listar pedidos.
- `GET /api/orders/:id` — Obtener pedido por ID.
- `POST /api/orders` — Crear pedido (con transacción y descuento de stock).
- `PUT /api/orders/:id` — Actualizar estado del pedido.

Todos los endpoints retornan:

```json
{
  "success": true,
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Seguridad

- Prepared statements en todas las consultas dinámicas.
- Validación de entrada.
- Foreign Keys e índices.
- Transacciones para operaciones críticas (órdenes).
- CORS configurado por origen.
- Variables de entorno para secretos.
- Sin exposición de passwords ni stack traces.

## Roadmap por Fases

| Fase | Nombre | Estado |
|------|--------|--------|
| 0 | Arquitectura y Planificación | Completada |
| 1 | Frontend / Demo Comercial | Completada |
| 2 | Backend + MySQL | Actual |
| 3 | Autenticación + Panel Admin | Pendiente |
| 4 | Carrito + Checkout | Pendiente |
| 5 | Mercado Pago | Pendiente |
| 6 | Inventario | Pendiente |
| 7 | Factus + Facturación Electrónica | Pendiente |
| 8 | Multi-sucursal | Pendiente |
| 9 | Reportes + Analytics | Pendiente |
| 10 | Producción | Pendiente |
| 11 | Auditoría Final | Pendiente |

## Identidad Visual

- Paleta: Blanco, Negro, Gris, Tonos oscuros, Azul oscuro.
- Diseño editorial, espacio negativo, tipografía elegante.
- Animaciones sutiles, microinteracciones.
- Experiencia premium, sin diseño genérico de SaaS.

## Notas

- Este es un proyecto de demostración / MVP inicial.
- No se modifica el servidor actual de Sisley.
- No se utilizan datos reales de clientes, bancos, DIAN o tributarios.
- No se implementan migraciones destructivas en producción.
- El desarrollo avanza por fases con aprobación explícita.
