import { prisma } from '@/lib/prisma'

export async function findAll(filters: {
  dni?: string
  limit: number
  offset: number
}) {
  return prisma.persona.findMany({
    where: {
      deletedAt: null,
      dni: filters.dni
        ? { contains: filters.dni }
        : undefined,
    },
    include: {
      grupoSanguineo: true,
    },
    orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    take: filters.limit,
    skip: filters.offset,
  })
}

export async function count(filters: { dni?: string }) {
  return prisma.persona.count({
    where: {
      deletedAt: null,
      dni: filters.dni
        ? { contains: filters.dni }
        : undefined,
    },
  })
}