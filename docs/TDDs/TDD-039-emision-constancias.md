---
autor: Damián Piazza
fecha: 2026-06-25
titulo: Emisión automática de constancias y certificados
---

# TDD-039: Emisión de constancias (RF0009)

## Contexto de Negocio (PRD)

### Objetivo
Generar e imprimir automáticamente constancias de donación y certificados de grupo y factor, completando los datos del donante/persona sin necesidad de usar sellos manuales ni llenado a mano (CU-06).

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Poder emitir una constancia de donación para que el donante justifique su ausencia laboral, o un certificado de grupo y factor para entregar al paciente. Actualmente se hace a mano con sellos; se busca generar un PDF listo para imprimir/firmar.

### Criterios de Aceptación
*   El sistema debe generar un PDF de constancia de donación con: datos del donante, fecha, tipo de donación, peso, TA, hemoglobina, resultado de serología, y reacción adversa si existió.
*   El sistema debe generar un PDF de certificado de grupo y factor con: datos de la persona, grupo sanguíneo (tipo ABO + Rh), fecha de emisión.
*   La generación debe activarse desde un botón en la tabla de donaciones y desde el detalle de persona.
*   El PDF debe poder descargarse y/o abrirse en una nueva pestaña.
*   Los certificados deben incluir un código QR con un enlace de verificación (opcional, v2).

## Diseño Técnico (RFC)

### Backend

#### Endpoints nuevos
```
GET /api/v1/constancias/donacion/:donacionId
GET /api/v1/constancias/grupo-factor/:personaId
```

*   **Auth**: Requiere sesión activa.
*   **Response**: `application/pdf` con el archivo generado.

#### Generación de PDF
Se utilizará una librería ligera del lado del servidor:
*   **Opción recomendada**: `pdfmake` (generación programática de PDF en Node.js, sin dependencias de sistema).
*   El servidor genera el PDF en memoria y lo envía como stream.

#### Constancia de Donación — Contenido
```
HOSPITAL DE LAS FLORES — SERVICIO DE HEMOTERAPIA
CONSTANCIA DE DONACIÓN

Donante: {nombre} {apellido}
DNI: {dni}
Fecha de donación: {fecha}
Tipo: {tipoDonacion}
Peso: {peso} kg
Tensión Arterial: {tensionArterial}
Hemoglobina: {hemoglobina} g/dL
Serología: {hiv}, {hcv}, {hbv}, {chagas}, {sifilis}
Reacción adversa: {reaccionAdversa || 'Ninguna'}

Firma del profesional: ____________________
```

#### Certificado de Grupo y Factor — Contenido
```
HOSPITAL DE LAS FLORES — SERVICIO DE HEMOTERAPIA
CERTIFICADO DE GRUPO SANGUÍNEO Y FACTOR Rh

Paciente: {nombre} {apellido}
DNI: {dni}
Grupo Sanguíneo: {tipo}{factorRh}    (ej: A+)
Fecha de emisión: {fechaActual}

Válido como documento informativo.

Firma del profesional: ____________________
```

### Frontend

#### Botones de acción
*   En la tabla de donaciones (columna de acciones): botón con icono `FileText` → descarga la constancia.
*   En el detalle de persona: botón "Certificado de grupo y factor" en la card de datos personales.
*   En la página de donantes: botón "Constancia" en cada fila.

#### Lógica de descarga
Al hacer clic, el frontend hace un GET al endpoint correspondiente con `responseType: 'blob'` y dispara la descarga:

```typescript
async descargarConstanciaDonacion(donacionId: number): Promise<void> {
  const response = await api.get(`/constancias/donacion/${donacionId}`, {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `constancia-donacion-${donacionId}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
```

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Donación no existe | Error: no encontrada | 404 |
| Persona no existe | Error: no encontrada | 404 |
| Donación sin serología cargada | Se omite la sección de serología en el PDF | 200 |
| Donación eliminada (soft delete) | Error: no encontrada | 404 |
| Sin autenticación | Error: no autenticado | 401 |

## Plan de Implementación
1. Instalar `pdfmake` en backend.
2. Crear `constancia.service.ts` con generación de PDF de constancia de donación.
3. Crear `constancia.controller.ts` con handlers para ambos endpoints.
4. Crear `constancia.routes.ts` y montar en app.
5. Agregar método `descargarConstanciaDonacion` en el service de donaciones del frontend.
6. Agregar botón en `donaciones-table.tsx` columna de acciones.
7. Agregar botón de certificado en `persona-detalle` page.
8. Tests de integración del endpoint (mock de pdfmake).
