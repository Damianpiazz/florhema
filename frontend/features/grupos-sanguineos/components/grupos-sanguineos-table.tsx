'use client'

import { useMemo } from 'react'
import { Pencil, Trash2, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { ErrorAlert } from '@/components/ui/error-alert'
import type { GrupoSanguineo } from '@/features/grupos-sanguineos/grupos-sanguineos.schema'

interface GruposSanguineosTableProps {
  data: {
    items: GrupoSanguineo[]
    loading: boolean
    error: string | null
  }
  userRole?: string
  onNuevo: () => void
  onEditar: (grupo: GrupoSanguineo) => void
  onEliminar: (id: number) => void
}

export function GruposSanguineosTable({
  data,
  userRole,
  onNuevo,
  onEditar,
  onEliminar,
}: GruposSanguineosTableProps) {
  const isAdmin = userRole === 'ADMIN'

  const columns = useMemo(() => [
    { key: 'tipo', header: 'Tipo' },
    { key: 'factorRh', header: 'Factor Rh' },
  ], [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Button onClick={onNuevo}>
            <Plus className="size-4" />
            Nuevo grupo
          </Button>
        )}
      </div>

      <ErrorAlert message={data.error} />

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.header}</TableHead>
              ))}
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8">
                  <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center text-muted-foreground py-8"
                >
                  No hay grupos sanguíneos registrados.
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((grupo) => (
                <TableRow key={grupo.id}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.key === 'tipo' ? 'font-medium' : ''}>
                      {col.key === 'factorRh'
                        ? (grupo.factorRh === 'POSITIVO' ? 'Positivo' : 'Negativo')
                        : grupo[col.key as keyof typeof grupo]}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => onEditar(grupo)}>
                            <Pencil className="size-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onEliminar(grupo.id)}>
                            <Trash2 className="size-4 text-destructive" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}