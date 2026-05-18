import { prisma } from '@/lib/prisma'
import { AppError } from '@/utils/app-error'
import { normalizeEmail } from '@/utils/normalize-email'
import { hashPassword } from '@/utils/password'
import * as authRepository from '@/modules/auth/auth.repository'
import * as sessionService from '@/modules/auth/session.service'
import * as auditRepository from '@/modules/audit/audit.repository'
import { toUserResponse, toRegisterResponse } from '@/modules/auth/auth.dto'
import type { RegisterInput } from '@/modules/auth/auth.schema'

export async function register(input: RegisterInput) {
  const email = normalizeEmail(input.email)
  await ensureEmailNotTaken(email)
  const passwordHash = await hashPassword(input.password)
  const { user, tokenRaw } = await prisma.$transaction(async () => {
    const newUser = await authRepository.create({
      email,
      password: passwordHash,
      name: input.name ?? null,
      role: 'USER'
    })
    const { tokenRaw } = await sessionService.createSession(newUser.id)
    await auditRepository.create({
      userId: newUser.id,
      action: 'CREATE',
      entity: 'User',
      entityId: newUser.id,
      newValues: { email: newUser.email, role: newUser.role }
    })
    return { user: newUser, tokenRaw }
  })
  const userDto = toUserResponse(user)
  return toRegisterResponse(userDto, tokenRaw)
}

async function ensureEmailNotTaken(email: string): Promise<void> {
  const existing = await authRepository.findByEmail(email)
  if (existing) {
    throw new AppError(409, 'El email ya está registrado')
  }
}