import type { Request, Response, NextFunction } from 'express'

import {
  transfusionQuerySchema,
  crearTransfusionSchema,
  actualizarTransfusionSchema,
  listarTransfusionesResponseSchema,
  transfusionItemResponseSchema,
} from '@/modules/transfusion/transfusion.schema'
import * as transfusionService from '@/modules/transfusion/transfusion.service'
import { successResponse } from '@/utils/api-response'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = transfusionQuerySchema.parse(req.query)
    const result = await transfusionService.listar(query)
    const validated = listarTransfusionesResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const result = await transfusionService.obtener(id)
    const validated = transfusionItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = crearTransfusionSchema.parse(req.body)
    const result = await transfusionService.crear(data)
    const validated = transfusionItemResponseSchema.parse({ item: result })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarTransfusionSchema.parse(req.body)
    const item = await transfusionService.actualizar(id, data)
    const validated = transfusionItemResponseSchema.parse({ item })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await transfusionService.eliminar(id)
    res.status(200).json(successResponse(null))
  } catch (err) {
    next(err)
  }
}
