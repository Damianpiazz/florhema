---
autor: Damián Piazza
fecha: 2026-06-06
titulo: Listar Donaciones con filtros y paginación
---

# TDD-014: Listar Donaciones

## Contexto de Negocio (PRD)

### Objetivo
Permitir consultar el historial de donaciones del sistema con filtros por donante, rango de fechas y tipo de donación. Cada donación muestra los resultados de serología asociados. Es la vista principal del módulo de donaciones.

### User Persona
- **Nombre**: Técnico / Licenciado en Hemoterapia
- **Necesidad**: Consultar el historial de donaciones para evaluar la actividad del servicio, buscar donaciones de un donante específico o filtrar por fecha/tipo.

### Criterios de Aceptación
- Cualquier usuario autenticado puede listar donaciones
- Soporta filtros: `donanteId`, `fechaDesde`, `fechaHasta`, `tipoDonacion`
- Incluye datos del donante (nombre, apellido, DNI) y resultados de serología
- No incluye donaciones soft-deleted
- Paginación con `limit` y `offset` (default 20, máx 100)

## Diseño Técnico (RFC)

### Modelo de Datos
No hay cambios en el schema. Se consultan las relaciones existentes:

```
Donacion (1) ── (0..1) ResultadoSerologia
       └── Donante ── Persona
```

### Contrato de API

#### Nuevo módulo standalone: `/api/v1/donaciones`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/donaciones` | Lista paginada con filtros |
| GET | `/api/v1/donaciones/:id` | Detalle de una donación |
| POST | `/api/v1/donaciones` | Crear donación (TDD-015) |
| PUT | `/api/v1/donaciones/:id` | Actualizar donación (TDD-016) |
| DELETE | `/api/v1/donaciones/:id` | Eliminar donación (TDD-017) |

**Nota**: En este TDD se implementa solo `GET /` y `GET /:id`. Los endpoints `POST`, `PUT`, `DELETE` se implementan en TDD-015, TDD-016 y TDD-017 respectivamente. Se mantiene `GET /personas/:id/donaciones` en el módulo persona para el detalle.

#### `GET /api/v1/donaciones?donanteId=1&fechaDesde=2026-01-01&fechaHasta=2026-12-31&tipoDonacion=VOLUNTARIA&limit=20&offset=0`
**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "donante": { "id": 1, "personaId": 1, "nombre": "Juan", "apellido": "Pérez", "dni": "12345678" },
        "fecha": "2026-05-20T10:00:00.000Z",
        "peso": 75,
        "tensionArterial": "120/80",
        "hemoglobina": 14.5,
        "tipoDonacion": "VOLUNTARIA",
        "reaccionAdversa": null,
        "resultadoSerologia": {
          "id": 1, "hiv": false, "hcv": false, "hbv": false, "chagas": false, "sifilis": false
        }
      }
    ],
    "total": 1, "limit": 20, "offset": 0
  }
}
```

### Backend

#### Estructura del Código
```
backend/src/modules/donacion/
├── donacion.routes.ts        ← define rutas GET /, GET /:id
├── donacion.controller.ts    ← handlers list(), getById()
├── donacion.service.ts       ← lógica de negocio (listar con filtros, validar existencia)
├── donacion.repository.ts    ← acceso a datos (findAll, count, findById)
├── donacion.schema.ts        ← schemas Zod de response y query params
└── donacion.dto.ts           ← toDonacionResponse()
```

#### Repository
```typescript
// findAll: Prisma query con where dinámico + include donante.persona + resultadoSerologia
findAll(filters: {
  donanteId?: number
  fechaDesde?: Date
  fechaHasta?: Date
  tipoDonacion?: TipoDonacion
  limit: number
  offset: number
}) => Promise<Donacion[]>

// count: Mismos filtros, sin paginación
count(filters) => Promise<number>

// findById: Con mismas includes
findById(id: number) => Promise<Donacion | null>
```

#### Service
```typescript
listar(params) {
  const limit = Math.min(params.limit ?? 20, 100)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    repository.findAll({ ...params, limit, offset }),
    repository.count(params),
  ])

  return { items: items.map(toDonacionResponse), total, limit, offset }
}

