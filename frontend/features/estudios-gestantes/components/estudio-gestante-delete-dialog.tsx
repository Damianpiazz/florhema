'use client'

import { ErrorAlert } from '@/components/ui/error-alert'
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

interface EstudioGestanteDeleteDialogProps {
  deleteId: number | null
  onClose: () => void
  onConfirm: () => void
  error: string | null
  deleting: boolean
}

export function EstudioGestanteDeleteDialog({
  deleteId,
  onClose,
  onConfirm,
  error,
  deleting,
}: EstudioGestanteDeleteDialogProps) {
  return (
    <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar estudio?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El estudio y su resultado de Coombs asociado se eliminarán lógicamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ErrorAlert message={error} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
