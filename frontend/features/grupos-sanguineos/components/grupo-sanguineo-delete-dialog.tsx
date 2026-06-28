'use client'

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

interface GrupoSanguineoDeleteDialogProps {
  deleteId: number | null
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
  error: string | null
}

export function GrupoSanguineoDeleteDialog({
  deleteId,
  onClose,
  onConfirm,
  deleting,
  error,
}: GrupoSanguineoDeleteDialogProps) {
  return (
    <AlertDialog open={deleteId !== null} onOpenChange={(v) => { if (!v) onClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar grupo sanguíneo?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará el grupo sanguíneo seleccionado.
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
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