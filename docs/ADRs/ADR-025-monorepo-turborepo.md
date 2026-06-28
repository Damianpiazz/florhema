---
autor: Damian Piazza
fecha: 2026-06-27
titulo: Migración a Monorepo con Turborepo
---

# ADR-025: Migración a Monorepo con Turborepo

## Contexto

El proyecto Florhema está compuesto por dos aplicaciones independientes —backend (Express + Prisma) y frontend (Next.js)— cada una en su propio directorio raíz, con `package.json`, configuraciones de TypeScript, ESLint, Prettier y husky duplicadas. Esto genera:

- **Configuración duplicada**: husky, commitlint y otras herramientas deben instalarse y configurarse por separado en cada paquete.
- **Sin orquestación de builds**: no hay una forma estándar de construir, testear y lintear ambos proyectos con un solo comando.
- **Husky por paquete**: cada paquete tiene su propio directorio `.husky/`, lo que duplica hooks y dificulta su mantenimiento.
- **Sin caché entre builds**: cada build del backend y frontend es independiente, sin aprovechar caché entre ejecuciones.

Se necesita una estructura que centralice herramientas compartidas (husky, commitlint) manteniendo la independencia de tooling por paquete (ESLint, Prettier, TypeScript, testing), y que orqueste builds, tests y linters con un solo comando.

---

## Decisión

Se adopta **Turborepo** como orquestador de monorepo con **npm workspaces**. La estructura resultante es:

```
florhema/
  package.json          # Raíz: workspaces, turbo, husky, commitlint
  turbo.json            # Pipelines de build, test, lint, dev
  .husky/               # Hooks centralizados (pre-commit, commit-msg)
  .commitlintrc.json    # Configuración única de commitlint
  frontend/             # Next.js (workspace: frontend)
  backend/              # Express + Prisma (workspace: backend)
```

### Reglas de la migración:

1. **Husky centralizado**: los hooks `pre-commit` y `commit-msg` viven únicamente en la raíz.
2. **Tooling por paquete**: ESLint, Prettier, TypeScript, Vitest y `.gitignore` se mantienen dentro de cada paquete, sin unificar configuraciones.
3. **commitlint unificado**: al ser la misma config (`@commitlint/config-conventional`) para ambos paquetes, se centraliza en la raíz.
4. **Passthrough scripts**: `turbo.json` define pipelines que delegan a los scripts `dev`, `build`, `test`, `lint` de cada paquete.
5. **lint-staged vía turbo**: el hook `pre-commit` ejecuta `turbo run lint-staged --concurrency 1`, y cada paquete define su propio script `lint-staged`.

---

## Opciones Consideradas

### Opción 1: Turborepo + npm workspaces (seleccionada)

- *Ventajas*:
  - Caché inteligente de builds (no reconstruye lo que no cambió)
  - Orquestación con un solo comando: `turbo build`, `turbo test`
  - Ejecución paralela de pipelines con control de dependencias
  - npm workspaces ya está disponible sin herramientas adicionales
  - Amplia adopción, documentación sólida
- *Desventajas*:
  - Dependencia externa (`turbo`)
  - Curva de aprendizaje inicial de pipelines y configuración de caché

### Opción 2: Nx

- *Ventajas*: Más features que Turborepo (generación de código, plugins, gráfico de dependencias visual)
- *Desventajas*: Overhead significativo, configuración más compleja, sobreingeniería para 2 paquetes

### Opción 3: scripts npm con `--workspace`

- *Ventajas*: Sin dependencias externas
- *Desventajas*: Sin caché, sin paralelismo inteligente, sin orquestación de dependencias entre paquetes

### Opción 4: pnpm workspaces

- *Ventajas*: Instalación más rápida, estricto sobre dependencias
- *Desventajas*: El proyecto ya usa npm, migrar a pnpm implica cambios en workflows y lockfile

---

## Consecuencias

### Positivas

- `turbo build` construye backend y frontend en el orden correcto y en paralelo cuando es posible
- Caché automática de builds: si no hay cambios, `turbo build` responde en milisegundos
- Husky centralizado: un solo par de hooks para todo el proyecto
- commitlint unificado: misma configuración para ambos paquetes
- lint-staged independiente: cada paquete corre su propia config

### Negativas

- Dependencia de `turbo` como herramienta externa
- Frontend ESLint con errores preexistentes (React hooks, TanStack Table) — no causados por la migración
- Caché de turbo puede dar resultados inconsistentes si no se fuerza con `--force` tras ciertos cambios

---

## Impacto en el Sistema

### Backend

- `package.json`: se eliminó `husky`, `@commitlint/cli`, `@commitlint/config-conventional` de devDependencies y el script `prepare`
- Se agregó script `lint-staged` para que turbo pueda orquestarlo
- Se eliminó `.husky/` del paquete

### Frontend

- Mismos cambios que el backend
- Se agregó `turbopack.root` en `next.config.ts` apuntando al directorio padre para evitar el warning de Next.js sobre workspace root

### Infraestructura / Compartido

- Nuevo `package.json` raíz con `workspaces: ["frontend", "backend"]`
- Nuevo `turbo.json` con pipelines para dev, build, test, lint, format, format:check, lint-staged
- Nuevo `.husky/pre-commit` ejecuta `turbo run lint-staged --concurrency 1`
- Nuevo `.husky/commit-msg` ejecuta `npx --no-install commitlint --edit "$1"`
- Nuevo `.commitlintrc.json` con extends `@commitlint/config-conventional`
- Nuevo `.gitignore` raíz (node_modules, .turbo, .husky/_, env, OS, IDE)
- Se eliminaron los directorios `.husky/` de ambos paquetes
- Se eliminaron los archivos `commitlint.config.js` de ambos paquetes
- Se eliminó `frontend/package-lock.json` (pre-monorepo leftover)
- npm install deduplicó 103 packages

---

## Reglas Derivadas

- Todo nuevo paquete se agrega a `workspaces` en el `package.json` raíz
- Los hooks de git (husky) viven exclusivamente en la raíz, NO por paquete
- Las configuraciones de ESLint, Prettier, TypeScript y testing viven dentro de cada paquete
- Para build/test/lint de todo el proyecto: `turbo build`, `turbo test`, `turbo lint`
- Si turbo cache da resultados inconsistentes: `turbo build --force`
- commitlint es único para todo el proyecto (ambos paquetes usan `@commitlint/config-conventional`)
- El script `prepare` de husky solo existe en el `package.json` raíz
