---
autor: Damián Piazza
fecha: 2026-06-04 (actualizado 2026-06-05)
titulo: Ver Detalle de Persona con endpoints separados
---

# TDD-013: Ver Detalle de Persona

## Contexto de Negocio (PRD)

### Objetivo
Mostrar la información completa de una persona (datos personales, grupo sanguíneo, roles asociados) junto con su historial de actividad en secciones independientes: donaciones, transfusiones, estudios gestacionales y recién nacidos.

### User Persona
- **Nombre**: Médico / Administrador del sistema
- **Necesidad**: Consultar el historial completo de una persona en un solo lugar para evaluar su trayectoria como donante, paciente o gestante.

### Criterios de Aceptación
- Requiere autenticación en todos los endpoints
- `GET /personas/:id` retorna datos básicos + grupo sanguíneo + roles (donante/paciente/gestante)
- `GET /personas/:id/donaciones` retorna donaciones paginadas con resultados de serología
- `GET /personas/:id/transfusiones` retorna transfusiones paginadas con compatibilidad y Coombs
- `GET /personas/:id/estudios-gestante` retorna estudios paginados con Coombs indirecto
- `GET /personas/:id/recien-nacidos` retorna recién nacidos paginados con Coombs directo
- `GET /personas/:id/actividad` retorna timeline unificado (mezcla de los 4 tipos ordenado por fecha descendente)
- Todos los endpoints de actividad filtran soft-deletes
- 404 si la persona no existe o está soft-deleted
- Paginación con `?limit=` y `?offset=` (default 20/0, máx 100)

## Diseño Técnico (RFC)

### Decisión Arquitectónica
Se adoptó el enfoque de **endpoints separados** (ADR-013) en lugar de un único endpoint `/detalle`. Cada recurso tiene su propia URI con paginación independiente. Se agrega además un endpoint `/actividad` que unifica los 4 tipos para el timeline.

### Modelo de Datos
No hay cambios en el schema. Se consultan las relaciones existentes:

```
Persona (1) ── (0..1) Donante ── (0..N) Donacion ── (0..1) ResultadoSerologia
         ├── (0..1) Paciente ── (0..N) Transfusion ── (0..1) CompatibilidadTransfusional
         │                                         └── (0..1) ResultadoCoombs
         └── (0..1) Gestante ── (0..N) EstudioGestante ── (0..1) ResultadoCoombs
                        └── (0..N) RecienNacido ── (0..1) ResultadoCoombs
```

### Contrato de API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/personas/:id` | Info básica + grupo sanguíneo + donante/paciente/gestante |
| GET | `/api/v1/personas/:id/donaciones` | Donaciones paginadas + serología |
| GET | `/api/v1/personas/:id/transfusiones` | Transfusiones paginadas + compatibilidad + Coombs |
| GET | `/api/v1/personas/:id/estudios-gestante` | Estudios paginados + Coombs indirecto |
| GET | `/api/v1/personas/:id/recien-nacidos` | Recién nacidos paginados + Coombs directo |
| GET | `/api/v1/personas/:id/actividad` | Timeline unificado paginado en memoria |

#### `GET /api/v1/personas/:id`
**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "dni": "12345678",
    "nombre": "Juan",
    "apellido": "Pérez",
    "fechaNacimiento": "1990-05-15T00:00:00.000Z",
    "direccion": "Av. Siempre Viva 123",
    "telefono": "1112345678",
    "grupoSanguineo": { "id": 1, "tipo": "O", "factorRh": "POSITIVO" },
    "donante": { "id": 1, "semaforoAptitud": "VERDE" },
    "paciente": null,
    "gestante": null
  }
}
```

#### `GET /api/v1/personas/:id/donaciones?limit=20&offset=0`
**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
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

#### `GET /api/v1/personas/:id/actividad?limit=20&offset=0`
**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      { "tipo": "DONACION", "fecha": "2026-05-20T10:00:00.000Z", "id": 1, "peso": 75, ... },
      { "tipo": "TRANSFUSION", "fecha": "2026-04-10T14:30:00.000Z", "id": 1, "componente": "GLOBULOS_ROJOS", ... },
      { "tipo": "ESTUDIO_GESTANTE", "fecha": "2026-03-05T09:00:00.000Z", "id": 1, ... },
      { "tipo": "RECIEN_NACIDO", "fecha": "2026-02-01T00:00:00.000Z", "id": 1, "personaId": 2, ... }
    ],
    "total": 4, "limit": 20, "offset": 0
  }
}
```

### Backend

