import type { Request, Response, NextFunction } from 'express'
import { successResponse } from '@/utils/api-response'
import { auditQuerySchema } from './audit.schema'
import * as auditService from './audit.service'

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const query = auditQuerySchema.parse(req.query)
    const result = await auditService.listar(query)
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}
