'use client'

import { useState, useEffect, useCallback } from 'react'
import { usuariosService } from '../usuarios-service'
import type { Usuario } from '../usuarios.schema'

export function useUsuarios() {
  const [items, setItems] = useState<Usuario[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await usuariosService.listar({ page, pageSize, search: search || undefined })
      setItems(result.items)
      setTotal(result.total)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error del servidor. Intente nuevamente.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    fetch()
  }, [fetch])

  const onSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const refresh = useCallback(() => {
    fetch()
  }, [fetch])

  return {
    items,
    total,
    page,
    pageSize,
    search,
    loading,
    error,
    setPage,
    setPageSize,
    onSearch,
    refresh,
  }
}
