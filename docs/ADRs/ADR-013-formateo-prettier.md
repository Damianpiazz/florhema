---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Formateo con Prettier Compartido
---

# ADR-013: Formateo con Prettier Compartido

## Contexto

A diferencia del linting, el formateo con Prettier es puramente estilístico (espacios, comillas, punto y coma, etc.). No depende del stack de cada proyecto. Tener dos configuraciones distintas generaría ruido visual en los PRs y discusiones innecesarias sobre formato.

---

## Decisión

Se utiliza una sola configuración de Prettier compartida para backend y frontend.

- Un único archivo `.prettierrc` en la raíz del repositorio
- Un único `.prettierignore` en la raíz
- Ambos proyectos heredan la misma configuración

Si algún proyecto necesita una regla específica, se define por excepción, no por duplicación.

---

## Opciones Consideradas

### Opción 1: Prettier compartido en la raíz — seleccionada

**Ventajas:** consistencia visual en todo el repo, sin ruido por diferencias de formato entre proyectos, un solo archivo que mantener.

**Desventajas:** si un proyecto necesitara una regla diferente (ej. backend con punto y coma y frontend sin), habría que usar overrides.

### Opción 2: Prettier separado por proyecto (como ESLint)

**Ventajas:** cada proyecto define su propio estilo.

**Desventajas:** discusiones de formato cruzadas, PRs con cambios de estilo entre proyectos, más archivos que mantener sin beneficio real.

---

## Consecuencias

### Positivas
- Mismo formato en backend y frontend
- Los PRs solo muestran cambios de código, no de estilo
- Un solo archivo de configuración

### Negativas
- Si un proyecto requiere una regla distinta, se usa override puntual
- Prettier compartido requiere que ambos proyectos tengan la misma versión de Prettier

---

## Reglas Derivadas

- El archivo `.prettierrc` está en la raíz del repositorio
- El archivo `.prettierignore` excluye `node_modules`, `dist`, `.next`, `prisma/migrations`
- Ambos proyectos ejecutan Prettier con la misma configuración
- Si se necesita una excepción, se usa `overrides` en `.prettierrc` por patrón de archivo
