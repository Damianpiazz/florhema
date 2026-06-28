---
autor: Damián Piazza
fecha: 2026-06-24
titulo: Cálculo automático del semáforo de aptitud del donante
---

# TDD-039: Semáforo de aptitud del donante

## Contexto de Negocio (PRD)

### Objetivo
Implementar la lógica de negocio que calcula automáticamente el estado del semáforo del donante (VERDE/AMARILLO/ROJO) basándose en los resultados de serología y los controles físicos obligatorios.

### User Persona
*   **Nombre**: Técnico / Licenciado en Hemoterapia
*   **Necesidad**: Al ingresar el DNI de un donante, el sistema debe indicar su estado mediante un semáforo visual sin necesidad de revisar manualmente cada resultado de laboratorio.

### Criterios de Aceptación

#### RF0006 - Sistema de alertas visuales
*   **VERDE**: Donante apto para donar
*   **AMARILLO**: Dudas a rever (segunda muestra pendiente)
*   **ROJO**: Excluido definitivamente por serología positiva previa

#### RF0007 - Validación biomédica
*   Edad mayor a 16 años (con autorización)
*   Peso superior a 50 kg
*   Hemoglobina entre 12.5 y 17.5 g/dL
*   Tensión arterial entre 100/110 y 170 (sistólica)

#### RF0008 - Bloqueo temporal
*   Serología dudosa o reactiva → AMARILLO hasta segunda muestra

### Reglas de Negocio

```
Si alguna serología (HIV, HCV, HBV, Chagas, Sífilis) es positiva
  → ROJO (excluido permanente)

Si la última donación tiene serología pendiente o dudosa
  → AMARILLO (bloqueo temporal)

Si cumple todos los requisitos físicos (peso, hemoglobina, TA)
  Y todas las serologías son negativas
  → VERDE (apto)

Si no cumple requisitos físicos
  → AMARILLO (no apto temporal)
```

## Diseño Técnico (RFC)

### Contrato de API

*   **Endpoint**: `POST /api/v1/donantes/:id/calcular-semaforo`
*   **Auth**: Requiere sesión activa
*   **Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "item": {
      "id": 1,
      "semaforoAptitud": "VERDE",
      "motivo": "Todos los requisitos cumplidos"
    }
  }
}
```

### Backend

#### Service: `calcularSemaforo(donanteId)`

```typescript
async function calcularSemaforo(donanteId: number): Promise<EstadoAptitud> {
  const donante = await donanteRepository.findByIdWithDonaciones(donanteId)
  if (!donante) throw new AppError(404, 'Donante no encontrado')

  const ultimaDonacion = donante.donaciones
    .filter(d => !d.deletedAt)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())[0]

  // Regla 1: Serología positiva → ROJO
  if (ultimaDonacion?.resultadoSerologia) {
    const s = ultimaDonacion.resultadoSerologia
    if (s.hiv || s.hcv || s.hbv || s.chagas || s.sifilis) {
      return EstadoAptitud.ROJO
    }
  }

  // Regla 2: Requisitos físicos
  if (ultimaDonacion) {
    if (ultimaDonacion.peso < 50) return EstadoAptitud.AMARILLO
    if (ultimaDonacion.hemoglobina < 12.5 || ultimaDonacion.hemoglobina > 17.5)
      return EstadoAptitud.AMARILLO
    // Validar TA (formato "sistólica/diastólica")
    const [sistolica] = ultimaDonacion.tensionArterial.split('/').map(Number)
    if (sistolica < 100 || sistolica > 170) return EstadoAptitud.AMARILLO
  }

  // Regla 3: Sin serología cargada → AMARILLO
  if (!ultimaDonacion?.resultadoSerologia) {
    return EstadoAptitud.AMARILLO
  }

  // Regla 4: Todos los checks OK → VERDE
  return EstadoAptitud.VERDE
}
```

#### Integración

El cálculo del semáforo se puede ejecutar:
- Manualmente desde el frontend (botón "Calcular semáforo")
- Automáticamente después de crear/actualizar una donación (hook en service)
- Como un comando programático (ej. job nocturno)

## Casos de Borde y Errores

| Escenario | Resultado Esperado |
|-----------|--------------------|
| HIV positivo en última donación | ROJO |
| HCV positivo en última donación | ROJO |
| Chagas positivo en última donación | ROJO |
| Peso < 50 kg en última donación | AMARILLO |
| Hemoglobina < 12.5 en última donación | AMARILLO |
| Hemoglobina > 17.5 en última donación | AMARILLO |
| TA sistólica < 100 en última donación | AMARILLO |
| TA sistólica > 170 en última donación | AMARILLO |
| Sin donaciones registradas | AMARILLO (sin datos) |
| Sin serología en última donación | AMARILLO (pendiente) |
| Todos los checks OK | VERDE |
| Donante no existe | 404 |
| Sin autenticación | 401 |

## Plan de Implementación

### Backend
1. Implementar `calcularSemaforo()` en `donante.service.ts` con todas las reglas de negocio
2. Agregar endpoint `POST /donantes/:id/calcular-semaforo`
3. Agregar hook opcional en `donacion.service.ts` que recalcula el semáforo después de crear/actualizar una donación
4. Tests unitarios para cada regla de negocio (al menos 10 casos)
5. Tests de integración del endpoint

### Frontend
6. Indicador visual del semáforo en la tabla de donantes (círculo verde/amarillo/rojo)
7. Botón "Recalcular semáforo" en el detalle del donante
8. Mostrar el motivo del estado actual (tooltip o texto auxiliar)
