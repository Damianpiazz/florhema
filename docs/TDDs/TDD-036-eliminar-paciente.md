---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Eliminar Paciente (soft-delete)
---

# TDD-036: Eliminar Paciente

## Contexto de Negocio (PRD)

### Objetivo
Permitir eliminar lógicamente el rol de paciente de una persona. Solo administradores.

### User Persona
*   **Nombre**: Administrador del sistema
*   **Necesidad**: Desvincular el rol de paciente de una persona cuando fue asignado por error.

### Criterios de Aceptación
*   Solo administradores
*   No se puede eliminar si tiene transfusiones activas
*   Soft-delete: se setea `deletedAt`

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `DELETE /api/v1/pacientes/:id`
*   **Auth**: Requiere sesión activa con rol ADMIN
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": { "message": "Paciente eliminado correctamente" }
}
```
*   **Response** `409 Conflict`:
```json
{
  "success": false,
  "error": "No se puede eliminar el paciente porque tiene transfusiones activas"
}
```

### Backend

#### Service: `eliminar(id)`

1. Validar que paciente existe y no está soft-deleted → `AppError(404, 'Paciente no encontrado')`
2. `countActiveTransfusiones(id)` — si > 0 → `AppError(409, 'No se puede eliminar el paciente porque tiene transfusiones activas')`
3. `softDelete(id)`

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Paciente no existe | `{ error: "Paciente no encontrado" }` | 404 |
| Paciente con transfusiones activas | `{ error: "No se puede eliminar el paciente porque tiene transfusiones activas" }` | 409 |
| Usuario no admin | `{ error: "Acción no permitida. Se requiere rol ADMIN" }` | 403 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Repository: softDelete, findById, countActiveTransfusiones
2. Service: eliminar() con validación
3. Ruta DELETE /:id con adminMiddleware
4. Tests

### Frontend
5. Botón "Eliminar" visible solo para admin en la sección paciente del detalle
