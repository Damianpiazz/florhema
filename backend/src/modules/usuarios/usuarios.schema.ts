import { z } from 'zod'

const roleEnum = z.enum(['ADMIN', 'USER', 'INVITADO'])

export const crearUsuarioSchema = z.object({
  email: z.string().email('El email debe ser válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().optional(),
  role: roleEnum.default('USER'),
})

export const actualizarUsuarioSchema = z.object({
  email: z.string().email('El email debe ser válido').optional(),
  name: z.string().optional().nullable(),
  role: roleEnum.optional(),
}).superRefine((data, ctx) => {
  if (data.email === undefined && data.name === undefined && data.role === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Debe proporcionar al menos un campo a actualizar',
      path: [],
    })
  }
})

export const usuarioResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string().nullable(),
  role: z.string(),
  createdAt: z.date(),
})

export const listarUsuariosQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
})

export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>
export type ActualizarUsuarioInput = z.infer<typeof actualizarUsuarioSchema>
export type UsuarioResponse = z.infer<typeof usuarioResponseSchema>
export type ListarUsuariosQuery = z.infer<typeof listarUsuariosQuerySchema>
