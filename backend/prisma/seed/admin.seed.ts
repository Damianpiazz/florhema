import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/utils/password'

export async function seedAdmin() {
  const email = 'admin@hospital.com'

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      password: await hashPassword('admin123'),
      name: 'Administrador',
      role: 'ADMIN'
    },
    update: {
      password: await hashPassword('admin123'),
      name: 'Administrador',
      role: 'ADMIN'
    }
  })

  console.log('  - Admin asegurado: admin@hospital.com / admin123')
}
