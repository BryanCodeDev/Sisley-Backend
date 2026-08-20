# SISLEY COLOMBIA — Backend API

Backend API REST de la plataforma tecnológica Sisley Colombia.

## Stack

- Next.js 14 App Router
- Node.js
- mysql2/promise
- bcryptjs
- jsonwebtoken

## Estructura

```
backend/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/route.js
│       │   ├── logout/route.js
│       │   └── me/route.js
│       ├── health/route.js
│       ├── categories/
│       │   ├── route.js
│       │   └── [id]/route.js
│       ├── products/
│       │   ├── route.js
│       │   └── [id]/route.js
│       ├── customers/
│       │   ├── route.js
│       │   └── [id]/route.js
│       └── orders/
│           ├── route.js
│           └── [id]/route.js
├── modules/
│   ├── auth/
│   │   ├── auth.repository.js
│   │   └── auth.service.js
│   ├── categories/
│   ├── products/
│   ├── customers/
│   └── orders/
├── database/
│   └── connection.js
├── middleware.js
├── middleware/
│   └── requirePermission.js
├── utils/
│   ├── index.js
│   └── audit.js
├── config/
│   └── index.js
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── package.json
```

## Variables de Entorno

Ver `.env.example` en la raíz del backend.

## Ejecutar

```bash
npm run dev
```

## Middleware

- Protege rutas `/admin/*` y `/api/*` excepto endpoints públicos.
- Verifica JWT desde cookie HttpOnly `sisley_token`.
- Redirige a `/login` si no hay token o es inválido.
- Propaga headers `x-user-id`, `x-user-email`, `x-user-role`, `x-user-permissions`.

## Protección de Endpoints

| Endpoint | Método | Permiso requerido |
|----------|--------|-------------------|
| `/api/categories` | POST | `categories.create` |
| `/api/categories/:id` | PUT | `categories.update` |
| `/api/categories/:id` | DELETE | `categories.delete` |
| `/api/products` | POST | `products.create` |
| `/api/products/:id` | PUT | `products.update` |
| `/api/products/:id` | DELETE | `products.delete` |
| `/api/customers` | POST | `customers.create` |
| `/api/customers/:id` | PUT | `customers.update` |
| `/api/orders` | POST | `orders.create` |
| `/api/orders/:id` | PUT | `orders.update` |

Endpoints públicos: `GET /api/health`, `GET /api/categories`, `GET /api/products`, `GET /api/customers`, `GET /api/orders`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`.

## Auditoría

Se registran en `audit_logs`:
- Login
- Logout
- Crear/editar/desactivar producto
- Crear/editar/desactivar categoría
- Cambiar estado de pedido

No se registran passwords, tokens ni secrets.

## Usuario Demo

- Email: `admin@sisley-demo.com`
- Password: `admin123`
- Rol: ADMIN
