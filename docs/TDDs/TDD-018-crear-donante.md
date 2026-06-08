---
autor: Damián Piazza
fecha: 2026-06-08
titulo: Crear Donante (asignar rol a Persona)
---

# TDD-018: Crear Donante

## Contexto de Negocio (PRD)

### Objetivo
Asignar el rol de donante a una persona existente. Donante es un rol (subtype) de Persona con una relación 0..1: una persona puede tener como máximo un donante activo. Al crear el donante, el semáforo de aptitud se inicializa en VERDE hasta que se registren donaciones con resultados serológicos.

### User Persona
- **Nombre**: Técnico / Licenciado en Hemoterapia
- **Necesidad**: Registrar a una persona como donante para comenzar a registrar sus donaciones y evaluar su aptitud.

### Criterios de Aceptación
- Solo usuarios autenticados pueden crear donantes
- La persona debe existir y no estar soft-deleted
- La persona no debe tener ya un donante activo (relación 0..1)
- Se registra el usuario autenticado como `createdBy`
- El semáforo se inicializa en `VERDE`

## Diseño Técnico (RFC)

### Modelo de Datos

**Donante** (ya existe en `schema.prisma`)

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Int | PK, autoincrement |
| personaId | Int | FK -> Persona, UNIQUE, NOT NULL |
| semaforoAptitud | SemaforoAptitud | NOT NULL, default VERDE |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| deletedAt | DateTime? | |
| createdById | Int? | FK -> User |
| updatedById | Int? | FK -> User |
| deletedById | Int? | FK -> User |

### Contrato de API

#### `POST /api/v1/donantes`
**Auth**: Requiere sesión activa (cualquier rol)

**Request Body:**
```json
{
  "personaId": 1
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "personaId": 1,
      "persona": {
        "id": 1,
        "dni": "12345678",
        "nombre": "Juan",
        "apellido": "Pérez"
      },
      "semaforoAptitud": "VERDE"
    }
  }
}
```

### Backend

#### Estructura del Código
```
backend/src/modules/donante/
├── donante.routes.ts        ← define rutas POST /
├── donante.controller.ts    ← handler crear()
├── donante.service.ts       ← lógica de negocio
├── donante.repository.ts    ← acceso a datos
├── donante.schema.ts        ← schemas Zod
└── donante.dto.ts           ← toDonanteResponse()
```

#### Schema (Zod)
```typescript
const crearDonanteSchema = z.object({
  personaId: z.number().int().positive(),
})
```

#### Service: `crear(input: CrearDonanteInput, userId: number)`
1. `findPersonaById(personaId)` — si no existe o está soft-deleted → `AppError(404, 'Persona no encontrada')`
2. `findByPersonaId(personaId)` — si ya existe un donante activo → `AppError(409, 'La persona ya tiene un donante activo')`
3. `create({ personaId, createdById: userId })` con `include: { persona: true }`
4. Retorna `toDonanteResponse(donante)`

#### Controller
```typescript
async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const input = crearDonanteSchema.parse(req.body)
    const result = await donanteService.crear(input, req.user.id)
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
- Acceso: botón "Asignar como donante" desde el detalle de persona
- Abre un Dialog de confirmación simple
- Selector de persona (autocomplete) si se accede desde sección de donantes
- Al confirmar: POST → cierra Dialog → muestra toast de éxito
- Redirige al detalle del donante creado

#### Estructura del Código
```
frontend/features/donantes/
├── donantes.schema.ts         ← Zod schemas
├── donantes.dto.ts            ← parseDonanteResponse()
├── donantes-service.ts        ← crear(), listar(), obtener(), actualizar(), eliminar()
├── hooks/
│   └── useCrearDonante.ts    ← mutation para crear donante
└── components/
    └── crear-donante-dialog.tsx
```

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Creación exitosa | `{ "success": true, "data": { "item": {...} } }` | 201 |
| Persona no existe | `{ "error": "Persona no encontrada" }` | 404 |
| Persona soft-deleted | `{ "error": "Persona no encontrada" }` | 404 |
| Persona ya tiene donante activo | `{ "error": "La persona ya tiene un donante activo" }` | 409 |
| personaId no es número | Error de validación | 400 |
| Sin autenticación | `{ "error": "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Crear `donante.schema.ts` con `crearDonanteSchema` y `donanteResponseSchema`
2. Crear `donante.dto.ts` con `toDonanteResponse()` que embebe persona
3. Crear `donante.repository.ts` con `create()`, `findByPersonaId()`, `findPersonaById()`
4. Implementar `crear()` en `donante.service.ts` con validaciones
5. Agregar handler `crear()` en `donante.controller.ts`
6. Agregar `POST /` en `donante.routes.ts` con authMiddleware
7. Montar `donante.routes` en `src/routes/index.ts`
8. Tests: integración (creación exitosa, persona inexistente, donante duplicado)

### Frontend
9. Crear `donantes.schema.ts`, `donantes.dto.ts`, `donantes-service.ts`
10. Crear `useCrearDonante.ts` con TanStack Query mutation
11. Crear `crear-donante-dialog.tsx` con formulario y validación
12. Integrar en página de detalle de persona o sección de donantes
