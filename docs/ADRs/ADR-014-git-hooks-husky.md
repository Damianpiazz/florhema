---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Git Hooks con Husky por Proyecto
---

# ADR-014: Git Hooks con Husky por Proyecto

## Contexto

Se necesita asegurar que todo el código que se commitée pase linting y formateo, y que los mensajes de commit sigan la convención de Conventional Commits. Dado que backend y frontend son proyectos independientes con su propio ESLint y `package.json`, cada uno necesita sus propias validaciones.

---

## Decisión

Cada proyecto tiene su propia instalación de Husky y define sus hooks:

- `backend/.husky/pre-commit` — ejecuta lint y formateo del backend
- `frontend/.husky/pre-commit` — ejecuta lint y formateo del frontend
- `backend/.husky/commit-msg` — valida Conventional Commits en el backend
- `frontend/.husky/commit-msg` — valida Conventional Commits en el frontend

No hay Husky en la raíz. Cada hook solo valida los archivos de su proyecto. Para formateo se usa Prettier, para linting se usa ESLint, y para validar commits se usa `commitlint`.

---

## Opciones Consideradas

### Opción 1: Husky por proyecto — seleccionada

Ejecuta lint, formateo y validación de commits localmente antes de cada commit mediante hooks de Git.

**Ventajas:** feedback inmediato al desarrollador, sin depender de conexión a internet ni de que el CI esté configurado, validación de Conventional Commits en el mismo hook.

**Desventajas:** dos carpetas `.husky` que mantener, requiere que cada desarrollador ejecute `npm install` para instalar Husky.

### Opción 2: GitHub Actions (CI)

Ejecuta lint, formateo y validación de commits únicamente al hacer push o PR mediante workflows en GitHub.

**Ventajas:** validación centralizada en el servidor, no depende de la configuración local de cada desarrollador, una sola configuración.

**Desventajas:** feedback diferido (hay que esperar al push para saber si algo falla), no evita commits locales con formato incorrecto o mensajes que no siguen la convención, requiere tener el repo en GitHub para funcionar.

---

## Consecuencias

### Positivas
- Cada proyecto valida solo lo que le corresponde
- No hay acoplamiento entre los hooks de backend y frontend
- Fácil de entender: cada `.husky` cuida su propia carpeta

### Negativas
- Si se modifican archivos de ambos proyectos en un mismo commit, corren ambos hooks
- Dos carpetas `.husky` en el repo

---

## Reglas Derivadas

- Backend: `pre-commit` ejecuta `npm run lint && npm run format:check`
- Frontend: `pre-commit` ejecuta `npm run lint && npm run format:check`
- Ambos: `commit-msg` ejecuta `commitlint` para validar que el mensaje siga Conventional Commits
- Husky se instala con `npx husky init` dentro de cada proyecto
- Los hooks solo se ejecutan sobre archivos dentro de su proyecto; los cambios en el otro proyecto los ignora
- Los hooks no bloquean commits de documentación (`docs/`) u otros archivos fuera de `backend/` y `frontend/`
