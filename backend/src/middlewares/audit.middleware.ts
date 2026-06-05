import type { Request, Response, NextFunction } from 'express'

import { runWithAuditContext } from '@/lib/audit-context'

export function auditMiddleware(req: Request, _res: Response, next: NextFunction) {
  const userId = req.user?.id
  if (!userId) {
    next()
    return
  }

  runWithAuditContext(userId, async () => {
    next()
  })
}
