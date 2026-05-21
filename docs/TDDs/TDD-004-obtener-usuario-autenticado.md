---
autor: Damián Piazza
fecha: 2026-05-17
titulo: Obtener Usuario Autenticado
---

# TDD-004: Obtener Usuario Autenticado

## Contexto de Negocio (PRD)

### Objetivo
Permitir que el frontend consulte quién es el usuario actualmente autenticado para mostrar su nombre y rol en la interfaz.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Verificar que su sesión sigue activa y ver su nombre y rol en la aplicación.

### Criterios de Aceptación
*   El sistema debe retornar los datos del usuario asociado al token
*   Debe rechazar si el token es inválido o la sesión fue revocada
*   No debe exponer la contraseña ni el tokenHash

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
*   **Endpoint**: `GET /api/v1/auth/me`
*   **Cookie**: `session_token=<token-opaco-hex>` (enviada automáticamente por el browser)
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "tecnico@hospital.com", "name": "Facundo Gómez", "role": "USER" }
  }
}
```

### Estructura del Código
```
src/
├── middleware/
│   └── auth.middleware.ts        ← extrae token, valida Session, inyecta req.user
└── modules/
    └── auth/
        ├── auth.routes.ts        ← define ruta GET /me (con middleware auth)
        ├── auth.controller.ts    ← handler me()
        ├── auth.service.ts       ← getCurrentUser(): obtener datos del usuario
        └── auth.repository.ts    ← findById()
```

*   **Middleware** (`src/middleware/auth.middleware.ts`): reutilizado del TDD-003, ya inyecta `req.user`
*   **Controller**: devuelve `req.user` (ya cargado por el middleware)
*   **Service**: si se necesita lógica extra, busca datos actualizados del usuario por ID
*   **Repository**: `findById` — consulta User por ID excluyendo soft-delete

## Casos de Borde y Errores
| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Token inválido | `{ "success": false, "error": "No autenticado" }` | 401 Unauthorized |
| Token revocado | `{ "success": false, "error": "Sesión revocada" }` | 401 Unauthorized |
| Usuario soft-deleted | `{ "success": false, "error": "No autenticado" }` | 401 Unauthorized |

## Plan de Implementación
1. Implementar `UserRepository.findById` (excluyendo soft-delete)
2. Implementar `AuthService.getCurrentUser` (usa middleware + consulta user actualizado)
3. Implementar `AuthController.me`
4. Agregar ruta `GET /api/v1/auth/me` con middleware auth
5. Tests: integración con token válido, inválido, usuario eliminado
