---
autor: gentle-ai
fecha: 2026-06-26
titulo: Gestión de Usuarios por Administrador
---

# TDD-042: Gestión de Usuarios por Administrador

## Contexto de Negocio (PRD)

### Objetivo
Permitir que un usuario con rol **ADMIN** administre los usuarios del sistema: crear nuevos usuarios (técnicos, licenciados), listarlos, editarlos (nombre, email, rol) y eliminarlos (soft-delete). Hoy no existe forma de dar de alta usuarios excepto por base de datos directa. El registro público fue eliminado (ver TDD-001).

### User Persona
*   **Nombre**: Administrador del sistema / Jefe de Servicio
*   **Necesidad**: Poder dar de alta a los técnicos y licenciados que operan el sistema, asignarles su rol, modificar datos cuando cambian y desactivar cuentas cuando alguien se va del servicio. Todo debe quedar trazado en auditoría.

### Criterios de Aceptación
*   El ADMIN puede listar todos los usuarios del sistema con paginación y búsqueda por email/nombre
*   El ADMIN puede crear un usuario indicando email, contraseña, nombre y rol
*   El ADMIN puede editar nombre, email y rol de un usuario existente (nunca la contraseña desde este flujo)
*   El ADMIN puede eliminar (soft-delete) un usuario — la cuenta deja de funcionar pero los registros históricos se conservan
*   El ADMIN **no puede** eliminarse a sí mismo ni cambiar su propio rol
*   Cada operación queda registrada en `AuditLog`
*   El frontend tiene una página `/usuarios` accesible solo para ADMIN, con tabla estilo "donantes" (búsqueda, paginación, acciones)
*   La sidebar muestra "Usuarios" solo si el usuario logueado es ADMIN

## Diseño Técnico (RFC)

### Modelo de Datos

Se utiliza el modelo `User` existente en Prisma. No requiere migraciones.

| Campo | Tipo | Restricciones |
|---|---|---|
| id | Int | PK, autoincrement |
| email | String | UNIQUE, NOT NULL |
| password | String | NOT NULL |
| role | Role (ADMIN, USER, INVITADO) | DEFAULT USER |
| name | String? | |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| deletedAt | DateTime? | Soft-delete |

### Contrato de API

Todas las rutas requieren `authMiddleware` + `adminMiddleware`.

#### `GET /api/v1/usuarios`

Listar usuarios con paginación y búsqueda opcional.

**Query Params**: `?page=1&pageSize=10&search=email o nombre`

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": 1, "email": "tecnico@hospital.com", "name": "Facundo Gómez", "role": "USER", "createdAt": "..." }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```
La respuesta **NUNCA incluye el campo password**, ni aunque sea null.

#### `POST /api/v1/usuarios`

Crear un nuevo usuario.

**Request Body**:
```json
{
  "email": "nuevo@hospital.com",
  "password": "TempPass123",
  "name": "Nuevo Técnico",
  "role": "USER"
}
```

**Response `201 Created`**:
```json
{
  "success": true,
  "data": { "user": { "id": 2, "email": "nuevo@hospital.com", "name": "Nuevo Técnico", "role": "USER" } }
}
```

**Errores**:
| Escenario | Código | Mensaje |
|---|---|---|
| Email ya registrado | 409 | "El email ya está registrado" |
| Rol inválido | 400 | "Rol inválido. Use ADMIN, USER o INVITADO" |
| Password < 6 caracteres | 400 | "La contraseña debe tener al menos 6 caracteres" |

#### `PATCH /api/v1/usuarios/:id`

Actualizar nombre, email y/o rol de un usuario. **No permite cambiar la contraseña**.

**Request Body** (todos opcionales):
```json
{
  "email": "nuevo-email@hospital.com",
  "name": "Nombre Actualizado",
  "role": "ADMIN"
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "data": { "user": { "id": 1, "email": "...", "name": "...", "role": "ADMIN" } }
}
```

**Reglas de negocio**:
- Si el usuario autenticado es el mismo que `:id`, NO permite cambiar `role` — responde `403 Forbidden`
- Si se cambia el email, valida unicidad — responde `409 Conflict`
- Si `:id` no existe o está soft-deleteado — responde `404 Not Found`

#### `DELETE /api/v1/usuarios/:id`

Soft-delete de un usuario (setea `deletedAt`).

**Response `200 OK`**:
```json
{ "success": true, "data": { "message": "Usuario eliminado" } }
```

**Reglas de negocio**:
- Si el usuario autenticado es el mismo que `:id` — responde `403 Forbidden` ("No puedes eliminar tu propio usuario")
- Si el usuario ya está eliminado — responde `404 Not Found`
- El soft-delete revoca todas las sesiones activas de ese usuario

### Estructura del Código

**Backend** (nuevo módulo `usuarios`):

