'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Eye,
  Loader2,
  ChevronDown,
  Columns3,
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { ErrorAlert } from '@/components/ui/error-alert'
import { formatDni } from '@/utils/formatters'
import { PaginationBar } from '@/components/data-table/pagination-bar'
import type { Donante } from '@/features/donantes/donantes.schema'

const semaforoVariants: Record<string, string> = {
  VERDE: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400',
  AMARILLO: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  ROJO: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400',
}

interface DonantesTableProps {
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
    items: Donante[]
    loading: boolean
    error: string | null
  }
}

export function DonantesTable({
  search,
  pagination,
  data,
}: DonantesTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const columns: ColumnDef<Donante>[] = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    {
      accessorKey: 'persona.dni',
      id: 'dni',
      header: 'DNI',
      accessorFn: (row) => row.persona.dni,
      cell: ({ getValue }) => (
        <span className="font-bold">{formatDni(getValue<string>())}</span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'persona.nombre',
      id: 'nombre',
      header: 'Nombre',
      accessorFn: (row) => row.persona.nombre,
    },
    {
      accessorKey: 'persona.apellido',
      id: 'apellido',
      header: 'Apellido',
      accessorFn: (row) => row.persona.apellido,
    },
    {
      accessorKey: 'semaforoAptitud',
      header: 'Semáforo',
      cell: ({ getValue }) => {
        const value = getValue<string>()
        return (
          <Badge
            variant="outline"
            className={semaforoVariants[value] ?? ''}
          >
            {value}
          </Badge>
        )
      },
    },
    {
      id: 'acciones',
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Link href={`/personas/${row.original.personaId}`}>
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
  ], [])

  const table = useReactTable({
    data: data.items,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por DNI..."
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search.onSearch()}
            className="pl-8"
          />
        </div>
        <Button onClick={search.onSearch} variant="secondary">
          Buscar
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
                  {column.id === 'semaforoAptitud' ? 'Semáforo' : column.id}
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
                  No se encontraron donantes.
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
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={pagination.onPageChange}
        pageSize={pagination.pageSize}
        onPageSizeChange={pagination.onPageSizeChange}
      />
    </div>
  )
}
