import { toUserResponse } from '@/modules/auth/auth.dto'
import * as authRepository from '@/modules/auth/auth.repository'
import type { LoginInput } from '@/modules/auth/auth.schema'
import * as sessionService from '@/modules/auth/session.service'
import { AppError } from '@/utils/app-error'
import { normalizeEmail } from '@/utils/normalize-email'
import { verifyPassword } from '@/utils/password'

export async function login(input: LoginInput) {
  const email = normalizeEmail(input.email)
  const user = await authRepository.findByEmailWithPassword(email)

  if (!user || user.deletedAt) {
    throw new AppError(401, 'Email o contraseña incorrectos')
  }

  const valid = await verifyPassword(input.password, user.password)
  if (!valid) {
    throw new AppError(401, 'Email o contraseña incorrectos')
  }

  const { tokenRaw } = await sessionService.createSession(user.id)
  const userDto = toUserResponse(user)

  return { user: userDto, tokenRaw }
}

export async function logout(tokenHash: string) {
  await sessionService.revokeSession(tokenHash)
}

export async function getMe(userId: number) {
  const user = await authRepository.findById(userId)
  if (!user) {
    throw new AppError(401, 'No autenticado')
  }
  return toUserResponse(user)
}
