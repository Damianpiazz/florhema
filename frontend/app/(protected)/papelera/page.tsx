'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, RotateCcw, Loader2, AlertCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PaginationBar } from '@/components/data-table/pagination-bar'
import { api } from '@/lib/axios'
import { useAuth } from '@/features/auth/auth-context'

interface TrashItem {
  id: number
  entityType: string
  displayName: string
  deletedAt: string | null
}

interface PaginatedResponse {
  items: TrashItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const entityLabels: Record<string, string> = {
  persona: 'Persona',
  donante: 'Donante',
  paciente: 'Paciente',
  gestante: 'Gestante',
  donacion: 'Donación',
  transfusion: 'Transfusión',
  user: 'Usuario',
}

const entityColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  persona: 'default',
  donante: 'secondary',
  paciente: 'outline',
  gestante: 'secondary',
  donacion: 'default',
  transfusion: 'outline',
  user: 'destructive',
}

export default function AdminPapeleraPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<TrashItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Filters
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [filterVersion, setFilterVersion] = useState(0)

  const triggerFilter = useCallback(() => {
    setSearchQuery(searchInput)
    setPage(1)
    setFilterVersion((v) => v + 1)
  }, [searchInput])

  const handleFilterChange = useCallback(() => {
    setPage(1)
    setFilterVersion((v) => v + 1)
  }, [])

  const handleFechaDesdeChange = useCallback((v: string) => {
    setFechaDesde(v)
    handleFilterChange()
  }, [handleFilterChange])

  const handleFechaHastaChange = useCallback((v: string) => {
    setFechaHasta(v)
    handleFilterChange()
  }, [handleFilterChange])

  const fetchItems = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string | number> = { page: p, pageSize }
      if (searchQuery) params.search = searchQuery
      if (entityTypeFilter) params.entityType = entityTypeFilter
      if (fechaDesde) params.fechaDesde = fechaDesde
      if (fechaHasta) params.fechaHasta = fechaHasta
      const res = await api.get<PaginatedResponse>('/admin/trash', { params })
      setItems(res.data.items)
      setTotal(res.data.total)
      setPage(res.data.page)
      setTotalPages(res.data.totalPages)
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.message ?? 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, entityTypeFilter, fechaDesde, fechaHasta, pageSize])

  useEffect(() => {
    fetchItems(page)
  }, [page, filterVersion, fetchItems])

  const handlePageChange = useCallback((newPage: number) => {
    fetchItems(newPage)
  }, [fetchItems])

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
    setPage(1)
    setFilterVersion((v) => v + 1)
  }, [])

  const handleRestore = async (entityType: string, id: number) => {
    setRestoring(id)
    setError(null)
    setSuccessMsg(null)
    try {
      await api.post(`/admin/trash/${entityType}/${id}/restore`)
      await fetchItems(page)
      setSuccessMsg('Elemento restaurado correctamente')
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.message ?? 'Error al restaurar')
    } finally {
      setRestoring(null)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Only ADMIN can see this page
  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertCircle className="size-12 text-destructive" />
        <h2 className="text-xl font-semibold">Acceso denegado</h2>
        <p className="text-muted-foreground">Solo los administradores pueden acceder a esta sección.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Filters bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && triggerFilter()}
            className="pl-8"
          />
        </div>
        <Select value={entityTypeFilter} onValueChange={(v) => { setEntityTypeFilter(v); handleFilterChange() }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los tipos</SelectItem>
            <SelectItem value="persona">Persona</SelectItem>
            <SelectItem value="donante">Donante</SelectItem>
            <SelectItem value="paciente">Paciente</SelectItem>
            <SelectItem value="gestante">Gestante</SelectItem>
            <SelectItem value="donacion">Donación</SelectItem>
            <SelectItem value="transfusion">Transfusión</SelectItem>
            <SelectItem value="user">Usuario</SelectItem>
          </SelectContent>
        </Select>
        <div className="w-40">
          <DatePicker value={fechaDesde} onChange={handleFechaDesdeChange} placeholder="Fecha desde" />
        </div>
        <div className="w-40">
          <DatePicker value={fechaHasta} onChange={handleFechaHastaChange} placeholder="Fecha hasta" />
        </div>
        <Button onClick={triggerFilter} variant="secondary">
          Buscar
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin mr-2" />
          Cargando...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
          <Trash2 className="size-12 text-muted-foreground/50" />
          <p className="text-lg font-medium">No hay elementos eliminados</p>
          <p className="text-sm">
            Cuando elimines un registro (Persona, Donante, etc.) aparecerá aquí
            para que puedas restaurarlo.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                <TableRow>
                  <TableHead className="w-[110px]">Tipo</TableHead>
                  <TableHead>Nombre / Identificación</TableHead>
                  <TableHead className="w-[160px]">Eliminado</TableHead>
                  <TableHead className="w-[110px]">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={`${item.entityType}-${item.id}`}>
                    <TableCell>
                      <Badge variant={entityColors[item.entityType] ?? 'outline'}>
                        {entityLabels[item.entityType] ?? item.entityType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.displayName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(item.deletedAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(item.entityType, item.id)}
                        disabled={restoring === item.id}
                      >
                        {restoring === item.id ? (
                          <Loader2 className="size-3 animate-spin mr-1" />
                        ) : (
                          <RotateCcw className="size-3 mr-1" />
                        )}
                        Restaurar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  )
}
