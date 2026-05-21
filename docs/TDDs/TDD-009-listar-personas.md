---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Listar Personas
---

# TDD-009: Listar Personas

## Contexto de Negocio (PRD)

### Objetivo
Permitir consultar el registro de personas del sistema para buscarlas por DNI, visualizar sus datos y acceder a sus relaciones (donante, paciente, gestante).

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Buscar una persona por DNI para registrarla como donante, paciente o gestante, o para consultar sus datos existentes.

### Criterios de Aceptación
*   Cualquier usuario autenticado puede listar personas
*   Soporta búsqueda por DNI (parcial o exacta)
*   Los resultados incluyen el grupo sanguíneo asociado
*   No se incluyen personas soft-deleted
*   Los resultados deben paginarse (limit y offset)

## Diseño Técnico (RFC)

### Modelo de Datos

**Persona** (ya existe en `schema.prisma`)

| Campo | Tipo | Restricciones |
|---|---|---|
| id | Int | PK, autoincrement |
| dni | String | UNIQUE, NOT NULL |
| nombre | String | NOT NULL |
| apellido | String | NOT NULL |
| fechaNacimiento | DateTime | NOT NULL |
| direccion | String | NOT NULL |
| telefono | String | NOT NULL |
| grupoSanguineoId | Int | FK -> GrupoSanguineo |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| deletedAt | DateTime? | |
| createdById | Int? | FK -> User |
| updatedById | Int? | FK -> User |
| deletedById | Int? | FK -> User |

### Contrato de API

*   **Endpoint**: `GET /api/v1/personas?dni=123&limit=10&offset=0`
*   **Auth**: Requiere sesión activa (cualquier rol)
*   **Query params**:
    - `dni` (opcional): búsqueda parcial por DNI (`contains`)
    - `limit` (opcional, default 20): cantidad de resultados por página
    - `offset` (opcional, default 0): desplazamiento para paginación
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "dni": "12345678",
        "nombre": "Juan",
        "apellido": "Pérez",
        "fechaNacimiento": "1990-05-15T00:00:00.000Z",
        "direccion": "Av. Siempre Viva 123",
        "telefono": "1112345678",
        "grupoSanguineo": { "id": 1, "tipo": "O", "factorRh": "POSITIVO" }
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### Estructura del Código

```
src/
└── modules/
    └── persona/
        ├── persona.routes.ts        ← define ruta GET /
        ├── persona.controller.ts    ← handler list()
        ├── persona.service.ts       ← listar(): filtrar, paginar
        ├── persona.repository.ts    ← findAll(), count(), findById()
        ├── persona.schema.ts        ← schemas de respuesta
        └── persona.dto.ts           ← toResponse()
```

### Patrón de respuesta

Lista paginada con metadatos:
- `items`: array de personas con grupoSanguineo embebido
- `total`: cantidad total de resultados (sin paginación)
- `limit`: límite aplicado
- `offset`: offset aplicado

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Sin resultados | `{ "data": { "items": [], "total": 0 } }` | 200 OK |
| Búsqueda por DNI parcial | Retorna personas cuyo DNI contenga el valor | 200 OK |
| Sin autenticación | `{ "error": "No autenticado" }` | 401 Unauthorized |
| limit excede máximo (100) | Se ajusta a 100 sin error | 200 OK |

## Plan de Implementación

1. Definir `persona.schema.ts` con `personaResponseSchema` (incluye grupoSanguineo embebido) y query params schema
2. Implementar `persona.dto.ts` con `toPersonaResponse()`
3. Implementar `persona.repository.ts` con `findAll(filters)`, `count(filters)`, `findById(id)`
4. Implementar `persona.service.ts` con `listar({ dni, limit, offset })`
5. Implementar `persona.controller.ts` con `list()`
6. Definir `persona.routes.ts` con `GET /` y authMiddleware
7. Montar rutas en `src/routes/index.ts`
8. Tests: integración con supertest (lista completa, búsqueda por DNI, paginación, sin auth)
