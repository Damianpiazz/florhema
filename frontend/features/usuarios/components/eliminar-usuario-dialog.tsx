'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ErrorAlert } from '@/components/ui/error-alert'
import type { Usuario } from '../usuarios.schema'
import { usuariosService } from '../usuarios-service'

interface EliminarUsuarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: Usuario
  onSuccess: () => void
}

export function EliminarUsuarioDialog({
  open,
  onOpenChange,
  usuario,
  onSuccess,
}: EliminarUsuarioDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEliminar = async () => {
    setLoading(true)
    setError(null)
    try {
      await usuariosService.eliminar(usuario.id)
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error del servidor. Intente nuevamente.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción desactivará la cuenta de <strong>{usuario.email}</strong>.
            El usuario no podrá iniciar sesión, pero los registros históricos se
            conservan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <ErrorAlert message={error} />}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleEliminar}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
