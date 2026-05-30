'use client'

import { useState, useEffect } from 'react'
import { extractErrorMessage } from '@/lib/error-utils'
import { ErrorAlert } from '@/components/ui/error-alert'
import { formatGrupoSanguineo } from '@/lib/grupo-utils'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Persona, PersonaFormInput } from '@/features/personas/personas.schema'
import type { GrupoSanguineo } from '@/features/grupos-sanguineos/grupos-sanguineos.schema'

interface PersonaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Persona | null
  onSave: (input: PersonaFormInput) => Promise<void>
  grupos: GrupoSanguineo[]
  loadingGrupos: boolean
}

export function PersonaDialog({ open, onOpenChange, editing, onSave, grupos, loadingGrupos }: PersonaDialogProps) {
  const [dni, setDni] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [grupoSanguineoId, setGrupoSanguineoId] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      setDni(editing.dni)
      setNombre(editing.nombre)
      setApellido(editing.apellido)
      setFechaNacimiento(editing.fechaNacimiento.split('T')[0])
      setDireccion(editing.direccion)
      setTelefono(editing.telefono)
      setGrupoSanguineoId(editing.grupoSanguineo.id)
    } else {
      setDni('')
      setNombre('')
      setApellido('')
      setFechaNacimiento('')
      setDireccion('')
      setTelefono('')
      setGrupoSanguineoId(grupos.length > 0 ? grupos[0].id : '')
    }
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (grupoSanguineoId === '') return
    setSaving(true)
    setError(null)
    try {
      await onSave({ dni, nombre, apellido, fechaNacimiento, direccion, telefono, grupoSanguineoId })
    } catch (err) {
      setError(extractErrorMessage(err, 'Error al guardar'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar persona' : 'Nueva persona'}</DialogTitle>
          <DialogDescription>Completá los datos de la persona.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorAlert message={error} />

          <Field>
            <FieldLabel htmlFor="dni">DNI</FieldLabel>
            <Input id="dni" value={dni} onChange={(e) => setDni(e.target.value)} inputMode="numeric" required />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="apellido">Apellido</FieldLabel>
              <Input id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="fechaNacimiento">Fecha de Nacimiento</FieldLabel>
            <Input
              id="fechaNacimiento"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="direccion">Dirección</FieldLabel>
            <Input id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
          </Field>

          <Field>
            <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
            <Input
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              inputMode="tel"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="grupoSanguineoId">Grupo Sanguíneo</FieldLabel>
            {loadingGrupos ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <select
                id="grupoSanguineoId"
                value={grupoSanguineoId}
                onChange={(e) => setGrupoSanguineoId(Number(e.target.value))}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                required
              >
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {formatGrupoSanguineo(g.tipo, g.factorRh)}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || grupoSanguineoId === ''}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
