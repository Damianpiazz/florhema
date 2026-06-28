---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Actualizar Recién Nacido
---

# TDD-032: Actualizar Recién Nacido

## Contexto de Negocio (PRD)

### Objetivo
Permitir corregir los datos de un recién nacido registrado, incluyendo datos de persona y resultado de Coombs directa.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Corregir datos mal cargados del recién nacido o actualizar el resultado de Coombs directa cuando se obtiene el resultado definitivo.

### Criterios de Aceptación
*   El recién nacido debe existir y no estar soft-deleted
*   Se pueden actualizar datos de la persona base y el resultado Coombs
*   No se permite cambiar de gestante

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `PUT /api/v1/recien-nacidos/:id`
*   **Auth**: Requiere sesión activa
*   **Request Body** (todos opcionales):
```json
{
  "nombre": "Juan Carlos",
  "apellido": "Pérez García",
  "grupoSanguineoId": 2,
  "pruebaCoombsDirecta": {
    "tipo": "DIRECTO",
    "positivo": true
  }
}
```
*   **Response** `200 OK`: Misma estructura que creación

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Recién nacido no existe | `{ error: "Recién nacido no encontrado" }` | 404 |
| Grupo sanguíneo no existe | `{ error: "El grupo sanguíneo indicado no existe" }` | 404 |
| Body vacío | Error de validación | 400 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Schema con campos opcionales de persona + coombs
2. Service: actualizar persona + upsert coombs
3. Ruta PUT /:id
4. Tests

### Frontend
5. Botón "Editar" en cada fila de recién nacidos
6. Mismo formulario precargado
