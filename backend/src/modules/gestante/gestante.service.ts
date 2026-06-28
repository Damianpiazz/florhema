import { AppError } from '@/utils/app-error'
import * as gestanteRepository from '@/modules/gestante/gestante.repository'
import { toGestanteResponse } from '@/modules/gestante/gestante.dto'
import type { CrearGestanteInput, ActualizarGestanteInput, GestanteQuery } from '@/modules/gestante/gestante.schema'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function listar(params: GestanteQuery) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    gestanteRepository.findAll({
      dni: params.dni,
      nombre: params.nombre,
      apellido: params.apellido,
      limit,
      offset,
    }),
    gestanteRepository.countList({
      dni: params.dni,
      nombre: params.nombre,
      apellido: params.apellido,
    }),
  ])

  return {
    items: items.map(toGestanteResponse),
    total,
    limit,
    offset,
  }
}

export async function crear(personaId: number, input: CrearGestanteInput) {
  const persona = await gestanteRepository.findPersonaById(personaId)
  if (!persona) {
    throw new AppError(404, 'Persona no encontrada')
  }

  const existente = await gestanteRepository.findByPersonaId(personaId)
  if (existente) {
    throw new AppError(409, 'La persona ya está registrada como gestante')
  }

  const gestante = await gestanteRepository.create({
    personaId,
    antecedentesObstetricos: input.antecedentesObstetricos ?? null,
  })

  return toGestanteResponse(gestante)
}

export async function actualizar(id: number, input: ActualizarGestanteInput) {
  const existente = await gestanteRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Gestante no encontrada')
  }

  const gestante = await gestanteRepository.update(id, {
    antecedentesObstetricos: input.antecedentesObstetricos ?? null,
  })

  return toGestanteResponse(gestante)
}

export async function eliminar(id: number) {
  const existente = await gestanteRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Gestante no encontrada')
  }

  const estudiosActivos = await gestanteRepository.countActiveEstudios(id)
  if (estudiosActivos > 0) {
    throw new AppError(409, 'No se puede eliminar la gestante porque tiene estudios o recién nacidos activos')
  }

  const recienNacidosActivos = await gestanteRepository.countActiveRecienNacidos(id)
  if (recienNacidosActivos > 0) {
    throw new AppError(409, 'No se puede eliminar la gestante porque tiene estudios o recién nacidos activos')
  }

  await gestanteRepository.softDelete(id)
}
