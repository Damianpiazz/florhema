---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Actualizar Transfusión
---

# TDD-022: Actualizar Transfusión

## Contexto de Negocio (PRD)

### Objetivo
Permitir corregir datos de una transfusión existente, incluyendo la posibilidad de actualizar los resultados de compatibilidad y Coombs.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Corregir errores de carga en transfusiones previas (cantidad de unidades mal registrada, reacción adversa reportada tardíamente, resultado de Coombs corregido).

### Criterios de Aceptación
*   Solo usuarios autenticados pueden actualizar transfusiones
*   La transfusión debe existir y no estar soft-deleted
*   Se pueden actualizar todos los campos excepto `pacienteId` (no se permite cambiar de paciente)
*   Si se actualiza `compatibilidad`:
  - Si ya existe → se actualiza
  - Si no existe → se crea
*   Si se actualiza `resultadoCoombs`:
  - Si ya existe → se actualiza
  - Si no existe → se crea

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `PUT /api/v1/transfusiones/:id`
*   **Auth**: Requiere sesión activa
*   **Request Body** (todos opcionales excepto al menos uno):
```json
{
  "fecha": "2026-06-02T10:00:00.000Z",
  "componente": "PLASMA",
  "cantidadUnidades": 3,
  "reaccionAdversa": "Fiebre leve",
  "compatibilidad": {
    "donanteGrupoId": 1,
    "receptorGrupoId": 2,
    "compatible": true,
    "motivoIncompatibilidad": null
  },
  "resultadoCoombs": {
    "tipo": "DIRECTO",
    "positivo": true
  }
}
```
*   **Response** `200 OK`: Misma estructura que creación

### Backend

#### Schema (Zod)

```typescript
const actualizarTransfusionSchema = z.object({
  fecha: z.coerce.date().optional(),
  componente: z.nativeEnum(TipoHemocomponente).optional(),
  cantidadUnidades: z.number().int().positive().min(1).optional(),
  reaccionAdversa: z.string().nullable().optional(),
  compatibilidad: z.object({
    donanteGrupoId: z.number().int().positive(),
    receptorGrupoId: z.number().int().positive(),
    compatible: z.boolean(),
    motivoIncompatibilidad: z.string().nullable().optional(),
  }).optional(),
  resultadoCoombs: z.object({
    tipo: z.nativeEnum(TipoCoombs),
    positivo: z.boolean(),
  }).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
})
```

#### Service: `actualizar(id: number, input: ActualizarTransfusionInput)`

1. Validar que la transfusión existe y no está soft-deleted → `AppError(404, 'Transfusión no encontrada')`
2. Si incluye `compatibilidad`:
   - Si la transfusión ya tiene compatibilidad → actualizar con `update`
   - Si no tiene → crear con `create`
3. Si incluye `resultadoCoombs`:
   - Si la transfusión ya tiene resultado → actualizar con `update`
   - Si no tiene → crear con `create`
4. Retornar transfusión actualizada con `toTransfusionResponse()`

#### Controller

```typescript
async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const input = actualizarTransfusionSchema.parse(req.body)
    const result = await transfusionService.actualizar(id, input)
    res.status(200).json(successResponse({ item: result }))
  } catch (err) {
    next(err)
  }
}
```

#### Routes

```typescript
router.put('/:id', authMiddleware, actualizar)
```

### Frontend

#### Contrato de UI
- Botón "Editar" en cada fila de la tabla
- Abre el mismo Dialog de formulario (reutiliza `transfusion-form.tsx`) precargado con datos existentes
- Título del Dialog: "Editar transfusión"
- Los mismos campos y validaciones que creación
- Al guardar: PUT → cierra Dialog → refresca tabla

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Transfusión no existe | `{ error: "Transfusión no encontrada" }` | 404 |
| Transfusión soft-deleted | `{ error: "Transfusión no encontrada" }` | 404 |
| Body vacío (sin campos) | Error de validación | 400 |
| Compatibilidad antes null → ahora valores | Se crea CompatibilidadTransfusional | 200 |
| Coombs antes null → ahora valores | Se crea ResultadoCoombs | 200 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Agregar `actualizarTransfusionSchema` en `transfusion.schema.ts`
2. Agregar `update()` en `transfusion.repository.ts`
3. Implementar `actualizar()` en `transfusion.service.ts`
4. Agregar handler `actualizar()` en `transfusion.controller.ts`
5. Agregar `PUT /:id` en `transfusion.routes.ts`
6. Tests: actualización exitosa, upsert compatibilidad, upsert coombs, body vacío, 404

### Frontend
7. Agregar `actualizar()` en `transfusiones-service.ts`
8. Reutilizar `transfusion-form.tsx` precargado con datos existentes
9. Abrir Dialog desde botón "Editar" en tabla con `editing` state
10. Tests: formulario precargado, envío correcto
