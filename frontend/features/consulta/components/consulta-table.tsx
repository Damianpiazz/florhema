'use client'

import { useMemo } from 'react'
import { Search, Clock, CheckCircle2, Droplet, Loader2, AlertCircle, X, Check } from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PaginationBar } from '@/components/data-table/pagination-bar'
import type { ConsultaEstudioItem } from '@/features/consulta/consulta-service'

interface ConsultaTableProps {
  search: {
    value: string
    onChange: (v: string) => void
    onSearch: () => void
  }
  data: {
    items: ConsultaEstudioItem[]
    loading: boolean
    error: string | null
  }
  pagination: {
    page: number
    totalPages: number
    total: number
    pageSize: number
    onPageChange: (p: number) => void
    onPageSizeChange: (s: number) => void
  }
}

const estadoVariants: Record<string, string> = {
  FINALIZADO:
    'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200',
  EN_PROCESO:
    'bg-amber-50 text-amber-600 border-amber-200',
  PENDIENTE:
    'bg-gray-100 text-gray-600 border-gray-200',
}

const estadoLabels: Record<string, string> = {
  FINALIZADO: 'Finalizado',
  EN_PROCESO: 'En proceso',
  PENDIENTE: 'Pendiente',
}

function GrupoSanguineoCell({ grupo }: { grupo: { tipo: string; factorRh: string } | null }) {
  if (!grupo) {
    return (
      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
        <Clock className="size-3 mr-1" />
        Pendiente
      </Badge>
    )
  }
  const factor = grupo.factorRh === 'POSITIVO' ? '+' : '-'
  return (
    <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50">
      <Droplet className="size-3 mr-1" />
      {grupo.tipo}{factor}
    </Badge>
  )
}

export function ConsultaTable({ search, data, pagination }: ConsultaTableProps) {
  const columns: ColumnDef<ConsultaEstudioItem>[] = useMemo(
    () => [
      {
        accessorKey: 'persona.apellido',
        header: 'Apellido',
        accessorFn: (row) => row.persona.apellido,
      },
      {
        accessorKey: 'persona.nombre',
        header: 'Nombre',
        accessorFn: (row) => row.persona.nombre,
      },
      {
        accessorKey: 'persona.dni',
        header: 'DNI',
        accessorFn: (row) => row.persona.dni,
      },
      {
        id: 'grupoSanguineo',
        header: 'Grupo',
        cell: ({ row }) => <GrupoSanguineoCell grupo={row.original.persona.grupoSanguineo} />,
      },
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        cell: ({ getValue }) => {
          const v = getValue<string>()
          return new Date(v).toLocaleDateString('es-AR')
        },
      },
      {
        id: 'estadoEstudio',
        header: 'Estado',
        cell: ({ row }) => (
          <Badge variant="outline" className={estadoVariants[row.original.estadoEstudio] ?? ''}>
            {row.original.estadoEstudio === 'FINALIZADO' && <CheckCircle2 className="size-3 mr-1" />}
            {row.original.estadoEstudio === 'EN_PROCESO' && <Clock className="size-3 mr-1" />}
            {estadoLabels[row.original.estadoEstudio] ?? row.original.estadoEstudio}
          </Badge>
        ),
      },
      {
        id: 'compatibilidadConyugal',
        header: 'Compatibilidad',
        cell: ({ getValue }) => {
          const v = getValue<string | null>()
          return v ? <span>{v}</span> : <span className="text-muted-foreground">—</span>
        },
        accessorFn: (row) => row.compatibilidadConyugal,
      },
      {
        id: 'coombsIndirecto',
        header: 'Coombs Indirecto',
        cell: ({ row }) => {
          const positivo = row.original.coombsIndirecto
          return (
            <div className="flex items-center gap-1">
              {positivo ? (
                <X className="size-4 text-red-600" />
              ) : (
                <Check className="size-4 text-green-600" />
              )}
              <span className={positivo ? 'text-red-600 font-medium' : 'text-green-600'}>
                {positivo ? 'Positivo' : 'Negativo'}
              </span>
            </div>
          )
        },
      },
    ],
    [],
  )

  const table = useReactTable({
    data: data.items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por DNI, nombre o apellido..."
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search.onSearch()}
            className="pl-8"
          />
        </div>
        <Button onClick={search.onSearch} disabled={data.loading}>
          {data.loading && <Loader2 className="size-4 animate-spin mr-2" />}
          Buscar
        </Button>
      </div>

      <ErrorAlert message={data.error} />

      {data.loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </Card>
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <Card>
          <div className="p-6 text-center text-muted-foreground">
            <AlertCircle className="size-8 mx-auto mb-2 opacity-50" />
            No se encontraron estudios.
          </div>
        </Card>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationBar
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
          />
        </>
      )}
    </div>
  )
}