obtener(id) {
  const donacion = await repository.findById(id)
  if (!donacion) throw new AppError(404, 'Donación no encontrada')
  return toDonacionResponse(donacion)
}
```

#### Controller
```typescript
list(req, res, next) {
  const query = donacionQuerySchema.parse(req.query)
  const result = await donacionService.listar(query)
  const validated = listarDonacionesResponseSchema.parse(result)
  res.status(200).json(successResponse(validated))
}

getById(req, res, next) {
  const id = Number(req.params.id)
  const result = await donacionService.obtener(id)
  const validated = donacionResponseSchema.parse(result)
  res.status(200).json(successResponse(validated))
}
```

### Frontend

#### Ruta: `/donaciones` — Protegida (requiere autenticación)

#### Estructura del Código
```
frontend/features/donaciones/
├── donaciones.schema.ts         ← Zod schemas
├── donaciones.dto.ts            ← parseDonacionResponse(), parseListarDonacionesResponse()
├── donaciones-service.ts        ← listar(), obtener()
├── hooks/
│   └── useDonaciones.ts         ← estado: query, page, donaciones, total, filters
└── components/
    └── donaciones-table.tsx     ← Tabla con filtros y paginación
app/(protected)/
└── donaciones/
    └── page.tsx                 ← Página protegida
```

#### Contrato de UI
- Header con inputs de filtro: búsqueda por donante (autocomplete que busca personas), rango de fechas (date pickers), tipo de donación (select)
- Tabla con columnas: Fecha, Donante (nombre + apellido), DNI, Tipo, Peso, Hb, TA, Serología (indicadores HIV/HCV/HBV/Chagas/Sífilis), Acciones
- Serología: indicadores visuales positivos/negativos (check/cross icons en verde/rojo)
- Paginación con `Pagination` de shadcn
- Botón "Nueva donación" → abre Dialog con formulario (TDD-015)

#### donaciones-service.ts
```typescript
async function listar(params: {
  donanteId?: number
  fechaDesde?: string
  fechaHasta?: string
  tipoDonacion?: string
  limit?: number
  offset?: number
}) {
  const { data } = await api.get('/donaciones', { params })
  return parseListarDonacionesResponse(data)
}

async function obtener(id: number) {
  const { data } = await api.get(`/donaciones/${id}`)
  return parseDonacionResponse(data)
}
```

#### Componentes shadcn requeridos
Agregar con `npx shadcn add`:
- `select` (si no está)
- `popover` (para date picker, si no está)

## Casos de Borde y Errores

| Escenario | Resultado Esperado | HTTP |
|-----------|-------------------|------|
| Sin resultados | `{ items: [], total: 0 }` | 200 |
| Donación no encontrada | `{ error: "Donación no encontrada" }` | 404 |
| donanteId inválido (no numérico) | Error de validación | 400 |
| Fecha inválida | Error de validación de formato | 400 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |
| limit > 100 | Se ajusta a 100 sin error | 200 |

## Plan de Implementación

### Backend
1. Crear `donacion.schema.ts` con `donacionResponseSchema`, `listarDonacionesResponseSchema`, `donacionQuerySchema`
2. Crear `donacion.dto.ts` con `toDonacionResponse()` que embebe donante.persona
3. Crear `donacion.repository.ts` con `findAll(filters)`, `count(filters)`, `findById(id)`
4. Crear `donacion.service.ts` con `listar(filters)` y `obtener(id)`
5. Crear `donacion.controller.ts` con `list()` y `getById()`
6. Crear `donacion.routes.ts` con `GET /` y `GET /:id` + authMiddleware
7. Montar `donacion.routes` en `src/routes/index.ts`
8. Tests: integración con supertest (lista completa, filtros, paginación, 404, sin auth)

### Frontend
9. Agregar componentes shadcn faltantes: `npx shadcn add select popover`
10. Crear `donaciones.schema.ts` con schemas de response
11. Crear `donaciones.dto.ts` con `parseDonacionResponse()` y `parseListarDonacionesResponse()`
12. Crear `donaciones-service.ts` con `listar()` y `obtener()`
13. Crear `useDonaciones.ts` con estado de búsqueda, filtros y paginación
14. Crear `donaciones-table.tsx` con tabla responsive, filtros y paginación
15. Crear `app/(protected)/donaciones/page.tsx` como página protegida
16. Descomentar `/donaciones` en `app-sidebar.tsx`
