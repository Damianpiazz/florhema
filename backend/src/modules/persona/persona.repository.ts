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

export async function findByDni(dni: string) {
  return prisma.persona.findUnique({ where: { dni } })
}

export async function findGrupoSanguineoById(id: number) {
  return prisma.grupoSanguineo.findUnique({ where: { id } })
}

export async function create(data: {
  dni: string
  nombre: string
  apellido: string
  fechaNacimiento: Date
  direccion: string
  telefono: string
  grupoSanguineoId: number
  createdById: number
}) {
  return prisma.persona.create({
    data: {
      dni: data.dni,
      nombre: data.nombre,
      apellido: data.apellido,
      fechaNacimiento: data.fechaNacimiento,
      direccion: data.direccion,
      telefono: data.telefono,
      grupoSanguineoId: data.grupoSanguineoId,
      createdById: data.createdById,
    },
    include: { grupoSanguineo: true },
  })
}