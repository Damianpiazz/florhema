'use client'

import { useMemo } from 'react'
import { usePersonasList } from '@/features/personas/hooks/usePersonasList'
import { usePersonasQuery } from '@/features/personas/hooks/usePersonasQuery'
import { usePersonaDialog } from '@/features/personas/hooks/usePersonaDialog'
import { usePersonaDelete } from '@/features/personas/hooks/usePersonaDelete'
import { useGruposSanguineos } from '@/features/grupos-sanguineos/hooks/useGruposSanguineos'
import { PersonasTable } from '@/features/personas/components/personas-table'
import { PersonaDialog } from '@/features/personas/components/persona-dialog'
import { PersonaDeleteDialog } from '@/features/personas/components/persona-delete-dialog'

export default function PersonasPage() {
  const {
    searchInput,
    setSearchInput,
    searchQuery,
    handleSearch,
    page,
    handlePageChange,
    pageSize,
    handlePageSizeChange,
  } = usePersonasList()

  const { data, isLoading, error, refetch } = usePersonasQuery(searchQuery, page, pageSize)

  const { grupos, loading: loadingGrupos } = useGruposSanguineos()

  const { editing, setEditing, dialogOpen, setDialogOpen, handleSave, saving } =
    usePersonaDialog(refetch)

  const { deleteId, setDeleteId, handleDelete, handleClose, error: deleteError, deleting } =
    usePersonaDelete(refetch)

  const personas = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize])

  return (
    <div className="p-6">
      <PersonasTable
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
          items: personas,
          loading: isLoading,
          error: error?.message ?? null,
        }}
        onNueva={() => {
          setEditing(null)
          setDialogOpen(true)
        }}
        onEditar={(p) => {
          setEditing(p)
          setDialogOpen(true)
        }}
        onEliminar={(id) => setDeleteId(id)}
      />

      <PersonaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSave={handleSave}
        saving={saving}
        grupos={grupos}
        loadingGrupos={loadingGrupos}
      />

      <PersonaDeleteDialog
        deleteId={deleteId}
        onClose={handleClose}
        onConfirm={handleDelete}
        error={deleteError}
        deleting={deleting}
      />
    </div>
  )
}
