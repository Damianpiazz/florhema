'use client'

import { useMemo, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useDonaciones } from '@/features/donaciones/hooks/useDonaciones'
import { DonacionesTable } from '@/features/donaciones/components/donaciones-table'
import { DonacionForm } from '@/features/donaciones/components/donacion-form'
import { donacionesService } from '@/features/donaciones/donaciones-service'
import type { Donacion, CrearDonacionInput } from '@/features/donaciones/donaciones.schema'

export default function DonacionesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Donacion | null>(null)

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

  const { mutateAsync: crearMut, isPending: savingCrear } = useMutation({
    mutationFn: (input: CrearDonacionInput) => donacionesService.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donaciones'] })
    },
  })

  const { mutateAsync: actualizarMut, isPending: savingActualizar } = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CrearDonacionInput }) =>
      donacionesService.actualizar(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donaciones'] })
    },
  })

  const saving = savingCrear || savingActualizar

  const handleSave = useCallback(async (input: CrearDonacionInput) => {
    if (editing) {
      await actualizarMut({ id: editing.id, input })
    } else {
      await crearMut(input)
    }
    setDialogOpen(false)
    setEditing(null)
  }, [editing, crearMut, actualizarMut])

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
        onNueva={() => {
          setEditing(null)
          setDialogOpen(true)
        }}
        onEditar={(d) => {
          setEditing(d)
          setDialogOpen(true)
        }}
      />

      <DonacionForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        saving={saving}
        editing={editing}
      />
    </div>
  )
}
