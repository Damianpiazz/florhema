import {
  toGrupoSanguineoResponse,
  toGrupoSanguineoItemResponse
} from '@/modules/grupo-sanguineo/grupo-sanguineo.dto'
import * as grupoSanguineoRepository from '@/modules/grupo-sanguineo/grupo-sanguineo.repository'
import type { ActualizarGrupoInput } from '@/modules/grupo-sanguineo/grupo-sanguineo.schema'
import { AppError } from '@/utils/app-error'

export async function listar() {
  const grupos = await grupoSanguineoRepository.findAllActive()
  return grupos.map(toGrupoSanguineoResponse)
}

export async function eliminar(id: number) {
  const grupo = await grupoSanguineoRepository.findById(id)

  if (!grupo || grupo.deletedAt) {
    throw new AppError(404, 'Grupo sanguíneo no encontrado')
  }

  const vinculadas = await grupoSanguineoRepository.countPersonasVinculadas(id)

  if (vinculadas > 0) {
    throw new AppError(409, 'No se puede eliminar el grupo porque tiene personas asociadas')
  }

  await grupoSanguineoRepository.softDelete(id)

  return { message: 'Grupo sanguíneo eliminado correctamente' }
}

export async function actualizar(id: number, data: ActualizarGrupoInput) {
  const grupo = await grupoSanguineoRepository.findById(id)

  if (!grupo || grupo.deletedAt) {
    throw new AppError(404, 'Grupo sanguíneo no encontrado')
  }

  const duplicado = await grupoSanguineoRepository.findByTipoFactorRh(data.tipo, data.factorRh, id)

  if (duplicado) {
    throw new AppError(409, 'Ya existe un grupo con esa combinación de tipo y factor Rh')
  }

  const updated = await grupoSanguineoRepository.update(id, data)

  return toGrupoSanguineoItemResponse(updated)
}
