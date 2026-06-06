import { fakerES } from '@faker-js/faker'
import { prisma } from '@/lib/prisma'

export async function seedActividad() {
  const grupos = await prisma.grupoSanguineo.findMany()
  if (grupos.length === 0) {
    console.log('  - No hay grupos sanguíneos. Ejecutá seedGrupoSanguineo primero.')
    return
  }

  const personas = await prisma.persona.findMany({ where: { deletedAt: null } })
  if (personas.length === 0) {
    console.log('  - No hay personas. Ejecutá seedPersona primero.')
    return
  }

  // Cada persona obtiene los 3 roles (donante, paciente, gestante)
  const donantesCreados = await createDonantes(personas, grupos)
  console.log(`  - ${donantesCreados} donantes creados con donaciones.`)

  const pacientesCreados = await createPacientes(personas, grupos)
  console.log(`  - ${pacientesCreados} pacientes creados con transfusiones.`)

  const gestantesCreados = await createGestantes(personas, grupos)
  console.log(`  - ${gestantesCreados} gestantes creadas con estudios y recién nacidos.`)
}

async function createDonantes(personas: { id: number }[], grupos: { id: number }[]) {
  let created = 0

  for (const p of personas) {
    const existing = await prisma.donante.findUnique({ where: { personaId: p.id } })
    if (existing) continue

    const donante = await prisma.donante.create({
      data: { personaId: p.id, semaforoAptitud: 'VERDE' },
    })

    const numDonaciones = fakerES.number.int({ min: 1, max: 5 })
    let hasPositiveSerologia = false

    for (let i = 0; i < numDonaciones; i++) {
      const donacion = await prisma.donacion.create({
        data: {
          donanteId: donante.id,
          fecha: fakerES.date.between({ from: new Date('2024-01-01'), to: new Date() }),
          peso: fakerES.number.float({ min: 50, max: 120, fractionDigits: 1 }),
          tensionArterial: `${fakerES.number.int({ min: 100, max: 140 })}/${fakerES.number.int({ min: 60, max: 90 })}`,
          hemoglobina: fakerES.number.float({ min: 12, max: 18, fractionDigits: 1 }),
          reaccionAdversa: fakerES.helpers.maybe(() => fakerES.lorem.word(), { probability: 0.1 }) ?? null,
          tipoDonacion: fakerES.helpers.arrayElement(['VOLUNTARIA', 'REPOSICION'] as const),
        },
      })

      const hiv = fakerES.helpers.maybe(() => true, { probability: 0.02 }) ?? false
      const hcv = fakerES.helpers.maybe(() => true, { probability: 0.02 }) ?? false
      const hbv = fakerES.helpers.maybe(() => true, { probability: 0.02 }) ?? false
      const chagas = fakerES.helpers.maybe(() => true, { probability: 0.02 }) ?? false
      const sifilis = fakerES.helpers.maybe(() => true, { probability: 0.02 }) ?? false

      if (hiv || hcv || hbv || chagas || sifilis) {
        hasPositiveSerologia = true
      }

      await prisma.resultadoSerologia.create({
        data: { donacionId: donacion.id, hiv, hcv, hbv, chagas, sifilis },
      })
    }

    const semaforo = hasPositiveSerologia
      ? 'ROJO'
      : (fakerES.helpers.maybe(() => 'AMARILLO' as const, { probability: 0.1 }) ?? 'VERDE')

    await prisma.donante.update({
      where: { id: donante.id },
      data: { semaforoAptitud: semaforo },
    })

    created++
  }
  return created
}

