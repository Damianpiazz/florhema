import { AppError } from '@/utils/app-error'
import * as pacienteRepository from '@/modules/paciente/paciente.repository'
import { toPacienteResponse } from '@/modules/paciente/paciente.dto'
import type { CrearPacienteInput, ActualizarPacienteInput, PacienteQuery } from '@/modules/paciente/paciente.schema'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function listar(params: PacienteQuery) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    pacienteRepository.findAll({
      dni: params.dni,
      nombre: params.nombre,
      apellido: params.apellido,
      limit,
      offset,
    }),
    pacienteRepository.countList({
      dni: params.dni,
      nombre: params.nombre,
      apellido: params.apellido,
    }),
  ])

  return {
    items: items.map(toPacienteResponse),
    total,
    limit,
    offset,
  }
}

export async function crear(personaId: number, _input: CrearPacienteInput) {
  const persona = await pacienteRepository.findPersonaById(personaId)
  if (!persona) {
    throw new AppError(404, 'Persona no encontrada')
  }

  const existente = await pacienteRepository.findByPersonaId(personaId)
  if (existente) {
    throw new AppError(409, 'La persona ya está registrada como paciente')
  }

  const paciente = await pacienteRepository.create({ personaId })

  return toPacienteResponse(paciente)
}

export async function actualizar(id: number, _input: ActualizarPacienteInput) {
  const existente = await pacienteRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Paciente no encontrado')
  }

  return toPacienteResponse(existente)
}

export async function eliminar(id: number) {
  const existente = await pacienteRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Paciente no encontrado')
  }

  const transfusionesActivas = await pacienteRepository.countActiveTransfusiones(id)
  if (transfusionesActivas > 0) {
    throw new AppError(409, 'No se puede eliminar el paciente porque tiene transfusiones activas')
  }

  await pacienteRepository.softDelete(id)
}
