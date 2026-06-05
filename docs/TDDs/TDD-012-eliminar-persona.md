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
*   Solo usuarios con rol ADMIN pueden eliminar una persona
*   La eliminación es lógica (soft-delete): se setea `deletedAt` y `deletedById`
*   No se puede eliminar si la persona tiene un donante, paciente o gestante activo
*   No se puede eliminar una persona ya soft-deleted
*   Se registra el usuario autenticado como `deletedBy`
*   El usuario debe confirmar la eliminación antes de ejecutarla
*   Los errores del servidor deben mostrarse en el diálogo de confirmación

## Diseño Técnico (RFC)

### Modelo de Datos

Misma entidad `Persona`. El soft-delete setea `deletedAt` y `deletedById`.

### Contrato de API

*   **Endpoint**: `DELETE /api/v1/personas/:id`
*   **Auth**: Requiere sesión activa con rol ADMIN
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

### Backend

#### Estructura del Código (Backend)

```
backend/src/modules/persona/
├── persona.routes.ts        ← se agrega DELETE /:id con authMiddleware + adminMiddleware
├── persona.controller.ts    ← se agrega handler remove()
├── persona.service.ts       ← se agrega eliminar(): validar existencia, sin vinculaciones activas, soft-delete
└── persona.repository.ts    ← se agregan softDelete(), findById(), countVinculacionesActivas()
```

#### Lógica de negocio (service)

`eliminar(id, deletedById)`:
1. `findById(id)` — si no existe o está soft-deleted → `AppError(404, 'Persona no encontrada')`
2. `countVinculacionesActivas(id)` — cuenta donante + paciente + gestante con `deletedAt = null`
3. Si `vinculaciones > 0` → `AppError(409, 'No se puede eliminar la persona porque tiene un donante, paciente o gestante activo')`
4. `softDelete(id, deletedById)` — setea `deletedAt = new Date()`, `deletedById`
5. Retorna `{ message: 'Persona eliminada correctamente' }`

#### Controller

`remove(req, res, next)`:
1. Tomar `id` de `req.params`
2. Llamar `personaService.eliminar(id, req.user.id)`
3. Responder `200` con `successResponse({ message })`

### Frontend

#### Contrato de UI

| Acción | Resultado |
|--------|-----------|
| Usuario hace clic en "Eliminar" (ícono Trash2) en una fila | Abre AlertDialog de confirmación preguntando "¿Eliminar persona?" |
| Usuario hace clic en "Eliminar" en el AlertDialog | DELETE /api/v1/personas/:id, se cierra el AlertDialog, se refresca la lista |
| Usuario hace clic en "Cancelar" | Se cierra el AlertDialog sin eliminar |
| Error del servidor (persona con vinculaciones activas) | Se muestra ErrorAlert dentro del AlertDialog con el mensaje del backend |
| Error de red | Se muestra ErrorAlert con mensaje genérico |

#### Estructura del Código (Frontend)

```
frontend/features/personas/
├── personas-service.ts             ← eliminar() → hace DELETE /personas/:id
├── hooks/
│   └── usePersonaDelete.ts         ← handleDelete(): llama eliminar(), maneja errores
└── components/
    ├── persona-delete-dialog.tsx   ← AlertDialog de confirmación con manejo de errores
    └── personas-table.tsx          ← botón "Eliminar" (Trash2) que setea deleteId
```

##### personas-service.ts

`eliminar(id: number): Promise<void>`:
1. Llama `api.delete(\`/personas/${id}\`)` con Axios
2. No retorna contenido (el backend responde con `{ success, data: { message } }` pero al frontend solo le importa que no haya error)

El interceptor de Axios transforma errores HTTP (404, 409, 403) en `Error` con el mensaje del backend.

##### usePersonaDelete.ts

Hook que gestiona el estado del diálogo de eliminación:

- `deleteId: number | null` — cuando se setea (distinto de null), el AlertDialog se abre
- `deleting: boolean` — true mientras se procesa la eliminación, deshabilita botones
- `error: string | null` — mensaje de error del backend para mostrar en el AlertDialog
- `handleDelete()`:
  1. Valida que `deleteId` no sea null
  2. Setea `deleting = true`, resetea `error = null`
  3. Llama `personasService.eliminar(deleteId)`
  4. Al éxito: limpia `deleteId` (cierra el diálogo) y ejecuta `onSuccess?.()` (refresca lista)
  5. En error: captura el mensaje con `extractErrorMessage(err)` y lo setea en `error` para mostrarlo
  6. `finally`: resetea `deleting = false`
