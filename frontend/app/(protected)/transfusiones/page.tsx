'use client'

import { useMemo, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTransfusiones } from '@/features/transfusiones/hooks/useTransfusiones'
import { TransfusionesTable } from '@/features/transfusiones/components/transfusiones-table'
import { TransfusionForm } from '@/features/transfusiones/components/transfusion-form'
import { TransfusionDeleteDialog } from '@/features/transfusiones/components/transfusion-delete-dialog'
import { transfusionesService } from '@/features/transfusiones/transfusiones-service'
import { gruposSanguineosService } from '@/features/grupos-sanguineos/grupos-sanguineos-service'
import type { Transfusion, CrearTransfusionInput } from '@/features/transfusiones/transfusiones.schema'

export default function TransfusionesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Transfusion | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: gruposSanguineos } = useQuery({
    queryKey: ['grupos-sanguineos'],
    queryFn: () => gruposSanguineosService.listar(),
  })

  const gruposList = gruposSanguineos ?? []

  const {
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
    data,
    isLoading,
    error,
  } = useTransfusiones()

  const { mutateAsync: crearMut, isPending: savingCrear } = useMutation({
    mutationFn: (input: CrearTransfusionInput) => transfusionesService.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfusiones'] })
    },
  })

  const { mutateAsync: actualizarMut, isPending: savingActualizar } = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CrearTransfusionInput }) =>
      transfusionesService.actualizar(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfusiones'] })
    },
  })

  const { mutateAsync: eliminarMut, isPending: deleting } = useMutation({
    mutationFn: (id: number) => transfusionesService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfusiones'] })
    },
  })

  const saving = savingCrear || savingActualizar

  const handleSave = useCallback(async (input: CrearTransfusionInput) => {
    if (editing) {
      await actualizarMut({ id: editing.id, input })
    } else {
      await crearMut(input)
    }
    setDialogOpen(false)
    setEditing(null)
  }, [editing, crearMut, actualizarMut])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    await eliminarMut(deleteId)
    setDeleteId(null)
  }, [deleteId, eliminarMut])

  const handleCloseDelete = useCallback(() => {
    setDeleteId(null)
  }, [])

  const transfusiones = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize])

  return (
    <div className="p-6">
      <TransfusionesTable
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
          items: transfusiones,
          loading: isLoading,
          error: error?.message ?? null,
        }}
        filters={{
          componente,
          onComponenteChange: (v) => {
            setComponente(v === ' ' ? '' : v)
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
        onEliminar={(id) => setDeleteId(id)}
      />

      <TransfusionForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        saving={saving}
        editing={editing}
        gruposSanguineos={gruposList}
      />

      <TransfusionDeleteDialog
        deleteId={deleteId}
        onClose={handleCloseDelete}
        onConfirm={handleDelete}
        error={null}
        deleting={deleting}
      />
    </div>
  )
}
