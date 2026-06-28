'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Check } from 'lucide-react'
import { extractErrorMessage } from '@/utils/error-utils'
import { ErrorAlert } from '@/components/ui/error-alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/axios'

interface PacienteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (personaId: number) => Promise<void>
  saving: boolean
}

export function PacienteForm({ open, onOpenChange, onSave, saving }: PacienteFormProps) {
  const [dni, setDni] = useState('')
  const [searching, setSearching] = useState(false)
  const [personaFound, setPersonaFound] = useState<{ id: number; nombre: string; apellido: string } | null>(null)
  const [personaError, setPersonaError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDni('')
      setPersonaFound(null)
      setPersonaError(null)
      setServerError(null)
    }
  }, [open])

  const handleSearchPersona = async () => {
    if (!dni.trim()) return
    setSearching(true)
    setPersonaError(null)
    setPersonaFound(null)
    try {
      const { data: res } = await api.get(`/personas/dni/${dni.trim()}`)
      const p = res.data.item
      if (p.paciente) {
        setPersonaError('La persona ya está registrada como paciente')
      } else {
        setPersonaFound({ id: p.id, nombre: p.nombre, apellido: p.apellido })
      }
    } catch (err) {
      setPersonaError(extractErrorMessage(err, 'Persona no encontrada'))
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!personaFound) {
      setServerError('Buscá una persona por DNI antes de registrar')
      return
    }

    try {
      await onSave(personaFound.id)
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Error al registrar paciente'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar paciente</DialogTitle>
          <DialogDescription>
            Buscá una persona por DNI para registrarla como paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ingresar DNI..."
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchPersona()}
            />
            <Button type="button" onClick={handleSearchPersona} disabled={searching || !dni.trim()}>
              {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Buscar
            </Button>
          </div>

          <ErrorAlert message={personaError} />

          {personaFound && (
            <Card>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{personaFound.nombre} {personaFound.apellido}</p>
                  <p className="text-sm text-muted-foreground">DNI: {dni}</p>
                </div>
                <Check className="size-5 text-green-600" />
              </CardContent>
            </Card>
          )}

          <ErrorAlert message={serverError} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!personaFound || saving}>
              {saving ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
