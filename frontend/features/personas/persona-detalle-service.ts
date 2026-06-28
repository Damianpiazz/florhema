import { api } from '@/lib/axios'
import { parsePersonaDetalleResponse, parseListarResponse } from './persona-detalle.dto'
import {
  donacionSchema,
  transfusionSchema,
  estudioGestanteSchema,
  recienNacidoSchema,
  actividadItemSchema,
} from './persona-detalle.schema'
import type { CrearEstudioGestanteInput, ActualizarEstudioGestanteInput } from '@/features/estudios-gestantes/estudios-gestantes.schema'
import type { CrearRecienNacidoInput, ActualizarRecienNacidoInput } from '@/features/recien-nacidos/recien-nacidos.schema'

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

  async crearGestante(personaId: number, antecedentesObstetricos: string | null) {
    const { data } = await api.post(`/personas/${personaId}/gestante`, { antecedentesObstetricos })
    return data
  },

  async actualizarGestante(id: number, antecedentesObstetricos: string | null) {
    const { data } = await api.put(`/gestantes/${id}`, { antecedentesObstetricos })
    return data
  },

  async eliminarGestante(id: number) {
    await api.delete(`/gestantes/${id}`)
  },

  async crearPaciente(personaId: number) {
    const { data } = await api.post(`/personas/${personaId}/paciente`, {})
    return data
  },

  async eliminarPaciente(id: number) {
    await api.delete(`/pacientes/${id}`)
  },

  async crearEstudio(gestanteId: number, input: CrearEstudioGestanteInput) {
    const { data } = await api.post(`/estudios-gestante/gestantes/${gestanteId}/estudios`, input)
    return data
  },

  async actualizarEstudio(id: number, input: ActualizarEstudioGestanteInput) {
    const { data } = await api.put(`/estudios-gestante/${id}`, input)
    return data
  },

  async eliminarEstudio(id: number) {
    await api.delete(`/estudios-gestante/${id}`)
  },

  async crearRecienNacido(gestanteId: number, input: CrearRecienNacidoInput) {
    const { data } = await api.post(`/recien-nacidos/gestantes/${gestanteId}/recien-nacidos`, input)
    return data
  },

  async actualizarRecienNacido(id: number, input: ActualizarRecienNacidoInput) {
    const { data } = await api.put(`/recien-nacidos/${id}`, input)
    return data
  },

  async eliminarRecienNacido(id: number) {
    await api.delete(`/recien-nacidos/${id}`)
  },
}
