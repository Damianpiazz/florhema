'use client'

import { useIsMobile } from '@/hooks/use-mobile'
import { usePaginatedQuery } from '@/hooks/use-pagination'
import { DataTable } from '@/components/data-table/data-table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  useDonacionesQuery,
  useTransfusionesQuery,
  useEstudiosQuery,
  useRecienNacidosQuery,
  useActividadQuery,
} from '@/features/personas/hooks/usePersonaDetalleQueries'
import { donacionColumns, transfusionColumns, estudioColumns, recienNacidoColumns, actividadColumns } from './columns'
import type { PersonaDetalle } from '@/features/personas/persona-detalle.schema'

function TabContainer({ personaId, useQuery, columns, pageSize: ps, searchPlaceholder, emptyMessage }: {
  personaId: number
  useQuery: any
  columns: any[]
  pageSize?: number
  searchPlaceholder?: string
  emptyMessage?: string
}) {
  const { items, total, totalPages, page, setPage, pageSize, setPageSize, resetPage, isLoading, error } =
    usePaginatedQuery(useQuery, personaId, ps ?? 5)

  return (
    <DataTable
      columns={columns}
      data={items}
      loading={isLoading}
      error={error?.message ?? null}
      page={page}
      totalPages={totalPages}
      total={total}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={(s) => { setPageSize(s); resetPage() }}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
    />
  )
}

export function PersonaDetalleTabs({ personaId, detalle }: {
  personaId: number
  detalle: PersonaDetalle
}) {
  const isMobile = useIsMobile()
  const esGestante = !!detalle.gestante
  const esDonante = !!detalle.donante
  const esPaciente = !!detalle.paciente

  return (
    <Tabs defaultValue="actividad" orientation={isMobile ? 'vertical' : undefined} className="w-full flex-col justify-start gap-6">
      <TabsList className={isMobile ? '' : 'flex-wrap'}>
        <TabsTrigger value="actividad">Actividad</TabsTrigger>
        {esDonante && <TabsTrigger value="donaciones">Donaciones</TabsTrigger>}
        {esPaciente && <TabsTrigger value="transfusiones">Transfusiones</TabsTrigger>}
        {esGestante && <TabsTrigger value="estudios">Estudios Gestante</TabsTrigger>}
        {esGestante && <TabsTrigger value="recien-nacidos">Recién Nacidos</TabsTrigger>}
      </TabsList>

      <TabsContent value="actividad">
        <TabContainer personaId={personaId} useQuery={useActividadQuery} columns={actividadColumns} pageSize={10} searchPlaceholder="Filtrar actividad..." emptyMessage="Sin actividad registrada." />
      </TabsContent>
      {esDonante && (
        <TabsContent value="donaciones">
          <TabContainer personaId={personaId} useQuery={useDonacionesQuery} columns={donacionColumns} searchPlaceholder="Filtrar donaciones..." emptyMessage="No tiene donaciones registradas." />
        </TabsContent>
      )}
      {esPaciente && (
        <TabsContent value="transfusiones">
          <TabContainer personaId={personaId} useQuery={useTransfusionesQuery} columns={transfusionColumns} searchPlaceholder="Filtrar transfusiones..." emptyMessage="No tiene transfusiones registradas." />
        </TabsContent>
      )}
      {esGestante && (
        <TabsContent value="estudios">
          <TabContainer personaId={personaId} useQuery={useEstudiosQuery} columns={estudioColumns} searchPlaceholder="Filtrar estudios..." emptyMessage="No tiene estudios gestacionales registrados." />
        </TabsContent>
      )}
      {esGestante && (
        <TabsContent value="recien-nacidos">
          <TabContainer personaId={personaId} useQuery={useRecienNacidosQuery} columns={recienNacidoColumns} emptyMessage="No tiene recién nacidos registrados." />
        </TabsContent>
      )}
    </Tabs>
  )
}
