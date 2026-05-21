---
autor: DAMIAN Piazza
fecha: 2026-05-21
titulo: Estilos y Componentes — Tailwind CSS v4 + shadcn/ui
---

# ADR-021: Estilos y Componentes — Tailwind CSS v4 + shadcn/ui

## Contexto

Florhema necesita un sistema de estilos y componentes para la interfaz de usuario del frontend. Los requisitos clave son:

- Desarrollo rápido de UI con consistencia visual
- Sistema de diseño personalizable que refleje la identidad del hospital
- Componentes accesibles (ARIA) y probados
- Soporte de modo oscuro
- Tipado fuerte con TypeScript
- Bundle pequeño, evitando librerías de UI pesadas
- Facilidad para crear componentes específicos del dominio (formularios clínicos, tablas de datos, etc.)

Se evaluaron dos enfoques complementarios:

**Para estilos**: Tailwind CSS v4 vs CSS Modules vs styled-components
**Para componentes**: shadcn/ui (Radix UI) vs Material UI vs Ant Design vs componentes propios

---

## Decisión

Se utilizará **Tailwind CSS v4** como framework de estilos y **shadcn/ui** (basado en Radix UI) como librería de componentes. La combinación funcionará de la siguiente manera:

- Tailwind CSS v4 via `@tailwindcss/postcss` para estilos utility-first
- shadcn/ui para componentes de UI accesibles y personalizables (botones, inputs, modales, tabs, etc.)
- `clsx` + `tailwind-merge` para combinación de clases condicionales
- `lucide-react` para íconos
- `tw-animate-css` para animaciones
- Modo oscuro via clase `.dark` y `@custom-variant dark` en CSS

No se utilizarán CSS Modules, styled-components, Material UI ni Ant Design.

---

## Opciones Consideradas

### Opción 1: Tailwind CSS v4 + shadcn/ui (seleccionada)

- **Tailwind CSS v4**: Framework utility-first con generación Just-in-Time
- **shadcn/ui**: Colección de componentes accesibles basados en Radix UI, copiados al proyecto (no es una dependencia en runtime)
- *Ventajas*:
  - Tailwind: Desarrollo rápido sin escribir CSS personalizado, bundle mínimo (purge automático de clases no usadas), consistencia visual mediante el sistema de diseño (colores, espaciado, tipografía), modo oscuro nativo, personalización total mediante `@theme inline` y variables CSS, tipado con TypeScript mediante `@tailwindcss/postcss`
  - shadcn/ui: Componentes accesibles (ARIA, keyboard navigation, focus management), personalización total (son componentes copiados, no una librería), basado en Radix UI (estándar de accesibilidad en React), estilo Tailwind nativo, bundle solo con los componentes que se usan, actualizaciones vía CLI (`shadcn add`)
  - Combinación: Curva de aprendizaje baja para el equipo (Tailwind es prevalente), ecosistema masivo, documentación extensa en español
- *Desventajas*: HTML con muchas clases utility (puede verse verboso), shadcn/ui requiere copiar componentes manualmente (sin actualización automática), algunas variantes complejas de Tailwind pueden requerir CSS personalizado, dependencia de Radix UI para componentes accesibles (aunque es una dependencia confiable)

### Opción 2 (Estilos): CSS Modules

- CSS clásico con scoping automático por módulo
- *Ventajas*: CSS estándar sin curva de aprendizaje, separación completa de estilos y markup, sin dependencias externas para estilos
- *Desventajas*: Mayor cantidad de archivos (un `.module.css` por componente), sin sistema de diseño integrado (colores, espaciado, tipografía se definen ad-hoc), dificultad para mantener consistencia visual, modo oscuro requiere solución manual, desarrollo más lento que Tailwind

### Opción 3 (Estilos): styled-components

- CSS-in-JS con estilos declarativos en componentes React
- *Ventajas*: Estilos colocalizados con el componente, props dinámicas para variantes, temas globales con ThemeProvider
- *Desventajas*: Bundle más pesado (runtime CSS-in-JS), rendimiento inferior en renderizado (inyección de estilos en runtime), deprecación parcial del paradigma en favor de CSS utility y server components (Next.js App Router), mayor complejidad conceptual, no recomendado con React Server Components

