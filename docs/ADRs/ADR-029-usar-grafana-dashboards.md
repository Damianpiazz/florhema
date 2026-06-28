---
autor: Damian Piazza
fecha: 2026-06-28
titulo: Grafana para dashboards y visualización de métricas
---

# ADR-029: Grafana para dashboards y visualización de métricas

## Contexto

Florhema necesita visualizar las métricas recolectadas del backend para responder preguntas operativas en tiempo real:

- ¿El sistema está saludable? ¿Está respondiendo requests correctamente?
- ¿Hay errores? ¿Dónde y en qué endpoints?
- ¿Cuál es la latencia actual? ¿Está dentro de los thresholds aceptables?
- ¿Hay picos de tráfico o caídas repentinas?

El stack de observabilidad definido en ADR-027 (OpenTelemetry SDK) y ADR-028 (Prometheus) ya genera y almacena métricas RED. Falta la capa de visualización y dashboarding que permita al equipo de operaciones consumir esa información.

Los requisitos específicos son:

- Dashboards con métricas RED (Rate, Errors, Duration) en tiempo real
- Capacidad de filtrar por servicio, entorno, instancia, endpoint y método HTTP
- Dashboards reproducibles y versionados en Git (sin configuración manual en UI)
- Alertas visuales integradas en los dashboards
- Integración nativa con Prometheus como datasource

No se necesita en esta fase: tracing distribuido (Grafana Tempo), logs (Grafana Loki), ni alertas vía Grafana Alerting (se usará Prometheus Alertmanager en su lugar).

---

## Decisión

Se utiliza **Grafana** como plataforma de visualización, con Prometheus como datasource, aprovisionado completamente mediante configuración YAML/JSON.

La capa de visualización completa queda:

```
App → OTel SDK → OTel Collector → Prometheus → Grafana (dashboards)
                                                ↓
                                         Operadores/Team
```

Puntos clave:

- Grafana se ejecuta como un servicio más en `docker-compose.yml`
- El datasource de Prometheus se configura mediante aprovisionamiento (`provisioning/datasources/`)
- Los dashboards se definen en JSON (modelo exportado de Grafana) y se aprovisionan mediante `provisioning/dashboards/`
- Dashboard principal: **RED Dashboard** con cuatro filas:
  1. **Summary Row**: indicadores clave (RPS, Error Rate %, P50, P95, P99)
  2. **Rate Row**: RPS por endpoint y método HTTP (gráfico de series de tiempo)
  3. **Errors Row**: error rate y errores absolutos por endpoint
  4. **Duration Row**: latencia P50, P95, P99 por endpoint
- Variables de dashboard: `$service`, `$env`, `$instance`, `$endpoint`, `$method`
- No se utiliza la UI de Grafana para crear dashboards manualmente — todo se versiona en Git como JSON
- El aprovisionamiento recarga automáticamente los dashboards ante cambios en los archivos JSON (hot-reload)

No se utiliza Grafana Loki (logs), Grafana Tempo (trazas), ni Kibana/Elasticsearch para visualización.

---

## Opciones Consideradas

### Opción 1: Grafana con aprovisionamiento (seleccionada)

- Plataforma estándar de visualización de métricas, parte del ecosistema CNCF
- *Ventajas*:
  - Aprovisionamiento: dashboards versionados en Git, reproducibles, sin click-ops
  - PromQL nativo: consultas directas a Prometheus para métricas RED
  - Variables/templates: filtrado multi-dimensional (`$service`, `$endpoint`, `$method`) sin modificar queries
  - Alertas visuales integradas en los paneles
  - Ecosistema extensible: paneles de comunidad, datasources múltiples, API REST
  - Soporte nativo para OTLP a futuro si se conecta directamente a Tempo o Loki
  - Grafana 11+ tiene provisioning estable y maduro
- *Desventajas*:
  - Los JSON de dashboards son verbosos (15-20KB por dashboard) pero machine-readable
  - La edición de dashboards requiere exportar/importar JSON (menos ágil que UI para cambios exploratorios)
  - El aprovisionamiento no soporta cambios en UI — hay que editar el JSON y reiniciar o recargar
  - Dependencia de conectar Prometheus como datasource (configuración adicional)

### Opción 2: Solo Prometheus UI

- Interfaz web integrada de Prometheus
- *Ventajas*: Sin componente adicional, setup mínimo, PromQL directamente en la UI
- *Desventajas*: Sin dashboards persistentes, sin gráficos combinados, sin variables/templates, sin alertas visuales, interfaz exclusivamente técnica (sin contexto operacional), no apto para equipo de operaciones no técnico

### Opción 3: Datadog Dashboards

