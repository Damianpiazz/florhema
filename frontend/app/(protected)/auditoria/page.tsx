'use client'

import { useState } from 'react'
import { AuditoriaTable } from '@/features/auditoria/components/auditoria-table'
import { AuditoriaDetalle } from '@/features/auditoria/components/auditoria-detalle'
import { useAuditoria } from '@/features/auditoria/hooks/useAuditoria'
import type { AuditoriaEntry } from '@/features/auditoria/auditoria.schema'

export default function AuditoriaPage() {
  const {
    items,
    total,
    page,
    pageSize,
    loading,
    error,
    entity,
    setEntity,
    action,
    setAction,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    setPage,
    setPageSize,
    aplicarFiltros,
  } = useAuditoria()

  const [detalleOpen, setDetalleOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<AuditoriaEntry | null>(
    null,
  )

  const handleVerDetalle = (entry: AuditoriaEntry) => {
    setSelectedEntry(entry)
    setDetalleOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <AuditoriaTable
        filters={{
          entity,
          setEntity,
          action,
          setAction,
          fechaDesde,
          setFechaDesde,
          fechaHasta,
          setFechaHasta,
          onAplicar: aplicarFiltros,
        }}
        pagination={{
          page,
          totalPages: Math.ceil(total / pageSize),
          total,
          onPageChange: setPage,
          pageSize,
          onPageSizeChange: setPageSize,
        }}
        data={{ items, loading, error }}
        onVerDetalle={handleVerDetalle}
      />

      <AuditoriaDetalle
        open={detalleOpen}
        onOpenChange={setDetalleOpen}
        entry={selectedEntry}
      />
    </div>
  )
}
