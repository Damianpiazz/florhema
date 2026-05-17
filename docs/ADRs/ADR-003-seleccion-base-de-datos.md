---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Selección de Base de Datos — PostgreSQL
---

# ADR-003: Selección de Base de Datos — PostgreSQL

## Contexto

Florhema es un sistema de gestión hospitalaria para el Servicio de Hemoterapia. La base de datos debe almacenar información crítica de donantes, pacientes, gestantes, transfusiones y serologías. Los requisitos clave son:

- Integridad referencial y cumplimiento ACID
- Soporte de tipos de datos avanzados (arrays, enumerados personalizados, rango de fechas)
- Rendimiento confiable en operaciones transaccionales (OLTP)
- Madurez y estabilidad para un entorno de salud pública
- Facilidad para modelar el dominio clínico con constraints complejas
- Buena integración con Prisma ORM

Se evaluaron tres alternativas: PostgreSQL, MySQL y SQLite.

---

## Decisión

Se utilizará **PostgreSQL** como motor de base de datos del proyecto.

PostgreSQL se ejecutará localmente en desarrollo mediante Docker Compose y en un servidor dedicado en producción. La comunicación se realiza a través de Prisma ORM.

---

## Opciones Consideradas

### Opción 1: PostgreSQL (seleccionada)

- Base de datos relacional objeto-relacional, open source, con más de 30 años de desarrollo activo
- *Ventajas*: Tipos de datos avanzados (`ENUM`, `ARRAY`, `JSONB`, `RANGE`, `UUID`), integridad ACID estricta, constraints complejas (`CHECK`, `EXCLUDE`), soporte de índices parciales y funcionales, extensiones como `pg_stat_statements` para monitoreo, concurrencia robusta mediante MVCC,社区 activa y massiva adopción en proyectos modernos, integración de primera clase con Prisma (soporte nativo de `ENUM`, arrays, `uuid`)
- *Desventajas*: Mayor consumo de recursos que SQLite, configuración inicial más compleja que MySQL en algunos escenarios, réplicas físicas más pesadas de configurar que en MySQL

### Opción 2: MySQL

- Base de datos relacional ampliamente utilizada, especialmente en entornos web LAMP
- *Ventajas*: Amplia documentación histórica, fácil de configurar, buena performance en lecturas simples, gran ecosistema de hosting
- *Desventajas*: Soporte limitado de tipos de datos (sin `ARRAY`, sin `ENUM` nativo confiable, sin `JSONB`), motor de almacenamiento InnoDB con menor madurez en constraints complejas, diferencias en comportamiento ACID según el motor, integración con Prisma menos madura (sin soporte nativo de arrays ni enumerados), rendimiento inferior en consultas analíticas o con joins complejos

### Opción 3: SQLite

- Base de datos embebida, sin servidor, almacenada en un solo archivo
- *Ventajas*: Cero configuración, sin servidor, ideal para desarrollo local, portabilidad absoluta, consumo mínimo de recursos
- *Desventajas*: Sin concurrencia real (escrituras serializadas), sin tipos de datos rigurosos (affinity types), sin soporte de `ENUM`, `ARRAY`, `JSONB`, sin roles ni permisos a nivel de base de datos, no apta para producción con múltiples usuarios concurrentes, escalabilidad horizontal imposible

---

## Consecuencias

### Positivas
- Modelado fiel del dominio clínico: `ENUM` para grupo sanguíneo, factor Rh, estado de aptitud, tipo de hemocomponente, etc.
- Integridad de datos garantizada mediante constraints declarativas (`CHECK`, `UNIQUE`, `EXCLUDE`)
- Transacciones confiables para operaciones críticas (registro de donaciones, transfusiones)
- `JSONB` disponible para almacenar resultados de serologías y datos variables sin rigidizar el esquema
- Arrays nativos útiles para campos como "alergias", "medicación actual", "serologías realizadas"
- Extensibilidad futura: PostGIS para geolocalización, `pg_cron` para tareas programadas

### Negativas
- Mayor consumo de RAM y disco frente a SQLite
- Requiere Docker o servidor PostgreSQL instalado (no es embebido)
- Backup y restauración ligeramente más complejos que SQLite (archivo único)

---

## Impacto en el Sistema

### Backend
- Configuración de conexión vía `DATABASE_URL` en variables de entorno
- Esquema definido en `backend/prisma/schema.prisma`
- Migraciones versionadas con `prisma migrate`
- La base de datos se ejecuta en Docker Compose en desarrollo

### Frontend
- Sin impacto directo

### Infraestructura / Compartido
- Servicio de base de datos independiente del backend
- Docker Compose como gestor del contenedor PostgreSQL
- Puerto estándar `5432` mapeado al host
- Volumen persistente para datos en desarrollo

---

## Reglas Derivadas

- Solo PostgreSQL puede usarse como motor de base de datos en todos los entornos (desarrollo, staging, producción)
- No se permite SQLite ni MySQL, ni siquiera en desarrollo, para evitar diferencias de comportamiento entre entornos
- La configuración de conexión se maneja exclusivamente por variable de entorno `DATABASE_URL`
- El contenedor Docker de PostgreSQL usa la imagen oficial `postgres:16-alpine` (o LST estable)
- Los datos de desarrollo se persisten en un volumen Docker nombrado
- No se utilizarán features de PostgreSQL que no tengan equivalente en Prisma (ej. disparadores nativos se prefieren desde la capa de aplicación)
