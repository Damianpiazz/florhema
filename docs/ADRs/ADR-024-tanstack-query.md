---
autor: Damian Piazza
fecha: 2026-05-31
titulo: Gestión de Estado del Servidor — TanStack Query (Frontend)
---

# ADR-024: Gestión de Estado del Servidor — TanStack Query (Frontend)

## Contexto

El frontend de Florhema necesita un mecanismo estándar para gestionar el estado proveniente de la API REST (donantes, pacientes, gestantes, transfusiones, grupos sanguíneos, autenticación, etc.). Hasta ahora conviven dos patrones:

- **`useState` + `useEffect`**: usado en la mayoría de los fetch de datos (auth, grupos sanguíneos) y en todas las mutaciones (crear, actualizar, eliminar)
- **`useQuery` de TanStack Query**: usado en un único hook (`usePersonasQuery`)

Esta falta de consistencia tiene consecuencias concretas: cada feature debe reinventar el manejo de `loading`, `error` y `data`; no hay caché compartida entre componentes; las mutaciones no refrescan el listado automáticamente; y el código resultante es más verboso y propenso a errores (race conditions, datos desactualizados).

Se necesita un estándar único que cubra consultas (`GET`), escrituras (`POST`, `PUT`, `DELETE`), caché del lado del cliente y sincronización entre módulos, sin depender de soluciones ad-hoc por cada feature.

---

## Decisión

Se adopta **TanStack Query v5** como librería oficial de gestión de estado del servidor en el frontend. Toda interacción con la API REST del backend debe realizarse a través de los hooks que provee TanStack Query:

| Operación | Hook TanStack Query |
|---|---|
| Consultas (`GET`) | `useQuery` |
| Escrituras (`POST`, `PUT`, `DELETE`, `PATCH`) | `useMutation` |
| Refresco manual o invalidación | `queryClient.invalidateQueries` |
| Datos precargados (opcional) | `queryClient.prefetchQuery` |

TanStack Query ya está instalado (`@tanstack/react-query ^5.100.14`) y configurado a nivel de proveedor (`QueryClientProvider` con `staleTime: 30s` y `retry: 1`). Este ADR formaliza su uso como el **único** mecanismo de fetching y escritura de datos del servidor.

No se utilizarán `useState`/`useEffect` para fetching directo, SWR, RTK Query, ni bibliotecas alternativas para este propósito.

---

## Opciones Consideradas

### Opción 1: TanStack Query v5 (seleccionada)

- Librería madura del ecosistema TypeScript/React especializada en caché servidor-cliente
- *Ventajas*:
  - Caché configurable con política stale-while-revalidate
  - Deduplicación automática de requests paralelos para una misma `queryKey`
  - Refetch automático al reenfocar la ventana o reconectar la red
  - `useMutation` con soporte de optimistic updates, rollback y estados `isPending`/`isError`/`onSuccess`
  - DevTools para inspección y debugging en desarrollo
  - Tipado fuerte: `useQuery<TData>` y `useMutation<TData, TError, TVariables>`
  - Gran adopción en el ecosistema Next.js/React
- *Desventajas*:
  - Dependencia externa (~13KB)
  - Curva de aprendizaje inicial: concepto de `queryKey`, staleTime, invalidación
  - Datos en caché pueden quedar obsoletos si no se gestiona la invalidación correctamente

### Opción 2: SWR (Vercel)

- Librería ligera del equipo de Vercel con filosofía stale-while-revalidate
- *Ventajas*: Bundle más pequeño, integración natural con Next.js, API minimalista
- *Desventajas*: Sin soporte nativo de `useMutation` (requiere implementación manual), ecosistema de plugins más reducido, sin optimistic updates integrados, menos madura para operaciones de escritura complejas

### Opción 3: useState + useEffect (patrón actual)

- Gestión manual de estado asíncrono sin librería externa
- *Ventajas*: Sin dependencias, control total sobre cada request
- *Desventajas*: No escala — cada feature replica el mismo boilerplate (loading/error/data), sin caché compartida entre componentes, sin deduplicación, sin refetch automático, riesgo de race conditions en efectos concurrentes, código más verboso y propenso a errores

### Opción 4: RTK Query

- Solución de fetching integrada con Redux Toolkit
- *Ventajas*: Caché + mutations con generación automática de hooks, integración con Redux DevTools
- *Desventajas*: Requiere agregar Redux al proyecto (no está presente), overhead arquitectónico significativo, sobreingeniería para la escala actual del proyecto

---

## Consecuencias

### Positivas

- Caché consistente: los datos se mantienen sincronizados entre componentes sin pasar props ni compartir estado global
- Invalidación declarativa: al mutar un recurso, se invalidan las queries relacionadas con `queryClient.invalidateQueries` y los listados se refrescan automáticamente
- Deduplicación de requests: si dos componentes montan la misma query, TanStack Query hace una sola llamada HTTP
- Refetch automático: al reenfocar la pestaña o reconectar la red, los datos se refrescan sin intervención manual
- Mutaciones con estados tipados: `isPending`, `isError`, `onSuccess` sin necesidad de `useState` adicional
- DevTools: permiten inspeccionar caché, invalidar queries manualmente y debuggear durante desarrollo

### Negativas

- Nueva abstracción que el equipo debe aprender y aplicar consistentemente
- Los datos cacheados pueden quedar desactualizados si se omite la invalidación en alguna mutación
- Dependencia externa que requiere mantenimiento de versiones
- Pruebas unitarias de hooks con TanStack Query requieren `QueryClientProvider` en el wrapper de testing

---

## Impacto en el Sistema

### Backend

- Sin impacto directo. El backend recibe las mismas peticiones HTTP; TanStack Query es exclusivo del frontend.

### Frontend

- Toda interacción con la API se canaliza a través de `useQuery`/`useMutation`
- Los servicios (`*-service.ts`) y DTOs existentes se mantienen sin cambios (son llamados desde `queryFn` y `mutationFn`)
- Cada feature define su propia fábrica de claves (`queryKeyFactory`) para las queries que utiliza
- Las mutaciones invalidan queries relacionadas en el callback `onSuccess`
- TanStack Query DevTools se activan solo en entorno de desarrollo
- Los tests de hooks que usen TanStack Query deben envolver el hook renderizado con `QueryClientProvider`

### Infraestructura / Compartido

- Sin impacto directo
- La configuración de TanStack Query (`staleTime`, `retry`) se centraliza en el `QueryClient` y puede ajustarse globalmente sin modificar cada feature

---

## Reglas Derivadas

- Todo fetch de datos (`GET`) se implementa con `useQuery`, nunca con `useState` + `useEffect`
- Toda escritura (`POST`/`PUT`/`DELETE`/`PATCH`) se implementa con `useMutation`, nunca llamando al servicio directamente desde un evento o efecto
- Cada feature define y exporta su fábrica de `queryKey` con el formato `['recurso']` o `['recurso', id]`
- Las mutaciones invalidan queries relacionadas en `onSuccess` usando `queryClient.invalidateQueries` con las queryKeys correspondientes
- No se utiliza SWR, RTK Query, ni fetching manual con `fetch`/Axios directo como sustituto de TanStack Query
- La configuración global de TanStack Query (`staleTime`, `retry`, `refetchOnWindowFocus`) se define en `query-provider.tsx` y no se sobrescribe por feature salvo excepción justificada
- TanStack Query DevTools se incluyen solo en el bundle de desarrollo
- Los tests que utilicen hooks de TanStack Query deben proveer un `QueryClientProvider` con un `QueryClient` de test
