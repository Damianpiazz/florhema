# Setup del Proyecto - Florhema

Guia paso a paso para poner el proyecto en funcionamiento en un entorno local de desarrollo.

---

## Prerrequisitos

- **Node.js** 18.x o 20.x
- **npm** 9+
- **Docker Desktop** (para la base de datos PostgreSQL)
- **Git**

---

## Primeros Pasos

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd florhema
```

### 2. Variables de entorno

El proyecto requiere dos archivos de entorno, uno para cada aplicacion.

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

La base de datos PostgreSQL se levanta mediante Docker Compose. El archivo se encuentra en la raiz del proyecto.

```bash
docker compose up -d
```

Esto levanta un contenedor con PostgreSQL expuesto en el puerto `5432`.

Para verificar que la base de datos esta corriendo:

```bash
docker compose ps
```

Para detenerla:

```bash
docker compose down
```

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

---

## Verificar que funciona

- Backend: `GET http://localhost:4000/api/health` (deberia responder con un JSON de estado)
- Frontend: Abrir `http://localhost:3000` en el navegador

---

## Nota sobre Dockerizacion futura

Actualmente solo la base de datos esta dockerizada. En una etapa posterior, el proyecto pasara a ejecutarse completamente con Docker:

- Backend (Express) contenerizado
- Frontend (Next.js) contenerizado
- Base de datos PostgreSQL
- Orquestacion con un solo `docker compose up`

Esto eliminara la necesidad de instalar Node.js y manejar dependencias localmente.
