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
import { crearTransfusionInputSchema } from '@/features/transfusiones/transfusiones.schema'
import { transfusionesService } from '@/features/transfusiones/transfusiones-service'
import type { CrearTransfusionInput, Transfusion } from '@/features/transfusiones/transfusiones.schema'
import type { ZodError } from 'zod'

interface TransfusionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: CrearTransfusionInput) => Promise<void>
  saving: boolean
  editing?: Transfusion | null
  gruposSanguineos: { id: number; tipo: string; factorRh: string }[]
}

interface FormState {
  dni: string
  fecha: string
  componente: string
  cantidadUnidades: string
  reaccionAdversa: string
  donanteGrupoId: string
  receptorGrupoId: string
  compatible: boolean
  motivoIncompatibilidad: string
  coombsTipo: string
  coombsPositivo: boolean
}

type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: string }
  | { type: 'SET_CHECKBOX'; field: 'compatible' | 'coombsPositivo'; value: boolean }
  | { type: 'SET_EDITING'; editing: Transfusion }
  | { type: 'RESET' }

const initialState: FormState = {
  dni: '',
  fecha: '',
  componente: '',
  cantidadUnidades: '',
  reaccionAdversa: '',
  donanteGrupoId: '',
  receptorGrupoId: '',
  compatible: true,
  motivoIncompatibilidad: '',
  coombsTipo: 'DIRECTO',
  coombsPositivo: false,
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_CHECKBOX':
      return { ...state, [action.field]: action.value }
    case 'SET_EDITING': {
      const e = action.editing
      return {
        dni: e.paciente.dni,
        fecha: e.fecha.split('T')[0],
        componente: e.componente,
        cantidadUnidades: String(e.cantidadUnidades),
        reaccionAdversa: e.reaccionAdversa ?? '',
        donanteGrupoId: e.compatibilidad ? String(e.compatibilidad.donanteGrupo.id) : '',
        receptorGrupoId: e.compatibilidad ? String(e.compatibilidad.receptorGrupo.id) : '',
        compatible: e.compatibilidad?.compatible ?? true,
        motivoIncompatibilidad: e.compatibilidad?.motivoIncompatibilidad ?? '',
        coombsTipo: e.resultadoCoombs?.tipo ?? 'DIRECTO',
        coombsPositivo: e.resultadoCoombs?.positivo ?? false,
      }
    }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

function toInput(state: FormState): CrearTransfusionInput {
  return {
    dni: state.dni,
    fecha: state.fecha,
    componente: state.componente as 'GLOBULOS_ROJOS' | 'PLASMA' | 'PLAQUETAS' | 'CRIOPRECIPITADO',
    cantidadUnidades: Number(state.cantidadUnidades),
    reaccionAdversa: state.reaccionAdversa || null,
    compatibilidad: {
      donanteGrupoId: Number(state.donanteGrupoId),
      receptorGrupoId: Number(state.receptorGrupoId),
      compatible: state.compatible,
      motivoIncompatibilidad: state.motivoIncompatibilidad || null,
    },
    resultadoCoombs: {
      tipo: state.coombsTipo as 'DIRECTO' | 'INDIRECTO',
      positivo: state.coombsPositivo,
    },
  }
}

export function TransfusionForm({ open, onOpenChange, onSave, saving, editing, gruposSanguineos }: TransfusionFormProps) {
  const [form, dispatch] = useReducer(formReducer, initialState)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [dniStatus, setDniStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [pacienteData, setPacienteData] = useState<{ nombre: string; apellido: string } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (open) {
      if (editing) {
        dispatch({ type: 'SET_EDITING', editing })
        setDniStatus('valid')
        setPacienteData({ nombre: editing.paciente.nombre, apellido: editing.paciente.apellido })
      } else {
        dispatch({ type: 'RESET' })
        setDniStatus('idle')
        setPacienteData(null)
      }
      setServerError(null)
      setFieldErrors({})
    }
  }, [open, editing])

  useEffect(() => {
    if (open && !editing && form.dni && form.dni.length >= 7) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      setDniStatus('checking')
      debounceRef.current = setTimeout(async () => {
        try {
          const persona = await transfusionesService.verificarPaciente(form.dni)
          setPacienteData({ nombre: persona.nombre, apellido: persona.apellido })
          setDniStatus('valid')
        } catch (err) {
          setPacienteData(null)
          const msg = err instanceof Error ? err.message : ''
          setDniStatus(msg.includes('Persona no encontrada') ? 'invalid' : 'idle')
          if (msg && !msg.includes('Persona no encontrada')) {
            setServerError(msg)
          }
        }
      }, 400)
    } else if (!editing) {
      setDniStatus('idle')
      setPacienteData(null)
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [open, editing, form.dni])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    if (!form.dni || !form.fecha || !form.componente || !form.cantidadUnidades || !form.donanteGrupoId || !form.receptorGrupoId || !form.coombsTipo) {
      setServerError('Completá todos los campos obligatorios')
      return
    }

    if (dniStatus !== 'valid') {
      setServerError('El DNI ingresado no corresponde a un paciente registrado')
      return
    }

    const input = toInput(form)
    const result = crearTransfusionInputSchema.safeParse(input)

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
      setServerError(extractErrorMessage(err, 'Error al guardar la transfusión'))
    }
  }

  const grupoLabel = (g: { id: number; tipo: string; factorRh: string }) =>
    `${g.tipo}${g.factorRh === 'POSITIVO' ? '+' : '-'}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar transfusión' : 'Nueva transfusión'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Actualizá los datos de la transfusión.' : 'Completá los datos de la transfusión.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorAlert message={serverError} />

          <Field>
            <FieldLabel htmlFor="dni">DNI del paciente</FieldLabel>
            <div className="relative">
              <Input
                id="dni"
                value={form.dni}
                onChange={(e) => setField('dni', e.target.value)}
                placeholder="Ingresá el DNI"
                inputMode="numeric"
                readOnly={!!editing}
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
            {dniStatus === 'valid' && pacienteData && (
              <p className="text-sm text-green-700 mt-1">{pacienteData.nombre} {pacienteData.apellido}</p>
            )}
            {dniStatus === 'invalid' && (
              <p className="text-sm text-red-500 mt-1">Persona no encontrada o no es paciente</p>
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

          <Field>
            <FieldLabel htmlFor="componente">Componente</FieldLabel>
            <Select
              value={form.componente || undefined}
              onValueChange={(v) => setField('componente', v)}
            >
              <SelectTrigger id="componente" className="w-full">
                <SelectValue placeholder="Seleccionar componente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GLOBULOS_ROJOS">G. Rojos</SelectItem>
                <SelectItem value="PLASMA">Plasma</SelectItem>
                <SelectItem value="PLAQUETAS">Plaquetas</SelectItem>
                <SelectItem value="CRIOPRECIPITADO">Crioprecipitado</SelectItem>
              </SelectContent>
            </Select>
            {fieldErrors.componente && (
              <p className="text-sm text-red-500">{fieldErrors.componente}</p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="cantidadUnidades">Cantidad de unidades</FieldLabel>
            <Input
              id="cantidadUnidades"
              type="number"
              min="1"
              value={form.cantidadUnidades}
              onChange={(e) => setField('cantidadUnidades', e.target.value)}
              placeholder="2"
              required
            />
            {fieldErrors.cantidadUnidades && (
              <p className="text-sm text-red-500">{fieldErrors.cantidadUnidades}</p>
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

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Compatibilidad Transfusional</h4>

            <Field>
              <FieldLabel htmlFor="donanteGrupoId">Grupo donante</FieldLabel>
              <Select
                value={form.donanteGrupoId || undefined}
                onValueChange={(v) => setField('donanteGrupoId', v)}
              >
                <SelectTrigger id="donanteGrupoId" className="w-full">
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  {gruposSanguineos.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {grupoLabel(g)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="receptorGrupoId">Grupo receptor</FieldLabel>
              <Select
                value={form.receptorGrupoId || undefined}
                onValueChange={(v) => setField('receptorGrupoId', v)}
              >
                <SelectTrigger id="receptorGrupoId" className="w-full">
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  {gruposSanguineos.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {grupoLabel(g)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-center gap-2">
              <Checkbox
                id="compatible"
                checked={form.compatible}
                onCheckedChange={(checked) =>
                  dispatch({ type: 'SET_CHECKBOX', field: 'compatible', value: checked === true })
                }
              />
              <Label htmlFor="compatible" className="text-sm cursor-pointer">
                Compatible
              </Label>
            </div>

            {!form.compatible && (
              <Field>
                <FieldLabel htmlFor="motivoIncompatibilidad">Motivo de incompatibilidad</FieldLabel>
                <Textarea
                  id="motivoIncompatibilidad"
                  value={form.motivoIncompatibilidad}
                  onChange={(e) => setField('motivoIncompatibilidad', e.target.value)}
                  placeholder="Describir el motivo..."
                />
              </Field>
            )}
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Resultado Coombs</h4>

            <Field>
              <FieldLabel htmlFor="coombsTipo">Tipo</FieldLabel>
              <Select
                value={form.coombsTipo || undefined}
                onValueChange={(v) => setField('coombsTipo', v)}
              >
                <SelectTrigger id="coombsTipo" className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIRECTO">Directo</SelectItem>
                  <SelectItem value="INDIRECTO">Indirecto</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-center gap-2">
              <Checkbox
                id="coombsPositivo"
                checked={form.coombsPositivo}
                onCheckedChange={(checked) =>
                  dispatch({ type: 'SET_CHECKBOX', field: 'coombsPositivo', value: checked === true })
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
            <Button type="submit" disabled={saving || dniStatus === 'checking'}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
