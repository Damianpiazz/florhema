'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { EstudiosGestantesTable } from '@/features/estudios-gestantes/components/estudios-gestantes-table'
import { EstudioGestanteForm } from '@/features/estudios-gestantes/components/estudio-gestante-form'
import { EstudioGestanteDeleteDialog } from '@/features/estudios-gestantes/components/estudio-gestante-delete-dialog'
import { useEstudiosGestantes } from '@/features/estudios-gestantes/hooks/useEstudiosGestantes'
import { estudiosGestantesService } from '@/features/estudios-gestantes/estudios-gestantes-service'
import type { EstudioGestante, CrearEstudioGestanteInput } from '@/features/estudios-gestantes/estudios-gestantes.schema'

export default function EstudiosGestantesPage() {
  const queryClient = useQueryClient()
  const [dniInput, setDniInput] = useState('')
  const [dniQuery, setDniQuery] = useState('')
  const [gestanteId, setGestanteId] = useState<number | undefined>(undefined)
  const [gestanteInfo, setGestanteInfo] = useState<{ nombre: string; apellido: string } | null>(null)
  const [dniStatus, setDniStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [dniError, setDniError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<EstudioGestante | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const handleDniSearch = useCallback(() => {
    setDniQuery(dniInput)
  }, [dniInput])

  const clearDniFilter = useCallback(() => {
    setDniInput('')
    setDniQuery('')
    setGestanteId(undefined)
    setGestanteInfo(null)
    setDniStatus('idle')
    setDniError(null)
  }, [])

  useEffect(() => {
    if (dniQuery && dniQuery.length >= 7) {
      setDniStatus('checking')
      setDniError(null)
      setCreateError(null)
      estudiosGestantesService.verificarGestante(dniQuery).then((persona) => {
        if (persona.gestante) {
          setGestanteId(persona.gestante.id)
          setGestanteInfo({ nombre: persona.nombre, apellido: persona.apellido })
          setDniStatus('valid')
        } else {
          setGestanteId(undefined)
          setGestanteInfo(null)
          setDniStatus('invalid')
          setDniError('La persona no está registrada como gestante')
        }
      }).catch((err) => {
        setGestanteId(undefined)
        setGestanteInfo(null)
        const msg = err instanceof Error ? err.message : ''
        setDniStatus(msg.includes('no encontrada') ? 'invalid' : 'idle')
        if (msg && !msg.includes('no encontrada')) {
          setDniError(msg)
        } else if (msg.includes('no encontrada')) {
          setDniError('Persona no encontrada')
        }
      })
    } else if (!dniQuery) {
      setGestanteId(undefined)
      setGestanteInfo(null)
      setDniStatus('idle')
      setDniError(null)
    }
  }, [dniQuery])

  const {
    page,
    handlePageChange,
    pageSize,
    handlePageSizeChange,
    estadoEstudio,
    setEstadoEstudio,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    handleFilterChange,
    data,
    isLoading,
    error,
  } = useEstudiosGestantes(gestanteId)

  const estudios = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize])

  const { mutateAsync: crearMut, isPending: savingCrear } = useMutation({
    mutationFn: (input: CrearEstudioGestanteInput) =>
      estudiosGestantesService.crear(gestanteId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudios-gestante'] })
    },
  })

  const { mutateAsync: actualizarMut, isPending: savingActualizar } = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CrearEstudioGestanteInput }) =>
      estudiosGestantesService.actualizar(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudios-gestante'] })
    },
  })

  const { mutateAsync: eliminarMut, isPending: deleting } = useMutation({
    mutationFn: (id: number) => estudiosGestantesService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudios-gestante'] })
    },
  })

  const saving = savingCrear || savingActualizar

  const handleSave = useCallback(async (input: CrearEstudioGestanteInput) => {
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

  return (
    <div className="p-6">
      {createError && (
        <p className="text-sm text-amber-600 mb-4">{createError}</p>
      )}
      <EstudiosGestantesTable
        dni={{
          value: dniInput,
          onChange: setDniInput,
          onSearch: handleDniSearch,
          onClear: clearDniFilter,
          status: dniStatus,
          gestanteInfo,
          error: dniError,
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
          items: estudios,
          loading: isLoading,
          error: error?.message ?? null,
        }}
        filters={{
          estadoEstudio,
          onEstadoEstudioChange: setEstadoEstudio,
          fechaDesde,
          onFechaDesdeChange: setFechaDesde,
          fechaHasta,
          onFechaHastaChange: setFechaHasta,
          onFilterChange: handleFilterChange,
        }}
        onNuevo={() => {
          if (!gestanteId) {
            setCreateError('Buscá una gestante por DNI para crear un nuevo estudio.')
            return
          }
          setCreateError(null)
          setEditing(null)
          setDialogOpen(true)
        }}
        onEditar={(d) => {
          setEditing(d)
          setDialogOpen(true)
        }}
        onEliminar={(id) => setDeleteId(id)}
      />

      <EstudioGestanteForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        saving={saving}
        editing={editing}
      />

      <EstudioGestanteDeleteDialog
        deleteId={deleteId}
        onClose={handleCloseDelete}
        onConfirm={handleDelete}
        error={null}
        deleting={deleting}
      />
    </div>
  )
}
