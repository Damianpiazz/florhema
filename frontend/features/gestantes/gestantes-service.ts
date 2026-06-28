import { api } from '@/lib/axios'
import { parseListarGestantesResponse } from './gestantes.dto'

export const gestantesService = {
  async listar(params: { dni?: string; limit?: number; offset?: number }) {
    const { data } = await api.get('/gestantes', { params })
    return parseListarGestantesResponse(data)
  },
}
