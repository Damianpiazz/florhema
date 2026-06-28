'use client'

import { useReducer, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
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
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { useQuery } from '@tanstack/react-query'
import { gruposSanguineosService } from '@/features/grupos-sanguineos/grupos-sanguineos-service'
import { crearRecienNacidoInputSchema } from '@/features/recien-nacidos/recien-nacidos.schema'
import type { CrearRecienNacidoInput, RecienNacido } from '@/features/recien-nacidos/recien-nacidos.schema'
import type { ZodError } from 'zod'

interface RecienNacidoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: CrearRecienNacidoInput) => Promise<void>
  saving: boolean
  editing?: RecienNacido | null
}

interface FormState {
  dni: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  direccion: string
  telefono: string
  grupoSanguineoId: string
  coombsPositivo: boolean
}

type FormAction =
  | { type: 'SET_FIELD'; field: keyof Omit<FormState, 'coombsPositivo'>; value: string }
  | { type: 'SET_COOMBS_POSITIVO'; value: boolean }
  | { type: 'SET_EDITING'; editing: RecienNacido }
  | { type: 'RESET' }

const initialState: FormState = {
  dni: '',
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  direccion: '',
  telefono: '',
  grupoSanguineoId: '',
  coombsPositivo: false,
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_COOMBS_POSITIVO':
      return { ...state, coombsPositivo: action.value }
    case 'SET_EDITING': {
      const e = action.editing
      return {
        dni: e.persona.dni,
        nombre: e.persona.nombre,
        apellido: e.persona.apellido,
        fechaNacimiento: e.persona.fechaNacimiento.split('T')[0],
        direccion: '',
        telefono: '',
        grupoSanguineoId: '',
        coombsPositivo: e.pruebaCoombsDirecta?.positivo ?? false,
      }
    }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

function toInput(state: FormState): CrearRecienNacidoInput {
  return {
    dni: state.dni,
    nombre: state.nombre,
    apellido: state.apellido,
    fechaNacimiento: state.fechaNacimiento,
    direccion: state.direccion,
    telefono: state.telefono,
    grupoSanguineoId: Number(state.grupoSanguineoId),
    pruebaCoombsDirecta: {
      tipo: 'DIRECTO',
      positivo: state.coombsPositivo,
    },
  }
}

export function RecienNacidoForm({ open, onOpenChange, onSave, saving, editing }: RecienNacidoFormProps) {
  const [form, dispatch] = useReducer(formReducer, initialState)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { data: gruposSanguineos } = useQuery({
    queryKey: ['grupos-sanguineos'],
    queryFn: () => gruposSanguineosService.listar(),
  })

  const gruposList = gruposSanguineos ?? []

  useEffect(() => {
    if (open) {
      if (editing) {
        dispatch({ type: 'SET_EDITING', editing })
      } else {
        dispatch({ type: 'RESET' })
      }
      setServerError(null)
      setFieldErrors({})
    }
  }, [open, editing])

  const setField = (field: keyof Omit<FormState, 'coombsPositivo'>, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value })
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    if (!form.dni || !form.nombre || !form.apellido || !form.fechaNacimiento || !form.direccion || !form.telefono || !form.grupoSanguineoId) {
      setServerError('Completá todos los campos obligatorios')
      return
    }

    const input = toInput(form)
    const result = crearRecienNacidoInputSchema.safeParse(input)

    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of (result.error as ZodError).issues) {
        const path = issue.path.join('.')
        if (!errors[path]) {
          errors[path] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    try {
      await onSave(result.data)
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Error al guardar el recién nacido'))
    }
  }

  const grupoLabel = (g: { id: number; tipo: string; factorRh: string }) =>
    `${g.tipo}${g.factorRh === 'POSITIVO' ? '+' : '-'}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar recién nacido' : 'Nuevo recién nacido'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Actualizá los datos del recién nacido.' : 'Completá los datos del recién nacido.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorAlert message={serverError} />

          {!editing && (
            <Field>
              <FieldLabel htmlFor="dni">DNI</FieldLabel>
              <Input
                id="dni"
                value={form.dni}
                onChange={(e) => setField('dni', e.target.value)}
                placeholder="Ingresá el DNI"
                required
              />
              {fieldErrors.dni && <p className="text-sm text-red-500">{fieldErrors.dni}</p>}
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="nombre">Nombre</FieldLabel>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                placeholder="Nombre"
                required
              />
              {fieldErrors.nombre && <p className="text-sm text-red-500">{fieldErrors.nombre}</p>}
            </Field>
            <Field>
              <FieldLabel htmlFor="apellido">Apellido</FieldLabel>
              <Input
                id="apellido"
                value={form.apellido}
                onChange={(e) => setField('apellido', e.target.value)}
                placeholder="Apellido"
                required
              />
              {fieldErrors.apellido && <p className="text-sm text-red-500">{fieldErrors.apellido}</p>}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="fechaNacimiento">Fecha de nacimiento</FieldLabel>
            <DatePicker
              id="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={(v) => setField('fechaNacimiento', v)}
            />
            {fieldErrors.fechaNacimiento && <p className="text-sm text-red-500">{fieldErrors.fechaNacimiento}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="direccion">Dirección</FieldLabel>
            <Input
              id="direccion"
              value={form.direccion}
              onChange={(e) => setField('direccion', e.target.value)}
              placeholder="Dirección"
              required
            />
            {fieldErrors.direccion && <p className="text-sm text-red-500">{fieldErrors.direccion}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="telefono">Teléfono</FieldLabel>
            <Input
              id="telefono"
              value={form.telefono}
              onChange={(e) => setField('telefono', e.target.value)}
              placeholder="Teléfono"
              required
            />
            {fieldErrors.telefono && <p className="text-sm text-red-500">{fieldErrors.telefono}</p>}
          </Field>

          <Field>
            <FieldLabel htmlFor="grupoSanguineoId">Grupo sanguíneo</FieldLabel>
            <Select
              value={form.grupoSanguineoId || undefined}
              onValueChange={(v) => setField('grupoSanguineoId', v)}
            >
              <SelectTrigger id="grupoSanguineoId" className="w-full">
                <SelectValue placeholder="Seleccionar grupo" />
              </SelectTrigger>
              <SelectContent>
                {gruposList.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {grupoLabel(g)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.grupoSanguineoId && <p className="text-sm text-red-500">{fieldErrors.grupoSanguineoId}</p>}
          </Field>

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Prueba Coombs Directa</h4>
            <p className="text-sm text-muted-foreground">Tipo: DIRECTO</p>
            <div className="flex items-center gap-2">
              <Checkbox
                id="coombsPositivo"
                checked={form.coombsPositivo}
                onCheckedChange={(checked) =>
                  dispatch({ type: 'SET_COOMBS_POSITIVO', value: checked === true })
                }
              />
              <Label htmlFor="coombsPositivo" className="text-sm cursor-pointer">
                Positivo
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
