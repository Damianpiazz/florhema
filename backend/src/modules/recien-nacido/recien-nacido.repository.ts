import { prisma } from '@/lib/prisma'

export async function findGestanteById(id: number) {
  return prisma.gestante.findFirst({
    where: { id, deletedAt: null },
  })
}

export async function findPersonaByDni(dni: string) {
  return prisma.persona.findFirst({
    where: { dni, deletedAt: null },
  })
}

export async function findGrupoById(id: number) {
  return prisma.grupoSanguineo.findUnique({ where: { id } })
}

export async function findById(id: number) {
  return prisma.recienNacido.findFirst({
    where: { id, deletedAt: null },
    include: {
      persona: true,
      pruebaCoombsDirecta: true,
    },
  })
}

export async function createInTransaction(data: {
  dni: string
  nombre: string
  apellido: string
  fechaNacimiento: Date
  direccion: string
  telefono: string
  grupoSanguineoId: number
  gestanteId: number
  coombsPositivo: boolean
}) {
  return prisma.$transaction(async (tx) => {
    const persona = await tx.persona.create({
      data: {
        dni: data.dni,
        nombre: data.nombre,
        apellido: data.apellido,
        fechaNacimiento: data.fechaNacimiento,
        direccion: data.direccion,
        telefono: data.telefono,
        grupoSanguineoId: data.grupoSanguineoId,
      },
    })

    const coombs = await tx.resultadoCoombs.create({
      data: {
        tipo: 'DIRECTO',
        positivo: data.coombsPositivo,
      },
    })

    const recienNacido = await tx.recienNacido.create({
      data: {
        personaId: persona.id,
        gestanteId: data.gestanteId,
        pruebaCoombsDirectaId: coombs.id,
      },
      include: {
        persona: true,
        pruebaCoombsDirecta: true,
      },
    })

    return recienNacido
  })
}

export async function updateInTransaction(id: number, data: {
  nombre?: string
  apellido?: string
  direccion?: string
  telefono?: string
  grupoSanguineoId?: number
  coombsPositivo?: boolean
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.recienNacido.findFirstOrThrow({
      where: { id, deletedAt: null },
    })

    if (data.nombre !== undefined || data.apellido !== undefined || data.direccion !== undefined || data.telefono !== undefined || data.grupoSanguineoId !== undefined) {
      await tx.persona.update({
        where: { id: existing.personaId },
        data: {
          ...(data.nombre !== undefined && { nombre: data.nombre }),
          ...(data.apellido !== undefined && { apellido: data.apellido }),
          ...(data.direccion !== undefined && { direccion: data.direccion }),
          ...(data.telefono !== undefined && { telefono: data.telefono }),
          ...(data.grupoSanguineoId !== undefined && { grupoSanguineoId: data.grupoSanguineoId }),
        },
      })
    }

    if (data.coombsPositivo !== undefined) {
      await tx.resultadoCoombs.update({
        where: { id: existing.pruebaCoombsDirectaId },
        data: { positivo: data.coombsPositivo },
      })
    }

    return tx.recienNacido.findFirstOrThrow({
      where: { id },
      include: {
        persona: true,
        pruebaCoombsDirecta: true,
      },
    })
  })
}

export async function softDelete(id: number) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.recienNacido.findFirstOrThrow({
      where: { id, deletedAt: null },
    })

    await tx.recienNacido.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    await tx.persona.update({
      where: { id: existing.personaId },
      data: { deletedAt: new Date() },
    })

    await tx.resultadoCoombs.update({
      where: { id: existing.pruebaCoombsDirectaId },
      data: { deletedAt: new Date() },
    })
  })
}

export async function findByGestanteId(gestanteId: number, limit: number, offset: number) {
  return prisma.recienNacido.findMany({
    where: { gestanteId, deletedAt: null, persona: { deletedAt: null } },
    include: {
      persona: true,
      pruebaCoombsDirecta: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
}

export async function countByGestanteId(gestanteId: number) {
  return prisma.recienNacido.count({
    where: { gestanteId, deletedAt: null, persona: { deletedAt: null } },
  })
}

export async function findAll(limit: number, offset: number) {
  return prisma.recienNacido.findMany({
    where: { deletedAt: null, persona: { deletedAt: null } },
    include: {
      persona: true,
      pruebaCoombsDirecta: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
}

export async function countAll() {
  return prisma.recienNacido.count({
    where: { deletedAt: null, persona: { deletedAt: null } },
  })
}
