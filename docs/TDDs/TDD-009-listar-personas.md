---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Listar Personas
---

# TDD-009: Listar Personas

## Contexto de Negocio (PRD)

### Objetivo
Permitir consultar, crear, editar y eliminar personas del sistema. Es el registro base: una persona se da de alta con sus datos básicos y grupo sanguíneo, y luego puede asociarse a otros roles (donante, paciente, gestante) desde sus respectivos módulos.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Registrar una persona en el sistema con sus datos básicos y grupo sanguíneo, o buscar una existente para consultar/modificar sus datos.

### Criterios de Aceptación
*   Cualquier usuario autenticado puede listar, crear, editar y eliminar personas
*   Soporta búsqueda por DNI (parcial o exacta)
*   Los resultados incluyen el grupo sanguíneo asociado
*   No se incluyen personas soft-deleted
*   Los resultados deben paginarse (limit y offset)

## Diseño Técnico (RFC)

### Modelo de Datos

**Persona** (ya existe en `schema.prisma`)

| Campo | Tipo | Restricciones |
|---|---|---|
| id | Int | PK, autoincrement |
| dni | String | UNIQUE, NOT NULL |
| nombre | String | NOT NULL |
| apellido | String | NOT NULL |
| fechaNacimiento | DateTime | NOT NULL |
| direccion | String | NOT NULL |
| telefono | String | NOT NULL |
| grupoSanguineoId | Int | FK -> GrupoSanguineo |
| createdAt | DateTime | @default(now()) |
| updatedAt | DateTime | @updatedAt |
| deletedAt | DateTime? | |
| createdById | Int? | FK -> User |
| updatedById | Int? | FK -> User |
| deletedById | Int? | FK -> User |

### Contrato de API

*   **Endpoint**: `GET /api/v1/personas?dni=123&limit=10&offset=0`
*   **Auth**: Requiere sesión activa (cualquier rol)
*   **Query params**:
    - `dni` (opcional): búsqueda parcial por DNI (`contains`)
    - `limit` (opcional, default 20, max 100): resultados por página
    - `offset` (opcional, default 0): desplazamiento para paginación
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "dni": "12345678",
        "nombre": "Juan",
        "apellido": "Pérez",
        "fechaNacimiento": "1990-05-15T00:00:00.000Z",
        "direccion": "Av. Siempre Viva 123",
        "telefono": "1112345678",
        "grupoSanguineo": { "id": 1, "tipo": "O", "factorRh": "POSITIVO" }
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### Backend

#### Estructura del Código (Backend)

```
backend/src/modules/persona/
├── persona.routes.ts        ← define rutas GET, POST, PUT, DELETE
├── persona.controller.ts    ← handlers list(), create(), update(), remove()
├── persona.service.ts       ← lógica de negocio
├── persona.repository.ts    ← acceso a datos (findAll, count, create, update, softDelete, etc.)
├── persona.schema.ts        ← schemas Zod
└── persona.dto.ts           ← toPersonaResponse()
```

**Nota**: En este TDD se implementa solo `GET /` (listar). Los endpoints `POST`, `PUT`, `DELETE` se definen en la estructura pero se implementan en TDD-010, TDD-011 y TDD-012 respectivamente.

### Frontend

#### Contrato de UI

**Ruta**: `/personas` — Ruta protegida (requiere autenticación)

La página unifica el CRUD completo de personas en una sola vista usando componentes shadcn:

| Acción | Resultado |
|--------|-----------|
| Usuario accede a `/personas` | Carga inicial de personas (GET /personas), tabla con resultados |
| Usuario escribe en el campo de búsqueda | Filtra por DNI (GET /personas?dni=...) y resetea a página 1 |
| Usuario hace clic en "Nueva persona" | Abre Dialog con formulario vacío |
| Usuario hace clic en "Editar" en una fila | Abre Dialog con datos de la persona para modificar |
| Usuario hace clic en "Guardar" en el Dialog | POST (crear) o PUT (actualizar) según corresponda, cierra Dialog, refresca lista |
| Usuario hace clic en "Eliminar" en una fila | Abre AlertDialog de confirmación |
| Usuario confirma eliminación | DELETE /personas/:id, cierra AlertDialog, refresca lista |
| No hay resultados | Tabla muestra "No se encontraron personas." |
| Error de red | Toast con mensaje de error |
| Usuario no autenticado | Redirige a `/login` |

