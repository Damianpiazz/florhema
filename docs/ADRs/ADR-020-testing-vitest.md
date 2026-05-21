---
autor: DAMIAN Piazza
fecha: 2026-05-21
titulo: Framework de Testing — Vitest
---

# ADR-020: Framework de Testing — Vitest

## Contexto

Florhema necesita un framework de testing para ambos proyectos (backend y frontend) que permita:

- Tests unitarios de servicios, utilidades y componentes
- Tests de integración con base de datos (backend)
- Tests de API (endpoints HTTP)
- Tests de componentes React (frontend)
- Cobertura de código para identificar áreas no testeadas
- Ejecución rápida con recarga en modo watch durante desarrollo
- Integración con TypeScript sin configuración adicional

Se evaluaron tres alternativas: Vitest, Jest y Mocha.

---

## Decisión

Se utilizará **Vitest** como framework de testing en ambos proyectos (backend y frontend). Vitest se encargará de:

- Ejecución de tests unitarios, de integración y de API en el backend
- Ejecución de tests de componentes y utilidades en el frontend
- Generación de reportes de cobertura via `@vitest/coverage-v8`
- Integración con `supertest` para tests de API HTTP en el backend
- Integración con `@testing-library/react` para tests de componentes en el frontend

No se utilizarán Jest ni Mocha.

---

## Opciones Consideradas

### Opción 1: Vitest (seleccionada)

- Framework de testing nativo de Vite, compatible con Jest API, ultrarrápido
- *Ventajas**: API compatible con Jest (`describe`, `it`, `expect`, `vi.mock`) — curva de aprendizaje cero para equipos con background en Jest, ejecución significativamente más rápida que Jest (reutiliza caché de módulos de Vite), modo watch ultrarrápido con HMR, integración nativa con TypeScript (sin `ts-jest` ni `babel`), `vi.mock()` para mocking automático de módulos, `vi.fn()` y `vi.spyOn()` para mocks y espías, compatible con `@testing-library/react` y `jsdom`, cobertura integrada via `@vitest/coverage-v8`, configuración mínima
- *Desventajas**: Ecosistema más joven que Jest (menos plugins comunitarios), el mocking automático (`vi.mock`) tiene diferencias sutiles respecto a Jest, algunos matchers de Jest extendidos no están disponibles nativamente (requieren `@testing-library/jest-dom`), Jest tiene mayor adopción en proyectos legacy

### Opción 2: Jest

- Framework de testing más adoptado del ecosistema JavaScript/TypeScript
- *Ventajas**: Madurez (10+ años), ecosistema masivo de plugins y presets, documentación extensa, `jest.mock()` automático, snapshot testing maduro, compatibilidad con casi cualquier proyecto
- *Desventajas**: Configuración compleja con TypeScript (requiere `ts-jest` o `babel-jest`), velocidad de ejecución más lenta (sin caché de módulos eficiente), modo watch más lento, configuración de `jsdom` y aliases de módulos más verbosa, el proyecto Jest ha tenido problemas de mantenimiento en los últimos años, reinicio de caché frecuente en proyectos grandes

### Opción 3: Mocha + Chai

- Framework de testing minimalista con librería de aserciones separada
- *Ventajas**: Flexibilidad total (elige tu librería de aserciones, mocking, reporter), API simple y predecible, amplia adopción en proyectos Node.js legacy
- *Desventajas*: Requiere configuración manual de múltiples librerías (Mocha + Chai + Sinon + chai-as-promised + etc.), sin soporte nativo de TypeScript, sin mocking integrado (requiere Sinon), sin cobertura integrada (requiere nyc/istanbul), más boilerplate que Vitest o Jest, sin modo watch eficiente

---

## Consecuencias

### Positivas
- Un solo framework de testing para backend y frontend (consistencia en el equipo)
- Ejecución rápida: los tests se ejecutan en segundos, no minutos
- Modo watch con HMR: cambios en código o tests provocan re-ejecución instantánea
- TypeScript nativo sin configuración adicional ni `ts-jest`
- Mocking integrado (`vi.mock`, `vi.fn`, `vi.spyOn`) sin librerías externas
- Cobertura de código con V8 (nativa, rápida y precisa)
- `@testing-library/react` funcionando out-of-the-box con `jsdom` en el frontend
- `supertest` para tests de integración HTTP en el backend sin configuración especial

### Negativas
- La función `vi.mock()` tiene reglas de hoisting diferentes a `jest.mock()` (puede causar confusión inicial)
- Los tests de integración que usan Prisma requieren configuración adicional (base de datos de test)
- El ecosistema de plugins es más reducido que Jest, aunque cubre las necesidades del proyecto

---

## Impacto en el Sistema

### Backend
- Configuración en `backend/vitest.config.ts` con alias `@`, `globals: true`, `environment: 'node'`
- Tests unitarios co-locados con los archivos de servicio: `*.service.test.ts`
- Tests de API en archivos `*.api.test.ts` usando `supertest` y la instancia de Express
- Cobertura configurada en el mismo `vitest.config.ts` o via script `coverage`
- Scripts npm: `test`, `test:watch`, `coverage`

### Frontend
- Configuración en `frontend/vitest.config.ts` con `environment: 'jsdom'`, `globals: true`
- Tests de componentes co-locados con los componentes: `*.test.tsx`
- Uso de `@testing-library/react` para renderizar componentes y simular interacciones
- `@testing-library/jest-dom` para matchers DOM extendidos (`toBeInTheDocument`, `toHaveTextContent`)
- Scripts npm: `test`, `test:watch`, `coverage`

### Infraestructura / Compartido
- Ambos proyectos comparten la misma versión de Vitest (^4.1.6)
- Los tests se ejecutan de forma independiente en cada proyecto (sin workspaces)
- En CI, ambos proyectos ejecutan sus tests en paralelo

---

## Reglas Derivadas

- Los tests se nombran con el patrón `*.test.ts` (backend) y `*.test.tsx` (frontend)
- Los tests se co-ubican con el archivo que testean (junto al service, componente, etc.)
- No se crea un directorio `__tests__` separado
- Se usa `describe` para agrupar tests por funcionalidad y `it` para casos individuales
- `vi.mock()` se usa para mockear módulos externos; `vi.fn()` para funciones espía
- Los tests de API usan `supertest` con la app Express (sin servidor real)
- Los tests de frontend usan `@testing-library/react` con `render` y `screen`
- La cobertura mínima objetivo se define por cada módulo según su criticidad
- No se commitean archivos de cobertura (`coverage/`) en el repositorio
