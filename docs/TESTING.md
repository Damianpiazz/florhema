# Estrategia de Testing - Florhema

Este documento detalla la infraestructura de testing del proyecto. Actualmente la estrategia esta en definicion, por lo que se detallan las herramientas sugeridas y la estructura planeada para cada nivel de pruebas.

---

## Resumen de Comandos (a definir)

Los comandos concretos se definiran una vez que se elijan las herramientas definitivas. La estructura esperada es:

| Ubicacion | Comando | Descripcion |
|---|---|---|
| `backend/` | `npm run test` | Tests unitarios y de integracion del backend |
| `backend/` | `npm run coverage` | Reporte de cobertura del backend |
| `frontend/` | `npm run test` | Tests unitarios y de componentes del frontend |
| `frontend/` | `npm run coverage` | Reporte de cobertura del frontend |

---

## Niveles de Testing

### 1. Backend: Tests Unitarios y de Integracion

Ubicacion sugerida: `backend/src/**/*.test.ts` o `backend/src/**/*.spec.ts`

**Proposito**: Validar la logica de servicios, controladores y repositorios del backend de forma aislada.

**Herramientas sugeridas**:

- **Vitest** o **Jest** como runner de tests
- **Supertest** para probar los endpoints HTTP de Express
- Base de datos de prueba separada (PostgreSQL) para tests de integracion con Prisma

**Entorno**: Node.js (sin navegador)

**Mocks**: Se mockean las dependencias externas (base de datos, servicios de terceros) para pruebas unitarias. Para pruebas de integracion se utiliza una base de datos real aislada.

### 2. Frontend: Tests Unitarios y de Componentes

Ubicacion sugerida: `frontend/src/**/*.test.tsx` o `frontend/src/**/*.spec.tsx`

**Proposito**: Validar la logica de componentes, hooks y utilidades del frontend de forma aislada.

**Herramientas sugeridas**:

- **Vitest** como runner de tests
- **React Testing Library** para renderizar e interactuar con componentes
- **JSDOM** como simulacion de navegador en Node

**Entorno**: JSDOM (simulacion de navegador en Node)

**Mocks**: Se mockean los servicios de API (Axios) para probar solo la UI sin depender del backend real.

### 3. Backend: Tests de API (Integracion)

Ubicacion sugerida: `backend/src/**/*.api.test.ts`

**Proposito**: Validar que los endpoints HTTP funcionen correctamente de principio a fin dentro del backend, incluyendo validaciones, autenticacion y acceso a base de datos.

**Herramientas sugeridas**:

- **Supertest** para realizar requests HTTP contra la app Express
- Base de datos de prueba (PostgreSQL separada o en memoria)

### 4. Tests End-to-End (a futuro)

Los tests E2E full-stack se incorporaran en una etapa posterior del proyecto. Cuando se implementen, validaran el flujo completo desde el navegador hasta la base de datos.

---

## Buenas Practicas

1. **Aislamiento**: Cada test debe ser independiente. No compartir estado entre tests. Limpiar la base de datos antes de cada suite o test segun corresponda.
2. **Nomenclatura de archivos**: Los archivos de test deben estar junto al codigo que prueban (co-ubicacion) y usar la extension `.test.ts` o `.spec.ts`.
3. **Selectores en frontend**: Preferir `getByRole` o `getByText` de React Testing Library antes que selectores CSS o IDs, para asegurar tests accesibles y resistentes a cambios de estilos.
4. **Mocks minimos**: Mockear solo lo necesario. Si un test requiere demasiados mocks, es senial de que el codigo necesita ser refactorizado.
5. **Cobertura**: Apuntar a una cobertura alta en la capa de servicios y logica de negocio. La cobertura en UI puede ser menor y enfocada en flujos criticos.
6. **Tests en CI**: Todos los tests deben ejecutarse en el pipeline de CI antes de permitir un merge a `main`.
