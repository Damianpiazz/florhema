---
autor: Damián Piazza
fecha: 2026-05-17
titulo: Registro de Usuario
estado: ELIMINADO
---

# TDD-001: Registro de Usuario — ELIMINADO

> **Este caso de uso se elimina.**
> El registro público ya no existe. Los usuarios solo pueden ser creados por un administrador.
> Ver TDD-005 (Creación de Usuarios por Admin) cuando se implemente.

## Contexto de Negocio (PRD)

### Objetivo
Permitir que un técnico o licenciado de Hemoterapia cree su cuenta en el sistema con email y contraseña personal, para que quede registrado como responsable de todas sus operaciones (RF0012).

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Crear una cuenta para poder operar el sistema y que todas sus cargas queden trazadas con su identidad.

### Criterios de Aceptación
*   El sistema debe crear un usuario con email, password y nombre
*   El email debe ser único en el sistema
*   La contraseña debe almacenarse hasheada (nunca en texto plano)
*   Al registrarse, el token de sesión se entrega mediante cookie httpOnly (ADR-008)
*   El token NO debe ser accesible desde JavaScript del frontend
*   El usuario debe poder registrarse desde un formulario en `/register`
*   El formulario debe validar los mismos campos que el backend
*   Los errores del servidor deben mostrarse en pantalla
*   Al registrarse exitosamente, debe redirigir al home con sesión iniciada

## Diseño Técnico (RFC)

### Modelo de Datos

**User**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | Int | PK, autoincrement |
| email | String | UNIQUE, NOT NULL |
| password | String | NOT NULL |
| role | Role (enum) | DEFAULT USER |
| name | String? | |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| deletedAt | DateTime? | |
| createdById | Int? | FK -> User |
| updatedById | Int? | FK -> User |
| deletedById | Int? | FK -> User |

**Session**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | Int | PK, autoincrement |
| userId | Int | FK -> User, onDelete Cascade |
| tokenHash | String | NOT NULL |
| createdAt | DateTime | @default(now()) |
| expiresAt | DateTime | NOT NULL |
| revokedAt | DateTime? | |

### Contrato de API

#### `POST /api/v1/auth/register`

**Request Body**:
```json
{
  "email": "tecnico@hospital.com",
  "password": "miPassword123",
  "name": "Facundo Gómez"
}
```

**Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "tecnico@hospital.com", "name": "Facundo Gómez", "role": "USER" }
  }
}
```
Header `Set-Cookie`:
```
session_token=<token-opaco-hex>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400
```

**Response `400 Bad Request`**:
```json
{ "success": false, "error": "Email inválido" }
```

**Response `409 Conflict`**:
```json
{ "success": false, "error": "El email ya está registrado" }
```

#### `GET /api/v1/auth/me`

Endpoint para recuperar la sesión activa. El frontend lo usa al montar la app para saber si hay usuario autenticado.

**Request**: Cookie `session_token` enviada automáticamente por el browser.

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "tecnico@hospital.com", "name": "Facundo Gómez", "role": "USER" }
  }
}
```

**Response `401 Unauthorized`**:
```json
{ "success": false, "error": "No autenticado" }
```

### Contrato de Frontend

**Ruta**: `/register` — Ruta pública (no requiere autenticación)

**Componentes**:
```
frontend/src/
├── lib/
│   └── axios.ts                     ← Instancia Axios con baseURL y withCredentials
├── features/
│   └── auth/
│       ├── auth-context.tsx         ← React Context global
│       ├── auth-service.ts          ← Llamadas a la API via axios instance
│       └── components/
│           └── register-form.tsx   ← Formulario de registro
├── app/
│   ├── layout.tsx                   ← AuthProvider wrapper
│   └── register/
│       └── page.tsx                 ← Página de registro
└── components/
    └── ui/
        ├── input.tsx                ← shadcn Input
        ├── button.tsx               ← shadcn Button
        └── label.tsx                ← shadcn Label
```

**auth-context.tsx** (ADR-008):
- `AuthProvider` envuelve la app en `layout.tsx`
- Provee `{ user, isAuthenticated, loading, register(), login(), logout(), refreshUser() }`
- **NO almacena nada en localStorage** — la sesión se gestiona exclusivamente mediante cookie httpOnly
- Al iniciar, llama a `GET /auth/me` con `credentials: "include"` para restaurar sesión
- `register(email, password, name)` llama a `POST /auth/register` con `credentials: "include"`; el browser recibe y almacena la cookie automáticamente
- `refreshUser()` re-confirma sesión activa vía `GET /auth/me`
- `isAuthenticated` se deriva de `!!user`

**auth-service.ts** (ADR-008, ADR-011):
- Usa la instancia de axios configurada en `lib/axios.ts` con `baseURL: http://localhost:4000/api/v1` y `withCredentials: true`
- `register(email, password, name)` → `POST /auth/register`
- `getMe()` → `GET /auth/me`
- No necesita interceptors de token: axios envía las cookies automáticamente gracias a `withCredentials: true`
- Extrae el user del `data.data.user` de la respuesta de axios

**register-form.tsx**:
- Tres campos: email (type email, required), password (type password, minLength 6), name (text, opcional)
- Validación inline con HTML5 + mensajes custom
- Estado local para loading, error global y errores por campo
- Botón submit deshabilitado mientras carga
- En éxito, llama a `authContext.register()` y redirige a `/` con `next/navigation`
- En error, muestra mensaje en un elemento alert o texto rojo arriba del formulario

