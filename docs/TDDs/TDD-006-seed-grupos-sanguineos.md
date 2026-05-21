---
autor: Damián Piazza
fecha: 2026-05-21
titulo: Seed de Grupos Sanguíneos
---

# TDD-006: Seed de Grupos Sanguíneos

## Contexto de Negocio (PRD)

### Objetivo
Los 8 grupos sanguíneos estándar (ABO + Rh) son datos fijos del dominio de hemoterapia. No se crean desde la UI sino que deben precargarse al inicializar la base de datos.

### User Persona
*   **Nombre**: Administrador del sistema / DevOps
*   **Necesidad**: Al inicializar la BD, los 8 grupos deben existir para poder asignarlos a personas, donantes y pacientes.

### Criterios de Aceptación
*   Al ejecutar `npx prisma db seed` deben existir los 8 grupos sanguíneos
*   El seed debe ser idempotente: ejecutarlo múltiples veces no debe crear duplicados
*   Si un grupo ya existe (misma combinación tipo + factorRh), se omite (upsert)
*   Debe integrarse con el seed existente (`prisma/seed/index.ts`)

## Diseño Técnico (RFC)

### Estructura del Código

```
prisma/
└── seed/
    ├── index.ts              ← ya existe, invoca seedGrupoSanguineo()
    └── grupo-sanguineo.seed.ts  ← NUEVO
```

### Contrato del Seed

**Archivo**: `prisma/seed/grupo-sanguineo.seed.ts`

```ts
import { prisma } from '@/lib/prisma'
import { TipoABO, FactorRh } from '@prisma/client'

const GRUPOS: { tipo: TipoABO; factorRh: FactorRh }[] = [
  { tipo: 'A', factorRh: 'POSITIVO' },
  { tipo: 'A', factorRh: 'NEGATIVO' },
  { tipo: 'B', factorRh: 'POSITIVO' },
  { tipo: 'B', factorRh: 'NEGATIVO' },
  { tipo: 'AB', factorRh: 'POSITIVO' },
  { tipo: 'AB', factorRh: 'NEGATIVO' },
  { tipo: 'O', factorRh: 'POSITIVO' },
  { tipo: 'O', factorRh: 'NEGATIVO' },
]

export async function seedGrupoSanguineo() {
  for (const grupo of GRUPOS) {
    await prisma.grupoSanguineo.upsert({
      where: { tipo_factorRh: { tipo: grupo.tipo, factorRh: grupo.factorRh } },
      create: grupo,
      update: {},
    })
  }
  console.log(`  - ${GRUPOS.length} grupos sanguíneos sincronizados.`)
}
```

**Integración en `prisma/seed/index.ts`**:

```ts
import { prisma } from '@/lib/prisma'
import { seedAdmin } from './admin.seed'
import { seedGrupoSanguineo } from './grupo-sanguineo.seed'

async function main() {
  console.log('Corriendo seeds...')
  await seedAdmin()
  await seedGrupoSanguineo()
  console.log('Seeds completados.')
}
// ...
```

## Casos de Borde y Errores

| Escenario | Resultado Esperado |
|---|---|
| Seed ejecutado por primera vez | Crea los 8 grupos |
| Seed ejecutado segunda vez | No crea duplicados (upsert) |
| Error de conexión a BD | Falla con error, rollback implícito |

## Plan de Implementación

1. Crear `prisma/seed/grupo-sanguineo.seed.ts` con upsert de los 8 grupos
2. Modificar `prisma/seed/index.ts` para invocar `seedGrupoSanguineo()` después de `seedAdmin()`
3. Ejecutar `npx prisma db seed` y verificar con `GET /api/v1/grupos-sanguineos` que devuelva los 8 grupos
4. Test: el test de integración de TDD-005 debe validar que los 8 grupos existen después del seed
