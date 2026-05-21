---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Listar Grupos Sanguíneos
---

# TDD-005: Listar Grupos Sanguíneos

## Contexto de Negocio (PRD)

### Objetivo
Permitir consultar el catálogo de grupos sanguíneos (ABO + Rh) para mostrarlos en formularios de registro de personas, donantes y estudios de compatibilidad.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Visualizar los grupos sanguíneos disponibles al cargar una persona o consultar la tabla de compatibilidad.

### Criterios de Aceptación
*   El sistema debe devolver todos los grupos sanguíneos activos (no soft-deleted)
*   Cada grupo debe incluir `id`, `tipo` (A/B/AB/O) y `factorRh` (POSITIVO/NEGATIVO)
*   Los resultados deben ordenarse por tipo y factorRh
*   No requiere autenticación (es dato público del sistema)

## Diseño Técnico (RFC)

### Modelo de Datos

**GrupoSanguineo** (ya existe en `schema.prisma`)

| Campo | Tipo | Restricciones |
|---|---|---|
| id | Int | PK, autoincrement |
| tipo | TipoABO (enum) | NOT NULL |
| factorRh | FactorRh (enum) | NOT NULL |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| deletedAt | DateTime? | |
| createdById | Int? | FK -> User |
| updatedById | Int? | FK -> User |
| deletedById | Int? | FK -> User |

`@@unique([tipo, factorRh])`

### Contrato de API

*   **Endpoint**: `GET /api/v1/grupos-sanguineos`
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": 1, "tipo": "A", "factorRh": "POSITIVO" },
      { "id": 2, "tipo": "A", "factorRh": "NEGATIVO" },
      { "id": 3, "tipo": "B", "factorRh": "POSITIVO" },
      { "id": 4, "tipo": "B", "factorRh": "NEGATIVO" },
      { "id": 5, "tipo": "AB", "factorRh": "POSITIVO" },
      { "id": 6, "tipo": "AB", "factorRh": "NEGATIVO" },
      { "id": 7, "tipo": "O", "factorRh": "POSITIVO" },
      { "id": 8, "tipo": "O", "factorRh": "NEGATIVO" }
    ]
  }
}
```

### Estructura del Código

```
src/
└── modules/
    └── grupo-sanguineo/
        ├── grupo-sanguineo.routes.ts        ← define ruta GET /
        ├── grupo-sanguineo.controller.ts    ← handler list()
        ├── grupo-sanguineo.service.ts       ← listar(): obtiene todos activos ordenados
        ├── grupo-sanguineo.repository.ts    ← findAllActive()
        ├── grupo-sanguineo.schema.ts        ← enums TipoABO, FactorRh + responseSchema
        └── grupo-sanguineo.dto.ts           ← toResponse()
```

### Patrón de respuesta

Sigue el mismo patrón que auth:
- `successResponse({ items: [...] })` para listas
- `errorResponse('mensaje')` para errores

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Catálogo vacío (sin seed) | `{ "data": { "items": [] } }` | 200 OK |
| Grupos soft-deleted | No se incluyen en la respuesta | 200 OK |

## Plan de Implementación

1. Definir `grupo-sanguineo.schema.ts` con los enums `TipoABO` y `FactorRh` como strings de Zod, más `grupoSanguineoResponseSchema`
2. Implementar `grupo-sanguineo.dto.ts` con `toGrupoSanguineoResponse()`
3. Implementar `grupo-sanguineo.repository.ts` con `findAllActive()` (filtra `deletedAt = null`, ordena por tipo y factorRh)
4. Implementar `grupo-sanguineo.service.ts` con `listar()`
5. Implementar `grupo-sanguineo.controller.ts` con `list()`
6. Definir `grupo-sanguineo.routes.ts` con `GET /`
7. Montar rutas en `src/routes/index.ts` como `apiRouter.use('/grupos-sanguineos', grupoSanguineoRoutes)`
8. Tests: integración con supertest (lista completa, catálogo vacío)
