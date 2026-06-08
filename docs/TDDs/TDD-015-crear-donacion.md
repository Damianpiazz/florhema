---
autor: Damián Piazza
fecha: 2026-06-08
titulo: Crear Donación con resultados de serología
---

# TDD-015: Crear Donación

## Contexto de Negocio (PRD)

### Objetivo
Registrar una nueva donación asociada a un donante existente, incluyendo datos biomédicos obligatorios (peso, tensión arterial, hemoglobina) y resultados de serología opcionales. La creación de una donación **no** modifica el semáforo del donante; ese cálculo se realiza desde el módulo Donante.

### User Persona
- **Nombre**: Técnico en Hemoterapia
- **Necesidad**: Registrar una donación recibida con todos los datos clínicos y de laboratorio. Necesita validación en tiempo real de los rangos biomédicos para asegurar que el donante cumple los requisitos.

### Criterios de Aceptación
- Solo usuarios autenticados pueden crear donaciones
- El donante debe existir y no estar soft-deleted
- Todos los campos biomédicos son obligatorios (peso, TA, hemoglobina) con validación de rango
- La serología se crea junto con la donación en una transacción (opcional: puede omitirse si están pendientes)
- La donación se registra con `deletedAt: null`

### Validaciones de Negocio
- `peso`: mínimo 50 kg
- `hemoglobina`: mínimo 12.5 g/dL
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
    "item": {
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
}
```

### Backend

#### Estructura del Código
```
backend/src/modules/donacion/
├── donacion.routes.ts        ← se agrega POST /
├── donacion.controller.ts    ← se agrega handler crear()
├── donacion.service.ts       ← se agrega crear(): validar donante, validar rangos, crear en transacción
├── donacion.repository.ts    ← se agregan create(), findDonanteById()
├── donacion.schema.ts        ← se agrega crearDonacionSchema
└── donacion.dto.ts           ← se reutiliza toDonacionResponse()
```

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

#### Service: `crear(input: CrearDonacionInput)`
1. Validar que `donanteId` existe y `deletedAt` es null → `AppError(404, 'Donante no encontrado')`
2. Validar rangos biomédicos (peso, hemoglobina, formato TA)
3. Crear en transacción Prisma:
   - `prisma.donacion.create` con `resultadoSerologia` anidado si se incluye
4. Retornar donación creada con `toDonacionResponse()`

#### Controller
```typescript
async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const input = crearDonacionSchema.parse(req.body)
    const result = await donacionService.crear(input)
    res.status(201).json(successResponse({ item: result }))
  } catch (err) {
    next(err)
  }
}
```

### Frontend

#### Contrato de UI
- Acceso: botón "Nueva donación" en la tabla de donaciones
- Abre un Dialog con formulario:
  - **Donante**: Select con búsqueda (autocomplete)
  - **Fecha**: Date picker (shadcn calendar)
  - **Peso**: Input number, step 0.1, min 50, placeholder "75.5"
  - **Tensión Arterial**: Input con placeholder "120/80"
  - **Hemoglobina**: Input number, step 0.1, min 12.5, placeholder "14.5"
  - **Tipo de Donación**: Select (VOLUNTARIA / REPOSICION)
  - **Reacción Adversa**: Textarea opcional
  - **Resultados de Serología**: Sección con 5 checkboxes (HIV, HCV, HBV, Chagas, Sífilis, todos default false)
- Validación client-side con Zod
- Botón "Guardar" → POST → cierra Dialog → refresca tabla
- Loading state y manejo de errores

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
2. Agregar `create()` y `findDonanteById()` en `donacion.repository.ts`
3. Implementar `crear()` en `donacion.service.ts` con validaciones y transacción
4. Agregar handler `crear()` en `donacion.controller.ts`
5. Agregar `POST /` en `donacion.routes.ts`
6. Tests: integración (creación exitosa con y sin serología, validaciones, donante inexistente)

### Frontend
7. Agregar `crear()` en `donaciones-service.ts`
8. Crear `donacion-form.tsx` con formulario completo y validación Zod
9. Integrar Dialog en `donaciones-table.tsx`
10. Tests: validación client-side, envío correcto, manejo de errores
