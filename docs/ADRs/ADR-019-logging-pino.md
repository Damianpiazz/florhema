---
autor: DAMIAN Piazza
fecha: 2026-05-21
titulo: Logging Estructurado — Pino (Backend)
---

# ADR-019: Logging Estructurado — Pino (Backend)

## Contexto

Florhema necesita un sistema de logging estructurado en el backend para:

- Registrar peticiones HTTP entrantes (método, ruta, status code, duración)
- Registrar errores con contexto suficiente para depuración (stack trace, request ID, usuario)
- Soportar diferentes niveles de log según el entorno (desarrollo, producción)
- Producir logs en formato JSON para facilitar su ingestión por herramientas de monitoreo
- Tener rendimiento adecuado para un sistema transaccional hospitalario

Se evaluaron tres alternativas: Pino, Winston y `console.log`.

---

## Decisión

Se utilizará **Pino** como librería de logging estructurado del backend. Pino se encargará de:

- Logging de la aplicación: info, warn, error, debug con metadatos estructurados
- Logging HTTP automático mediante `pino-http` (método, URL, status code, tiempo de respuesta)
- Formato legible en desarrollo con `pino-pretty`
- Salida JSON en producción para integración con sistemas de monitoreo

No se utilizarán Winston ni `console.log` para logging estructurado.

---

## Opciones Consideradas

### Opción 1: Pino (seleccionada)

- Logger estructurado de alto rendimiento para Node.js, considerado el más rápido del ecosistema
- *Ventajas*: Rendimiento líder (hasta 5x más rápido que Winston), formato JSON nativo, niveles de log estándar (trace, debug, info, warn, error, fatal), `pino-http` para logging HTTP automático, `pino-pretty` para desarrollo, API mínima y predecible, transporte estándar para enviar a servicios externos, bajísimo overhead por llamada de log
- *Desventajas*: La serialización JSON añade overhead mínimo, `pino-pretty` no debe usarse en producción, la API básica es menos verbosa que Winston (carece de "transportes" integrados en el núcleo), la documentación asume familiaridad con conceptos de logging estructurado

### Opción 2: Winston

- Logger multipropósito con múltiples transportes y formatos
- *Ventajas*: Múltiples transportes integrados (archivo, consola, HTTP, etc.), formato personalizable, niveles personalizables, amplia adopción en proyectos Node.js legacy, API verbosa con buenos defaults
- *Desventajas*: Rendimiento significativamente menor que Pino (mayor overhead por llamada), configuración más verbosa, mayor consumo de memoria, los formatos personalizados pueden afectar el rendimiento, sobreingeniería para las necesidades del proyecto

### Opción 3: `console.log`

- Salida estándar de Node.js sin librería externa
- *Ventajas*: Sin dependencias externas, simplicidad total, sin curva de aprendizaje
- *Desventajas*: Sin estructura JSON (dificulta ingestión por herramientas de monitoreo), sin niveles de log, sin formato consistente, sin metadatos automáticos, sin soporte para transporte a servicios externos, no diferenciable de logs de terceros, imposible de filtrar por nivel en producción

---

## Consecuencias

### Positivas
- Logs estructurados en JSON listos para ingestión por herramientas como Elasticsearch, Datadog, Grafana
- Diferenciación clara por nivel (info, warn, error) para filtrar ruido en producción
- `pino-http` captura automáticamente método, ruta, status code y duración de cada request
- `pino-pretty` en desarrollo mejora la legibilidad sin afectar producción
- Rendimiento compatible con sistemas transaccionales de alta frecuencia
- Metadatos enriquecibles (request ID, usuario autenticado, correlación)

### Negativas
- Dependencia externa adicional (3 paquetes: `pino`, `pino-http`, `pino-pretty`)
- `pino-pretty` es una dependencia de desarrollo, pero requiere configuración condicional por entorno
- Curva de aprendizaje inicial para el equipo si no está familiarizado con logging estructurado
- La configuración de serializadores personalizados puede volverse compleja

---

## Impacto en el Sistema

### Backend
- Se crea un módulo de logger en `backend/src/config/logger.ts` con la configuración de Pino
- `pino-http` se integra como middleware global en la aplicación Express
- El logger de aplicación se usa en servicios y controladores mediante import directo
- En desarrollo se usa `pino-pretty` para salida legible en consola
- En producción la salida es JSON puro (sin pretty), capturable por `stdout`
- El error handler envía errores al logger antes de responder al cliente

### Frontend
- Sin impacto directo. El frontend no utiliza Pino.

### Infraestructura / Compartido
- Los logs en JSON pueden ser ingeridos por cualquier sistema de monitoreo compatible con `stdout`
- No se requiere infraestructura adicional para logging (sin servidor de logs dedicado en fase inicial)

---

## Reglas Derivadas

- No se usa `console.log` ni `console.error` en el backend (excepto en bootstrapping inicial antes de configurar el logger)
- El logger se configura una vez en `backend/src/config/logger.ts` y se importa desde allí
- `pino-http` se usa como middleware global para logging de requests automático
- En desarrollo se usa `pino-pretty` con nivel `debug`; en producción se usa JSON con nivel `info`
- Los errores operacionales se loggean con `logger.error(err)` incluyendo el stack trace
- No se loggean datos sensibles (contraseñas, tokens, información personal) — se usan serializadores para redactarlos
