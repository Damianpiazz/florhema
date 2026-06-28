import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/utils/password'

export async function seedUser() {
  const email = 'usuario@hospital.com'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('  - Usuario comun ya existe, omitido.')
    return
  }

  await prisma.user.create({
    data: {
      email,
      password: await hashPassword('usuario123'),
      name: 'Usuario Comun',
      role: 'USER'
    }
  })

  console.log('  - Usuario comun creado: usuario@hospital.com / usuario123')
}
