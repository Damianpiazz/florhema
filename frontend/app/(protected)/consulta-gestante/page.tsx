'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { consultaService, type ConsultaGestanteItem } from '@/features/consulta/consulta-service'
import { ConsultaTable } from '@/features/consulta/components/consulta-table'

export default function ConsultaGestantePage() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<ConsultaGestanteItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!search.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await consultaService.buscarGestantes(search.trim())
      setResults(data)
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.message ?? 'Error al buscar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Search className="size-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Consulta de Estudios</h1>
      </div>
      <p className="text-sm text-muted-foreground -mt-4">
        Busque una paciente gestante para consultar el estado de su grupo sanguíneo y estudios.
      </p>

      <ConsultaTable
        search={{
          value: search,
          onChange: setSearch,
          onSearch: handleSearch,
        }}
        data={{
          items: results ?? [],
          loading,
          error,
          searched,
        }}
      />
    </div>
  )
}
