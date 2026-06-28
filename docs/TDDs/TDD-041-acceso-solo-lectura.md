---
autor: Damián Piazza
fecha: 2026-06-25
titulo: Acceso de solo lectura para áreas externas
---

# TDD-041: Acceso de solo lectura para áreas externas (RF0014)

## Contexto de Negocio (PRD)

### Objetivo
Proporcionar vistas de solo lectura para servicios externos como Maternidad, permitiendo a sus profesionales visualizar en tiempo real si los estudios de sus pacientes ya fueron completados, sin otorgarles permisos de edición (CU-08).

### User Persona
*   **Nombre**: Personal de Maternidad (Usuario de Consulta)
*   **Necesidad**: Poder consultar si el estudio de grupo y factor de una paciente gestante ya está finalizado, sin tener que llamar por teléfono al servicio de Hemoterapia durante los fines de semana. No debe poder modificar ningún dato.

### Criterios de Aceptación
*   El sistema debe tener un rol `INVITADO` (ya existe en el schema, enum `Role`).
*   Un usuario con rol `INVITADO` solo puede hacer `GET` a los endpoints — cualquier `POST`, `PUT`, `DELETE` debe ser rechazado.
*   Un usuario `INVITADO` solo puede ver personas, donantes, pacientes, gestantes, estudios y recién nacidos. No puede ver usuarios, auditoría, ni configuración.
*   El frontend debe ocultar todos los botones de crear, editar, eliminar para usuarios `INVITADO`.
*   El menú lateral debe mostrar solo las secciones permitidas.

## Diseño Técnico (RFC)

### Backend

#### Middleware de solo lectura
Crear un middleware `readOnlyMiddleware.ts` que intercepte cualquier método que no sea `GET` y devuelva 403 si el usuario tiene rol `INVITADO`:

```typescript
import type { Request, Response, NextFunction } from 'express'
import { AppError } from '@/utils/app-error'

export function readOnlyMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.method !== 'GET' && req.user?.role === 'INVITADO') {
    return next(new AppError(403, 'Acción no permitida: el usuario es de solo lectura'))
  }
  next()
}
```

Este middleware se aplica a nivel global (en las rutas montadas) o se puede componer con `authMiddleware`.

#### Aplicación en rutas
```typescript
// En app.ts o router principal
app.use('/api/v1/personas', authMiddleware, readOnlyMiddleware, personaRoutes)
app.use('/api/v1/donantes', authMiddleware, readOnlyMiddleware, donanteRoutes)
app.use('/api/v1/donaciones', authMiddleware, readOnlyMiddleware, donacionRoutes)
app.use('/api/v1/transfusiones', authMiddleware, readOnlyMiddleware, transfusionRoutes)
app.use('/api/v1/gestantes', authMiddleware, readOnlyMiddleware, gestanteRoutes)
app.use('/api/v1/estudios-gestante', authMiddleware, readOnlyMiddleware, estudioGestanteRoutes)
app.use('/api/v1/recien-nacidos', authMiddleware, readOnlyMiddleware, recienNacidoRoutes)
app.use('/api/v1/pacientes', authMiddleware, readOnlyMiddleware, pacienteRoutes)
```

Rutas excluidas (solo ADMIN/USER):
```typescript
app.use('/api/v1/grupos-sanguineos', authMiddleware, readOnlyMiddleware, grupoSanguineoRoutes)
// Auth siempre requiere autenticación
// Audit solo ADMIN
```

#### Alternativa: granular por ruta
En lugar de un middleware global, se puede decorar cada ruta individual:
```typescript
router.get('/', list)  // Todos los roles autenticados
router.post('/', authMiddleware, adminOnly, create)  // Solo ADMIN/USER
```

La primera opción (middleware global) es más simple y DRY.

### Frontend

#### Hook `usePermissions`
```typescript
function usePermissions() {
  const { user } = useAuth()
  return {
    isReadOnly: user?.role === 'INVITADO',
    canEdit: user?.role === 'ADMIN' || user?.role === 'USER',
    isAdmin: user?.role === 'ADMIN',
  }
}
```

#### Ocultamiento de acciones
En todas las tablas del frontend, las columnas de acciones y botones de toolbar deben evaluar `isReadOnly`:

```typescript
// toolbar
{!isReadOnly && (
  <Button onClick={handleNuevo}>
    <Plus className="size-4" />
    Nuevo
  </Button>
)}

// columna de acciones
{!isReadOnly && (
  <>
    <Button variant="ghost" size="icon" onClick={() => onEditar(row.original)}>
      <Pencil className="size-4" />
    </Button>
    <Button variant="ghost" size="icon" onClick={() => onEliminar(row.original.id)}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  </>
)}
```

#### Menú lateral adaptativo
En `app-sidebar.tsx`, ocultar secciones que el `INVITADO` no deba ver (ej: "Grupos Sanguíneos" si es solo ADMIN, "Auditoría", etc.).

### Permisos por sección

| Sección | ADMIN | USER | INVITADO |
|---------|-------|------|----------|
| Personas (CRUD) | FULL | FULL | Solo GET |
| Donantes | FULL | FULL | Solo GET |
| Donaciones | FULL | FULL | Solo GET |
| Transfusiones | FULL | FULL | Solo GET |
| Gestantes | FULL | FULL | Solo GET |
| Estudios Gestante | FULL | FULL | Solo GET |
| Recién Nacidos | FULL | FULL | Solo GET |
| Pacientes | FULL | FULL | Solo GET |
| Grupos Sanguíneos | FULL | Solo GET | Solo GET |
| Reportes | FULL | FULL | FULL |
| Auditoría | FULL | Oculto | Oculto |
| Usuarios | FULL | Oculto | Oculto |

### Pantalla de inicio para INVITADO
Al iniciar sesión, un usuario `INVITADO` debe ser redirigido directamente a `/personas` (solo lectura). No debe ver opciones de administración en el sidebar.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| INVITADO intenta crear persona | 403 Forbidden | 403 |
| INVITADO intenta eliminar donación | 403 Forbidden | 403 |
| INVITADO intenta acceder a /reportes | Permitido (GET) | 200 |
| INVITADO intenta acceder a ruta admin (ej: usuarios) | 403 o 404 | 403 |
| USER intenta eliminar (sin ser ADMIN) | Depende de la ruta — algunas permiten USER, otras solo ADMIN | 403 |

## Plan de Implementación
1. Crear `readOnlyMiddleware.ts` en backend.
2. Aplicar el middleware a las rutas de negocio en `app.ts`.
3. Crear hook `usePermissions` en frontend.
4. Agregar condición `isReadOnly` en toolbar y columnas de acciones de cada tabla:
   - `personas-table.tsx`, `donantes-table.tsx`, `donaciones-table.tsx`, `transfusiones-table.tsx`
   - `gestantes-table.tsx`, `estudios-gestantes-table.tsx`, `recien-nacidos-table.tsx`, `pacientes-table.tsx`
5. Ocultar entradas del menú lateral para INVITADO.
6. Tests de integración del middleware (5+ escenarios).
7. Crear usuario de prueba con rol INVITADO y verificar flujo completo.
