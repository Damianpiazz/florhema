'use client'

import { useState } from 'react'
import { Loader2, FileDown, BarChart3, Syringe, Ban, AlertTriangle, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { reportesService } from '@/features/reportes/reportes-service'
import { cn } from '@/lib/utils'

const PLANILLAS = [
  {
    value: 1,
    icon: BarChart3,
    title: 'HEMO 1 - Resumen Estadístico',
    description: 'Donantes presentados y aceptados, serologías positivas y transfusiones por hemocomponente.',
  },
  {
    value: 2,
    icon: Syringe,
    title: 'HEMO 2 - Hemocomponentes Transfundidos',
    description: 'Detalle de transfusiones por componente y por paciente en el período seleccionado.',
  },
  {
    value: 3,
    icon: Ban,
    title: 'HEMO 3 - Unidades Descartadas',
    description: 'Unidades descartadas por serología positiva y otros motivos de descarte.',
  },
  {
    value: 4,
    icon: AlertTriangle,
    title: 'HEMO 4 - Reacciones Adversas',
    description: 'Reacciones adversas registradas en donantes y pacientes transfundidos.',
  },
  {
    value: 5,
    icon: Activity,
    title: 'HEMO 5 - Gestantes Estudiadas',
    description: 'Resumen de gestantes, estudios realizados, Coombs indirecto y recién nacidos evaluados.',
  },
]

export default function ReportesPage() {
  const [planilla, setPlanilla] = useState<number>(1)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerar = async () => {
    setLoading(true)
    setError(null)
    try {
      await reportesService.descargarReporte(
        planilla,
        fechaDesde || undefined,
        fechaHasta || undefined,
      )
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.message ?? 'Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const selected = PLANILLAS.find((p) => p.value === planilla)

  return (
    <div className="p-6 space-y-6">
      {/* Período y generación */}
      <section className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <DatePicker value={fechaDesde} onChange={setFechaDesde} placeholder="Desde" />
        </div>
        <div className="space-y-1.5">
          <DatePicker value={fechaHasta} onChange={setFechaHasta} placeholder="Hasta" />
        </div>

        <Button onClick={handleGenerar} disabled={loading} size="lg">
          {loading ? (
            <Loader2 className="size-4 animate-spin mr-2" />
          ) : (
            <FileDown className="size-4 mr-2" />
          )}
          {loading ? 'Generando...' : 'Generar Excel'}
        </Button>
      </section>

      {/* Selección de planilla */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Planilla</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PLANILLAS.map((p) => {
            const Icon = p.icon
            const isSelected = planilla === p.value
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPlanilla(p.value)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 text-left text-sm transition-all',
                  'hover:bg-accent hover:text-accent-foreground',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-card',
                )}
              >
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium leading-none">{p.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
