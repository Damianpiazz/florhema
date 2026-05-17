---
autor: DAMIAN Piazza
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

Se evaluaron tres enfoques: solo `deletedAt`, campos de auditoría en cada entidad + tabla de auditoría, y solo tabla de auditoría.

---

## Decisión

Se implementa un modelo híbrido con tres mecanismos complementarios:

### 1. Soft Delete (`deletedAt`)

Toda entidad de negocio incluye un campo `deletedAt DateTime?`. Una consulta estándar siempre filtra `deletedAt: null` (excepto en búsquedas administrativas o de auditoría).

### 2. Campos de Referencia Rápida (`createdById`, `updatedById`, `deletedById`)

Cada entidad incluye tres FK opcionales hacia `User` para responder instantáneamente (sin JOIN a tabla de auditoría) a las preguntas:

- `createdById` → ¿Quién creó este registro?
- `updatedById` → ¿Quién lo modificó por última vez?
- `deletedById` → ¿Quién lo eliminó?

### 3. Tabla de Auditoría (`AuditLog`)

Registro inmutable y append-only de cada operación significativa sobre cualquier entidad:

- `action`: `"CREATE"`, `"UPDATE"`, `"DELETE"`
- `entity`: nombre del modelo (ej. `"Persona"`, `"Donacion"`)
- `entityId`: PK del registro afectado
- `oldValues` / `newValues`: snapshot del estado anterior y posterior (JSON)
- `userId`: responsable de la operación

---

## Opciones Consideradas

### Opción 1: Solo `deletedAt` (descartada)

Solo marcador de eliminación, sin registro de responsable ni historial de cambios.

**Ventajas:** mínimo impacto en el esquema.
**Desventajas:** no cumple RF0012 (trazabilidad), no permite auditar quién eliminó ni qué cambió.

### Opción 2: Solo tabla `AuditLog` (descartada)

Toda la trazabilidad vive exclusivamente en la tabla de auditoría, sin campos en las entidades.

**Ventajas:** esquema de negocio limpio, sin campos de auditoría repetidos.
**Desventajas:** responde "quién creó/modificó/eliminó" requiere siempre un JOIN extra a `AuditLog`, incluso para consultas simples; mayor carga cognitiva.

### Opción 3: Híbrido — campos rápidos + `AuditLog` — seleccionada

**Ventajas:**

- Consultas rápidas de "quién" sin JOIN extra (O(1) por FK)
- Historial completo y detallado en `AuditLog`
- `AuditLog` es append-only: no compite con writes del negocio, fácil de particionar y archivar
- Los campos en las entidades actúan como caché del último estado conocido

**Desventajas:**

- Duplicación de información entre campos y `AuditLog`
- Mayor número de FK en cada tabla

---

## Consecuencias

### Positivas

- Trazabilidad completa (RF0012) con consultas rápidas
- `AuditLog` inmutable: los registros de auditoría no se modifican ni eliminan
- Particionable por fecha para archivo histórico
- Soft delete preserva la integridad de los datos clínicos
- Cumplimiento de normativa hospitalaria de conservación de datos

### Negativas

- Cada entidad tiene 3 FK adicionales hacia `User` (incremento de tamaño de tabla)
- Toda operación de escritura requiere lógica adicional (actualizar campos + insertar en `AuditLog`)
- Las tablas de uso intensivo tienen más índices que mantener

---

## Impacto en el Sistema

### Backend

- Prisma Client extension (middleware) centraliza la escritura en `AuditLog` y el seteo de `updatedAt`/`updatedById`
- Todos los repositorios filtran `deletedAt: null` por defecto en consultas de lectura
- Los servicios reciben el `userId` del contexto de autenticación y lo propagan a los repositorios

### Frontend

- Sin impacto directo. El frontend no necesita cambios para soportar auditoría ni soft delete.

### Infraestructura / Compartido

- La tabla `AuditLog` puede crecer significativamente; se recomienda partición por mes/año y archivado periódico

---

## Reglas Derivadas

- Toda entidad de negocio debe tener `deletedAt DateTime?`, `createdById Int?`, `updatedById Int?`, `deletedById Int?`
- Las entidades `Session` y `AuditLog` son excepciones: `Session` usa `revokedAt`, `AuditLog` es inmutable
- Todas las consultas de listado y búsqueda deben incluir `where: { deletedAt: null }` excepto las explícitamente administrativas
- El `AuditLog` se escribe mediante Prisma Client extension (middleware global) para garantizar que no se omita ningún cambio
- El campo `action` en `AuditLog` usa los valores `"CREATE"`, `"UPDATE"`, `"DELETE"`
- Los `oldValues` en `AuditLog` son `null` para acciones `CREATE`; `newValues` son `null` para acciones `DELETE`
- `AuditLog` no tiene soft delete ni campos de auditoría propia
