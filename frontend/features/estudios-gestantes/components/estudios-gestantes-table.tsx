'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  Columns3,
  Check,
  X,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { ErrorAlert } from '@/components/ui/error-alert'
import { PaginationBar } from '@/components/data-table/pagination-bar'
import { estudiosGestantesService } from '@/features/estudios-gestantes/estudios-gestantes-service'
import type { EstudioGestante } from '@/features/estudios-gestantes/estudios-gestantes.schema'

interface EstudiosGestantesTableProps {
  dni?: {
    value: string
    onChange: (v: string) => void
    onSearch: () => void
    onClear: () => void
    status: 'idle' | 'checking' | 'valid' | 'invalid'
    gestanteInfo: { nombre: string; apellido: string } | null
    error: string | null
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
    items: EstudioGestante[]
    loading: boolean
    error: string | null
  }
  filters: {
    estadoEstudio: string
    onEstadoEstudioChange: (v: string) => void
    fechaDesde: string
    onFechaDesdeChange: (v: string) => void
    fechaHasta: string
    onFechaHastaChange: (v: string) => void
    onFilterChange: () => void
  }
  onNuevo: () => void
  onEditar: (estudio: EstudioGestante) => void
  onEliminar: (id: number) => void
}

export function EstudiosGestantesTable({
  dni,
  pagination,
  data,
  filters,
  onNuevo,
  onEditar,
  onEliminar,
}: EstudiosGestantesTableProps) {
  const { user } = useAuth()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const columns: ColumnDef<EstudioGestante>[] = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    {
      accessorKey: 'fecha',
      id: 'fecha',
      header: 'Fecha',
      cell: ({ getValue }) => {
        const v = getValue<string>()
        return <span>{new Date(v).toLocaleDateString('es-AR')}</span>
      },
    },
    {
      accessorKey: 'estadoEstudio',
      header: 'Estado',
      cell: ({ getValue }) => {
        const v = getValue<string>()
        return (
          <span className={v === 'FINALIZADO' ? 'text-green-600 font-medium' : 'text-amber-600'}>
            {v}
          </span>
        )
      },
    },
    {
      accessorKey: 'compatibilidadConyugal',
      header: 'Comp. Conyugal',
      cell: ({ getValue }) => {
        const v = getValue<string | null>()
        return v ? <span>{v}</span> : <span className="text-muted-foreground">—</span>
      },
    },
    {
      id: 'coombs',
      header: 'Coombs Indirecto',
      cell: ({ row }) => {
        const c = row.original.pruebaCoombsIndirecta
        if (!c) return <span className="text-muted-foreground">—</span>
        return (
          <div className="flex items-center gap-1">
            {c.positivo ? (
              <X className="size-4 text-red-600" />
            ) : (
              <Check className="size-4 text-green-600" />
            )}
            <span className={c.positivo ? 'text-red-600 font-medium' : 'text-green-600'}>
              {c.positivo ? 'Positivo' : 'Negativo'}
            </span>
          </div>
        )
      },
      enableHiding: true,
    },
    {
      id: 'acciones',
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEditar(row.original)}>
            <Pencil className="size-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => estudiosGestantesService.descargarConstanciaEstudioGestante(row.original.id)}
          >
            <FileText className="size-4" />
            <span className="sr-only">Descargar constancia</span>
          </Button>
          {user?.role === 'ADMIN' && (
            <Button variant="ghost" size="icon" onClick={() => onEliminar(row.original.id)}>
              <Trash2 className="size-4 text-destructive" />
              <span className="sr-only">Eliminar</span>
            </Button>
          )}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], [onEditar, onEliminar, user?.role])

  const table = useReactTable({
    data: data.items,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalPages = useMemo(
    () => Math.ceil(pagination.total / pagination.pageSize) || 1,
    [pagination.total, pagination.pageSize],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {dni && (
          <>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Filtrar por DNI de gestante..."
                value={dni.value}
                onChange={(e) => dni.onChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && dni.onSearch()}
                className="pl-8"
              />
              {dni.status === 'checking' && (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
              {dni.status === 'valid' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-lg leading-none">✓</span>
              )}
              {dni.status === 'invalid' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 text-lg leading-none">✗</span>
              )}
            </div>
            <Button onClick={dni.onSearch} variant="secondary">
              Buscar
            </Button>
            {dni.status === 'valid' && (
              <Button onClick={dni.onClear} variant="ghost" size="sm">
                Limpiar filtro
              </Button>
            )}
          </>
        )}
        <div className="w-40">
          <DatePicker
            value={filters.fechaDesde}
            onChange={(v) => { filters.onFechaDesdeChange(v); filters.onFilterChange() }}
            placeholder="Fecha desde"
          />
        </div>
        <div className="w-40">
          <DatePicker
            value={filters.fechaHasta}
            onChange={(v) => { filters.onFechaHastaChange(v); filters.onFilterChange() }}
            placeholder="Fecha hasta"
          />
        </div>
        <Select
          value={filters.estadoEstudio}
          onValueChange={(v) => { filters.onEstadoEstudioChange(v === ' ' ? '' : v); filters.onFilterChange() }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="FINALIZADO">Finalizado</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onNuevo}>
          <Plus className="size-4" />
          Nuevo estudio
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
                  {column.id === 'coombs' ? 'Coombs' : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {dni?.status === 'valid' && dni.gestanteInfo && (
        <p className="text-sm text-green-700 font-medium">
          Mostrando estudios de: {dni.gestanteInfo.nombre} {dni.gestanteInfo.apellido}
        </p>
      )}

      {dni?.error && (
        <p className="text-sm text-red-500">{dni.error}</p>
      )}

      <ErrorAlert message={data.error} />

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
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-8"
                >
                  No se encontraron estudios gestacionales.
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

      <PaginationBar
        page={pagination.page}
        totalPages={totalPages}
        total={pagination.total}
        onPageChange={pagination.onPageChange}
        pageSize={pagination.pageSize}
        onPageSizeChange={pagination.onPageSizeChange}
      />
    </div>
  )
}
