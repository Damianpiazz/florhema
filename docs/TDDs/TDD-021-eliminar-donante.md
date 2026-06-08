---
autor: Damián Piazza
fecha: 2026-06-08
titulo: Eliminar Donante (soft-delete)
---

# TDD-021: Eliminar Donante

## Contexto de Negocio (PRD)

### Objetivo
Permitir eliminar lógicamente (soft-delete) un donante cuando la persona ya no debe tener ese rol en el sistema. La eliminación no borra físicamente el registro, solo lo marca como eliminado para conservar la trazabilidad.

### User Persona
- **Nombre**: Administrador del sistema
- **Necesidad**: Deshabilitar un donante que fue asignado por error o que ya no debe operar como tal.

### Criterios de Aceptación
- Solo administradores pueden eliminar donantes (`adminMiddleware`)
- No se puede eliminar si el donante tiene donaciones activas (no soft-deleted)
- La eliminación es lógica: se setea `deletedAt` y `deletedById`
- No se puede eliminar un donante ya soft-deleted
- Se registra el usuario autenticado como `deletedBy`

## Diseño Técnico (RFC)

### Contrato de API

#### `DELETE /api/v1/donantes/:id`
**Auth**: Requiere sesión activa con rol ADMIN

**Response 200:**
```json
{
  "success": true,
  "data": { "message": "Donante eliminado correctamente" }
}
```

**Response 409 Conflict** (si tiene donaciones activas):
```json
{
  "success": false,
  "error": "No se puede eliminar el donante porque tiene donaciones activas"
}
```

### Backend

#### Service: `eliminar(id: number, deletedById: number)`
1. `findById(id)` — si no existe o está soft-deleted → `AppError(404, 'Donante no encontrado')`
2. `countDonacionesActivas(id)` desde `donacion.repository` — si `> 0` → `AppError(409, 'No se puede eliminar el donante porque tiene donaciones activas')`
3. `softDelete(id, deletedById)` — setea `deletedAt = new Date()`, `deletedById`
4. Retorna `{ message: 'Donante eliminado correctamente' }`

#### Controller
```typescript
async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await donanteService.eliminar(id, req.user.id)
    res.status(200).json(successResponse({ message: 'Donante eliminado correctamente' }))
  } catch (err) {
    next(err)
  }
}
```

#### Routes
```typescript
router.delete('/:id', authMiddleware, adminMiddleware, eliminar)
```

### Frontend

#### Contrato de UI
- Botón "Eliminar" (ícono Trash2) en la tabla de donantes, visible solo para admin
- AlertDialog de confirmación: "¿Eliminar donante?"
- Si el donante tiene donaciones activas, se muestra error del backend
- Al confirmar: DELETE → cierra AlertDialog → refresca lista

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Eliminación exitosa | `{ "success": true, "data": { "message": "..." } }` | 200 |
| Donante no encontrado | `{ "error": "Donante no encontrado" }` | 404 |
| Donante con donaciones activas | `{ "error": "No se puede eliminar el donante porque tiene donaciones activas" }` | 409 |
| Usuario sin rol ADMIN | `{ "error": "Acción no permitida. Se requiere rol ADMIN" }` | 403 |
| Sin autenticación | `{ "error": "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Agregar `softDelete()` en `donante.repository.ts`
2. Agregar `countDonacionesActivas()` que consulta donacion.repository
3. Implementar `eliminar()` en `donante.service.ts`
4. Agregar handler `eliminar()` en `donante.controller.ts`
5. Agregar `DELETE /:id` con authMiddleware + adminMiddleware en `donante.routes.ts`
6. Tests: eliminación exitosa, 404, 409 con donaciones activas, 403 sin admin

### Frontend
7. Agregar `eliminar()` en `donantes-service.ts`
8. Crear `donante-delete-dialog.tsx` con AlertDialog
9. Agregar botón "Eliminar" en tabla (visible solo para admin)
