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

export type PersonaResponse = z.infer<typeof personaResponseSchema>
export type CrearPersonaInput = z.infer<typeof crearPersonaSchema>
export type ActualizarPersonaInput = z.infer<typeof actualizarPersonaSchema>