### Estructura del Código

**Backend** (ADR-004):
```
backend/src/
├── config/
│   └── auth.ts                      ← AUTH (SALT_ROUNDS, SESSION_DURATION_MS, TOKEN_BYTES)
├── middlewares/
│   ├── auth.middleware.ts           ← valida cookie session_token, inyecta req.user
│   └── error-handler.ts             ← manejo centralizado de errores
├── modules/
│   └── auth/
│       ├── auth.routes.ts           ← POST /register, GET /me
│       ├── auth.controller.ts       ← handlers register(), getMe()
│       ├── auth.service.ts          ← register(), getMe(): lógica de negocio
│       ├── auth.schema.ts           ← Zod schemas de validación
│       ├── auth.dto.ts              ← mapeo dominio → response
│       ├── auth.repository.ts       ← findByEmail(), create()
│       ├── session.service.ts       ← createSession(), findSession()
│       └── session.repository.ts    ← CRUD de Session
├── utils/
│   ├── password.ts                  ← hashPassword(), verifyPassword()
│   ├── token.ts                     ← generateSessionToken() → { raw, hash }
│   ├── normalize-email.ts           ← normalización de email
│   ├── api-response.ts              ← successResponse(), errorResponse()
│   └── app-error.ts                 ← AppError class
└── lib/
    └── prisma.ts                    ← Prisma Client singleton
```

**Frontend** (ADR-011):
```
frontend/src/
├── features/auth/
│   ├── auth-context.tsx
│   ├── auth-service.ts
│   └── components/
│       └── register-form.tsx
├── app/
│   ├── layout.tsx
│   └── register/
│       └── page.tsx
└── components/ui/
    ├── input.tsx
    ├── button.tsx
    └── label.tsx
```

## Casos de Borde y Errores

### Backend

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Email ya registrado | `{ "success": false, "error": "El email ya está registrado" }` | 409 Conflict |
| Email inválido (sin @) | `{ "success": false, "error": "Email inválido" }` | 400 Bad Request |
| Password < 6 caracteres | `{ "success": false, "error": "La contraseña debe tener al menos 6 caracteres" }` | 400 Bad Request |
| Email vacío | `{ "success": false, "error": "El email es requerido" }` | 400 Bad Request |

### Frontend

| Escenario | Comportamiento |
|---|---|
| Email inválido | Texto "Email inválido" debajo del input |
| Password < 6 caracteres | Texto "Mínimo 6 caracteres" debajo del input |
| Error 409 (email duplicado) | "El email ya está registrado" como error global |
| Error 500 | "Error del servidor. Intente nuevamente." |
| Registro exitoso | Redirige a `/` con sesión iniciada |
| Loader | Botón deshabilitado con spinner |
| GET /me retorna 401 | `user = null`, `isAuthenticated = false` |

### Seguridad (ADR-008)

| Regla | Detalle |
|---|---|
| Cookie httpOnly | El token NO es accesible via `document.cookie` o JavaScript |
| Cookie Secure | Solo se envía sobre HTTPS (en producción) |
| SameSite=Lax | Protege contra CSRF básico |
| Token en DB | Se guarda como hash SHA-256, nunca en texto plano |
| Sin localStorage | El token NO se almacena en localStorage ni sessionStorage |

## Plan de Implementación

### Backend
1. Implementar `auth.repository.ts` con `findByEmail()` y `create()`
2. Implementar `session.repository.ts` con `create()`
3. Implementar `session.service.ts` con `createSession()` (genera token opaco via crypto, guarda hash SHA-256)
4. Implementar `auth.service.ts` con `register()` (valida email único, hashea password, crea user + sesión, retorna token raw)
5. Implementar `auth.service.ts` con `getMe()` (recupera user desde session activa)
6. Implementar `auth.controller.ts`:
   - `register()`: valida schema, llama service, setea cookie httpOnly con token raw, responde `{ user }` en body
   - `getMe()`: valida cookie via middleware, retorna user
7. Implementar `auth.middleware.ts`: extrae `session_token` de cookie, busca sesión en DB, valida vigencia, inyecta `req.user`
8. Configurar `auth.routes.ts` con `POST /register` y `GET /me`, montar en `routes/index.ts`
9. Configurar CORS con `credentials: true` (ya implementado en `cors.ts`)
10. Tests: unitario de `AuthService.register`, integración del endpoint con supertest

### Frontend
11. Instalar dependencia: `npm install axios`
12. Configurar `lib/axios.ts` con `baseURL` y `withCredentials: true`
13. Implementar `features/auth/auth-service.ts` con `register()` y `getMe()` usando la instancia de axios
14. Implementar `features/auth/auth-context.tsx`:
    - `AuthProvider` con estado `user`, `loading`
    - `useEffect` al montar que llama `getMe()` para restaurar sesión
    - `register()` → llama service + `refreshUser()`
    - `logout()` → `POST /auth/logout` + limpia estado
    - **NO usar localStorage**
15. Agregar componentes UI de shadcn: Input, Button, Label (con `npx shadcn add ...`)
16. Implementar `features/auth/components/register-form.tsx`
17. Crear página `app/register/page.tsx`
18. Modificar `app/layout.tsx` para envolver con `<AuthProvider>`
19. Tests: unitario del auth-service, render del formulario con RTL
