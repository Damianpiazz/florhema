---
autor: Damian Piazza
fecha: 2026-05-16
titulo: Separación de Backend y Frontend en Directorios Independientes
---

# ADR-001: Separación de Backend y Frontend en Directorios Independientes

## Contexto

El sistema Florhema requiere dos aplicaciones con necesidades técnicas distintas:
- **Backend**: API REST con Express.js + Prisma ORM + PostgreSQL
- **Frontend**: SPA con Next.js (App Router) + Tailwind CSS + shadcn/ui

Cada una tiene requerimientos de tooling que pueden entrar en conflicto:
- Versiones de Node.js o TypeScript incompatibles
- Configuraciones de ESLint, Prettier, o test runners distintas
- Dependencias que exigen versiones diferentes de una misma librería (ej. React solo en frontend, Prisma solo en backend)
- Procesos de build y dev independientes

Forzar un workspace compartido implicaría acoplar estos entornos y potencialmente romper tooling entre carpetas.

---

## Decisión

Se mantendrán `backend/` y `frontend/` como directorios **totalmente independientes** dentro del mismo repositorio de Git, cada uno con:
- Su propio `package.json` y `node_modules`
- Su propio `tsconfig.json`
- Su propia configuración de ESLint, Prettier, y otras herramientas
- Sus propios scripts de npm
- Sin uso de npm workspaces, pnpm workspaces, ni Yarn workspaces

No existirá un `package.json` raíz que gestione dependencias compartidas. La comunicación entre ambos será exclusivamente vía HTTP (API REST).

---

## Opciones Consideradas

### Opción 1: Monorepo con workspaces (npm/pnpm/yarn workspaces)
- Dependencias compartidas y hoisting
- Un solo `package.json` raíz con scripts unificados
- *Ventajas*: Menos duplicación de config, posible código compartido (tipos)
- *Desventajas*: Conflictos de versiones entre herramientas, hoisting problemático, rotura de tooling entre carpetas por incompatibilidades

### Opción 2: Repositorios separados
- Cada app en su propio repo con su propio ciclo de vida
- *Ventajas*: Aislamiento total
- *Desventajas*: Mayor overhead de coordinación, PRs cruzados, duplicación de CI/CD, más difícil mantener consistencia

### Opción 3: Directorios independientes sin workspaces (seleccionada)
- Mismo repo, carpetas separadas, cada una con su propio tooling
- *Ventajas*: Aislamiento de dependencias sin overhead de repos separados, cada equipo/capa puede actualizar su tooling sin afectar a la otra, simplicidad
- *Desventajas*: Sin tipado compartido automático, duplicación de configuraciones boilerplate

---

## Consecuencias

### Positivas
- Total aislamiento de tooling: cambios en ESLint, TS o dependencias del frontend no afectan al backend y viceversa
- Cada app puede actualizar su stack de forma independiente
- Developers pueden trabajar en una sola capa sin tener que entender el tooling de la otra
- Simplicidad: sin magic de hoisting o resolución de workspaces

### Negativas
- Duplicación de configuraciones (tsconfig, ESLint, scripts de npm)
- No hay tipos compartidos automáticamente entre backend y frontend (requiere definirlos a mano o generar un paquete de tipos aparte)
- Los scripts de desarrollo requieren ejecutar procesos separados (o usar `concurrently` manualmente si se desea)

---

## Impacto en el Sistema

### Backend
- Todo su tooling vive en `backend/package.json`
- Prisma, Express y dependencias de backend no contaminan el frontend

### Frontend
- Todo su tooling vive en `frontend/package.json`
- Next.js, React, Tailwind y dependencias de frontend no contaminan el backend

### Infraestructura / Compartido
- El contrato entre backend y frontend es la API REST
- Para compartir tipos, se evaluará crear un directorio `shared/` con tipos manuales, o generar un paquete de tipos en el futuro si la necesidad crece

---

## Reglas Derivadas

- Ningún directorio tendrá un `package.json` raíz que intente unificar dependencias
- No se instalarán dependencias de backend en frontend ni viceversa
- El archivo `.gitignore` debe ignorar `node_modules` en ambos directorios
- Los scripts de CI/CD deben ejecutar `npm install` por separado en cada directorio
- Para desarrollo local, cada app se inicia con `npm run dev` desde su propio directorio
