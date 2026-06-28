import { AppError } from '@/utils/app-error'
import * as recienNacidoRepository from '@/modules/recien-nacido/recien-nacido.repository'
import { toRecienNacidoResponse } from '@/modules/recien-nacido/recien-nacido.dto'
import type { CrearRecienNacidoInput, ActualizarRecienNacidoInput } from '@/modules/recien-nacido/recien-nacido.schema'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function listar(gestanteId: number | undefined, params: { limit?: number; offset?: number }) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  if (gestanteId) {
    const gestante = await recienNacidoRepository.findGestanteById(gestanteId)
    if (!gestante) {
      throw new AppError(404, 'Gestante no encontrada')
    }
    const [items, total] = await Promise.all([
      recienNacidoRepository.findByGestanteId(gestanteId, limit, offset),
      recienNacidoRepository.countByGestanteId(gestanteId),
    ])
    return {
      items: items.map(toRecienNacidoResponse),
      total,
      limit,
      offset,
    }
  }

  const [items, total] = await Promise.all([
    recienNacidoRepository.findAll(limit, offset),
    recienNacidoRepository.countAll(),
  ])

  return {
    items: items.map(toRecienNacidoResponse),
    total,
    limit,
    offset,
  }
}

export async function crear(gestanteId: number, input: CrearRecienNacidoInput) {
  const gestante = await recienNacidoRepository.findGestanteById(gestanteId)
  if (!gestante) {
    throw new AppError(404, 'Gestante no encontrada')
  }

  const existeDni = await recienNacidoRepository.findPersonaByDni(input.dni)
  if (existeDni) {
    throw new AppError(409, 'El DNI ya existe en el sistema')
  }

  const grupo = await recienNacidoRepository.findGrupoById(input.grupoSanguineoId)
  if (!grupo) {
    throw new AppError(404, 'El grupo sanguíneo indicado no existe')
  }

  const recienNacido = await recienNacidoRepository.createInTransaction({
    dni: input.dni,
    nombre: input.nombre,
    apellido: input.apellido,
    fechaNacimiento: input.fechaNacimiento,
    direccion: input.direccion,
    telefono: input.telefono,
    grupoSanguineoId: input.grupoSanguineoId,
    gestanteId,
    coombsPositivo: input.pruebaCoombsDirecta.positivo,
  })

  return toRecienNacidoResponse(recienNacido)
}

export async function actualizar(id: number, input: ActualizarRecienNacidoInput) {
  const existente = await recienNacidoRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Recién nacido no encontrado')
  }

  if (input.grupoSanguineoId) {
    const grupo = await recienNacidoRepository.findGrupoById(input.grupoSanguineoId)
    if (!grupo) {
      throw new AppError(404, 'El grupo sanguíneo indicado no existe')
    }
  }

  const recienNacido = await recienNacidoRepository.updateInTransaction(id, {
    nombre: input.nombre,
    apellido: input.apellido,
    direccion: input.direccion,
    telefono: input.telefono,
    grupoSanguineoId: input.grupoSanguineoId,
    coombsPositivo: input.pruebaCoombsDirecta?.positivo,
  })

  return toRecienNacidoResponse(recienNacido)
}

export async function obtener(id: number) {
  const existente = await recienNacidoRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Recién nacido no encontrado')
  }
  return toRecienNacidoResponse(existente)
}

export async function eliminar(id: number) {
  const existente = await recienNacidoRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Recién nacido no encontrado')
  }

  await recienNacidoRepository.softDelete(id)
}
