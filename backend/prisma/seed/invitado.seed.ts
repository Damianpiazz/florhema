import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/utils/password'

export async function seedInvitado() {
  const email = 'invitado@hospital.com'

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password: await hashPassword('invitado123'),
      name: 'Invitado',
      role: 'INVITADO'
    },
    update: {
      password: await hashPassword('invitado123'),
      name: 'Invitado',
      role: 'INVITADO'
    }
  })

  console.log('  - Invitado asegurado: invitado@hospital.com / invitado123')
}
