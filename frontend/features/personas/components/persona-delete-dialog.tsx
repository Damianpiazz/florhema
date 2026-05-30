'use client'

import { useState } from 'react'
import { ErrorAlert } from '@/components/ui/error-alert'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

interface PersonaDeleteDialogProps {
  deleteId: number | null
  onClose: () => void
  onConfirm: () => Promise<void>
  serverError: string | null
  onClearError: () => void
}

export function PersonaDeleteDialog({ deleteId, onClose, onConfirm, serverError, onClearError }: PersonaDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = async () => {
    setDeleting(true)
    onClearError()
    try {
      await onConfirm()
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    onClearError()
    onClose()
  }

  return (
    <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && handleClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar persona?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La persona será eliminada permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ErrorAlert message={serverError} />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
