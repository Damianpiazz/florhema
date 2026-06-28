---
autor: Damián Piazza
fecha: 2026-06-25
titulo: Reportes estadísticos — Planillas HEMO
---

# TDD-040: Reportes estadísticos HEMO (RF0011)

## Contexto de Negocio (PRD)

### Objetivo
Consolidar automáticamente los datos cargados en el sistema para generar las estadísticas obligatorias requeridas por el Instituto de Hemoterapia de la Provincia de Buenos Aires: Planillas HEMO 1, 2, 3, 4 y 5 (CU-07).

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Al finalizar cada mes, debe presentar los informes estadísticos a la Provincia. Actualmente los completa manualmente a partir de los libros físicos. El sistema debe extraer estos datos automáticamente.

### Criterios de Aceptación
*   El sistema debe generar las 5 planillas HEMO con datos reales del sistema.
*   El usuario debe poder seleccionar un rango de fechas (mes/año) para el reporte.
*   Cada planilla debe exportarse como PDF (y opcionalmente como CSV para análisis).
*   Los datos deben reflejar el estado actual del sistema al momento de la generación.

### Planillas HEMO (según Instituto Provincial de Hemoterapia)

| Planilla | Descripción |
|----------|-------------|
| **HEMO 1** | Donantes atendidos: total, nuevos, repetitivos, por tipo (voluntarios/reposición), por grupo y factor. |
| **HEMO 2** | Hemocomponentes transfundidos: glóbulos rojos, plasma, plaquetas, crioprecipitado — discriminado por servicio solicitante. |
| **HEMO 3** | Unidades descartadas: cantidad y motivo (serología positiva, vencimiento, hemólisis, etc.). |
| **HEMO 4** | Reacciones adversas en donantes y pacientes: tipo, severidad, evolución. |
| **HEMO 5** | Gestantes estudiadas: cantidad de estudios realizados, Coombs indirecto, compatibilidad conyugal, recién nacidos evaluados. |

## Diseño Técnico (RFC)

### Backend

#### Endpoint
```
GET /api/v1/reportes/hemo
```

*   **Query params**: `fechaDesde` (YYYY-MM-DD), `fechaHasta` (YYYY-MM-DD), `formato` (pdf | csv, default pdf).
*   **Auth**: Requiere sesión activa.
*   **Response**: Archivo PDF o CSV.

#### Service: `reporte.service.ts`

```typescript
interface ReporteHEMO {
  hemo1: DonantesAtendidos
  hemo2: ComponentesTransfundidos
  hemo3: UnidadesDescartadas
  hemo4: ReaccionesAdversas
  hemo5: GestantesEstudiadas
}
```

Cada sección se obtiene mediante queries de agregación a la base de datos:

**HEMO 1 — Donantes atendidos**
```sql
-- Total de donaciones en el período
SELECT COUNT(*) as total,
  COUNT(DISTINCT donanteId) as donantes_unicos,
  tipoDonacion,
  -- Grupo y factor del donante mediante JOIN con Persona -> GrupoSanguineo
FROM Donacion
WHERE fecha BETWEEN :desde AND :hasta AND deletedAt IS NULL
GROUP BY tipoDonacion
```

**HEMO 2 — Componentes transfundidos**
```sql
SELECT componente, COUNT(*) as cantidad,
  -- servicio solicitante (no modelado aún, usar pacienteId como proxy)
FROM Transfusion
WHERE fecha BETWEEN :desde AND :hasta AND deletedAt IS NULL
GROUP BY componente
```

**HEMO 3 — Unidades descartadas**
Se consideran "descartadas" las donaciones con serología positiva (ROJO):
```typescript
const donacionesConSerologiaPositiva = await prisma.donacion.findMany({
  where: {
    fecha: { gte: desde, lte: hasta },
    resultadoSerologia: {
      OR: [
        { hiv: true }, { hcv: true }, { hbv: true },
        { chagas: true }, { sifilis: true },
      ],
    },
    deletedAt: null,
  },
  include: { resultadoSerologia: true },
})
```

**HEMO 4 — Reacciones adversas**
```sql
-- Donaciones con reaccionAdversa no nula
SELECT reaccionAdversa, COUNT(*) as cantidad
FROM Donacion
WHERE fecha BETWEEN :desde AND :hasta
  AND reaccionAdversa IS NOT NULL
  AND deletedAt IS NULL
GROUP BY reaccionAdversa

-- Transfusiones con reaccionAdversa no nula
SELECT reaccionAdversa, COUNT(*) as cantidad
FROM Transfusion
WHERE fecha BETWEEN :desde AND :hasta
  AND reaccionAdversa IS NOT NULL
  AND deletedAt IS NULL
GROUP BY reaccionAdversa
```

**HEMO 5 — Gestantes estudiadas**
```sql
SELECT COUNT(DISTINCT gestanteId) as gestantes,
  COUNT(*) as total_estudios,
  -- Coombs indirecto positivo/negativo
  -- Compatibilidad conyugal
FROM EstudioGestante
WHERE fecha BETWEEN :desde AND :hasta AND deletedAt IS NULL
```

#### Generación de PDF
Reutilizar `pdfmake` (instalado en TDD-039). El PDF incluirá:
*   Encabezado: "Hospital de Las Flores — Servicio de Hemoterapia"
*   Título: "Reporte Estadístico HEMO — {mes}/{año}"
*   5 secciones numeradas correspondientes a cada planilla, cada una con su tabla de datos.
*   Footer con fecha de generación y firma digital del sistema.

#### Generación de CSV (opcional v1, prioridad v2)
Cada planilla se exporta como archivo CSV separado o como un ZIP con 5 CSVs.

### Frontend

#### Página `/reportes`
*   Ruta: `frontend/app/(protected)/reportes/page.tsx`
*   Selector de mes y año (DatePicker o selectores de mes/año).
*   Botón "Generar reporte HEMO".
*   Preview del reporte (opcional, mostrar indicador de carga mientras se genera).
*   Botón de descarga del PDF.

#### Menú lateral
Agregar entrada "Reportes" en `app-sidebar.tsx` con icono `BarChart3`.

## Casos de Borde y Errores

| Escenario | Resultado Esperado | Código HTTP |
|-----------|--------------------|-------------|
| Período sin datos | PDF con todas las planillas en cero | 200 |
| FechaDesde > FechaHasta | Error: rango inválido | 400 |
| Período mayor a 1 año | Error: solicitar rango menor | 400 |
| Sin autenticación | Error: no autenticado | 401 |

## Plan de Implementación
1. Instalar `pdfmake` en backend (si no se instaló en TDD-039).
2. Crear `reporte.service.ts` con las 5 queries de agregación.
3. Crear `reporte.controller.ts` con handler para `GET /reportes/hemo`.
4. Crear `reporte.routes.ts` y montar en app.
5. Agregar endpoint de exportación CSV (v2).
6. Crear página de reportes en frontend con selector de fecha y botón de descarga.
7. Agregar entrada en `app-sidebar.tsx`.
8. Tests de integración del endpoint (mock de pdfmake, datos de prueba).
