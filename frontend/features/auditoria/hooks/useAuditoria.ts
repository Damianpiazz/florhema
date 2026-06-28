'use client'

import { useState, useEffect, useCallback } from 'react'
import { auditoriaService } from '../auditoria-service'
import type { AuditoriaEntry } from '../auditoria.schema'

export function useAuditoria() {
  const [items, setItems] = useState<AuditoriaEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [entity, setEntity] = useState('')
  const [action, setAction] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const filters: any = { page, pageSize }
      if (entity) filters.entity = entity
      if (action) filters.action = action
      if (fechaDesde) filters.fechaDesde = fechaDesde
      if (fechaHasta) filters.fechaHasta = fechaHasta
      const result = await auditoriaService.listar(filters)
      setItems(result.items)
      setTotal(result.total)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error del servidor. Intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, entity, action, fechaDesde, fechaHasta])

  useEffect(() => { fetch() }, [fetch])

  const aplicarFiltros = useCallback(() => {
    setPage(1)
    // fetch will be triggered by page change -> useEffect
  }, [])

  return {
    items,
    total,
    page,
    pageSize,
    loading,
    error,
    entity,
    setEntity,
    action,
    setAction,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    setPage,
    setPageSize,
    aplicarFiltros,
    refresh: fetch,
  }
}
