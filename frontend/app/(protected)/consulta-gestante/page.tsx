'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { consultaService, type ConsultaEstudioItem } from '@/features/consulta/consulta-service'
import { ConsultaTable } from '@/features/consulta/components/consulta-table'

export default function ConsultaGestantePage() {
  const [search, setSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [results, setResults] = useState<ConsultaEstudioItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (term: string | undefined, p: number, ps: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await consultaService.buscarEstudios(term, p, ps)
      setResults(data.items)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.message ?? 'Error al buscar')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(searchTerm, page, pageSize)
  }, [fetchData, searchTerm, page, pageSize])

  const handleSearch = () => {
    setSearchTerm(search.trim() || undefined)
    setPage(1)
  }

  const handlePageChange = (p: number) => {
    setPage(p)
  }

  const handlePageSizeChange = (s: number) => {
    setPageSize(s)
    setPage(1)
  }

  return (
    <div className="p-6 space-y-6">

      <ConsultaTable
        search={{
          value: search,
          onChange: setSearch,
          onSearch: handleSearch,
        }}
        data={{
          items: results,
          loading,
          error,
        }}
        pagination={{
          page,
          totalPages,
          total,
          pageSize,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />
    </div>
  )
}
