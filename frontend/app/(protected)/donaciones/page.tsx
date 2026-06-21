'use client'

import { useMemo } from 'react'
import { useDonaciones } from '@/features/donaciones/hooks/useDonaciones'
import { DonacionesTable } from '@/features/donaciones/components/donaciones-table'

export default function DonacionesPage() {
  const {
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
    data,
    isLoading,
    error,
  } = useDonaciones()

  const donaciones = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize])

  return (
    <div className="p-6">
      <DonacionesTable
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
          items: donaciones,
          loading: isLoading,
          error: error?.message ?? null,
        }}
        filters={{
          tipoDonacion,
          onTipoDonacionChange: (v) => {
            setTipoDonacion(v === ' ' ? '' : v)
            handleFilterChange()
          },
          fechaDesde,
          onFechaDesdeChange: (v) => {
            setFechaDesde(v)
            handleFilterChange()
          },
          fechaHasta,
          onFechaHastaChange: (v) => {
            setFechaHasta(v)
            handleFilterChange()
          },
          onFilterChange: handleFilterChange,
        }}
      />
    </div>
  )
}
