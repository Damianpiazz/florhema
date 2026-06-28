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

interface PacienteDeleteDialogProps {
  deleteId: number | null
  onClose: () => void
  onConfirm: () => Promise<void>
  error: string | null
  deleting: boolean
}

export function PacienteDeleteDialog({ deleteId, onClose, onConfirm, error, deleting }: PacienteDeleteDialogProps) {
  return (
    <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará el rol de paciente.
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
