export interface AuditoriaEntry {
  id: number
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: string
  entityId: number
  oldValues: Record<string, any> | null
  newValues: Record<string, any> | null
  createdAt: string
  usuario: {
    id: number
    email: string
    name: string | null
  }
}

export interface AuditoriaFilters {
  page?: number
  pageSize?: number
  entity?: string
  action?: string
  fechaDesde?: string
  fechaHasta?: string
}
