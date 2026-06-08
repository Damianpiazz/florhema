---
autor: Damián Piazza
fecha: 2026-06-08
titulo: Eliminar Donación (soft-delete)
---

# TDD-017: Eliminar Donación

## Contexto de Negocio (PRD)

### Objetivo
Permitir eliminar lógicamente (soft-delete) una donación del sistema. La donación no se borra físicamente, solo se marca como eliminada para conservar la trazabilidad. La eliminación **no** modifica el semáforo del donante; ese cálculo se realiza desde el módulo Donante.

### User Persona
- **Nombre**: Administrador del sistema
- **Necesidad**: Eliminar donaciones mal cargadas o duplicadas manteniendo la integridad del historial de auditoría.

### Criterios de Aceptación
- Solo administradores pueden eliminar donaciones (`adminMiddleware`)
- La donación se marca con `deletedAt` (soft-delete)
- No se elimina físicamente el registro
- El `ResultadoSerologia` asociado también se soft-deletea

## Diseño Técnico (RFC)

### Contrato de API

#### `DELETE /api/v1/donaciones/:id`
**Response 200:**
```json
{
  "success": true,
  "data": { "message": "Donación eliminada correctamente" }
}
```

### Backend

#### Estructura del Código
```
backend/src/modules/donacion/
├── donacion.routes.ts        ← se agrega DELETE /:id con adminMiddleware
├── donacion.controller.ts    ← se agrega handler eliminar()
├── donacion.service.ts       ← se agrega eliminar(): soft-delete donación + serología
└── donacion.repository.ts    ← se agrega softDelete()
```

#### Service: `eliminar(id: number)`
1. Validar que la donación existe y no está ya soft-deleted → `AppError(404, 'Donación no encontrada')`
2. Soft-delete en transacción:
   - `prisma.donacion.update({ where: { id }, data: { deletedAt: new Date() } })`
   - Si tiene `resultadoSerologia`: soft-delete también
3. Retornar mensaje de éxito

#### Controller
```typescript
async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await donacionService.eliminar(id)
    res.status(200).json(successResponse({ message: 'Donación eliminada correctamente' }))
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
- AlertDialog de confirmación: "¿Eliminar donación?"
- Al confirmar: DELETE → cierra AlertDialog → refresca tabla
- Manejo de errores con ErrorAlert

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Donación no existe | `{ error: "Donación no encontrada" }` | 404 |
| Donación ya eliminada | `{ error: "Donación no encontrada" }` | 404 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |
| Usuario no admin | `{ error: "Acción no permitida. Se requiere rol ADMIN" }` | 403 |

## Plan de Implementación

### Backend
1. Agregar `softDelete()` en `donacion.repository.ts`
2. Implementar `eliminar()` en `donacion.service.ts` con transacción
3. Agregar handler `eliminar()` en `donacion.controller.ts`
4. Agregar `DELETE /:id` en `donacion.routes.ts` con `adminMiddleware`
5. Tests: eliminación exitosa, 404, 403 sin admin, doble eliminación

### Frontend
6. Agregar `eliminar()` en `donaciones-service.ts`
7. Crear `donacion-delete-dialog.tsx` con AlertDialog (mismo patrón que persona-delete-dialog)
8. Agregar botón "Eliminar" en tabla (visible solo para admin)
9. Tests: confirmación funciona, llamada correcta, manejo de errores
