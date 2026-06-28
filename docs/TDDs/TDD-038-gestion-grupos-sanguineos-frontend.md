---
autor: Damián Piazza
fecha: 2026-06-25
titulo: Gestión de grupos sanguíneos desde el frontend
---

# TDD-038: Gestión de Grupos Sanguíneos — Frontend

## Contexto de Negocio (PRD)

### Objetivo
Crear la interfaz de usuario para administrar los grupos sanguíneos (listar, crear, editar, eliminar). Actualmente el backend tiene CRUD completo (TDD-005 a TDD-008) pero no existe una página de gestión en el frontend. Los grupos se seedan automáticamente (8 combinaciones ABO+Rh) y solo un ADMIN debería poder modificarlos.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia (ADMIN)
*   **Necesidad**: Poder visualizar los grupos sanguíneos registrados y, en caso necesario, corregir nombres o eliminar combinaciones incorrectas.

### Criterios de Aceptación
*   El listado debe mostrar todos los grupos sanguíneos con sus campos `tipo` (A/B/AB/O) y `factorRh` (POSITIVO/NEGATIVO).
*   Un ADMIN debe poder editar un grupo existente.
*   Un ADMIN debe poder eliminar un grupo (soft delete, lógico).
*   La página debe seguir el mismo patrón de UI que las demás tablas del sistema (DataTable con paginación, toolbar).

## Diseño Técnico (RFC)

### Backend (ya implementado)
*   `GET /grupos-sanguineos` — Público, lista todos los grupos activos.
*   `PUT /grupos-sanguineos/:id` — Requiere ADMIN, actualiza tipo/factorRh.
*   `DELETE /grupos-sanguineos/:id` — Requiere ADMIN, soft delete.

### Frontend

#### Página `/grupos-sanguineos`
*   Ruta: `frontend/app/(protected)/grupos-sanguineos/page.tsx`
*   Sigue el mismo patrón que `transfusiones/page.tsx` (orchestrator con DataTable, Form dialog, Delete dialog).

#### Componentes
*   **`grupos-sanguineos-table.tsx`**: DataTable con columnas `tipo`, `factorRh`, acciones (editar/eliminar solo ADMIN). Toolbar con botón "Nuevo grupo".
*   **`grupo-sanguineo-form.tsx`**: Dialog con formulario para crear/editar (select de tipo ABO, select de factor Rh). Reutiliza `gruposSanguineosService`.
*   **`grupo-sanguineo-delete-dialog.tsx`**: Confirmación de eliminación con AlertDialog.

#### Hooks nuevos
*   `useGruposSanguineosList()`: Hook paginado para listar grupos (similar a `useTransfusiones`).
*   `useGruposSanguineosQuery()`: Hook simple para `useQuery` con key `['grupos-sanguineos']` (ya existe parcialmente).

#### Service — Ampliar `gruposSanguineosService`
```typescript
async crear(input: { tipo: string; factorRh: string }): Promise<GrupoSanguineo>
async actualizar(id: number, input: { tipo: string; factorRh: string }): Promise<GrupoSanguineo>
async eliminar(id: number): Promise<void>
```

#### DTO — Ampliar `grupos-sanguineos.dto.ts`
*   `parseCrearResponse`, `parseActualizarResponse` para los schemas de respuesta del backend.

#### Schema — Ampliar `grupos-sanguineos.schema.ts`
*   `crearGrupoSchema`: `z.object({ tipo: z.string(), factorRh: z.string() })`
*   `actualizarGrupoSchema`: similar a crear.
*   Tipos `CrearGrupoInput`, `ActualizarGrupoInput`.

### Menú lateral
Agregar entrada "Grupos Sanguíneos" en `app-sidebar.tsx` con icono `Droplet` entre las opciones existentes.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Crear grupo con tipo y factor ya existentes | Error: combinación duplicada | 409 |
| Editar grupo a una combinación ya existente | Error: combinación duplicada | 409 |
| Eliminar grupo referenciado por personas | Error: entidad en uso (constraint FK) | 409 |
| Usuario no ADMIN intenta crear/editar/eliminar | Error: no autorizado | 403 |
| Sin autenticación | Error: no autenticado | 401 |

## Plan de Implementación
1. Ampliar `gruposSanguineosService` con métodos `crear`, `actualizar`, `eliminar`.
2. Ampliar DTO y schema con los tipos faltantes.
3. Crear hook `useGruposSanguineosList()` con paginación y filtros.
4. Crear `grupos-sanguineos-table.tsx` con DataTable y toolbar.
5. Crear `grupo-sanguineo-form.tsx` con Dialog de creación/edición.
6. Crear `grupo-sanguineo-delete-dialog.tsx` con AlertDialog.
7. Crear `page.tsx` orquestador en `app/(protected)/grupos-sanguineos/`.
8. Agregar entrada en `app-sidebar.tsx`.
9. Tests de integración del flujo completo.
