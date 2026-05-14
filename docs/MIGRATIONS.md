# Gestion de Migraciones de Base de Datos

En Florhema utilizamos **Prisma** como nuestro ORM (Object-Relational Mapping). Prisma no solo nos permite consultar la base de datos de manera tipada mediante TypeScript, sino que tambien gestiona las "migraciones".

---

## Que es una Migracion

Una migracion es como un "commit" o version de control para tu base de datos. En lugar de crear tablas o columnas manualmente usando SQL (lo cual es dificil de rastrear y compartir con el equipo), defines la estructura deseada en codigo y la herramienta genera un archivo historico de cambios.

De esta manera, si un desarrollador agrega un campo a una tabla, cualquier otro miembro del equipo (o el servidor de produccion) puede aplicar exactamente el mismo cambio de forma automatizada y segura.

---

## Flujo de Trabajo con Prisma

En Florhema, la fuente de la verdad para la estructura de la base de datos es el archivo `schema.prisma` ubicado en `backend/prisma/schema.prisma`.

### 1. Modificar el Esquema

Cuando necesites crear una nueva tabla o agregar o eliminar una columna, debes hacerlo editando el archivo `schema.prisma`.

Por ejemplo, si quisieras agregar un telefono al modelo `User`:

```prisma
model User {
    id       String   @id @default(uuid())
    email    String   @unique
    nombre   String
    password String
    telefono String?  // Nuevo campo opcional
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```

### 2. Generar y Aplicar la Migracion

Una vez editado el archivo, debes decirle a Prisma que detecte esos cambios, cree un archivo SQL con la migracion y la aplique en la base de datos de desarrollo.

Ejecuta el siguiente comando en la raiz del backend:

```bash
cd backend
npx prisma migrate dev --name agregar_telefono_user
```

**Que hace este comando?**

1. Compara el `schema.prisma` actual contra el estado de la base de datos.
2. Crea una nueva carpeta en `backend/prisma/migrations/` con un archivo `migration.sql` que contiene las sentencias `ALTER TABLE` o `CREATE TABLE`.
3. Ejecuta ese archivo SQL en la base de datos.
4. Ejecuta `npx prisma generate` internamente para actualizar los tipos de TypeScript y que el autocompletado en tu IDE reconozca el nuevo campo `telefono`.

### 3. Migraciones en Entorno de Desarrollo

Si el proyecto utiliza Docker Compose, el entorno de desarrollo puede estar configurado para que la API ejecute automaticamente las migraciones pendientes cada vez que se levanta el contenedor.

Si trabajas sin Docker, asegurate de tener la base de datos corriendo localmente (por ejemplo, via PostgreSQL nativo) y ejecuta las migraciones manualmente con el comando `npx prisma migrate dev`.

En ambos casos, cuando otro desarrollador del equipo crea una migracion y tu haces `git pull`, al levantar tu entorno de desarrollo tu base de datos local se actualizara con los cambios de tu companero.

---

## Resolucion de Conflictos de Migraciones

Al trabajar en equipo usando Git, es comun que ocurran conflictos en el historial de migraciones. Esto sucede generalmente en dos escenarios:

1. **Migraciones Paralelas**: Dos desarrolladores crean migraciones distintas al mismo tiempo en ramas diferentes, y al unirlas (merge), Prisma detecta que el historial de base de datos no coincide con la cronologia real de los archivos.
2. **Edicion Manual Accidental**: Alguien modifico manualmente un archivo `.sql` de una migracion que ya habia sido aplicada. Prisma guarda un *checksum* (firma criptografica) de cada migracion aplicada, por lo que detectara la alteracion y lanzara un error (*Checksum mismatch*).

### Como solucionarlo

Cuando ocurren estos problemas, la terminal te arrojara un error indicando que hubo un **Drift** o un **Checksum mismatch**.

**Opcion 1: Resetear la base de datos local (recomendado para desarrollo)**

Si estas en tu entorno local y tienes conflictos, la solucion mas limpia es borrar la base de datos y volverla a construir desde cero ejecutando el historial completo de migraciones consolidado:

```bash
npx prisma migrate reset
```

> Advertencia: Este comando borrara todos los datos locales de tu base de datos y correra todas las migraciones nuevamente. Solo usalo en desarrollo.

**Opcion 2: Resolver la migracion fallida o aplicada manualmente**

Si unificaste ramas y tienes una migracion especifica que te causa problemas, pero no quieres borrar la base de datos, puedes marcarla como resuelta usando:

```bash
npx prisma migrate resolve --applied "20260420_nombre_de_la_migracion"
```

**Prevencion**: La mejor forma de evitar conflictos es **comunicarse con el equipo**. Si dos personas necesitan modificar `schema.prisma` el mismo dia, coordinen quien hace el cambio primero, para que el segundo se baje la rama actualizada antes de generar su propia migracion.

---

## Buenas Practicas

1. **Nombres Descriptivos**: Siempre usa nombres claros en el parametro `--name` (ej. `add_birthdate`, `create_payments_table`).
2. **Nunca editar las migraciones a mano**: Los archivos SQL generados en la carpeta `migrations` no deben modificarse manualmente despues de haber sido creados, a menos que sepas exactamente como corregir una migracion fallida en Prisma.
3. **Commitear las migraciones**: Los archivos de migracion (las carpetas generadas con fechas y nombres dentro de `prisma/migrations/`) **deben** ser commiteados a Git. Son parte del codigo fuente.
