import { api } from '@/lib/axios'
import { parsePersonaDetalleResponse, parseListarResponse } from './persona-detalle.dto'
import {
  donacionSchema,
  transfusionSchema,
  estudioGestanteSchema,
  recienNacidoSchema,
  actividadItemSchema,
} from './persona-detalle.schema'

export const personaDetalleService = {
  async obtenerDetalle(id: number) {
    const { data } = await api.get(`/personas/${id}`)
    return parsePersonaDetalleResponse(data)
  },

  async listarDonaciones(id: number, params: { limit?: number; offset?: number }) {
    const { data } = await api.get(`/personas/${id}/donaciones`, { params })
    return parseListarResponse(data, donacionSchema)
  },

  async listarTransfusiones(id: number, params: { limit?: number; offset?: number }) {
    const { data } = await api.get(`/personas/${id}/transfusiones`, { params })
    return parseListarResponse(data, transfusionSchema)
  },

  async listarEstudios(id: number, params: { limit?: number; offset?: number }) {
    const { data } = await api.get(`/personas/${id}/estudios-gestante`, { params })
    return parseListarResponse(data, estudioGestanteSchema)
  },

  async listarRecienNacidos(id: number, params: { limit?: number; offset?: number }) {
    const { data } = await api.get(`/personas/${id}/recien-nacidos`, { params })
    return parseListarResponse(data, recienNacidoSchema)
  },

  async listarActividad(id: number, params: { limit?: number; offset?: number }) {
    const { data } = await api.get(`/personas/${id}/actividad`, { params })
    return parseListarResponse(data, actividadItemSchema)
  },
}
