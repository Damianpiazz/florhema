import type { ColumnDef } from '@tanstack/react-table'
import { formatDate } from '@/utils/date-utils'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type {
  Donacion,
  Transfusion,
  EstudioGestante,
  RecienNacido,
  ActividadItem,
} from '@/features/personas/persona-detalle.schema'

export const donacionColumns: ColumnDef<Donacion>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'fecha', header: 'Fecha', cell: ({ getValue }) => formatDate(getValue<string>()) },
  { accessorKey: 'tipoDonacion', header: 'Tipo' },
  { accessorKey: 'peso', header: 'Peso', cell: ({ getValue }) => `${getValue<number>()} kg` },
  { accessorKey: 'tensionArterial', header: 'T. Arterial' },
  { accessorKey: 'hemoglobina', header: 'Hemoglobina', cell: ({ getValue }) => `${getValue<number>()} g/dL` },
  {
    id: 'serologia',
    header: 'Serología',
    cell: ({ row }) => {
      const s = row.original.resultadoSerologia
      if (!s) return '—'
      const positivos = (Object.entries(s) as [string, boolean][])
        .filter(([k, v]) => k !== 'id' && v)
        .map(([k]) => k.toUpperCase())
      return positivos.length > 0 ? positivos.join(', ') : 'Todo negativo'
    },
  },
  {
    accessorKey: 'reaccionAdversa',
    header: 'Reacción',
    cell: ({ getValue }) => getValue<string | null>() ?? '—',
  },
]

export const transfusionColumns: ColumnDef<Transfusion>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'fecha', header: 'Fecha', cell: ({ getValue }) => formatDate(getValue<string>()) },
  {
    accessorKey: 'componente',
    header: 'Componente',
    cell: ({ getValue }) => getValue<string>().replace('_', ' '),
  },
  { accessorKey: 'cantidadUnidades', header: 'Unidades' },
  {
    id: 'compatibilidad',
    header: 'Compatibilidad',
    cell: ({ row }) => {
      const c = row.original.compatibilidad
      return c ? (c.compatible ? 'Compatible' : 'Incompatible') : '—'
    },
  },
  {
    id: 'coombs',
    header: 'Coombs',
    cell: ({ row }) => {
      const c = row.original.resultadoCoombs
      return c ? (c.positivo ? 'Positivo' : 'Negativo') : '—'
    },
  },
  {
    accessorKey: 'reaccionAdversa',
    header: 'Reacción',
    cell: ({ getValue }) => getValue<string | null>() ?? '—',
  },
]

export const estudioColumns: ColumnDef<EstudioGestante>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'fecha', header: 'Fecha', cell: ({ getValue }) => formatDate(getValue<string>()) },
  { accessorKey: 'estadoEstudio', header: 'Estado' },
  {
    accessorKey: 'compatibilidadConyugal',
    header: 'Comp. Conyugal',
    cell: ({ getValue }) => getValue<string | null>() ?? '—',
  },
  {
    id: 'coombsIndirecto',
    header: 'Coombs Indirecto',
    cell: ({ row }) => {
      const c = row.original.pruebaCoombsIndirecta
      return c ? (c.positivo ? 'Positivo' : 'Negativo') : '—'
    },
  },
]

export const recienNacidoColumns: ColumnDef<RecienNacido>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'personaId', header: 'Persona ID' },
  {
    id: 'coombsDirecto',
    header: 'Coombs Directo',
    cell: ({ row }) => {
      const c = row.original.pruebaCoombsDirecta
      return c ? (c.positivo ? 'Positivo' : 'Negativo') : '—'
    },
  },
]

export const actividadColumns: ColumnDef<ActividadItem>[] = [
  { accessorKey: 'id', header: 'ID' },
  {
    id: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => {
      const item = row.original
      switch (item.tipo) {
        case 'DONACION': return <span>Donación</span>
        case 'TRANSFUSION': return <span>Transfusión</span>
        case 'ESTUDIO_GESTANTE': return <span>Estudio Gestante</span>
        case 'RECIEN_NACIDO': return <span>Recién Nacido</span>
      }
    },
    enableSorting: false,
  },
  {
    accessorKey: 'fecha',
    header: 'Fecha',
    cell: ({ getValue }) => {
      const d = getValue<string>()
      return new Date(d).toLocaleString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },
  {
    id: 'resumen',
    header: 'Resumen',
    cell: ({ row }) => {
      const item = row.original
      switch (item.tipo) {
        case 'DONACION':
          return `${item.tipoDonacion} · ${item.peso} kg · Hb ${item.hemoglobina} g/dL`
        case 'TRANSFUSION':
          return `${item.componente.replace('_', ' ')} · ${item.cantidadUnidades} unidad(es)`
        case 'ESTUDIO_GESTANTE':
          return `${item.estadoEstudio}${item.compatibilidadConyugal ? ` · ${item.compatibilidadConyugal}` : ''}`
        case 'RECIEN_NACIDO':
          return `Persona #${item.personaId}`
      }
    },
  },
]
