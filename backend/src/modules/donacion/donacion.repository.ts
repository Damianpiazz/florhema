import { prisma } from '@/lib/prisma'
import type { TipoDonacion } from '@/generated/prisma/enums'

export async function findAll(filters: {
  donanteId?: number
  fechaDesde?: Date
  fechaHasta?: Date
  tipoDonacion?: string
  limit: number
  offset: number
}) {
  return prisma.donacion.findMany({
    where: {
      deletedAt: null,
      donanteId: filters.donanteId,
      fecha: {
        gte: filters.fechaDesde,
        lte: filters.fechaHasta,
      },
      tipoDonacion: filters.tipoDonacion as TipoDonacion | undefined,
    },
    include: {
      donante: {
        include: { persona: true },
      },
      resultadoSerologia: true,
    },
    orderBy: { fecha: 'desc' },
    take: filters.limit,
    skip: filters.offset,
  })
}

export async function count(filters: {
  donanteId?: number
  fechaDesde?: Date
  fechaHasta?: Date
  tipoDonacion?: string
}) {
  return prisma.donacion.count({
    where: {
      deletedAt: null,
      donanteId: filters.donanteId,
      fecha: {
        gte: filters.fechaDesde,
        lte: filters.fechaHasta,
      },
      tipoDonacion: filters.tipoDonacion as TipoDonacion | undefined,
    },
  })
}

export async function findById(id: number) {
  return prisma.donacion.findFirst({
    where: { id, deletedAt: null },
    include: {
      donante: {
        include: { persona: true },
      },
      resultadoSerologia: true,
    },
  })
}
