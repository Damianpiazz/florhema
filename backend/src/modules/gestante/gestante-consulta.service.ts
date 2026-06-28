import { prisma } from '@/lib/prisma'

interface GestanteRaw {
  id: number
  personaId: number
  persona: {
    id: number
    dni: string
    nombre: string
    apellido: string
    grupoSanguineo: { tipo: string; factorRh: string } | null
  }
  estudios: Array<{
    id: number
    fecha: Date
    estadoEstudio: string
    pruebaCoombsIndirecta: { positivo: boolean }
  }>
  _count: { estudios: number }
}

export async function consultarGestantes(search?: string) {
  const gestantes = (await prisma.gestante.findMany({
    where: {
      deletedAt: null,
      persona: {
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { dni: { contains: search } },
                { nombre: { contains: search, mode: 'insensitive' as const } },
                { apellido: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
    },
    include: {
      persona: {
        include: {
          grupoSanguineo: true,
        },
      },
      estudios: {
        where: { deletedAt: null },
        orderBy: { fecha: 'desc' as const },
        take: 1,
        include: { pruebaCoombsIndirecta: true },
      },
      _count: { select: { estudios: true } },
    },
    orderBy: [{ persona: { apellido: 'asc' as const } }, { persona: { nombre: 'asc' as const } }],
    take: 20,
  })) as unknown as GestanteRaw[]

  return gestantes.map((g) => ({
    id: g.id,
    personaId: g.personaId,
    persona: {
      id: g.persona.id,
      dni: g.persona.dni,
      nombre: g.persona.nombre,
      apellido: g.persona.apellido,
      grupoSanguineo: g.persona.grupoSanguineo
        ? {
            tipo: g.persona.grupoSanguineo.tipo,
            factorRh: g.persona.grupoSanguineo.factorRh,
          }
        : null,
    },
    ultimoEstudio: g.estudios[0]
      ? {
          id: g.estudios[0].id,
          fecha: g.estudios[0].fecha.toISOString(),
          estadoEstudio: g.estudios[0].estadoEstudio,
          coombsIndirecto: g.estudios[0].pruebaCoombsIndirecta.positivo,
        }
      : null,
    totalEstudios: g._count.estudios,
  }))
}
