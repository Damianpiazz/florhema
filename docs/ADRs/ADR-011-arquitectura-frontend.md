---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Arquitectura del Frontend — Feature-Based
---

# ADR-011: Arquitectura del Frontend — Feature-Based

## Contexto

Florhema tiene un frontend en Next.js con App Router. Next.js impone la carpeta `app/` para el routing, pero el resto de la organización queda a criterio del equipo. Se necesita una estructura que separe responsabilidades y que cada módulo de negocio sea autocontenido.

---

## Decisión

El frontend se organiza por responsabilidades, con los módulos de dominio agrupados bajo `features/`. Cada feature encapsula su propia UI, lógica y servicios. `app/` se mantiene liviano, solo con routing y layouts, delegando la lógica a las features.

La estructura es un punto de partida, no definitiva; puede ajustarse a medida que el proyecto crezca.

Ejemplo orientativo:
```
frontend/
├── app/
├── features/
│   ├── donantes/
│   ├── pacientes/
│   ├── gestantes/
│   └── reportes/
├── components/
├── services/
├── hooks/
├── lib/
└── utils/
```

- `app/` — routing y layouts (Next.js App Router)
- `features/` — módulos de dominio, cada uno con sus componentes, hooks y servicios específicos
- `components/` — componentes UI compartidos, sin lógica de negocio
- `services/` — comunicación con la API
- `hooks/` — hooks globales reutilizables
- `lib/` — inicialización y configuración de librerías
- `utils/` — funciones puras helpers

---

## Opciones Consideradas

### Opción 1: Feature-based — seleccionada

Cada dominio es autocontenido dentro de `features/`.

**Ventajas:** escalable, fácil de navegar, desacoplado, se puede trabajar en un módulo sin conocer los otros.

**Desventajas:** puede haber duplicación de lógica similar entre features.

### Opción 2: Todo en componentes/

Estructura plana sin separación por dominio.

**Ventajas:** simple al inicio.

**Desventajas:** no escala, mezcla lógica de dominios distintos, difícil de mantener.

### Opción 3: Capas técnicas sin features

Todo separado por tipo técnico (components/, hooks/, services/) sin agrupar por dominio.

**Ventajas:** separación técnica clara.

**Desventajas:** la lógica de un mismo dominio queda dispersa en varias carpetas, difícil de seguir.

---

## Consecuencias

### Positivas
- El routing está desacoplado de la lógica de negocio
- Cada feature se puede desarrollar y testear de forma independiente
- Los componentes compartidos evitan duplicación visual
- La estructura es predecible: mismo patrón en cada feature

### Negativas
- Puede haber lógica repetida entre features similares
- Si una feature crece mucho, puede requerir dividirse en submódulos

---

## Reglas Derivadas

- `app/` solo contiene routing y layouts, sin lógica de negocio
- Cada feature es autocontenida: no depende de otra feature para funcionar
- Lo que sea compartido entre features va en `components/`, `hooks/` o `utils/`
- La estructura puede modificarse si el proyecto lo requiere
