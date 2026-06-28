import { z } from 'zod'

export const transfusionQuerySchema = z.object({
  pacienteId: z.coerce.number().int().positive().optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  componente: z.enum(['GLOBULOS_ROJOS', 'PLASMA', 'PLAQUETAS', 'CRIOPRECIPITADO']).optional(),
  limit: z.coerce.number().int().positive().default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
})

export const pacienteEmbebidoSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  nombre: z.string(),
  apellido: z.string(),
  dni: z.string(),
})

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
  paciente: pacienteEmbebidoSchema,
  fecha: z.date().or(z.string()),
  componente: z.string(),
  cantidadUnidades: z.number(),
  reaccionAdversa: z.string().nullable(),
  compatibilidad: compatibilidadSchema.nullable(),
  resultadoCoombs: resultadoCoombsSchema.nullable(),
})

export const transfusionItemResponseSchema = z.object({
  item: transfusionResponseSchema,
})

export const listarTransfusionesResponseSchema = z.object({
  items: z.array(transfusionResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export const compatibilidadInputSchema = z.object({
  donanteGrupoId: z.number().int().positive(),
  receptorGrupoId: z.number().int().positive(),
  compatible: z.boolean(),
  motivoIncompatibilidad: z.string().nullable().optional(),
})

export const resultadoCoombsInputSchema = z.object({
  tipo: z.enum(['DIRECTO', 'INDIRECTO']),
  positivo: z.boolean(),
})

export const crearTransfusionSchema = z.object({
  dni: z.string().min(1, 'El DNI es requerido'),
  fecha: z.coerce.date(),
  componente: z.enum(['GLOBULOS_ROJOS', 'PLASMA', 'PLAQUETAS', 'CRIOPRECIPITADO']),
  cantidadUnidades: z.number().int().positive().min(1, 'La cantidad mínima es 1 unidad'),
  reaccionAdversa: z.string().nullable().optional(),
  compatibilidad: compatibilidadInputSchema,
  resultadoCoombs: resultadoCoombsInputSchema,
})

export const actualizarTransfusionSchema = z.object({
  fecha: z.coerce.date().optional(),
  componente: z.enum(['GLOBULOS_ROJOS', 'PLASMA', 'PLAQUETAS', 'CRIOPRECIPITADO']).optional(),
  cantidadUnidades: z.number().int().positive().min(1).optional(),
  reaccionAdversa: z.string().nullable().optional(),
  compatibilidad: compatibilidadInputSchema.optional(),
  resultadoCoombs: resultadoCoombsInputSchema.optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
})

export type TransfusionQuery = z.infer<typeof transfusionQuerySchema>
export type TransfusionResponse = z.infer<typeof transfusionResponseSchema>
export type CrearTransfusionInput = z.infer<typeof crearTransfusionSchema>
export type ActualizarTransfusionInput = z.infer<typeof actualizarTransfusionSchema>
