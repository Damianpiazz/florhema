'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { RecienNacidosTable } from '@/features/recien-nacidos/components/recien-nacidos-table'
import { RecienNacidoForm } from '@/features/recien-nacidos/components/recien-nacido-form'
import { RecienNacidoDeleteDialog } from '@/features/recien-nacidos/components/recien-nacido-delete-dialog'
import { useRecienNacidosQuery } from '@/features/recien-nacidos/hooks/useRecienNacidosQuery'
import { recienNacidosService } from '@/features/recien-nacidos/recien-nacidos-service'
import type { RecienNacido, CrearRecienNacidoInput } from '@/features/recien-nacidos/recien-nacidos.schema'

export default function RecienNacidosPage() {
  const queryClient = useQueryClient()
  const [dniInput, setDniInput] = useState('')
  const [dniQuery, setDniQuery] = useState('')
  const [gestanteId, setGestanteId] = useState<number | undefined>(undefined)
  const [gestanteInfo, setGestanteInfo] = useState<{ nombre: string; apellido: string } | null>(null)
  const [dniStatus, setDniStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [dniError, setDniError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RecienNacido | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

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
    setPage(1)
  }, [])

  useEffect(() => {
    if (dniQuery && dniQuery.length >= 7) {
      setDniStatus('checking')
      setDniError(null)
      setCreateError(null)
      recienNacidosService.verificarGestante(dniQuery).then((persona) => {
        if (persona.gestante) {
          setGestanteId(persona.gestante.id)
          setGestanteInfo({ nombre: persona.nombre, apellido: persona.apellido })
          setDniStatus('valid')
          setPage(1)
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

  const handlePageChange = useCallback((p: number) => setPage(p), [])
  const handlePageSizeChange = useCallback((s: number) => { setPageSize(s); setPage(1) }, [])

  const { data, isLoading, error } = useRecienNacidosQuery(page, pageSize, gestanteId)

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize])

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['recien-nacidos'] })
  }, [queryClient])

  const { mutateAsync: crearMut, isPending: savingCrear } = useMutation({
    mutationFn: (input: CrearRecienNacidoInput) =>
      recienNacidosService.crear(gestanteId!, input),
    onSuccess: refetch,
  })

  const { mutateAsync: actualizarMut, isPending: savingActualizar } = useMutation({
    mutationFn: ({ id, input }: { id: number; input: CrearRecienNacidoInput }) =>
      recienNacidosService.actualizar(id, input),
    onSuccess: refetch,
  })

  const { mutateAsync: eliminarMut, isPending: deleting } = useMutation({
    mutationFn: (id: number) => recienNacidosService.eliminar(id),
    onSuccess: refetch,
  })

  const saving = savingCrear || savingActualizar

  const handleSave = useCallback(async (input: CrearRecienNacidoInput) => {
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

  return (
    <div className="p-6">
      {createError && (
        <p className="text-sm text-amber-600 mb-4">{createError}</p>
      )}
      <RecienNacidosTable
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
          items,
          loading: isLoading,
          error: error?.message ?? null,
        }}
        onNuevo={() => {
          if (!gestanteId) {
            setCreateError('Buscá una gestante por DNI para crear un nuevo recién nacido.')
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

      <RecienNacidoForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        saving={saving}
        editing={editing}
      />

      <RecienNacidoDeleteDialog
        deleteId={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        error={null}
        deleting={deleting}
      />
    </div>
  )
}
