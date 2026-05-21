import { prisma } from '@/lib/prisma'

export async function create(userId: number, tokenHash: string, expiresAt: Date) {
  return prisma.session.create({
    data: { userId, tokenHash, expiresAt }
  })
}

export async function revoke(tokenHash: string) {
  await prisma.session.update({
    where: { tokenHash },
    data: { revokedAt: new Date() }
  })
}
