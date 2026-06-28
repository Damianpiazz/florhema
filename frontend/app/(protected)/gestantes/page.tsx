'use client'

import { useMemo } from 'react'
import { useGestantesList } from '@/features/gestantes/hooks/useGestantesList'
import { useGestantesQuery } from '@/features/gestantes/hooks/useGestantesQuery'
import { GestantesTable } from '@/features/gestantes/components/gestantes-table'

export default function GestantesPage() {
  const {
    searchInput,
    setSearchInput,
    searchQuery,
    handleSearch,
    page,
    handlePageChange,
    pageSize,
    handlePageSizeChange,
  } = useGestantesList()

  const { data, isLoading, error } = useGestantesQuery(searchQuery, page, pageSize)

  const gestantes = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize])

  return (
    <div className="p-6">
      <GestantesTable
        search={{
          value: searchInput,
          onChange: setSearchInput,
          onSearch: handleSearch,
        }}
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: handlePageChange,
          pageSize,
          onPageSizeChange: handlePageSizeChange,
        }}
        data={{
          items: gestantes,
          loading: isLoading,
          error: error?.message ?? null,
        }}
      />
    </div>
  )
}
