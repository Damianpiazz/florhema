import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string().nullable(),
  role: z.enum(['ADMIN', 'USER', 'INVITADO']),
})
export type User = z.infer<typeof userSchema>

export const loginResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({ user: userSchema }),
})
export type LoginResponse = z.infer<typeof loginResponseSchema>
