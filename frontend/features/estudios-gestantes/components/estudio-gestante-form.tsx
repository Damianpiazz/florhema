'use client'

import { useReducer, useEffect, useState, useRef } from 'react'
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
import { crearEstudioGestanteInputSchema } from '@/features/estudios-gestantes/estudios-gestantes.schema'
import { estudiosGestantesService } from '@/features/estudios-gestantes/estudios-gestantes-service'
import type { CrearEstudioGestanteInput, EstudioGestante } from '@/features/estudios-gestantes/estudios-gestantes.schema'
import type { ZodError } from 'zod'

interface EstudioGestanteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: CrearEstudioGestanteInput) => Promise<void>
  saving: boolean
  editing?: EstudioGestante | null
}

interface FormState {
  fecha: string
  compatibilidadConyugal: string
  estadoEstudio: string
  coombsPositivo: boolean
}

type FormAction =
  | { type: 'SET_FIELD'; field: keyof Omit<FormState, 'coombsPositivo'>; value: string }
  | { type: 'SET_COOMBS_POSITIVO'; value: boolean }
  | { type: 'SET_EDITING'; editing: EstudioGestante }
  | { type: 'RESET' }

const initialState: FormState = {
  fecha: '',
  compatibilidadConyugal: '',
  estadoEstudio: 'PENDIENTE',
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
        fecha: e.fecha.split('T')[0],
        compatibilidadConyugal: e.compatibilidadConyugal ?? '',
        estadoEstudio: e.estadoEstudio,
        coombsPositivo: e.pruebaCoombsIndirecta?.positivo ?? false,
      }
    }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

function toInput(state: FormState): CrearEstudioGestanteInput {
  return {
    fecha: state.fecha,
    compatibilidadConyugal: state.compatibilidadConyugal,
    estadoEstudio: state.estadoEstudio as 'PENDIENTE' | 'FINALIZADO',
    pruebaCoombsIndirecta: {
      tipo: 'INDIRECTO',
      positivo: state.coombsPositivo,
    },
  }
}

export function EstudioGestanteForm({ open, onOpenChange, onSave, saving, editing }: EstudioGestanteFormProps) {
  const [form, dispatch] = useReducer(formReducer, initialState)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

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

    if (!form.fecha || !form.compatibilidadConyugal || !form.estadoEstudio) {
      setServerError('Completá todos los campos obligatorios')
      return
    }

    const input = toInput(form)
    const result = crearEstudioGestanteInputSchema.safeParse(input)

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
      setServerError(extractErrorMessage(err, 'Error al guardar el estudio'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar estudio' : 'Nuevo estudio'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Actualizá los datos del estudio gestacional.' : 'Completá los datos del estudio gestacional.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorAlert message={serverError} />

          <Field>
            <FieldLabel htmlFor="fecha">Fecha</FieldLabel>
            <DatePicker
              id="fecha"
              value={form.fecha}
              onChange={(v) => setField('fecha', v)}
            />
            {fieldErrors.fecha && (
              <p className="text-sm text-red-500">{fieldErrors.fecha}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="compatibilidadConyugal">Compatibilidad conyugal</FieldLabel>
            <Input
              id="compatibilidadConyugal"
              value={form.compatibilidadConyugal}
              onChange={(e) => setField('compatibilidadConyugal', e.target.value)}
              placeholder="Ej: Compatible - Grupo O+ ambos"
              required
            />
            {fieldErrors.compatibilidadConyugal && (
              <p className="text-sm text-red-500">{fieldErrors.compatibilidadConyugal}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="estadoEstudio">Estado</FieldLabel>
            <Select
              value={form.estadoEstudio || undefined}
              onValueChange={(v) => setField('estadoEstudio', v)}
            >
              <SelectTrigger id="estadoEstudio" className="w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="FINALIZADO">Finalizado</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.estadoEstudio && (
              <p className="text-sm text-red-500">{fieldErrors.estadoEstudio}</p>
            )}
          </Field>

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Prueba Coombs Indirecta</h4>

            <p className="text-sm text-muted-foreground">Tipo: INDIRECTO</p>

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
