'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import type { AuditoriaEntry } from '../auditoria.schema'

const actionLabels: Record<string, string> = {
  CREATE: 'Creación',
  UPDATE: 'Modificación',
  DELETE: 'Eliminación',
}

const actionVariants: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
}

interface AuditoriaDetalleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: AuditoriaEntry | null
}

export function AuditoriaDetalle({
  open,
  onOpenChange,
  entry,
}: AuditoriaDetalleProps) {
  if (!entry) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="min-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalle de Auditoría</SheetTitle>
          <SheetDescription>
            Información completa del registro de auditoría
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Fecha:</span>
              <p className="font-medium">
                {new Date(entry.createdAt).toLocaleString('es-AR')}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Acción:</span>
              <p>
                <Badge className={actionVariants[entry.action]}>
                  {actionLabels[entry.action]}
                </Badge>
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Entidad:</span>
              <p className="font-medium">{entry.entity}</p>
            </div>
            <div>
              <span className="text-muted-foreground">ID del registro:</span>
              <p className="font-medium font-mono">{entry.entityId}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Usuario:</span>
              <p className="font-medium">
                {entry.usuario.name || entry.usuario.email}
                {entry.usuario.name && (
                  <span className="text-muted-foreground ml-1">
                    ({entry.usuario.email})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Old Values */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Valores anteriores
            </h4>
            {entry.oldValues ? (
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto max-h-64 overflow-y-auto">
                {JSON.stringify(entry.oldValues, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Sin datos
              </p>
            )}
          </div>

          {/* New Values */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Valores nuevos
            </h4>
            {entry.newValues ? (
              <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto max-h-64 overflow-y-auto">
                {JSON.stringify(entry.newValues, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Sin datos
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
