---
autor: gentle-ai
fecha: 2026-06-26
titulo: Visualización de Auditorías
---

# TDD-043: Visualización de Auditorías

## Contexto de Negocio (PRD)

### Objetivo
Proveer una vista cronológica de todas las operaciones registradas en el sistema (creación, modificación y eliminación de entidades), permitiendo al ADMIN rastrear quién hizo qué, cuándo y sobre qué registro. Esto es un requisito regulatorio para servicios de hemoterapia (trazabilidad de operaciones).

### User Persona
*   **Nombre**: Administrador del sistema / Auditor interno
*   **Necesidad**: Poder revisar el historial de cambios del sistema para auditoría, resolver incidencias o verificar quién realizó una operación específica. Hoy los datos están en la tabla `AuditLog` pero no hay interfaz para consultarlos.

### Criterios de Aceptación
*   El ADMIN puede ver todos los logs de auditoría ordenados cronológicamente (más recientes primero)
*   La vista está paginada (50 items por página)
*   Se puede filtrar por entidad (ej: "User", "Donacion"), por acción (CREATE, UPDATE, DELETE) y por rango de fechas
*   Cada entrada muestra: fecha, usuario que realizó la acción, entidad afectada, ID de la entidad, acción, y acceso a valores anteriores/nuevos (si existen)
*   Los valores antiguos y nuevos se muestran en formato JSON legible (formateado, no raw)
*   Solo accesible para usuarios con rol ADMIN
*   La sidebar muestra "Auditoría" solo si el usuario logueado es ADMIN

## Diseño Técnico (RFC)

### Modelo de Datos

Se utiliza el modelo `AuditLog` existente en Prisma con su relación a `User`. No requiere migraciones.

| Campo | Tipo | Descripción |
|---|---|---|
| id | Int | PK, autoincrement |
| userId | Int | FK -> User (quién hizo la operación) |
| action | String | "CREATE", "UPDATE", "DELETE" |
| entity | String | Nombre del modelo (ej: "User", "Donacion") |
| entityId | Int | ID del registro afectado |
| oldValues | Json? | Valores anteriores (solo en UPDATE y DELETE) |
| newValues | Json? | Valores nuevos (solo en CREATE y UPDATE) |
| createdAt | DateTime | @default(now()) |

### Contrato de API

Requiere `authMiddleware` + `adminMiddleware`.

#### `GET /api/v1/audit`

Listar logs de auditoría con paginación y filtros.

**Query Params**:
```
?page=1&pageSize=50
&entity=User
&action=UPDATE
&fechaDesde=2026-01-01
&fechaHasta=2026-06-26
```

Todos los query params son opcionales. Sin filtros, trae todos los logs ordenados por `createdAt DESC`.

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "action": "UPDATE",
        "entity": "User",
        "entityId": 3,
        "oldValues": { "role": "USER" },
        "newValues": { "role": "ADMIN" },
        "createdAt": "2026-06-25T14:30:00.000Z",
        "usuario": { "id": 1, "email": "admin@hospital.com", "name": "Admin" }
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 50
  }
}
```

El objeto `usuario` dentro de cada item es el que realizó la acción (el `userId` de la tabla). Se incluye mediante `include: { user: { select: { id: true, email: true, name: true } } }`.

### Estructura del Código

**Backend** (se expande el módulo `audit` existente):

```
backend/src/modules/audit/
├── audit.routes.ts            ← GET / (listar con filtros y paginación)
├── audit.controller.ts        ← handler listar()
├── audit.service.ts           ← listar() con filtros opcionales
├── audit.schema.ts            ← Zod schema para query params
└── audit.repository.ts        ← YA EXISTE — agregar findAll(filters)
```

Se agrega al `audit.repository.ts` existente una función `findAll()`:

```ts
interface AuditFilters {
  page: number
  pageSize: number
  entity?: string
  action?: string
  fechaDesde?: Date
  fechaHasta?: Date
}

