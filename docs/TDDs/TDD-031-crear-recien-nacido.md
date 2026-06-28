---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Crear Recién Nacido vinculado a Gestante
---

# TDD-031: Crear Recién Nacido

## Contexto de Negocio (PRD)

### Objetivo
Registrar un recién nacido asociado a una gestante, con sus datos de persona y resultado de Coombs directa. El recién nacido se modela como una `Persona` que además tiene el rol `RecienNacido`.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Registrar los datos del recién nacido y los resultados de la prueba de Coombs directa realizada al cordón umbilical.

### Criterios de Aceptación
*   Solo usuarios autenticados pueden crear un recién nacido
*   La gestante debe existir y no estar soft-deleted
*   Se crea una `Persona` base para el recién nacido junto con el registro `RecienNacido`
*   El `ResultadoCoombs` directo se crea en la misma transacción
*   El DNI del recién nacido debe ser único en el sistema

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `POST /api/v1/gestantes/:gestanteId/recien-nacidos`
*   **Auth**: Requiere sesión activa
*   **Request Body**:
```json
{
  "dni": "12345678",
  "nombre": "Juan",
  "apellido": "Pérez",
  "fechaNacimiento": "2026-06-01",
  "direccion": "Av. Siempre Viva 123",
  "telefono": "1112345678",
  "grupoSanguineoId": 1,
  "pruebaCoombsDirecta": {
    "tipo": "DIRECTO",
    "positivo": false
  }
}
```
*   **Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "personaId": 2,
      "gestanteId": 1,
      "persona": {
        "id": 2,
        "dni": "12345678",
        "nombre": "Juan",
        "apellido": "Pérez",
        "fechaNacimiento": "2026-06-01T00:00:00.000Z"
      },
      "pruebaCoombsDirecta": { "id": 2, "tipo": "DIRECTO", "positivo": false }
    }
  }
}
```

### Backend

#### Schema (Zod)

```typescript
const crearRecienNacidoSchema = z.object({
  dni: z.string().min(7).max(10),
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  fechaNacimiento: z.coerce.date(),
  direccion: z.string().min(1),
  telefono: z.string().min(1),
  grupoSanguineoId: z.number().int().positive(),
  pruebaCoombsDirecta: z.object({
    tipo: z.nativeEnum(TipoCoombs),
    positivo: z.boolean(),
  }),
})
```

#### Service: `crear(gestanteId, input)`

1. Validar que gestante existe y no está soft-deleted → `AppError(404, 'Gestante no encontrada')`
2. Validar DNI único → `AppError(409, 'El DNI ya existe en el sistema')`
3. Validar grupo sanguíneo existe → `AppError(404, 'El grupo sanguíneo indicado no existe')`
4. Crear en transacción:
   - `prisma.persona.create` con datos básicos + grupoSanguineoId
   - `prisma.resultadoCoombs.create` con tipo DIRECTO y positivo
   - `prisma.recienNacido.create` vinculando personaId, gestanteId y coombsId
5. Retornar con `toRecienNacidoResponse()`

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Gestante no existe | `{ error: "Gestante no encontrada" }` | 404 |
| DNI duplicado | `{ error: "El DNI ya existe en el sistema" }` | 409 |
| Grupo sanguíneo no existe | `{ error: "El grupo sanguíneo indicado no existe" }` | 404 |
| Sin autenticación | `{ error: "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Schema, DTO, repository (create, findGestanteById, findPersonaByDni, findGrupoById)
2. Service con transacción (crear persona + coombs + recienNacido)
3. Controller y routes
4. Tests

### Frontend
5. Sección "Nuevo recién nacido" en la pestaña de gestante del detalle de persona
6. Formulario con datos de persona + sección de Coombs directa
