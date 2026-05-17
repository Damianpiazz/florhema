---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Modelo de Dominio con Herencia — Persona como Clase Base
---

# ADR-007: Modelo de Dominio con Herencia — Persona como Clase Base

## Contexto

En el Servicio de Hemoterapia, una misma persona física puede cumplir múltiples subtipos a lo largo del tiempo: puede ser donante, luego paciente, una paciente puede ser gestante, y una gestante puede tener un recién nacido asociado. El sistema necesita:

- Tener una **visión unificada de la persona** con todos sus eventos y subtipos asociados
- Que el DNI sea el identificador único universal de cualquier persona en el sistema
- Evitar duplicación de datos personales (nombre, apellido, grupo sanguíneo) si una persona cumple varios subtipos
- Poder consultar el historial completo de una persona (donaciones, transfusiones, estudios gestacionales) desde un solo punto de entrada

Se evaluaron dos enfoques: herencia con clase base `Persona` y tablas separadas sin herencia.

---

## Decisión

Se adopta un **modelo de dominio con herencia** donde `Persona` es una clase base abstracta y los subtipos específicos (`Donante`, `Paciente`, `Gestante`, `RecienNacido`) heredan de ella.

### Estructura conceptual

```
Persona (abstracta)
├── Donante       → tiene Donaciones
├── Paciente      → recibe Transfusiones
├── Gestante      → tiene EstudiosGestante, da a luz RecienNacidos
└── RecienNacido  → asociado a una Gestante
```

### Principio clave

> Una persona se registra una sola vez con su DNI. Si luego cumple otro subtipo, no se crea un nuevo registro: se agrega el subtipo a la misma persona. El sistema es "persona-céntrico".

---

## Opciones Consideradas

### Opción 1: Herencia con Persona base — seleccionada

- `Persona` como entidad raíz con datos compartidos (DNI, nombre, apellido, fecha de nacimiento, grupo sanguíneo)
- Cada subtipo es una extensión con sus propios atributos y relaciones
- En base de datos se mapea como tabla `Persona` más tablas `Donante`, `Paciente`, `Gestante`, `RecienNacido` con FK a `Persona` (table-per-type)
- *Ventajas*:
  - Visión unificada: desde una persona se navega a todos sus subtipos e historial
  - Sin duplicación de datos personales
  - DNI como identificador único y natural
  - Consultas cross-subtipo posibles (ej. "esta donante también fue paciente")
- *Desventajas*:
  - Mayor complejidad de joins en consultas que cruzan subtipos
  - Mapeo ORM requiere estrategia de herencia (Prisma: `@@map` + relaciones opcionales)
  - Una persona sin ningún subtipo específico sigue siendo `Persona` (registro básico)

### Opción 2: Tablas separadas sin herencia

- Cada subtipo es una tabla independiente con sus propios datos personales duplicados
- Sin entidad `Persona` unificada
- *Ventajas*:
  - Simplicidad de consultas por subtipo (cada tabla tiene todo lo que necesita)
  - Sin joins para operaciones dentro de un solo subtipo
- *Desventajas*:
  - Duplicación de datos personales (nombre, DNI, grupo sanguíneo repetido en cada tabla)
  - Riesgo de inconsistencia: una persona puede tener datos distintos en cada tabla
  - Sin visión unificada del historial: no hay forma sencilla de ver que un donante también fue paciente
  - DNI pasa a ser un identificador local por tabla, no universal
  - Difícil mantener integridad referencial entre subtipos de la misma persona

---

## Consecuencias

### Positivas
- Visión 360° de la persona: desde el perfil de una persona se accede a donaciones, transfusiones, estudios gestacionales y recién nacidos asociados
- Consistencia de datos: el nombre, grupo sanguíneo y datos demográficos viven en un solo lugar
- DNI como identificador único del sistema, alineado con el mundo real (el hospital identifica personas por DNI)
- Flexibilidad para agregar nuevos subtipos en el futuro (ej. `Empleado`, `Familiar`) sin reestructurar lo existente
- Reglas de negocio cross-subtipo posibles (ej. "una persona con ROJO no puede donar aunque tenga otro subtipo activo")

### Negativas
- Consultas que cruzan subtipos requieren joins entre `Persona` y las tablas de cada subtipo
- Algunas operaciones simples (listar solo donantes) requieren join con `Persona` (o vista materializada si el volumen es alto)
- En Prisma, el mapeo se logra con relaciones 1:1 opcionales desde `Persona` hacia cada rol, no con herencia nativa (Prisma no soporta table-per-type automático)

---

## Impacto en el Sistema

### Backend

- `Persona` es el repositorio raíz
- Los repositorios de cada subtipo (`donanteRepository`, `pacienteRepository`, etc.) trabajan sobre los registros que tienen ese subtipo activo
- En Prisma Schema, cada subtipo tiene su propia tabla con FK a `Persona`

---

## Reglas Derivadas

- Toda persona debe tener DNI como identificador único y obligatorio
- Una persona puede tener 0, 1 o múltiples subtipos simultáneamente
- Los datos demográficos (nombre, apellido, fecha de nacimiento, grupo sanguíneo) se almacenan una sola vez en `Persona`
- Cada subtipo se almacena en su propia tabla con una FK a `Persona`
- No se permite crear un subtipo sin tener primero la persona base registrada
- El grupo sanguíneo se define a nivel de `Persona`; si se requiere cambiar, se actualiza en un solo lugar
- El historial de eventos (donaciones, transfusiones, estudios) se relaciona directamente con el subtipo específico, no con `Persona`
