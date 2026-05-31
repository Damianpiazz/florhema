import { prisma } from '@/lib/prisma'
import { seedAdmin } from './admin.seed'
import { seedGrupoSanguineo } from './grupo-sanguineo.seed'
import { seedPersona } from './persona.seed'

async function main() {
  console.log('Corriendo seeds...')
  await seedAdmin()
  await seedGrupoSanguineo()
  await seedPersona(3000) 
  console.log('Seeds completados.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
