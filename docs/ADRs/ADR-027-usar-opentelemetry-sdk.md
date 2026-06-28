---
autor: Damian Piazza
fecha: 2026-06-28
titulo: OpenTelemetry SDK para instrumentación de métricas y tracing
---

# ADR-027: OpenTelemetry SDK para instrumentación de métricas y tracing

## Contexto

Florhema necesita observabilidad en el backend para monitorear el estado del sistema en producción. Los requisitos específicos son:

- Obtener métricas RED (Rate, Errors, Duration) para todas las operaciones HTTP
- Contar con tracing distribuido para correlacionar errores con trazas completas de la request
- Poder correlacionar logs estructurados (Pino) con trazas y métricas
- Utilizar un estándar vendor-neutral que evite lock-in con un proveedor específico
- Soportar exportación a diferentes backends de monitoreo sin cambios en el código de aplicación

El backend ya utiliza Pino para logging estructurado (ADR-019). La instrumentación debe integrarse con el logging existente y preservar el rendimiento del sistema transaccional.

Actualmente no existe ningún tipo de instrumentación ni recolección de métricas.

---

## Decisión

Se utiliza **OpenTelemetry Node.js SDK** como estándar de instrumentación, siguiendo el flujo:

```
App (Node.js) → OpenTelemetry SDK (OTLP) → OpenTelemetry Collector → Prometheus → Grafana
```

Puntos clave de la implementación:

- Se usa `@opentelemetry/sdk-node` como entrypoint principal, con `PeriodicExportingMetricReader` y `OTLPMetricExporter`
- Se usa `getNodeAutoInstrumentations()` para instrumentación automática de HTTP, Express, y `pg` (PostgreSQL)
- Se crean métricas RED personalizadas (counter para rate, histogram para duración, up-down counter para conexiones activas) para monitoreo a nivel de negocio
- El SDK se inicializa en un archivo `backend/src/lib/telemetry.ts` que se importa como side-effect antes que cualquier otro módulo
- La exportación se realiza vía OTLP protocol (gRPC o HTTP) hacia el OpenTelemetry Collector
- Se usa `@opentelemetry/exporter-metrics-otlp-proto` y `@opentelemetry/exporter-trace-otlp-proto`
- Las trazas incluyen `trace_id` y `span_id` que se inyectan en los logs de Pino para correlación

No se utiliza Datadog, New Relic, AppSignal ni ningún backend propietario directo — toda la exportación va al Collector como intermediario.

---

## Opciones Consideradas

### Opción 1: OpenTelemetry SDK con auto-instrumentación (seleccionada)

- Estándar CNCF, vendor-neutral, soportado por todos los backends de observabilidad modernos
- *Ventajas*:
  - Vendor-neutral: cambiar de backend (Prometheus, Datadog, New Relic, Grafana Tempo) sin tocar código
  - Auto-instrumentación cubre HTTP, Express, pg sin código manual
  - Semantic Conventions estandarizadas para nombres de métricas y atributos
  - Integración nativa con Pino mediante `@opentelemetry/instrumentation-pino` para correlación logs-trazas
  - Soporta OTLP protocol como formato de exportación estándar
  - Comunidad CNCF activa y ecosistema en crecimiento
- *Desventajas*:
  - Agrega ~15 dependencias a `package.json` (SDK, instrumentaciones, exporters)
  - La inicialización debe ser el primer import del proyecto (side-effect), lo que requiere cuidados con ESM y bundlers
  - Auto-instrumentación agrega overhead por request (microsegundos, aceptable para este volumen)
  - Documentación fragmentada y en evolución constante (cambios entre versiones 0.x)
  - Compatibilidad con ESM loader puede requerir configuraciones especiales con `tsx` o `ts-node`

### Opción 2: Prometheus Client directo (prom-client)

- Librería directa de Prometheus para Node.js, sin OpenTelemetry
- *Ventajas*: API simple y directa, cero abstracciones, métricas listas para Prometheus, dependencias mínimas (1 paquete)
- *Desventajas*: Sin tracing distribuido, sin estándar vendor-neutral, lock-in con Prometheus, sin Semantic Conventions estandarizadas, sin capacidad de cambiar a otro backend sin reescribir toda la instrumentación, no hay auto-instrumentación — todo es manual, sin correlación logs-métricas-trazas

