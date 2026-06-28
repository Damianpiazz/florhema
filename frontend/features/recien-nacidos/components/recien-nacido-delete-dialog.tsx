'use client'

import { Button } from '@/components/ui/button'
import { ErrorAlert } from '@/components/ui/error-alert'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface RecienNacidoDeleteDialogProps {
  deleteId: number | null
  onClose: () => void
  onConfirm: () => void
  error: string | null
  deleting: boolean
}

export function RecienNacidoDeleteDialog({
  deleteId,
  onClose,
  onConfirm,
  error,
  deleting,
}: RecienNacidoDeleteDialogProps) {
  return (
    <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar recién nacido?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El recién nacido, su persona asociada y el resultado de Coombs se eliminarán lógicamente.
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
