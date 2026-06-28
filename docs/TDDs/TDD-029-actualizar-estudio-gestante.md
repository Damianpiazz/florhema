---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Actualizar Estudio de Gestante
---

# TDD-029: Actualizar Estudio de Gestante

## Contexto de Negocio (PRD)

### Objetivo
Permitir corregir o actualizar los datos de un estudio de gestante existente, incluyendo el resultado de Coombs indirecta y el estado del estudio.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Marcar un estudio como FINALIZADO cuando llegan los resultados, o corregir datos cargados incorrectamente.

### Criterios de Aceptación
*   El estudio debe existir y no estar soft-deleted
*   Se puede cambiar `estadoEstudio` de PENDIENTE a FINALIZADO (y viceversa)
*   El `ResultadoCoombs` se actualiza si se envía
*   No se puede cambiar de gestante

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `PUT /api/v1/estudios-gestante/:id`
*   **Auth**: Requiere sesión activa
*   **Request Body**:
```json
{
  "fecha": "2026-06-02T10:00:00.000Z",
  "compatibilidadConyugal": "Incompatible - Grupo A+ padre, O+ madre",
  "estadoEstudio": "FINALIZADO",
  "pruebaCoombsIndirecta": {
    "tipo": "INDIRECTO",
    "positivo": true
  }
}
```
*   **Response** `200 OK`: Misma estructura que creación

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Estudio no existe | `{ error: "Estudio no encontrado" }` | 404 |
| Estudio soft-deleted | `{ error: "Estudio no encontrado" }` | 404 |
| Body vacío | Error de validación | 400 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Schema con todos los campos opcionales
2. Service: validar existencia, actualizar estudio y coombs en transacción
3. Ruta PUT /:id
4. Tests

### Frontend
5. Botón "Editar" en cada fila de estudios
6. Mismo formulario precargado
