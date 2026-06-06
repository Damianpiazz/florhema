---
autor: Damián Piazza
fecha: 2026-06-06
titulo: Crear Donación con resultados de serología
---

# TDD-015: Crear Donación

## Contexto de Negocio (PRD)

### Objetivo
Registrar una nueva donación asociada a un donante existente, incluyendo datos biomédicos obligatorios (peso, tensión arterial, hemoglobina) y resultados de serología. Al crear la donación, el sistema debe recalcular el semáforo de aptitud del donante según los resultados serológicos.

### User Persona
- **Nombre**: Técnico en Hemoterapia
- **Necesidad**: Registrar una donación recibida con todos los datos clínicos y de laboratorio. Necesita validación en tiempo real de los rangos biomédicos para asegurar que el donante cumple los requisitos.

### Criterios de Aceptación
- Solo usuarios autenticados pueden crear donaciones
- El donante debe existir y no estar soft-deleted
- Todos los campos biomédicos son obligatorios (peso, TA, hemoglobina) con validación de rango
- La serología se crea junto con la donación en una transacción (opcional: puede omitirse si están pendientes)
- Al crear, se recalcula `Donante.semaforoAptitud`:
  - Cualquier serología positiva → `ROJO`
  - Todas negativas → conserva estado actual
- La donación se registra con `deletedAt: null`

### Validaciones de Negocio
- `peso`: mínimo 50 kg
- `hemoglobina`: mínimo 12.5 g/dL (mujer) / 13.0 g/dL (hombre) — requiere conocer sexo de la persona (si el modelo no tiene sexo, se usa mínimo único de 12.5)
- `tensionArterial`: formato válido "sistólica/diastólica" (ej. "120/80"), ambos enteros positivos
- `reaccionAdversa`: opcional, string libre

## Diseño Técnico (RFC)

### Modelo de Datos
No hay cambios en el schema. Se crea `Donacion` + `ResultadoSerologia` opcional en una transacción Prisma.

### Contrato de API

#### `POST /api/v1/donaciones`
**Request Body:**
```json
{
  "donanteId": 1,
  "fecha": "2026-06-06T10:00:00.000Z",
  "peso": 75.5,
  "tensionArterial": "120/80",
  "hemoglobina": 14.5,
  "tipoDonacion": "VOLUNTARIA",
  "reaccionAdversa": null,
  "resultadoSerologia": {
    "hiv": false,
    "hcv": false,
    "hbv": false,
    "chagas": false,
    "sifilis": false
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "donanteId": 1,
    "fecha": "2026-06-06T10:00:00.000Z",
    "peso": 75.5,
    "tensionArterial": "120/80",
    "hemoglobina": 14.5,
    "tipoDonacion": "VOLUNTARIA",
    "reaccionAdversa": null,
    "resultadoSerologia": {
      "id": 1, "hiv": false, "hcv": false, "hbv": false, "chagas": false, "sifilis": false
    }
  }
}
```

### Backend

#### Service: `crear(input: CrearDonacionInput)`
1. Validar que `donanteId` existe y `deletedAt` es null
2. Validar rangos biomédicos (peso, hemoglobina, formato TA)
3. Crear en transacción Prisma:
   - `prisma.donacion.create` con `resultadoSerologia` anidado si se incluye
4. Si hay serología, recalcular `semaforoAptitud` del donante:
   - Alguna positiva → ROJO
   - Todas negativas → no cambiar
5. Retornar donación creada con `toDonacionResponse()`

#### Schema (Zod)
```typescript
const crearDonacionSchema = z.object({
  donanteId: z.number().int().positive(),
  fecha: z.coerce.date(),
  peso: z.number().positive().min(50, 'El peso mínimo es 50 kg'),
  tensionArterial: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Formato: sistólica/diastólica (ej. 120/80)'),
  hemoglobina: z.number().positive().min(12.5, 'La hemoglobina mínima es 12.5 g/dL'),
  tipoDonacion: z.nativeEnum(TipoDonacion),
  reaccionAdversa: z.string().nullable().optional(),
  resultadoSerologia: z.object({
    hiv: z.boolean(),
    hcv: z.boolean(),
    hbv: z.boolean(),
    chagas: z.boolean(),
    sifilis: z.boolean(),
  }).nullable().optional(),
})
```

#### Controller
```typescript
async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const input = crearDonacionSchema.parse(req.body)
    const result = await donacionService.crear(input)
    const validated = donacionResponseSchema.parse(result)
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}
```

### Frontend

#### Contrato de UI
- Acceso: botón "Nueva donación" en la tabla de donaciones
- Abre un Dialog con formulario:
  - **Donante**: Select con búsqueda (autocomplete) que carga personas y filtra las que tienen rol donante
  - **Fecha**: Date picker (shadcn calendar)
  - **Peso**: Input number, step 0.1, min 50, placeholder "75.5"
  - **Tensión Arterial**: Input con placeholder "120/80" o dos inputs lado a lado (sistólica / diastólica)
  - **Hemoglobina**: Input number, step 0.1, min 12.5, placeholder "14.5"
  - **Tipo de Donación**: Select (VOLUNTARIA / REPOSICION)
  - **Reacción Adversa**: Textarea opcional, placeholder "Describir si hubo reacción..."
  - **Resultados de Serología**: Sección colapsable con 5 checkboxes:
    - HIV, HCV, HBV, Chagas, Sífilis (todos default false = negativo)
- Validación client-side con Zod (mismo schema que backend)
- Botón "Guardar" → POST → cierra Dialog → refresca tabla
- Botón "Cancelar" → cierra Dialog sin guardar
- Loading state mientras se envía
- Toast de éxito/error

#### donacion-form.tsx
```tsx
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Nueva donación</DialogTitle>
      <DialogDescription>Registrá los datos de la donación.</DialogDescription>
    </DialogHeader>
    <form onSubmit={handleSubmit}>
      {/* Donante: autocomplete */}
      <Field>
        <FieldLabel>Donante</FieldLabel>
        <SelectDonante value={form.donanteId} onChange={...} />
      </Field>
      {/* Fecha */}
      <Field>
        <FieldLabel>Fecha</FieldLabel>
        <DatePicker value={form.fecha} onChange={...} />
      </Field>
      {/* Peso + Hemoglobina en grid cols-2 */}
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel>Peso (kg)</FieldLabel>
          <Input type="number" step={0.1} min={50} value={form.peso} onChange={...} />
        </Field>
        <Field>
          <FieldLabel>Hemoglobina (g/dL)</FieldLabel>
          <Input type="number" step={0.1} min={12.5} value={form.hemoglobina} onChange={...} />
        </Field>
      </div>
      {/* Tensión Arterial */}
      <Field>
        <FieldLabel>Tensión Arterial</FieldLabel>
        <Input placeholder="120/80" value={form.tensionArterial} onChange={...} />
      </Field>
      {/* Tipo de Donación */}
      <Field>
        <FieldLabel>Tipo</FieldLabel>
        <Select value={form.tipoDonacion} onChange={...}>
          <SelectItem value="VOLUNTARIA">Voluntaria</SelectItem>
          <SelectItem value="REPOSICION">Reposición</SelectItem>
        </Select>
      </Field>
      {/* Reacción Adversa */}
      <Field>
        <FieldLabel>Reacción Adversa</FieldLabel>
        <Textarea value={form.reaccionAdversa} onChange={...} placeholder="Opcional" />
      </Field>
      {/* Serología */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Serología</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {['hiv', 'hcv', 'hbv', 'chagas', 'sifilis'].map(m => (
            <Label key={m} className="flex items-center gap-2">
              <Checkbox checked={form.serologia[m]} onCheckedChange={...} />
              {m.toUpperCase()}
            </Label>
          ))}
        </CardContent>
      </Card>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" loading={submitting}>Guardar</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

#### Componentes shadcn requeridos
Agregar con `npx shadcn add`:
- `select` (si no está)
- `popover` / `calendar` (si no están)
- `checkbox` (si no está)
- `card` (si no está)
- `textarea` (si no está)

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Donante no existe | `{ error: "Donante no encontrado" }` | 404 |
| Peso < 50 kg | Error de validación | 400 |
| Hemoglobina < 12.5 | Error de validación | 400 |
| TA con formato inválido | Error de validación | 400 |
| DonanteId no es número | Error de validación | 400 |
| Donante soft-deleted | `{ error: "Donante no encontrado" }` | 404 |
| Serología no enviada | Donación creada sin resultadoSerologia | 201 |
| Serología con campos faltantes | Default false para los omitidos | 201 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Agregar `crearDonacionSchema` en `donacion.schema.ts`
2. Agregar `crear()` en `donacion.service.ts` con validaciones y transacción
3. Agregar `crear()` en `donacion.controller.ts`
4. Agregar `POST /` en `donacion.routes.ts`
5. Tests: integración (creación exitosa con y sin serología, validaciones, donante inexistente)

### Frontend
6. Agregar `crear()` en `donaciones-service.ts`
7. Crear `donacion-form.tsx` con formulario completo y validación Zod
8. Integrar Dialog en `donaciones-table.tsx`
9. Tests: validación client-side, envío correcto, manejo de errores
