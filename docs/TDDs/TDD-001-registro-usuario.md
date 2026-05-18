---
autor: Damián Piazza
fecha: 2026-05-17
titulo: Registro de Usuario
---

# TDD-001: Registro de Usuario

## Contexto de Negocio (PRD)

### Objetivo
Permitir que un técnico o licenciado de Hemoterapia cree su cuenta en el sistema con email y contraseña personal, para que quede registrado como responsable de todas sus operaciones (RF0012).

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Crear una cuenta para poder operar el sistema y que todas sus cargas queden trazadas con su identidad.

### Criterios de Aceptación
*   El sistema debe crear un usuario con email, password y nombre
*   El email debe ser único en el sistema
*   La contraseña debe almacenarse hasheada (nunca en texto plano)
*   Al registrarse, debe devolver un token de sesión para que el usuario quede autenticado

## Diseño Técnico (RFC)

### Modelo de Datos

**User**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | Int | PK, autoincrement |
| email | String | UNIQUE, NOT NULL |
| password | String | NOT NULL |
| role | Role (enum) | DEFAULT USER |
| name | String? | |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| deletedAt | DateTime? | |
| createdById | Int? | FK -> User |
| updatedById | Int? | FK -> User |
| deletedById | Int? | FK -> User |

**Session**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | Int | PK, autoincrement |
| userId | Int | FK -> User, onDelete Cascade |
| tokenHash | String | NOT NULL |
| createdAt | DateTime | @default(now()) |
| expiresAt | DateTime | NOT NULL |
| revokedAt | DateTime? | |

### Contrato de API
*   **Endpoint**: `POST /api/v1/auth/register`
*   **Request Body**:
```json
{
  "email": "tecnico@hospital.com",
  "password": "miPassword123",
  "name": "Facundo Gómez"
}
```
*   **Response** `201 Created`:
```json
{
  "user": { "id": 1, "email": "tecnico@hospital.com", "name": "Facundo Gómez", "role": "USER" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Estructura del Código
```
src/
├── middleware/
│   └── auth.middleware.ts        ← validación de token (se usa en TDD-003/004)
└── modules/
    └── auth/
        ├── auth.routes.ts        ← define ruta POST /register
        ├── auth.controller.ts    ← handler register()
        ├── auth.service.ts       ← register(): hash password, crear User + Session
        ├── auth.repository.ts    ← findByEmail(), create()
        └── session.repository.ts ← create()
```

*   **Middleware** (`src/middleware/auth.middleware.ts`): extrae token del header `Authorization`, busca Session en BD, valida vigencia, inyecta `req.user`
*   **Routes**: define los endpoints del módulo y conecta con el controlador
*   **Controller**: recibe el request, delega al service, responde
*   **Service**: lógica de negocio — hashear password, crear usuario, crear sesión, generar token
*   **Repository**: consultas Prisma — `findByEmail`, `create` para User; `create` para Session

## Casos de Borde y Errores
| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Email ya registrado | `{ "error": "El email ya está registrado" }` | 409 Conflict |
| Email inválido (sin @) | `{ "error": "Email inválido" }` | 400 Bad Request |
| Password < 6 caracteres | `{ "error": "La contraseña debe tener al menos 6 caracteres" }` | 400 Bad Request |
| Email vacío | `{ "error": "El email es requerido" }` | 400 Bad Request |

## Plan de Implementación
1. Implementar `UserRepository.findByEmail` y `UserRepository.create`
2. Implementar `SessionRepository.create` (con token generado vía crypto)
3. Implementar `AuthService.register` (hash password + crear user + crear sesión)
4. Implementar `AuthController.register`
5. Agregar ruta `POST /api/v1/auth/register` en `auth.routes.ts` y montar en app.ts
6. Tests: unitario de AuthService.register, integración del endpoint con supertest
