'use client'

import { useQuery } from '@tanstack/react-query'
import { gestantesService } from '@/features/gestantes/gestantes-service'

export function useGestantesQuery(searchQuery: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: ['gestantes', searchQuery, page, pageSize],
    queryFn: () =>
      gestantesService.listar({
        dni: searchQuery || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
  })
}
