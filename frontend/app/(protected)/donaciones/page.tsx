'use client'

import { useMemo, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDonaciones } from '@/features/donaciones/hooks/useDonaciones'
import { DonacionesTable } from '@/features/donaciones/components/donaciones-table'
import { donacionesService } from '@/features/donaciones/donaciones-service'
import { useMutation } from '@tanstack/react-query'
import type { CrearDonacionInput } from '@/features/donaciones/donaciones.schema'

export default function DonacionesPage() {
  const queryClient = useQueryClient()

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

  const { mutateAsync: crearDonacion, isPending: saving } = useMutation({
    mutationFn: (input: CrearDonacionInput) => donacionesService.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donaciones'] })
    },
  })

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
        onCrear={async (input) => { await crearDonacion(input) }}
        saving={saving}
      />
    </div>
  )
}
