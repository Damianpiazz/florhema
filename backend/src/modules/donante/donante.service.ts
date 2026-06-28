import { toDonanteResponse } from '@/modules/donante/donante.dto'
import * as donanteRepository from '@/modules/donante/donante.repository'
import { AppError } from '@/utils/app-error'
import type { DonanteQuery } from '@/modules/donante/donante.schema'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function listar(params: DonanteQuery) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    donanteRepository.findAll({
      dni: params.dni,
      nombre: params.nombre,
      apellido: params.apellido,
      semaforoAptitud: params.semaforoAptitud,
      limit,
      offset,
    }),
    donanteRepository.count({
      dni: params.dni,
      nombre: params.nombre,
      apellido: params.apellido,
      semaforoAptitud: params.semaforoAptitud,
    }),
  ])

  return {
    items: (items as any[]).map(toDonanteResponse),
    total,
    limit,
    offset,
  }
}

export async function obtener(id: number) {
  const donante = await donanteRepository.findById(id)
  if (!donante) {
    throw new AppError(404, 'Donante no encontrado')
  }
  return toDonanteResponse(donante as any)
}

export async function buscarPorDni(dni: string) {
  const donante = await donanteRepository.findByDni(dni)
  if (!donante) {
    throw new AppError(404, 'Donante no encontrado')
  }
  return toDonanteResponse(donante as any)
}

export async function calcularSemaforo(donanteId: number) {
  const donante = await donanteRepository.findByIdWithDonaciones(donanteId)
  if (!donante) {
    throw new AppError(404, 'Donante no encontrado')
  }

  const ultimaDonacion = donante.donaciones[0]

  if (!ultimaDonacion) {
    await donanteRepository.update(donanteId, { semaforoAptitud: 'AMARILLO' })
    return { semaforoAptitud: 'AMARILLO' as const, motivo: 'Sin donaciones registradas' }
  }

  if (ultimaDonacion.resultadoSerologia) {
    const s = ultimaDonacion.resultadoSerologia
    if (s.hiv || s.hcv || s.hbv || s.chagas || s.sifilis) {
      await donanteRepository.update(donanteId, { semaforoAptitud: 'ROJO' })
      return { semaforoAptitud: 'ROJO' as const, motivo: 'Serología positiva: excluido permanente' }
    }
  }

  if (ultimaDonacion.peso < 50) {
    await donanteRepository.update(donanteId, { semaforoAptitud: 'AMARILLO' })
    return { semaforoAptitud: 'AMARILLO' as const, motivo: 'Peso inferior a 50 kg' }
  }

  if (ultimaDonacion.hemoglobina < 12.5 || ultimaDonacion.hemoglobina > 17.5) {
    await donanteRepository.update(donanteId, { semaforoAptitud: 'AMARILLO' })
    return { semaforoAptitud: 'AMARILLO' as const, motivo: 'Hemoglobina fuera del rango (12.5-17.5 g/dL)' }
  }

  const [sistolica] = ultimaDonacion.tensionArterial.split('/').map(Number)
  if (isNaN(sistolica) || sistolica < 100 || sistolica > 170) {
    await donanteRepository.update(donanteId, { semaforoAptitud: 'AMARILLO' })
    return { semaforoAptitud: 'AMARILLO' as const, motivo: 'Tensión arterial fuera del rango (100-170 sistólica)' }
  }

  if (!ultimaDonacion.resultadoSerologia) {
    await donanteRepository.update(donanteId, { semaforoAptitud: 'AMARILLO' })
    return { semaforoAptitud: 'AMARILLO' as const, motivo: 'Serología pendiente: se requiere segunda muestra' }
  }

  await donanteRepository.update(donanteId, { semaforoAptitud: 'VERDE' })
  return { semaforoAptitud: 'VERDE' as const, motivo: 'Todos los requisitos cumplidos' }
}
