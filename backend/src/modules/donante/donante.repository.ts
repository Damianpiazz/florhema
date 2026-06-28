import { prisma } from '@/lib/prisma'
import type { EstadoAptitud } from '@/generated/prisma/enums'

export async function findAll(filters: {
  dni?: string
  nombre?: string
  apellido?: string
  semaforoAptitud?: string
  limit: number
  offset: number
}) {
  return prisma.donante.findMany({
    where: {
      deletedAt: null,
      semaforoAptitud: filters.semaforoAptitud as EstadoAptitud | undefined,
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

export async function count(filters: {
  dni?: string
  nombre?: string
  apellido?: string
  semaforoAptitud?: string
}) {
  return prisma.donante.count({
    where: {
      deletedAt: null,
      semaforoAptitud: filters.semaforoAptitud as EstadoAptitud | undefined,
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

export async function findById(id: number) {
  return prisma.donante.findFirst({
    where: { id, deletedAt: null, persona: { deletedAt: null } },
    include: { persona: true },
  })
}

export async function findByDni(dni: string) {
  return prisma.donante.findFirst({
    where: { deletedAt: null, persona: { dni } },
    include: { persona: true },
  })
}

export async function findByIdWithDonaciones(id: number) {
  return prisma.donante.findFirst({
    where: { id, deletedAt: null, persona: { deletedAt: null } },
    include: {
      persona: true,
      donaciones: {
        where: { deletedAt: null },
        include: { resultadoSerologia: true },
        orderBy: { fecha: 'desc' },
      },
    },
  })
}

export async function update(id: number, data: { semaforoAptitud: string }) {
  return prisma.donante.update({
    where: { id },
    data: { semaforoAptitud: data.semaforoAptitud as EstadoAptitud },
  })
}
