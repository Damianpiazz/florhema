'use client'

import { useMemo } from 'react'
import { useDonantesList } from '@/features/donantes/hooks/useDonantesList'
import { useDonantesQuery } from '@/features/donantes/hooks/useDonantesQuery'
import { DonantesTable } from '@/features/donantes/components/donantes-table'

export default function DonantesPage() {
  const {
    searchInput,
    setSearchInput,
    searchQuery,
    handleSearch,
    page,
    handlePageChange,
    pageSize,
    handlePageSizeChange,
  } = useDonantesList()

  const { data, isLoading, error } = useDonantesQuery(searchQuery, page, pageSize)

  const donantes = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize])

  return (
    <div className="p-6">
      <DonantesTable
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
          items: donantes,
          loading: isLoading,
          error: error?.message ?? null,
        }}
      />
    </div>
  )
}
