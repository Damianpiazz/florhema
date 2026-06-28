import type { Request, Response, NextFunction } from 'express'

import {
  crearPacienteSchema,
  actualizarPacienteSchema,
  pacienteQuerySchema,
  listarPacientesResponseSchema,
  pacienteItemResponseSchema,
} from '@/modules/paciente/paciente.schema'
import * as pacienteService from '@/modules/paciente/paciente.service'
import { successResponse } from '@/utils/api-response'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = pacienteQuerySchema.parse(req.query)
    const result = await pacienteService.listar(query)
    const validated = listarPacientesResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const personaId = Number(req.params.personaId)
    const data = crearPacienteSchema.parse(req.body)
    const result = await pacienteService.crear(personaId, data)
    const validated = pacienteItemResponseSchema.parse({ item: result })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarPacienteSchema.parse(req.body)
    const result = await pacienteService.actualizar(id, data)
    const validated = pacienteItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await pacienteService.eliminar(id)
    res.status(200).json(successResponse(null))
  } catch (err) {
    next(err)
  }
}
