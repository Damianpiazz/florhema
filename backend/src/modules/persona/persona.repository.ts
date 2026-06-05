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

export async function findByDni(dni: string, excludeId?: number) {
  if (excludeId !== undefined) {
    return prisma.persona.findFirst({
      where: { dni, NOT: { id: excludeId }, deletedAt: null },
    })
  }
  return prisma.persona.findUnique({ where: { dni } })
}

export async function findById(id: number) {
  return prisma.persona.findFirst({
    where: { id, deletedAt: null },
  })
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
    },
    include: { grupoSanguineo: true },
  })
}

export async function update(id: number, data: {
  dni: string
  nombre: string
  apellido: string
  fechaNacimiento: Date
  direccion: string
  telefono: string
  grupoSanguineoId: number
}) {
  return prisma.persona.update({
    where: { id },
    data: {
      dni: data.dni,
      nombre: data.nombre,
      apellido: data.apellido,
      fechaNacimiento: data.fechaNacimiento,
      direccion: data.direccion,
      telefono: data.telefono,
      grupoSanguineoId: data.grupoSanguineoId,
    },
    include: { grupoSanguineo: true },
  })
}

export async function softDelete(id: number) {
  return prisma.persona.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

export async function countVinculacionesActivas(id: number) {
  const [donante, paciente, gestante] = await Promise.all([
    prisma.donante.count({ where: { personaId: id, deletedAt: null } }),
    prisma.paciente.count({ where: { personaId: id, deletedAt: null } }),
    prisma.gestante.count({ where: { personaId: id, deletedAt: null } }),
  ])
  return donante + paciente + gestante
}