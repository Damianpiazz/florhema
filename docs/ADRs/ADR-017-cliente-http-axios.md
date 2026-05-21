---
autor: DAMIAN Piazza
fecha: 2026-05-21
titulo: Cliente HTTP — Axios (Frontend)
---

# ADR-017: Cliente HTTP — Axios (Frontend)

## Contexto

Florhema requiere comunicación HTTP entre el frontend (Next.js) y el backend (Express.js) para todas las operaciones CRUD y de autenticación. Los criterios clave son:

- Soporte nativo de cookies (autenticación por cookie httpOnly, ver ADR-008)
- Interceptores para manejo centralizado de errores y tokens
- Tipado completo de respuestas
- Facilidad de configuración (baseURL, headers por defecto)
- Buenos DX: sintaxis limpia, autocompletado, manejo de errores

Se evaluaron tres alternativas: Axios, `fetch` nativo y `ky`.

---

## Decisión

Se utilizará **Axios** como cliente HTTP oficial del frontend. Axios se encargará de:

- Toda la comunicación con la API REST del backend
- Configuración centralizada mediante una instancia compartida (`api`) en `@/lib/axios`
- Configuración base: `baseURL: '/api/v1'` con `withCredentials: true` para envío de cookies
- (Futuro) Interceptores para manejo global de errores HTTP y refresco de sesión

No se utilizarán `fetch` nativo ni `ky`.

---

## Opciones Consideradas

### Opción 1: Axios (seleccionada)

- Cliente HTTP basado en promesas, con más de 10 años de madurez
- *Ventajas*: Configuración de instancia con defaults (`baseURL`, `headers`, `withCredentials`), interceptores para manejo global de errores y tokens, tipado genérico de respuestas (`axios.get<T>`), transformación automática de JSON, cancelación de peticiones (AbortController), amplia documentación y comunidad
- *Desventajas*: Bundle más pesado que `fetch` nativo (~14KB gzipped), requiere instalación como dependencia externa, API verbosa comparada con `ky`

### Opción 2: `fetch` nativo

- API nativa del navegador para peticiones HTTP
- *Ventajas*: Sin dependencias externas (nativo en el runtime del navegador), bundle cero, API moderna con promesas, soporte nativo de `AbortController`, compatible con Next.js Server Components
- *Desventajas*: No lanza error en respuestas HTTP no exitosas (hay que verificar `response.ok` manualmente), sin interceptores nativos (requiere wrapper manual), sin configuración centralizada de instancia, manejo de cookies menos granular, más verboso en escenarios complejos

### Opción 3: `ky`

- Cliente HTTP moderno y liviano basado en `fetch`, del ecosistema Sindre Sorhus
- *Ventajas*: Sintaxis más limpia que Axios, manejo de errores mejorado sobre `fetch`, liviano, soporta hooks y retry
- *Desventajas*: Ecosistema más pequeño que Axios, menos recursos en español, menos adopción en proyectos empresariales, cambios de API en versiones tempranas

---

## Consecuencias

### Positivas
- Instancia centralizada facilitando cambios de configuración global (baseURL, headers, timeouts)
- Interceptores permiten manejo global de errores 401 (redirección a login) y refresco de sesión
- Tipado completo en llamadas HTTP: el compilador verifica la estructura de las respuestas
- Amplio conocimiento del equipo (Axios es el estándar de facto en React/Next.js)
- `withCredentials: true` funciona correctamente con cookies httpOnly de la sesión

### Negativas
- Dependencia externa de ~14KB que podría evitarse con `fetch` nativo
- En Next.js Server Components no se puede usar Axios directamente (requiere `fetch`)
- La instancia compartida introduce un acoplamiento leve: todos los servicios dependen de la misma instancia

---

## Impacto en el Sistema

### Backend
- Sin impacto directo. El backend recibe peticiones HTTP estándar, sin importar el cliente del frontend.

### Frontend
- Se crea una instancia Axios en `frontend/lib/axios.ts` con configuración base
- Toda llamada a la API se realiza mediante `import { api } from '@/lib/axios'`
- Los interceptores se definen en el mismo archivo o en `frontend/lib/axios.ts`
- Los módulos de dominio (`features/`) usan `api` para sus servicios HTTP

### Infraestructura / Compartido
- Las rutas de la API se centralizan en la instancia Axios, facilitando cambios de versión o migraciones

---

## Reglas Derivadas

- No se importa `axios` directamente en ningún lugar del frontend; siempre se usa la instancia `api` de `@/lib/axios`
- Toda configuración específica del cliente HTTP (baseURL, headers, interceptores) vive en `frontend/lib/axios.ts`
- Los interceptores de error se usan para manejo global de errores HTTP (401 → redirección a login)
- Para peticiones que requieran configuración especial (timeout distinto, headers específicos), se pasa la configuración por parámetro en la llamada, sin crear nuevas instancias
