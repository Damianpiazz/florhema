'use client'

import { Button } from '@/components/ui/button'
import { ErrorAlert } from '@/components/ui/error-alert'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

interface PersonaDeleteDialogProps {
  deleteId: number | null
  onClose: () => void
  onConfirm: () => Promise<void>
  error: string | null
  deleting: boolean
}

export function PersonaDeleteDialog({ deleteId, onClose, onConfirm, error, deleting }: PersonaDeleteDialogProps) {
  return (
    <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar persona?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La persona será eliminada permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ErrorAlert message={error} />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <Button onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
