import { prisma } from '@/lib/prisma'
import type { EstadoEstudio } from '@/generated/prisma/enums'

export async function findAllByGestanteId(gestanteId: number, filters: {
  fechaDesde?: Date
  fechaHasta?: Date
  estadoEstudio?: string
  limit: number
  offset: number
}) {
  return prisma.estudioGestante.findMany({
    where: {
      gestanteId,
      deletedAt: null,
      fecha: {
        gte: filters.fechaDesde,
        lte: filters.fechaHasta,
      },
      estadoEstudio: filters.estadoEstudio as EstadoEstudio | undefined,
    },
    include: {
      pruebaCoombsIndirecta: true,
    },
    orderBy: { fecha: 'desc' },
    take: filters.limit,
    skip: filters.offset,
  })
}

export async function countByGestanteId(gestanteId: number, filters: {
  fechaDesde?: Date
  fechaHasta?: Date
  estadoEstudio?: string
}) {
  return prisma.estudioGestante.count({
    where: {
      gestanteId,
      deletedAt: null,
      fecha: {
        gte: filters.fechaDesde,
        lte: filters.fechaHasta,
      },
      estadoEstudio: filters.estadoEstudio as EstadoEstudio | undefined,
    },
  })
}

export async function findAll(filters: {
  fechaDesde?: Date
  fechaHasta?: Date
  estadoEstudio?: string
  limit: number
  offset: number
}) {
  return prisma.estudioGestante.findMany({
    where: {
      deletedAt: null,
      fecha: {
        gte: filters.fechaDesde,
        lte: filters.fechaHasta,
      },
      estadoEstudio: filters.estadoEstudio as EstadoEstudio | undefined,
    },
    include: {
      pruebaCoombsIndirecta: true,
    },
    orderBy: { fecha: 'desc' },
    take: filters.limit,
    skip: filters.offset,
  })
}

export async function countAll(filters: {
  fechaDesde?: Date
  fechaHasta?: Date
  estadoEstudio?: string
}) {
  return prisma.estudioGestante.count({
    where: {
      deletedAt: null,
      fecha: {
        gte: filters.fechaDesde,
        lte: filters.fechaHasta,
      },
      estadoEstudio: filters.estadoEstudio as EstadoEstudio | undefined,
    },
  })
}

export async function findById(id: number) {
  return prisma.estudioGestante.findFirst({
    where: { id, deletedAt: null },
    include: {
      pruebaCoombsIndirecta: true,
    },
  })
}

export async function findGestanteById(id: number) {
  return prisma.gestante.findFirst({
    where: { id, deletedAt: null },
  })
}

export async function create(data: {
  gestanteId: number
  fecha: Date
  compatibilidadConyugal: string
  estadoEstudio: string
  pruebaCoombsIndirectaId: number
}) {
  return prisma.estudioGestante.create({
    data: {
      gestanteId: data.gestanteId,
      fecha: data.fecha,
      compatibilidadConyugal: data.compatibilidadConyugal,
      estadoEstudio: data.estadoEstudio as EstadoEstudio,
      pruebaCoombsIndirectaId: data.pruebaCoombsIndirectaId,
    },
    include: {
      pruebaCoombsIndirecta: true,
    },
  })
}

export async function update(id: number, data: {
  fecha?: Date
  compatibilidadConyugal?: string
  estadoEstudio?: string
}) {
  const updateData: any = {}
  if (data.fecha) updateData.fecha = data.fecha
  if (data.compatibilidadConyugal !== undefined) updateData.compatibilidadConyugal = data.compatibilidadConyugal
  if (data.estadoEstudio) updateData.estadoEstudio = data.estadoEstudio as EstadoEstudio

  return prisma.estudioGestante.update({
    where: { id },
    data: updateData,
    include: {
      pruebaCoombsIndirecta: true,
    },
  })
}

export async function softDelete(id: number) {
  return prisma.estudioGestante.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

export async function updateResultadoCoombs(id: number, data: {
  tipo: string
  positivo: boolean
}) {
  return prisma.resultadoCoombs.update({
    where: { id },
    data: {
      tipo: data.tipo as any,
      positivo: data.positivo,
    },
  })
}

export async function findResultadoCoombsById(id: number) {
  return prisma.resultadoCoombs.findFirst({
    where: { id, deletedAt: null },
  })
}

export async function softDeleteResultadoCoombs(id: number) {
  return prisma.resultadoCoombs.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
