'use client'

import { useReducer, useEffect, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { crearDonacionInputSchema } from '@/features/donaciones/donaciones.schema'
import type { CrearDonacionInput, SerologiaInput } from '@/features/donaciones/donaciones.schema'
import type { ZodError } from 'zod'

interface DonacionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: CrearDonacionInput) => Promise<void>
  saving: boolean
}

interface FormState {
  donanteId: string
  fecha: string
  peso: string
  tensionArterial: string
  hemoglobina: string
  tipoDonacion: string
  reaccionAdversa: string
  hiv: boolean
  hcv: boolean
  hbv: boolean
  chagas: boolean
  sifilis: boolean
}

type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: string }
  | { type: 'SET_CHECKBOX'; field: 'hiv' | 'hcv' | 'hbv' | 'chagas' | 'sifilis'; value: boolean }
  | { type: 'RESET' }

const initialState: FormState = {
  donanteId: '',
  fecha: '',
  peso: '',
  tensionArterial: '',
  hemoglobina: '',
  tipoDonacion: '',
  reaccionAdversa: '',
  hiv: false,
  hcv: false,
  hbv: false,
  chagas: false,
  sifilis: false,
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_CHECKBOX':
      return { ...state, [action.field]: action.value }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

function toInput(state: FormState): CrearDonacionInput {
  const serologia: SerologiaInput = {
    hiv: state.hiv,
    hcv: state.hcv,
    hbv: state.hbv,
    chagas: state.chagas,
    sifilis: state.sifilis,
  }

  const hasAnySerologia = serologia.hiv || serologia.hcv || serologia.hbv || serologia.chagas || serologia.sifilis

  return {
    donanteId: Number(state.donanteId),
    fecha: state.fecha,
    peso: Number(state.peso),
    tensionArterial: state.tensionArterial,
    hemoglobina: Number(state.hemoglobina),
    tipoDonacion: state.tipoDonacion as 'VOLUNTARIA' | 'REPOSICION',
    reaccionAdversa: state.reaccionAdversa || null,
    resultadoSerologia: hasAnySerologia ? serologia : { hiv: false, hcv: false, hbv: false, chagas: false, sifilis: false },
  }
}

export function DonacionForm({ open, onOpenChange, onSave, saving }: DonacionFormProps) {
  const [form, dispatch] = useReducer(formReducer, initialState)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      dispatch({ type: 'RESET' })
      setServerError(null)
      setFieldErrors({})
    }
  }, [open])

  const setField = (field: keyof FormState, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value })
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const setCheckbox = (field: 'hiv' | 'hcv' | 'hbv' | 'chagas' | 'sifilis', value: boolean) => {
    dispatch({ type: 'SET_CHECKBOX', field, value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    if (!form.donanteId || !form.fecha || !form.peso || !form.tensionArterial || !form.hemoglobina || !form.tipoDonacion) {
      setServerError('Completá todos los campos obligatorios')
      return
    }

    const input = toInput(form)
    const result = crearDonacionInputSchema.safeParse(input)

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
      setServerError(extractErrorMessage(err, 'Error al guardar la donación'))
    }
  }

  const checkboxItems = [
    { field: 'hiv' as const, label: 'HIV' },
    { field: 'hcv' as const, label: 'HCV' },
    { field: 'hbv' as const, label: 'HBV' },
    { field: 'chagas' as const, label: 'Chagas' },
    { field: 'sifilis' as const, label: 'Sífilis' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva donación</DialogTitle>
          <DialogDescription>Completá los datos de la donación.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorAlert message={serverError} />

          <Field>
            <FieldLabel htmlFor="donanteId">Donante (ID)</FieldLabel>
            <Input
              id="donanteId"
              value={form.donanteId}
              onChange={(e) => setField('donanteId', e.target.value)}
              inputMode="numeric"
              required
              placeholder="ID del donante"
            />
            {fieldErrors.donanteId && (
              <p className="text-sm text-red-500">{fieldErrors.donanteId}</p>
            )}
          </Field>

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

          <div className="grid grid-cols-3 gap-3">
            <Field>
              <FieldLabel htmlFor="peso">Peso (kg)</FieldLabel>
              <Input
                id="peso"
                type="number"
                step="0.1"
                min="50"
                value={form.peso}
                onChange={(e) => setField('peso', e.target.value)}
                placeholder="75.5"
                required
              />
              {fieldErrors.peso && (
                <p className="text-sm text-red-500">{fieldErrors.peso}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="tensionArterial">TA</FieldLabel>
              <Input
                id="tensionArterial"
                value={form.tensionArterial}
                onChange={(e) => setField('tensionArterial', e.target.value)}
                placeholder="120/80"
                required
              />
              {fieldErrors.tensionArterial && (
                <p className="text-sm text-red-500">{fieldErrors.tensionArterial}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="hemoglobina">Hb (g/dL)</FieldLabel>
              <Input
                id="hemoglobina"
                type="number"
                step="0.1"
                min="12.5"
                value={form.hemoglobina}
                onChange={(e) => setField('hemoglobina', e.target.value)}
                placeholder="14.5"
                required
              />
              {fieldErrors.hemoglobina && (
                <p className="text-sm text-red-500">{fieldErrors.hemoglobina}</p>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="tipoDonacion">Tipo de donación</FieldLabel>
            <Select
              value={form.tipoDonacion || undefined}
              onValueChange={(v) => setField('tipoDonacion', v)}
            >
              <SelectTrigger id="tipoDonacion" className="w-full">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VOLUNTARIA">Voluntaria</SelectItem>
                <SelectItem value="REPOSICION">Reposición</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.tipoDonacion && (
              <p className="text-sm text-red-500">{fieldErrors.tipoDonacion}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="reaccionAdversa">Reacción adversa (opcional)</FieldLabel>
            <Textarea
              id="reaccionAdversa"
              value={form.reaccionAdversa}
              onChange={(e) => setField('reaccionAdversa', e.target.value)}
              placeholder="Describir si hubo alguna reacción..."
            />
          </Field>

          <Field>
            <FieldLabel>Serología (opcional)</FieldLabel>
            <div className="flex flex-wrap gap-4">
              {checkboxItems.map(({ field, label }) => (
                <div key={field} className="flex items-center gap-2">
                  <Checkbox
                    id={`serologia-${field}`}
                    checked={form[field]}
                    onCheckedChange={(checked) => setCheckbox(field, checked === true)}
                  />
                  <Label htmlFor={`serologia-${field}`} className="text-sm cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </Field>

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
