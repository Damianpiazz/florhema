import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'

export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    omit: { password: true }
  })
}

export async function findByEmailWithPassword(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function create(data: Prisma.UserCreateInput) {
  return prisma.user.create({
    data,
    omit: { password: true }
  })
}