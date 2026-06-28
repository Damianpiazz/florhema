'use client'

import { useMemo, useState } from 'react'
import { UsuariosTable } from '@/features/usuarios/components/usuarios-table'
import { UsuarioForm } from '@/features/usuarios/components/usuario-form'
import { EliminarUsuarioDialog } from '@/features/usuarios/components/eliminar-usuario-dialog'
import { useUsuarios } from '@/features/usuarios/hooks/useUsuarios'
import type { Usuario } from '@/features/usuarios/usuarios.schema'

export default function UsuariosPage() {
  const {
    items,
    total,
    page,
    pageSize,
    search,
    loading,
    error,
    setPage,
    setPageSize,
    onSearch,
    refresh,
  } = useUsuarios()
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<Usuario | undefined>()

  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize])

  const handleCrear = () => {
    setEditingUser(undefined)
    setFormOpen(true)
  }

  const handleEditar = (user: Usuario) => {
    setEditingUser(user)
    setFormOpen(true)
  }

  const handleEliminar = (user: Usuario) => {
    setDeletingUser(user)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <UsuariosTable
        search={{ value: search, onChange: onSearch }}
        pagination={{
          page,
          totalPages,
          total,
          onPageChange: setPage,
          pageSize,
          onPageSizeChange: setPageSize,
        }}
        data={{ items, loading, error }}
        onCrear={handleCrear}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />

      <UsuarioForm
        open={formOpen}
        onOpenChange={setFormOpen}
        usuario={editingUser}
        onSuccess={refresh}
      />

      {deletingUser && (
        <EliminarUsuarioDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          usuario={deletingUser}
          onSuccess={refresh}
        />
      )}
    </div>
  )
}
