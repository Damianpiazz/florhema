'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ErrorAlert } from '@/components/ui/error-alert'
import type { GrupoSanguineo, ActualizarGrupoInput } from '@/features/grupos-sanguineos/grupos-sanguineos.schema'

interface GrupoSanguineoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: ActualizarGrupoInput) => Promise<void>
  saving: boolean
  editing: GrupoSanguineo | null
}

export function GrupoSanguineoForm({
  open,
  onOpenChange,
  onSave,
  saving,
  editing,
}: GrupoSanguineoFormProps) {
  const [tipo, setTipo] = useState(editing?.tipo ?? '')
  const [factorRh, setFactorRh] = useState(editing?.factorRh ?? '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await onSave({ tipo, factorRh })
      setTipo('')
      setFactorRh('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setError(null)
      setTipo('')
      setFactorRh('')
    }
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar grupo sanguíneo' : 'Nuevo grupo sanguíneo'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Actualizá el tipo y factor Rh del grupo.'
              : 'Creá un nuevo grupo sanguíneo con su tipo ABO y factor Rh.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ErrorAlert message={error} />
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo} required>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="AB">AB</SelectItem>
                  <SelectItem value="O">O</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="factorRh">Factor Rh</Label>
              <Select value={factorRh} onValueChange={setFactorRh} required>
                <SelectTrigger id="factorRh">
                  <SelectValue placeholder="Seleccionar factor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POSITIVO">Positivo</SelectItem>
                  <SelectItem value="NEGATIVO">Negativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}