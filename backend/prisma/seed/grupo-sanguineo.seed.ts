import { prisma } from '@/lib/prisma'
import type { TipoABO, FactorRh } from '@prisma/client'

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
