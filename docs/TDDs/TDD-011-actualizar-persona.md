---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Actualizar Persona
---

# TDD-011: Actualizar Persona

## Contexto de Negocio (PRD)

### Objetivo
Permitir modificar los datos de una persona existente. Usuarios con rol ADMIN o USER pueden actualizar datos siempre que el DNI no entre en conflicto con otra persona.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Corregir el teléfono, dirección o grupo sanguíneo de una persona ya registrada.

### Criterios de Aceptación
*   Usuarios con rol ADMIN o USER pueden actualizar una persona
*   El DNI no puede cambiarse a uno que ya pertenezca a otra persona
*   El grupo sanguíneo debe existir en el catálogo
*   No se puede actualizar una persona soft-deleted
*   Se registra el usuario autenticado como `updatedBy`
*   El formulario de edición debe precargar los datos actuales de la persona
*   Los errores del servidor deben mostrarse en el formulario

## Diseño Técnico (RFC)

### Modelo de Datos

Misma entidad `Persona`. La actualización utiliza `updatedAt` y `updatedById`.

### Contrato de API

*   **Endpoint**: `PUT /api/v1/personas/:id`
*   **Auth**: Requiere sesión activa (roles ADMIN o USER)
*   **Request Body**:
```json
{
  "dni": "12345678",
  "nombre": "Juan Carlos",
  "apellido": "Pérez",
  "fechaNacimiento": "1990-05-15",
  "direccion": "Nueva dirección 456",
  "telefono": "1112345678",
  "grupoSanguineoId": 2
}
```
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "dni": "12345678",
      "nombre": "Juan Carlos",
      "apellido": "Pérez",
      "fechaNacimiento": "1990-05-15T00:00:00.000Z",
      "direccion": "Nueva dirección 456",
      "telefono": "1112345678",
      "grupoSanguineo": { "id": 2, "tipo": "A", "factorRh": "POSITIVO" }
    }
  }
}
```

### Backend

#### Estructura del Código (Backend)

```
backend/src/modules/persona/
├── persona.routes.ts        ← se agrega PUT /:id con authMiddleware
├── persona.controller.ts    ← se agrega handler update()
├── persona.service.ts       ← se agrega actualizar(): validar existencia, DNI único, grupo válido
├── persona.repository.ts    ← se agregan update(), findById(), findByDni() con exclusión
└── persona.schema.ts        ← se agrega actualizarPersonaSchema
```

#### Schema Zod

Se reutiliza el mismo esquema de creación (todos los campos requeridos):

```ts
const actualizarPersonaSchema = z.object({
  dni: z.string().min(7).max(10),
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  fechaNacimiento: z.coerce.date(),
  direccion: z.string().min(1),
  telefono: z.string().min(1),
  grupoSanguineoId: z.number().int().positive(),
})
```

#### Lógica de negocio (service)

`actualizar(id, data, userId)`:
1. `findById(id)` — si no existe o está soft-deleted → `AppError(404, 'Persona no encontrada')`
2. `findByDni(data.dni)` excluyendo el mismo id — si existe → `AppError(409, 'El DNI ya pertenece a otra persona')`
3. `findGrupoSanguineoById(data.grupoSanguineoId)` — si no existe o está soft-deleted → `AppError(404, 'El grupo sanguíneo indicado no existe')`
4. `update(id, { ...data, updatedById: userId })` con `include: { grupoSanguineo: true }`
5. Retorna `toPersonaResponse(persona)`

#### Controller

`update(req, res, next)`:
1. Parsear body con `actualizarPersonaSchema`
2. Llamar `personaService.actualizar(id, data, req.user.id)`
3. Responder `200` con `successResponse({ item })`

### Frontend

#### Contrato de UI

| Acción | Resultado |
|--------|-----------|
| Usuario hace clic en "Editar" en una fila de la tabla | Abre Dialog con el formulario precargado con los datos de la persona, título "Editar persona" |
| Usuario modifica campos y hace clic en "Guardar" | PUT /api/v1/personas/:id, se cierra Dialog, se refresca la lista |
| Error del servidor (DNI duplicado, grupo inválido, persona no encontrada) | Se muestra ErrorAlert dentro del Dialog con el mensaje del backend |
| Error de red | Se muestra ErrorAlert con mensaje genérico |

#### Estructura del Código (Frontend)

Para el caso específico de actualización, los siguientes archivos contienen la lógica que conecta el formulario de edición con el backend:

```
frontend/features/personas/
├── personas.schema.ts              ← reutiliza personaFormInputSchema y personaItemResponseSchema
├── personas.dto.ts                 ← reutiliza parsePersonaResponse()
├── personas-service.ts             ← actualizar() → hace PUT /personas/:id
├── hooks/
│   └── usePersonaDialog.ts         ← handleSave(): distingue crear vs actualizar según editing
└── components/
    ├── persona-dialog.tsx          ← formulario precargado + llamada a onSave + manejo de errores
    └── personas-table.tsx          ← botón "Editar" (Pencil) que setea editing y abre el Dialog
