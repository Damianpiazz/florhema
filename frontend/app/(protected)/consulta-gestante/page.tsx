'use client'

import { useState } from 'react'
import { Search, Loader2, User, Droplet, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { consultaService, type ConsultaGestanteItem } from '@/features/consulta/consulta-service'

function GrupoBadge({ grupo }: { grupo: { tipo: string; factorRh: string } | null }) {
  if (!grupo) {
    return (
      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
        <Clock className="size-3 mr-1" />
        Pendiente
      </Badge>
    )
  }
  const factor = grupo.factorRh === 'POSITIVO' ? '+' : '-'
  return (
    <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 text-sm px-3 py-1">
      <Droplet className="size-3 mr-1" />
      {grupo.tipo}{factor}
    </Badge>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  if (estado === 'FINALIZADO') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
        <CheckCircle2 className="size-3 mr-1" />
        Finalizado
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-amber-600 bg-amber-50 border-amber-200">
      <Clock className="size-3 mr-1" />
      {estado === 'EN_PROCESO' ? 'En proceso' : 'Pendiente'}
    </Badge>
  )
}

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

      {/* Search bar */}
      <div className="flex items-center gap-3 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por DNI, nombre o apellido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-8"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading || !search.trim()}>
          {loading && <Loader2 className="size-4 animate-spin mr-2" />}
          Buscar
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive max-w-xl">
          {error}
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="space-y-3 max-w-xl">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && searched && results?.length === 0 && (
        <Card className="max-w-xl">
          <CardContent className="p-6 text-center text-muted-foreground">
            <AlertCircle className="size-8 mx-auto mb-2 opacity-50" />
            No se encontraron gestantes con ese criterio de búsqueda.
          </CardContent>
        </Card>
      )}

      {!loading && results && results.length > 0 && (
        <div className="space-y-3 max-w-xl">
          <p className="text-sm text-muted-foreground">
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </p>
          {results.map((gestante) => (
            <Card key={gestante.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <span className="font-medium">
                        {gestante.persona.apellido}, {gestante.persona.nombre}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      DNI: {gestante.persona.dni}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <GrupoBadge grupo={gestante.persona.grupoSanguineo} />
                    {gestante.ultimoEstudio && (
                      <EstadoBadge estado={gestante.ultimoEstudio.estadoEstudio} />
                    )}
                    {!gestante.ultimoEstudio && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Sin estudios
                      </Badge>
                    )}
                  </div>
                </div>
                {gestante.totalEstudios > 0 && (
                  <p className="text-xs text-muted-foreground mt-2 ml-6">
                    {gestante.totalEstudios} estudio{gestante.totalEstudios !== 1 ? 's' : ''} realizado{gestante.totalEstudios !== 1 ? 's' : ''}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
