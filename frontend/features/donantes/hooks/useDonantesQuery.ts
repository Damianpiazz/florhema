'use client'

import { useQuery } from '@tanstack/react-query'
import { donantesService } from '@/features/donantes/donantes-service'

export function useDonantesQuery(searchQuery: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: ['donantes', searchQuery, page, pageSize],
    queryFn: () =>
      donantesService.listar({
        dni: searchQuery || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
  })
}
