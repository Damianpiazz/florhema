import type { $Enums } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'

export async function findAllActive() {
  return prisma.grupoSanguineo.findMany({
    where: { deletedAt: null },
    orderBy: [{ tipo: 'asc' }, { factorRh: 'asc' }]
  })
}

export async function findById(id: number) {
  return prisma.grupoSanguineo.findUnique({ where: { id } })
}

export async function findByTipoFactorRh(tipo: string, factorRh: string, excludeId?: number) {
  return prisma.grupoSanguineo.findFirst({
    where: {
      tipo: tipo as $Enums.TipoABO,
      factorRh: factorRh as $Enums.FactorRh,
      NOT: excludeId ? { id: excludeId } : undefined
    }
  })
}

export async function update(id: number, data: { tipo: string; factorRh: string }, userId: number) {
  return prisma.grupoSanguineo.update({
    where: { id },
    data: {
      tipo: data.tipo as $Enums.TipoABO,
      factorRh: data.factorRh as $Enums.FactorRh,
      updatedById: userId
    }
  })
}

export async function softDelete(id: number, deletedById: number) {
  return prisma.grupoSanguineo.update({
    where: { id },
    data: { deletedAt: new Date(), deletedById }
  })
}

export async function countPersonasVinculadas(id: number) {
  return prisma.persona.count({
    where: { grupoSanguineoId: id, deletedAt: null }
  })
}
