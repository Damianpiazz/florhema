# Florhema

Florhema es una plataforma para la gestión del Servicio de Hemoterapia del Hospital de Las Flores. Permite administrar donantes, pacientes, gestantes y transfusiones con trazabilidad completa y generación automática de constancias.

> **MVP**: Esta es una versión mínima viable. El sistema está en desarrollo activo y puede tener funcionalidades incompletas o en progreso.

Está compuesta por dos aplicaciones independientes unificadas en un **monorepo Turborepo**:
- **Backend**: Express + Prisma (PostgreSQL)
- **Frontend**: Next.js + Tailwind CSS + shadcn/ui

Para conocer las decisiones de arquitectura del proyecto, consulta la [Documentación de Arquitectura](./docs/ARCHITECTURE.md) y los [ADRs](./docs/ADRs/).

---

## Requisitos Previos

- **Node.js** (18.x o 20.x)
- **npm** (9+)
- **Docker** y **Docker Compose** (para la base de datos PostgreSQL)

## Guía de Instalación y Ejecución

Actualmente solo la base de datos está dockerizada. El backend y frontend se ejecutan localmente con Node.js.

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd florhema
```

### 2. Variables de entorno

El proyecto requiere dos archivos de entorno, uno para cada aplicación.

#### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/florhema_dev"
PORT=4000
```

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Base de datos (Docker Compose)

```bash
docker compose up -d
```

Esto levanta un contenedor con PostgreSQL en el puerto `5432`.

### 4. Instalar dependencias (raíz del monorepo)

```bash
npm install
```

### 5. Inicializar la base de datos

```bash
cd backend
npx prisma migrate dev
cd ..
```

### 6. Iniciar ambos proyectos en desarrollo

```bash
npm run dev
```

Esto ejecuta backend (`localhost:4000`) y frontend (`localhost:3000`) simultáneamente vía Turborepo.

### Verificar que funciona

- **Backend**: `GET http://localhost:4000/api/health`
- **Frontend**: Abrir `http://localhost:3000` en el navegador

## Comandos Útiles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia backend y frontend en desarrollo |
| `npm run build` | Construye ambos proyectos (con caché) |
| `npm run test` | Ejecuta tests de ambos proyectos |
| `npm run lint` | Ejecuta linters de ambos proyectos |
| `npm run format` | Formatea código con Prettier |
| `turbo build --force` | Construye forzando sin caché |

Para visualizar la base de datos gráficamente:

```bash
cd backend
npx prisma studio
```

---

## Testing

El proyecto cuenta con una suite de tests (unitarios, de integración y de API). Para aprender a ejecutarlos y conocer las herramientas utilizadas, consulta la **[Guía de Testing](./docs/TESTING.md)**.

## Contribuir

Si deseas colaborar, por favor lee primero nuestra **[Guía de Contribución](./docs/CONTRIBUTING.md)** para entender el flujo de trabajo con feature branches y los estándares de código.

---

## Documentación Adicional

En la carpeta `/docs` encontrarás información detallada sobre:

- **[Arquitectura](./docs/ARCHITECTURE.md)**: Decisiones técnicas y estructura del proyecto.
- **[Testing](./docs/TESTING.md)**: Estrategia e infraestructura de pruebas.
- **[Contribución](./docs/CONTRIBUTING.md)**: Cómo empezar a desarrollar.
- **[Migraciones](./docs/MIGRATIONS.md)**: Gestión de migraciones con Prisma.
- **[ADRs](./docs/ADRs/)**: Registro de decisiones técnicas adoptadas.
- **[Especificación](./docs/especificacion/requerimientos.md)**: Requerimientos funcionales, modelo de dominio y casos de uso.
- **TDDs**: Diseños técnicos y pruebas de cada funcionalidad implementada.
