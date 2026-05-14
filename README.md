# Florhema

Florhema es una plataforma para la gestión del Servicio de Hemoterapia del Hospital de Las Flores. Permite administrar donantes, pacientes, gestantes y transfusiones con trazabilidad completa, generación automática de constancias y reportes estadísticos.

Está compuesta por dos aplicaciones independientes: un backend en **Express** con **Prisma** (PostgreSQL) y un frontend en **Next.js** con **Tailwind CSS** y **shadcn/ui**.

Para conocer en detalle las decisiones de arquitectura del proyecto, puedes consultar la [Documentación de Arquitectura](./docs/ARCHITECTURE.md).

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

### 4. Backend (Express + Prisma)

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

El servidor de desarrollo se inicia en `http://localhost:4000`.

### 5. Frontend (Next.js)

Abre una nueva terminal y ejecuta:

```bash
cd frontend
npm install
npm run dev
```

El servidor de desarrollo se inicia en `http://localhost:3000`.

### Verificar que funciona

- **Backend**: `GET http://localhost:4000/api/health`
- **Frontend**: Abrir `http://localhost:3000` en el navegador

## Comandos Útiles de Base de Datos

Para visualizar la base de datos gráficamente a través del navegador, puedes usar Prisma Studio:

```bash
cd backend
npx prisma studio
```

---

## Testing

El proyecto cuenta con una suite de tests (unitarios, de integración y de API). Para aprender a ejecutarlos y conocer las herramientas utilizadas, consulta la **[Guía de Testing](./docs/TESTING.md)**.

## Contribuir

Si deseas colaborar con el proyecto, por favor lee primero nuestra **[Guía de Contribución](./docs/CONTRIBUTING.md)** para entender el flujo de trabajo con feature branches y los estándares de código.

---

## Documentación Adicional

En la carpeta `/docs` encontrarás información detallada sobre:

- **[Arquitectura](./docs/ARCHITECTURE.md)**: Decisiones técnicas y estructura del proyecto.
- **[Testing](./docs/TESTING.md)**: Estrategia e infraestructura de pruebas.
- **[Contribución](./docs/CONTRIBUTING.md)**: Cómo empezar a desarrollar en el proyecto.
- **[Migraciones](./docs/MIGRATIONS.md)**: Gestión de migraciones con Prisma.
- **[Especificación](./docs/especificacion/requerimientos.md)**: Requerimientos funcionales, modelo de dominio y casos de uso.
- **TDDs**: Diseños técnicos y pruebas de cada funcionalidad implementada.
- **ADRs**: Registro de decisiones técnicas adoptadas.
