'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { donacionesService } from '@/features/donaciones/donaciones-service'

export function useDonaciones() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [tipoDonacion, setTipoDonacion] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput)
    setPage(1)
  }, [searchInput])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }, [])

  const handleFilterChange = useCallback(() => {
    setPage(1)
  }, [])

  const query = useQuery({
    queryKey: ['donaciones', searchQuery, page, pageSize, tipoDonacion, fechaDesde, fechaHasta],
    queryFn: () =>
      donacionesService.listar({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        ...(tipoDonacion && { tipoDonacion }),
        ...(fechaDesde && { fechaDesde }),
        ...(fechaHasta && { fechaHasta }),
      }),
  })

  return {
    searchInput,
    setSearchInput,
    searchQuery,
    handleSearch,
    page,
    handlePageChange,
    pageSize,
    handlePageSizeChange,
    tipoDonacion,
    setTipoDonacion,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    handleFilterChange,
    ...query,
  }
}
