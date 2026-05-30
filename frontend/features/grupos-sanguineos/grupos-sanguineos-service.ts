import { api } from '@/lib/axios'
import { parseListarGruposResponse } from './grupos-sanguineos.dto'
import type { GrupoSanguineo } from './grupos-sanguineos.schema'

export const gruposSanguineosService = {
  async listar(): Promise<GrupoSanguineo[]> {
    const { data } = await api.get('/grupos-sanguineos')
    return parseListarGruposResponse(data)
  },
}
