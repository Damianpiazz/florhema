---
autor: DAMIAN Piazza
fecha: 2026-05-21
titulo: Validación de Datos — Zod (Backend)
---

# ADR-018: Validación de Datos — Zod (Backend)

## Contexto

Florhema necesita validar los datos de entrada de la API REST del backend antes de que lleguen a los servicios y repositorios. Los requisitos clave son:

- Tipado fuerte: los esquemas de validación deben generar tipos TypeScript automáticamente
- Mensajes de error descriptivos y en español para devolver al frontend
- Integración con Express.js (middleware de validación)
- Sintaxis declarativa y legible
- Buen rendimiento para validación en cada request
- Ecosistema maduro con buena documentación en español

Se evaluaron cuatro alternativas: Zod, Joi, yup y class-validator.

---

## Decisión

Se utilizará **Zod** como librería de validación de esquemas en el backend. Zod se encargará de:

- Definir esquemas de validación para cada endpoint de la API
- Generar tipos TypeScript automáticamente mediante `z.infer`
- Validar `request.body`, `request.params`, `request.query` en los controladores o middlewares
- Proporcionar mensajes de error descriptivos en español

No se utilizarán Joi, yup ni class-validator.

---

## Opciones Consideradas

### Opción 1: Zod (seleccionada)

- Librería de validación TypeScript-first con inferencia de tipos automática
- *Ventajas*: Tipos TypeScript generados automáticamente (`z.infer`) — nunca desincronizados del esquema, sintaxis declarativa y encadenable, mensajes de error personalizables, integración con Express vía middleware, tamaño de bundle pequeño (~8KB), sin decoradores (funciona con TypeScript estándar, sin `experimentalDecorators`), actualizaciones frecuentes y comunidad activa
- *Desventajas*: La versión 4 introdujo cambios significativos respecto a v3 (migración no trivial), rendimiento ligeramente inferior a Joi en benchmarks extremos, la API cambió de `z.object({}).parse()` a `z.object({}).safeParse()` en algunos patrones

### Opción 2: Joi

- Librería de validación madura del ecosistema hapi.js
- *Ventajas*: Muy madura (10+ años), sintaxis fluida y expresiva, mensajes de error detallados, soporte para validación asíncrona, amplia adopción en proyectos Node.js legacy
- *Desventajas*: Sin integración nativa con TypeScript (los tipos se definen por separado), sintaxis menos familiar para equipos modernos, requiere `@types/joi` y definiciones manuales, ecosistema en declive frente a alternativas más recientes, mensajes de error en inglés por defecto

### Opción 3: yup

- Librería de validación inspirada en Joi pero para el ecosistema React/Formik
- *Ventajas*: Sintaxis similar a Joi, buena integración con Formik (aunque no se usa en el proyecto), mensajes de error personalizables
- *Desventajas*: Rendimiento inferior a Zod y Joi, tipado TypeScript menos robusto, originally diseñada para formularios del lado del cliente (menos adecuada para API server-side), comunidad más pequeña

### Opción 4: class-validator

- Validación basada en decoradores de TypeScript (con class-transformer)
- *Ventajas*: Sintaxis declarativa con decoradores, familiar para equipos con background en Java/C#, integración con NestJS (aunque no se usa en el proyecto)
- *Desventajas*: Requiere `experimentalDecorators: true` en tsconfig, los decoradores son una propuesta experimental de TC39 que puede cambiar, tipado más débil que Zod (los tipos no se infieren automáticamente), dependencia de `class-transformer` para parseo, más verboso para esquemas simples

---

## Consecuencias

### Positivas
- Tipado sincronizado: el esquema Zod es la fuente de verdad, los tipos TypeScript se derivan automáticamente
- Sin decoradores experimentales: compatible con el TypeScript estándar del proyecto
- Mensajes de error en español configurables por campo
- Validación centralizada en middlewares, desacoplada de los controladores
- Buen rendimiento para el volumen de requests esperado en un sistema hospitalario

### Negativas
- Zod v4 tiene una API diferente a v3: curvas de aprendizaje si alguien viene de v3
- No soporta validación asíncrona nativa (aunque no es necesario para el proyecto actual)
- Los esquemas complejos con refinamientos condicionales pueden volverse difíciles de leer

---

## Impacto en el Sistema

### Backend
- Cada módulo define sus esquemas Zod en archivos `*.schema.ts` dentro de la carpeta del módulo
- Los controladores o un middleware de validación ejecutan `schema.parse()` o `schema.safeParse()` sobre `req.body`
- El error handler global captura `ZodError` y devuelve errores 400 con el mensaje correspondiente
- Los tipos inferidos (`z.infer`) se usan en servicios y repositorios en lugar de interfaces manuales

### Frontend
- Sin impacto directo. El frontend recibe errores de validación como respuestas HTTP 400 con mensajes descriptivos.

### Infraestructura / Compartido
- Si en el futuro se crea un paquete `shared/`, los esquemas Zod podrían compartirse entre frontend y backend

---

## Reglas Derivadas

- Cada endpoint de entrada (POST, PUT, PATCH) debe tener un esquema Zod que valide `req.body`
- Los esquemas se definen exclusivamente en archivos `*.schema.ts` dentro de cada módulo
- Se usa `schema.parse()` para validación con throw, y se captura `ZodError` en el error handler global
- No se definen tipos manuales para datos de entrada; siempre se usa `z.infer<typeof schema>`
- Los mensajes de error se definen en español dentro del esquema con el parámetro `message`
- No se usa `experimentalDecorators` ni `reflect-metadata` en el proyecto
