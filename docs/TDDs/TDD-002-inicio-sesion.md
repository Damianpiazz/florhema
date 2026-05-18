---
autor: Damián Piazza
fecha: 2026-05-17
titulo: Inicio de Sesión
---

# TDD-002: Inicio de Sesión

## Contexto de Negocio (PRD)

### Objetivo
Permitir que los usuarios registrados inicien sesión con email y contraseña para obtener un token de acceso al sistema (RF0012).

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Ingresar al sistema al comenzar su turno con sus credenciales personales.

### Criterios de Aceptación
*   El sistema debe autenticar al usuario validando email y contraseña
*   Al autenticarse, debe crear una nueva sesión y devolver un token
*   Si las credenciales son incorrectas, debe rechazar el acceso sin revelar cuál campo es incorrecto
*   Si el usuario está soft-deleted, debe rechazar el acceso

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
*   **Endpoint**: `POST /api/v1/auth/login`
*   **Request Body**:
```json
{
  "email": "tecnico@hospital.com",
  "password": "miPassword123"
}
```
*   **Response** `200 OK`:
```json
{
  "user": { "id": 1, "email": "tecnico@hospital.com", "name": "Facundo Gómez", "role": "USER" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Estructura del Código
```
src/
└── modules/
    └── auth/
        ├── auth.routes.ts        ← define ruta POST /login
        ├── auth.controller.ts    ← handler login()
        ├── auth.service.ts       ← login(): buscar user, verificar password, crear Session
        ├── auth.repository.ts    ← findActiveByEmail()
        └── session.repository.ts ← create()
```

*   **Controller**: recibe email + password del body, delega al service, responde
*   **Service**: busca usuario activo por email, compara password con bcrypt, crea sesión, retorna token
*   **Repository**: `findActiveByEmail` — consulta User excluyendo soft-delete (`deletedAt = null`)

## Casos de Borde y Errores
| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Email inexistente | `{ "error": "Email o contraseña incorrectos" }` | 401 Unauthorized |
| Contraseña incorrecta | `{ "error": "Email o contraseña incorrectos" }` | 401 Unauthorized |
| Usuario soft-deleted | `{ "error": "Email o contraseña incorrectos" }` | 401 Unauthorized |
| Email vacío | `{ "error": "El email es requerido" }` | 400 Bad Request |

## Plan de Implementación
1. Implementar `UserRepository.findActiveByEmail` (filtra `deletedAt = null`)
2. Implementar `AuthService.login` (buscar + verificar password con bcrypt + crear sesión)
3. Implementar `AuthController.login`
4. Agregar ruta `POST /api/v1/auth/login` en `auth.routes.ts`
5. Tests: unitario (credenciales válidas, inválidas, soft-delete), integración con supertest
