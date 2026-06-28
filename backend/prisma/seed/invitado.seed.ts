import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/utils/password'

export async function seedInvitado() {
  const email = 'invitado@hospital.com'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('  - Invitado ya existe, omitido.')
    return
  }

  await prisma.user.create({
    data: {
      email,
      password: await hashPassword('invitado123'),
      name: 'Invitado',
      role: 'INVITADO'
    }
  })

  console.log('  - Invitado creado: invitado@hospital.com / invitado123')
}
