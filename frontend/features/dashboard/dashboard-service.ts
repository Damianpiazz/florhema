import { api } from '@/lib/axios'
import type { DashboardData } from './dashboard-types'

export const dashboardService = {
  async getDashboard(fechaDesde?: string, fechaHasta?: string): Promise<DashboardData> {
    const params: Record<string, string> = {}
    if (fechaDesde) params.fechaDesde = fechaDesde
    if (fechaHasta) params.fechaHasta = fechaHasta
    const response = await api.get<DashboardData>('/reportes/dashboard', { params })
    return response.data
  },
}
