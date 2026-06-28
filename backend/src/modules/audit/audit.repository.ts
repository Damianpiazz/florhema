import type { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'

interface CreateAuditLogParams {
  userId: number
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: string
  entityId: number
  oldValues?: Prisma.InputJsonValue
  newValues?: Prisma.InputJsonValue
}

export interface AuditFilters {
  page: number
  pageSize: number
  entity?: string
  action?: string
  fechaDesde?: string
  fechaHasta?: string
}

export async function create(params: CreateAuditLogParams) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      ...(params.oldValues !== undefined && { oldValues: params.oldValues }),
      ...(params.newValues !== undefined && { newValues: params.newValues })
    }
  })
}

export async function findAll(filters: AuditFilters) {
  const where: Prisma.AuditLogWhereInput = {}

  if (filters.entity) where.entity = filters.entity
  if (filters.action) where.action = filters.action
  if (filters.fechaDesde || filters.fechaHasta) {
    where.createdAt = {}
    if (filters.fechaDesde) where.createdAt.gte = new Date(filters.fechaDesde)
    if (filters.fechaHasta) where.createdAt.lte = new Date(filters.fechaHasta)
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      include: { user: { select: { id: true, email: true, name: true } } }
    }),
    prisma.auditLog.count({ where })
  ])

  return { items, total, page: filters.page, pageSize: filters.pageSize }
}
