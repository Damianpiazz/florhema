import { z } from 'zod'

export const resultadoSerologiaSchema = z.object({
  id: z.number(),
  hiv: z.boolean(),
  hcv: z.boolean(),
  hbv: z.boolean(),
  chagas: z.boolean(),
  sifilis: z.boolean(),
})

export const resultadoCoombsSchema = z.object({
  id: z.number(),
  tipo: z.string(),
  positivo: z.boolean(),
})

export const compatibilidadSchema = z.object({
  id: z.number(),
  compatible: z.boolean(),
  motivoIncompatibilidad: z.string().nullable(),
  donanteGrupo: z.object({ id: z.number(), tipo: z.string(), factorRh: z.string() }),
  receptorGrupo: z.object({ id: z.number(), tipo: z.string(), factorRh: z.string() }),
})

export const personaDetalleSchema = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  fechaNacimiento: z.string(),
  direccion: z.string(),
  telefono: z.string(),
  grupoSanguineo: z.object({
    id: z.number(),
    tipo: z.string(),
    factorRh: z.string(),
  }),
  donante: z.object({ id: z.number(), semaforoAptitud: z.string() }).nullable(),
  paciente: z.object({ id: z.number() }).nullable(),
  gestante: z.object({ id: z.number(), antecedentesObstetricos: z.string().nullable() }).nullable(),
})

export const donacionSchema = z.object({
  id: z.number(),
  fecha: z.string(),
  peso: z.number(),
  tensionArterial: z.string(),
  hemoglobina: z.number(),
  tipoDonacion: z.string(),
  reaccionAdversa: z.string().nullable(),
  resultadoSerologia: resultadoSerologiaSchema.nullable(),
})

export const transfusionSchema = z.object({
  id: z.number(),
  fecha: z.string(),
  componente: z.string(),
  cantidadUnidades: z.number(),
  reaccionAdversa: z.string().nullable(),
  compatibilidad: compatibilidadSchema.nullable(),
  resultadoCoombs: resultadoCoombsSchema.nullable(),
})

export const estudioGestanteSchema = z.object({
  id: z.number(),
  fecha: z.string(),
  compatibilidadConyugal: z.string().nullable(),
  estadoEstudio: z.string(),
  pruebaCoombsIndirecta: resultadoCoombsSchema.nullable(),
})

export const recienNacidoSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  pruebaCoombsDirecta: resultadoCoombsSchema.nullable(),
})

export const actividadItemSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('DONACION'),
    fecha: z.string(),
    id: z.number(),
    peso: z.number(),
    tensionArterial: z.string(),
    hemoglobina: z.number(),
    tipoDonacion: z.string(),
    reaccionAdversa: z.string().nullable(),
    resultadoSerologia: resultadoSerologiaSchema.nullable(),
  }),
  z.object({
    tipo: z.literal('TRANSFUSION'),
    fecha: z.string(),
    id: z.number(),
    componente: z.string(),
    cantidadUnidades: z.number(),
    reaccionAdversa: z.string().nullable(),
    compatibilidad: compatibilidadSchema.nullable(),
    resultadoCoombs: resultadoCoombsSchema.nullable(),
  }),
  z.object({
    tipo: z.literal('ESTUDIO_GESTANTE'),
    fecha: z.string(),
    id: z.number(),
    compatibilidadConyugal: z.string().nullable(),
    estadoEstudio: z.string(),
    pruebaCoombsIndirecta: resultadoCoombsSchema.nullable(),
  }),
  z.object({
    tipo: z.literal('RECIEN_NACIDO'),
    fecha: z.string(),
    id: z.number(),
    personaId: z.number(),
    pruebaCoombsDirecta: resultadoCoombsSchema.nullable(),
  }),
])

export const listarResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.object({
      items: z.array(itemSchema),
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
    }),
  })

export const personaDetalleResponseSchema = z.object({
  success: z.literal(true),
  data: personaDetalleSchema,
})

export type PersonaDetalle = z.infer<typeof personaDetalleSchema>
export type Donacion = z.infer<typeof donacionSchema>
export type Transfusion = z.infer<typeof transfusionSchema>
export type EstudioGestante = z.infer<typeof estudioGestanteSchema>
export type RecienNacido = z.infer<typeof recienNacidoSchema>
export type ActividadItem = z.infer<typeof actividadItemSchema>
