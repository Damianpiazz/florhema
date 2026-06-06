---
autor: Damián Piazza
fecha: 2026-05-17
titulo: Soft Delete y Trazabilidad de Cambios (Auditoría)
---

# ADR-016: Soft Delete y Trazabilidad de Cambios (Auditoría)

## Contexto

Florhema requiere:

- **Trazabilidad completa** (RF0012): cada operación de creación, modificación o eliminación de datos debe quedar registrada con el usuario responsable, permitiendo rastrear errores de carga humanos.
- **Borrado lógico**: los datos clínicos no pueden eliminarse físicamente por normativa hospitalaria y legal. En su lugar, deben marcarse como eliminados para preservar la integridad del historial.
- **Auditoría de eliminaciones**: quién eliminó un registro y cuándo.

Los requisitos específicos son:

- Toda entidad del dominio debe poder "eliminarse" sin perder el registro histórico
- Todo cambio debe poder asociarse al usuario que lo realizó
- Debe existir un historial de cambios (valores anteriores y nuevos) para auditoría
- El sistema debe conocer siempre al usuario autenticado que realiza cada operación

Se evaluaron tres enfoques: solo `deletedAt`, campos de auditoría en cada entidad + tabla de auditoría, y solo tabla de auditoría. Inicialmente se implementó el modelo híbrido (Opción 3), pero tras experiencia práctica se migró al modelo de solo `AuditLog` (Opción 2) para reducir redundancia y complejidad del esquema.

---

## Decisión

Se implementa un modelo basado en dos mecanismos:

### 1. Soft Delete (`deletedAt`)

Toda entidad de negocio incluye un campo `deletedAt DateTime?`. Una consulta estándar siempre filtra `deletedAt: null` (excepto en búsquedas administrativas o de auditoría). No existen campos `deletedById`; el responsable de la eliminación se consulta en `AuditLog`.

### 2. Tabla de Auditoría (`AuditLog`) con registro automático

Registro inmutable y append-only de cada operación significativa sobre cualquier entidad:

- `action`: `"CREATE"`, `"UPDATE"`, `"DELETE"`, `"UPSERT"`
- `entity`: nombre del modelo (ej. `"Persona"`, `"Donacion"`)
- `entityId`: PK del registro afectado
- `oldValues` / `newValues`: snapshot del estado anterior y posterior (JSON)
- `userId`: responsable de la operación

El registro en `AuditLog` se realiza automáticamente mediante:

1. **AsyncLocalStorage** (`audit-context.ts`): almacena el `userId` del request autenticado en el contexto de ejecución asíncrono, sin necesidad de propagarlo manualmente por la cadena de llamadas.
2. **Prisma Client extension** (`prisma-extension.ts`): middleware global con `$extends` que intercepta las operaciones `create`, `update`, `delete` y `upsert` de todos los modelos, obtiene el `userId` del `AsyncLocalStorage`, y escribe el registro en `AuditLog` automáticamente.
3. **Auth middleware** (`auth.middleware.ts`): tras autenticar al usuario, envuelve el resto del request en `runWithAuditContext(userId, next)` para que la extensión de Prisma capture el usuario automáticamente.

Esto elimina la necesidad de recibir `userId` como parámetro en repositorios, servicios o controladores.

---

## Opciones Consideradas

### Opción 1: Solo `deletedAt` (descartada)

Solo marcador de eliminación, sin registro de responsable ni historial de cambios.

**Ventajas:** mínimo impacto en el esquema.
**Desventajas:** no cumple RF0012 (trazabilidad), no permite auditar quién eliminó ni qué cambió.

### Opción 2: Solo tabla `AuditLog` — seleccionada (actual)

Toda la trazabilidad vive exclusivamente en la tabla de auditoría, sin campos en las entidades.

**Ventajas:**
- Esquema de negocio limpio: ninguna entidad tiene campos de auditoría repetidos
- Una sola fuente de verdad para trazabilidad
- Menos FK en cada tabla (menos índices, menos espacio, menos carga en writes)
- La Prisma extension centraliza la escritura sin lógica dispersa en repositorios
- AsyncLocalStorage elimina la propagación manual de `userId`

