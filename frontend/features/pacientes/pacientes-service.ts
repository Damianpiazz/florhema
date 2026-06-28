import { api } from '@/lib/axios'
import { parseListarPacientesResponse, parsePacienteItemResponse } from './pacientes.dto'

export const pacientesService = {
  async listar(params: { dni?: string; limit?: number; offset?: number }) {
    const { data } = await api.get('/pacientes', { params })
    return parseListarPacientesResponse(data)
  },

  async crear(personaId: number) {
    const { data } = await api.post(`/personas/${personaId}/paciente`, {})
    return parsePacienteItemResponse(data)
  },

  async actualizar(id: number) {
    const { data } = await api.put(`/pacientes/${id}`, {})
    return parsePacienteItemResponse(data)
  },

  async eliminar(id: number) {
    await api.delete(`/pacientes/${id}`)
  },
}
