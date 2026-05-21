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

### Contrato de API
*   **Endpoint**: `POST /api/v1/auth/logout`
*   **Cookie**: `session_token=<token-opaco-hex>` (enviada automáticamente por el browser)
*   **Response** `200 OK`:
```json
{ "success": true, "data": { "message": "Sesión cerrada exitosamente" } }
```

### Estructura del Código
```
src/
├── middleware/
│   └── auth.middleware.ts        ← extrae token, valida Session, inyecta req.user
└── modules/
    └── auth/
        ├── auth.routes.ts        ← define ruta POST /logout (con middleware auth)
        ├── auth.controller.ts    ← handler logout()
        ├── auth.service.ts       ← logout(): revocar sesión
        └── session.repository.ts ← findByTokenHash(), revoke()
```

*   **Middleware** (`src/middleware/auth.middleware.ts`):
    1. Lee `session_token` de la cookie (`req.cookies`)
    2. Hashea el token con SHA-256
    3. Busca Session por tokenHash en BD
    4. Valida que no esté revocada (`revokedAt = null`)
    5. Valida que no esté expirada (`expiresAt > now`)
    6. Obtiene el User asociado
    7. Inyecta `req.user` con `{ id, email, name, role }`
    8. Llama a `next()` o responde 401
*   **Controller**: usa el middleware, delega revocación al service
*   **Service**: marca `revokedAt` en la sesión actual

## Casos de Borde y Errores
| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Token inválido (no existe en BD) | `{ "success": false, "error": "No autenticado" }` | 401 Unauthorized |
| Token ya revocado | `{ "success": false, "error": "Sesión revocada" }` | 401 Unauthorized |
| Token expirado | `{ "success": false, "error": "Sesión expirada" }` | 401 Unauthorized |
| Sin cookie | `{ "success": false, "error": "No autenticado" }` | 401 Unauthorized |

## Plan de Implementación
1. Implementar middleware `auth.middleware.ts`: leer cookie, hashear token, buscar Session por tokenHash, validar vigencia, inyectar `req.user`
2. Implementar `SessionRepository.findByTokenHash` y `SessionRepository.revoke`
3. Implementar `AuthService.logout`
4. Implementar `AuthController.logout`
5. Agregar ruta `POST /api/v1/auth/logout` con middleware auth
6. Tests: integración con token válido, inválido, revocado, expirado
