import { prisma } from '@/lib/prisma'

export async function findAllActive() {
  return prisma.grupoSanguineo.findMany({
    where: { deletedAt: null },
    orderBy: [{ tipo: 'asc' }, { factorRh: 'asc' }]
  })
}
