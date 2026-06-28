---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Listar Estudios de Gestante con filtros
---

# TDD-027: Listar Estudios de Gestante

## Contexto de Negocio (PRD)

### Objetivo
Consultar el historial de estudios realizados a una gestante, incluyendo resultados de Coombs indirecta, compatibilidad conyugal y estado del estudio.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Revisar los estudios de laboratorio realizados a una gestante durante su seguimiento, ver resultados de Coombs indirecta y estado del estudio.

### Criterios de Aceptación
*   Usuarios autenticados pueden listar estudios de una gestante
*   Filtros: `fechaDesde`, `fechaHasta`, `estadoEstudio` (PENDIENTE / FINALIZADO)
*   Incluye resultado de Coombs indirecta
*   No incluye estudios soft-deleted
*   Paginación offset-based

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `GET /api/v1/gestantes/:gestanteId/estudios?fechaDesde=2026-01-01&fechaHasta=2026-12-31&estadoEstudio=FINALIZADO&limit=20&offset=0`
*   **Auth**: Requiere sesión activa
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "gestanteId": 1,
        "fecha": "2026-06-01T10:00:00.000Z",
        "compatibilidadConyugal": "Compatible",
        "estadoEstudio": "FINALIZADO",
        "pruebaCoombsIndirecta": { "id": 1, "tipo": "INDIRECTO", "positivo": false }
      }
    ],
    "total": 1, "limit": 20, "offset": 0
  }
}
```

### Backend

```
backend/src/modules/estudio-gestante/
├── estudio-gestante.routes.ts
├── estudio-gestante.controller.ts
├── estudio-gestante.service.ts
├── estudio-gestante.repository.ts
├── estudio-gestante.schema.ts
└── estudio-gestante.dto.ts
```

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Gestante no existe | `{ error: "Gestante no encontrada" }` | 404 |
| Sin resultados | `{ items: [], total: 0 }` | 200 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |
