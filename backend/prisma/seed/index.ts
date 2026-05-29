import { prisma } from '@/lib/prisma'
import { seedAdmin } from './admin.seed'
import { seedGrupoSanguineo } from './grupo-sanguineo.seed'

async function main() {
  console.log('Corriendo seeds...')
  await seedAdmin()
  await seedGrupoSanguineo()
  console.log('Seeds completados.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
