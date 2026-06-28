'use client'

import { useQuery } from '@tanstack/react-query'
import { recienNacidosService } from '@/features/recien-nacidos/recien-nacidos-service'

export function useRecienNacidosQuery(page: number, pageSize: number, gestanteId?: number) {
  return useQuery({
    queryKey: ['recien-nacidos', page, pageSize, gestanteId],
    queryFn: () =>
      recienNacidosService.listar({
        ...(gestanteId && { gestanteId }),
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
  })
}
