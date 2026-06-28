---
autor: Damian Piazza
fecha: 2026-06-28
titulo: Prometheus como backend de métricas con modelo pull
---

# ADR-028: Prometheus como backend de métricas con modelo pull

## Contexto

Florhema necesita un backend de time-series database (TSDB) para almacenar y consultar las métricas recolectadas por OpenTelemetry. Los requisitos específicos son:

- Almacenar métricas RED (Rate, Errors, Duration) con resolución de segundos
- Soportar consultas en tiempo real para dashboards de estado del sistema
- Permitir alerting basado en umbrales (error rate, latencia, tráfico cero)
- Integrarse con el flujo de datos: App → OTel SDK → OTel Collector → Prometheus → Grafana
- Funcionar en el entorno Docker existente junto a PostgreSQL

El OTel Collector ya expone métricas en formato Prometheus. Se necesita un backend que las recolecte, almacene y exponga para consulta.

La arquitectura pull (Prometheus scrapea al Collector) fue especificada como requisito, diferenciándose del modelo push donde el Collector enviaría activamente las métricas.

---

## Decisión

Se utiliza **Prometheus** como backend TSDB en modo **pull**, scrapeando el endpoint `/metrics` del OpenTelemetry Collector en el puerto 9464.

El flujo completo es:

```
App (Node.js)
    ↓ (OTLP)
OpenTelemetry Collector
    ↓ (Prometheus exporter, puerto 9464)
Prometheus Server  ←─── Grafana consulta (PromQL)
    ↓
Alertmanager (alertas)
```

Puntos clave:

- Prometheus se configura como un servicio más en `docker-compose.yml`
- Scrapea el endpoint `/metrics` del Collector cada 15 segundos (intervalo por defecto)
- El Collector expone las métricas OTLP en formato Prometheus con sufijos estándar: `_total` para counters, `_bucket`/`_count`/`_sum` para histograms, y `_max`/`_min` para summaries
- Los nombres de métricas siguen la conversión OTLP → Prometheus: puntos se convierten en guiones bajos, unidades se agregan como sufijo
- Las reglas de alerting se definen en archivos YAML para: error rate > 1% (5m), latencia P95 > 1s (5m), tráfico cero por 2 minutos
- Los datos se almacenan en un volumen Docker persistente

No se utiliza InfluxDB, VictoriaMetrics ni ningún otro TSDB. No se utiliza el modelo push (Pushgateway) para métricas de aplicación.

---

## Opciones Consideradas

### Opción 1: Prometheus en modo pull (seleccionada)

- TSDB maduro de CNCF con modelo pull por defecto
- *Ventajas*:
  - Modelo pull más simple de asegurar (el servidor inicia la conexión, no requiere autenticación en el target)
  - PromQL es el lenguaje estándar de consulta de métricas, soportado nativamente por Grafana
  - Alertmanager integrado para alerting maduro y configurable
  - Ecosistema amplio: exporters, librerías de clientes, comunidad massive
  - Almacenamiento local eficiente con compresión y retention configurable
  - Scraping por intervalos evita saturar el Collector con pushes constantes
- *Desventajas*:
  - El target (Collector) debe ser reachable desde Prometheus (requiere configuración de red Docker)
  - Escalamiento horizontal no es nativo (requiere Thanos o Cortex para HA)
  - Almacenamiento local no es distribuido — el data vive en el nodo
  - No soporta almacenamiento a largo plazo out-of-the-box (requiere Thanos/Cortex para retención > meses)

### Opción 2: VictoriaMetrics

- TSDB compatible con PromQL pero con mejor rendimiento de almacenamiento
- *Ventajas*: Mayor compresión que Prometheus, escalamiento horizontal nativo, compatible con PromQL, soporta tanto pull como push, menor uso de recursos
- *Desventajas*: Menos comunidad y documentación que Prometheus, ecosistema de alerting menos maduro, overhead operativo adicional, no es el estándar CNCF, la integración con el OTel Collector está menos documentada

### Opción 3: InfluxDB

