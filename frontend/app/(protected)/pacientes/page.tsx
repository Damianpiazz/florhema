'use client'

import { useMemo, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { usePacientesList } from '@/features/pacientes/hooks/usePacientesList'
import { usePacientesQuery } from '@/features/pacientes/hooks/usePacientesQuery'
import { PacientesTable } from '@/features/pacientes/components/pacientes-table'
import { PacienteForm } from '@/features/pacientes/components/paciente-form'
import { PacienteDeleteDialog } from '@/features/pacientes/components/paciente-delete-dialog'
import { pacientesService } from '@/features/pacientes/pacientes-service'
export default function PacientesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const {
    searchInput,
    setSearchInput,
    searchQuery,
    handleSearch,
    page,
    handlePageChange,
    pageSize,
    handlePageSizeChange,
  } = usePacientesList()

  const { data, isLoading, error } = usePacientesQuery(searchQuery, page, pageSize)

  const { mutateAsync: crearMut, isPending: saving } = useMutation({
    mutationFn: (personaId: number) => pacientesService.crear(personaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
    },
  })

  const { mutateAsync: eliminarMut, isPending: deleting } = useMutation({
    mutationFn: (id: number) => pacientesService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
    },
  })

  const handleSave = useCallback(async (personaId: number) => {
    await crearMut(personaId)
    setDialogOpen(false)
  }, [crearMut])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    await eliminarMut(deleteId)
    setDeleteId(null)
  }, [deleteId, eliminarMut])

  const handleCloseDelete = useCallback(() => {
    setDeleteId(null)
  }, [])

  const pacientes = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize])

  return (
    <div className="p-6">
      <PacientesTable
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
          items: pacientes,
          loading: isLoading,
          error: error?.message ?? null,
        }}
        onNueva={() => setDialogOpen(true)}
        onEliminar={(id) => setDeleteId(id)}
      />

      <PacienteForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        saving={saving}
      />

      <PacienteDeleteDialog
        deleteId={deleteId}
        onClose={handleCloseDelete}
        onConfirm={handleDelete}
        error={null}
        deleting={deleting}
      />
    </div>
  )
}
