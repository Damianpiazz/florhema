---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Roles de Usuario y Control de Acceso
---

# ADR-009: Roles de Usuario y Control de Acceso

## Contexto

Florhema requiere un modelo de autorización que defina qué puede hacer cada usuario dentro del sistema según su rol. Se identifican tres perfiles con distintos niveles de acceso:

- **Personal de Hemoterapia** — operadores que gestionan donantes, pacientes, transfusiones y reportes
- **Personal de Maternidad** — solo necesita consultar si el estudio de gestantes está finalizado, sin modificar nada
- **Administradores** — responsables de gestionar usuarios y supervisar el sistema

---

## Decisión

Se definen tres roles con las siguientes reglas de acceso:

| Rol | Alcance |
|---|---|
| `admin` | Acceso total al sistema. Puede crear, leer, actualizar y eliminar cualquier recurso incluyendo usuarios. |
| `user` | CRUD completo sobre los módulos del dominio (donantes, pacientes, gestantes, donaciones, transfusiones, estudios, reportes). No puede acceder a administración de usuarios ni modificar otros usuarios. |
| `invitado` | Solo lectura, exclusivamente en el módulo de gestantes. Puede buscar una paciente gestante y visualizar si el estudio de grupo y factor está finalizado (CU-08). No puede crear, editar ni eliminar registros. |

---

## Opciones Consideradas

### Opción 1: Control por roles (RBAC) — seleccionada

Cada usuario tiene un rol asignado. Los endpoints verifican el rol mediante middleware antes de ejecutar la acción.

**Ventajas:** modelo simple y predecible, fácil de auditar, los permisos se entienden rápido.

**Desventajas:** no permite permisos granulares por recurso si el sistema crece mucho.

### Opción 2: Permisos individuales (ABAC)

Cada acción tiene permisos atómicos asignables por usuario.

**Ventajas:** máximo control granular.

**Desventajas:** sobreingeniería para la escala actual, complejidad innecesaria de gestión.

---

## Consecuencias

### Positivas
- Modelo claro: cada rol sabe exactamente qué puede hacer
- Fácil de implementar con un middleware de rol
- El invitado tiene acceso acotado que cubre el CU-08 sin exponer el resto del sistema

### Negativas
- Si aparecen nuevos perfiles con permisos mixtos, puede requerir más roles o migrar a ABAC
- El user no puede gestionar usuarios, lo que obliga al admin a hacerlo

---

## Impacto en el Sistema

- Cada endpoint protegido indica qué roles pueden acceder
- `invitado` solo tiene habilitados los GET del módulo de gestantes
- `user` tiene GET, POST, PUT, DELETE en los módulos del dominio, pero no en los endpoints de admin de usuarios
- `admin` no tiene restricciones

---

## Reglas Derivadas

- El rol se asigna al crear el usuario y puede cambiarlo solo otro admin
- El middleware de rol se aplica después del middleware de autenticación
- El frontend oculta botones y acciones no permitidas según el rol del usuario logueado
- `invitado` no ve ningún módulo que no sea gestantes
- Si en el futuro se necesitan más roles, se agregan al enum sin modificar la lógica base
