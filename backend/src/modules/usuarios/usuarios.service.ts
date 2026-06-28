import * as auditRepository from '@/modules/audit/audit.repository'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/utils/app-error'
import { hashPassword } from '@/utils/password'
import { toUsuarioResponse } from './usuarios.dto'
import * as usuariosRepository from './usuarios.repository'
import type { CrearUsuarioInput, ActualizarUsuarioInput, ListarUsuariosQuery } from './usuarios.schema'

export async function listar(params: ListarUsuariosQuery) {
  const { items, total } = await usuariosRepository.listar({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
  })

  return {
    items: items.map(toUsuarioResponse),
    total,
    page: params.page,
    pageSize: params.pageSize,
  }
}

export async function crear(input: CrearUsuarioInput, reqUserId: number) {
  const existing = await usuariosRepository.findByEmail(input.email)
  if (existing) {
    throw new AppError(409, 'El email ya está registrado')
  }

  const hashedPassword = await hashPassword(input.password)

  const newUser = await usuariosRepository.crear({
    email: input.email,
    password: hashedPassword,
    name: input.name ?? null,
    role: input.role,
  })

  await auditRepository.create({
    userId: reqUserId,
    action: 'CREATE',
    entity: 'User',
    entityId: newUser.id,
    newValues: { email: input.email, name: input.name ?? null, role: input.role },
  })

  return toUsuarioResponse(newUser)
}

export async function actualizar(id: number, input: ActualizarUsuarioInput, currentUserId: number) {
  // Auto-protection: cannot change own role
  if (id === currentUserId && input.role !== undefined) {
    throw new AppError(403, 'No puedes cambiar tu propio rol')
  }

  const existingUser = await usuariosRepository.findById(id)
  if (!existingUser) {
    throw new AppError(404, 'Usuario no encontrado')
  }

  // If email changed, check uniqueness
  if (input.email !== undefined && input.email !== existingUser.email) {
    const emailTaken = await usuariosRepository.findByEmail(input.email)
    if (emailTaken) {
      throw new AppError(409, 'El email ya está registrado')
    }
  }

  const updatedUser = await usuariosRepository.actualizar(id, {
    email: input.email,
    name: input.name,
    role: input.role,
  })

  await auditRepository.create({
    userId: currentUserId,
    action: 'UPDATE',
    entity: 'User',
    entityId: id,
    oldValues: { email: existingUser.email, name: existingUser.name, role: existingUser.role },
    newValues: {
      ...(input.email !== undefined && { email: input.email }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.role !== undefined && { role: input.role }),
    },
  })

  return toUsuarioResponse(updatedUser)
}

export async function eliminar(id: number, currentUserId: number) {
  // Auto-protection: cannot delete own user
  if (id === currentUserId) {
    throw new AppError(403, 'No puedes eliminar tu propio usuario')
  }

  const existingUser = await usuariosRepository.findById(id)
  if (!existingUser) {
    throw new AppError(404, 'Usuario no encontrado')
  }

  await usuariosRepository.softDelete(id)

  // Revoke all active sessions
  await prisma.session.updateMany({
    where: { userId: id, revokedAt: null },
    data: { revokedAt: new Date() },
  })

  await auditRepository.create({
    userId: currentUserId,
    action: 'DELETE',
    entity: 'User',
    entityId: id,
    oldValues: { email: existingUser.email, name: existingUser.name, role: existingUser.role },
  })
}
