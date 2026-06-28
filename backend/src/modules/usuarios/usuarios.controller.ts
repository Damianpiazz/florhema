import type { Request, Response, NextFunction } from 'express'

import { successResponse } from '@/utils/api-response'
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  listarUsuariosQuerySchema,
} from './usuarios.schema'
import * as usuariosService from './usuarios.service'

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listarUsuariosQuerySchema.parse(req.query)
    const result = await usuariosService.listar(query)
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const input = crearUsuarioSchema.parse(req.body)
    const user = await usuariosService.crear(input, req.user!.id)
    res.status(201).json(successResponse({ user }))
  } catch (err) {
    next(err)
  }
}

export async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const input = actualizarUsuarioSchema.parse(req.body)
    const user = await usuariosService.actualizar(id, input, req.user!.id)
    res.json(successResponse({ user }))
  } catch (err) {
    next(err)
  }
}

export async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await usuariosService.eliminar(id, req.user!.id)
    res.json(successResponse({ message: 'Usuario eliminado' }))
  } catch (err) {
    next(err)
  }
}
