---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Actualizar Paciente
---

# TDD-035: Actualizar Paciente

## Contexto de Negocio (PRD)

### Objetivo
Actualmente el modelo `Paciente` no tiene atributos adicionales más allá de la relación con `Persona`. Este TDD queda definido para futuros campos que puedan agregarse (ej. diagnóstico, número de historia clínica).

### Criterios de Aceptación
*   El paciente debe existir y no estar soft-deleted
*   Por ahora el endpoint existe como placeholder para futuros campos

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `PUT /api/v1/pacientes/:id`
*   **Auth**: Requiere sesión activa
*   **Request Body**: Vacío por ahora (reservado para futuros atributos)
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": { "message": "Paciente actualizado correctamente" }
}
```

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Paciente no existe | `{ error: "Paciente no encontrado" }` | 404 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |
