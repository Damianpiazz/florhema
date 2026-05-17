---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Estrategia de Dockerización
---

# ADR-015: Estrategia de Dockerización

## Contexto

Actualmente solo la base de datos PostgreSQL está dockerizada. Backend y frontend se ejecutan localmente con Node.js. Se necesita una estrategia de containerización que evolucione con el proyecto, considerando que las máquinas de desarrollo no siempre soportan ejecutar todo en Docker Compose.

---

## Decisión

Se adopta un enfoque en dos fases:

**Fase 1 (actual):** Solo servicios externos en Docker Compose.
- Base de datos PostgreSQL
- Servicios de terceros si aplican (servicio de mail, caché, etc.)
- Backend y frontend se ejecutan localmente con Node.js, sin containers

**Fase 2 (futura):** Dockerización completa cuando el proyecto lo requiera (despliegue, estandarización del entorno).
- Backend con Dockerfile multistage (build → producción)
- Frontend con Dockerfile multistage (build estático o server)
- docker-compose.yml orquesta todos los servicios: db + backend + frontend + servicios externos

---

## Opciones Consideradas

### Opción 1: Docker progresivo en dos fases — seleccionada

**Ventajas:** arranque rápido en desarrollo sin esperar a tener todo dockerizado, no exige recursos de la máquina para correr containers de backend y frontend, la fase 2 se implementa cuando el despliegue lo requiera.

**Desventajas:** durante la fase 1 los desarrolladores necesitan Node.js instalado localmente.

### Opción 2: Todo dockerizado desde el inicio

**Ventajas:** entorno idéntico para todos los desarrolladores, sin instalaciones locales.

**Desventajas:** mayor consumo de recursos en la máquina de desarrollo, hot reload más lento, debugging más complejo, las máquinas del equipo no siempre soportan ejecutar todo en Docker Compose.

---

## Consecuencias

### Positivas
- Bajo consumo de recursos en desarrollo durante la fase 1
- Flexibilidad para agregar servicios externos al docker-compose sin afectar backend/frontend
- Cuando llegue la fase 2, los Dockerfiles ya estarán pensados para producción

### Negativas
- Durante la fase 1 el entorno no es 100% reproducible entre desarrolladores
- Al migrar a fase 2 puede haber ajustes de configuración

---

## Reglas Derivadas

- Fase 1: `docker-compose.yml` solo incluye PostgreSQL y servicios externos
- Fase 2: `Dockerfile.multistage` en `backend/` y `frontend/` separados
- Los Dockerfiles usan imágenes slim, capas optimizadas y `.dockerignore`
- El `docker-compose.yml` de fase 2 orquesta todos los servicios
- La migración a fase 2 se decide cuando el proyecto esté listo para desplegarse o cuando el equipo lo considere necesario
- No se dockeriza backend/frontend hasta que se defina la fase 2
