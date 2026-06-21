'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Eye,
  Pencil,
  Loader2,
  ChevronDown,
  Columns3,
  Check,
  X,
  Plus,
} from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
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
import type { Donacion } from '@/features/donaciones/donaciones.schema'

interface DonacionesTableProps {
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
    items: Donacion[]
    loading: boolean
    error: string | null
  }
  filters: {
    tipoDonacion: string
    onTipoDonacionChange: (v: string) => void
    fechaDesde: string
    onFechaDesdeChange: (v: string) => void
    fechaHasta: string
    onFechaHastaChange: (v: string) => void
    onFilterChange: () => void
  }
  onNueva: () => void
  onEditar: (donacion: Donacion) => void
}

export function DonacionesTable({
  search,
  pagination,
  data,
  filters,
  onNueva,
  onEditar,
}: DonacionesTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const serologiaIndicators = (row: Donacion) => {
    const s = row.resultadoSerologia
    if (!s) return null
    return (
      <div className="flex gap-2 text-xs">
        {[
          { key: 'hiv', label: 'HIV' },
          { key: 'hcv', label: 'HCV' },
          { key: 'hbv', label: 'HBV' },
          { key: 'chagas', label: 'Chagas' },
          { key: 'sifilis', label: 'Sífilis' },
        ].map(({ key, label }) => (
          <span
            key={key}
            className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 ${
              s[key as keyof typeof s]
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}
          >
            {s[key as keyof typeof s] ? (
              <X className="size-3" />
            ) : (
              <Check className="size-3" />
            )}
            {label}
          </span>
        ))}
      </div>
    )
  }

  const columns: ColumnDef<Donacion>[] = useMemo(() => [
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
      id: 'donante',
      header: 'Donante',
      accessorFn: (row) => `${row.donante.apellido}, ${row.donante.nombre}`,
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.donante.apellido}, {row.original.donante.nombre}
        </span>
      ),
    },
    {
      accessorKey: 'donante.dni',
      id: 'dni',
      header: 'DNI',
      accessorFn: (row) => row.donante.dni,
      cell: ({ getValue }) => (
        <span className="font-bold">{formatDni(getValue<string>())}</span>
      ),
    },
    {
      accessorKey: 'tipoDonacion',
      header: 'Tipo',
    },
    {
      accessorKey: 'peso',
      header: 'Peso',
      cell: ({ getValue }) => <span>{getValue<number>()} kg</span>,
    },
    {
      accessorKey: 'hemoglobina',
      header: 'Hb',
      cell: ({ getValue }) => <span>{getValue<number>().toFixed(1)} g/dL</span>,
    },
    {
      accessorKey: 'tensionArterial',
      header: 'TA',
    },
    {
      id: 'serologia',
      header: 'Serología',
      cell: ({ row }) => serologiaIndicators(row.original),
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
          <Link href={`/personas/${row.original.donante.personaId}`}>
            <Button variant="ghost" size="icon">
              <Eye className="size-4" />
              <span className="sr-only">Ver detalle</span>
            </Button>
          </Link>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], [onEditar])

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
            placeholder="Buscar por donante..."
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search.onSearch()}
            className="pl-8"
          />
        </div>
        <Input
          type="date"
          value={filters.fechaDesde}
          onChange={(e) => filters.onFechaDesdeChange(e.target.value)}
          className="w-40"
          placeholder="Fecha desde"
        />
        <Input
          type="date"
          value={filters.fechaHasta}
          onChange={(e) => filters.onFechaHastaChange(e.target.value)}
          className="w-40"
          placeholder="Fecha hasta"
        />
        <Select
          value={filters.tipoDonacion}
          onValueChange={filters.onTipoDonacionChange}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">Todos</SelectItem>
            <SelectItem value="VOLUNTARIA">Voluntaria</SelectItem>
            <SelectItem value="REPOSICION">Reposición</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={search.onSearch} variant="secondary">
          Buscar
        </Button>
        <Button onClick={onNueva}>
          <Plus className="size-4" />
          Nueva donación
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
                  {column.id === 'serologia' ? 'Serología' : column.id}
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
                  No se encontraron donaciones.
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
