'use client'

import { useState, useCallback } from 'react'
import { extractErrorMessage } from '@/lib/error-utils'
import { personasService } from '@/features/personas/personas-service'

export function usePersonaDelete(onSuccess?: () => void) {
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    setDeleting(true)
    setError(null)
    try {
      await personasService.eliminar(deleteId)
      setDeleteId(null)
      onSuccess?.()
    } catch (err) {
      setError(extractErrorMessage(err, 'Error al eliminar persona'))
    } finally {
      setDeleting(false)
    }
  }, [deleteId, onSuccess])

  const handleClose = useCallback(() => {
    setError(null)
    setDeleteId(null)
  }, [])

  return {
    deleteId,
    setDeleteId,
    handleDelete,
    handleClose,
    error,
    deleting,
  }
}
