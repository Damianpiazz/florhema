---
autor: Damián Piazza
fecha: 2026-06-08
titulo: Detalle de Donante con historial de donaciones
---

# TDD-022: Detalle de Donante

## Contexto de Negocio (PRD)

### Objetivo
Mostrar la información completa de un donante: datos de la persona asociada, semáforo de aptitud, y el historial de todas sus donaciones con resultados de serología. Es la vista principal para que el técnico evalúe la situación del donante.

### User Persona
- **Nombre**: Técnico / Licenciado en Hemoterapia
- **Necesidad**: Consultar el historial completo de un donante, ver su semáforo de aptitud y acceder rápidamente a sus donaciones para evaluar su elegibilidad.

### Criterios de Aceptación
- Cualquier usuario autenticado puede ver el detalle
- Incluye datos completos de la persona (nombre, apellido, DNI)
- Muestra el semáforo de aptitud actual
- Incluye donaciones activas paginadas con resultados de serología
- Incluye botón para recalcular semáforo (TDD-020)
- 404 si el donante no existe o está soft-deleted

## Diseño Técnico (RFC)

### Contrato de API

#### `GET /api/v1/donantes/:id`
**Auth**: Requiere sesión activa (cualquier rol)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "personaId": 1,
      "persona": {
        "id": 1,
        "dni": "12345678",
        "nombre": "Juan",
        "apellido": "Pérez",
        "fechaNacimiento": "1990-05-15T00:00:00.000Z",
        "direccion": "Av. Siempre Viva 123",
        "telefono": "1112345678",
        "grupoSanguineo": { "id": 1, "tipo": "O", "factorRh": "POSITIVO" }
      },
      "semaforoAptitud": "VERDE",
      "createdAt": "2026-06-01T10:00:00.000Z",
      "donaciones": [
        {
          "id": 1,
          "fecha": "2026-06-06T10:00:00.000Z",
          "peso": 75.5,
          "tensionArterial": "120/80",
          "hemoglobina": 14.5,
          "tipoDonacion": "VOLUNTARIA",
          "reaccionAdversa": null,
          "resultadoSerologia": {
            "id": 1, "hiv": false, "hcv": false, "hbv": false, "chagas": false, "sifilis": false
          }
        }
      ],
      "totalDonaciones": 1
    }
  }
}
```

### Backend

#### Service: `obtenerDetalle(id: number)`
1. `findById(id)` — si no existe o está soft-deleted → `AppError(404, 'Donante no encontrado')`
2. Obtener donaciones activas desde `donacion.repository.findByDonanteId(id)` con `include: { resultadoSerologia: true }`
3. Construir response con donante + persona + donaciones

#### DTO
```typescript
function toDonanteDetalleResponse(donante: Donante, donaciones: Donacion[]) {
  return {
    id: donante.id,
    personaId: donante.personaId,
    persona: toPersonaResponse(donante.persona),
    semaforoAptitud: donante.semaforoAptitud,
    createdAt: donante.createdAt,
    donaciones: donaciones.map(toDonacionResponse),
    totalDonaciones: donaciones.length,
  }
}
```

### Frontend

#### Ruta: `/donantes/:id` — Protegida

#### Estructura del Código
```
frontend/features/donantes/
├── donantes-service.ts         ← obtenerDetalle(id)
├── hooks/
│   └── useDonanteDetalle.ts   ← TanStack Query para obtener detalle
└── components/
    ├── donante-info-card.tsx   ← datos persona + semáforo badge
    ├── donante-semaforo.tsx    ← badge VERDE/ROJO + botón recalcular
    └── donante-donaciones.tsx  ← tabla de donaciones del donante
app/(protected)/
└── donantes/
    └── [id]/
        └── page.tsx            ← Página de detalle protegida
```

#### Contrato de UI
- Card con datos de la persona (nombre, DNI, grupo sanguíneo)
- Badge del semáforo: VERDE (bg-green-100 text-green-800) o ROJO (bg-red-100 text-red-800)
- Botón "Recalcular semáforo" que dispara POST y actualiza el badge
- Tabla de donaciones del donante con fecha, peso, TA, Hb, tipo, serología
- Paginación de donaciones si aplica
- Botón "Volver" a lista de donantes

## Casos de Borde y Errores

| Escenario | Resultado | HTTP |
|-----------|-----------|------|
| Detalle exitoso | `{ "success": true, "data": { "item": {...} } }` | 200 |
| Donante no encontrado | `{ "error": "Donante no encontrado" }` | 404 |
| Donante soft-deleted | `{ "error": "Donante no encontrado" }` | 404 |
| Donante sin donaciones | `donaciones: [], totalDonaciones: 0` | 200 |
| Sin autenticación | `{ "error": "No autenticado" }` | 401 |

## Plan de Implementación

### Backend
1. Agregar `findByDonanteId()` en `donacion.repository.ts` (o reutilizar existente)
2. Implementar `obtenerDetalle()` en `donante.service.ts`
3. Agregar schema `donanteDetalleResponseSchema` en `donante.schema.ts`
4. Agregar handler `getById()` (o extender existente) en `donante.controller.ts`
5. Tests: detalle completo, donante sin donaciones, 404

### Frontend
6. Agregar `obtenerDetalle(id)` en `donantes-service.ts`
7. Crear `useDonanteDetalle.ts` con TanStack Query
8. Crear `donante-info-card.tsx` con datos y badge
9. Crear `donante-semaforo.tsx` con botón recalcular
10. Crear `donante-donaciones.tsx` con tabla
11. Crear página `app/(protected)/donantes/[id]/page.tsx`
12. Agregar link desde tabla de donantes al detalle
