---
autor: Damián Piazza
fecha: 2026-06-08
titulo: Actualizar Donación
---

# TDD-016: Actualizar Donación

## Contexto de Negocio (PRD)

### Objetivo
Permitir corregir datos de una donación existente, incluyendo la posibilidad de actualizar los resultados de serología. La actualización **no** modifica el semáforo del donante; ese cálculo se realiza desde el módulo Donante.

### User Persona
- **Nombre**: Técnico en Hemoterapia
- **Necesidad**: Corregir errores de carga en donaciones previas (peso mal registrado, serología que llegó después, reacción adversa reportada tardíamente).

### Criterios de Aceptación
- Solo usuarios autenticados pueden actualizar donaciones
- La donación debe existir y no estar soft-deleted
- Se pueden actualizar todos los campos excepto `donanteId` (no se permite cambiar de donante)
- Si se actualiza `resultadoSerologia`:
  - Si ya existe → se actualiza
  - Si no existe → se crea
  - Si se envía `null` explícitamente → se elimina (soft-delete)

## Diseño Técnico (RFC)

### Contrato de API

#### `PUT /api/v1/donaciones/:id`
**Request Body** (todos opcionales excepto al menos uno):
```json
{
  "fecha": "2026-06-07T10:00:00.000Z",
  "peso": 76.0,
  "tensionArterial": "130/85",
  "hemoglobina": 14.8,
  "tipoDonacion": "REPOSICION",
  "reaccionAdversa": "Mareos leves",
  "resultadoSerologia": {
    "hiv": false,
    "hcv": true,
    "hbv": false,
    "chagas": false,
    "sifilis": false
  }
}
```

**Response 200:** Misma estructura que creación.

### Backend

#### Schema (Zod)
```typescript
const actualizarDonacionSchema = z.object({
  fecha: z.coerce.date().optional(),
  peso: z.number().positive().min(50).optional(),
  tensionArterial: z.string().regex(/^\d{2,3}\/\d{2,3}$/).optional(),
  hemoglobina: z.number().positive().min(12.5).optional(),
  tipoDonacion: z.nativeEnum(TipoDonacion).optional(),
  reaccionAdversa: z.string().nullable().optional(),
  resultadoSerologia: z.object({
    hiv: z.boolean(),
    hcv: z.boolean(),
    hbv: z.boolean(),
    chagas: z.boolean(),
    sifilis: z.boolean(),
  }).nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
})
```

#### Service: `actualizar(id: number, input: ActualizarDonacionInput)`
1. Validar que la donación existe y no está soft-deleted → `AppError(404, 'Donación no encontrada')`
2. Validar que no se intente cambiar `donanteId` (el schema no lo permite)
3. Si incluye `resultadoSerologia`:
   - Si la donación ya tiene serología → actualizar con `update`
   - Si no tiene → crear con `create`
   - Si es `null` → soft-delete la serología existente
4. Retornar donación actualizada con `toDonacionResponse()`

#### Controller
```typescript
async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const input = actualizarDonacionSchema.parse(req.body)
    const result = await donacionService.actualizar(id, input)
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
- Abre el mismo Dialog de formulario (reutiliza `donacion-form.tsx`) precargado con datos existentes
- Título del Dialog: "Editar donación"
- Los mismos campos y validaciones que creación
- Al guardar: PUT → cierra Dialog → refresca tabla

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Donación no existe | `{ error: "Donación no encontrada" }` | 404 |
| Donación soft-deleted | `{ error: "Donación no encontrada" }` | 404 |
| Body vacío (sin campos) | Error de validación | 400 |
| Serología antes null → ahora valores | Se crea ResultadoSerologia | 200 |
| Serología antes con valores → null | Se soft-deletea ResultadoSerologia | 200 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Agregar `actualizarDonacionSchema` en `donacion.schema.ts`
2. Agregar `update()` en `donacion.repository.ts`
3. Implementar `actualizar()` en `donacion.service.ts`
4. Agregar handler `actualizar()` en `donacion.controller.ts`
5. Agregar `PUT /:id` en `donacion.routes.ts`
6. Tests: actualización exitosa, upsert serología, soft-delete serología, body vacío, 404

### Frontend
7. Agregar `actualizar()` en `donaciones-service.ts`
8. Reutilizar `donacion-form.tsx` precargado con datos existentes
9. Abrir Dialog desde botón "Editar" en tabla con `editing` state
10. Tests: formulario precargado, envío correcto
