---
autor: Damian Piazza
fecha: 2026-06-27
titulo: Generación de Constancias PDF con Puppeteer
---

# ADR-026: Generación de Constancias PDF con Puppeteer

## Contexto

Florhema requiere generar documentos PDF imprimibles para:

- **Constancias de donación**: certificado que acredita que una persona realizó una donación de sangre, con datos del donante, tipo de donación, peso, hemoglobina, tensión arterial y resultados de serología.
- **Constancias de estudio gestante**: certificado de estudios realizados a pacientes gestantes, incluyendo datos de la gestante, fechas, compatibilidad conyugal y resultados de prueba de Coombs indirecto.

Estos documentos deben poder descargarse desde el frontend y ser aptos para impresión y presentación oficial. Se necesita una solución que genere PDFs con formato controlado (no una simple captura de pantalla) directamente desde el servidor.

---

## Decisión

Se utiliza **Puppeteer** en el backend para generar documentos PDF a partir de HTML renderizado con plantillas inline. El flujo es:

1. El frontend solicita `GET /api/constancias/donacion/:id` o `GET /api/constancias/estudio-gestante/:id`
2. El backend consulta los datos en Prisma
3. Construye un documento HTML con estilos CSS inline
4. Usa Puppeteer (`puppeteer.launch({ headless: true })`) para renderizar el HTML a PDF
5. Devuelve el PDF como `application/pdf` con `Content-Disposition: attachment`

No se utiliza ninguna librería alternativa de generación de PDF (jsPDF, PDFKit, etc.) ni servicios externos.

---

## Opciones Consideradas

### Opción 1: Puppeteer (seleccionada)

- *Ventajas*:
  - Renderizado fiel: usa Chromium real, soporta CSS moderno, tablas, flexbox, fuentes
  - Control total sobre el layout mediante HTML + CSS
  - Sin depender de servicios externos ni APIs de terceros
  - Formato imprimible con `@page` y margins configurables
- *Desventajas*:
  - Requiere descargar Chromium (~300MB en instalación)
  - Consume más memoria que una librería liviana de PDF
  - Tiempo de arranque del browser (~1-2s por generación)

### Opción 2: jsPDF

- *Ventajas*: Librería liviana, sin binarios extra, funciona en cliente y servidor
- *Desventajas*: API programática verbose, difícil de mantener, sin soporte nativo de CSS, tablas complejas requieren librerías adicionales (jspdf-autotable)

### Opción 3: PDFKit

- *Ventajas*: Generación programática con buen control sobre el documento
- *Desventajas*: Sin soporte de HTML/CSS, todo debe construirse con primitivas (texto, rect, línea), código resultante es extenso y frágil

### Opción 4: Servicio externo (API de PDF)

- *Ventajas*: Sin overhead de mantenimiento de Chromium
- *Desventajas*: Dependencia de terceros, latencia de red, costo recurrente, datos sensibles de salud salen del servidor

---

## Consecuencias

### Positivas

- Documentos con formato profesional, tablas, estilos consistentes con la marca
- HTML renderizado fiel: lo que se ve en el HTML es lo que se imprime
- Sin dependencia externa ni límites de API
- Fácil de mantener: modificar el HTML/CSS es más simple que mantener código programático de PDF

### Negativas

- Chromium ocupa ~300MB en `node_modules` (incluido en Puppeteer)
- Cada generación de PDF requiere lanzar un proceso Chromium (~1-2s de latencia inicial)
- Mayor consumo de memoria que soluciones livianas
- Puppeteer no es eficiente para generación batch de alto volumen (no es el caso de uso actual)

---

## Impacto en el Sistema

### Backend

- `puppeteer` se agregó como dependencia en `backend/package.json`
- Nuevo módulo `src/modules/constancia/` con controlador, rutas y servicio
- El servicio construye HTML con template strings y estilos CSS inline
- Las rutas se montan en `/api/constancias/`
- Endpoints:
  - `GET /api/constancias/donacion/:id` — constancia de donación
  - `GET /api/constancias/estudio-gestante/:id` — constancia de estudio gestante

### Frontend

- Los servicios `donaciones-service.ts` y `estudios-gestantes-service.ts` tienen métodos `descargarConstancia` que llaman a los endpoints y disparan la descarga del PDF
- No se requiere ninguna librería adicional en el frontend

### Infraestructura / Compartido

- Chromium debe estar disponible en el entorno de producción (incluido automáticamente por Puppeteer)
- Para entornos serverless o contenedores sin Chromium, podría requerirse `puppeteer-core` con un Chromium instalado por separado

---

## Reglas Derivadas

- Toda generación de PDF para constancias se implementa con Puppeteer
- El HTML se construye con template strings dentro del servicio (no se usan archivos .hbs ni motores de plantillas externos)
- Los estilos CSS van inline para que Puppeteer los renderice sin dependencia de hojas externas
- No se usa jsPDF, PDFKit ni servicios externos de generación de PDF
- Si en el futuro se requiere generación batch de alto volumen, evaluar migrar a `puppeteer-core` con un pool de browsers o a una solución serverless como Gotenberg
