import { toPersonaResponse } from '@/modules/persona/persona.dto'
import * as personaRepository from '@/modules/persona/persona.repository'
import { AppError } from '@/utils/app-error'
import type { CrearPersonaInput } from '@/modules/persona/persona.schema'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function listar(params: { dni?: string; limit?: number; offset?: number }) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [personas, total] = await Promise.all([
    personaRepository.findAll({ dni: params.dni, limit, offset }),
    personaRepository.count({ dni: params.dni }),
  ])

  return {
    items: personas.map(toPersonaResponse),
    total,
    limit,
    offset,
  }
}

export async function crear(data: CrearPersonaInput, userId: number) {
  const existente = await personaRepository.findByDni(data.dni)
  if (existente) {
    throw new AppError(409, 'El DNI ya existe en el sistema')
  }

  const grupoExiste = await personaRepository.findGrupoSanguineoById(data.grupoSanguineoId)
  if (!grupoExiste || grupoExiste.deletedAt) {
    throw new AppError(404, 'El grupo sanguíneo indicado no existe')
  }

  const persona = await personaRepository.create({
    ...data,
    createdById: userId,
  })

  return toPersonaResponse(persona)
}