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
import { PaginationBar } from '@/components/data-table/pagination-bar'
import type { Usuario } from '@/features/usuarios/usuarios.schema'

const roleVariants: Record<string, string> = {
  ADMIN:
    'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  USER:
    'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-400',
  INVITADO:
    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Admin',
  USER: 'Usuario',
  INVITADO: 'Invitado',
}

interface UsuariosTableProps {
  search: {
    value: string
    onChange: (v: string) => void
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
    items: Usuario[]
    loading: boolean
    error: string | null
  }
  onCrear: () => void
  onEditar: (user: Usuario) => void
  onEliminar: (user: Usuario) => void
}

export function UsuariosTable({
  search,
  pagination,
  data,
  onCrear,
  onEditar,
  onEliminar,
}: UsuariosTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const columns: ColumnDef<Usuario>[] = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID' },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span className="font-medium">{row.original.email}</span>,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: 'Nombre',
        cell: ({ row }) => row.original.name ?? '—',
      },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) => (
          <Badge variant="outline" className={roleVariants[row.original.role] ?? ''}>
            {roleLabels[row.original.role]}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Creado',
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
      },
      {
        id: 'acciones',
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditar(row.original)}
              title="Editar"
            >
              <Pencil className="size-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEliminar(row.original)}
              title="Eliminar"
            >
              <Trash2 className="size-4 text-red-500" />
              <span className="sr-only">Eliminar</span>
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [onEditar, onEliminar],
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
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email o nombre..."
            className="pl-8"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
          />
        </div>
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
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                >
                  {col.id === 'name'
                    ? 'Nombre'
                    : col.id === 'role'
                      ? 'Rol'
                      : col.id === 'createdAt'
                        ? 'Creado'
                        : col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onCrear} className="ml-auto">
          <Plus className="size-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Error */}
      <ErrorAlert message={data.error} />

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8"
                >
                  <Loader2 className="size-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-muted-foreground"
                >
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
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
