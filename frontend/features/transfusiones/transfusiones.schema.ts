import { z } from 'zod'

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

export const transfusionSchema = z.object({
  id: z.number(),
  paciente: z.object({
    id: z.number(),
    personaId: z.number(),
    nombre: z.string(),
    apellido: z.string(),
    dni: z.string(),
  }),
  fecha: z.string(),
  componente: z.string(),
  cantidadUnidades: z.number(),
  reaccionAdversa: z.string().nullable(),
  compatibilidad: compatibilidadSchema.nullable(),
  resultadoCoombs: resultadoCoombsSchema.nullable(),
})

export const transfusionItemResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    item: transfusionSchema,
  }),
})

export const listarTransfusionesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(transfusionSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
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

export const crearTransfusionInputSchema = z.object({
  dni: z.string().min(1, 'El DNI es requerido'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  componente: z.enum(['GLOBULOS_ROJOS', 'PLASMA', 'PLAQUETAS', 'CRIOPRECIPITADO'], {
    message: 'El componente es requerido',
  }),
  cantidadUnidades: z.coerce.number().int().positive().min(1, 'La cantidad mínima es 1 unidad'),
  reaccionAdversa: z.string().nullable().optional(),
  compatibilidad: compatibilidadInputSchema,
  resultadoCoombs: resultadoCoombsInputSchema,
})

export const actualizarTransfusionInputSchema = z.object({
  fecha: z.string().optional(),
  componente: z.enum(['GLOBULOS_ROJOS', 'PLASMA', 'PLAQUETAS', 'CRIOPRECIPITADO']).optional(),
  cantidadUnidades: z.coerce.number().int().positive().min(1).optional(),
  reaccionAdversa: z.string().nullable().optional(),
  compatibilidad: compatibilidadInputSchema.optional(),
  resultadoCoombs: resultadoCoombsInputSchema.optional(),
})

export type Transfusion = z.infer<typeof transfusionSchema>
export type ListarTransfusionesResponse = z.infer<typeof listarTransfusionesResponseSchema>
export type CrearTransfusionInput = z.infer<typeof crearTransfusionInputSchema>
export type ActualizarTransfusionInput = z.infer<typeof actualizarTransfusionInputSchema>
export type CompatibilidadInput = z.infer<typeof compatibilidadInputSchema>
export type ResultadoCoombsInput = z.infer<typeof resultadoCoombsInputSchema>
