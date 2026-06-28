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

interface DonacionDeleteDialogProps {
  deleteId: number | null
  onClose: () => void
  onConfirm: () => Promise<void>
  error: string | null
  deleting: boolean
}

export function DonacionDeleteDialog({ deleteId, onClose, onConfirm, error, deleting }: DonacionDeleteDialogProps) {
  return (
    <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar donación?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La donación será eliminada permanentemente.
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
