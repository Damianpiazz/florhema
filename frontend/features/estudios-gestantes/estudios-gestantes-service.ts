import { api } from '@/lib/axios'
import { parseListarEstudiosGestanteResponse, parseEstudioGestanteResponse } from './estudios-gestantes.dto'
import type { EstudioGestante, CrearEstudioGestanteInput, ActualizarEstudioGestanteInput } from './estudios-gestantes.schema'

export const estudiosGestantesService = {
  async listar(gestanteId: number, params: {
    fechaDesde?: string
    fechaHasta?: string
    estadoEstudio?: string
    limit?: number
    offset?: number
  }) {
    const { data } = await api.get(`/estudios-gestante/gestantes/${gestanteId}/estudios`, { params })
    return parseListarEstudiosGestanteResponse(data)
  },

  async listarTodos(params: {
    fechaDesde?: string
    fechaHasta?: string
    estadoEstudio?: string
    limit?: number
    offset?: number
  }) {
    const { data } = await api.get('/estudios-gestante', { params })
    return parseListarEstudiosGestanteResponse(data)
  },

  async crear(gestanteId: number, input: CrearEstudioGestanteInput): Promise<EstudioGestante> {
    const { data } = await api.post(`/estudios-gestante/gestantes/${gestanteId}/estudios`, input)
    return parseEstudioGestanteResponse(data)
  },

  async actualizar(id: number, input: ActualizarEstudioGestanteInput): Promise<EstudioGestante> {
    const { data } = await api.put(`/estudios-gestante/${id}`, input)
    return parseEstudioGestanteResponse(data)
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/estudios-gestante/${id}`)
  },

  async verificarGestante(dni: string) {
    const { data } = await api.get(`/personas/dni/${dni}`)
    return data.data.item as { id: number; dni: string; nombre: string; apellido: string; gestante: { id: number } | null }
  },

  async descargarConstanciaEstudioGestante(estudioGestanteId: number): Promise<void> {
    const response = await api.get(`/constancias/estudio-gestante/${estudioGestanteId}`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `constancia-estudio-gestante-${estudioGestanteId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
