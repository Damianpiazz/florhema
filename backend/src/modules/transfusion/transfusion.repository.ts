import { prisma } from '@/lib/prisma'
import type { TipoHemocomponente } from '@/generated/prisma/enums'

export async function findAll(filters: {
  pacienteId?: number
  fechaDesde?: Date
  fechaHasta?: Date
  componente?: string
  limit: number
  offset: number
}) {
  return prisma.transfusion.findMany({
    where: {
      deletedAt: null,
      pacienteId: filters.pacienteId,
      fecha: {
        gte: filters.fechaDesde,
        lte: filters.fechaHasta,
      },
      componente: filters.componente as TipoHemocomponente | undefined,
    },
    include: {
      paciente: { include: { persona: true } },
      compatibilidad: { include: { donanteGrupo: true, receptorGrupo: true } },
      resultadoCoombs: true,
    },
    orderBy: { fecha: 'desc' },
    take: filters.limit,
    skip: filters.offset,
  })
}

export async function count(filters: {
  pacienteId?: number
  fechaDesde?: Date
  fechaHasta?: Date
  componente?: string
}) {
  return prisma.transfusion.count({
    where: {
      deletedAt: null,
      pacienteId: filters.pacienteId,
      fecha: {
        gte: filters.fechaDesde,
        lte: filters.fechaHasta,
      },
      componente: filters.componente as TipoHemocomponente | undefined,
    },
  })
}

export async function findById(id: number) {
  return prisma.transfusion.findFirst({
    where: { id, deletedAt: null },
    include: {
      paciente: { include: { persona: true } },
      compatibilidad: { include: { donanteGrupo: true, receptorGrupo: true } },
      resultadoCoombs: true,
    },
  })
}

export async function findPacienteById(id: number) {
  return prisma.paciente.findFirst({
    where: { id, deletedAt: null },
  })
}

export async function findPacienteByPersonaDni(dni: string) {
  return prisma.paciente.findFirst({
    where: { deletedAt: null, persona: { dni } },
  })
}

export async function findGrupoById(id: number) {
  return prisma.grupoSanguineo.findFirst({
    where: { id, deletedAt: null },
  })
}

export async function create(data: {
  pacienteId: number
  fecha: Date
  componente: string
  cantidadUnidades: number
  reaccionAdversa: string | null
  compatibilidad: {
    donanteGrupoId: number
    receptorGrupoId: number
    compatible: boolean
    motivoIncompatibilidad: string | null
  }
  resultadoCoombs: {
    tipo: string
    positivo: boolean
  }
}) {
  return prisma.$transaction(async (tx) => {
    const resultadoCoombs = await tx.resultadoCoombs.create({
      data: { tipo: data.resultadoCoombs.tipo as any, positivo: data.resultadoCoombs.positivo },
    })

    const compatibilidad = await tx.compatibilidadTransfusional.create({
      data: {
        donanteGrupoId: data.compatibilidad.donanteGrupoId,
        receptorGrupoId: data.compatibilidad.receptorGrupoId,
        compatible: data.compatibilidad.compatible,
        motivoIncompatibilidad: data.compatibilidad.motivoIncompatibilidad ?? null,
      },
    })

    return tx.transfusion.create({
      data: {
        pacienteId: data.pacienteId,
        fecha: data.fecha,
        componente: data.componente as TipoHemocomponente,
        cantidadUnidades: data.cantidadUnidades,
        reaccionAdversa: data.reaccionAdversa ?? null,
        compatibilidadId: compatibilidad.id,
        resultadoCoombsId: resultadoCoombs.id,
      },
      include: {
        paciente: { include: { persona: true } },
        compatibilidad: { include: { donanteGrupo: true, receptorGrupo: true } },
        resultadoCoombs: true,
      },
    })
  })
}

export async function update(
  id: number,
  data: {
    fecha?: Date
    componente?: string
    cantidadUnidades?: number
    reaccionAdversa?: string | null
    compatibilidad?: {
      donanteGrupoId: number
      receptorGrupoId: number
      compatible: boolean
      motivoIncompatibilidad: string | null
    }
    resultadoCoombs?: {
      tipo: string
      positivo: boolean
    }
  },
) {
  return prisma.$transaction(async (tx) => {
    const existente = await tx.transfusion.findFirst({ where: { id } })

    const updateData: any = {}
    if (data.fecha) updateData.fecha = data.fecha
    if (data.componente) updateData.componente = data.componente as TipoHemocomponente
    if (data.cantidadUnidades !== undefined) updateData.cantidadUnidades = data.cantidadUnidades
    if (data.reaccionAdversa !== undefined) updateData.reaccionAdversa = data.reaccionAdversa ?? null

    if (data.compatibilidad) {
      if (existente?.compatibilidadId) {
        await tx.compatibilidadTransfusional.update({
          where: { id: existente.compatibilidadId },
          data: {
            donanteGrupoId: data.compatibilidad.donanteGrupoId,
            receptorGrupoId: data.compatibilidad.receptorGrupoId,
            compatible: data.compatibilidad.compatible,
            motivoIncompatibilidad: data.compatibilidad.motivoIncompatibilidad ?? null,
          },
        })
      } else {
        const nueva = await tx.compatibilidadTransfusional.create({
          data: {
            donanteGrupoId: data.compatibilidad.donanteGrupoId,
            receptorGrupoId: data.compatibilidad.receptorGrupoId,
            compatible: data.compatibilidad.compatible,
            motivoIncompatibilidad: data.compatibilidad.motivoIncompatibilidad ?? null,
          },
        })
        updateData.compatibilidadId = nueva.id
      }
    }

    if (data.resultadoCoombs) {
      if (existente?.resultadoCoombsId) {
        await tx.resultadoCoombs.update({
          where: { id: existente.resultadoCoombsId },
          data: {
            tipo: data.resultadoCoombs.tipo as any,
            positivo: data.resultadoCoombs.positivo,
          },
        })
      } else {
        const nueva = await tx.resultadoCoombs.create({
          data: { tipo: data.resultadoCoombs.tipo as any, positivo: data.resultadoCoombs.positivo },
        })
        updateData.resultadoCoombsId = nueva.id
      }
    }

    return tx.transfusion.update({
      where: { id },
      data: updateData,
      include: {
        paciente: { include: { persona: true } },
        compatibilidad: { include: { donanteGrupo: true, receptorGrupo: true } },
        resultadoCoombs: true,
      },
    })
  })
}

export async function softDelete(id: number) {
  return prisma.$transaction(async (tx) => {
    const existente = await tx.transfusion.findFirst({ where: { id } })

    if (existente?.compatibilidadId) {
      await tx.compatibilidadTransfusional.update({
        where: { id: existente.compatibilidadId },
        data: { deletedAt: new Date() },
      })
    }

    if (existente?.resultadoCoombsId) {
      await tx.resultadoCoombs.update({
        where: { id: existente.resultadoCoombsId },
        data: { deletedAt: new Date() },
      })
    }

    return tx.transfusion.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  })
}