### Opción 3: Servicio externo (Datadog APM, New Relic, AppSignal)

- Agentes propietarios con instrumentación automática
- *Ventajas*: Setup rápido, dashboards incluidos, soporte comercial, UI pulida, detección automática de anomalías
- *Desventajas*: Lock-in con el proveedor, costo por host/licencia, datos de salud salen del servidor (cumplimiento normativo), sin control sobre la infraestructura de monitoreo, difícil de migrar, dependencia de conectividad con el servicio externo

---

## Consecuencias

### Positivas

- Instrumentación estándar de la industria, vendor-neutral: se puede cambiar Prometheus por Datadog modificando solo la configuración del Collector
- Auto-instrumentación cubre HTTP, Express y PostgreSQL sin escribir código de métricas manual
- Métricas y trazas exportadas en OTLP, formato estándar CNCF
- Correlación logs-trazas: cada log de Pino incluye `trace_id` y `span_id` para seguimiento extremo a extremo
- Semantic Conventions 1.30+ garantizan consistencia en nombres de métricas y atributos
- Prepared para el futuro: cuando se necesiten trazas distribuidas entre backend y frontend, OTel lo soporta

### Negativas

- ~15 dependencias nuevas en `backend/package.json`
- La inicialización debe ser el primer import del bundle (side-effect), lo que puede causar problemas si no se respeta el orden
- Auto-instrumentación agrega overhead a cada request (medido en microsegundos, aceptable para este volumen transaccional)
- Curva de aprendizaje del equipo: OpenTelemetry tiene conceptos nuevos (trazas, spans, métricas, OTLP, Collector)
- La documentación oficial cambia frecuentemente (el SDK está en evolución activa)
- Posibles conflictos con el loader ESM de `tsx` en desarrollo

---

## Impacto en el Sistema

### Backend

- Nuevo archivo `backend/src/lib/telemetry.ts` con inicialización del SDK OTel
- `backend/src/lib/telemetry.ts` se importa como side-effect en `backend/src/server.ts` **antes que cualquier otro módulo**
- Se crean métricas RED personalizadas en `backend/src/lib/metrics/red-metrics.ts`
- Las trazas se exportan automáticamente desde Express y pg
- Se configura Pino para incluir `trace_id` y `span_id` en cada entrada de log
- Dependencias a agregar:
  - `@opentelemetry/sdk-node`
  - `@opentelemetry/auto-instrumentations-node`
  - `@opentelemetry/exporter-metrics-otlp-proto`
  - `@opentelemetry/exporter-trace-otlp-proto`
  - `@opentelemetry/instrumentation-pino`
  - `@opentelemetry/api`
- Variables de entorno requeridas:
  - `OTEL_SERVICE_NAME` — nombre del servicio (backend)
  - `OTEL_EXPORTER_OTLP_ENDPOINT` — URL del Collector
  - `OTEL_METRIC_EXPORT_INTERVAL` — intervalo de exportación (default 5000ms)

### Frontend

- Sin impacto directo
- En el futuro podrían agregarse trazas desde el frontend usando OpenTelemetry JS Web

### Infraestructura / Compartido

- El endpoint OTLP del Collector debe estar configurado en `OTEL_EXPORTER_OTLP_ENDPOINT`
- El Collector debe estar corriendo y accesible desde el contenedor del backend
- Se requiere puerto 4318 (OTLP HTTP) o 4317 (OTLP gRPC) expuesto en la red de Docker

---

## Reglas Derivadas

- El archivo `backend/src/lib/telemetry.ts` debe importarse como side-effect en `server.ts` antes de cualquier otro módulo — no se puede mover ni lazy-load
- Toda métrica personalizada debe seguir las OpenTelemetry Semantic Conventions para nombres y atributos
- No se usa `prom-client` ni ningún cliente Prometheus directo — toda la instrumentación es vía OTel SDK
- Las métricas RED se definen centralizadamente en `backend/src/lib/metrics/` y se reutilizan desde los módulos
- No se instrumenta código de negocio con métricas ad-hoc sin pasar por revisión
- La correlación logs-trazas se configura en el logger de Pino (ver ADR-019) inyectando `trace_id` y `span_id` del span activo
- En desarrollo se puede deshabilitar OTel con `OTEL_SDK_DISABLED=true` para evitar overhead local
