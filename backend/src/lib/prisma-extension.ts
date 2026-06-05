import type { PrismaClient } from '@/generated/prisma/client'
import { getCurrentUserId } from '@/lib/audit-context'

export function createAuditExtension(prisma: PrismaClient) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          if (model === 'AuditLog') {
            return query(args)
          }

          if (operation !== 'create' && operation !== 'update' && operation !== 'delete' && operation !== 'upsert') {
            return query(args)
          }

          let oldRecord: unknown = null
          if (operation === 'update' || operation === 'delete') {
            try {
              oldRecord = await (prisma as any)[model].findUnique({ where: args.where })
            } catch {
              // ignore
            }
          }

          const result = await query(args)

          const userId = getCurrentUserId()
          if (!userId) {
            return result
          }

          try {
            const action = operation === 'create' ? 'CREATE' : operation === 'delete' ? 'DELETE' : operation === 'upsert' ? 'UPSERT' : 'UPDATE'

            await prisma.auditLog.create({
              data: {
                userId,
                action,
                entity: model,
                entityId: result.id,
                oldValues: oldRecord ?? undefined,
                newValues: operation !== 'delete' ? (args.data ?? args.create ?? args.update) : undefined,
              },
            })
          } catch {
            // audit log failure should not break the main operation
          }

          return result
        },
      },
    },
  })
}