```

##### personas-service.ts

`actualizar(id: number, input: PersonaFormInput): Promise<Persona>`:
1. Llama `api.put(\`/personas/${id}\`, input)` con Axios
2. Pasa la respuesta a `parsePersonaResponse()`
3. Retorna el objeto `Persona` tipado

##### usePersonaDialog.ts

Hook que distingue entre creación y edición:

- `editing: Persona | null` — cuando el usuario hace clic en "Editar" en la tabla, se setea `editing` con la persona seleccionada
- `handleSave(input)`: switchea según `editing`:
  - `editing` tiene valor → llama `personasService.actualizar(editing.id, input)`
  - `editing` es `null` → llama `personasService.crear(input)`
- Al éxito: cierra el Dialog, limpia `editing` y ejecuta `onSuccess?.()` (refresca la lista)
- El `finally` resetea `saving` a false, permitiendo reintentar si hubo error

##### persona-dialog.tsx

El mismo componente sirve para crear y editar. Cuando `editing` no es null:

1. `useEffect` detecta `editing` y dispara `dispatch({ type: 'RESET', values: {...} })` precargando todos los campos desde `editing`
2. La fecha se transforma con `editing.fechaNacimiento.split('T')[0]` para el DatePicker
3. El `grupoSanguineoId` se setea desde `editing.grupoSanguineo.id`
4. El título del Dialog cambia a "Editar persona"
5. Al hacer submit, si el servidor responde con error, el catch lo captura y lo muestra via `ErrorAlert`

##### personas-table.tsx

La columna de acciones incluye un botón "Editar" (`Pencil` icon) que ejecuta `onEditar(row.original)`. Esto propaga la persona seleccionada hacia `page.tsx`, que la pasa a `usePersonaDialog`:

```tsx
<Button variant="ghost" size="icon" onClick={() => onEditar(row.original)}>
  <Pencil className="size-4" />
  <span className="sr-only">Editar</span>
</Button>
```

##### page.tsx (integración)

```tsx
const { editing, setEditing, dialogOpen, setDialogOpen, handleSave, saving } =
  usePersonaDialog(refetch)

// Al hacer clic en "Editar" desde la tabla
onEditar={(p) => { setEditing(p); setDialogOpen(true) }}
```

- `setEditing(p)` guarda la persona a editar en el estado del hook
- `setDialogOpen(true)` abre el Dialog
- `usePersonaDialog` recibe `editing` y lo pasa al `PersonaDialog` para precargar el formulario

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Actualización exitosa | `{ "success": true, "data": { "item": {...} } }` | 200 OK |
| Persona no encontrada (o soft-deleted) | `{ "error": "Persona no encontrada" }` | 404 Not Found |
| DNI duplicado (otra persona) | `{ "error": "El DNI ya pertenece a otra persona" }` | 409 Conflict |
| grupoSanguineoId no existe | `{ "error": "El grupo sanguíneo indicado no existe" }` | 404 Not Found |
| DNI inválido (< 7 o > 10 caracteres) | Error Zod | 400 Bad Request |
| Campos obligatorios vacíos | Error Zod por campo | 400 Bad Request |
| Rol no autorizado (ej. rol futuro sin permisos) | `{ "error": "Acción no permitida. Se requiere rol ADMIN o USER" }` | 403 Forbidden |
| Sin autenticación | `{ "error": "No autenticado" }` | 401 Unauthorized |

## Plan de Implementación

### Backend
1. Agregar `actualizarPersonaSchema` en `persona.schema.ts`
2. Agregar `findById(id)`, `findByDni(dni, excludeId?)` y `update(id, data, userId)` en `persona.repository.ts`
3. Implementar `actualizar(id, data, userId)` en `persona.service.ts` con validaciones
4. Agregar handler `update()` en `persona.controller.ts` con OpenAPI docs
5. Agregar ruta `PUT /:id` con authMiddleware en `persona.routes.ts`
6. Tests de integración: 200 éxito, 404 persona no encontrada, 409 DNI duplicado, 404 grupo inválido, 401 sin auth

### Frontend
1. Implementar `actualizar(id, input)` en `personas-service.ts` que hace PUT /personas/:id
2. Implementar en `usePersonaDialog.ts`: `handleSave()` llama `actualizar()` cuando hay `editing`, caso contrario `crear()`
3. Implementar en `persona-dialog.tsx`: `useEffect` que precarga el formulario cuando `editing` tiene valor, y muestra título "Editar persona"
4. Implementar en `personas-table.tsx`: botón "Editar" por fila que ejecuta `onEditar(row.original)`
5. Integrar en `page.tsx`: pasar `onEditar={(p) => { setEditing(p); setDialogOpen(true) }}` a la tabla
