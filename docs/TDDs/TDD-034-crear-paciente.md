---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Asignar rol Paciente a una Persona
---

# TDD-034: Crear Paciente

## Contexto de Negocio (PRD)

### Objetivo
Registrar a una persona existente como paciente, activando el sub-módulo de transfusiones que permite registrar los hemocomponentes transfundidos.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Al recibir a un paciente que requiere una transfusión, marcarlo como paciente en el sistema para luego registrar las transfusiones.

### Criterios de Aceptación
*   Solo usuarios autenticados pueden crear un paciente
*   La persona base debe existir y no estar soft-deleted
*   No se puede crear un paciente si la persona ya tiene ese rol activo
*   Una persona puede ser paciente y donante a la vez

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `POST /api/v1/personas/:personaId/paciente`
*   **Auth**: Requiere sesión activa
*   **Request Body**: Vacío (no tiene atributos extra)
*   **Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "personaId": 1
    }
  }
}
```

### Backend

```
backend/src/modules/paciente/
├── paciente.routes.ts
├── paciente.controller.ts
├── paciente.service.ts
├── paciente.repository.ts
├── paciente.schema.ts
└── paciente.dto.ts
```

#### Service: `crear(personaId)`

1. `findPersonaById(personaId)` — si no existe o soft-deleted → `AppError(404, 'Persona no encontrada')`
2. `findByPersonaId(personaId)` — si ya existe paciente activo → `AppError(409, 'La persona ya está registrada como paciente')`
3. `create({ personaId })`

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Persona no existe | `{ error: "Persona no encontrada" }` | 404 |
| Persona ya es paciente | `{ error: "La persona ya está registrada como paciente" }` | 409 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Schema, DTO, repository, service, controller, routes
2. Tests

### Frontend
3. Botón "Registrar como paciente" en el detalle de persona cuando no tiene el rol
