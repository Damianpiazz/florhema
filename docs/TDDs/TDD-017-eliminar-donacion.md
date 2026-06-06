---
autor: Damián Piazza
fecha: 2026-06-06
titulo: Eliminar Donación (soft-delete)
---

# TDD-017: Eliminar Donación

## Contexto de Negocio (PRD)

### Objetivo
Permitir eliminar lógicamente (soft-delete) una donación del sistema. La donación no se borra físicamente, solo se marca como eliminada para conservar la trazabilidad. Al eliminar, se recalcula el semáforo del donante considerando solo las donaciones activas restantes.

### User Persona
- **Nombre**: Administrador del sistema
- **Necesidad**: Eliminar donaciones mal cargadas o duplicadas manteniendo la integridad del historial de auditoría.

### Criterios de Aceptación
- Solo administradores pueden eliminar donaciones (`adminMiddleware`)
- La donación se marca con `deletedAt` (soft-delete)
- No se elimina físicamente el registro
- Se recalcula `semaforoAptitud` del donante según las donaciones activas restantes
- Si no quedan donaciones activas, el semáforo vuelve a VERDE
- El `ResultadoSerologia` asociado también se soft-deletea

## Diseño Técnico (RFC)

### Contrato de API

#### `DELETE /api/v1/donaciones/:id`
**Response 200:**
```json
{
  "success": true,
  "message": "Donación eliminada correctamente"
}
```

### Backend

#### Service: `eliminar(id: number)`
1. Validar que la donación existe y no está ya soft-deleted
2. Soft-delete en transacción:
   - `prisma.donacion.update({ where: { id }, data: { deletedAt: new Date() } })`
   - Si tiene `resultadoSerologia`: soft-delete también
3. Recalcular semáforo del donante basado en donaciones activas restantes:
   - Si no quedan donaciones activas → VERDE
   - Si quedan → evaluar serología de todas las activas
4. Retornar mensaje de éxito

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

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Donación no existe | `{ error: "Donación no encontrada" }` | 404 |
| Donación ya eliminada | `{ error: "La donación ya fue eliminada" }` | 400 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |
| Usuario no admin | `{ error: "No autorizado" }` | 403 |
| Sin donaciones activas restantes | Semáforo del donante → VERDE | 200 |
| Con donaciones activas sin serología positiva | Semáforo conserva estado | 200 |

## Plan de Implementación

### Backend
1. Agregar `eliminar()` en `donacion.service.ts` con transacción y recalculo
2. Agregar `eliminar()` en `donacion.controller.ts`
3. Agregar `DELETE /:id` en `donacion.routes.ts` con `adminMiddleware`
4. Tests: eliminación exitosa, 404, 403 sin admin, doble eliminación, recalculo de semáforo

### Frontend
5. Agregar `eliminar()` en `donaciones-service.ts`
6. Reutilizar patrón de `AlertDialog` (mismo que persona-delete-dialog)
7. Agregar botón "Eliminar" en tabla (visible solo para admin)
8. Tests: confirmación funciona, llamada correcta, manejo de errores
