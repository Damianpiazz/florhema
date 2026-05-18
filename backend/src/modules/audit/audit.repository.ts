import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'

interface CreateAuditLogParams {
  userId: number
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: string
  entityId: number
  oldValues?: Prisma.InputJsonValue
  newValues?: Prisma.InputJsonValue
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