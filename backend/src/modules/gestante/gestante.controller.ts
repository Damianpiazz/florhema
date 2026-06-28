import type { Request, Response, NextFunction } from 'express'

import {
  crearGestanteSchema,
  actualizarGestanteSchema,
  gestanteQuerySchema,
  listarGestantesResponseSchema,
  gestanteItemResponseSchema,
} from '@/modules/gestante/gestante.schema'
import * as gestanteService from '@/modules/gestante/gestante.service'
import { successResponse } from '@/utils/api-response'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = gestanteQuerySchema.parse(req.query)
    const result = await gestanteService.listar(query)
    const validated = listarGestantesResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const personaId = Number(req.params.personaId)
    const data = crearGestanteSchema.parse(req.body)
    const result = await gestanteService.crear(personaId, data)
    const validated = gestanteItemResponseSchema.parse({ item: result })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarGestanteSchema.parse(req.body)
    const result = await gestanteService.actualizar(id, data)
    const validated = gestanteItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await gestanteService.eliminar(id)
    res.status(200).json(successResponse(null))
  } catch (err) {
    next(err)
  }
}
