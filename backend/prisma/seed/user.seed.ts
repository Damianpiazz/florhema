import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/utils/password'

export async function seedUser() {
  const email = 'usuario@hospital.com'

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password: await hashPassword('usuario123'),
      name: 'Usuario Comun',
      role: 'USER'
    },
    update: {
      password: await hashPassword('usuario123'),
      name: 'Usuario Comun',
      role: 'USER'
    }
  })

  console.log('  - Usuario comun asegurado: usuario@hospital.com / usuario123')
}
