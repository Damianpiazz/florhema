'use client'

import { useState, useCallback } from 'react'
import { personasService } from '@/features/personas/personas-service'
import type { Persona, PersonaFormInput } from '@/features/personas/personas.schema'

export function usePersonaDialog(onSuccess?: () => void) {
  const [editing, setEditing] = useState<Persona | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSave = useCallback(async (input: PersonaFormInput) => {
    if (editing) {
      await personasService.actualizar(editing.id, input)
    } else {
      await personasService.crear(input)
    }
    setDialogOpen(false)
    setEditing(null)
    onSuccess?.()
  }, [editing, onSuccess])

  return {
    editing,
    setEditing,
    dialogOpen,
    setDialogOpen,
    handleSave,
  }
}
