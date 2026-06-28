'use client'

import { use, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Droplet, IdCard, MapPin, Phone, User, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorAlert } from '@/components/ui/error-alert'
import { FieldDetail } from '@/components/ui/field-detail'
import { formatGrupoSanguineo } from '@/utils/grupo-utils'
import { formatDni, formatPhone } from '@/utils/formatters'
import { formatDate, calcEdad } from '@/utils/date-utils'
import { PersonaRoleBadges } from '@/features/personas/components/persona-role-badges'
import { PersonaDetalleTabs } from '@/features/personas/components/persona-detalle-tabs'

import { usePersonaDetalleQuery } from '@/features/personas/hooks/usePersonaDetalleQueries'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { donantesService } from '@/features/donantes/donantes-service'

export default function PersonaDetallePage({
  params,
}: {
  params: Promise<{ personaId: string }>
}) {
  const { personaId } = use(params)
  const id = Number(personaId)
  const queryClient = useQueryClient()

  const { data: detalle, isLoading, error } = usePersonaDetalleQuery(id)

  const refetchPersona = () => {
    queryClient.invalidateQueries({ queryKey: ['persona', id] })
  }

  const calculatedRef = useRef(false)
  const { mutate: calcularSemaforo } = useMutation({
    mutationFn: (donanteId: number) => donantesService.calcularSemaforo(donanteId),
    onSuccess: () => {
      calculatedRef.current = true
      refetchPersona()
    },
  })

  useEffect(() => {
    if (detalle?.donante && !calculatedRef.current) {
      calcularSemaforo(detalle.donante.id)
    }
  }, [detalle?.donante, calcularSemaforo])

  if (isLoading) {
    return (
      <div className="p-6">
        <Loader2 className="size-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    )
  }

  if (error || !detalle) {
    return (
      <div className="p-6">
        <ErrorAlert message={error?.message ?? 'No se pudo cargar la persona.'} />
        <Link href="/personas" className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Volver a personas
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/personas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a personas
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {detalle.nombre} {detalle.apellido}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Información completa e historial clínico.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PersonaRoleBadges
            donante={detalle.donante}
            paciente={detalle.paciente}
            gestante={detalle.gestante}
          />
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos personales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FieldDetail icon={User} label="Nombre completo" value={`${detalle.nombre} ${detalle.apellido}`} />
          <FieldDetail icon={IdCard} label="DNI" value={formatDni(detalle.dni)} />
          <FieldDetail
            icon={Calendar}
            label="Fecha de nacimiento"
            value={`${formatDate(detalle.fechaNacimiento)} (${calcEdad(detalle.fechaNacimiento)} años)`}
          />
          <FieldDetail icon={Phone} label="Teléfono" value={formatPhone(detalle.telefono)} />
          <FieldDetail icon={MapPin} label="Dirección" value={detalle.direccion} />
          <FieldDetail
            icon={Droplet}
            label="Grupo sanguíneo"
            value={formatGrupoSanguineo(detalle.grupoSanguineo.tipo, detalle.grupoSanguineo.factorRh)}
          />
        </CardContent>
      </Card>

      <PersonaDetalleTabs personaId={id} detalle={detalle} />
    </div>
  )
}