#### Componentes UI de shadcn requeridos

Agregar con `npx shadcn add`:
- `table`
- `dialog`
- `alert-dialog`
- `pagination`

#### Estructura del Código (Frontend)

```
frontend/src/
└── features/
    └── personas/
        ├── personas.schema.ts         ← Zod schemas de respuesta y formulario
        ├── personas.dto.ts            ← parsePersonaResponse(), parseListarPersonasResponse()
        ├── personas-service.ts        ← listar(), crear(), actualizar(), eliminar()
        ├── hooks/
        │   └── usePersonas.ts         ← estado: query, page, personas, total, editing, dialog, deleteId
        └── components/
            ├── personas-table.tsx         ← Tabla con búsqueda y paginación
            ├── persona-dialog.tsx         ← Dialog crear/editar
            └── persona-delete-dialog.tsx  ← AlertDialog confirmación
app/
└── personas/
    └── page.tsx                       ← Página protegida que orquesta componentes
```

**personas-service.ts**:
```ts
export const personasService = {
  async listar(params: { dni?: string; limit?: number; offset?: number }) {
    const { data } = await api.get('/personas', { params })
    return parseListarPersonasResponse(data)
  },

  async crear(input: CrearPersonaInput) {
    const { data } = await api.post('/personas', input)
    return parsePersonaResponse(data)
  },

  async actualizar(id: number, input: ActualizarPersonaInput) {
    const { data } = await api.put(`/personas/${id}`, input)
    return parsePersonaResponse(data)
  },

  async eliminar(id: number) {
    await api.delete(`/personas/${id}`)
  }
}
```

**Nota**: `crear()`, `actualizar()` y `eliminar()` se definen en TDD-009 para que el frontend esté completo e integrado desde el inicio, pero los endpoints del backend se implementan en TDD-010, TDD-011 y TDD-012 respectivamente.

**usePersonas.ts**:
```ts
const [query, setQuery] = useState('')
const [page, setPage] = useState(1)
const [personas, setPersonas] = useState<Persona[]>([])
const [total, setTotal] = useState(0)
const [loading, setLoading] = useState(false)
const [editing, setEditing] = useState<Persona | null>(null)
const [dialogOpen, setDialogOpen] = useState(false)
const [deleteId, setDeleteId] = useState<number | null>(null)
```

- `buscar()`: resetea a page 1, llama `listar({ dni: query })`, actualiza estado
- `handleSave()`: si `editing` tiene id → `actualizar()`, si no → `crear()`, luego cierra dialog y refresca
- `handleDelete()`: llama `eliminar(deleteId)`, limpia deleteId, refresca
- `useEffect` que llama `buscar()` cuando cambia `page` o `query` (con debounce)

**personas-table.tsx** (usando componentes shadcn):
- Header con input de búsqueda por DNI con icono `Search` de lucide-react + botón "Nueva persona" con icono `Plus`
- Cuerpo con `<Table>`:
  - `<TableHeader>`: DNI, Nombre, Apellido, Grupo Sanguíneo, Acciones (120px, alineado derecha)
  - `<TableBody>`: filas con datos + botones Editar (`Pencil`) y Eliminar (`Trash2` color destructive)
  - Fila vacía con `colSpan=5`: "No se encontraron personas."
