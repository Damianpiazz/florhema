---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Linting con ESLint por Separado
---

# ADR-012: Linting con ESLint por Separado

## Contexto

Florhema tiene backend y frontend como proyectos independientes en un mismo repo, con sus propios `package.json`, dependencias y configuraciones. Cada uno tiene necesidades distintas de linting:

- Backend (Express + Prisma + TypeScript): reglas para Node.js, sin React
- Frontend (Next.js + React + TypeScript): reglas para React, JSX, hooks, navegador

Compartir una misma configuración de ESLint forzaría reglas que no aplican a ambos entornos.

---

## Decisión

Cada proyecto tiene su propia configuración de ESLint independiente:

- `backend/.eslintrc` — reglas para Node.js + TypeScript
- `frontend/.eslintrc` — reglas para Next.js + React + TypeScript

No existe un `.eslintrc` raíz que unifique criterios. Cada proyecto define sus reglas, plugins y extends según su stack.

---

## Opciones Consideradas

### Opción 1: ESLint separado por proyecto — seleccionada

**Ventajas:** cada proyecto tiene las reglas que necesita, sin conflictos entre reglas de Node y React, actualización independiente de plugins.

**Desventajas:** configuración duplicada parcial (reglas base de TypeScript), dos archivos que mantener.

### Opción 2: ESLint unificado en la raíz

**Ventajas:** un solo archivo de configuración.

**Desventajas:** requiere configurar overrides por carpeta, las reglas de React generan errores en backend y viceversa, más complejo de mantener que dos archivos separados.

---

## Consecuencias

### Positivas
- Reglas adaptadas a cada stack: React en frontend, Node en backend
- Sin falsos positivos cruzados
- Cada proyecto puede actualizar sus plugins sin afectar al otro

### Negativas
- Duplicación de la configuración base de TypeScript
- Dos comandos para ejecutar lint: `npm run lint` en cada carpeta

---

## Reglas Derivadas

- Backend usa `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`
- Frontend usa `eslint`, `next lint` (que incluye `eslint-config-next`) y reglas de React
- Cada proyecto tiene su propio script `lint` en `package.json`
- No se comparten plugins de React con el backend ni plugins de Node con el frontend
