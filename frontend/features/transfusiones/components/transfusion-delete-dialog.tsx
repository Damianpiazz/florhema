'use client'

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

interface TransfusionDeleteDialogProps {
  deleteId: number | null
  onClose: () => void
  onConfirm: () => Promise<void>
  error: string | null
  deleting: boolean
}

export function TransfusionDeleteDialog({ deleteId, onClose, onConfirm, error, deleting }: TransfusionDeleteDialogProps) {
  return (
    <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar transfusión?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La transfusión será eliminada permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ErrorAlert message={error} />

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
