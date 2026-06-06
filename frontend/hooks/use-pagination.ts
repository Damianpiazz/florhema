'use client'

import { useState, useMemo } from 'react'

export function usePagination(defaultPageSize = 5) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const resetPage = () => setPage(1)

  return { page, setPage, pageSize, setPageSize, resetPage }
}

export function usePaginatedQuery<T>(
  queryFn: (id: number, page: number, pageSize: number) => {
    data?: { items?: T[]; total?: number }
    isLoading: boolean
    error: unknown
  },
  personaId: number,
  defaultPageSize = 5,
) {
  const { page, setPage, pageSize, setPageSize, resetPage } = usePagination(defaultPageSize)
  const { data, isLoading, error } = queryFn(personaId, page, pageSize)
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize])

  return { items, total, totalPages, page, setPage, pageSize, setPageSize, resetPage, isLoading, error }
}
