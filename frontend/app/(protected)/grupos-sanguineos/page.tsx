'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/auth-context'
import { gruposSanguineosService } from '@/features/grupos-sanguineos/grupos-sanguineos-service'
import { GruposSanguineosTable } from '@/features/grupos-sanguineos/components/grupos-sanguineos-table'
import { GrupoSanguineoForm } from '@/features/grupos-sanguineos/components/grupo-sanguineo-form'
import { GrupoSanguineoDeleteDialog } from '@/features/grupos-sanguineos/components/grupo-sanguineo-delete-dialog'
import type { GrupoSanguineo, ActualizarGrupoInput } from '@/features/grupos-sanguineos/grupos-sanguineos.schema'

export default function GruposSanguineosPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<GrupoSanguineo | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['grupos-sanguineos'],
    queryFn: () => gruposSanguineosService.listar(),
  })

  const { mutateAsync: crearMut, isPending: savingCrear } = useMutation({
    mutationFn: (input: ActualizarGrupoInput) => gruposSanguineosService.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos-sanguineos'] })
      setDialogOpen(false)
    },
  })

  const { mutateAsync: actualizarMut, isPending: savingActualizar } = useMutation({
    mutationFn: ({ id, input }: { id: number; input: ActualizarGrupoInput }) =>
      gruposSanguineosService.actualizar(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos-sanguineos'] })
      setEditando(null)
    },
  })

  const { mutateAsync: eliminarMut, isPending: deleting } = useMutation({
    mutationFn: (id: number) => gruposSanguineosService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos-sanguineos'] })
      setDeleteId(null)
    },
  })

  const saving = savingCrear || savingActualizar

  const handleNuevo = () => {
    setEditando(null)
    setDialogOpen(true)
  }

  const handleEditar = (grupo: GrupoSanguineo) => {
    setEditando(grupo)
    setDialogOpen(true)
  }

  const handleSave = async (input: ActualizarGrupoInput) => {
    if (editando) {
      await actualizarMut({ id: editando.id, input })
    } else {
      await crearMut(input)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await eliminarMut(deleteId)
  }

  return (
    <div className="p-6">
      <GruposSanguineosTable
        data={{ items, loading: isLoading, error: error?.message ?? null }}
        userRole={user?.role}
        onNuevo={handleNuevo}
        onEditar={handleEditar}
        onEliminar={setDeleteId}
      />

      <GrupoSanguineoForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        saving={saving}
        editing={editando}
      />

      <GrupoSanguineoDeleteDialog
        deleteId={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        deleting={deleting}
        error={null}
      />
    </div>
  )
}