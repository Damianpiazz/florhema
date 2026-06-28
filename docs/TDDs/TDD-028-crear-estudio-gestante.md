---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Crear Estudio de Gestante con resultado Coombs indirecta
---

# TDD-028: Crear Estudio de Gestante

## Contexto de Negocio (PRD)

### Objetivo
Registrar un nuevo estudio de laboratorio para una gestante, incluyendo el resultado de la prueba de Coombs indirecta, compatibilidad conyugal y estado del estudio.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Cargar los resultados de los estudios realizados a una embarazada, empezando por grupo y factor, Coombs indirecta y compatibilidad con el padre.

### Criterios de Aceptación
*   Solo usuarios autenticados pueden crear estudios
*   La gestante debe existir y no estar soft-deleted
*   `estadoEstudio` por defecto es `PENDIENTE`
*   El `ResultadoCoombs` se crea en la misma transacción
*   `compatibilidadConyugal` es un campo de texto libre

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `POST /api/v1/gestantes/:gestanteId/estudios`
*   **Auth**: Requiere sesión activa
*   **Request Body**:
```json
{
  "fecha": "2026-06-01T10:00:00.000Z",
  "compatibilidadConyugal": "Compatible - Grupo O+ ambos",
  "estadoEstudio": "PENDIENTE",
  "pruebaCoombsIndirecta": {
    "tipo": "INDIRECTO",
    "positivo": false
  }
}
```
*   **Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "gestanteId": 1,
      "fecha": "2026-06-01T10:00:00.000Z",
      "compatibilidadConyugal": "Compatible - Grupo O+ ambos",
      "estadoEstudio": "PENDIENTE",
      "pruebaCoombsIndirecta": { "id": 1, "tipo": "INDIRECTO", "positivo": false }
    }
  }
}
```

### Backend

#### Schema (Zod)

```typescript
const crearEstudioGestanteSchema = z.object({
  fecha: z.coerce.date(),
  compatibilidadConyugal: z.string().min(1, 'La compatibilidad conyugal es requerida'),
  estadoEstudio: z.nativeEnum(EstadoEstudio).default('PENDIENTE'),
  pruebaCoombsIndirecta: z.object({
    tipo: z.nativeEnum(TipoCoombs),
    positivo: z.boolean(),
  }),
})
```

#### Service: `crear(gestanteId, input)`

1. Validar que gestante existe y no está soft-deleted → `AppError(404, 'Gestante no encontrada')`
2. Crear en transacción:
   - `prisma.resultadoCoombs.create` con tipo INDIRECTO y positivo
   - `prisma.estudioGestante.create` vinculando gestante, fecha, compatibilidad, estado y coombsId
3. Retornar estudio con `toEstudioGestanteResponse()`

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Gestante no existe | `{ error: "Gestante no encontrada" }` | 404 |
| Gestante soft-deleted | `{ error: "Gestante no encontrada" }` | 404 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |
| compatibilidadConyugal vacío | Error de validación | 400 |

## Plan de Implementación

### Backend
1. Schema, DTO, repository, service, controller, routes
2. Tests: creación exitosa, gestante inexistente, validaciones

### Frontend
3. Sección "Nuevo estudio" en la pestaña de gestante del detalle de persona
4. Formulario con fecha, compatibilidad conyugal, estado y sección de Coombs
