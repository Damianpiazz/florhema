import { prisma } from '@/lib/prisma'

interface EstudioRaw {
  id: number
  fecha: Date
  compatibilidadConyugal: string | null
  estadoEstudio: string
  pruebaCoombsIndirecta: { positivo: boolean }
  gestante: {
    id: number
    personaId: number
    persona: {
      id: number
      dni: string
      nombre: string
      apellido: string
      grupoSanguineo: { tipo: string; factorRh: string } | null
    }
  }
}

export async function consultarEstudios(search?: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize

  const where: any = {
    deletedAt: null,
    gestante: {
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
  }

  const [total, estudios] = await Promise.all([
    prisma.estudioGestante.count({ where }),
    prisma.estudioGestante.findMany({
      where,
      include: {
        pruebaCoombsIndirecta: true,
        gestante: {
          include: {
            persona: {
              include: { grupoSanguineo: true },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' as const },
      skip,
      take: pageSize,
    }),
  ])

  return {
    items: (estudios as unknown as EstudioRaw[]).map((e) => ({
      id: e.id,
      gestanteId: e.gestante.id,
      fecha: e.fecha.toISOString(),
      compatibilidadConyugal: e.compatibilidadConyugal,
      estadoEstudio: e.estadoEstudio,
      coombsIndirecto: e.pruebaCoombsIndirecta.positivo,
      persona: {
        id: e.gestante.persona.id,
        dni: e.gestante.persona.dni,
        nombre: e.gestante.persona.nombre,
        apellido: e.gestante.persona.apellido,
        grupoSanguineo: e.gestante.persona.grupoSanguineo
          ? { tipo: e.gestante.persona.grupoSanguineo.tipo, factorRh: e.gestante.persona.grupoSanguineo.factorRh }
          : null,
      },
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
