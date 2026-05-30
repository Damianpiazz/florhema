import { toPersonaResponse } from '@/modules/persona/persona.dto'
import * as personaRepository from '@/modules/persona/persona.repository'

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