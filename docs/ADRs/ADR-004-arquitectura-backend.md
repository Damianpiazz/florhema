---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Arquitectura del Backend en Capas
---

# ADR-004: Arquitectura del Backend — Capas Routes → Controllers → Services → Repositories

## Contexto

El backend de Florhema necesita una estructura organizativa clara que separe responsabilidades, sea fácil de mantener y permita escalar la aplicación a medida que crecen los módulos de dominio (donantes, pacientes, gestantes, transfusiones, etc.).

Los requisitos arquitectónicos son:
- Separación nítida de responsabilidades entre el transporte HTTP, la lógica de negocio y el acceso a datos
- Que la lógica de negocio sea testeable sin depender de Express ni de Prisma
- Baja complejidad de entrada para nuevos desarrolladores en el equipo
- Que la estructura sea predecible: mismo patrón en cada módulo
- Evitar sobreingeniería temprana sin sacrificar mantenibilidad futura

Se evaluaron dos enfoques: arquitectura en capas simple (Routes → Controllers → Services → Repositories) y hexagonal pura (puertos y adaptadores).

---

## Decisión

Se adopta una **arquitectura en capas** con cuatro niveles jerárquicos dentro de cada módulo de dominio:

```
Cliente HTTP
    ↓
Routes      → Definen endpoints HTTP, delegan en controllers
    ↓
Controllers → Reciben request, validan entrada, delegan en services, responden
    ↓
Services    → Contienen toda la lógica de negocio y reglas del dominio
    ↓
Repositories → Encapsulan el acceso a datos vía Prisma
    ↓
Base de Datos
```

**Flujo de dependencias:** cada capa solo conoce a la inmediatamente inferior. Routes → Controllers → Services → Repositories. Ninguna capa salta a otra.

No se implementará una arquitectura hexagonal pura (puertos/adaptadores, casos de uso como interfaces, inversión de dependencias total).

---

## Opciones Consideradas

### Opción 1: Arquitectura en capas (Routes → Controllers → Services → Repositories) — seleccionada

- Separación vertical por capas técnicas, dentro de módulos horizontales por dominio
- *Ventajas*:
  - Baja complejidad cognitiva: estructura lineal y predecible
  - Fácil onboarding: mismo patrón en cada módulo
  - Services puros sin dependencia de Express ni Prisma (testeables con mocks simples)
  - Repositories aíslan Prisma, permitiendo cambiar de ORM sin tocar services
  - Suficiente para la complejidad actual del dominio
  - Sin boilerplate de interfaces abstractas ni inyectores de dependencias
- *Desventajas*:
  - Las capas no son intercambiables por interfaz (acoplamiento directo entre capas)
  - Si el dominio crece mucho, puede requerir refactor hacia algo más granular
  - Las reglas de negocio transversales (logging, auditoría) requieren middleware, no puertos

### Opción 2: Hexagonal pura (puertos y adaptadores)

- Arquitectura donde el dominio es el centro absoluto, con puertos (interfaces) y adaptadores (implementaciones) que invierten las dependencias
- *Ventajas*:
  - Aislamiento total del dominio: cero dependencias externas en la capa de negocio
  - Intercambiabilidad total de adaptadores (cambiar Express por Fastify, Prisma por Drizzle, sin tocar dominio)
  - Testeabilidad máxima: el dominio se prueba sin infraestructura
  - Arquitectura preparada para sistemas muy grandes o con múltiples equipos
- *Desventajas*:
  - Sobrecarga significativa de boilerplate: interfaces, fábricas, inyectores de dependencias
  - Mayor complejidad de navegación: seguir flujos requiere saltar entre interfaces e implementaciones
  - Curva de aprendizaje alta para el equipo
  - Overengineering para la escala actual del proyecto (aplicación de gestión con ~5-8 módulos)
  - El beneficio real (cambiar de framework o DB) es improbable en un proyecto hospitalario público con stack ya definido

---

## Consecuencias

### Positivas
- Estructura predecible: cada desarrollador sabe exactamente dónde poner cada pieza de código
- Services contienen toda la lógica de negocio y son puramente TypeScript, sin imports de Express o Prisma
- Repositories aíslan Prisma: si en el futuro se cambia de ORM, solo se tocan los repositories
- Controllers livianos: solo orquestan petición/respuesta y validación de entrada
- Cada módulo es autocontenido y puede desarrollarse en paralelo
- Testing unitario de services sin infraestructura (solo mockear repositories)
- Testing de integración de repositories contra base de datos real aislada

### Negativas
- Las capas están acopladas por contrato implícito (no por interfaz formal)
- Si un módulo crece demasiado, puede requerir dividirse en submódulos
- No hay inversión de dependencias a nivel de interfaces: Services importan Repositories concretos, no interfaces
- La arquitectura no forza el aislamiento del dominio: requiere disciplina del equipo para no poner lógica en controllers

---

## Impacto en el Sistema

### Backend
- Todo el código fuente vive en `backend/src/modules/<modulo>/`
- Cada módulo tiene la misma estructura:
  ```
  modules/<modulo>/
    routes/
    controllers/
    services/
    repositories/
  ```
- Las capas globales compartidas van en `backend/src/lib/`, `backend/src/middlewares/`, `backend/src/config/`, `backend/src/utils/`
- Prisma Client se inicializa una vez en `backend/src/lib/prisma.ts` y se inyecta en los repositories

### Frontend
- Sin impacto directo

### Infraestructura / Compartido
- Sin impacto

---

## Reglas Derivadas

- **Prohibido**: importar Prisma Client directamente desde un controller o service. Solo los repositories acceden a Prisma.
- **Prohibido**: usar `req` o `res` de Express fuera de controllers y routes.
- **Obligatorio**: toda lógica de negocio y reglas del dominio van en services.
- **Obligatorio**: los services reciben repositories por constructor o parámetro (sin instanciarlos internamente).
- **Obligatorio**: los controllers no contienen lógica de negocio, solo orquestación request/response.
- **Permitido**: usar `prisma.$queryRaw` dentro de repositories para consultas complejas no soportadas por Prisma.
- **Recomendado**: mantener services sin efectos secundarios (puros) siempre que sea posible.
