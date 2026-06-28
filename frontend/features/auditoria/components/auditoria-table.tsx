'use client'

import { useMemo, useState } from 'react'
import { Eye, Loader2, ChevronDown, Columns3, Search } from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { ErrorAlert } from '@/components/ui/error-alert'
import { PaginationBar } from '@/components/data-table/pagination-bar'
import type { AuditoriaEntry } from '@/features/auditoria/auditoria.schema'

const actionVariants: Record<string, string> = {
  CREATE:
    'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400',
  UPDATE:
    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  DELETE:
    'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400',
}

const actionLabels: Record<string, string> = {
  CREATE: 'Creación',
  UPDATE: 'Modificación',
  DELETE: 'Eliminación',
}

const entityLabels: Record<string, string> = {
  User: 'Usuario',
  Donacion: 'Donación',
  Persona: 'Persona',
  Donante: 'Donante',
  Paciente: 'Paciente',
  Transfusion: 'Transfusión',
  Gestante: 'Gestante',
  EstudioGestante: 'Estudio de Gestante',
  RecienNacido: 'Recién Nacido',
  GrupoSanguineo: 'Grupo Sanguíneo',
  ResultadoSerologia: 'Serología',
  ResultadoCoombs: 'Coombs',
  CompatibilidadTransfusional: 'Compatibilidad',
  Session: 'Sesión',
}

function translateEntity(entity: string): string {
  return entityLabels[entity] || entity
}

const entityOptions = [
  'User',
  'Donacion',
  'Persona',
  'Donante',
  'Paciente',
  'Transfusion',
  'Gestante',
  'EstudioGestante',
  'RecienNacido',
  'GrupoSanguineo',
]

interface AuditoriaTableProps {
  filters: {
    entity: string
    setEntity: (v: string) => void
    action: string
    setAction: (v: string) => void
    fechaDesde: string
    setFechaDesde: (v: string) => void
    fechaHasta: string
    setFechaHasta: (v: string) => void
    onAplicar: () => void
  }
  pagination: {
    page: number
    totalPages: number
    total: number
    onPageChange: (p: number) => void
    pageSize: number
    onPageSizeChange: (s: number) => void
  }
  data: {
    items: AuditoriaEntry[]
    loading: boolean
    error: string | null
  }
  onVerDetalle: (entry: AuditoriaEntry) => void
}

export function AuditoriaTable({
  filters,
  pagination,
  data,
  onVerDetalle,
}: AuditoriaTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const columns: ColumnDef<AuditoriaEntry>[] = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        accessorKey: 'createdAt',
        header: 'Fecha',
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap">
            {new Date(row.original.createdAt).toLocaleDateString('es-AR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ),
      },
      {
        id: 'usuario',
        header: 'Usuario',
        cell: ({ row }) => (
          <div>
            <span className="font-medium">
              {row.original.usuario.name || row.original.usuario.email}
            </span>
            {row.original.usuario.name && (
              <span className="text-xs text-muted-foreground ml-1">
                ({row.original.usuario.email})
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'entity',
        header: 'Entidad',
        cell: ({ row }) => translateEntity(row.original.entity),
      },
      {
        accessorKey: 'entityId',
        header: 'ID',
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.entityId}</span>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Acción',
        cell: ({ row }) => (
          <Badge className={actionVariants[row.original.action]}>
            {actionLabels[row.original.action]}
          </Badge>
        ),
      },
      {
        id: 'detalle',
        header: () => <span className="sr-only">Detalle</span>,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onVerDetalle(row.original)}
            title="Ver detalle"
          >
            <Eye className="size-4" />
          </Button>
        ),
      },
    ],
    [onVerDetalle],
  )

  const table = useReactTable({
    data: data.items,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="w-40">
          <Select value={filters.entity} onValueChange={filters.setEntity}>
            <SelectTrigger>
              <SelectValue placeholder="Entidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Todas</SelectItem>
              {entityOptions.map((e) => (
                <SelectItem key={e} value={e}>
                  {translateEntity(e)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <Select
            value={filters.action}
            onValueChange={filters.setAction}
          >
            <SelectTrigger>
              <SelectValue placeholder="Acción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Todas</SelectItem>
              <SelectItem value="CREATE">Creación</SelectItem>
              <SelectItem value="UPDATE">Modificación</SelectItem>
              <SelectItem value="DELETE">Eliminación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <DatePicker
            value={filters.fechaDesde}
            onChange={filters.setFechaDesde}
            placeholder="Fecha desde"
          />
        </div>

        <div className="w-40">
          <DatePicker
            value={filters.fechaHasta}
            onChange={filters.setFechaHasta}
            placeholder="Fecha hasta"
          />
        </div>

        <Button onClick={filters.onAplicar} variant="secondary">
          <Search className="size-4" />
          Filtrar
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3 className="size-4" />
              <span className="hidden lg:inline ml-1">Columnas</span>
              <ChevronDown className="size-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id === 'createdAt'
                    ? 'Fecha'
                    : column.id === 'usuario'
                      ? 'Usuario'
                      : column.id === 'entity'
                        ? 'Entidad'
                        : column.id === 'entityId'
                          ? 'ID'
                          : column.id === 'action'
                            ? 'Acción'
                            : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Error */}
      {data.error && <ErrorAlert message={data.error} />}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  No se encontraron registros de auditoría para los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={pagination.onPageChange}
        pageSize={pagination.pageSize}
        onPageSizeChange={pagination.onPageSizeChange}
      />
    </div>
  )
}
