import { api } from '@/lib/axios'

export interface ConsultaEstudioItem {
  id: number
  gestanteId: number
  fecha: string
  compatibilidadConyugal: string | null
  estadoEstudio: string
  coombsIndirecto: boolean
  persona: {
    id: number
    dni: string
    nombre: string
    apellido: string
    grupoSanguineo: { tipo: string; factorRh: string } | null
  }
}

export interface ConsultaResponse {
  items: ConsultaEstudioItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const consultaService = {
  async buscarEstudios(
    search?: string,
    page = 1,
    pageSize = 20,
  ): Promise<ConsultaResponse> {
    const params: Record<string, string | number> = { page, pageSize }
    if (search) params.search = search
    const response = await api.get<ConsultaResponse>('/gestantes/consulta', { params })
    return response.data
  },
}
