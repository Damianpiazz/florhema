---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Eliminar Transfusión (soft-delete)
---

# TDD-023: Eliminar Transfusión

## Contexto de Negocio (PRD)

### Objetivo
Permitir eliminar lógicamente (soft-delete) una transfusión del sistema. No se borra físicamente, solo se marca como eliminada para conservar la trazabilidad.

### User Persona
*   **Nombre**: Administrador del sistema
*   **Necesidad**: Eliminar transfusiones mal cargadas o duplicadas manteniendo la integridad del historial de auditoría.

### Criterios de Aceptación
*   Solo administradores pueden eliminar transfusiones (`adminMiddleware`)
*   La transfusión se marca con `deletedAt` (soft-delete)
*   La `CompatibilidadTransfusional` y `ResultadoCoombs` asociados también se soft-deletean
*   No se puede eliminar una transfusión ya soft-deleted

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `DELETE /api/v1/transfusiones/:id`
*   **Auth**: Requiere sesión activa con rol ADMIN
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": { "message": "Transfusión eliminada correctamente" }
}
```

### Backend

#### Estructura del Código

```
backend/src/modules/transfusion/
├── transfusion.routes.ts        ← se agrega DELETE /:id con adminMiddleware
├── transfusion.controller.ts    ← se agrega handler eliminar()
├── transfusion.service.ts       ← se agrega eliminar(): soft-delete transfusión + compatibilidad + coombs
└── transfusion.repository.ts    ← se agrega softDelete()
```

#### Service: `eliminar(id: number)`

1. Validar que la transfusión existe y no está soft-deleted → `AppError(404, 'Transfusión no encontrada')`
2. Soft-delete en transacción:
   - `prisma.transfusion.update({ where: { id }, data: { deletedAt: new Date() } })`
   - Si tiene `compatibilidad`: soft-delete también
   - Si tiene `resultadoCoombs`: soft-delete también
3. Retornar mensaje de éxito

#### Controller

```typescript
async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await transfusionService.eliminar(id)
    res.status(200).json(successResponse({ message: 'Transfusión eliminada correctamente' }))
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
- Botón "Eliminar" (ícono Trash2) en cada fila, visible solo para administradores
- AlertDialog de confirmación: "¿Eliminar transfusión?"
- Al confirmar: DELETE → cierra AlertDialog → refresca tabla
- Manejo de errores con ErrorAlert

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Transfusión no existe | `{ error: "Transfusión no encontrada" }` | 404 |
| Transfusión ya eliminada | `{ error: "Transfusión no encontrada" }` | 404 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |
| Usuario no admin | `{ error: "Acción no permitida. Se requiere rol ADMIN" }` | 403 |

## Plan de Implementación

### Backend
1. Agregar `softDelete()` en `transfusion.repository.ts`
2. Implementar `eliminar()` en `transfusion.service.ts` con transacción
3. Agregar handler `eliminar()` en `transfusion.controller.ts`
4. Agregar `DELETE /:id` en `transfusion.routes.ts` con `adminMiddleware`
5. Tests: eliminación exitosa, 404, 403 sin admin, doble eliminación

### Frontend
6. Agregar `eliminar()` en `transfusiones-service.ts`
7. Crear `transfusion-delete-dialog.tsx` con AlertDialog
8. Agregar botón "Eliminar" en tabla (visible solo para admin)
9. Tests: confirmación funciona, llamada correcta, manejo de errores
