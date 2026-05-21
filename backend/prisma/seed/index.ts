import { prisma } from '@/lib/prisma'
import { seedAdmin } from './admin.seed'

async function main() {
  console.log('Corriendo seeds...')
  await seedAdmin()
  console.log('Seeds completados.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
