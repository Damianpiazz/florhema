'use client'

import { Badge } from '@/components/ui/badge'

const semaforoDot: Record<string, string> = {
  VERDE: 'bg-emerald-500',
  AMARILLO: 'bg-amber-500',
  ROJO: 'bg-red-500',
}

const semaforoLabel: Record<string, string> = {
  VERDE: 'Apto',
  AMARILLO: 'Dudas a rever',
  ROJO: 'Excluido',
}

interface BadgesProps {
  donante: { semaforoAptitud: string } | null
  paciente: unknown
  gestante: unknown
}

export function PersonaRoleBadges({ donante, paciente, gestante }: BadgesProps) {
  return (
    <>
      {donante && (
        <Badge variant="outline" className="flex items-center gap-1.5">
          <span className={`inline-block size-2 rounded-full ${semaforoDot[donante.semaforoAptitud] ?? ''}`} />
          Donante
          <span className="text-muted-foreground">·</span>
          <span className="text-xs font-normal">{semaforoLabel[donante.semaforoAptitud] ?? donante.semaforoAptitud}</span>
        </Badge>
      )}
      {paciente && <Badge variant="outline">Paciente</Badge>}
      {gestante && <Badge variant="outline">Gestante</Badge>}
    </>
  )
}