### Opción 4 (Componentes): Material UI

- Librería completa de componentes con Material Design
- *Ventajas*: Catálogo masivo de componentes (tablas, date pickers, autocompletados), sistema de theming robusto, documentación extensa, accesibilidad integrada
- *Desventajas*: Bundle muy pesado (~100KB+ gzipped), personalización compleja (requiere sobrescribir el theme), estilo Material Design difícil de adaptar a una identidad hospitalaria, actualizaciones mayores con breaking changes frecuentes, no está optimizado para Next.js App Router (server components)

### Opción 5 (Componentes): Ant Design

- Librería de componentes empresarial con diseño chino
- *Ventajas*: Componentes complejos listos (tablas con filtros, formularios, date pickers), internacionalización integrada, tema customizable
- *Desventajas*: Bundle pesado, estilo visual distintivo difícil de adaptar, documentación principalmente en chino/inglés, personalización CSS compleja (usa Less), no optimizado para server components

### Opción 6 (Componentes): Componentes propios desde cero

- Todos los componentes creados manualmente con HTML nativo + Tailwind
- *Ventajas*: Control total, bundle mínimo, sin dependencias externas
- *Desventajas*: Tiempo de desarrollo muy alto, riesgo de errores de accesibilidad, necesidad de implementar features complejas (modales, dropdowns, comboboxes) manualmente, testing de accesividad requerido

---

## Consecuencias

### Positivas
- Desarrollo rápido de UI con utilidades de Tailwind y componentes pre-construidos de shadcn
- Bundle mínimo: solo se incluyen los componentes de shadcn que se usan (copia local)
- Componentes accesibles out-of-the-box (Radix UI maneja ARIA, keyboard navigation, focus trapping)
- Modo oscuro implementado con `@custom-variant dark` y variables CSS
- Sistema de diseño centralizado mediante `@theme inline` en `globals.css`
- Personalización total sin luchar contra estilos de librería
- `tailwind-merge` resuelve conflictos de clases condicionales de forma predecible

### Negativas
- Los componentes de shadcn/ui se actualizan manualmente (requiere atención a nuevas versiones)
- HTML con muchas clases utility puede ser verboso en componentes complejos
- Dependencia de Radix UI para funcionalidad de componentes (aunque es una dependencia estable y bien mantenida)
- tw-animate-css añade una dependencia para animaciones que podría manejarse con Tailwind nativo

---

## Impacto en el Sistema

### Frontend
- Tailwind CSS v4 configurado en `frontend/app/globals.css` con `@import "tailwindcss"`
- shadcn/ui configurado en `frontend/components.json` con estilo `radix-nova`
- Componentes UI en `frontend/components/ui/` (copiados vía `shadcn add`)
- Función `cn()` en `frontend/lib/utils.ts` para combinar clases (clsx + twMerge)
- Variables CSS de diseño (colores, radios, fuentes) definidas en `globals.css` via `@theme inline`
- Modo oscuro manejado con clase `.dark` en el HTML y variante `dark:` en Tailwind
- Íconos importados de `lucide-react` en componentes

### Backend
- Sin impacto directo

### Infraestructura / Compartido
- Sin impacto directo

---

## Reglas Derivadas

- No se usa CSS Modules, styled-components ni librerías CSS-in-JS (incompatibles con Server Components de Next.js)
- Los componentes de shadcn/ui se agregan con `shadcn add` y se modifican solo si es estrictamente necesario
- Las personalizaciones de diseño van en `globals.css` mediante `@theme inline`, no en archivos CSS separados
- La función `cn()` de `@/lib/utils` es la única forma permitida de combinar clases condicionales
- No se importan librerías de UI pesadas (Material UI, Ant Design) ni se agregan sin un ADR
- Los íconos se importan exclusivamente de `lucide-react`
- El modo oscuro se activa agregando la clase `.dark` al elemento `<html>`
- No se escribe CSS personalizado a menos que Tailwind no pueda expresar el estilo requerido
