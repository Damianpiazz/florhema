import { fakerES } from '@faker-js/faker'
import { prisma } from '@/lib/prisma'

export async function seedPersona(count = 200) {
  const existingCount = await prisma.persona.count()
  if (existingCount >= count) {
    console.log(`  - Ya existen ${existingCount} personas, omitido.`)
    return
  }

  const grupos = await prisma.grupoSanguineo.findMany({
    select: { id: true },
  })

  if (grupos.length === 0) {
    console.log('  - No hay grupos sanguíneos. Ejecutá seedGrupoSanguineo primero.')
    return
  }

  const dniSet = new Set<string>()
  const batchSize = 50
  let created = 0

  for (let batch = 0; batch < Math.ceil(count / batchSize); batch++) {
    const remaining = count - created
    const size = Math.min(batchSize, remaining)
    const data: {
      dni: string
      nombre: string
      apellido: string
      fechaNacimiento: Date
      direccion: string
      telefono: string
      grupoSanguineoId: number
    }[] = []

    for (let i = 0; i < size; i++) {
      let dni: string
      do {
        dni = fakerES.string.numeric({ length: { min: 7, max: 8 } })
      } while (dniSet.has(dni))
      dniSet.add(dni)

      data.push({
        dni,
        nombre: fakerES.person.firstName(),
        apellido: fakerES.person.lastName(),
        fechaNacimiento: fakerES.date.birthdate({ mode: 'age', min: 18, max: 80 }),
        direccion: fakerES.location.streetAddress(),
        telefono: `11${fakerES.string.numeric({ length: 8 })}`,
        grupoSanguineoId: fakerES.helpers.arrayElement(grupos).id,
      })
    }

    await prisma.persona.createMany({ data, skipDuplicates: true })
    created += size
    console.log(`  - ${created}/${count} personas creadas...`)
  }

  console.log(`  - ${count} personas creadas exitosamente.`)
}