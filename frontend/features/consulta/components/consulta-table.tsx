'use client'

import { useMemo } from 'react'
import { Search, Clock, CheckCircle2, Droplet, Loader2, AlertCircle } from 'lucide-react'
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
import type { ConsultaGestanteItem } from '@/features/consulta/consulta-service'

interface ConsultaTableProps {
  search: {
    value: string
    onChange: (v: string) => void
    onSearch: () => void
  }
  data: {
    items: ConsultaGestanteItem[]
    loading: boolean
    error: string | null
    searched: boolean
  }
}

function GrupoBadge({ grupo }: { grupo: { tipo: string; factorRh: string } | null }) {
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
    <Badge
      variant="outline"
      className="text-emerald-600 border-emerald-300 bg-emerald-50 text-sm px-3 py-1"
    >
      <Droplet className="size-3 mr-1" />
      {grupo.tipo}
      {factor}
    </Badge>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  if (estado === 'FINALIZADO') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
        <CheckCircle2 className="size-3 mr-1" />
        Finalizado
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-amber-600 bg-amber-50 border-amber-200">
      <Clock className="size-3 mr-1" />
      {estado === 'EN_PROCESO' ? 'En proceso' : 'Pendiente'}
    </Badge>
  )
}

export function ConsultaTable({ search, data }: ConsultaTableProps) {
  const columns: ColumnDef<ConsultaGestanteItem>[] = useMemo(
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
        header: 'Grupo Sanguíneo',
        cell: ({ row }) => <GrupoBadge grupo={row.original.persona.grupoSanguineo} />,
      },
      {
        id: 'ultimoEstudio',
        header: 'Último Estudio',
        cell: ({ row }) => {
          const gestante = row.original
          if (!gestante.ultimoEstudio) {
            return (
              <Badge variant="outline" className="text-muted-foreground">
                Sin estudios
              </Badge>
            )
          }
          return (
            <div className="flex items-center gap-2">
              <EstadoBadge estado={gestante.ultimoEstudio.estadoEstudio} />
              <span className="text-xs text-muted-foreground">
                {new Date(gestante.ultimoEstudio.fecha).toLocaleDateString('es-AR')}
              </span>
            </div>
          )
        },
      },
      {
        id: 'totalEstudios',
        header: 'Total Estudios',
        accessorFn: (row) => row.totalEstudios,
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<number>()}</span>
        ),
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
        <Button onClick={search.onSearch} disabled={data.loading || !search.value.trim()}>
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
      ) : data.searched && data.items.length === 0 ? (
        <Card>
          <div className="p-6 text-center text-muted-foreground">
            <AlertCircle className="size-8 mx-auto mb-2 opacity-50" />
            No se encontraron gestantes con ese criterio de búsqueda.
          </div>
        </Card>
      ) : data.items.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {data.items.length} resultado{data.items.length !== 1 ? 's' : ''}
          </p>
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
        </>
      ) : null}
    </div>
  )
}
