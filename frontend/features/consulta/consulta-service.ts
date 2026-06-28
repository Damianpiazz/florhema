import { api } from '@/lib/axios'

export interface ConsultaGestanteItem {
  id: number
  personaId: number
  persona: {
    id: number
    dni: string
    nombre: string
    apellido: string
    grupoSanguineo: { tipo: string; factorRh: string } | null
  }
  ultimoEstudio: {
    id: number
    fecha: string
    estadoEstudio: string
    coombsIndirecto: boolean
  } | null
  totalEstudios: number
}

export const consultaService = {
  async buscarGestantes(search?: string): Promise<ConsultaGestanteItem[]> {
    const params = search ? { search } : {}
    const response = await api.get<ConsultaGestanteItem[]>('/gestantes/consulta', { params })
    return response.data
  },
}
