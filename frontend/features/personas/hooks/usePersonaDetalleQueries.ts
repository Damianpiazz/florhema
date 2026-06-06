'use client'

import { useQuery } from '@tanstack/react-query'
import { personaDetalleService } from '@/features/personas/persona-detalle-service'

export function usePersonaDetalleQuery(id: number) {
  return useQuery({
    queryKey: ['persona', id],
    queryFn: () => personaDetalleService.obtenerDetalle(id),
    enabled: !!id,
  })
}

function createPaginatedQuery(resource: string, serviceMethod: (id: number, params: { limit: number; offset: number }) => Promise<any>) {
  return (id: number, page: number, pageSize: number) =>
    useQuery({
      queryKey: ['persona', id, resource, page, pageSize],
      queryFn: () => serviceMethod(id, { limit: pageSize, offset: (page - 1) * pageSize }),
      enabled: !!id,
    })
}

export const useDonacionesQuery = createPaginatedQuery('donaciones', personaDetalleService.listarDonaciones.bind(personaDetalleService))
export const useTransfusionesQuery = createPaginatedQuery('transfusiones', personaDetalleService.listarTransfusiones.bind(personaDetalleService))
export const useEstudiosQuery = createPaginatedQuery('estudios', personaDetalleService.listarEstudios.bind(personaDetalleService))
export const useRecienNacidosQuery = createPaginatedQuery('recien-nacidos', personaDetalleService.listarRecienNacidos.bind(personaDetalleService))
export const useActividadQuery = createPaginatedQuery('actividad', personaDetalleService.listarActividad.bind(personaDetalleService))
