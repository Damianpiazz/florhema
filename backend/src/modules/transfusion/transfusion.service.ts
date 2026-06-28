import { toTransfusionResponse } from '@/modules/transfusion/transfusion.dto'
import * as transfusionRepository from '@/modules/transfusion/transfusion.repository'
import { AppError } from '@/utils/app-error'
import type { TransfusionQuery, CrearTransfusionInput, ActualizarTransfusionInput } from '@/modules/transfusion/transfusion.schema'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function listar(params: TransfusionQuery) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    transfusionRepository.findAll({
      pacienteId: params.pacienteId,
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      componente: params.componente,
      limit,
      offset,
    }),
    transfusionRepository.count({
      pacienteId: params.pacienteId,
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      componente: params.componente,
    }),
  ])

  return {
    items: (items as any[]).map(toTransfusionResponse),
    total,
    limit,
    offset,
  }
}

export async function obtener(id: number) {
  const transfusion = await transfusionRepository.findById(id)
  if (!transfusion) {
    throw new AppError(404, 'Transfusión no encontrada')
  }
  return toTransfusionResponse(transfusion as any)
}

export async function crear(input: CrearTransfusionInput) {
  const paciente = await transfusionRepository.findPacienteByPersonaDni(input.dni)
  if (!paciente) {
    throw new AppError(404, 'Paciente no encontrado')
  }

  const donanteGrupo = await transfusionRepository.findGrupoById(input.compatibilidad.donanteGrupoId)
  if (!donanteGrupo) {
    throw new AppError(404, 'El grupo sanguíneo del donante no existe')
  }

  const receptorGrupo = await transfusionRepository.findGrupoById(input.compatibilidad.receptorGrupoId)
  if (!receptorGrupo) {
    throw new AppError(404, 'El grupo sanguíneo del receptor no existe')
  }

  const transfusion = await transfusionRepository.create({
    pacienteId: paciente.id,
    fecha: input.fecha,
    componente: input.componente,
    cantidadUnidades: input.cantidadUnidades,
    reaccionAdversa: input.reaccionAdversa ?? null,
    compatibilidad: {
      donanteGrupoId: input.compatibilidad.donanteGrupoId,
      receptorGrupoId: input.compatibilidad.receptorGrupoId,
      compatible: input.compatibilidad.compatible,
      motivoIncompatibilidad: input.compatibilidad.motivoIncompatibilidad ?? null,
    },
    resultadoCoombs: {
      tipo: input.resultadoCoombs.tipo,
      positivo: input.resultadoCoombs.positivo,
    },
  })

  return toTransfusionResponse(transfusion as any)
}

export async function actualizar(id: number, input: ActualizarTransfusionInput) {
  const existente = await transfusionRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Transfusión no encontrada')
  }

  const transfusion = await transfusionRepository.update(id, {
    fecha: input.fecha,
    componente: input.componente,
    cantidadUnidades: input.cantidadUnidades,
    reaccionAdversa: input.reaccionAdversa,
    compatibilidad: input.compatibilidad ? {
      donanteGrupoId: input.compatibilidad.donanteGrupoId,
      receptorGrupoId: input.compatibilidad.receptorGrupoId,
      compatible: input.compatibilidad.compatible,
      motivoIncompatibilidad: input.compatibilidad.motivoIncompatibilidad ?? null,
    } : undefined,
    resultadoCoombs: input.resultadoCoombs ? {
      tipo: input.resultadoCoombs.tipo,
      positivo: input.resultadoCoombs.positivo,
    } : undefined,
  })

  return toTransfusionResponse(transfusion as any)
}

export async function eliminar(id: number) {
  const existente = await transfusionRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Transfusión no encontrada')
  }

  await transfusionRepository.softDelete(id)
}
