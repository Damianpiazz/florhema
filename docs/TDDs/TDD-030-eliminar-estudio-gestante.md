---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Eliminar Estudio de Gestante (soft-delete)
---

# TDD-030: Eliminar Estudio de Gestante

## Contexto de Negocio (PRD)

### Objetivo
Permitir eliminar lógicamente un estudio de gestante. Solo administradores.

### User Persona
*   **Nombre**: Administrador del sistema
*   **Necesidad**: Eliminar estudios cargados por error.

### Criterios de Aceptación
*   Solo administradores
*   Soft-delete del estudio y del `ResultadoCoombs` asociado
*   No se puede eliminar un estudio ya soft-deleted

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `DELETE /api/v1/estudios-gestante/:id`
*   **Auth**: Requiere sesión activa con rol ADMIN
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": { "message": "Estudio eliminado correctamente" }
}
```

### Backend

#### Service: `eliminar(id)`

1. Validar que el estudio existe y no está soft-deleted → `AppError(404, 'Estudio no encontrado')`
2. Soft-delete en transacción:
   - `prisma.estudioGestante.update({ where: { id }, data: { deletedAt: new Date() } })`
   - Si tiene `resultadoCoombs`: soft-delete también
3. Retornar mensaje de éxito

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Estudio no existe | `{ error: "Estudio no encontrado" }` | 404 |
| Estudio ya eliminado | `{ error: "Estudio no encontrado" }` | 404 |
| Usuario no admin | `{ error: "Acción no permitida. Se requiere rol ADMIN" }` | 403 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Agregar `softDelete()` en repository
2. Implementar `eliminar()` en service con transacción
3. Ruta DELETE /:id con adminMiddleware
4. Tests

### Frontend
5. Botón "Eliminar" visible solo para admin en cada fila de estudios
6. AlertDialog de confirmación
