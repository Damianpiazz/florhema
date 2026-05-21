import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

import { logger } from '@/config/logger'
import { errorResponse } from '@/utils/api-response'
import { AppError } from '@/utils/app-error'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message))
    return
  }

  if (err instanceof ZodError) {
    const first = err.issues[0]
    res.status(400).json(errorResponse(first.message))
    return
  }
  logger.error({ err }, 'Error no manejado')

  res.status(500).json(errorResponse('Error interno del servidor'))
}
