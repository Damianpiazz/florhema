---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Eliminar Recién Nacido (soft-delete)
---

# TDD-033: Eliminar Recién Nacido

## Contexto de Negocio (PRD)

### Objetivo
Permitir eliminar lógicamente un recién nacido del sistema. Solo administradores.

### User Persona
*   **Nombre**: Administrador del sistema
*   **Necesidad**: Eliminar registros de recién nacidos cargados por error.

### Criterios de Aceptación
*   Solo administradores
*   Soft-delete del `RecienNacido`, de la `Persona` base y del `ResultadoCoombs` asociado
*   No se puede eliminar un recién nacido ya soft-deleted

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `DELETE /api/v1/recien-nacidos/:id`
*   **Auth**: Requiere sesión activa con rol ADMIN
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": { "message": "Recién nacido eliminado correctamente" }
}
```

### Backend

#### Service: `eliminar(id)`

1. Validar que el recién nacido existe y no está soft-deleted → `AppError(404, 'Recién nacido no encontrado')`
2. Soft-delete en transacción:
   - `prisma.recienNacido.update({ where: { id }, data: { deletedAt: new Date() } })`
   - `prisma.persona.update({ where: { id: recienNacido.personaId }, data: { deletedAt: new Date() } })`
   - Si tiene `resultadoCoombs`: soft-delete también

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Recién nacido no existe | `{ error: "Recién nacido no encontrado" }` | 404 |
| Ya eliminado | `{ error: "Recién nacido no encontrado" }` | 404 |
| Usuario no admin | `{ error: "Acción no permitida. Se requiere rol ADMIN" }` | 403 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Repository: softDelete con transacción
2. Service: eliminar() con soft-delete en cascada
3. Ruta DELETE /:id con adminMiddleware
4. Tests

### Frontend
5. Botón "Eliminar" visible solo para admin en cada fila
6. AlertDialog de confirmación
