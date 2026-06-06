'use client'

import { Badge } from '@/components/ui/badge'

const semaforoDot: Record<string, string> = {
  VERDE: 'bg-emerald-500',
  AMARILLO: 'bg-amber-500',
  ROJO: 'bg-red-500',
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
        </Badge>
      )}
      {paciente && <Badge variant="outline">Paciente</Badge>}
      {gestante && <Badge variant="outline">Gestante</Badge>}
    </>
  )
}
