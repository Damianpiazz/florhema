# Guia de Contribucion - Florhema

Gracias por querer contribuir a Florhema. Para mantener el codigo limpio y organizado, segui estas reglas de contribucion.

---

## Estrategia de Ramas (Branching)

No se permite pushear directamente a la rama `main`. Todas las contribuciones deben hacerse a traves de **Feature Branches**.

### Formato de nombres de rama

- `feature/nombre-de-la-funcionalidad` (para nuevas caracteristicas)
- `fix/descripcion-del-error` (para correccion de bugs)
- `docs/mejoras-en-documentacion` (para cambios en docs)
- `refactor/nombre-del-cambio` (para mejoras de codigo sin cambio de logica)

---

## Flujo de Trabajo (Workflow)

1. **Sincronizar**: Asegurate de tener la ultima version de `main`:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Crear Rama**: Crea tu rama de trabajo:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

3. **Desarrollar**: Escribe tu codigo siguiendo los estandares del proyecto.

4. **Verificar**: Antes de subir tus cambios, todos los tests deben pasar:
   - `npm run test` (unitarios)
   - `npm run lint` (linting)

5. **Commit**: Realiza commits descriptivos siguiendo la convencion de commits (ver seccion siguiente).

6. **Pull Request (PR)**: Sube tu rama y abre un PR hacia `main`. Inclui la plantilla de PR detallada abajo.

---

## Convencion de Commits (Conventional Commits)

Usamos [Conventional Commits](https://www.conventionalcommits.org/) con el siguiente formato:

```
<tipo>(<scope>): <descripcion>
```

### Tipos

- `feat`: Nueva funcionalidad
- `fix`: Correccion de error
- `docs`: Cambios en documentacion
- `refactor`: Cambio de codigo que no agrega funcionalidad ni corrige errores
- `test`: Agregar o modificar tests
- `chore`: Cambios en build, tooling o dependencias
- `style`: Cambios de formato que no afectan la logica
- `perf`: Mejoras de rendimiento

### Scope

Indica el modulo o area afectada. Ejemplos:

- `backend`
- `frontend`
- `api`
- `donantes`
- `auth`
- `db`
- `config`
- `readme`

### Descripcion

En espanol, en modo imperativo, sin mayuscula inicial y sin punto final.

### Ejemplos

```
feat(backend): agregar endpoint de creacion de donantes
fix(frontend): corregir validacion de formulario de login
docs(readme): actualizar instrucciones de instalacion
refactor(api): extraer logica de autenticacion a middleware
feat(donantes): agregar busqueda por filtro de fecha
chore(backend): actualizar dependencias de prisma
```

---

## Estandares de Codigo

- **Linting**: Ejecuta `npm run lint` antes de cada commit.
- **Tipado**: No usar `any` en TypeScript. Definir interfaces o tipos para todo.
- **Documentacion**: Si agregas una funcionalidad compleja o cambias la estructura existente, actualiza la documentacion correspondiente (`ARCHITECTURE.md`, `README.md`, etc.).
- **Tests**: Toda funcionalidad nueva debe incluir tests unitarios o de integracion segun corresponda.

---

## Template para Pull Requests

Cada Pull Request debe incluir la siguiente estructura en la descripcion:

```markdown
## Descripcion

<!-- Explica que cambios introduces y por que son necesarios -->

## Tipo de cambio

- [ ] feat: nueva funcionalidad
- [ ] fix: correccion de error
- [ ] docs: cambios en documentacion
- [ ] refactor: mejora de codigo sin cambio de logica
- [ ] test: cambios en tests
- [ ] chore: tooling o dependencias

## Como se probo

<!-- Describe los pasos para verificar los cambios -->

## Checklist

- [ ] Los tests locales pasan
- [ ] El linting pasa
- [ ] Se siguio la convencion de commits
- [ ] La rama tiene un nombre descriptivo
- [ ] Se eliminaron console.log o comentarios innecesarios
- [ ] Se actualizo la documentacion si era necesario
```

---

## Checklist para Pull Requests

Antes de abrir un PR, verifica lo siguiente:

- [ ] Pasan todos los tests locales?
- [ ] El linting pasa sin errores?
- [ ] La rama tiene un nombre descriptivo segun el formato definido?
- [ ] Los commits siguen la convencion Conventional Commits?
- [ ] Se eliminaron `console.log` o comentarios innecesarios?
- [ ] Se actualizo la documentacion si era necesario?
- [ ] El PR incluye la descripcion con el template completo?
