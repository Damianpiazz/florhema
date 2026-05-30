'use client'

import { useState, useCallback, useEffect } from 'react'
import { extractErrorMessage } from '@/lib/error-utils'
import { personasService } from '@/features/personas/personas-service'
import type { Persona } from '@/features/personas/personas.schema'

export function usePersonasList() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (q: string, p: number, ps: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await personasService.listar({
        dni: q || undefined,
        limit: ps,
        offset: (p - 1) * ps,
      })
      setPersonas(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(extractErrorMessage(err, 'Error al buscar personas'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData('', 1, 10)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput)
    setPage(1)
    fetchData(searchInput, 1, pageSize)
  }, [searchInput, pageSize, fetchData])

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      fetchData(searchQuery, newPage, pageSize)
    },
    [searchQuery, pageSize, fetchData],
  )

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize)
      setPage(1)
      fetchData(searchQuery, 1, newSize)
    },
    [searchQuery, fetchData],
  )

  const refetch = useCallback(() => {
    fetchData(searchQuery, page, pageSize)
  }, [fetchData, searchQuery, page, pageSize])

  return {
    searchInput,
    setSearchInput,
    handleSearch,
    page,
    handlePageChange,
    handlePageSizeChange,
    pageSize,
    personas,
    total,
    loading,
    error,
    refetch,
  }
}