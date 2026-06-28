---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Listar Transfusiones con filtros y paginación
---

# TDD-020: Listar Transfusiones

## Contexto de Negocio (PRD)

### Objetivo
Permitir consultar el historial de transfusiones del sistema con filtros por paciente, rango de fechas, componente y compatibilidad.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Consultar qué hemocomponentes se transfundieron a cada paciente, ver resultados de compatibilidad y Coombs, y mantener la trazabilidad requerida por las planillas HEMO.

### Criterios de Aceptación
*   Usuarios autenticados pueden listar transfusiones
*   Soporta filtros: `pacienteId`, `fechaDesde`, `fechaHasta`, `componente` (TipoHemocomponente)
*   Incluye datos del paciente (nombre, apellido, DNI), compatibilidad y resultado Coombs
*   No incluye transfusiones soft-deleted
*   Paginación offset-based con `limit` (default 20, máx 100) y `offset`

## Diseño Técnico (RFC)

### Modelo de Datos
No hay cambios en el schema. Se consultan las relaciones existentes:

```
Transfusion (1) ── (1) Paciente ── (1) Persona
     │
     ├── (0..1) CompatibilidadTransfusional ── (1) GrupoSanguineo (donante)
     │                                              └── (1) GrupoSanguineo (receptor)
     │
     └── (0..1) ResultadoCoombs
```

### Contrato de API

*   **Endpoint**: `GET /api/v1/transfusiones?pacienteId=1&fechaDesde=2026-01-01&fechaHasta=2026-12-31&componente=GLOBULOS_ROJOS&limit=20&offset=0`
*   **Auth**: Requiere sesión activa
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "paciente": { "id": 1, "personaId": 1, "nombre": "María", "apellido": "García", "dni": "87654321" },
        "fecha": "2026-06-01T10:00:00.000Z",
        "componente": "GLOBULOS_ROJOS",
        "cantidadUnidades": 2,
        "reaccionAdversa": null,
        "compatibilidad": { "id": 1, "compatible": true, "motivoIncompatibilidad": null },
        "resultadoCoombs": { "id": 1, "tipo": "DIRECTO", "positivo": false }
      }
    ],
    "total": 1, "limit": 20, "offset": 0
  }
}
```

*   **Endpoint**: `GET /api/v1/transfusiones/:id`
*   **Response** `200 OK`: Misma estructura de item en `data.item`

### Backend

#### Estructura del Código

```
backend/src/modules/transfusion/
├── transfusion.routes.ts        ← GET /, GET /:id con authMiddleware
├── transfusion.controller.ts    ← list(), getById()
├── transfusion.service.ts       ← listar(filters), obtener(id)
├── transfusion.repository.ts    ← findAll(filters), count(filters), findById(id)
├── transfusion.schema.ts        ← transfusionQuerySchema, transfusionResponseSchema
└── transfusion.dto.ts           ← toTransfusionResponse()
```

#### Repository

```typescript
findAll(filters: {
  pacienteId?: number
  fechaDesde?: Date
  fechaHasta?: Date
  componente?: TipoHemocomponente
  limit: number
  offset: number
}): Promise<Transfusion[]>

count(filters): Promise<number>

findById(id: number): Promise<Transfusion | null>
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
  return { items: items.map(toTransfusionResponse), total, limit, offset }
}

obtener(id) {
  const transfusion = await repository.findById(id)
  if (!transfusion || transfusion.deletedAt)
    throw new AppError(404, 'Transfusión no encontrada')
  return toTransfusionResponse(transfusion)
}
```

#### Controller

```typescript
list(req, res, next) {
  const query = transfusionQuerySchema.parse(req.query)
  const result = await transfusionService.listar(query)
  res.status(200).json(successResponse(result))
}

getById(req, res, next) {
  const id = Number(req.params.id)
  const result = await transfusionService.obtener(id)
  res.status(200).json(successResponse({ item: result }))
}
```

#### DTO

`toTransfusionResponse(t)` embebe:
- `paciente`: `{ id, personaId, nombre, apellido, dni }` desde `t.paciente.persona`
- `compatibilidad`: `{ id, compatible, motivoIncompatibilidad }` desde `t.compatibilidad`
- `resultadoCoombs`: `{ id, tipo, positivo }` desde `t.resultadoCoombs`

### Frontend

#### Ruta: `/transfusiones` — Protegida (requiere autenticación)

#### Estructura del Código

```
frontend/features/transfusiones/
├── transfusiones.schema.ts         ← Zod schemas de response
├── transfusiones.dto.ts            ← parseTransfusionResponse()
├── transfusiones-service.ts        ← listar(), obtener()
├── hooks/
│   └── useTransfusiones.ts         ← estado: query, page, filters
└── components/
    └── transfusiones-table.tsx     ← Tabla con filtros y paginación
app/(protected)/
└── transfusiones/
    └── page.tsx                    ← Página protegida
```

#### Contrato de UI
- Header con inputs de filtro: búsqueda por paciente (autocomplete que busca personas), rango de fechas (date pickers), componente (select con TipoHemocomponente)
- Tabla con columnas: Fecha, Paciente (nombre + apellido), DNI, Componente, Unidades, Coombs, Compatibilidad, Acciones
- Paginación con `PaginationBar`
- Botón "Nueva transfusión" → abre Dialog con formulario (TDD-021)

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Sin resultados | `{ items: [], total: 0 }` | 200 |
| Transfusión no encontrada | `{ error: "Transfusión no encontrada" }` | 404 |
| pacienteId inválido (no numérico) | Error de validación | 400 |
| Fecha inválida | Error de validación de formato | 400 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |
| limit > 100 | Se ajusta a 100 sin error | 200 |

## Plan de Implementación

### Backend
1. Crear `transfusion.schema.ts` con `transfusionQuerySchema` y `transfusionResponseSchema`
2. Crear `transfusion.dto.ts` con `toTransfusionResponse()` que embebe paciente.persona, compatibilidad y coombs
3. Crear `transfusion.repository.ts` con `findAll(filters)`, `count(filters)`, `findById(id)`
4. Crear `transfusion.service.ts` con `listar(filters)` y `obtener(id)`
5. Crear `transfusion.controller.ts` con `list()` y `getById()`
6. Crear `transfusion.routes.ts` con `GET /` y `GET /:id` + authMiddleware
7. Montar `transfusion.routes` en `src/routes/index.ts`
8. Tests: integración con supertest (lista completa, filtros, paginación, 404, sin auth)

### Frontend
9. Crear `transfusiones.schema.ts` con schemas de response
10. Crear `transfusiones.dto.ts` con `parseTransfusionResponse()` y `parseListarTransfusionesResponse()`
11. Crear `transfusiones-service.ts` con `listar()` y `obtener()`
12. Crear `useTransfusiones.ts` con estado de búsqueda, filtros y paginación
13. Crear `transfusiones-table.tsx` con tabla responsive, filtros y paginación
14. Descomentar `/transfusiones` en `app-sidebar.tsx`
