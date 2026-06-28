'use client'

import { useQuery } from '@tanstack/react-query'
import { pacientesService } from '@/features/pacientes/pacientes-service'

export function usePacientesQuery(searchQuery: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: ['pacientes', searchQuery, page, pageSize],
    queryFn: () =>
      pacientesService.listar({
        dni: searchQuery || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
  })
}
