import { z } from 'zod'

export const personaSchema = z.object({
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
})

export const personaFormInputSchema = z.object({
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  fechaNacimiento: z.string(),
  direccion: z.string(),
  telefono: z.string(),
  grupoSanguineoId: z.number(),
})

export const personaItemResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    item: personaSchema,
  }),
})

export const listarPersonasResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(personaSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
})

export type Persona = z.infer<typeof personaSchema>
export type PersonaFormInput = z.infer<typeof personaFormInputSchema>
export type ListarPersonasResponse = z.infer<typeof listarPersonasResponseSchema>
