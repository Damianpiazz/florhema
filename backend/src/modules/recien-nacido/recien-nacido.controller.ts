import type { Request, Response, NextFunction } from 'express'

import {
  crearRecienNacidoSchema,
  actualizarRecienNacidoSchema,
  listarRecienNacidosResponseSchema,
  recienNacidoItemResponseSchema,
} from '@/modules/recien-nacido/recien-nacido.schema'
import * as recienNacidoService from '@/modules/recien-nacido/recien-nacido.service'
import { successResponse } from '@/utils/api-response'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const gestanteId = req.query.gestanteId ? Number(req.query.gestanteId) : undefined
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0
    const result = await recienNacidoService.listar(gestanteId, { limit, offset })
    const validated = listarRecienNacidosResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const gestanteId = Number(req.params.gestanteId)
    const data = crearRecienNacidoSchema.parse(req.body)
    const result = await recienNacidoService.crear(gestanteId, data)
    const validated = recienNacidoItemResponseSchema.parse({ item: result })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarRecienNacidoSchema.parse(req.body)
    const result = await recienNacidoService.actualizar(id, data)
    const validated = recienNacidoItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const result = await recienNacidoService.obtener(id)
    const validated = recienNacidoItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await recienNacidoService.eliminar(id)
    res.status(200).json(successResponse({ message: 'Recién nacido eliminado correctamente' }))
  } catch (err) {
    next(err)
  }
}
