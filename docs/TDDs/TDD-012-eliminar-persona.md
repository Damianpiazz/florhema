---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Eliminar Persona
---

# TDD-012: Eliminar Persona

## Contexto de Negocio (PRD)

### Objetivo
Permitir eliminar (soft-delete) una persona del sistema cuando ya no debe operarse con ella. Solo accesible para administradores.

### User Persona
*   **Nombre**: Administrador del sistema
*   **Necesidad**: Deshabilitar una persona que fue cargada por error o que ya no debe tener actividad en el servicio.

### Criterios de Aceptación
*   Solo ADMIN puede eliminar una persona
*   La eliminación es lógica (soft-delete): se setea `deletedAt`
*   No se puede eliminar si la persona tiene un donante, paciente o gestante activo
*   No se puede eliminar una persona ya soft-deleted
*   Se registra el usuario autenticado como `deletedBy`

## Diseño Técnico (RFC)

### Modelo de Datos

Misma entidad `Persona`. El soft-delete setea `deletedAt` y `deletedById`.

### Contrato de API

*   **Endpoint**: `DELETE /api/v1/personas/:id`
*   **Auth**: Requiere sesión ADMIN
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": { "message": "Persona eliminada correctamente" }
}
```
*   **Response** `409 Conflict` (si tiene donante/paciente/gestante activo):
```json
{ "success": false, "error": "No se puede eliminar la persona porque tiene un donante, paciente o gestante activo" }
```

### Estructura del Código

```
src/modules/persona/
├── persona.routes.ts        ← agrega DELETE /:id con adminMiddleware
├── persona.controller.ts    ← handler remove()
├── persona.service.ts       ← eliminar(): validar sin vinculaciones activas, soft-delete
└── persona.repository.ts    ← softDelete(), findById(), countVinculacionesActivas()
```

### Verificación de vinculaciones

Antes de eliminar, el service debe verificar que la persona no tenga relaciones activas:

```ts
const persona = await personaRepository.findById(id)
if (!persona) throw new AppError(404, 'Persona no encontrada')

const vinculaciones = await personaRepository.countVinculacionesActivas(id)
// vinculaciones = donante (not deleted) + paciente (not deleted) + gestante (not deleted)
if (vinculaciones > 0) {
  throw new AppError(409, 'No se puede eliminar la persona porque tiene un donante, paciente o gestante activo')
}

await personaRepository.softDelete(id, deletedById)
```

### adminMiddleware

Se puede crear un middleware genérico reutilizable:

```ts
// src/middlewares/admin.middleware.ts
export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json(errorResponse('Acción no permitida. Se requiere rol ADMIN'))
  }
  next()
}
```

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Persona no encontrada | `{ "error": "Persona no encontrada" }` | 404 Not Found |
| Persona con donante activo | `{ "error": "No se puede eliminar la persona porque tiene un donante, paciente o gestante activo" }` | 409 Conflict |
| Usuario sin rol ADMIN | `{ "error": "Acción no permitida. Se requiere rol ADMIN" }` | 403 Forbidden |
| Persona ya soft-deleted | `{ "error": "Persona no encontrada" }` | 404 Not Found |
| Eliminación exitosa | `{ "data": { "message": "Persona eliminada correctamente" } }` | 200 OK |

## Plan de Implementación

1. Implementar en repository: `softDelete(id, deletedById)`, `findById(id)` (solo activos), `countVinculacionesActivas(id)` — cuenta donante, paciente, gestante con `deletedAt = null`
2. Implementar `admin.middleware.ts` reutilizable
3. Implementar en service: `eliminar(id, deletedById)` — busca persona, verifica sin vinculaciones, soft-delete
4. Agregar handler `remove()` en controller
5. Agregar ruta `DELETE /:id` con authMiddleware + adminMiddleware
6. Tests: integración con supertest (éxito, 404, 409, 403)
