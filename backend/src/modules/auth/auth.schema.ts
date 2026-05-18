import { z } from 'zod'

export const registerSchema = z.object({
  email: z
    .string()
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().optional()
})

export const userResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string().nullable(),
  role: z.enum(['ADMIN', 'USER', 'INVITADO'])
})

export const registerResponseSchema = z.object({
  user: userResponseSchema,
  token: z.string()
})

export type RegisterInput = z.infer<typeof registerSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
export type RegisterResponse = z.infer<typeof registerResponseSchema>