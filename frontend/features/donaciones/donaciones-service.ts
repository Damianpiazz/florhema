import { api } from '@/lib/axios'
import { parseListarDonacionesResponse, parseDonacionResponse } from './donaciones.dto'
import type { Donacion, CrearDonacionInput } from './donaciones.schema'

export const donacionesService = {
  async listar(params: {
    donanteId?: number
    fechaDesde?: string
    fechaHasta?: string
    tipoDonacion?: string
    limit?: number
    offset?: number
  }) {
    const { data } = await api.get('/donaciones', { params })
    return parseListarDonacionesResponse(data)
  },

  async obtener(id: number): Promise<Donacion> {
    const { data } = await api.get(`/donaciones/${id}`)
    return parseDonacionResponse(data)
  },

  async crear(input: CrearDonacionInput): Promise<Donacion> {
    const { data } = await api.post('/donaciones', input)
    return parseDonacionResponse(data)
  },
}
