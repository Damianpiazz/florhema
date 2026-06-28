'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { estudiosGestantesService } from '@/features/estudios-gestantes/estudios-gestantes-service'

export function useEstudiosGestantes(gestanteId?: number) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [estadoEstudio, setEstadoEstudio] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  const handleFilterChange = useCallback(() => {
    setPage(1)
  }, [])

  const query = useQuery({
    queryKey: ['estudios-gestante', gestanteId, page, pageSize, estadoEstudio, fechaDesde, fechaHasta],
    queryFn: () => {
      const params = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        ...(estadoEstudio && { estadoEstudio }),
        ...(fechaDesde && { fechaDesde }),
        ...(fechaHasta && { fechaHasta }),
      }
      if (gestanteId) {
        return estudiosGestantesService.listar(gestanteId, params)
      }
      return estudiosGestantesService.listarTodos(params)
    },
  })

  return {
    page,
    handlePageChange: useCallback((newPage: number) => setPage(newPage), []),
    pageSize,
    handlePageSizeChange: useCallback((newSize: number) => { setPageSize(newSize); setPage(1) }, []),
    estadoEstudio,
    setEstadoEstudio,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    handleFilterChange,
    ...query,
  }
}
