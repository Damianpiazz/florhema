---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Eliminar Grupo Sanguíneo
---

# TDD-008: Eliminar Grupo Sanguíneo

## Contexto de Negocio (PRD)

### Objetivo
Permitir eliminar (soft-delete) un grupo sanguíneo del catálogo. No se elimina físicamente para mantener la integridad referencial con personas y otros registros que lo referencian. Solo accesible para administradores.

### User Persona
*   **Nombre**: Administrador del sistema
*   **Necesidad**: Deshabilitar un grupo sanguíneo que ya no debe usarse en nuevos registros.

### Criterios de Aceptación
*   Solo ADMIN puede eliminar un grupo sanguíneo
*   La eliminación es lógica (soft-delete): se setea `deletedAt`
*   Si el grupo tiene personas vinculadas (donantes, pacientes, gestantes), no se puede eliminar
*   Una vez eliminado, no aparece en el listado de TDD-005

## Diseño Técnico (RFC)

### Modelo de Datos

Misma entidad `GrupoSanguineo`. El soft-delete setea `deletedAt` y `deletedById`.

### Contrato de API

*   **Endpoint**: `DELETE /api/v1/grupos-sanguineos/:id`
*   **Auth**: Requiere sesión ADMIN
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": { "message": "Grupo sanguíneo eliminado correctamente" }
}
```
*   **Response** `409 Conflict` (si tiene personas vinculadas):
```json
{ "success": false, "error": "No se puede eliminar el grupo porque tiene personas asociadas" }
```

### Estructura del Código

Se agrega al módulo existente:

```
src/modules/grupo-sanguineo/
├── grupo-sanguineo.routes.ts        ← agrega DELETE /:id con adminMiddleware
├── grupo-sanguineo.controller.ts    ← handler remove()
├── grupo-sanguineo.service.ts       ← eliminar(): validar sin vinculaciones, soft-delete
└── grupo-sanguineo.repository.ts    ← softDelete(), countPersonasVinculadas()
```

### Verificación de vinculaciones

Antes de eliminar, el service debe contar personas asociadas:

```ts
const personasVinculadas = await prisma.persona.count({
  where: { grupoSanguineoId: id, deletedAt: null }
})
if (personasVinculadas > 0) {
  throw new AppError(409, 'No se puede eliminar el grupo porque tiene personas asociadas')
}
```

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Grupo no encontrado | `{ "error": "Grupo sanguíneo no encontrado" }` | 404 Not Found |
| Grupo con personas activas | `{ "error": "No se puede eliminar el grupo porque tiene personas asociadas" }` | 409 Conflict |
| Usuario sin rol ADMIN | `{ "error": "Acción no permitida. Se requiere rol ADMIN" }` | 403 Forbidden |
| Grupo ya soft-deleted | `{ "error": "Grupo sanguíneo no encontrado" }` | 404 Not Found |
| Eliminación exitosa | `{ "data": { "message": "..." } }` | 200 OK |

## Plan de Implementación

1. Implementar en repository: `softDelete(id, deletedById)`, `countPersonasVinculadas(id)`, `findById(id)` (solo activos)
2. Implementar en service: `eliminar(id, deletedById)` — busca grupo, verifica sin vinculaciones, soft-delete
3. Agregar handler `remove()` en controller
4. Agregar ruta `DELETE /:id` con authMiddleware + adminMiddleware
5. Tests: integración con supertest (éxito, 404, 409, 403)