```
backend/src/modules/usuarios/
├── usuarios.routes.ts         ← GET /, POST /, PATCH /:id, DELETE /:id
├── usuarios.controller.ts     ← handlers listar(), crear(), actualizar(), eliminar()
├── usuarios.service.ts        ← lógica de negocio con validaciones (auto-protección, unicidad)
├── usuarios.schema.ts         ← Zod schemas para crear/actualizar usuario
├── usuarios.dto.ts            ← mapeo User → response (NUNCA incluir password)
└── usuarios.repository.ts     ← listar (con paginación y búsqueda), findById, crear, actualizar, softDelete
```

**Frontend** (nueva feature `usuarios`):

```
frontend/features/usuarios/
├── components/
│   ├── usuarios-table.tsx     ← tabla con columnas email, nombre, rol, creado, acciones
│   └── usuario-form.tsx       ← modal/dialog para crear/editar
├── hooks/
│   └── useUsuarios.ts         ← estado de búsqueda, paginación
├── usuarios-service.ts        ← llamadas CRUD a la API
├── usuarios.dto.ts            ← mapeo de respuesta
└── usuarios.schema.ts         ← tipos compartidos

frontend/app/(protected)/usuarios/
└── page.tsx                   ← página con tabla + form + delete dialog
```

### Seguridad

| Regla | Detalle |
|---|---|
| Protección de ruta | Todas las rutas llevan `authMiddleware` + `adminMiddleware` |
| Auto-protección | No puedes eliminarte a ti mismo ni cambiar tu propio rol |
| Password nunca en response | El DTO excluye explícitamente el campo password |
| Auditoría | Cada CREATE / UPDATE / DELETE se registra en AuditLog |
| Sesiones revocadas | Al soft-delete, se revocan todas las sesiones activas del usuario |

## Casos de Borde y Errores

### Backend

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| ADMIN se elimina a sí mismo | "No puedes eliminar tu propio usuario" | 403 Forbidden |
| ADMIN cambia su propio rol | "No puedes cambiar tu propio rol" | 403 Forbidden |
| Email duplicado al crear | "El email ya está registrado" | 409 Conflict |
| Email duplicado al actualizar | "El email ya está registrado" | 409 Conflict |
| Usuario no encontrado | "Usuario no encontrado" | 404 Not Found |
| Usuario ya eliminado | "Usuario no encontrado" | 404 Not Found |
| Usuario sin sesión | "No autenticado" | 401 Unauthorized |
| Usuario no ADMIN | "Acción no permitida. Se requiere rol ADMIN" | 403 Forbidden |
| Password < 6 caracteres | "La contraseña debe tener al menos 6 caracteres" | 400 Bad Request |

### Frontend

| Escenario | Comportamiento |
|---|---|
| Usuario no ADMIN accede a /usuarios | Redirige al home o muestra 403 |
| Búsqueda sin resultados | "No se encontraron usuarios" en tabla vacía |
| Error al crear (email duplicado) | Mensaje en el dialog: "El email ya está registrado" |
| Error de red | "Error del servidor. Intente nuevamente." |
| Confirmación antes de eliminar | Dialog de confirmación: "¿Eliminar usuario X?" |
| Eliminación exitosa | Cierra dialog, refresca tabla, toast de éxito |
| Carga | Tabla con skeleton/spinner |

## Plan de Implementación

### Backend
1. Crear `usuarios.schema.ts` con `crearUsuarioSchema`, `actualizarUsuarioSchema`, `usuarioResponseSchema`
2. Crear `usuarios.dto.ts` con `toUserResponse()` (excluye password siempre)
3. Crear `usuarios.repository.ts` con `listar()`, `findById()`, `findByEmail()`, `crear()`, `actualizar()`, `softDelete()`
   - `listar()` recibe `{ page, pageSize, search? }`, busca por email o nombre con `contains` + paginación
4. Crear `usuarios.service.ts`:
   - `listar()` → delega al repository
   - `crear()` → valida email único, hashea password, crea usuario, registra audit log
   - `actualizar()` → verifica auto-protección (rol), valida email único si cambió, actualiza, audit log
   - `eliminar()` → verifica auto-protección, soft-delete, revoca sesiones, audit log
5. Crear `usuarios.controller.ts` con `listar`, `crear`, `actualizar`, `eliminar`
6. Crear `usuarios.routes.ts` con las 4 rutas, montar en `routes/index.ts` como `/usuarios`
7. Tests: unitarios del service, integración con supertest

### Frontend
8. Crear `features/usuarios/` con schema types y service
9. Crear hook `useUsuarios` con estado de búsqueda y paginación
10. Implementar `usuarios-table.tsx` con TanStack Table, columnas: email, nombre, rol (badge), creado, acciones (editar/eliminar)
11. Implementar `usuario-form.tsx` como Sheet o Dialog con campos email, password (solo crear), nombre, rol (select)
12. Implementar delete dialog de confirmación
13. Crear página `app/(protected)/usuarios/page.tsx`
14. Agregar entrada "Usuarios" en la sidebar (`app-sidebar.tsx`) con icono `Shield`, visible solo si `user.role === 'ADMIN'`
