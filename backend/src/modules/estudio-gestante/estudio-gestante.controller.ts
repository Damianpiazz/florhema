import type { Request, Response, NextFunction } from 'express'

import {
  estudioGestanteQuerySchema,
  crearEstudioGestanteSchema,
  actualizarEstudioGestanteSchema,
  listarEstudiosGestanteResponseSchema,
  estudioGestanteItemResponseSchema,
} from '@/modules/estudio-gestante/estudio-gestante.schema'
import * as estudioGestanteService from '@/modules/estudio-gestante/estudio-gestante.service'
import { successResponse } from '@/utils/api-response'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const gestanteId = Number(req.params.gestanteId)
    const query = estudioGestanteQuerySchema.parse(req.query)
    const result = await estudioGestanteService.listar(gestanteId, query)
    const validated = listarEstudiosGestanteResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = estudioGestanteQuerySchema.parse(req.query)
    const result = await estudioGestanteService.listarTodos(query)
    const validated = listarEstudiosGestanteResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const gestanteId = Number(req.params.gestanteId)
    const data = crearEstudioGestanteSchema.parse(req.body)
    const result = await estudioGestanteService.crear(gestanteId, data)
    const validated = estudioGestanteItemResponseSchema.parse({ item: result })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarEstudioGestanteSchema.parse(req.body)
    const result = await estudioGestanteService.actualizar(id, data)
    const validated = estudioGestanteItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await estudioGestanteService.eliminar(id)
    res.status(200).json(successResponse(null))
  } catch (err) {
    next(err)
  }
}
