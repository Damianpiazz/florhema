# Arquitectura del Proyecto Florhema

`Florhema` está diseñado como un sistema de dos aplicaciones independientes dentro de un mismo repositorio de GitHub:

- **Backend**: API construida con `Express.js`
- **Frontend**: aplicación web construida con `Next.js`

El repositorio no utiliza monorepo con workspaces ni compartición de paquetes. Cada carpeta es un proyecto completamente independiente con su propio ciclo de vida.

---

## Estructura General

- `/backend` (API Express)
- `/frontend` (Next.js)

Cada carpeta es una aplicación independiente y contiene su propio tooling, dependencias, configuración de entorno y ciclo de vida (`npm scripts`, build, linting y ejecución), sin compartir workspaces ni configuración global entre ellas.

---

## Backend (API Express)

El backend está construido sobre `Express.js` para la gestión HTTP y `Prisma` como ORM para comunicarse con una base de datos `PostgreSQL`.

La arquitectura está basada en un enfoque **modular por features (modules)**, donde el sistema se organiza por dominios funcionales, pero coexistiendo con capas globales compartidas fuera de los módulos.

### Arquitectura General del Backend

El backend se compone de dos niveles de organización:

- **Capas globales del sistema** (compartidas)
- **Módulos de dominio** (features aislados)

Esto permite separar responsabilidades transversales del sistema con la lógica específica de negocio.

### Capas Globales del Sistema

Estas capas existen fuera de los módulos y son utilizadas por toda la aplicación.

Incluyen responsabilidades transversales como infraestructura, configuración y middleware global.

#### Configuración (`config`)

Contiene la configuración general del sistema:

- variables de entorno
- configuración de `Prisma`
- configuración del servidor `Express`
- parámetros globales de la aplicación

#### Middlewares Globales

Funciones que se aplican a toda la aplicación `Express`:

- autenticación global (si aplica)
- manejo centralizado de errores
- logging de requests
- validaciones genéricas

#### Utilidades (`utils`)

Funciones reutilizables independientes del dominio:

- helpers
- formateadores
- funciones puras
- validaciones genéricas

#### Librerías Internas (`lib`)

Capa destinada a inicializaciones y clientes de librerías externas:

- instancias configuradas de `Prisma Client`
- configuración de librerías externas (HTTP clients, etc.)
- wrappers o adaptadores de librerías de terceros
- inicialización de SDKs o servicios externos

#### Capa de Acceso a Datos (Prisma)

`Prisma` es la capa central de persistencia del sistema:

- `Prisma Client` es la única interfaz con la base de datos
- Define el esquema de datos
- Maneja migraciones
- Es utilizado tanto por módulos como por servicios globales si es necesario

### Módulos de Dominio (Modules Pattern)

Los módulos representan unidades funcionales del sistema organizadas por dominio.

Cada módulo agrupa la lógica relacionada a una funcionalidad específica del negocio.

Ejemplos de módulos:

- `user`
- `persona`
- `donante`
- `paciente`

Cada módulo es independiente a nivel de negocio, pero utiliza las capas globales del sistema cuando es necesario.

#### Estructura conceptual de un módulo (`src/modules/<module>`)

Cada módulo contiene internamente su lógica separada en capas:

- rutas
- controladores
- servicios
- repositorios

##### Rutas (Routes)

Son responsables de definir los endpoints HTTP del módulo:

- Registran rutas en `Express`
- Conectan endpoints con controladores
- No contienen lógica de negocio

##### Controladores (Controllers)

Son la capa de entrada del módulo:

- Reciben solicitudes HTTP
- Extraen datos del request
- Validan datos básicos
- Delegan la lógica al servicio correspondiente
- No contienen reglas de negocio

##### Servicios (Services)

Contienen la lógica de negocio del sistema:

- Implementan reglas del dominio
- Orquestan procesos del módulo
- Coordinan acceso a datos
- Realizan validaciones complejas
- No dependen de `Express` ni de `Prisma` directamente

##### Repositorios (Repositories)

Son la capa de acceso a datos del módulo:

- Encapsulan consultas a `PostgreSQL`
- Utilizan `Prisma Client`
- Manejan persistencia y lectura de datos
- No contienen lógica de negocio

#### Principio clave de diseño

La arquitectura separa claramente dos niveles:

**Capas globales**
- infraestructura compartida
- configuración
- utilidades
- librerías internas (`lib`)
- middleware global

**Módulos de dominio**
- lógica de negocio por funcionalidad
- encapsulación por feature
- independencia entre dominios

---

## Frontend (Next.js)

El cliente web está construido con `Next.js`, utilizando el **App Router** y un enfoque de **organización por features (feature-based structure)**. El sistema combina renderizado híbrido (SSR/CSR) según el caso de uso y separa la aplicación por dominios funcionales.

