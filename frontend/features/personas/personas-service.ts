import { api } from '@/lib/axios'
import { parseListarPersonasResponse, parsePersonaResponse } from './personas.dto'
import type { Persona, PersonaFormInput } from './personas.schema'

export const personasService = {
  async listar(params: { dni?: string; limit?: number; offset?: number }) {
    const { data } = await api.get('/personas', { params })
    return parseListarPersonasResponse(data)
  },

  async crear(input: PersonaFormInput): Promise<Persona> {
    const { data } = await api.post('/personas', input)
    return parsePersonaResponse(data)
  },

  async actualizar(id: number, input: PersonaFormInput): Promise<Persona> {
    const { data } = await api.put(`/personas/${id}`, input)
    return parsePersonaResponse(data)
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/personas/${id}`)
  },
}
