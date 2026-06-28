---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Crear Transfusión con compatibilidad y resultado Coombs
---

# TDD-021: Crear Transfusión

## Contexto de Negocio (PRD)

### Objetivo
Registrar una nueva transfusión asociada a un paciente existente, incluyendo el hemocomponente utilizado, cantidad de unidades, resultados de compatibilidad y prueba de Coombs directa.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Registrar cada hemocomponente transfundido a un paciente, con los resultados de las pruebas de compatibilidad y Coombs, para mantener la trazabilidad completa requerida por las normas provinciales.

### Criterios de Aceptación
*   Solo usuarios autenticados pueden crear transfusiones
*   El paciente debe existir y no estar soft-deleted
*   El componente debe ser un `TipoHemocomponente` válido
*   La `CompatibilidadTransfusional` y el `ResultadoCoombs` se crean en la misma transacción
*   Los grupos sanguíneos de la compatibilidad deben existir en el catálogo

## Diseño Técnico (RFC)

### Modelo de Datos
No hay cambios en el schema. Se crea `Transfusion` + `CompatibilidadTransfusional` + `ResultadoCoombs` en una transacción Prisma.

### Contrato de API

*   **Endpoint**: `POST /api/v1/transfusiones`
*   **Auth**: Requiere sesión activa
*   **Request Body**:
```json
{
  "pacienteId": 1,
  "fecha": "2026-06-01T10:00:00.000Z",
  "componente": "GLOBULOS_ROJOS",
  "cantidadUnidades": 2,
  "reaccionAdversa": null,
  "compatibilidad": {
    "donanteGrupoId": 1,
    "receptorGrupoId": 2,
    "compatible": true,
    "motivoIncompatibilidad": null
  },
  "resultadoCoombs": {
    "tipo": "DIRECTO",
    "positivo": false
  }
}
```
*   **Response** `201 Created`: Misma estructura de item que listar

### Backend

#### Estructura del Código

```
backend/src/modules/transfusion/
├── transfusion.routes.ts        ← se agrega POST /
├── transfusion.controller.ts    ← se agrega handler crear()
├── transfusion.service.ts       ← se agrega crear(): validar paciente, validar grupos, crear en transacción
├── transfusion.repository.ts    ← se agregan create(), findPacienteById(), findGrupoById()
├── transfusion.schema.ts        ← se agrega crearTransfusionSchema
└── transfusion.dto.ts           ← se reutiliza toTransfusionResponse()
```

#### Schema (Zod)

```typescript
const crearTransfusionSchema = z.object({
  pacienteId: z.number().int().positive(),
  fecha: z.coerce.date(),
  componente: z.nativeEnum(TipoHemocomponente),
  cantidadUnidades: z.number().int().positive().min(1, 'La cantidad mínima es 1 unidad'),
  reaccionAdversa: z.string().nullable().optional(),
  compatibilidad: z.object({
    donanteGrupoId: z.number().int().positive(),
    receptorGrupoId: z.number().int().positive(),
    compatible: z.boolean(),
    motivoIncompatibilidad: z.string().nullable().optional(),
  }),
  resultadoCoombs: z.object({
    tipo: z.nativeEnum(TipoCoombs),
    positivo: z.boolean(),
  }),
})
```

#### Service: `crear(input: CrearTransfusionInput)`

1. Validar que `pacienteId` existe y `deletedAt` es null → `AppError(404, 'Paciente no encontrado')`
2. Validar que `donanteGrupoId` existe → `AppError(404, 'El grupo sanguíneo del donante no existe')`
3. Validar que `receptorGrupoId` existe → `AppError(404, 'El grupo sanguíneo del receptor no existe')`
4. Crear en transacción Prisma:
   - `prisma.resultadoCoombs.create` con tipo y positivo
   - `prisma.compatibilidadTransfusional.create` con grupos, compatible y motivo
   - `prisma.transfusion.create` vinculando paciente, fecha, componente, unidades, compatibilidadId y resultadoCoombsId
5. Retornar transfusion creada con `toTransfusionResponse()`

#### Controller

```typescript
async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const input = crearTransfusionSchema.parse(req.body)
    const result = await transfusionService.crear(input)
    res.status(201).json(successResponse({ item: result }))
  } catch (err) {
    next(err)
  }
}
```

#### Routes

```typescript
router.post('/', authMiddleware, crear)
```

### Frontend

#### Contrato de UI
- Acceso: botón "Nueva transfusión" en la tabla de transfusiones
- Abre un Dialog con formulario:
  - **Paciente**: Select con búsqueda (autocomplete sobre personas con rol paciente)
  - **Fecha**: Date picker (shadcn calendar)
  - **Componente**: Select (GLOBULOS_ROJOS / PLASMA / PLAQUETAS / CRIOPRECIPITADO)
  - **Cantidad de Unidades**: Input number, min 1
  - **Reacción Adversa**: Textarea opcional
  - **Compatibilidad**: Sección con:
    - Grupo Donante: Select con grupos sanguíneos
    - Grupo Receptor: Select con grupos sanguíneos
    - Compatible: Checkbox (default true)
    - Motivo Incompatibilidad: Textarea (solo si compatible=false)
  - **Resultado Coombs**: Sección con:
    - Tipo: Select (DIRECTO / INDIRECTO)
    - Positivo: Checkbox (default false)
- Validación client-side con Zod
- Botón "Guardar" → POST → cierra Dialog → refresca tabla
- Loading state y manejo de errores

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Paciente no existe | `{ error: "Paciente no encontrado" }` | 404 |
| Paciente soft-deleted | `{ error: "Paciente no encontrado" }` | 404 |
| Grupo donante no existe | `{ error: "El grupo sanguíneo del donante no existe" }` | 404 |
| Grupo receptor no existe | `{ error: "El grupo sanguíneo del receptor no existe" }` | 404 |
| cantidadUnidades = 0 | Error de validación | 400 |
| componente inválido | Error de validación | 400 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Agregar `crearTransfusionSchema` en `transfusion.schema.ts`
2. Agregar `create()`, `findPacienteById()`, `findGrupoById()` en `transfusion.repository.ts`
3. Implementar `crear()` en `transfusion.service.ts` con validaciones y transacción
4. Agregar handler `crear()` en `transfusion.controller.ts`
5. Agregar `POST /` en `transfusion.routes.ts`
6. Tests: integración (creación exitosa, paciente inexistente, grupos inválidos, validaciones)

### Frontend
7. Agregar `crear()` en `transfusiones-service.ts`
8. Crear `transfusion-form.tsx` con formulario completo y validación Zod
9. Integrar Dialog en `transfusiones-table.tsx`
10. Tests: validación client-side, envío correcto, manejo de errores
