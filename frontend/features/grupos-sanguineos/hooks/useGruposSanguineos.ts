'use client'

import { useState, useEffect } from 'react'
import { gruposSanguineosService } from '@/features/grupos-sanguineos/grupos-sanguineos-service'
import type { GrupoSanguineo } from '@/features/grupos-sanguineos/grupos-sanguineos.schema'

export function useGruposSanguineos() {
  const [grupos, setGrupos] = useState<GrupoSanguineo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    gruposSanguineosService.listar().then(setGrupos).catch(() => setGrupos([])).finally(() => setLoading(false))
  }, [])

  return { grupos, loading }
}
