import { api } from '@/lib/axios'
import { parseListarTransfusionesResponse, parseTransfusionResponse } from './transfusiones.dto'
import type { Transfusion, CrearTransfusionInput, ActualizarTransfusionInput } from './transfusiones.schema'

export const transfusionesService = {
  async listar(params: {
    pacienteId?: number
    fechaDesde?: string
    fechaHasta?: string
    componente?: string
    limit?: number
    offset?: number
  }) {
    const { data } = await api.get('/transfusiones', { params })
    return parseListarTransfusionesResponse(data)
  },

  async obtener(id: number): Promise<Transfusion> {
    const { data } = await api.get(`/transfusiones/${id}`)
    return parseTransfusionResponse(data)
  },

  async crear(input: CrearTransfusionInput): Promise<Transfusion> {
    const { data } = await api.post('/transfusiones', input)
    return parseTransfusionResponse(data)
  },

  async actualizar(id: number, input: ActualizarTransfusionInput): Promise<Transfusion> {
    const { data } = await api.put(`/transfusiones/${id}`, input)
    return parseTransfusionResponse(data)
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/transfusiones/${id}`)
  },

  async verificarPaciente(dni: string) {
    const { data } = await api.get(`/personas/dni/${dni}`)
    return data.data.item as { id: number; dni: string; nombre: string; apellido: string }
  },
}
