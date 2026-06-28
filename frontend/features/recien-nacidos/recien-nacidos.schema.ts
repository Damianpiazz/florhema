import { z } from 'zod'

export const recienNacidoPersonaSchema = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  fechaNacimiento: z.string(),
})

export const resultadoCoombsSchema = z.object({
  id: z.number(),
  tipo: z.string(),
  positivo: z.boolean(),
})

export const recienNacidoSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  gestanteId: z.number(),
  persona: recienNacidoPersonaSchema,
  pruebaCoombsDirecta: resultadoCoombsSchema.nullable(),
  createdAt: z.string(),
})

export const listarRecienNacidosResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(recienNacidoSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
})

export const crearRecienNacidoInputSchema = z.object({
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres').max(10),
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es requerida'),
  direccion: z.string().min(1, 'La dirección es requerida'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  grupoSanguineoId: z.number().int().positive(),
  pruebaCoombsDirecta: z.object({
    tipo: z.literal('DIRECTO'),
    positivo: z.boolean(),
  }),
})

export const actualizarRecienNacidoInputSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellido: z.string().min(1).optional(),
  direccion: z.string().min(1).optional(),
  telefono: z.string().min(1).optional(),
  grupoSanguineoId: z.number().int().positive().optional(),
  pruebaCoombsDirecta: z.object({
    tipo: z.literal('DIRECTO'),
    positivo: z.boolean(),
  }).optional(),
})

export type RecienNacido = z.infer<typeof recienNacidoSchema>
export type ListarRecienNacidosResponse = z.infer<typeof listarRecienNacidosResponseSchema>
export type CrearRecienNacidoInput = z.infer<typeof crearRecienNacidoInputSchema>
export type ActualizarRecienNacidoInput = z.infer<typeof actualizarRecienNacidoInputSchema>