- `handleClose()`: limpia `deleteId` y `error` (cierra el diálogo sin eliminar)

##### persona-delete-dialog.tsx

Componente con shadcn `AlertDialog`:

1. Se abre cuando `deleteId` no es null: `open={!!deleteId}`
2. Muestra título "¿Eliminar persona?" y descripción "Esta acción no se puede deshacer. La persona será eliminada permanentemente."
3. Botón "Cancelar": llama `onClose()` → cierra el diálogo
4. Botón "Eliminar" (rojo, clase `bg-destructive`): llama `onConfirm()` → ejecuta `handleDelete()`
5. Cuando `deleting` es true, ambos botones se deshabilitan y el botón "Eliminar" muestra "Eliminando..."
6. Si `error` tiene valor, se muestra `<ErrorAlert message={error} />` entre el header y el footer

```tsx
<AlertDialog open={!!deleteId} onOpenChange={(o) => !o && onClose()}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Eliminar persona?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta acción no se puede deshacer. La persona será eliminada permanentemente.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <ErrorAlert message={error} />
    <AlertDialogFooter>
      <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive ..." onClick={onConfirm} disabled={deleting}>
        {deleting ? 'Eliminando...' : 'Eliminar'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

##### personas-table.tsx

La columna de acciones incluye un botón "Eliminar" (`Trash2` icon con clase `text-destructive`) que ejecuta `onEliminar(row.original.id)`:

```tsx
<Button variant="ghost" size="icon" onClick={() => onEliminar(row.original.id)}>
  <Trash2 className="size-4 text-destructive" />
  <span className="sr-only">Eliminar</span>
</Button>
```

##### page.tsx (integración)

```tsx
const { deleteId, setDeleteId, handleDelete, handleClose, error: deleteError, deleting } =
  usePersonaDelete(refetch)

// Tabla: al hacer clic en eliminar
onEliminar={(id) => setDeleteId(id)}

// AlertDialog de confirmación
<PersonaDeleteDialog
  deleteId={deleteId}
  onClose={handleClose}
  onConfirm={handleDelete}
  error={deleteError}
  deleting={deleting}
/>
```

- `setDeleteId(id)` abre el AlertDialog
- `handleClose()` cierra el diálogo sin eliminar
- `handleDelete()` ejecuta la eliminación

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Eliminación exitosa | `{ "success": true, "data": { "message": "Persona eliminada correctamente" } }` | 200 OK |
| Persona no encontrada (o soft-deleted) | `{ "error": "Persona no encontrada" }` | 404 Not Found |
| Persona con donante/paciente/gestante activo | `{ "error": "No se puede eliminar la persona porque tiene un donante, paciente o gestante activo" }` | 409 Conflict |
| Usuario sin rol ADMIN | `{ "error": "Acción no permitida. Se requiere rol ADMIN" }` | 403 Forbidden |
| Sin autenticación | `{ "error": "No autenticado" }` | 401 Unauthorized |

## Plan de Implementación

### Backend
1. Agregar `softDelete(id, deletedById)`, `findById(id)` y `countVinculacionesActivas(id)` en `persona.repository.ts`
2. Implementar `eliminar(id, deletedById)` en `persona.service.ts` — busca persona, verifica vinculaciones, soft-delete
3. Agregar handler `remove()` en `persona.controller.ts` con OpenAPI docs
4. Agregar ruta `DELETE /:id` con authMiddleware + adminMiddleware en `persona.routes.ts`
5. Tests de integración: 200 éxito, 404 persona no encontrada, 409 vinculaciones activas, 403 no admin, 401 sin auth

### Frontend
1. Implementar `eliminar(id)` en `personas-service.ts` que hace DELETE /personas/:id
2. Implementar `usePersonaDelete.ts` con estado `deleteId`, `deleting`, `error` y handlers `handleDelete()`, `handleClose()`
3. Implementar `persona-delete-dialog.tsx` con shadcn AlertDialog, botón de confirmación deshabilitado durante `deleting` y ErrorAlert para errores del servidor
4. Implementar en `personas-table.tsx`: botón "Eliminar" por fila (ícono Trash2 rojo) que ejecuta `onEliminar(row.original.id)`
5. Integrar en `page.tsx`: conectar `usePersonaDelete(refetch)` y pasar props a `PersonaDeleteDialog`
