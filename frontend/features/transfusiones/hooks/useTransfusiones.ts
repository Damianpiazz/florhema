'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { transfusionesService } from '@/features/transfusiones/transfusiones-service'

export function useTransfusiones() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [pacienteId, setPacienteId] = useState<number | undefined>(undefined)
  const [componente, setComponente] = useState('')
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
    queryKey: ['transfusiones', searchQuery, page, pageSize, pacienteId, componente, fechaDesde, fechaHasta],
    queryFn: () =>
      transfusionesService.listar({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        ...(pacienteId && { pacienteId }),
        ...(componente && { componente }),
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
    pacienteId,
    setPacienteId,
    componente,
    setComponente,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    handleFilterChange,
    ...query,
  }
}