async function findAll(filters: AuditFilters) {
  // build where clause con filtros opcionales
  // paginación con skip/take
  // orderBy: { createdAt: 'desc' }
  // include: { user: { select: { id, email, name } } }
}
```

**Frontend** (nueva feature `auditoria`):

```
frontend/features/auditoria/
├── components/
│   ├── auditoria-table.tsx    ← tabla con columnas: fecha, usuario, entidad, ID, acción, ver detalles
│   └── auditoria-detalle.tsx  ← sheet/dialog con oldValues y newValues formateados
├── hooks/
│   └── useAuditoria.ts       ← estado de filtros y paginación
├── auditoria-service.ts      ← llamada GET /audit con query params
├── auditoria.dto.ts          ← mapeo de respuesta
└── auditoria.schema.ts       ← tipos compartidos

frontend/app/(protected)/auditoria/
└── page.tsx                  ← página con tabla + filtros
```

### UX de la tabla

| Columna | Descripción |
|---|---|
| Fecha | `createdAt` formateado (ej: "25 jun 2026, 14:30") |
| Usuario | Nombre y email de quien realizó la acción |
| Entidad | Nombre del modelo traducido (User → "Usuario", Donacion → "Donación") |
| ID | ID del registro afectado |
| Acción | Badge: CREATE (verde), UPDATE (amarillo), DELETE (rojo) |
| Detalle | Botón que abre un sheet con oldValues / newValues en JSON formateado |

**Traducción de entidades** (mostrar en español en la UI):
- "User" → "Usuario"
- "Donacion" → "Donación"
- "Persona" → "Persona"
- "Donante" → "Donante"
- "Paciente" → "Paciente"
- "Transfusion" → "Transfusión"
- "Gestante" → "Gestante"
- "EstudioGestante" → "Estudio de Gestante"
- "RecienNacido" → "Recién Nacido"
- "GrupoSanguineo" → "Grupo Sanguíneo"
- "ResultadoSerologia" → "Serología"
- "ResultadoCoombs" → "Coombs"
- "CompatibilidadTransfusional" → "Compatibilidad"
- "Session" → "Sesión"
- default → el mismo nombre

## Casos de Borde y Errores

### Backend

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Sin filtros | Todos los logs, ordenados por fecha descendente | 200 |
| Filtro por entidad inexistente | Array vacío (no error) | 200 |
| Página fuera de rango | Array vacío en items | 200 |
| Usuario no ADMIN | "Acción no permitida. Se requiere rol ADMIN" | 403 |
| Sin sesión | "No autenticado" | 401 |
| `fechaDesde` > `fechaHasta` | "La fecha desde no puede ser posterior a la fecha hasta" | 400 |

### Frontend

| Escenario | Comportamiento |
|---|---|
| Sin resultados con filtros | "No se encontraron registros de auditoría para los filtros seleccionados" |
| Fecha inválida | Selector de fecha previene input inválido |
| JSON de oldValues/newValues vacío o null | "Sin datos" en el detalle |
| Valores JSON grandes | El sheet/layout debe soportar scroll |
| Carga | Tabla con skeleton/spinner |

## Plan de Implementación

### Backend
1. Agregar `findAll(filters)` a `audit.repository.ts` con paginación, filtros y ordenamiento
2. Crear `audit.schema.ts` con `auditQuerySchema` (page, pageSize, entity?, action?, fechaDesde?, fechaHasta?)
3. Crear `audit.service.ts` con `listar(filters)` que delega al repository
4. Crear `audit.controller.ts` con handler `listar()` que parsea query params y responde
5. Crear `audit.routes.ts` con `GET /`, montar en `routes/index.ts` como `/audit`
6. Tests: integración del endpoint con supertest

### Frontend
7. Crear `features/auditoria/` con schema types, service, dto
8. Crear hook `useAuditoria` con estado de filtros (entidad, acción, fechas) y paginación
9. Implementar `auditoria-table.tsx` con TanStack Table:
   - Columnas: fecha, usuario, entidad (traducida), ID, acción (badge coloreado), detalle (botón)
   - Filtros arriba de la tabla: select de entidad, select de acción, date range
   - Paginación abajo
10. Implementar `auditoria-detalle.tsx` como Sheet:
   - Muestra oldValues y newValues en `<pre>` con JSON.stringify(..., null, 2)
   - Etiqueta "Valores anteriores" / "Valores nuevos" con badges de diferencia
11. Crear página `app/(protected)/auditoria/page.tsx`
12. Agregar entrada "Auditoría" en la sidebar (`app-sidebar.tsx`) con icono `ScrollText`, visible solo si `user.role === 'ADMIN'`
