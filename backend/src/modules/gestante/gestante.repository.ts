import { prisma } from '@/lib/prisma'

export async function findPersonaById(id: number) {
  return prisma.persona.findFirst({
    where: { id, deletedAt: null },
  })
}

export async function findByPersonaId(personaId: number) {
  return prisma.gestante.findFirst({
    where: { personaId, deletedAt: null },
    include: { persona: true },
  })
}

export async function findById(id: number) {
  return prisma.gestante.findFirst({
    where: { id, deletedAt: null },
    include: { persona: true },
  })
}

export async function create(data: {
  personaId: number
  antecedentesObstetricos: string | null
}) {
  return prisma.gestante.create({
    data: {
      personaId: data.personaId,
      antecedentesObstetricos: data.antecedentesObstetricos,
    },
    include: { persona: true },
  })
}

export async function update(id: number, data: {
  antecedentesObstetricos: string | null
}) {
  return prisma.gestante.update({
    where: { id },
    data: { antecedentesObstetricos: data.antecedentesObstetricos },
    include: { persona: true },
  })
}

export async function softDelete(id: number) {
  return prisma.gestante.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

export async function countActiveEstudios(gestanteId: number) {
  return prisma.estudioGestante.count({
    where: { gestanteId, deletedAt: null },
  })
}

export async function countActiveRecienNacidos(gestanteId: number) {
  return prisma.recienNacido.count({
    where: { gestanteId, deletedAt: null },
  })
}

export async function findAll(filters: {
  dni?: string
  nombre?: string
  apellido?: string
  limit: number
  offset: number
}) {
  return prisma.gestante.findMany({
    where: {
      deletedAt: null,
      persona: {
        deletedAt: null,
        dni: filters.dni ? { contains: filters.dni } : undefined,
        nombre: filters.nombre
          ? { contains: filters.nombre, mode: 'insensitive' }
          : undefined,
        apellido: filters.apellido
          ? { contains: filters.apellido, mode: 'insensitive' }
          : undefined,
      },
    },
    include: {
      persona: true,
    },
    orderBy: [{ persona: { apellido: 'asc' } }, { persona: { nombre: 'asc' } }],
    take: filters.limit,
    skip: filters.offset,
  })
}

export async function countList(filters: {
  dni?: string
  nombre?: string
  apellido?: string
}) {
  return prisma.gestante.count({
    where: {
      deletedAt: null,
      persona: {
        deletedAt: null,
        dni: filters.dni ? { contains: filters.dni } : undefined,
        nombre: filters.nombre
          ? { contains: filters.nombre, mode: 'insensitive' }
          : undefined,
        apellido: filters.apellido
          ? { contains: filters.apellido, mode: 'insensitive' }
          : undefined,
      },
    },
  })
}
