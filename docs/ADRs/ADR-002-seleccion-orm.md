---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Selección de ORM — Prisma
---

# ADR-002: Selección de ORM — Prisma

## Contexto

Florhema necesita una capa de persistencia para interactuar con PostgreSQL desde el backend en TypeScript. Los requisitos clave son:

- Tipado fuerte y autocompletado en las consultas
- Soporte nativo de migraciones de base de datos
- Madurez y estabilidad para un sistema de gestión hospitalaria
- Facilidad de adopción por parte del equipo
- Buena integración con TypeScript y Express

Se evaluaron cuatro alternativas: Prisma, TypeORM, Drizzle ORM, y SQL crudo.

---

## Decisión

Se utilizará **Prisma** como ORM oficial del proyecto. Prisma se encargará de:

- Definición del esquema de base de datos (`schema.prisma`)
- Generación de migraciones y versionado del esquema
- Generación automática de un cliente tipado (Prisma Client) para consultas
- Validación de datos en tiempo de compilación mediante tipos de TypeScript

No se utilizarán alternativas como TypeORM, Drizzle, ni SQL crudo para la capa de persistencia.

---

## Opciones Consideradas

### Opción 1: Prisma (seleccionada)

- ORM declarativo con generación automática de cliente tipado
- Esquema centralizado en `schema.prisma` como fuente de verdad
- Migraciones integradas con historial versionado y checksums
- Cliente generado con tipos 1:1 contra el esquema
- *Ventajas*: Type safety total sin escribir tipos manualmente, CLI madura, DX excelente (autocompletado, validación en edición), migraciones seguras con detección de conflictos, amplia documentación y comunidad
- *Desventajas*: Capa de abstracción que puede ocultar queries complejas, rendimiento ligeramente inferior a SQL crudo en consultas muy específicas, peso adicional en el bundle (aunque es server-side)

### Opción 2: TypeORM

- ORM clásico con decoradores y patrón Active Record / Data Mapper
- *Ventajas*: Muy maduro, soporte para múltiples bases de datos, amplia adopción en proyectos Node.js legacy
- *Desventajas*: Decoradores con sintaxis verbosa, tipado débil en comparación con Prisma, configuraciones complejas, relationship loading no intuitivo (lazy vs eager), comunidad en declive frente a alternativas más modernas

### Opción 3: Drizzle ORM

- ORM moderno con sintaxis similar a SQL y tipado fuerte
- *Ventajas*: Tipado excelente, rendimiento cercano a SQL crudo, bundle pequeño, sintaxis que se asemeja a SQL puro
- *Desventajas*: Ecosistema más joven, menos documentación en español, menos recursos de aprendizaje, migraciones menos maduras que Prisma, cambios frecuentes en la API por estar en evolución activa

### Opción 4: SQL crudo (raw queries con `pg` o `postgres.js`)

- Consultas SQL escritas manualmente sin capa ORM
- *Ventajas*: Control total sobre las queries, máximo rendimiento, sin abstracciones intermedias, sin generación de código
- *Desventajas*: Sin tipado en las consultas (strings SQL), sin autocompletado, migraciones manuales, alta verbosidad, riesgo de errores en runtime, sin validación en tiempo de compilación, mayor tiempo de desarrollo

---

## Consecuencias

### Positivas
- Tipado completo en cada consulta: el compilador detecta errores de esquema antes de llegar a producción
- Migraciones seguras con historial versionado y detección de conflictos entre ramas
- Esquema centralizado como única fuente de verdad para la base de datos
- Curva de aprendizaje baja para el equipo
- Generación automática de tipos sincronizados con la base de datos

### Negativas
- Dependencia de un generador de código (Prisma Client debe regenerarse al cambiar el esquema)
- Consultas complejas (joins múltiples, subconsultas anidadas) pueden requerir raw queries o `prisma.$queryRaw`
- Capa de abstracción que añade latencia mínima frente a SQL crudo
- Migraciones pueden fallar en escenarios de merging complejo (aunque Prisma los detecta)

---

## Impacto en el Sistema

### Backend
- El esquema de base de datos se define exclusivamente en `backend/prisma/schema.prisma`
- Todo acceso a datos pasa por Prisma Client, nunca por drivers SQL directos
- Las migraciones se gestionan con `prisma migrate dev` y se versionan en el repositorio
- Prisma Studio disponible como herramienta de inspección visual en desarrollo

### Frontend
- Sin impacto directo: Prisma es solo del backend

### Infraestructura / Compartido
- La base de datos PostgreSQL es independiente del ORM
- Cambiar de ORM en el futuro requeriría reescribir la capa de persistencia, pero el modelo de dominio (servicios, reglas de negocio) no se vería afectado por estar desacoplado

---

## Reglas Derivadas

- El archivo `schema.prisma` es la fuente de verdad de la estructura de base de datos
- No se editarán manualmente los archivos SQL generados en `prisma/migrations/`
- Todo nuevo campo, tabla o relación debe agregarse primero en `schema.prisma` y luego migrarse
- Prisma Client se regenera con `prisma generate` después de cada cambio en el esquema
- Para consultas muy complejas no soportadas por Prisma, se usará `prisma.$queryRaw` con tipado manual, siempre encapsulado en el repositorio correspondiente
