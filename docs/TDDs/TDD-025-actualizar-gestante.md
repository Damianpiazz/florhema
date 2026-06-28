---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Actualizar datos de Gestante
---

# TDD-025: Actualizar Gestante

## Contexto de Negocio (PRD)

### Objetivo
Permitir modificar los antecedentes obstétricos de una gestante existente.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Actualizar los antecedentes obstétricos de una paciente gestante cuando se obtiene nueva información durante el seguimiento.

### Criterios de Aceptación
*   Solo usuarios autenticados pueden actualizar una gestante
*   La gestante debe existir y no estar soft-deleted
*   Se puede actualizar `antecedentesObstetricos`

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `PUT /api/v1/gestantes/:id`
*   **Auth**: Requiere sesión activa
*   **Request Body**:
```json
{
  "antecedentesObstetricos": "G3P2, dos cesáreas, un parto vaginal"
}
```
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "personaId": 1,
      "antecedentesObstetricos": "G3P2, dos cesáreas, un parto vaginal"
    }
  }
}
```

### Backend

#### Service: `actualizar(id: number, input: ActualizarGestanteInput)`

1. `findById(id)` — si no existe o está soft-deleted → `AppError(404, 'Gestante no encontrada')`
2. `update(id, { antecedentesObstetricos })`
3. Retornar `toGestanteResponse(gestante)`

#### Controller

```typescript
async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const input = actualizarGestanteSchema.parse(req.body)
    const result = await gestanteService.actualizar(id, input)
    res.status(200).json(successResponse({ item: result }))
  } catch (err) {
    next(err)
  }
}
```

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Gestante no existe | `{ error: "Gestante no encontrada" }` | 404 |
| Gestante soft-deleted | `{ error: "Gestante no encontrada" }` | 404 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Agregar `actualizarGestanteSchema` en `gestante.schema.ts`
2. Agregar `update()` y `findById()` en `gestante.repository.ts`
3. Implementar `actualizar()` en `gestante.service.ts`
4. Agregar handler `actualizar()` en `gestante.controller.ts`
5. Agregar `PUT /:id` en `gestante.routes.ts`
6. Tests: actualización exitosa, 404, sin auth

### Frontend
7. Botón "Editar" en la sección de gestante del detalle de persona
8. Dialog precargado con antecedentes actuales
