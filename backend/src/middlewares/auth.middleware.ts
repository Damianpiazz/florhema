import { createHash } from 'node:crypto'

import type { Request, Response, NextFunction } from 'express'

import { AUTH } from '@/config/auth'
import { runWithAuditContext } from '@/lib/audit-context'
import { prisma } from '@/lib/prisma'
import { errorResponse } from '@/utils/api-response'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[AUTH.COOKIE_NAME]
    if (!token) {
      return res.status(401).json(errorResponse('No autenticado'))
    }

    const tokenHash = createHash('sha256').update(token).digest('hex')

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: { omit: { password: true } } }
    })

    if (!session) {
      return res.status(401).json(errorResponse('No autenticado'))
    }

    if (session.revokedAt) {
      return res.status(401).json(errorResponse('Sesión revocada'))
    }

    if (session.expiresAt < new Date()) {
      return res.status(401).json(errorResponse('Sesión expirada'))
    }

    req.user = session.user
    runWithAuditContext(session.user.id, async () => {
      next()
    })
  } catch (err) {
    next(err)
  }
}

export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json(errorResponse('Acción no permitida. Se requiere rol ADMIN'))
  }

  next()
}