- Plataforma SaaS con dashboards listos para usar
- *Ventajas*: Dashboards preconstruidos, alertas integradas, zero mantenimiento de infraestructura
- *Desventajas*: Datos de salud del hospital salen del servidor (cumplimiento normativo), costo por host, lock-in, sin control sobre la infraestructura, dashboards no versionables en Git (dependen de UI de Datadog)

### Opción 4: Kibana (Elasticsearch)

- Visualización sobre Elasticsearch, requiere convertir métricas a documentos
- *Ventajas*: Visualización flexible, buena para logs y métricas combinadas
- *Desventajas*: No habla PromQL nativamente, requiere Elasticsearch como infraestructura adicional (pesada), sobreingeniería para métricas RED, no integra con Prometheus de forma nativa, Elasticsearch consume muchos recursos

---

## Consecuencias

### Positivas

- Dashboards completamente versionados en Git: cambios revisables, deploy reproducible, rollback inmediato
- Aprovisionamiento elimina el click-ops: no hay dashboards que existan solo en una instancia de Grafana
- Filtrado multi-dimensional con variables permite aislar problemas por endpoint, método, instancia
- RED dashboard responde las tres preguntas operativas clave: tasa, errores, latencia
- Grafana soporta alertas vía Prometheus Alertmanager integrado como datasource de alertas
- Escalable a futuro: agregar Loki para logs, Tempo para trazas, manteniendo el mismo aprovisionamiento
- Panel de summary con P50/P95/P99 da visibilidad inmediata de la salud del sistema

### Negativas

- Los archivos JSON de dashboards son extensos (15-20KB) y difíciles de revisar en PRs
- Editar un dashboard requiere exportar JSON → modificar → importar (flujo menos ágil que UI)
- El aprovisionamiento no sincroniza bidireccionalmente: cambios en la UI se pierden al recargar
- Requiere que el equipo aprenda la estructura JSON de dashboards de Grafana para hacer cambios
- Almacenamiento de dashboards en Git puede generar conflictos de merge si dos personas modifican el mismo JSON

---

## Impacto en el Sistema

### Backend

- Sin cambios directos — el backend exporta métricas vía OTel SDK → Collector, no interactúa con Grafana

### Frontend

- Sin impacto directo
- En el futuro podría linkearse Grafana desde el frontend para acceso rápido a dashboards operativos

### Infraestructura / Compartido

- Nuevo servicio `grafana` en `docker-compose.yml`:
  ```yaml
  grafana:
    image: grafana/grafana:latest
    container_name: florhema-grafana
    volumes:
      - ./infra/grafana/datasources:/etc/grafana/provisioning/datasources
      - ./infra/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - florhema_grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_SECURITY_ADMIN_PASSWORD=admin
  ```
- Nuevo archivo `infra/grafana/datasources/prometheus.yml` para aprovisionar el datasource:
  ```yaml
  apiVersion: 1
  datasources:
    - name: Prometheus
      type: prometheus
      url: http://prometheus:9090
      access: proxy
      isDefault: true
  ```
- Nuevo archivo `infra/grafana/dashboards/dashboards.yml` con la configuración de aprovisionamiento
- Nuevo archivo `infra/grafana/dashboards/red-metrics.json` con el dashboard RED exportado
- Estructura de archivos:
  ```
  infra/grafana/
    datasources/
      prometheus.yml
    dashboards/
      dashboards.yml      ← Configuración de aprovisionamiento
      red-metrics.json    ← Dashboard RED exportado
  ```
- Dashboard RED con paneles organizados en filas:
  1. **Summary** (stats únicos): RPS, Error Rate %, P50, P95, P99
  2. **Rate**: RPS por endpoint, RPS por método HTTP, RPS total
  3. **Errors**: Error rate %, Errores absolutos por endpoint, Errores por código HTTP
  4. **Duration**: P50 por endpoint, P95 por endpoint, P99 por endpoint, Heatmap de latencia

---

## Reglas Derivadas

- Todos los dashboards se definen exclusivamente mediante aprovisionamiento — no se crean dashboards manuales en la UI
- El JSON de cada dashboard se versiona en `infra/grafana/dashboards/` y se mantiene bajo control de cambios
- No se modifican dashboards desde la UI de Grafana (los cambios se pierden al recargar el aprovisionamiento)
- Para modificar un dashboard: (1) exportar JSON desde Grafana, (2) editar en el repo, (3) commit y PR
- Las variables de dashboard siguen la convención: `$service`, `$env`, `$instance`, `$endpoint`, `$method`
- Los paneles siguen el patrón RED: cada fila responde una pregunta (Rate, Errors, Duration)
- No se agrega Loki, Tempo, ni otros datasources en esta fase (futura expansión)
- El dashboard RED es el dashboard por defecto (home dashboard) de Grafana
- Las alertas se configuran en Prometheus Alertmanager, no en Grafana Alerting (por consistencia con ADR-028)
