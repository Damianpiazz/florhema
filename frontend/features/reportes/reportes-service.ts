import { api } from '@/lib/axios'

export const reportesService = {
  async descargarReporte(planilla: number, fechaDesde?: string, fechaHasta?: string): Promise<void> {
    const params: Record<string, string> = { planilla: String(planilla) }
    if (fechaDesde) params.fechaDesde = fechaDesde
    if (fechaHasta) params.fechaHasta = fechaHasta

    const response = await api.get('/reportes/hemo', {
      params,
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `hemo-${planilla}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
