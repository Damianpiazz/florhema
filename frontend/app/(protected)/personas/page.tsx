'use client'

import { usePersonasList } from '@/features/personas/hooks/usePersonasList'
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
    handleSearch,
    page,
    handlePageChange,
    handlePageSizeChange,
    pageSize,
    personas,
    total,
    loading,
    error,
    refetch,
  } = usePersonasList()

  const { grupos, loading: loadingGrupos } = useGruposSanguineos()

  const { editing, setEditing, dialogOpen, setDialogOpen, handleSave } = usePersonaDialog(refetch)

  const { deleteId, setDeleteId, handleDelete, error: deleteError, setError: setDeleteError } =
    usePersonaDelete(refetch)

  return (
    <div className="p-6">

      <PersonasTable
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        handleSearch={handleSearch}
        page={page}
        totalPages={Math.ceil(total / pageSize) || 1}
        total={total}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        personas={personas}
        loading={loading}
        error={error}
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
        grupos={grupos}
        loadingGrupos={loadingGrupos}
      />

      <PersonaDeleteDialog
        deleteId={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        serverError={deleteError}
        onClearError={() => setDeleteError(null)}
      />
    </div>
  )
}