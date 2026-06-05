---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Crear Persona
---

# TDD-010: Crear Persona

## Contexto de Negocio (PRD)

### Objetivo
Permitir registrar una nueva persona en el sistema con sus datos básicos y grupo sanguíneo. Una persona es el registro base para luego asignarla como donante, paciente o gestante.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Cargar los datos de una persona que llega al servicio para luego registrarla como donante, paciente o gestante.

### Criterios de Aceptación
*   Usuarios con rol ADMIN o USER pueden crear una persona
*   El DNI debe ser único en el sistema
*   El grupo sanguíneo debe existir en el catálogo (FK válida)
*   Todos los campos obligatorios deben validarse
*   Se registra el usuario autenticado como `createdBy`
*   El formulario de creación debe mostrar errores del servidor (DNI duplicado, grupo inválido)

## Diseño Técnico (RFC)

### Modelo de Datos
Misma entidad `Persona` de TDD-009. La creación setea `createdById` con el usuario autenticado.

### Contrato de API

*   **Endpoint**: `POST /api/v1/personas`
*   **Auth**: Requiere sesión activa (roles ADMIN o USER)
*   **Request Body**:
```json
{
  "dni": "12345678",
  "nombre": "Juan",
  "apellido": "Pérez",
  "fechaNacimiento": "1990-05-15",
  "direccion": "Av. Siempre Viva 123",
  "telefono": "1112345678",
  "grupoSanguineoId": 1
}
```
*   **Response** `201 Created`:
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "dni": "12345678",
      "nombre": "Juan",
      "apellido": "Pérez",
      "fechaNacimiento": "1990-05-15T00:00:00.000Z",
      "direccion": "Av. Siempre Viva 123",
      "telefono": "1112345678",
      "grupoSanguineo": { "id": 1, "tipo": "O", "factorRh": "POSITIVO" }
    }
  }
}
```

### Backend

#### Estructura del Código (Backend)

```
backend/src/modules/persona/
├── persona.routes.ts        ← se agrega POST / con authMiddleware
├── persona.controller.ts    ← se agrega handler create()
├── persona.service.ts       ← se agrega crear(): valida DNI único y grupo sanguíneo existe, crea
├── persona.repository.ts    ← se agregan create(), findByDni(), findGrupoSanguineoById()
├── persona.schema.ts        ← se agregan crearPersonaSchema (Zod) y crearPersonaResponseSchema
└── persona.dto.ts           ← se reutiliza toPersonaResponse() (sin cambios)
```

#### Schema Zod

```ts
const crearPersonaSchema = z.object({
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

`crear(data, userId)`:
1. `findByDni(dni)` — si existe → `AppError(409, 'El DNI ya existe en el sistema')`
2. `findGrupoSanguineoById(grupoSanguineoId)` — si no existe o está soft-deleted → `AppError(404, 'El grupo sanguíneo indicado no existe')`
3. `create({ ...data, createdById: userId })` con `include: { grupoSanguineo: true }`
4. Retorna `toPersonaResponse(persona)`

#### Controller

`create(req, res, next)`:
1. Parsear body con `crearPersonaSchema`
2. Llamar `personaService.crear(data, req.user.id)`
3. Validar response con `crearPersonaResponseSchema`
4. Responder `201` con `successResponse({ item })`

### Frontend

#### Contrato de UI

| Acción | Resultado |
|--------|-----------|
| Usuario hace clic en "Nueva persona" | Abre Dialog con formulario vacío y grupo sanguíneo preseleccionado |
| Usuario completa campos y hace clic en "Guardar" | POST /api/v1/personas, se cierra Dialog, se refresca la lista |
| Error del servidor (DNI duplicado, grupo inválido) | Se muestra ErrorAlert dentro del Dialog con el mensaje del backend |
| Error de red | Se muestra ErrorAlert con mensaje genérico |

#### Estructura del Código (Frontend)

La vista de personas se implementó completa en TDD-009 integrando los 4 endpoints CRUD. Para el caso específico de creación, los siguientes archivos contienen la lógica que conecta el formulario con el backend:

```
frontend/features/personas/
├── personas.schema.ts              ← Schemas Zod del lado frontend
├── personas.dto.ts                 ← parsea la respuesta del POST
├── personas-service.ts             ← crear() → hace POST /personas
├── hooks/
│   └── usePersonaDialog.ts         ← handleSave(): distingue crear vs actualizar
└── components/
    └── persona-dialog.tsx          ← formulario + llamada a onSave + manejo de errores
```

##### personas.schema.ts

Define dos schemas para la creación:

- `personaFormInputSchema`: tipa los datos del formulario (`dni`, `nombre`, `apellido`, `fechaNacimiento`, `direccion`, `telefono`, `grupoSanguineoId`).
- `personaItemResponseSchema`: describe la respuesta esperada del POST (`{ success: true, data: { item: Persona } }`). Si el backend responde con otra forma, Zod lanza error.

##### personas.dto.ts

`parsePersonaResponse(data)` recibe el objeto crudo de Axios, lo valida contra `personaItemResponseSchema` y extrae `data.item`. Si el backend cambia el formato, el error se produce en el parseo (fail-fast).

##### personas-service.ts

`crear(input: PersonaFormInput): Promise<Persona>`:
1. Llama `api.post('/personas', input)` con Axios (baseURL `/api/v1`, credentials incluidas)
2. Pasa la respuesta a `parsePersonaResponse()`
3. Retorna el objeto `Persona` tipado

El interceptor de Axios en `lib/axios.ts` ya transforma los errores del backend: extrae `error.response.data.error` o `error.message` y rechaza la Promise con un `Error`, que el hook captura para mostrar en pantalla.

##### usePersonaDialog.ts

Hook que gestiona el estado del diálogo de creación/edición:

- `editing: Persona | null` — si es `null` → modo creación; si tiene valor → modo edición
- `handleSave(input)`: switchea según `editing`:
  - `editing` es `null` → llama `personasService.crear(input)`
  - `editing` tiene valor → llama `personasService.actualizar(editing.id, input)`
- En ambos casos, al éxito cierra el Dialog y ejecuta `onSuccess?.()` (que refresca la lista vía `refetch`)

##### persona-dialog.tsx

Componente de formulario con shadcn `Dialog`. Flujo de creación:

1. Al abrirse sin `editing`, inicializa el form vacío con el primer grupo sanguíneo preseleccionado
2. `handleSubmit` previene el envío por defecto, resetea errores previos y llama `onSave(toInput(form))`
3. Si `onSave` lanza error (DNI duplicado, grupo inválido, red caída), el `catch` extrae el mensaje con `extractErrorMessage(err)` y lo setea en `serverError`
4. `ErrorAlert` muestra `serverError` dentro del Dialog sobre el formulario
5. Mientras `saving` es `true`, el botón "Guardar" se deshabilita y muestra "Guardando..."

##### page.tsx (integración)

```tsx
const { editing, setEditing, dialogOpen, setDialogOpen, handleSave, saving } =
  usePersonaDialog(refetch)

// ...

<PersonaDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  editing={editing}
  onSave={handleSave}
  saving={saving}
  grupos={grupos}
  loadingGrupos={loadingGrupos}
/>
```

- `useGruposSanguineos()` carga los grupos para el select del formulario
- `refetch` (de `usePersonasQuery`) se pasa como `onSuccess` para refrescar la tabla tras crear

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Creación exitosa | `{ "success": true, "data": { "item": {...} } }` | 201 Created |
| DNI duplicado | `{ "error": "El DNI ya existe en el sistema" }` | 409 Conflict |
| grupoSanguineoId no existe | `{ "error": "El grupo sanguíneo indicado no existe" }` | 404 Not Found |
| grupoSanguineoId soft-deleted | `{ "error": "El grupo sanguíneo indicado no existe" }` | 404 Not Found |
| DNI con menos de 7 o más de 10 caracteres | Error Zod | 400 Bad Request |
| fechaNacimiento inválida | Error Zod | 400 Bad Request |
| Campos obligatorios vacíos | Error Zod por campo | 400 Bad Request |
| Rol no autorizado (ej. rol futuro sin permisos) | `{ "error": "Acción no permitida. Se requiere rol ADMIN o USER" }` | 403 Forbidden |
| Sin autenticación | `{ "error": "No autenticado" }` | 401 Unauthorized |

## Plan de Implementación

### Backend
1. Agregar `crearPersonaSchema` y `crearPersonaResponseSchema` en `persona.schema.ts`
2. Agregar `create()`, `findByDni()`, `findGrupoSanguineoById()` en `persona.repository.ts`
3. Implementar `crear(data, userId)` en `persona.service.ts` con validaciones
4. Agregar handler `create()` en `persona.controller.ts` con OpenAPI docs
5. Agregar ruta `POST /` con authMiddleware en `persona.routes.ts`
6. Tests de integración con supertest: 201 éxito, 409 DNI duplicado, 404 grupo inválido, 400 campos vacíos, 401 sin auth

### Frontend
1. Definir `personaFormInputSchema` y `personaItemResponseSchema` en `personas.schema.ts` para tipar formulario y respuesta del POST
2. Implementar `parsePersonaResponse()` en `personas.dto.ts` que valida y extrae `data.item`
3. Implementar `crear(input)` en `personas-service.ts` que hace POST /personas con Axios
4. Implementar `handleSave()` en `usePersonaDialog.ts` que distingue crear vs actualizar según `editing`
5. Implementar formulario con manejo de errores en `persona-dialog.tsx` que captura errores del backend y los muestra via `ErrorAlert`
6. Integrar en `page.tsx`: conectar `usePersonaDialog(refetch)`, pasar props a `PersonaDialog`, cargar grupos sanguíneos para el select
