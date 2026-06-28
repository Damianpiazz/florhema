import { api } from '@/lib/axios'
import { parseListarGruposResponse, parseGrupoItemResponse, parseEliminarGrupoResponse } from './grupos-sanguineos.dto'
import type { GrupoSanguineo, CrearGrupoInput, ActualizarGrupoInput } from './grupos-sanguineos.schema'

export const gruposSanguineosService = {
  async listar(): Promise<GrupoSanguineo[]> {
    const { data } = await api.get('/grupos-sanguineos')
    return parseListarGruposResponse(data)
  },

  async crear(input: CrearGrupoInput): Promise<GrupoSanguineo> {
    const { data } = await api.post('/grupos-sanguineos', input)
    return parseGrupoItemResponse(data)
  },

  async actualizar(id: number, input: ActualizarGrupoInput): Promise<GrupoSanguineo> {
    const { data } = await api.put(`/grupos-sanguineos/${id}`, input)
    return parseGrupoItemResponse(data)
  },

  async eliminar(id: number): Promise<void> {
    const { data } = await api.delete(`/grupos-sanguineos/${id}`)
    parseEliminarGrupoResponse(data)
  },
}
