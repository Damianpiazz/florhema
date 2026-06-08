---
autor: Damián Piazza
fecha: 2026-06-08
titulo: Listar Donantes con filtros y paginación
---

# TDD-019: Listar Donantes

## Contexto de Negocio (PRD)

### Objetivo
Permitir consultar el listado de donantes del sistema con filtros por persona (DNI, nombre, apellido) y estado del semáforo de aptitud. Es la vista principal del módulo Donante, desde donde se puede acceder al detalle de cada donante y gestionar sus donaciones.

### User Persona
- **Nombre**: Técnico / Licenciado en Hemoterapia
- **Necesidad**: Buscar donantes registrados para consultar su aptitud, historial de donaciones o asignar nuevas donaciones.

### Criterios de Aceptación
- Cualquier usuario autenticado puede listar donantes
- Soporta filtros: `dni` (búsqueda parcial), `nombre`, `apellido`, `semaforoAptitud`
- Incluye datos de la persona (nombre, apellido, DNI)
- No incluye donantes soft-deleted
- Paginación con `limit` y `offset` (default 20, máx 100)

## Diseño Técnico (RFC)

### Modelo de Datos
No hay cambios en el schema. Se consulta Donante con relación Persona.

### Contrato de API

#### `GET /api/v1/donantes?dni=123&semaforoAptitud=VERDE&limit=20&offset=0`
**Auth**: Requiere sesión activa (cualquier rol)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "personaId": 1,
        "persona": {
          "id": 1,
          "dni": "12345678",
          "nombre": "Juan",
          "apellido": "Pérez"
        },
        "semaforoAptitud": "VERDE",
        "createdAt": "2026-06-01T10:00:00.000Z"
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### Backend

#### Estructura del Código
```
backend/src/modules/donante/
├── donante.routes.ts        ← se agrega GET /, GET /:id
├── donante.controller.ts    ← handlers list(), getById()
├── donante.service.ts       ← lógica: listar con filtros, validar existencia
├── donante.repository.ts    ← findAll con filtros + count + findById
├── donante.schema.ts        ← schemas query params y response
└── donante.dto.ts           ← toDonanteResponse()
```

#### Repository
```typescript
findAll(filters: {
  dni?: string
  nombre?: string
  apellido?: string
  semaforoAptitud?: SemaforoAptitud
  limit: number
  offset: number
}) => Promise<Donante[]>

count(filters) => Promise<number>

findById(id: number) => Promise<Donante | null>
```

#### Service: `listar(params)`
1. Construir filtros dinámicos (where) sobre `persona` (dni, nombre, apellido) y `semaforoAptitud`
2. Excluir donantes con `deletedAt != null`
3. Ejecutar `findAll` y `count` en paralelo
4. Retornar `{ items: items.map(toDonanteResponse), total, limit, offset }`

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Sin resultados | `{ items: [], total: 0 }` | 200 |
| Donante no encontrado (por id) | `{ error: "Donante no encontrado" }` | 404 |
| Filtro semaforoAptitud inválido | Error de validación | 400 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |
| limit > 100 | Se ajusta a 100 sin error | 200 |

## Plan de Implementación

### Backend
1. Agregar `donanteQuerySchema` y `listarDonantesResponseSchema` en `donante.schema.ts`
2. Agregar `findAll(filters)`, `count(filters)`, `findById()` en `donante.repository.ts`
3. Implementar `listar()` y `obtener()` en `donante.service.ts`
4. Agregar handlers `list()` y `getById()` en `donante.controller.ts`
5. Agregar `GET /` y `GET /:id` en `donante.routes.ts` con authMiddleware
6. Tests: integración (lista completa, filtros, paginación, 404)

### Frontend
7. Agregar `listar()` y `obtener()` en `donantes-service.ts`
8. Crear `useDonantes.ts` con estado de búsqueda, filtros y paginación
9. Crear `donantes-table.tsx` con tabla responsive, filtros y paginación
10. Crear página `app/(protected)/donantes/page.tsx`
11. Descomentar `/donantes` en `app-sidebar.tsx`
