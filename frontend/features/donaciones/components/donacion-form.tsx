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
import { donacionesService } from '@/features/donaciones/donaciones-service'
import type { CrearDonacionInput, Donacion, SerologiaInput } from '@/features/donaciones/donaciones.schema'
import type { ZodError } from 'zod'

interface DonacionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: CrearDonacionInput) => Promise<void>
  saving: boolean
  editing?: Donacion | null
}

interface FormState {
  dni: string
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
  dni: '',
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
    dni: state.dni,
    fecha: state.fecha,
    peso: Number(state.peso),
    tensionArterial: state.tensionArterial,
    hemoglobina: Number(state.hemoglobina),
    tipoDonacion: state.tipoDonacion as 'VOLUNTARIA' | 'REPOSICION',
    reaccionAdversa: state.reaccionAdversa || null,
    resultadoSerologia: hasAnySerologia ? serologia : { hiv: false, hcv: false, hbv: false, chagas: false, sifilis: false },
  }
}

export function DonacionForm({ open, onOpenChange, onSave, saving, editing }: DonacionFormProps) {
  const [form, dispatch] = useReducer(formReducer, initialState)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [dniStatus, setDniStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [dniDonante, setDniDonante] = useState<{ nombre: string; apellido: string } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (open) {
      if (editing) {
        dispatch({
          type: 'SET_FIELD', field: 'dni', value: editing.donante.dni,
        })
        dispatch({
          type: 'SET_FIELD', field: 'fecha', value: editing.fecha,
        })
        dispatch({
          type: 'SET_FIELD', field: 'peso', value: String(editing.peso),
        })
        dispatch({
          type: 'SET_FIELD', field: 'tensionArterial', value: editing.tensionArterial,
        })
        dispatch({
          type: 'SET_FIELD', field: 'hemoglobina', value: String(editing.hemoglobina),
        })
        dispatch({
          type: 'SET_FIELD', field: 'tipoDonacion', value: editing.tipoDonacion,
        })
        dispatch({
          type: 'SET_FIELD', field: 'reaccionAdversa', value: editing.reaccionAdversa ?? '',
        })
        if (editing.resultadoSerologia) {
          dispatch({ type: 'SET_CHECKBOX', field: 'hiv', value: editing.resultadoSerologia.hiv })
          dispatch({ type: 'SET_CHECKBOX', field: 'hcv', value: editing.resultadoSerologia.hcv })
          dispatch({ type: 'SET_CHECKBOX', field: 'hbv', value: editing.resultadoSerologia.hbv })
          dispatch({ type: 'SET_CHECKBOX', field: 'chagas', value: editing.resultadoSerologia.chagas })
          dispatch({ type: 'SET_CHECKBOX', field: 'sifilis', value: editing.resultadoSerologia.sifilis })
        }
      } else {
        dispatch({ type: 'RESET' })
      }
      setServerError(null)
      setFieldErrors({})
      setDniStatus('idle')
      setDniDonante(null)
    }
  }, [open, editing])

  useEffect(() => {
    if (open && form.dni && form.dni.length >= 7) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setDniStatus('checking')
      debounceRef.current = setTimeout(async () => {
        try {
          const persona = await donacionesService.verificarDonante(form.dni)
          setDniDonante({ nombre: persona.nombre, apellido: persona.apellido })
          setDniStatus('valid')
        } catch (err) {
          setDniDonante(null)
          const msg = err instanceof Error ? err.message : ''
          setDniStatus(msg.includes('Persona no encontrada') ? 'invalid' : 'idle')
          if (msg && !msg.includes('Persona no encontrada')) {
            setServerError(msg)
          }
        }
      }, 400)
    } else {
      setDniStatus('idle')
      setDniDonante(null)
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [open, form.dni])

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

    if (!form.dni || !form.fecha || !form.peso || !form.tensionArterial || !form.hemoglobina || !form.tipoDonacion) {
      setServerError('Completá todos los campos obligatorios')
      return
    }

    if (dniStatus !== 'valid') {
      setServerError('El DNI ingresado no corresponde a un donante registrado')
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
          <DialogTitle>{editing ? 'Editar donación' : 'Nueva donación'}</DialogTitle>
          <DialogDescription>{editing ? 'Actualizá los datos de la donación.' : 'Completá los datos de la donación.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorAlert message={serverError} />

          <Field>
            <FieldLabel htmlFor="dni">DNI del donante</FieldLabel>
            <div className="relative">
              <Input
                id="dni"
                value={form.dni}
                onChange={(e) => setField('dni', e.target.value)}
                placeholder="Ingresá el DNI"
                required
              />
              {dniStatus === 'checking' && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
              )}
              {dniStatus === 'valid' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-lg leading-none">✓</span>
              )}
              {dniStatus === 'invalid' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 text-lg leading-none">✗</span>
              )}
            </div>
            {dniStatus === 'valid' && dniDonante && (
              <p className="text-sm text-green-700 mt-1">{dniDonante.nombre} {dniDonante.apellido}</p>
            )}
            {dniStatus === 'invalid' && (
              <p className="text-sm text-red-500 mt-1">Persona no encontrada</p>
            )}
            {fieldErrors.dni && (
              <p className="text-sm text-red-500">{fieldErrors.dni}</p>
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
            <Button type="submit" disabled={saving || dniStatus === 'checking'}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
