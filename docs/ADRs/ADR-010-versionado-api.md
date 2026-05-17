---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Versionado de API
---

# ADR-010: Versionado de API

## Contexto

La API de Florhema evolucionará con el tiempo: nuevos endpoints, cambios en contratos existentes, deprecación de funcionalidades. Se necesita un mecanismo que permita introducir cambios sin romper clientes existentes (frontend, integraciones futuras).

---

## Decisión

Todas las rutas de la API REST llevan el prefijo `/api/v1/`. Cuando se introduzcan cambios incompatibles, se incrementa la versión (`/api/v2/`) y la versión anterior se mantiene hasta su deprecación programada.

Ejemplo de rutas:
```
GET    /api/v1/personas
POST   /api/v1/personas
GET    /api/v1/donantes
POST   /api/v1/donaciones
GET    /api/v1/gestantes
```

---

## Opciones Consideradas

### Opción 1: Prefijo de versión en URL (`/api/v1/`) — seleccionada

- *Ventajas:* explícito y fácil de entender, funcionamiento simple en el backend (router con grupo `/api/v1`), el cliente sabe exactamente qué versión usa sin necesidad de headers
- *Desventajas:* URLs más largas, duplicación de rutas al mantener versiones anteriores

### Opción 2: Header `Accept-Version` o `Content-Type`

- *Ventajas:* URLs limpias sin prefijo de versión
- *Desventajas:* menos visible, más complejo de depurar en desarrollo, requiere que el cliente envíe el header correctamente

### Opción 3: Sin versionado

- *Ventajas:* simplicidad máxima
- *Desventajas:* cualquier cambio rompe clientes existentes, no apto para un sistema en evolución

---

## Consecuencias

### Positivas
- Compatibilidad hacia atrás: clientes en `v1` no se rompen cuando sale `v2`
- Fácil de implementar con un router por versión
- Visible y depurable: la versión está en la URL

### Negativas
- Mantener versiones anteriores implica código duplicado parcial hasta la deprecación
- Las URLs son más largas

---

## Reglas Derivadas

- La versión actual es `v1`
- Todas las rutas de la API cuelgan de `/api/v1/`
- Cuando se introduzcan cambios incompatibles, se crea `/api/v2/` y se mantiene `v1` con fecha de deprecación documentada
- El frontend consume siempre la última versión disponible
- No se mantienen más de dos versiones activas simultáneamente
- La versión se define a nivel de router en Express, no por módulo
