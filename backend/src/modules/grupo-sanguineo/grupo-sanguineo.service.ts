import { toGrupoSanguineoResponse } from '@/modules/grupo-sanguineo/grupo-sanguineo.dto'
import * as grupoSanguineoRepository from '@/modules/grupo-sanguineo/grupo-sanguineo.repository'

export async function listar() {
  const grupos = await grupoSanguineoRepository.findAllActive()
  return grupos.map(toGrupoSanguineoResponse)
}
