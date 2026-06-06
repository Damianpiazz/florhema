---
autor: Damián Piazza
fecha: 2026-06-04
titulo: Endpoints separados para detalle de persona y su actividad
---

# ADR-013: Endpoints separados para detalle de persona y su actividad

## Contexto

Necesitamos exponer el detalle de una persona incluyendo información básica (datos personales, grupo sanguíneo, roles asociados) y su historial completo de actividad (donaciones, transfusiones, estudios gestacionales, recién nacidos). Surge la pregunta de si agrupar todo en un solo endpoint o separar cada tipo de actividad en endpoints independientes.

- El historial de una persona puede acumular cientos de registros entre donaciones, transfusiones y estudios
- El frontend necesita mostrar la información básica de forma inmediata y cargar la actividad bajo demanda
- Cada tipo de actividad puede crecer de forma independiente y requerir paginación, filtros y ordenamientos distintos

---

## Decisión

Se exponen **endpoints separados** para cada recurso relacionado a una persona, en lugar de un único endpoint de detalle:

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/v1/personas/:id` | Info básica + grupo sanguíneo + roles (donante/paciente/gestante) |
| `GET /api/v1/personas/:id/donaciones` | Donaciones paginadas con resultado de serología |
| `GET /api/v1/personas/:id/transfusiones` | Transfusiones paginadas con compatibilidad y Coombs |
| `GET /api/v1/personas/:id/estudios-gestante` | Estudios gestacionales paginados con Coombs indirecto |
| `GET /api/v1/personas/:id/recien-nacidos` | Recién nacidos paginados con Coombs directo |

---

## Opciones Consideradas

### Opción 1: Endpoint único `GET /personas/:id/detalle`
Un solo endpoint que devuelve la persona completa junto con toda su actividad en una sola respuesta.

**Ventajas:**
- Una sola llamada para obtener todo
- Menos endpoints que documentar y mantener

**Desventajas:**
- Payload grande y creciente: una persona con muchas donaciones puede devolver MB de JSON
- Sin paginación nativa: no hay forma de cargar solo los primeros registros
- Caché monolítica: no se puede cachear la persona independientemente de su actividad
- Acoplamiento: cambios en el esquema de donaciones afectan el contrato del endpoint de persona
- No escala: agregar filtros a donaciones (`?fecha_desde=...`) requiere modificar el endpoint de persona

### Opción 2: Endpoints separados (seleccionada)
Cada tipo de actividad tiene su propio endpoint con paginación independiente.

**Ventajas:**
- Sigue principios REST: cada recurso tiene su propia URI
- Paginación nativa por tipo de actividad sin acoplar la query de persona
- Caché HTTP granular: la persona se cachea distinto que donaciones o transfusiones
- Frontend carga bajo demanda: la info de persona se renderiza al instante, la actividad se carga mientras el usuario scrollea
- Escalabilidad: agregar filtros a donaciones no afecta a los demás endpoints
- Testing más aislado: cada endpoint se prueba independientemente

**Desventajas:**
- Mayor cantidad de requests si el frontend necesita toda la actividad de entrada (mitigable con carga lazy o SSR)
- Más endpoints para documentar en OpenAPI

---

## Consecuencias

### Positivas
- La consulta básica de persona es liviana (~500 bytes)
- Cada endpoint de actividad puede paginarse con `limit` y `offset` de forma independiente
- El frontend puede mostrar la información de persona al instante y diferir la carga de cada sección según navegación del usuario
- Los tests de cada endpoint son independientes y rápidos

### Negativas
- Se requieren 5 endpoints en lugar de 1, lo que aumenta ligeramente el boilerplate de rutas, handlers y tests
- Si el frontend necesita mostrar todo el historial en una misma vista, hará múltiples llamadas en paralelo

---

## Impacto en el Sistema

### Backend
- Se crean 4 nuevos endpoints de actividad en `persona.routes.ts`:
  - `GET /:id/donaciones`
  - `GET /:id/transfusiones`
  - `GET /:id/estudios-gestante`
  - `GET /:id/recien-nacidos`
- Se expande `GET /:id` existente para incluir roles (donante/paciente/gestante) en la respuesta
- Cada nuevo endpoint tiene su propio metodo en `persona.repository.ts`, `persona.service.ts` y `persona.controller.ts`
- No se modifica el modelo de datos ni el schema de Prisma

### Frontend
- Se consumen 5 endpoints en lugar de 1
- Se recomienda carga lazy por sección usando TanStack Query con consultas independientes
- La página de detalle puede mostrar skeletons por sección mientras cargan los datos

### Infraestructura / Compartido
- Sin impacto en infraestructura
- OpenAPI se actualiza con los 4 nuevos endpoints

---

## Reglas Derivadas
- `GET /api/v1/personas/:id` ahora incluye `donante`, `paciente` y `gestante` (objetos o `null`)
- Todos los endpoints de actividad usan `?limit` y `?offset` con los mismos defaults (20/0)
- Los endpoints de actividad filtran registros soft-deleted (`deletedAt: null`)
- El orden por defecto en todos los endpoints de actividad es por `fecha` descendente
