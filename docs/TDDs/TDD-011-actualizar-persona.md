---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Actualizar Persona
---

# TDD-011: Actualizar Persona

## Contexto de Negocio (PRD)

### Objetivo
Permitir modificar los datos de una persona existente. Cualquier usuario autenticado puede actualizar datos siempre que el DNI no entre en conflicto con otra persona.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Corregir el teléfono, dirección o grupo sanguíneo de una persona ya registrada.

### Criterios de Aceptación
*   Cualquier usuario autenticado puede actualizar una persona
*   El DNI no puede cambiarse a uno que ya pertenezca a otra persona
*   El grupo sanguíneo debe existir en el catálogo
*   No se puede actualizar una persona soft-deleted
*   Se registra el usuario autenticado como `updatedBy`

## Diseño Técnico (RFC)

### Modelo de Datos

Misma entidad `Persona`. La actualización utiliza `updatedAt` y `updatedById` automáticos.

### Contrato de API

*   **Endpoint**: `PUT /api/v1/personas/:id`
*   **Auth**: Requiere sesión activa (cualquier rol)
*   **Request Body** (todos los campos opcionales para permitir actualización parcial — o todos requeridos):
```json
{
  "dni": "12345678",
  "nombre": "Juan Carlos",
  "apellido": "Pérez",
  "fechaNacimiento": "1990-05-15",
  "direccion": "Nueva dirección 456",
  "telefono": "1112345678",
  "grupoSanguineoId": 2
}
```
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "dni": "12345678",
      "nombre": "Juan Carlos",
      "apellido": "Pérez",
      "fechaNacimiento": "1990-05-15T00:00:00.000Z",
      "direccion": "Nueva dirección 456",
      "telefono": "1112345678",
      "grupoSanguineo": { "id": 2, "tipo": "A", "factorRh": "POSITIVO" }
    }
  }
}
```

### Schema Zod

Se reutiliza el mismo esquema de creación (todos los campos requeridos) o se define un schema parcial. Se opta por schema completo (mismos campos que creación).

```ts
const actualizarPersonaSchema = z.object({
  dni: z.string().min(7).max(10),
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  fechaNacimiento: z.coerce.date(),
  direccion: z.string().min(1),
  telefono: z.string().min(1),
  grupoSanguineoId: z.number().int().positive(),
})
```

### Estructura del Código

```
src/modules/persona/
├── persona.routes.ts        ← agrega PUT /:id con authMiddleware
├── persona.controller.ts    ← handler update()
├── persona.service.ts       ← actualizar(): validar existencia, DNI único, grupo válido, actualizar
└── persona.repository.ts    ← update(), findById()
```

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Persona no encontrada | `{ "error": "Persona no encontrada" }` | 404 Not Found |
| DNI duplicado (otra persona) | `{ "error": "El DNI ya pertenece a otra persona" }` | 409 Conflict |
| grupoSanguineoId no existe | `{ "error": "El grupo sanguíneo indicado no existe" }` | 404 Not Found |
| Persona soft-deleted | `{ "error": "Persona no encontrada" }` | 404 Not Found |
| Sin autenticación | `{ "error": "No autenticado" }` | 401 Unauthorized |

## Plan de Implementación

1. Reutilizar schema de creación o definir `actualizarPersonaSchema`
2. Implementar en repository: `update(id, data)`, `findById(id)` (solo activos), `findByDni(dni)` (excluyendo el mismo id)
3. Implementar en service: `actualizar(id, data, userId)` — verifica existencia, verifica DNI único (excluyéndose), verifica grupo sanguíneo, actualiza
4. Agregar handler `update()` en controller
5. Agregar ruta `PUT /:id` con authMiddleware
6. Tests: integración con supertest (éxito 200, persona no encontrada 404, DNI duplicado 409, grupo inválido 404)