**Desventajas:**
- Consultar "quién creó/modificó/eliminó" requiere un JOIN o consulta a `AuditLog`
- En la práctica esto no es un problema porque dichas consultas son excepcionales (auditoría), no parte del flujo normal

### Opción 3: Híbrido — campos rápidos + `AuditLog` — implementada inicialmente, luego reemplazada

Cada entidad incluía `createdById`, `updatedById`, `deletedById` como FK a `User`, más la tabla `AuditLog`.

**Ventajas:**
- Consultas rápidas de "quién" sin JOIN extra

**Desventajas detectadas en la práctica:**
- 3 FK adicionales por entidad × 13 entidades = 39 columnas redundantes
- Toda operación de escritura requería lógica duplicada (actualizar campos + AuditLog)
- Los repositorios recibían `userId` como parámetro, ensuciando las firmas
- Alto costo de mantenimiento: cualquier nueva entidad requería repetir el patrón
- La información en los campos siempre era un subconjunto de lo que ya estaba en `AuditLog`

---

## Consecuencias

### Positivas

- Trazabilidad completa (RF0012) sin duplicación de datos
- `AuditLog` inmutable: los registros de auditoría no se modifican ni eliminan
- Soft delete preserva la integridad de los datos clínicos
- El código de negocio no tiene lógica de auditoría: la Prisma extension la inyecta transparentemente
- Los repositorios y servicios no reciben `userId`, simplificando firmas y tests
- Agregar una nueva entidad no requiere repetir el patrón de auditoría: la extension lo captura automáticamente
- Cumplimiento de normativa hospitalaria de conservación de datos

### Negativas

- Consultar el responsable de un registro requiere una query a `AuditLog` en lugar de leer un campo directo
- La Prisma extension agrega una query extra por cada operación de escritura (select previo para `oldValues` + insert en `AuditLog`)

---

## Impacto en el Sistema

### Backend

- `auth.middleware.ts`: envuelve el request en `runWithAuditContext(userId, next)` tras autenticar
- `audit-context.ts`: AsyncLocalStorage que expone `getCurrentUserId()` y `runWithAuditContext()`
- `prisma-extension.ts`: `prisma.$extends` con query middleware para `$allOperations` que captura `create`, `update`, `delete`, `upsert` y escribe en `AuditLog`
- `prisma.ts`: exporta el cliente extendido (`createAuditExtension(basePrisma)`)
- Todos los repositorios: eliminados los parámetros `createdById`, `updatedById`, `deletedById`
- Todos los servicios y controladores: eliminados los parámetros `userId`
- Schema Prisma: eliminadas todas las FK de auditoría y sus back-relations del modelo `User`

### Frontend

- Sin impacto directo. El frontend no necesita cambios para soportar auditoría ni soft delete.

### Infraestructura / Compartido

- La tabla `AuditLog` puede crecer significativamente; se recomienda partición por mes/año y archivado periódico
- La Prisma extension agrega una query `SELECT` previa en operaciones `UPDATE`/`DELETE` para capturar `oldValues`, lo que duplica el tiempo de la operación de escritura (no relevante para el volumen actual)

---

## Reglas Derivadas

- Toda entidad de negocio debe tener `deletedAt DateTime?` para soft delete
- Ninguna entidad de negocio tiene campos `createdById`, `updatedById` o `deletedById`
- Las entidades `Session` y `AuditLog` son excepciones: `Session` usa `revokedAt`, `AuditLog` es inmutable
- Todas las consultas de listado y búsqueda deben incluir `where: { deletedAt: null }` excepto las explícitamente administrativas
- El `AuditLog` se escribe mediante Prisma Client extension (`$extends`) automáticamente
- El `userId` se obtiene del `AsyncLocalStorage` establecido por `auth.middleware.ts`
- El campo `action` en `AuditLog` usa los valores `"CREATE"`, `"UPDATE"`, `"DELETE"`, `"UPSERT"`
- Los `oldValues` en `AuditLog` son `null` para acciones `CREATE`; `newValues` son `null` para acciones `DELETE`
- `AuditLog` no tiene soft delete ni campos de auditoría propia
