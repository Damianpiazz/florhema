'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  Columns3,
  Check,
  X,
  Plus,
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
import { formatDni } from '@/utils/formatters'
import { PaginationBar } from '@/components/data-table/pagination-bar'
import type { Transfusion } from '@/features/transfusiones/transfusiones.schema'

interface TransfusionesTableProps {
  search: {
    value: string
    onChange: (v: string) => void
    onSearch: () => void
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
    items: Transfusion[]
    loading: boolean
    error: string | null
  }
  filters: {
    componente: string
    onComponenteChange: (v: string) => void
    fechaDesde: string
    onFechaDesdeChange: (v: string) => void
    fechaHasta: string
    onFechaHastaChange: (v: string) => void
    onFilterChange: () => void
  }
  onNueva: () => void
  onEditar: (transfusion: Transfusion) => void
  onEliminar: (id: number) => void
}

export function TransfusionesTable({
  search,
  pagination,
  data,
  filters,
  onNueva,
  onEditar,
  onEliminar,
}: TransfusionesTableProps) {
  const { user } = useAuth()
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const compatibilidadCell = (row: Transfusion) => {
    const c = row.compatibilidad
    if (!c) return <span className="text-muted-foreground">—</span>
    return (
      <div className="flex items-center gap-1">
        {c.compatible ? (
          <Check className="size-4 text-green-600" />
        ) : (
          <X className="size-4 text-red-600" />
        )}
        <span className="text-xs text-muted-foreground">
          {c.donanteGrupo.tipo}{c.donanteGrupo.factorRh === 'POSITIVO' ? '+' : '-'} → {c.receptorGrupo.tipo}{c.receptorGrupo.factorRh === 'POSITIVO' ? '+' : '-'}
        </span>
      </div>
    )
  }

  const coombsCell = (row: Transfusion) => {
    const r = row.resultadoCoombs
    if (!r) return <span className="text-muted-foreground">—</span>
    return (
      <span className={r.positivo ? 'text-red-600 font-medium' : 'text-green-600'}>
        {r.tipo} {r.positivo ? '+' : '-'}
      </span>
    )
  }

  const columns: ColumnDef<Transfusion>[] = useMemo(() => [
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
      id: 'paciente',
      header: 'Paciente',
      accessorFn: (row) => `${row.paciente.apellido}, ${row.paciente.nombre}`,
      cell: ({ row }) => (
        <Link href={`/personas/${row.original.paciente.personaId}`} className="font-medium hover:underline">
          {row.original.paciente.apellido}, {row.original.paciente.nombre}
        </Link>
      ),
    },
    {
      accessorKey: 'paciente.dni',
      id: 'dni',
      header: 'DNI',
      accessorFn: (row) => row.paciente.dni,
      cell: ({ getValue }) => (
        <span className="font-bold">{formatDni(getValue<string>())}</span>
      ),
    },
    {
      accessorKey: 'componente',
      header: 'Componente',
      cell: ({ getValue }) => {
        const v = getValue<string>()
        const labels: Record<string, string> = {
          GLOBULOS_ROJOS: 'G. Rojos',
          PLASMA: 'Plasma',
          PLAQUETAS: 'Plaquetas',
          CRIOPRECIPITADO: 'Criop.',
        }
        return <span>{labels[v] ?? v}</span>
      },
    },
    {
      accessorKey: 'cantidadUnidades',
      header: 'Unid.',
      cell: ({ getValue }) => <span>{getValue<number>()} U</span>,
    },
    {
      id: 'compatibilidad',
      header: 'Compatibilidad',
      cell: ({ row }) => compatibilidadCell(row.original),
      enableHiding: true,
    },
    {
      id: 'coombs',
      header: 'Coombs',
      cell: ({ row }) => coombsCell(row.original),
      enableHiding: true,
    },
    {
      accessorKey: 'reaccionAdversa',
      header: 'Reacción',
      cell: ({ getValue }) => {
        const v = getValue<string | null>()
        return v ? <span className="text-red-600 text-sm">{v}</span> : <span className="text-muted-foreground">—</span>
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
          <Link href={`/personas/${row.original.paciente.personaId}`}>
            <Button variant="ghost" size="icon">
              <Eye className="size-4" />
              <span className="sr-only">Ver detalle</span>
            </Button>
          </Link>
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
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search.onSearch()}
            className="pl-8"
          />
        </div>
        <div className="w-40">
          <DatePicker
            value={filters.fechaDesde}
            onChange={filters.onFechaDesdeChange}
            placeholder="Fecha desde"
          />
        </div>
        <div className="w-40">
          <DatePicker
            value={filters.fechaHasta}
            onChange={filters.onFechaHastaChange}
            placeholder="Fecha hasta"
          />
        </div>
        <Select
          value={filters.componente}
          onValueChange={filters.onComponenteChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Componente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            <SelectItem value="GLOBULOS_ROJOS">G. Rojos</SelectItem>
            <SelectItem value="PLASMA">Plasma</SelectItem>
            <SelectItem value="PLAQUETAS">Plaquetas</SelectItem>
            <SelectItem value="CRIOPRECIPITADO">Criop.</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={search.onSearch} variant="secondary">
          Buscar
        </Button>
        <Button onClick={onNueva}>
          <Plus className="size-4" />
          Nueva transfusión
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
                  {column.id === 'compatibilidad' ? 'Compatibilidad' : column.id === 'coombs' ? 'Coombs' : column.id === 'reaccionAdversa' ? 'Reacción' : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
                  No se encontraron transfusiones.
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
