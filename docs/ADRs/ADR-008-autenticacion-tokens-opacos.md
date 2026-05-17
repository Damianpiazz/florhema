---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Autenticación con Tokens Opacos
---

# ADR-008: Autenticación con Tokens Opacos

## Contexto

Florhema requiere un sistema de autenticación para el personal del hospital. Los criterios clave son:

- Login con usuario y contraseña
- Sesión con duración fija, sin renovación automática
- Logout y cambio de contraseña deben revocar sesiones activas
- Implementación simple, sin depender de servicios externos

---

## Decisión

Se implementa un sistema de **token opaco almacenado en base de datos**. El servidor genera un token aleatorio, almacena su hash SHA-256 en la tabla `Session`, y lo entrega al frontend mediante cookie httpOnly. Cada request autenticado valida el token contra la DB.

---

## Opciones Consideradas

### Opción 1: Token opaco con sesión en DB (seleccionada)

Token aleatorio sin datos embebidos, almacenado como hash SHA-256 en la tabla `Session`.

**Ventajas:** revocación inmediata, sin dependencias externas, sin payload expuesto, invalidación masiva al cambiar contraseña.

**Desventajas:** un lookup a DB por cada request, no escala horizontalmente sin shared store.

### Opción 2: JWT

Token autónomo con payload firmado, verificación sin DB lookup.

**Ventajas:** stateless, escalable horizontalmente, sin consulta a DB en cada request.

**Desventajas:** no se puede revocar antes de expirar sin denylist, payload visible, complejidad extra al implementar revocación.

### Opción 3: express-session con Redis

Sesiones manejadas por `express-session` respaldadas por Redis.

**Ventajas:** middleware ya resuelto, sesiones persistentes fuera de la app.

**Desventajas:** dependencia externa (Redis) para un proyecto pequeño, overhead operativo innecesario.

---

## Consecuencias

### Positivas
- Revocación inmediata al marcar `revokedAt` en la sesión
- Cambio de contraseña revoca todas las sesiones con un `updateMany`
- Sin dependencias externas: solo PostgreSQL y Prisma
- Cookie httpOnly: protegido contra XSS
- Token sin datos sensibles visibles

### Negativas
- Cada request autenticado requiere SELECT a `Session`
- Sesiones expiradas deben limpiarse periódicamente

---

## Impacto en el Sistema

El backend gestiona la creación, validación y revocación de tokens. El frontend recibe el token mediante cookie httpOnly seteada por el backend, sin accederlo desde JavaScript.

---

## Reglas Derivadas

- El token se guarda como hash SHA-256 en DB, nunca en texto plano
- La cookie lleva `httpOnly`, `Secure`, `SameSite=Lax`
- Las sesiones expiradas o revocadas se ignoran en el middleware
- No se almacena el token en localStorage ni sessionStorage
