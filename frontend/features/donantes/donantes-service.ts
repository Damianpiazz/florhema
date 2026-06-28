import { api } from '@/lib/axios'
import { parseListarDonantesResponse, parseDonanteResponse, parseCalcularSemaforoResponse } from './donantes.dto'
import type { Donante } from './donantes.schema'

export const donantesService = {
  async listar(params: { dni?: string; limit?: number; offset?: number }) {
    const { data } = await api.get('/donantes', { params })
    return parseListarDonantesResponse(data)
  },

  async obtener(id: number): Promise<Donante> {
    const { data } = await api.get(`/donantes/${id}`)
    return parseDonanteResponse(data)
  },

  async calcularSemaforo(id: number) {
    const { data } = await api.post(`/donantes/${id}/calcular-semaforo`)
    return parseCalcularSemaforoResponse(data)
  },
}
