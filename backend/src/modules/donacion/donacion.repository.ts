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

export async function update(
  id: number,
  data: {
    donanteId: number
    fecha: Date
    peso: number
    tensionArterial: string
    hemoglobina: number
    tipoDonacion: string
    reaccionAdversa: string | null
    resultadoSerologia?: {
      hiv: boolean
      hcv: boolean
      hbv: boolean
      chagas: boolean
      sifilis: boolean
    } | null
  },
) {
  return prisma.donacion.update({
    where: { id },
    data: {
      donanteId: data.donanteId,
      fecha: data.fecha,
      peso: data.peso,
      tensionArterial: data.tensionArterial,
      hemoglobina: data.hemoglobina,
      tipoDonacion: data.tipoDonacion as TipoDonacion,
      reaccionAdversa: data.reaccionAdversa ?? null,
      resultadoSerologia: data.resultadoSerologia
        ? { upsert: { create: data.resultadoSerologia, update: data.resultadoSerologia } }
        : undefined,
    },
    include: {
      donante: { include: { persona: true } },
      resultadoSerologia: true,
    },
  })
}

export async function findDonanteById(id: number) {
  return prisma.donante.findFirst({
    where: { id, deletedAt: null },
  })
}

export async function findDonanteByPersonaDni(dni: string) {
  return prisma.donante.findFirst({
    where: { deletedAt: null, persona: { dni } },
  })
}

export async function create(data: {
  donanteId: number
  fecha: Date
  peso: number
  tensionArterial: string
  hemoglobina: number
  tipoDonacion: string
  reaccionAdversa: string | null
  resultadoSerologia?: {
    hiv: boolean
    hcv: boolean
    hbv: boolean
    chagas: boolean
    sifilis: boolean
  } | null
}) {
  return prisma.donacion.create({
    data: {
      donanteId: data.donanteId,
      fecha: data.fecha,
      peso: data.peso,
      tensionArterial: data.tensionArterial,
      hemoglobina: data.hemoglobina,
      tipoDonacion: data.tipoDonacion as TipoDonacion,
      reaccionAdversa: data.reaccionAdversa ?? null,
      resultadoSerologia: data.resultadoSerologia
        ? { create: data.resultadoSerologia }
        : undefined,
    },
    include: {
      donante: {
        include: { persona: true },
      },
      resultadoSerologia: true,
    },
  })
}
