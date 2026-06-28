import { api } from '@/lib/axios'
import { parseAuditoriaEntry } from './auditoria.dto'
import type { AuditoriaEntry, AuditoriaFilters } from './auditoria.schema'

interface ListarResponse {
  items: AuditoriaEntry[]
  total: number
  page: number
  pageSize: number
}

export const auditoriaService = {
  async listar(filters: AuditoriaFilters = {}): Promise<ListarResponse> {
    const { data } = await api.get('/audit', { params: filters })
    return {
      items: data.data.items.map(parseAuditoriaEntry),
      total: data.data.total,
      page: data.data.page,
      pageSize: data.data.pageSize,
    }
  },
}