### Tecnologías Principales

- **Framework**: `Next.js`
- **Enrutamiento**: App Router (`/app`) basado en filesystem
- **Estilos**: `Tailwind CSS`
- **Componentes UI**: `shadcn/ui`
- **Comunicación con API**: `Axios`
- **Renderizado**: Server Components y Client Components según necesidad

### Arquitectura del Frontend (Feature-Based)

El frontend se organiza por **features**, donde cada funcionalidad del sistema agrupa su propia UI, lógica y servicios relacionados.

Esto permite mantener un código más escalable y desacoplado por dominio funcional.

### Estructura General

El frontend se organiza en:

- `/app` (routing global del sistema)
- `/features` (dominios funcionales)
- `/components` (componentes compartidos)
- `/lib` (configuración e inicialización de librerías)
- `/hooks` (hooks globales reutilizables)
- `/utils` (funciones auxiliares)

#### `/app` (Routing)

Contiene el sistema de rutas de `Next.js`:

- Define las rutas del sistema
- Maneja layouts globales
- Actúa como entrypoint del routing
- Conecta con features según la página

El `/app` se mantiene lo más liviano posible, delegando la lógica a `/features`.

#### `/features` (Módulos de dominio)

Contiene la lógica principal del sistema organizada por funcionalidades.

Cada feature agrupa todo lo relacionado a un dominio específico.

Ejemplos:

- usuarios
- autenticación
- dashboard
- pacientes

Cada feature puede contener:

- componentes propios
- hooks propios
- servicios propios
- lógica de estado
- helpers específicos del dominio

#### `/components` (Componentes compartidos)

Contiene componentes reutilizables en toda la aplicación:

- Componentes de UI genéricos
- Componentes basados en `shadcn/ui`
- Elementos visuales compartidos entre features
- No contienen lógica de negocio

#### `/features/*/components` (Componentes por feature)

Cada feature puede contener sus propios componentes internos:

- UI específica del dominio
- Componentes acoplados a una funcionalidad concreta
- No reutilizables globalmente

#### `/services` (Comunicación con API)

Capa encargada de la comunicación con el backend usando `Axios`:

- Configuración de instancias de `Axios`
- Requests HTTP centralizados
- Consumo de endpoints del backend
- Separación entre UI y lógica de datos

Cada feature puede consumir servicios globales o definir sus propios servicios internos.

#### `/hooks`

Contiene lógica reutilizable de `React`:

- manejo de estado complejo
- abstracción de efectos
- lógica compartida entre features
- hooks globales independientes de UI

#### `/lib`

Inicialización de librerías externas:

- configuración de `Axios`
- wrappers de librerías externas
- setup de `shadcn/ui` o utilidades de UI
- clientes globales

#### `/utils`

Funciones puras reutilizables:

- formateo de datos
- helpers generales
- lógica independiente de `React`

### UI System

El sistema de UI está construido sobre:

- `Tailwind CSS` como sistema de estilos principal
- `shadcn/ui` como librería de componentes base

Esto permite:

- consistencia visual
- componentes accesibles
- personalización completa
- composición flexible de UI

### Flujo de la Aplicación (Frontend)

El flujo general es el siguiente:

1. El usuario accede a una ruta en `Next.js`.
2. El App Router resuelve la página correspondiente.
3. La página delega la lógica a la feature asociada.
4. La feature renderiza sus componentes y lógica interna.
5. Si es necesario, se ejecuta una request mediante `Axios`.
6. El backend responde con datos en JSON.
7. La feature actualiza el estado y la UI.

### Principio de diseño

El frontend está diseñado bajo separación estricta por responsabilidad:

- `/app` — routing y layouts
- `/features` — lógica de negocio por dominio
- `/components` — UI reutilizable global
- `/services` — comunicación con backend (`Axios`)
- `/hooks` — lógica `React` reutilizable
- `/lib` — configuración de librerías
- `/utils` — funciones puras

---

## Flujo de una peticion (vision general)

El flujo de una solicitud HTTP sigue este recorrido conceptual:

1. El cliente envía una petición HTTP al backend.
2. La request ingresa al servidor `Express`.
3. Los middlewares globales procesan la solicitud.
4. La ruta correspondiente delega al controlador del módulo.
5. El controlador valida datos básicos del request.
6. El servicio aplica la lógica de negocio.
7. El servicio utiliza el repositorio correspondiente.
8. El repositorio interactúa con `Prisma`.
9. `Prisma` ejecuta la operación en `PostgreSQL`.
10. El resultado retorna al controlador.
11. El controlador responde al cliente en JSON.