#### Estructura del Código
```
backend/src/modules/persona/
├── persona.routes.ts        ← rutas: GET /:id, /:id/donaciones, /:id/transfusiones, etc.
├── persona.controller.ts    ← 6 handlers: detalle, listarDonaciones, listarTransfusiones, etc.
├── persona.service.ts       ← lógica de negocio con validación 404 y paginación
├── persona.repository.ts    ← queries con relaciones anidadas filtrando soft-deletes
├── persona.dto.ts           ← mappers toPersonaDetalleResponse, toDonacionResponse, etc.
└── persona.schema.ts        ← schemas Zod para detalle, actividadItem y cada recurso
```

#### Repository (patrón de consulta)
```typescript
// Donaciones: navega desde la tabla hija hacia persona
prisma.donacion.findMany({
  where: { donante: { personaId: id, deletedAt: null }, deletedAt: null },
  include: { resultadoSerologia: true },
  orderBy: { fecha: 'desc' },
  take: limit, skip: offset,
})
```

#### Lógica de negocio (service)

`listarActividad(id, params)`:
1. Verifica que la persona existe (404 si no)
2. Obtiene las 4 fuentes en paralelo con `Promise.all`
3. Mapea cada una a `ActividadItem` con `tipo` discriminator
4. Ordena por `fecha` descendente
5. Pagina con `slice(offset, offset + limit)`
6. Retorna `{ items, total, limit, offset }`

#### Controller
Cada handler:
1. Toma `id` de `req.params`
2. Parsea query con `paginatedQuerySchema` (limit/offset)
3. Llama al service
4. Valida con schema Zod
5. Responde 200 con `successResponse`

### Frontend

#### Estructura del Código
```
frontend/features/personas/
├── personas-service.ts         ← obtenerDetalle(id), listarDonaciones(id, params), etc.
├── types/
│   └── persona-detalle.ts      ← tipos DetallePersona, ActividadItem, etc.
├── hooks/
│   └── usePersonaDetalle.ts    ← TanStack Query: fetch persona + actividad
└── pages/
    └── persona-detalle-page.tsx ← layout con info card + tabs por sección
        ├── persona-info-card.tsx
        ├── donaciones-section.tsx
        ├── transfusiones-section.tsx
        ├── estudios-section.tsx
        ├── recien-nacidos-section.tsx
        └── actividad-timeline.tsx
```

#### personas-service.ts
```typescript
async function obtenerDetalle(id: number) {
  const { data } = await api.get(`/personas/${id}`)
  return data
}
async function listarDonaciones(id: number, params?: { limit?: number; offset?: number }) {
  const { data } = await api.get(`/personas/${id}/donaciones`, { params })
  return data
}
// ... mismos patrones para transfusiones, estudios, recien-nacidos, actividad
```

### Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Persona sin donante/paciente/gestante | `donante: null`, `paciente: null`, `gestante: null` | 200 |
| Persona sin actividad (para un endpoint específico) | `items: []`, `total: 0` | 200 |
| Persona sin actividad (para /actividad) | `items: []`, `total: 0` | 200 |
| Persona no encontrada o soft-deleted | `{ error: "Persona no encontrada" }` | 404 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `persona.repository.ts` | +11 métodos: findByIdWithRoles, find*ByPersonaId + count para cada recurso |
| `persona.schema.ts` | + schemas: personaDetalle, donacion, transfusion, estudio, recien-nacido, actividadItem, paginatedQuery |
| `persona.dto.ts` | +9 mapeadores: toPersonaDetalleResponse, to*Response, to*ActividadItem |
| `persona.service.ts` | +7 funciones: obtenerDetalle, listarDonaciones, listarTransfusiones, listarEstudios, listarRecienNacidos, listarActividad |
| `persona.controller.ts` | +6 handlers con OpenAPI docs |
| `persona.routes.ts` | +6 rutas (GET /:id, /:id/donaciones, etc.) |
| `persona.api.test.ts` | +22 tests (6 describes nuevos) |
| `actividad.seed.ts` | Nuevo: seeder que crea donantes, pacientes, gestantes con datos de prueba |
| `seed/index.ts` | Agrega seedActividad() al pipeline de seeds |

### Seed de Datos de Prueba

El seeder `actividad.seed.ts` genera:
- **30% de personas** como donantes: 1-5 donaciones cada uno con resultados de serología
- **20% de personas** como pacientes: 1-3 transfusiones cada uno con compatibilidad y Coombs
- **10% de personas** como gestantes: 1-3 estudios con Coombs indirecto + 1-2 recién nacidos con Coombs directo

Ejecutar: `npx prisma db seed`
