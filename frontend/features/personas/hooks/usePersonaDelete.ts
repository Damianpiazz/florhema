'use client'

import { useState, useCallback } from 'react'
import { extractErrorMessage } from '@/lib/error-utils'
import { personasService } from '@/features/personas/personas-service'

export function usePersonaDelete(onSuccess?: () => void) {
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    setError(null)
    try {
      await personasService.eliminar(deleteId)
      setDeleteId(null)
      onSuccess?.()
    } catch (err) {
      setError(extractErrorMessage(err, 'Error al eliminar persona'))
      throw err
    }
  }, [deleteId, onSuccess])

  return {
    deleteId,
    setDeleteId,
    handleDelete,
    error,
    setError,
  }
}
