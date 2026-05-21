import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/utils/password'

export async function seedAdmin() {
  const email = 'admin@hospital.com'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('  - Admin ya existe, omitido.')
    return
  }

  await prisma.user.create({
    data: {
      email,
      password: await hashPassword('admin123'),
      name: 'Administrador',
      role: 'ADMIN'
    }
  })

  console.log('  - Admin creado: admin@hospital.com / admin123')
}
