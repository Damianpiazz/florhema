---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Estrategia de Paginación Offset-based
---

# ADR-023: Estrategia de Paginación Offset-based

## Contexto

Los endpoints de listado del sistema (grupos sanguíneos, personas, y futuros) deben devolver conjuntos de resultados paginados. Existen dos estrategias principales: offset-based (páginas tradicionales) y cursor-based (páginas basadas en un identificador).

Se necesita una estrategia única y consistente para todos los listados del sistema.

---

## Decisión

Se adopta **offset-based pagination** con los siguientes parámetros y defaults consistentes en toda la API:

- `limit` (opcional, default 20, max 100): cantidad de resultados por página
- `offset` (opcional, default 0): desplazamiento desde el inicio del conjunto total

El response wrapper sigue la estructura:

```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

El frontend calcula la página actual como `page = offset / limit + 1`.

---

## Opciones Consideradas

### Opción 1: Offset-based (Seleccionada)
- **Descripción**: Paginación tradicional con `LIMIT ? OFFSET ?` en SQL.
- **Ventajas**:
  - Simple de implementar y entender
  - Permite saltar a cualquier página arbitraria (`page * limit`)
  - Fácil de implementar en Prisma (`skip`/`take`)
  - Compatible con cualquier frontend
- **Desventajas**:
  - Inconsistencias si se insertan/eliminan registros entre páginas (un item puede aparecer dos veces o saltarse)
  - Performance degrada en offsets altos (el motor igual debe escanear las filas saltadas)

### Opción 2: Cursor-based (Keyset pagination)
- **Descripción**: Paginación basada en un identificador único (ej. `cursor=150&limit=20`), devuelve los registros posteriores a ese cursor.
- **Ventajas**:
  - Consistente ante inserciones/eliminaciones (no hay saltos ni duplicados)
  - Performance constante sin importar la profundidad (aprovecha índices)
- **Desventajas**:
  - No permite saltar a páginas arbitrarias (solo "siguiente"/"anterior")
  - Más complejo de implementar, sobre todo "anterior" (requiere cursor bidireccional)
  - El frontend debe manejar lógica de cursor en lugar de número de página simple
  - Dificulta la integración con controles de paginación tradicionales

---

## Consecuencias

### Positivas
- Implementación trivial con Prisma (`skip` / `take`)
- El frontend usa componentes shadcn `<Pagination>` sin lógica adicional
- Consistentes entre todos los endpoints del sistema (misma firma, mismos defaults)
- Fácil de testear (solo verificar count + slice)

### Negativas
- Posibles duplicados/saltos si hay inserciones concurrentes entre consultas de página (aceptable para catálogos de dominio como grupos sanguíneos y personas)
- Performance degrada en conjuntos muy grandes (>100K registros) con offsets altos (no es el caso actual — catálogos pequeños)

---

## Impacto en el Sistema

### Backend
- Todos los repositories con listado paginado implementan `findAll(filters)` + `count(filters)` separados
- El service combina ambos: `const [items, total] = await Promise.all([findAll, count])`
- `limit` se ajusta a 100 si excede el máximo

### Frontend
- El hook `usePersonas` (y futuros) mantiene `page` (1-indexed) y calcula `offset = (page - 1) * limit`
- El componente `<Pagination>` de shadcn recibe `page` y `totalPages = Math.ceil(total / limit)`
- Compatible con el patrón de diseño establecido

---

## Reglas Derivadas

- Todo endpoint de listado debe aceptar `limit` y `offset` como query params con los mismos defaults
- Todo response de listado debe incluir `items`, `total`, `limit`, `offset`
- El frontend siempre usa page 1-indexed y convierte a offset 0-indexed
- Si un futuro módulo requiere manejar millones de registros, se evaluará migrar a cursor-based manteniendo compatibilidad