- TSDB maduro con su propio lenguaje de consulta (Flux)
- *Ventajas*: Buen rendimiento de escritura, consultas analíticas avanzadas con Flux, UI integrada
- *Desventajas*: No soporta PromQL nativamente (requiere adapter), la UI de InfluxDB compite con Grafana en lugar de complementarlo, Flux tiene curva de aprendizaje pronunciada, la integración con OTel Collector requiere Telegraf como intermediario, ecosistema de alerting menos flexible

### Opción 4: Modelo push sin Prometheus (solo Grafana + OTel Collector)

- Usar el Collector como almacenamiento temporal y Grafana como fuente directa
- *Ventajas*: Sin componente adicional, menor complejidad operativa
- *Desventajas*: Sin almacenamiento persistente (datos se pierden al reiniciar Collector), sin capacidad de consulta histórica, sin alerting, sin historial para análisis post-mortem

---

## Consecuencias

### Positivas

- Prometheus es el estándar de facto CNCF para métricas, con社区 masiva y documentación extensa
- PromQL soportado nativamente por Grafana para dashboards RED
- Alertmanager permite configurar alertas sin depender de Grafana Alerting
- Modelo pull simplifica la seguridad: Prometheus scrapea, no requiere abrir puertos de entrada en los targets
- Almacenamiento local con retention configurable (default 15 días, configurable vía `--storage.tsdb.retention.time`)
- Scraping por intervalos evita sobrecargar el Collector con pushes de alta frecuencia
- Datos persistentes en volumen Docker (no se pierden ante reinicio de contenedores)

### Negativas

- Prometheus no escala horizontalmente sin Thanos o Cortex (aceptable para el volumen de este proyecto)
- El target (Collector) debe estar en la misma red Docker o reachable por DNS
- El almacenamiento es local al nodo — no es distribuido ni tolerante a fallos de nodo
- Si Prometheus se cae, pierde los datos del intervalo caído (no hay buffer ni replicación)
- Retention limitada a disco local (para retención > 3 meses se necesitaría Thanos)

---

## Impacto en el Sistema

### Backend

- Sin cambios directos en el código del backend — las métricas ya se exportan vía OTel SDK → Collector
- El backend no expone un endpoint `/metrics` directo (toda la métrica sale vía OTLP)

### Frontend

- Sin impacto

### Infraestructura / Compartido

- Nuevo servicio `prometheus` en `docker-compose.yml`:
  ```yaml
  prometheus:
    image: prom/prometheus:latest
    container_name: florhema-prometheus
    volumes:
      - ./infra/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - florhema_prometheus_data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
  ```
- Nuevo archivo de configuración `infra/prometheus/prometheus.yml` con:
  - Global scrape interval: 15s
  - Scrape target: `otel-collector:9464` (endpoint Prometheus exporter del Collector)
  - Reglas de alerting en archivo separado `infra/prometheus/alerts.yml`
- Reglas de alerting definidas:
  - `HighErrorRate`: error rate > 1% en los últimos 5 minutos
  - `HighLatency`: latencia P95 > 1s en los últimos 5 minutos
  - `ZeroTraffic`: cero requests en los últimos 2 minutos
- Nuevo volumen Docker `florhema_prometheus_data` para datos persistentes
- Puertos expuestos: `9090` (UI de Prometheus, solo para administración)

---

## Reglas Derivadas

- Toda métrica llega a Prometheus exclusivamente a través del OTel Collector — no se scrapea nada directamente desde la aplicación
- No se usa Pushgateway para métricas de aplicación (solo para métricas de batch jobs si existieran)
- Las reglas de alerting se versionan en `infra/prometheus/alerts.yml` dentro del repositorio
- La retention se configura a 30 días (puede ajustarse según capacidad de disco)
- No se expone el puerto 9090 de Prometheus en producción (solo accesible vía red interna Docker)
- El intervalo de scrapeo (15s) y el intervalo de exportación OTel (5s) deben estar alineados: el scrapeo debe ser múltiplo del export para evitar aliasing
