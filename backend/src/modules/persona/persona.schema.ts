import { z } from 'zod'

export const personaQuerySchema = z.object({
  dni: z.string().optional(),
  limit: z.coerce.number().int().positive().default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
})

export const grupoSanguineoEmbebidoSchema = z.object({
  id: z.number(),
  tipo: z.string(),
  factorRh: z.string(),
})

export const personaResponseSchema = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  fechaNacimiento: z.date().or(z.string()),
  direccion: z.string(),
  telefono: z.string(),
  grupoSanguineo: grupoSanguineoEmbebidoSchema,
})

export const listarPersonasResponseSchema = z.object({
  items: z.array(personaResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export const crearPersonaSchema = z.object({
  dni: z
    .string()
    .min(7, 'El DNI debe tener al menos 7 caracteres')
    .max(10, 'El DNI debe tener como máximo 10 caracteres'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  fechaNacimiento: z.coerce.date().refine((v) => !Number.isNaN(v.getTime()), 'Fecha de nacimiento inválida'),
  direccion: z.string().min(1, 'La dirección es requerida'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  grupoSanguineoId: z.number().int().positive('El grupo sanguíneo es requerido'),
})

export const crearPersonaResponseSchema = z.object({
  item: personaResponseSchema,
})

export const actualizarPersonaSchema = crearPersonaSchema

export const actualizarPersonaResponseSchema = z.object({
  item: personaResponseSchema,
})

// =========================
// DETALLE PERSONA (GET /:id)
// =========================

export const personaDetalleResponseSchema = personaResponseSchema.extend({
  donante: z.object({ id: z.number(), semaforoAptitud: z.string() }).nullable(),
  paciente: z.object({ id: z.number() }).nullable(),
  gestante: z.object({ id: z.number(), antecedentesObstetricos: z.string().nullable() }).nullable(),
})

// =========================
// DONACIONES
// =========================

export const resultadoSerologiaSchema = z.object({
  id: z.number(),
  hiv: z.boolean(),
  hcv: z.boolean(),
  hbv: z.boolean(),
  chagas: z.boolean(),
  sifilis: z.boolean(),
})

export const donacionResponseSchema = z.object({
  id: z.number(),
  fecha: z.date().or(z.string()),
  peso: z.number(),
  tensionArterial: z.string(),
  hemoglobina: z.number(),
  tipoDonacion: z.string(),
  reaccionAdversa: z.string().nullable(),
  resultadoSerologia: resultadoSerologiaSchema.nullable(),
})

export const listarDonacionesResponseSchema = z.object({
  items: z.array(donacionResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

// =========================
// TRANSFUSIONES
// =========================

export const compatibilidadSchema = z.object({
  id: z.number(),
  compatible: z.boolean(),
  motivoIncompatibilidad: z.string().nullable(),
  donanteGrupo: z.object({ id: z.number(), tipo: z.string(), factorRh: z.string() }),
  receptorGrupo: z.object({ id: z.number(), tipo: z.string(), factorRh: z.string() }),
})

export const resultadoCoombsSchema = z.object({
  id: z.number(),
  tipo: z.string(),
  positivo: z.boolean(),
})

export const transfusionResponseSchema = z.object({
  id: z.number(),
  fecha: z.date().or(z.string()),
  componente: z.string(),
  cantidadUnidades: z.number(),
  reaccionAdversa: z.string().nullable(),
  compatibilidad: compatibilidadSchema.nullable(),
  resultadoCoombs: resultadoCoombsSchema.nullable(),
})

export const listarTransfusionesResponseSchema = z.object({
  items: z.array(transfusionResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

// =========================
// ESTUDIOS GESTANTE
// =========================

export const estudioGestanteResponseSchema = z.object({
  id: z.number(),
  fecha: z.date().or(z.string()),
  compatibilidadConyugal: z.string().nullable(),
  estadoEstudio: z.string(),
  pruebaCoombsIndirecta: resultadoCoombsSchema.nullable(),
})

export const listarEstudiosGestanteResponseSchema = z.object({
  items: z.array(estudioGestanteResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

// =========================
// RECIEN NACIDOS
// =========================

export const recienNacidoResponseSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  pruebaCoombsDirecta: resultadoCoombsSchema.nullable(),
})

export const listarRecienNacidosResponseSchema = z.object({
  items: z.array(recienNacidoResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

// =========================
// ACTIVIDAD
// =========================

export const actividadItemSchema = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('DONACION'), fecha: z.date().or(z.string()), id: z.number(), peso: z.number(), tensionArterial: z.string(), hemoglobina: z.number(), tipoDonacion: z.string(), reaccionAdversa: z.string().nullable(), resultadoSerologia: resultadoSerologiaSchema.nullable() }),
  z.object({ tipo: z.literal('TRANSFUSION'), fecha: z.date().or(z.string()), id: z.number(), componente: z.string(), cantidadUnidades: z.number(), reaccionAdversa: z.string().nullable(), compatibilidad: compatibilidadSchema.nullable(), resultadoCoombs: resultadoCoombsSchema.nullable() }),
  z.object({ tipo: z.literal('ESTUDIO_GESTANTE'), fecha: z.date().or(z.string()), id: z.number(), compatibilidadConyugal: z.string().nullable(), estadoEstudio: z.string(), pruebaCoombsIndirecta: resultadoCoombsSchema.nullable() }),
  z.object({ tipo: z.literal('RECIEN_NACIDO'), fecha: z.date().or(z.string()), id: z.number(), personaId: z.number(), pruebaCoombsDirecta: resultadoCoombsSchema.nullable() }),
])

export const listarActividadResponseSchema = z.object({
  items: z.array(actividadItemSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

// =========================
// PAGINACION
// =========================

export const paginatedQuerySchema = z.object({
  limit: z.coerce.number().int().positive().default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
})

// =========================
// TYPES
// =========================

export type PersonaResponse = z.infer<typeof personaResponseSchema>
export type PersonaDetalleResponse = z.infer<typeof personaDetalleResponseSchema>
export type DonacionResponse = z.infer<typeof donacionResponseSchema>
export type TransfusionResponse = z.infer<typeof transfusionResponseSchema>
export type EstudioGestanteResponse = z.infer<typeof estudioGestanteResponseSchema>
export type RecienNacidoResponse = z.infer<typeof recienNacidoResponseSchema>
export type ActividadItem = z.infer<typeof actividadItemSchema>
export type CrearPersonaInput = z.infer<typeof crearPersonaSchema>
export type ActualizarPersonaInput = z.infer<typeof actualizarPersonaSchema>