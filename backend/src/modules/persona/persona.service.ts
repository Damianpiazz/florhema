import {
  toPersonaResponse,
  toPersonaDetalleResponse,
  toDonacionResponse,
  toDonacionActividadItem,
  toTransfusionResponse,
  toTransfusionActividadItem,
  toEstudioResponse,
  toEstudioActividadItem,
  toRecienNacidoResponse,
  toRecienNacidoActividadItem,
} from '@/modules/persona/persona.dto'
import * as personaRepository from '@/modules/persona/persona.repository'
import { AppError } from '@/utils/app-error'
import type { CrearPersonaInput, ActualizarPersonaInput } from '@/modules/persona/persona.schema'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function listar(params: { dni?: string; limit?: number; offset?: number }) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [personas, total] = await Promise.all([
    personaRepository.findAll({ dni: params.dni, limit, offset }),
    personaRepository.count({ dni: params.dni }),
  ])

  return {
    items: personas.map(toPersonaResponse),
    total,
    limit,
    offset,
  }
}

export async function crear(data: CrearPersonaInput) {
  const existente = await personaRepository.findByDni(data.dni)
  if (existente) {
    throw new AppError(409, 'El DNI ya existe en el sistema')
  }

  const grupoExiste = await personaRepository.findGrupoSanguineoById(data.grupoSanguineoId)
  if (!grupoExiste || grupoExiste.deletedAt) {
    throw new AppError(404, 'El grupo sanguíneo indicado no existe')
  }

  const persona = await personaRepository.create(data)

  return toPersonaResponse(persona)
}

export async function actualizar(id: number, data: ActualizarPersonaInput) {
  const existente = await personaRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Persona no encontrada')
  }

  const dniExistente = await personaRepository.findByDni(data.dni, id)
  if (dniExistente) {
    throw new AppError(409, 'El DNI ya pertenece a otra persona')
  }

  const grupoExiste = await personaRepository.findGrupoSanguineoById(data.grupoSanguineoId)
  if (!grupoExiste || grupoExiste.deletedAt) {
    throw new AppError(404, 'El grupo sanguíneo indicado no existe')
  }

  const persona = await personaRepository.update(id, data)

  return toPersonaResponse(persona)
}

export async function buscarPorDni(dni: string) {
  const persona = await personaRepository.findByDni(dni)
  if (!persona) {
    throw new AppError(404, 'Persona no encontrada')
  }
  return {
    id: persona.id,
    dni: persona.dni,
    nombre: persona.nombre,
    apellido: persona.apellido,
  }
}

export async function eliminar(id: number) {
  const existente = await personaRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Persona no encontrada')
  }

  const vinculaciones = await personaRepository.countVinculacionesActivas(id)
  if (vinculaciones > 0) {
    throw new AppError(409, 'No se puede eliminar la persona porque tiene un donante, paciente o gestante activo')
  }

  await personaRepository.softDelete(id)
  return { message: 'Persona eliminada correctamente' }
}

// =========================
// DETALLE (GET /:id)
// =========================

export async function obtenerDetalle(id: number) {
  const persona = await personaRepository.findByIdWithRoles(id)
  if (!persona) {
    throw new AppError(404, 'Persona no encontrada')
  }
  return toPersonaDetalleResponse(persona)
}

// =========================
// DONACIONES
// =========================

export async function listarDonaciones(personaId: number, params: { limit?: number; offset?: number }) {
  const persona = await personaRepository.findById(personaId)
  if (!persona) {
    throw new AppError(404, 'Persona no encontrada')
  }

  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    personaRepository.findDonacionesByPersonaId(personaId, limit, offset),
    personaRepository.countDonacionesByPersonaId(personaId),
  ])

  return {
    items: items.map(toDonacionResponse),
    total,
    limit,
    offset,
  }
}

// =========================
// TRANSFUSIONES
// =========================

export async function listarTransfusiones(personaId: number, params: { limit?: number; offset?: number }) {
  const persona = await personaRepository.findById(personaId)
  if (!persona) {
    throw new AppError(404, 'Persona no encontrada')
  }

  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    personaRepository.findTransfusionesByPersonaId(personaId, limit, offset),
    personaRepository.countTransfusionesByPersonaId(personaId),
  ])

  return {
    items: items.map(toTransfusionResponse),
    total,
    limit,
    offset,
  }
}

// =========================
// ESTUDIOS GESTANTE
// =========================

export async function listarEstudios(personaId: number, params: { limit?: number; offset?: number }) {
  const persona = await personaRepository.findById(personaId)
  if (!persona) {
    throw new AppError(404, 'Persona no encontrada')
  }

  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    personaRepository.findEstudiosByPersonaId(personaId, limit, offset),
    personaRepository.countEstudiosByPersonaId(personaId),
  ])

  return {
    items: items.map(toEstudioResponse),
    total,
    limit,
    offset,
  }
}

// =========================
// RECIEN NACIDOS
// =========================

export async function listarRecienNacidos(personaId: number, params: { limit?: number; offset?: number }) {
  const persona = await personaRepository.findById(personaId)
  if (!persona) {
    throw new AppError(404, 'Persona no encontrada')
  }

  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    personaRepository.findRecienNacidosByPersonaId(personaId, limit, offset),
    personaRepository.countRecienNacidosByPersonaId(personaId),
  ])

  return {
    items: items.map(toRecienNacidoResponse),
    total,
    limit,
    offset,
  }
}

// =========================
// ACTIVIDAD (timeline unificado)
// =========================

export async function listarActividad(personaId: number, params: { limit?: number; offset?: number }) {
  const persona = await personaRepository.findById(personaId)
  if (!persona) {
    throw new AppError(404, 'Persona no encontrada')
  }

  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [donaciones, transfusiones, estudios, recienNacidos] = await Promise.all([
    personaRepository.findDonacionesByPersonaId(personaId),
    personaRepository.findTransfusionesByPersonaId(personaId),
    personaRepository.findEstudiosByPersonaId(personaId),
    personaRepository.findRecienNacidosByPersonaId(personaId),
  ])

  const rawItems = [
    ...donaciones.map(toDonacionActividadItem),
    ...transfusiones.map(toTransfusionActividadItem),
    ...estudios.map(toEstudioActividadItem),
    ...recienNacidos.map(toRecienNacidoActividadItem),
  ]

  rawItems.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  const total = rawItems.length
  const paged = rawItems.slice(offset, offset + limit)

  return {
    items: paged,
    total,
    limit,
    offset,
  }
}