---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Asignar rol Gestante a una Persona
---

# TDD-024: Crear Gestante

## Contexto de Negocio (PRD)

### Objetivo
Registrar a una persona existente como gestante, activando el sub-módulo de seguimiento obstétrico que permite cargar antecedentes, estudios y recién nacidos.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Al recibir a una embarazada, marcarla como gestante en el sistema para luego cargar sus estudios de grupo y factor, Coombs indirecta y compatibilidad conyugal.

### Criterios de Aceptación
*   Solo usuarios autenticados pueden crear una gestante
*   La persona base debe existir y no estar soft-deleted
*   No se puede crear una gestante si la persona ya tiene ese rol activo
*   Todos los roles son independientes (una persona puede ser donante, paciente y gestante a la vez)
*   El campo `antecedentesObstetricos` es opcional

## Diseño Técnico (RFC)

### Modelo de Datos
No hay cambios en el schema. Se crea un registro `Gestante` vinculado a `Persona`.

### Contrato de API

*   **Endpoint**: `POST /api/v1/personas/:personaId/gestante`
*   **Auth**: Requiere sesión activa
*   **Request Body**:
```json
{
  "antecedentesObstetricos": "G2P1, cesárea previa en 2024"
}
```
*   **Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "personaId": 1,
      "antecedentesObstetricos": "G2P1, cesárea previa en 2024",
      "createdAt": "2026-06-24T00:00:00.000Z"
    }
  }
}
```

### Backend

#### Estructura del Código

Se puede implementar como un submódulo dentro de `persona/` o como módulo independiente. Se recomienda módulo independiente `gestante/` para mantener la separación por dominio.

```
backend/src/modules/gestante/
├── gestante.routes.ts              ← POST /personas/:personaId/gestante (montado en routes/index.ts)
├── gestante.controller.ts          ← crear()
├── gestante.service.ts             ← crear(): validar persona, validar no duplicado, crear gestante
├── gestante.repository.ts          ← create(), findByPersonaId()
├── gestante.schema.ts              ← crearGestanteSchema, gestanteResponseSchema
└── gestante.dto.ts                 ← toGestanteResponse()
```

#### Schema (Zod)

```typescript
const crearGestanteSchema = z.object({
  antecedentesObstetricos: z.string().nullable().optional(),
})
```

#### Service: `crear(personaId: number, input: CrearGestanteInput)`

1. `findPersonaById(personaId)` — si no existe o está soft-deleted → `AppError(404, 'Persona no encontrada')`
2. `findByPersonaId(personaId)` — si ya existe una gestante activa → `AppError(409, 'La persona ya está registrada como gestante')`
3. `create({ personaId, antecedentesObstetricos })`
4. Retornar `toGestanteResponse(gestante)`

#### Controller

```typescript
async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const personaId = Number(req.params.personaId)
    const input = crearGestanteSchema.parse(req.body)
    const result = await gestanteService.crear(personaId, input)
    res.status(201).json(successResponse({ item: result }))
  } catch (err) {
    next(err)
  }
}
```

### Frontend

#### Contrato de UI
- Acceso: desde el detalle de persona (`personas/:id`) en la pestaña "Gestante"
- Si la persona no es gestante, se muestra un botón "Registrar como gestante"
- Abre un Dialog simple con campo `antecedentesObstetricos` (textarea opcional)
- Al guardar: POST → cierra Dialog → refresca pestaña

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Creación exitosa | Item con datos de gestante | 201 |
| Persona no existe | `{ error: "Persona no encontrada" }` | 404 |
| Persona soft-deleted | `{ error: "Persona no encontrada" }` | 404 |
| Persona ya es gestante | `{ error: "La persona ya está registrada como gestante" }` | 409 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Crear `gestante.schema.ts` con `crearGestanteSchema`
2. Crear `gestante.dto.ts` con `toGestanteResponse()`
3. Crear `gestante.repository.ts` con `create()`, `findByPersonaId()`, `findPersonaById()`
4. Crear `gestante.service.ts` con `crear()`
5. Crear `gestante.controller.ts` con `crear()`
6. Crear `gestante.routes.ts` con `POST /personas/:personaId/gestante` + authMiddleware
7. Montar en `routes/index.ts`
8. Tests: integración (creación exitosa, persona inexistente, duplicado, sin auth)

### Frontend
9. Agregar `crearGestante()` en `persona-detalle-service.ts`
10. Agregar botón "Registrar como gestante" en `persona-detalle-tabs.tsx` cuando no tiene el rol
11. Dialog con textarea de antecedentes
