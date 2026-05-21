---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Crear Persona
---

# TDD-010: Crear Persona

## Contexto de Negocio (PRD)

### Objetivo
Permitir registrar una nueva persona en el sistema con sus datos básicos y grupo sanguíneo. Una persona es el registro base para luego asignarla como donante, paciente o gestante.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Cargar los datos de una persona que llega al servicio para luego registrarla como donante, paciente o gestante.

### Criterios de Aceptación
*   Cualquier usuario autenticado puede crear una persona
*   El DNI debe ser único en el sistema
*   El grupo sanguíneo debe existir en el catálogo (FK válida)
*   Todos los campos obligatorios deben validarse
*   Se registra el usuario autenticado como `createdBy`

## Diseño Técnico (RFC)

### Modelo de Datos

Misma entidad `Persona` de TDD-009. La creación setea `createdById` con el usuario autenticado.

### Contrato de API

*   **Endpoint**: `POST /api/v1/personas`
*   **Auth**: Requiere sesión activa (cualquier rol)
*   **Request Body**:
```json
{
  "dni": "12345678",
  "nombre": "Juan",
  "apellido": "Pérez",
  "fechaNacimiento": "1990-05-15",
  "direccion": "Av. Siempre Viva 123",
  "telefono": "1112345678",
  "grupoSanguineoId": 1
}
```
*   **Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "dni": "12345678",
      "nombre": "Juan",
      "apellido": "Pérez",
      "fechaNacimiento": "1990-05-15T00:00:00.000Z",
      "direccion": "Av. Siempre Viva 123",
      "telefono": "1112345678",
      "grupoSanguineo": { "id": 1, "tipo": "O", "factorRh": "POSITIVO" }
    }
  }
}
```

### Schema Zod

```ts
const crearPersonaSchema = z.object({
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres').max(10, 'El DNI debe tener como máximo 10 caracteres'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  fechaNacimiento: z.coerce.date({ invalid_type_error: 'Fecha de nacimiento inválida' }),
  direccion: z.string().min(1, 'La dirección es requerida'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  grupoSanguineoId: z.number().int().positive('El grupo sanguíneo es requerido'),
})
```

### Estructura del Código

```
src/modules/persona/
├── persona.routes.ts        ← agrega POST / con authMiddleware
├── persona.controller.ts    ← handler create()
├── persona.service.ts       ← crear(): validar DNI único, validar grupoSanguineoId, crear
└── persona.repository.ts    ← create(), findByDni(), findGrupoSanguineoById()
```

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| DNI duplicado | `{ "error": "El DNI ya existe en el sistema" }` | 409 Conflict |
| grupoSanguineoId no existe | `{ "error": "El grupo sanguíneo indicado no existe" }` | 404 Not Found |
| DNI con formato inválido | Error Zod | 400 Bad Request |
| fechaNacimiento futura | Error Zod (si se agrega validación) o se acepta | 400 / 201 |
| Campos vacíos | Error Zod por campo | 400 Bad Request |
| Sin autenticación | `{ "error": "No autenticado" }` | 401 Unauthorized |

## Plan de Implementación

1. Agregar `crearPersonaSchema` al schema de persona
2. Agregar en repository: `create(data)`, `findByDni(dni)`, `findGrupoSanguineoById(id)`
3. Implementar en service: `crear(data, userId)` — verifica DNI único, verifica grupo sanguíneo existe, crea persona
4. Agregar handler `create()` en controller (responde 201)
5. Agregar ruta `POST /` con authMiddleware
6. Tests: integración con supertest (éxito 201, DNI duplicado 409, grupo inválido 404, campos vacíos 400)
