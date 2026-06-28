---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Eliminar Gestante (soft-delete)
---

# TDD-026: Eliminar Gestante

## Contexto de Negocio (PRD)

### Objetivo
Permitir eliminar lógicamente (soft-delete) el rol de gestante de una persona. Solo accesible para administradores.

### User Persona
*   **Nombre**: Administrador del sistema
*   **Necesidad**: Desvincular el rol de gestante de una persona cuando fue asignado por error.

### Criterios de Aceptación
*   Solo administradores pueden eliminar una gestante
*   La eliminación es lógica (soft-delete): se setea `deletedAt`
*   No se puede eliminar si tiene `EstudioGestante` o `RecienNacido` activos
*   No se puede eliminar una gestante ya soft-deleted

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `DELETE /api/v1/gestantes/:id`
*   **Auth**: Requiere sesión activa con rol ADMIN
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": { "message": "Gestante eliminada correctamente" }
}
```
*   **Response** `409 Conflict`:
```json
{
  "success": false,
  "error": "No se puede eliminar la gestante porque tiene estudios o recién nacidos activos"
}
```

### Backend

#### Service: `eliminar(id: number)`

1. `findById(id)` — si no existe o está soft-deleted → `AppError(404, 'Gestante no encontrada')`
2. `countActiveEstudios(id)` — si > 0 → `AppError(409, 'No se puede eliminar la gestante porque tiene estudios o recién nacidos activos')`
3. `countActiveRecienNacidos(id)` — si > 0 → mismo error 409
4. `softDelete(id)` — setea `deletedAt`

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Gestante no existe | `{ error: "Gestante no encontrada" }` | 404 |
| Gestante con estudios activos | `{ error: "No se puede eliminar la gestante porque tiene estudios o recién nacidos activos" }` | 409 |
| Gestante con recién nacidos activos | Mismo error | 409 |
| Usuario no admin | `{ error: "Acción no permitida. Se requiere rol ADMIN" }` | 403 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Agregar `softDelete()`, `findById()`, `countActiveEstudios()`, `countActiveRecienNacidos()` en repository
2. Implementar `eliminar()` en service
3. Agregar handler y ruta `DELETE /:id` con adminMiddleware
4. Tests: 200 éxito, 404, 409 con dependencias, 403 no admin

### Frontend
5. Botón "Eliminar" visible solo para admin en la sección gestante del detalle
6. AlertDialog de confirmación con manejo de errores
