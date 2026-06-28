import { prisma } from '@/lib/prisma'
import { seedAdmin } from './admin.seed'
import { seedGrupoSanguineo } from './grupo-sanguineo.seed'
import { seedPersona } from './persona.seed'
import { seedActividad } from './actividad.seed'
import { seedUser } from './user.seed'
import { seedInvitado } from './invitado.seed'

async function main() {
  console.log('Corriendo seeds...')
  await seedAdmin()
  await seedUser()
  await seedInvitado()
  await seedGrupoSanguineo()
  await seedPersona(3000)
  await seedActividad()
  console.log('Seeds completados.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
