---
autor: Damián Piazza
fecha: 2026-06-08
titulo: Actualizar Donante y Recalcular Semáforo
---

# TDD-020: Actualizar Donante

## Contexto de Negocio (PRD)

### Objetivo
Permitir cambiar la persona asociada a un donante (en caso de error de asignación) y recalcular el semáforo de aptitud del donante en base a los resultados serológicos de todas sus donaciones activas. El recalculo del semáforo es una operación explícita que el usuario puede disparar cuando lo necesite.

### User Persona
- **Nombre**: Técnico / Administrador del sistema
- **Necesidad**: Corregir la asignación de un donante a otra persona, o actualizar el semáforo de aptitud cuando se reciben nuevos resultados serológicos de donaciones previas.

### Criterios de Aceptación
- Solo usuarios autenticados pueden actualizar donantes
- El donante debe existir y no estar soft-deleted
- Se puede cambiar `personaId` (la nueva persona debe existir y no tener otro donante activo)
- El endpoint `POST /donantes/:id/recalcular-semaforo` evalúa todas las donaciones activas del donante:
  - Si alguna donación activa tiene alguna serología positiva → `ROJO`
  - Si todas las donaciones activas tienen serologías negativas (o no hay donaciones) → `VERDE`

## Diseño Técnico (RFC)

### Contrato de API

#### `PUT /api/v1/donantes/:id`
**Request Body:**
```json
{
  "personaId": 2
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "personaId": 2,
      "persona": { "id": 2, "dni": "87654321", "nombre": "María", "apellido": "García" },
      "semaforoAptitud": "VERDE"
    }
  }
}
```

#### `POST /api/v1/donantes/:id/recalcular-semaforo`
**Response 200:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "personaId": 1,
      "persona": { "id": 1, "dni": "12345678", "nombre": "Juan", "apellido": "Pérez" },
      "semaforoAptitud": "ROJO"
    }
  }
}
```

### Backend

#### Estructura del Código
```
backend/src/modules/donante/
├── donante.routes.ts        ← se agrega PUT /:id, POST /:id/recalcular-semaforo
├── donante.controller.ts    ← handlers actualizar(), recalcularSemaforo()
├── donante.service.ts       ← lógica: actualizar, recalcular semáforo
├── donante.repository.ts    ← update(), findDonacionesActivas()
└── donante.schema.ts        ← actualizarDonanteSchema
```

#### Service: `actualizar(id: number, input: ActualizarDonanteInput, userId: number)`
1. Validar que el donante existe y no está soft-deleted → `AppError(404, 'Donante no encontrado')`
2. Si incluye `personaId`:
   - Validar que la persona existe → `AppError(404, 'Persona no encontrada')`
   - Validar que la persona no tenga otro donante activo (excluyendo el actual) → `AppError(409, 'La persona ya tiene un donante activo')`
3. `update(id, { personaId, updatedById: userId })` con `include: { persona: true }`
4. Retornar `toDonanteResponse(donante)`

#### Service: `recalcularSemaforo(id: number)`
1. Validar que el donante existe y no está soft-deleted → `AppError(404, 'Donante no encontrado')`
2. Obtener todas las donaciones activas del donante (desde `donacion.repository.findActivasByDonanteId()`)
3. Evaluar serología:
   ```typescript
   const tienePositiva = donaciones.some(d =>
     d.resultadoSerologia && (
       d.resultadoSerologia.hiv ||
       d.resultadoSerologia.hcv ||
       d.resultadoSerologia.hbv ||
       d.resultadoSerologia.chagas ||
       d.resultadoSerologia.sifilis
     )
   )
   const nuevoSemaforo = tienePositiva ? 'ROJO' : 'VERDE'
   ```
4. `update(id, { semaforoAptitud: nuevoSemaforo, updatedById })` con `include: { persona: true }`
5. Retornar `toDonanteResponse(donante)`

#### Controller
```typescript
async function recalcularSemaforo(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const result = await donanteService.recalcularSemaforo(id, req.user.id)
    res.status(200).json(successResponse({ item: result }))
  } catch (err) {
    next(err)
  }
}
```

#### Dependencia entre módulos
`donante.service.ts` importa `donacion.repository` para obtener las donaciones activas. Esta es la **única** dependencia del módulo Donante hacia Donación. El módulo Donación **no** importa nada de Donante.

### Frontend

#### Contrato de UI
- Botón "Recalcular semáforo" en el detalle del donante
- Al hacer clic: confirma, dispara POST, actualiza la vista con el nuevo estado
- Indicador visual del semáforo (VERDE = badge verde, ROJO = badge rojo)
- El formulario de edición del donante permite cambiar la persona asociada

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Actualización exitosa | `{ "success": true, "data": { "item": {...} } }` | 200 |
| Donante no encontrado | `{ "error": "Donante no encontrado" }` | 404 |
| Nuevo personaId no existe | `{ "error": "Persona no encontrada" }` | 404 |
| Nueva persona ya tiene donante | `{ "error": "La persona ya tiene un donante activo" }` | 409 |
| Recalcular: todo negativo → VERDE | Semáforo actualizado a VERDE | 200 |
| Recalcular: alguna positiva → ROJO | Semáforo actualizado a ROJO | 200 |
| Recalcular: sin donaciones → VERDE | Semáforo actualizado a VERDE | 200 |
| Sin autenticación | `{ "error": "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Agregar `actualizarDonanteSchema` en `donante.schema.ts`
2. Agregar `update()` y `findDonacionesActivas()` en `donante.repository.ts`
3. Implementar `actualizar()` y `recalcularSemaforo()` en `donante.service.ts`
4. Agregar handlers `actualizar()` y `recalcularSemaforo()` en `donante.controller.ts`
5. Agregar `PUT /:id` y `POST /:id/recalcular-semaforo` en `donante.routes.ts`
6. Tests: actualización exitosa, recalculo con varios escenarios de serología, 404, 409

### Frontend
7. Agregar `actualizar()` en `donantes-service.ts`
8. Agregar `recalcularSemaforo()` en `donantes-service.ts`
9. Crear botón "Recalcular semáforo" en el detalle del donante
10. Mostrar badge de semáforo (VERDE/ROJO) en tabla y detalle
