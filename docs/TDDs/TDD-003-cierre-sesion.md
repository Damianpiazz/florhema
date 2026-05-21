---
autor: Damián Piazza
fecha: 2026-05-17
titulo: Cierre de Sesión
---

# TDD-003: Cierre de Sesión

## Contexto de Negocio (PRD)

### Objetivo
Permitir que el usuario cierre sesión revocando su token actual, para que no pueda seguir siendo usado.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Cerrar sesión al finalizar su turno o al retirarse del puesto.

### Criterios de Aceptación
*   El sistema debe revocar la sesión activa marcando `revokedAt`
*   El token revocado no debe poder reutilizarse
*   Requiere cookie `session_token` válida
*   El frontend debe limpiar el estado del usuario y redirigir al login

## Diseño Técnico (RFC)

### Modelo de Datos

**Session**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | Int | PK, autoincrement |
| userId | Int | FK -> User, onDelete Cascade |
| tokenHash | String | NOT NULL |
| createdAt | DateTime | @default(now()) |
| expiresAt | DateTime | NOT NULL |
| revokedAt | DateTime? | |

### Backend

#### Contrato de API
*   **Endpoint**: `POST /api/v1/auth/logout`
*   **Middleware**: `authMiddleware` (lee cookie, valida sesión, inyecta `req.user`)
*   **Response** `200 OK`:
```json
{ "success": true, "data": { "message": "Sesión cerrada exitosamente" } }
```

#### Casos de Borde y Errores
| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Token inválido (no existe en BD) | `{ "success": false, "error": "No autenticado" }` | 401 Unauthorized |
| Token ya revocado | `{ "success": false, "error": "Sesión revocada" }` | 401 Unauthorized |
| Token expirado | `{ "success": false, "error": "Sesión expirada" }` | 401 Unauthorized |
| Sin cookie | `{ "success": false, "error": "No autenticado" }` | 401 Unauthorized |

#### Estructura del Código (Backend)
```
src/
└── modules/
    └── auth/
        ├── auth.routes.ts          ← POST /logout (con authMiddleware)
        ├── auth.controller.ts      ← logout(): responde 200
        ├── auth.service.ts         ← logout(): revocar sesión en BD
        ├── session.service.ts      ← revokeSession(userId): marcar revokedAt
        └── session.repository.ts   ← revoke(id): UPDATE revokedAt
```

El middleware `auth.middleware.ts` ya existe y es compartido con `GET /me`.

### Frontend

#### Contrato de UI

| Acción | Resultado |
|--------|-----------|
| Usuario hace clic en "Cerrar Sesión" | Se llama `POST /api/v1/auth/logout`, se limpia el estado, se redirige a `/login` |
| Error de red al cerrar sesión | Se muestra un mensaje de error, el usuario permanece en la página |

#### Estructura del Código (Frontend)
```
features/auth/
├── auth-service.ts          ← logout(): POST /auth/logout
├── auth-context.tsx         ← logout(): limpia user, redirige a /login
├── auth.schema.ts           ← logoutResponseSchema (opcional)
├── auth.dto.ts              ← parseLogoutResponse() (opcional)
└── components/
    └── logout-button.tsx    ← botón que consume useAuth().logout
```

## Plan de Implementación

### Backend
1. `session.repository.ts` — agregar `revoke(id: number)` → `UPDATE revokedAt = now()`
2. `session.service.ts` — agregar `revokeSession(userId: number)` → busca sesión activa y la revoca
3. `auth.service.ts` — agregar `logout(userId: number)` → llama `sessionService.revokeSession()`
4. `auth.controller.ts` — agregar `logout()` → obtiene `req.user.id`, llama service, responde 200
5. `auth.routes.ts` — agregar `router.post('/logout', authMiddleware, logout)`
6. Tests unitarios: revocar sesión activa, token en cookie inválido
7. Tests de integración: supertest con token válido, sin token, token revocado

### Frontend
8. `auth-service.ts` — agregar `logout(): Promise<void>` → `api.post('/auth/logout')`
9. `auth-context.tsx` — agregar método `logout()` → llama service, setea `user = null`, redirige a `/login`
10. `logout-button.tsx` — componente que usa `useAuth().logout`, muestra icono y texto
11. Ubicar el botón en un header/navbar compartido (por definir layout general)
12. Tests: `auth-service.logout()` llama al endpoint, `auth-context.logout()` limpia estado

## Dependencias
- `authMiddleware` ya implementado en TDD-002
- Sesión creada durante `login` (TDD-002)