async function createPacientes(personas: { id: number }[], grupos: { id: number }[]) {
  let created = 0

  for (const p of personas) {
    const existing = await prisma.paciente.findUnique({ where: { personaId: p.id } })
    if (existing) continue

    const paciente = await prisma.paciente.create({ data: { personaId: p.id } })

    const numTransfusiones = fakerES.number.int({ min: 1, max: 3 })
    for (let i = 0; i < numTransfusiones; i++) {
      const [donanteGrupo, receptorGrupo] = fakerES.helpers.arrayElements(grupos, 2)

      const compatibilidad = await prisma.compatibilidadTransfusional.create({
        data: {
          compatible: fakerES.datatype.boolean(),
          motivoIncompatibilidad: fakerES.helpers.maybe(() => fakerES.lorem.sentence(), { probability: 0.3 }) ?? null,
          donanteGrupoId: donanteGrupo.id,
          receptorGrupoId: receptorGrupo.id,
        },
      })

      const transfusionData: {
        pacienteId: number
        fecha: Date
        componente: 'GLOBULOS_ROJOS' | 'PLASMA' | 'PLAQUETAS' | 'CRIOPRECIPITADO'
        cantidadUnidades: number
        reaccionAdversa: string | null
        compatibilidadId: number
        resultadoCoombsId?: number | null
      } = {
        pacienteId: paciente.id,
        fecha: fakerES.date.between({ from: new Date('2024-01-01'), to: new Date() }),
        componente: fakerES.helpers.arrayElement(['GLOBULOS_ROJOS', 'PLASMA', 'PLAQUETAS', 'CRIOPRECIPITADO'] as const),
        cantidadUnidades: fakerES.number.int({ min: 1, max: 4 }),
        reaccionAdversa: fakerES.helpers.maybe(() => fakerES.lorem.word(), { probability: 0.1 }) ?? null,
        compatibilidadId: compatibilidad.id,
      }

      if (fakerES.datatype.boolean()) {
        const coombs = await prisma.resultadoCoombs.create({
          data: {
            tipo: fakerES.helpers.arrayElement(['DIRECTO', 'INDIRECTO'] as const),
            positivo: fakerES.datatype.boolean(),
          },
        })
        transfusionData.resultadoCoombsId = coombs.id
      }

      await prisma.transfusion.create({ data: transfusionData })
    }
    created++
  }
  return created
}

async function createGestantes(personas: { id: number }[], grupos: { id: number }[]) {
  let created = 0

  for (const p of personas) {
    const existing = await prisma.gestante.findUnique({ where: { personaId: p.id } })
    if (existing) continue

    const gestante = await prisma.gestante.create({
      data: {
        personaId: p.id,
        antecedentesObstetricos: fakerES.helpers.maybe(() => fakerES.lorem.sentence(), { probability: 0.5 }),
      },
    })

    const numEstudios = fakerES.number.int({ min: 1, max: 3 })
    for (let i = 0; i < numEstudios; i++) {
      const coombs = await prisma.resultadoCoombs.create({
        data: { tipo: 'INDIRECTO', positivo: fakerES.datatype.boolean() },
      })

      await prisma.estudioGestante.create({
        data: {
          gestanteId: gestante.id,
          fecha: fakerES.date.between({ from: new Date('2024-01-01'), to: new Date() }),
          compatibilidadConyugal: fakerES.helpers.arrayElement(['Compatible', 'Incompatible', null]),
          estadoEstudio: fakerES.helpers.arrayElement(['PENDIENTE', 'FINALIZADO'] as const),
          pruebaCoombsIndirectaId: coombs.id,
        },
      })
    }

    const numRecienNacidos = fakerES.number.int({ min: 1, max: 2 })
    for (let i = 0; i < numRecienNacidos; i++) {
      const coombs = await prisma.resultadoCoombs.create({
        data: { tipo: 'DIRECTO', positivo: fakerES.datatype.boolean() },
      })

      const bebePersona = await prisma.persona.create({
        data: {
          dni: fakerES.string.numeric({ length: { min: 7, max: 8 } }),
          nombre: fakerES.person.firstName(),
          apellido: fakerES.person.lastName(),
          fechaNacimiento: fakerES.date.between({ from: new Date('2024-01-01'), to: new Date() }),
          direccion: fakerES.location.streetAddress(),
          telefono: `11${fakerES.string.numeric({ length: 8 })}`,
          grupoSanguineoId: fakerES.helpers.arrayElement(grupos).id,
        },
      })

      await prisma.recienNacido.create({
        data: {
          personaId: bebePersona.id,
          gestanteId: gestante.id,
          pruebaCoombsDirectaId: coombs.id,
        },
      })
    }
    created++
  }
  return created
}
