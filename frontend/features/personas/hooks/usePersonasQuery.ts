'use client'

import { useQuery } from '@tanstack/react-query'
import { personasService } from '@/features/personas/personas-service'

export function usePersonasQuery(searchQuery: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: ['personas', searchQuery, page, pageSize],
    queryFn: () =>
      personasService.listar({
        dni: searchQuery || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
  })
}
