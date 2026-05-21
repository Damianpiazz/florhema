---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Actualizar Grupo Sanguíneo
---

# TDD-007: Actualizar Grupo Sanguíneo

## Contexto de Negocio (PRD)

### Objetivo
Permitir corregir datos de un grupo sanguíneo existente (tipo o factorRh) en casos excepcionales. Solo accesible para administradores.

### User Persona
*   **Nombre**: Administrador del sistema
*   **Necesidad**: Corregir un grupo sanguíneo mal cargado o revertir un soft-delete.

### Criterios de Aceptación
*   Solo ADMIN puede actualizar un grupo sanguíneo
*   No se puede duplicar la combinación tipo + factorRh con otro registro existente
*   No se puede actualizar un grupo soft-deleted (debe restaurarse primero con DELETE)
*   Los cambios deben auditarse mediante los campos updatedAt / updatedBy

## Diseño Técnico (RFC)

### Modelo de Datos

Mismo modelo que TDD-005. La actualización utiliza `updatedAt` y `updatedById` automáticos.

### Contrato de API

*   **Endpoint**: `PUT /api/v1/grupos-sanguineos/:id`
*   **Auth**: Requiere sesión ADMIN
*   **Request Body**:
```json
{
  "tipo": "AB",
  "factorRh": "NEGATIVO"
}
```
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "item": { "id": 1, "tipo": "AB", "factorRh": "NEGATIVO" }
  }
}
```
*   **Response** `403 Forbidden`:
```json
{ "success": false, "error": "Acción no permitida. Se requiere rol ADMIN" }
```

### Estructura del Código

Se agrega al módulo existente de `grupo-sanguineo/`:

```
src/modules/grupo-sanguineo/
├── grupo-sanguineo.routes.ts        ← agrega PUT /:id con adminMiddleware
├── grupo-sanguineo.controller.ts    ← handler update()
├── grupo-sanguineo.service.ts       ← actualizar(): validar unicidad, actualizar
└── grupo-sanguineo.repository.ts    ← update(), findByTipoFactorRh()
```

### Schema Zod

```ts
const actualizarGrupoSchema = z.object({
  tipo: z.nativeEnum(TipoABO),
  factorRh: z.nativeEnum(FactorRh),
})
```

Se requiere un `adminMiddleware` (o validación inline en controller) que verifique `req.user.role === 'ADMIN'`.

### Patrón de respuesta

- Éxito: `successResponse({ item: {...} })`
- Error de unicidad: `errorResponse('Ya existe un grupo con esa combinación de tipo y factor Rh')`

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Grupo no encontrado | `{ "error": "Grupo sanguíneo no encontrado" }` | 404 Not Found |
| Combinación duplicada | `{ "error": "Ya existe un grupo con esa combinación de tipo y factor Rh" }` | 409 Conflict |
| Usuario sin rol ADMIN | `{ "error": "Acción no permitida. Se requiere rol ADMIN" }` | 403 Forbidden |
| Grupo soft-deleted | `{ "error": "Grupo sanguíneo no encontrado" }` | 404 Not Found |
| tipo inválido | Error Zod | 400 Bad Request |

## Plan de Implementación

1. Agregar `adminMiddleware` o función de validación de rol ADMIN reutilizable
2. Agregar al schema `actualizarGrupoSchema` con validación de enums
3. Implementar en repository: `update(id, data)`, `findByTipoFactorRh(tipo, factorRh)`
4. Implementar en service: `actualizar(id, data, userId)` — verifica existencia, verifica unicidad, actualiza
5. Agregar handler `update()` en controller
6. Agregar ruta `PUT /:id` con authMiddleware + adminMiddleware
7. Tests: integración con supertest (éxito, 404, 409, 403)
