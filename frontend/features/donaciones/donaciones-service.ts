import { api } from '@/lib/axios'
import { parseListarDonacionesResponse, parseDonacionResponse } from './donaciones.dto'
import type { Donacion, CrearDonacionInput, ActualizarDonacionInput } from './donaciones.schema'

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

  async actualizar(id: number, input: ActualizarDonacionInput): Promise<Donacion> {
    const { data } = await api.put(`/donaciones/${id}`, input)
    return parseDonacionResponse(data)
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/donaciones/${id}`)
  },

  async verificarDonante(dni: string) {
    const { data } = await api.get(`/personas/dni/${dni}`)
    return data.data.item as { id: number; dni: string; nombre: string; apellido: string }
  },
}
