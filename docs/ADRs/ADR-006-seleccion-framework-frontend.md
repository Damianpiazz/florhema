---
autor: DAMIAN Piazza
fecha: 2026-05-16
titulo: Selección de Framework Frontend — Next.js (App Router)
---

# ADR-006: Selección de Framework Frontend — Next.js (App Router)

## Contexto

Florhema necesita una interfaz de usuario web moderna para que el personal del Servicio de Hemoterapia gestione donantes, pacientes, transfusiones y reportes. Los requisitos son:

- Aplicación SPA con navegación fluida entre módulos
- Tipado fuerte con TypeScript
- Integración con Tailwind CSS y shadcn/ui
- Buena DX (hot reload, enrutamiento declarativo)
- Despliegue sencillo en entorno hospitalario
- SEO básico para landing o login (no crítico pero deseable)

Se evaluaron dos alternativas: Next.js con App Router y Vite + React puro.

---

## Decisión

Se utilizará **Next.js con App Router** como framework frontend.

Next.js provee enrutamiento basado en archivos, renderizado híbrido (SSR/CSR), y un ecosistema maduro con soporte oficial de TypeScript. No se utilizará Vite + React puro.

---

## Opciones Consideradas

### Opción 1: Next.js (App Router) — seleccionada

- Framework React con enrutamiento por sistema de archivos, server components y renderizado híbrido
- *Ventajas*: Enrutamiento declarativo y jerárquico mediante carpetas (`app/`), layouts anidados sin estado compartido global, React Server Components para reducir bundle del lado del cliente, SSR/SSG disponible sin configuración adicional, optimización de imágenes y assets integrada, ecosistema maduro con TypeScript nativo, despliegue sencillo (Vercel, Docker, Node.js server), comunidad masiva y recursos en español
- *Desventajas*: Mayor peso en node_modules que Vite+React, server components añaden complejidad conceptual (cliente vs servidor), el App Router tiene una curva de aprendizaje respecto al Pages Router, requiere Node.js en producción (no es solo estático)

### Opción 2: Vite + React puro

- Bundler ultrarrápido con React como librería de UI, sin framework de aplicación
- *Ventajas*: Build extremadamente rápido (esbuild/rollup), bundle más pequeño al no incluir server runtime, simplicidad conceptual (solo cliente), configuración mínima, ideal para SPAs puras sin SSR, despliegue como estático (CDN, Nginx)
- *Desventajas*: Enrutamiento manual (react-router-dom u otra librería), layouts requieren solución ad-hoc, sin SSR ni SSG nativos, sin optimización de imágenes integrada, sin server components, requiere configuración adicional para variables de entorno, el equipo tendría que decidir y mantener más librerías (router, fetch, meta tags)

---

## Consecuencias

### Positivas
- Enrutamiento declarativo y predecible con App Router (cada carpeta es una ruta)
- Layouts anidados que permiten estructurar la navegación del sistema (dashboard, módulos, formularios)
- Server Components para lógica de fetch de datos sin exponer tokens al cliente
- SSR disponible para páginas que lo requieran (reportes, certificados)
- Ecosistema unificado: shadcn/ui, Tailwind CSS, TypeScript funcionan out-of-the-box
- Despliegue flexible: puede correr como Node.js server o exportarse como estático

### Negativas
- Mayor tamaño de node_modules y dependencias frente a Vite+React
- React Server Components requieren entender la frontera cliente/servidor
- El App Router de Next.js 13+ cambió significativamente respecto al Pages Router
- En entorno hospitalario con redes restringidas, la telemetría de Next.js debe desactivarse

---

## Impacto en el Sistema

### Frontend
- Estructura base en `frontend/app/` con App Router
- Layout raíz para el shell de la aplicación (sidebar, navbar)
- Módulos de dominio como rutas anidadas: `app/donantes/`, `app/pacientes/`, `app/gestantes/`
- Componentes de UI en `frontend/components/` (shadcn/ui)
- Lógica de dominio en `frontend/features/` con sus hooks, servicios y componentes específicos

### Backend
- Sin impacto directo

### Infraestructura / Compartido
- Next.js puede desplegarse como Node.js server o como static export
- Variables de entorno con prefijo `NEXT_PUBLIC_` para datos del lado del cliente

---

## Reglas Derivadas

- Todo el enrutamiento se define mediante el sistema de carpetas de App Router, no con librerías externas (no react-router-dom)
- Los componentes que usan hooks de React o eventos del navegador llevan la directiva `"use client"`
- Los componentes que solo renderizan datos (sin interactividad) se mantienen como Server Components por defecto
- El fetch de datos inicial de cada ruta se hace desde Server Components o desde `generateMetadata`
- No se utiliza Pages Router (solo App Router)
- La telemetría de Next.js se desactiva con `next.config.js: { telemetry: false }`
