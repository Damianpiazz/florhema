---
autor: DAMIAN Piazza
fecha: 2026-05-21
titulo: Documentación de API — Swagger/OpenAPI
---

# ADR-022: Documentación de API — Swagger/OpenAPI

## Contexto

Florhema necesita documentar la API REST del backend para:

- Que el equipo de frontend conozca los endpoints disponibles, sus parámetros y respuestas
- Que nuevos desarrolladores puedan entender la API rápidamente
- Tener una interfaz interactiva para probar endpoints durante desarrollo
- Servir como contrato entre frontend y backend
- Preparar la documentación para futura integración con consumidores externos

Los requisitos clave son:

- Documentación generada a partir del código (evitar documentación manual desactualizada)
- Interfaz web interactiva para probar endpoints (Swagger UI)
- Formato estándar de la industria (OpenAPI)
- Integración mínima con el código existente (sin cambiar la estructura de controllers)

Se evaluaron tres alternativas: swagger-jsdoc + swagger-ui-express, Scalar, y tsoa.

---

## Decisión

Se utilizará **swagger-jsdoc** + **swagger-ui-express** para documentar la API del backend. La solución funcionará de la siguiente manera:

- La especificación OpenAPI 3.0.3 se genera a partir de comentarios JSDoc en los controladores
- Swagger UI se sirve en la ruta `/api/docs` para exploración interactiva
- El JSON de la especificación se expone en `/api/docs.json` para consumo por herramientas externas
- La configuración base (título, versión, servidores) se define en `backend/src/config/swagger.ts`

No se utilizarán Scalar ni tsoa.

---

## Opciones Consideradas

### Opción 1: swagger-jsdoc + swagger-ui-express (seleccionada)

- **swagger-jsdoc**: Lee comentarios JSDoc con anotaciones OpenAPI y genera la especificación
- **swagger-ui-express**: Sirve Swagger UI como middleware de Express
- *Ventajas*: Documentación co-locada con el código (los comentarios JSDoc están en los controllers), generación automática sin build step adicional, sin cambios en la estructura de controllers existentes, Swagger UI es el estándar de facto para exploración de API, OpenAPI 3.0.3 es el formato más adoptado, `swagger-ui-express` se integra como middleware de Express en una línea, la especificación JSON se puede exportar para herramientas externas (Postman, Insomnia)
- *Desventajas*: Los comentarios JSDoc pueden volverse verbosos y desincronizarse del código si no se mantienen, `swagger-jsdoc` no valida que los comentarios coincidan con la implementación real, sin generación de tipos TypeScript a partir de la especificación, la interfaz de Swagger UI es funcional pero visualmente básica

### Opción 2: Scalar

- Alternativa moderna a Swagger UI con mejor experiencia visual
- *Ventajas*: Interfaz más moderna y limpia que Swagger UI, mejor soporte para temas oscuros, renderizado más rápido, documentación interactiva con ejemplos de código
- *Desventajas*: Ecosistema más pequeño, menos adopción, integración con Express menos probada, requiere configuración adicional, cambios más frecuentes en la API, el equipo puede no estar familiarizado

### Opción 3: tsoa

- Framework de generación de OpenAPI y controllers a partir de decoradores TypeScript
- *Ventajas*: Generación de tipos TypeScript a partir de la especificación (y viceversa), documentación siempre sincronizada con la implementación, validación de tipos en tiempo de compilación
- *Desventajas*: Requiere reescribir todos los controllers con decoradores y clases (cambio arquitectónico mayor), incompatible con la arquitectura actual de Express estándar (controllers como funciones), curva de aprendizaje alta, opinión fuerte sobre la estructura del código, sobreingeniería para la escala actual del proyecto

---

## Consecuencias

### Positivas
- Documentación generada desde comentarios en el código: más probable que se mantenga actualizada
- Swagger UI disponible en `/api/docs` para desarrollo y consumo del equipo frontend
- Especificación OpenAPI 3.0.3 estándar: exportable a Postman, Insomnia, generadores de clientes
- Integración mínima: un archivo de configuración y un middleware, sin cambiar la estructura existente
- Los endpoints se documentan con JSDoc directamente en los controllers, sin archivos separados
- `/api/docs.json` permite integración con herramientas de documentación y testing automatizado

### Negativas
- Los comentarios JSDoc dependen de la disciplina del equipo para mantenerse actualizados
- No hay validación automática entre la documentación y la implementación real
- Swagger UI tiene un aspecto visual funcional pero anticuado
- Controladores con mucha lógica pueden tener JSDoc extenso que dificulte la lectura
- Cambios en los endpoints requieren actualizar manualmente los comentarios JSDoc

---

## Impacto en el Sistema

### Backend
- Configuración de OpenAPI en `backend/src/config/swagger.ts` con título "Florhema API", versión "1.0.0"
- Los endpoints se documentan mediante comentarios JSDoc en cada archivo `*.controller.ts`
- Swagger UI servido en `/api/docs` solo en entorno de desarrollo (configurable)
- Especificación JSON disponible en `/api/docs.json`
- Sin impacto en la lógica de negocio, servicios o repositorios

### Frontend
- Sin impacto directo, aunque el equipo de frontend tiene una URL para explorar y probar endpoints
- La especificación OpenAPI puede usarse para generar tipos TypeScript compartidos en el futuro

### Infraestructura / Compartido
- `/api/docs` debe desactivarse o protegerse en producción para evitar exposición de la API
- La especificación OpenAPI puede versionarse junto con la API (ADR-010)

---

## Reglas Derivadas

- Todo endpoint nuevo debe incluir comentarios JSDoc con `@openapi` que documenten método, ruta, parámetros, request body y respuestas
- Los comentarios JSDoc se ubican inmediatamente antes de la función del controlador
- La especificación usa OpenAPI 3.0.3
- El servidor de desarrollo expone `/api/docs`; en producción se desactiva o se protege con autenticación
- No se usa `tsoa` ni ningún generador que requiera decoradores o cambios en la estructura de controllers
- La configuración base (title, version, servers) se actualiza al versionar la API
