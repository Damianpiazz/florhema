'use client'

import { useReducer, useEffect, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import type { Persona, PersonaFormInput } from '@/features/personas/personas.schema'
import type { GrupoSanguineo } from '@/features/grupos-sanguineos/grupos-sanguineos.schema'

interface PersonaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Persona | null
  onSave: (input: PersonaFormInput) => Promise<void>
  saving: boolean
  grupos: GrupoSanguineo[]
  loadingGrupos: boolean
}

interface FormState {
  dni: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  direccion: string
  telefono: string
  grupoSanguineoId: string
}

type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: string }
  | { type: 'RESET'; values?: Partial<FormState> }

const initialState: FormState = {
  dni: '',
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  direccion: '',
  telefono: '',
  grupoSanguineoId: '',
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'RESET':
      return { ...initialState, ...action.values }
    default:
      return state
  }
}

function toInput(state: FormState): PersonaFormInput {
  return {
    dni: state.dni,
    nombre: state.nombre,
    apellido: state.apellido,
    fechaNacimiento: state.fechaNacimiento,
    direccion: state.direccion,
    telefono: state.telefono,
    grupoSanguineoId: Number(state.grupoSanguineoId),
  }
}

export function PersonaDialog({ open, onOpenChange, editing, onSave, saving, grupos, loadingGrupos }: PersonaDialogProps) {
  const [form, dispatch] = useReducer(formReducer, initialState)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (editing) {
      dispatch({
        type: 'RESET',
        values: {
          dni: editing.dni,
          nombre: editing.nombre,
          apellido: editing.apellido,
          fechaNacimiento: editing.fechaNacimiento.split('T')[0],
          direccion: editing.direccion,
          telefono: editing.telefono,
          grupoSanguineoId: String(editing.grupoSanguineo.id),
        },
      })
    } else {
      const defaultGroup = grupos.length > 0 ? String(grupos[0].id) : ''
      dispatch({ type: 'RESET', values: { grupoSanguineoId: defaultGroup } })
    }
    setServerError(null)
  }, [editing, open, grupos.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.grupoSanguineoId === '') return
    setServerError(null)
    try {
      await onSave(toInput(form))
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Error al guardar'))
    }
  }

  const setField = (field: keyof FormState, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar persona' : 'Nueva persona'}</DialogTitle>
          <DialogDescription>Completá los datos de la persona.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorAlert message={serverError} />

          <Field>
            <FieldLabel htmlFor="dni">DNI</FieldLabel>
            <Input id="dni" value={form.dni} onChange={(e) => setField('dni', e.target.value)} inputMode="numeric" required />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
              <Input id="nombre" value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="apellido">Apellido</FieldLabel>
              <Input id="apellido" value={form.apellido} onChange={(e) => setField('apellido', e.target.value)} required />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="fechaNacimiento">Fecha de Nacimiento</FieldLabel>
            <DatePicker
              id="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={(v) => setField('fechaNacimiento', v)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="direccion">Dirección</FieldLabel>
            <Input id="direccion" value={form.direccion} onChange={(e) => setField('direccion', e.target.value)} required />
          </Field>

          <Field>
            <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
            <Input
              id="telefono"
              value={form.telefono}
              onChange={(e) => setField('telefono', e.target.value)}
              inputMode="tel"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="grupoSanguineoId">Grupo Sanguíneo</FieldLabel>
            {loadingGrupos ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Select
                value={form.grupoSanguineoId || undefined}
                onValueChange={(v) => setField('grupoSanguineoId', v)}
              >
                <SelectTrigger id="grupoSanguineoId" className="w-full">
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Grupos sanguíneos</SelectLabel>
                    {grupos.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {formatGrupoSanguineo(g.tipo, g.factorRh)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || form.grupoSanguineoId === ''}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}