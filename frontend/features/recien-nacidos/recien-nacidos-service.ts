import { api } from '@/lib/axios'
import { parseListarRecienNacidosResponse, parseRecienNacidoResponse } from './recien-nacidos.dto'
import type { CrearRecienNacidoInput, ActualizarRecienNacidoInput, RecienNacido } from './recien-nacidos.schema'

export const recienNacidosService = {
  async verificarGestante(dni: string) {
    const { data } = await api.get(`/personas/dni/${dni}`)
    return data.data.item
  },

  async obtener(id: number): Promise<RecienNacido> {
    const { data } = await api.get(`/recien-nacidos/${id}`)
    return parseRecienNacidoResponse(data)
  },

  async listar(params: { gestanteId?: number; limit?: number; offset?: number }) {
    const { data } = await api.get('/recien-nacidos', { params })
    return parseListarRecienNacidosResponse(data)
  },

  async crear(gestanteId: number, input: CrearRecienNacidoInput) {
    const { data } = await api.post(`/recien-nacidos/gestantes/${gestanteId}/recien-nacidos`, input)
    return data
  },

  async actualizar(id: number, input: ActualizarRecienNacidoInput) {
    const { data } = await api.put(`/recien-nacidos/${id}`, input)
    return data
  },

  async eliminar(id: number) {
    await api.delete(`/recien-nacidos/${id}`)
  },
}