- Footer con `<Pagination>` y texto "X resultados":
```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} />
    </PaginationItem>
    {Array.from({ length: totalPages }).map((_, i) => (
      <PaginationItem key={i}>
        <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>
          {i + 1}
        </PaginationLink>
      </PaginationItem>
    ))}
    <PaginationItem>
      <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

**persona-dialog.tsx** (usando shadcn Dialog):
```tsx
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{editing ? "Editar persona" : "Nueva persona"}</DialogTitle>
      <DialogDescription>Completá los datos de la persona.</DialogDescription>
    </DialogHeader>
    <form>
      {/* DNI */}
      <Field>
        <FieldLabel>DNI</FieldLabel>
        <Input value={form.dni} onChange={...} inputMode="numeric" />
      </Field>
      {/* Nombre + Apellido en grid cols-2 */}
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel>Nombre</FieldLabel>
          <Input value={form.nombre} onChange={...} />
        </Field>
        <Field>
          <FieldLabel>Apellido</FieldLabel>
          <Input value={form.apellido} onChange={...} />
        </Field>
      </div>
      {/* Fecha de Nacimiento */}
      <Field>
        <FieldLabel>Fecha de Nacimiento</FieldLabel>
        <Input type="date" value={form.fechaNacimiento} onChange={...} />
      </Field>
      {/* Dirección */}
      <Field>
        <FieldLabel>Dirección</FieldLabel>
        <Input value={form.direccion} onChange={...} />
      </Field>
      {/* Teléfono */}
      <Field>
        <FieldLabel>Teléfono</FieldLabel>
        <Input value={form.telefono} onChange={...} inputMode="tel" />
      </Field>
      {/* Grupo Sanguíneo (select) - cargado desde GET /grupos-sanguineos */}
      <Field>
        <FieldLabel>Grupo Sanguíneo</FieldLabel>
        <select>...</select>
      </Field>
    </form>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
      <Button onClick={handleSave}>Guardar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**persona-delete-dialog.tsx** (usando shadcn AlertDialog):
```tsx
<AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Eliminar persona?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta acción no se puede deshacer. La persona será eliminada permanentemente.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Eliminar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Patrón de respuesta

Lista paginada con metadatos:
- `items`: array de personas con grupoSanguineo embebido
- `total`: cantidad total de resultados (sin paginación)
- `limit`: límite aplicado
- `offset`: offset aplicado

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|---|---|---|
| Sin resultados | `{ "data": { "items": [], "total": 0 } }` | 200 OK |
| Búsqueda por DNI parcial | Retorna personas cuyo DNI contenga el valor | 200 OK |
| Sin autenticación | `{ "error": "No autenticado" }` | 401 Unauthorized |
| limit excede máximo (100) | Se ajusta a 100 sin error | 200 OK |

## Plan de Implementación

### Backend
1. Definir `persona.schema.ts` con `personaResponseSchema` (incluye grupoSanguineo embebido) y query params schema
2. Implementar `persona.dto.ts` con `toPersonaResponse()`
3. Implementar `persona.repository.ts` con `findAll(filters)`, `count(filters)`
4. Implementar `persona.service.ts` con `listar({ dni, limit, offset })`
5. Implementar `persona.controller.ts` con `list()`
6. Definir `persona.routes.ts` con `GET /` y authMiddleware
7. Montar rutas en `src/routes/index.ts`
8. Tests: integración con supertest (lista completa, búsqueda por DNI, paginación, sin auth)

### Frontend
9. Agregar componentes shadcn: `npx shadcn add table dialog alert-dialog pagination`
10. Crear `personas.schema.ts` con schemas de response y formulario
11. Crear `personas.dto.ts` con `parsePersonaResponse()` y `parseListarPersonasResponse()`
12. Crear `personas-service.ts` con `listar()`, `crear()`, `actualizar()`, `eliminar()`
13. Crear `usePersonas.ts` con estado de búsqueda, paginación, diálogos y operaciones CRUD
14. Crear `personas-table.tsx` con tabla responsive, búsqueda y paginación
15. Crear `persona-dialog.tsx` con formulario de crear/editar
16. Crear `persona-delete-dialog.tsx` con confirmación de eliminación
17. Crear `app/personas/page.tsx` como página protegida que orquesta los componentes
18. Tests: service llama al endpoint correcto, hook maneja estados, componentes renderizan
