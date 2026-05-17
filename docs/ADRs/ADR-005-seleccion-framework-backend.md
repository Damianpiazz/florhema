---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Selección de Framework Backend — Express.js
---

# ADR-005: Selección de Framework Backend — Express.js

## Contexto

Florhema requiere un framework HTTP para construir la API REST del backend. Los criterios de selección son:

- Ecosistema TypeScript con tipado fuerte
- Madurez y estabilidad para un sistema de gestión hospitalaria
- Curva de aprendizaje baja para el equipo
- Flexibilidad para estructurar la aplicación en capas y módulos
- Buen rendimiento para operaciones CRUD y transaccionales
- Integración sencilla con Prisma ORM
- Comunidad amplia y recursos de aprendizaje en español

Se evaluaron tres alternativas: Express.js, Spring Boot (Java) y Django (Python).

---

## Decisión

Se utilizará **Express.js** como framework HTTP del backend.

Express.js corre sobre Node.js con TypeScript. Se encargará del enrutamiento, middleware, manejo de peticiones y respuestas HTTP. No se utilizarán Spring Boot ni Django.

---

## Opciones Consideradas

### Opción 1: Express.js (seleccionada)

- Framework web minimalista para Node.js, con más de 10 años de madurez
- *Ventajas*: Ecosistema TypeScript nativo, madurez y estabilidad comprobada, flexibilidad total para estructurar el proyecto (independiente del framework), sintaxis simple y predecible, integración directa con Prisma, comunidad masiva con recursos en español, ideal para APIs REST con arquitectura en capas, mínimo overhead de aprendizaje
- *Desventajas*: Requiere estructuración manual (no impone organización), sin CLI generador de proyectos, el tipado de request/response requiere configuración manual

### Opción 2: Spring Boot (Java)

- Framework web basado en Java con inversión de control y módulos integrados
- *Ventajas*: Tipado fuerte estático, ecosistema corporativo maduro, performance sólida, soporte de transacciones declarativas, seguridad integrada (Spring Security), herramientas de monitoreo (Actuator)
- *Desventajas*: Stack completamente diferente al resto del proyecto (todo está en TypeScript), obliga a mantener dos lenguajes en el mismo repositorio, curva de aprendizaje alta para el equipo, arranque lento (JVM), configuración verbosa (anotaciones, XML), no se integra con Prisma (requiere JPA/Hibernate), sobreingeniería para la escala del proyecto

### Opción 3: Django (Python)

- Framework full-stack para Python con ORM integrado y admin panel
- *Ventajas*: Desarrollo rápido con admin panel automático, ORM integrado (Django ORM), baterías incluidas, buena documentación
- *Desventajas*: Stack diferente al resto del proyecto (TypeScript vs Python), Django ORM no es Prisma, admin panel no necesario para una SPA con Next.js, monolítico por naturaleza (dificulta la arquitectura en capas definida en ADR-004), rendimiento inferior para APIs de alta concurrencia, cambios de versión (2.x → 3.x → 4.x) con roturas significativas

---

## Consecuencias

### Positivas
- Un solo lenguaje (TypeScript) en todo el proyecto backend y frontend
- Integración natural con Prisma ORM (ambos del ecosistema Node.js/TypeScript)
- Curva de aprendizaje mínima: Express.js es el estándar de facto para APIs en Node.js
- Flexibilidad total para implementar la arquitectura en capas definida en ADR-004
- Ecosistema de middleware maduro (autenticación, validación, logging, CORS)
- Facilidad para encontrar desarrolladores familiarizados con el stack
- Actualizaciones y parches de seguridad frecuentes

### Negativas
- Express.js no impone estructura: requiere disciplina del equipo para mantener la arquitectura definida
- Sin generación automática de documentación (requiere herramientas externas como Swagger/OpenAPI)
- El tipado de `req` y `res` es genérico y requiere decoración manual o `express-async-errors`
- Rendimiento inferior a frameworks más modernos como Fastify en benchmarks extremos

---

## Impacto en el Sistema

### Backend
- Express.js es la puerta de entrada HTTP
- Se usa con TypeScript y `ts-node-dev` para recarga en caliente
- Middlewares globales: CORS, JSON parser, manejo de errores
- Enrutamiento modular por cada dominio (persona, donante, paciente, etc.)
- Controllers reciben `(req, res, next)` y delegan en services

### Frontend
- Sin impacto directo, más allá de que la API sigue convenciones REST estándar de Express

### Infraestructura / Compartido
- Node.js como runtime compartido con el frontend (aunque sin workspaces)
- Puerto configurable vía `PORT` en variable de entorno

---

## Reglas Derivadas

- No se introducirán frameworks de otros lenguajes (Java, Python, etc.) en el backend
- Express.js se usa exclusivamente como framework HTTP; no se utiliza para servir vistas ni templates
- Se prefiere `express-async-errors` para manejo de errores asíncronos sin try-catch repetitivo
- Los middlewares globales se definen en `backend/src/middlewares/`
- No se utilizarán decoradores experimentales (no es NestJS)
- La convención de nomenclatura para archivos de rutas es `<recurso>.routes.ts`
