import { prisma } from '@/lib/prisma'

interface TrashEntity {
  id: number
  entityType: string
  displayName: string
  deletedAt: Date | null
}

export interface PaginatedTrash {
  items: TrashEntity[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

function buildDisplayName(entityType: string, raw: any): string {
  switch (entityType) {
    case 'persona':
      return `${raw.nombre} ${raw.apellido}`.trim()
    case 'donante':
    case 'paciente':
    case 'gestante':
      return `${raw.persona.nombre} ${raw.persona.apellido}`.trim()
    case 'donacion': {
      const name = raw.donante?.persona
        ? `${raw.donante.persona.nombre} ${raw.donante.persona.apellido}`
        : `Donacion #${raw.id}`
      return name
    }
    case 'transfusion': {
      const name = raw.paciente?.persona
        ? `${raw.paciente.persona.nombre} ${raw.paciente.persona.apellido}`
        : `Transfusion #${raw.id}`
      return name
    }
    case 'user':
      return raw.name ?? raw.email
    default:
      return ''
  }
}

// ── get all soft-deleted items across supported entities ──

export async function getTrashItems(page: number, pageSize: number, filters?: { search?: string; entityType?: string; fechaDesde?: string; fechaHasta?: string }): Promise<PaginatedTrash> {
  const allItems: TrashEntity[] = []
  const entityTypes: Array<{ key: string; query: Promise<any[]> }> = [
    {
      key: 'persona',
      query: prisma.persona.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, nombre: true, apellido: true, deletedAt: true },
      }),
    },
    {
      key: 'donante',
      query: prisma.donante.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, persona: { select: { nombre: true, apellido: true } }, deletedAt: true },
      }),
    },
    {
      key: 'paciente',
      query: prisma.paciente.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, persona: { select: { nombre: true, apellido: true } }, deletedAt: true },
      }),
    },
    {
      key: 'gestante',
      query: prisma.gestante.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, persona: { select: { nombre: true, apellido: true } }, deletedAt: true },
      }),
    },
    {
      key: 'donacion',
      query: prisma.donacion.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, donante: { select: { persona: { select: { nombre: true, apellido: true } } } }, deletedAt: true },
      }),
    },
    {
      key: 'transfusion',
      query: prisma.transfusion.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, paciente: { select: { persona: { select: { nombre: true, apellido: true } } } }, deletedAt: true },
      }),
    },
    {
      key: 'user',
      query: prisma.user.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, email: true, name: true, deletedAt: true },
      }),
    },
  ]

  const entities = await Promise.all(entityTypes.map(e => e.query))

  for (let i = 0; i < entityTypes.length; i++) {
    const key = entityTypes[i].key
    const rows = entities[i]
    for (const row of rows) {
      allItems.push({
        id: row.id,
        entityType: key,
        displayName: buildDisplayName(key, row),
        deletedAt: row.deletedAt,
      })
    }
  }

  // Apply filters
  let filtered = allItems

  if (filters?.entityType) {
    filtered = filtered.filter((item) => item.entityType === filters.entityType)
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter((item) => item.displayName.toLowerCase().includes(q))
  }

  if (filters?.fechaDesde) {
    const desde = new Date(filters.fechaDesde + 'T00:00:00')
    filtered = filtered.filter((item) => item.deletedAt && item.deletedAt >= desde)
  }

  if (filters?.fechaHasta) {
    const hasta = new Date(filters.fechaHasta + 'T23:59:59')
    filtered = filtered.filter((item) => item.deletedAt && item.deletedAt <= hasta)
  }

  // Sort most recently deleted first
  filtered.sort((a, b) => {
    if (!a.deletedAt || !b.deletedAt) return 0
    return b.deletedAt.getTime() - a.deletedAt.getTime()
  })

  // Paginate
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return { items, total, page: safePage, pageSize, totalPages }
}

// ── helpers ──

function modelFor(entityType: string) {
  switch (entityType) {
    case 'persona':     return prisma.persona
    case 'donante':     return prisma.donante
    case 'paciente':    return prisma.paciente
    case 'gestante':    return prisma.gestante
    case 'donacion':    return prisma.donacion
    case 'transfusion': return prisma.transfusion
    case 'user':        return prisma.user
    default:           throw new Error(`Entidad desconocida: ${entityType}`)
  }
}

export async function restoreItem(entityType: string, id: number): Promise<boolean> {
  const model = modelFor(entityType)
  const result = await model.update({
    where: { id },
    data: { deletedAt: null },
  })
  return !!result
}
