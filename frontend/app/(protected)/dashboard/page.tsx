'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Users, Heart, Droplets, Stethoscope, Baby, Activity,
  CheckCircle, Loader2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, CartesianGrid,
  LineChart, Line,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  ChartLegend, ChartLegendContent, type ChartConfig,
} from '@/components/ui/chart'
import { dashboardService } from '@/features/dashboard/dashboard-service'
import type { DashboardData } from '@/features/dashboard/dashboard-types'

// ── Helper to format month strings ──
function formatMonth(mes: string): string {
  const [year, month] = mes.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
}

// ── KPI Card ──
function KpiCard({ title, value, icon: Icon, loading }: { title: string; value: number; icon: any; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  )
}

function PercentKpiCard({ title, value, loading, icon: Icon, goodIf }: { title: string; value: number; loading: boolean; icon: any; goodIf: 'high' | 'low' }) {
  const colorClass = loading ? '' : value >= 70 ? (goodIf === 'high' ? 'text-emerald-600' : 'text-red-600') : (goodIf === 'high' ? 'text-amber-600' : 'text-emerald-600')
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className={`text-2xl font-bold ${colorClass}`}>
            {value.toFixed(1)}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Pie chart helper ──
function PieChartCard({
  title, description, data, loading, colors, config,
}: {
  title: string
  description?: string
  data: { name: string; value: number }[]
  loading: boolean
  colors: string[]
  config: ChartConfig
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">Sin datos</div>
        ) : (
          <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill={colors[idx % colors.length]} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ── Bar chart helper ──
function BarChartCard({ title, description, data, loading, config, dataKey, xKey }: {
  title: string
  description?: string
  data: any[]
  loading: boolean
  config: ChartConfig
  dataKey: string
  xKey: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Sin datos</div>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey={dataKey} fill="var(--color-value)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ── Line chart helper ──
function LineChartCard({ title, description, data, loading, config, dataKey, xKey }: {
  title: string
  description?: string
  data: any[]
  loading: boolean
  config: ChartConfig
  dataKey: string
  xKey: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">Sin datos</div>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
            <LineChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey={dataKey} stroke="var(--color-value)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

// ── Main dashboard page ──
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  const fetchData = useCallback(async (desde?: string, hasta?: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await dashboardService.getDashboard(desde, hasta)
      setData(result)
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.message ?? 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFilter = () => {
    fetchData(fechaDesde || undefined, fechaHasta || undefined)
  }

  // ── Transform data for charts ──
  const donantesPorGrupoData = useMemo(() => {
    if (!data?.donantesPorGrupo) return []
    return data.donantesPorGrupo.map(d => ({
      name: `${d.tipo}${d.factorRh === 'POSITIVO' ? '+' : '-'}`,
      cantidad: d.cantidad,
    }))
  }, [data])

  const evolucionDonacionesData = useMemo(() => {
    if (!data?.evolucionDonaciones) return []
    return data.evolucionDonaciones.map(d => ({
      mes: formatMonth(d.mes),
      cantidad: d.cantidad,
    }))
  }, [data])

  const aptasVsDescartadasData = useMemo(() => {
    if (!data?.donacionesAptasVsDescartadas) return []
    const { aptas, descartadas } = data.donacionesAptasVsDescartadas
    return [
      { name: 'Aptas', value: aptas },
      { name: 'Descartadas', value: descartadas },
    ]
  }, [data])

  const transfusionesData = useMemo(() => {
    if (!data?.transfusionesPorMes) return []
    return data.transfusionesPorMes.map(d => ({
      mes: formatMonth(d.mes),
      cantidad: d.cantidad,
    }))
  }, [data])

  const hemocomponentesData = useMemo(() => {
    if (!data?.hemocomponentesUtilizados) return []
    return data.hemocomponentesUtilizados.map(d => ({
      name: d.componente.replace(/_/g, ' '),
      unidades: d.unidades,
    }))
  }, [data])

  const coombsIndirectoData = useMemo(() => {
    if (!data?.coombsIndirecto) return []
    const { positivo, negativo } = data.coombsIndirecto
    return [
      { name: 'Positivo', value: positivo },
      { name: 'Negativo', value: negativo },
    ]
  }, [data])

  const coombsDirectoData = useMemo(() => {
    if (!data?.coombsDirecto) return []
    const { positivo, negativo } = data.coombsDirecto
    return [
      { name: 'Positivo', value: positivo },
      { name: 'Negativo', value: negativo },
    ]
  }, [data])

  // ── Chart configs ──
  const barConfig = { value: { label: 'Cantidad', color: 'var(--chart-1)' } } satisfies ChartConfig
  const lineConfig = { value: { label: 'Cantidad', color: 'var(--chart-2)' } } satisfies ChartConfig
  const pieAptasConfig = {
    aptas: { label: 'Aptas', color: 'var(--chart-3)' },
    descartadas: { label: 'Descartadas', color: 'var(--chart-4)' },
  } satisfies ChartConfig
  const pieCoombsConfig = {
    positivo: { label: 'Positivo', color: 'var(--chart-4)' },
    negativo: { label: 'Negativo', color: 'var(--chart-3)' },
  } satisfies ChartConfig

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <DatePicker value={fechaDesde} onChange={setFechaDesde} placeholder="Desde" />
        </div>
        <div className="space-y-1.5">
          <DatePicker value={fechaHasta} onChange={setFechaHasta} placeholder="Hasta" />
        </div>
        <Button onClick={handleFilter} disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin mr-2" />}
          Filtrar
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard title="Donantes" value={data?.totalDonantes ?? 0} icon={Users} loading={loading} />
        <KpiCard title="Donaciones" value={data?.totalDonaciones ?? 0} icon={Droplets} loading={loading} />
        <KpiCard title="Pacientes Transfundidos" value={data?.totalPacientesTransfundidos ?? 0} icon={Heart} loading={loading} />
        <KpiCard title="Transfusiones" value={data?.totalTransfusiones ?? 0} icon={Stethoscope} loading={loading} />
        <KpiCard title="Estudios Gestantes" value={data?.totalEstudiosGestantes ?? 0} icon={Baby} loading={loading} />
        <KpiCard title="Recién Nacidos" value={data?.totalRecienNacidos ?? 0} icon={Baby} loading={loading} />
        <PercentKpiCard title="Donaciones Aptas" value={data?.porcentajeDonacionesAptas ?? 0} icon={CheckCircle} loading={loading} goodIf="high" />
        <PercentKpiCard title="Compatibilidad Exitosa" value={data?.porcentajeCompatibilidadExitosa ?? 0} icon={Activity} loading={loading} goodIf="high" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <BarChartCard
          title="Donantes por Grupo Sanguíneo"
          data={donantesPorGrupoData}
          loading={loading}
          config={barConfig}
          dataKey="cantidad"
          xKey="name"
        />
        <LineChartCard
          title="Evolución Mensual de Donaciones"
          description="Cantidad de donaciones por mes"
          data={evolucionDonacionesData}
          loading={loading}
          config={lineConfig}
          dataKey="cantidad"
          xKey="mes"
        />
        <PieChartCard
          title="Donaciones Aptas vs Descartadas"
          data={aptasVsDescartadasData}
          loading={loading}
          colors={['var(--chart-3)', 'var(--chart-4)']}
          config={pieAptasConfig}
        />
        <LineChartCard
          title="Transfusiones por Mes"
          description="Cantidad de transfusiones por mes"
          data={transfusionesData}
          loading={loading}
          config={lineConfig}
          dataKey="cantidad"
          xKey="mes"
        />
        <BarChartCard
          title="Hemocomponentes Utilizados"
          description="Unidades transfundidas por tipo"
          data={hemocomponentesData}
          loading={loading}
          config={barConfig}
          dataKey="unidades"
          xKey="name"
        />
        <PieChartCard
          title="Coombs Indirecto (Gestantes)"
          data={coombsIndirectoData}
          loading={loading}
          colors={['var(--chart-4)', 'var(--chart-3)']}
          config={pieCoombsConfig}
        />
        <PieChartCard
          title="Coombs Directo (Recién Nacidos)"
          data={coombsDirectoData}
          loading={loading}
          colors={['var(--chart-4)', 'var(--chart-3)']}
          config={pieCoombsConfig}
        />
      </div>
    </div>
  )
}
