import { userResponseSchema, registerResponseSchema } from '@/modules/auth/auth.schema'
import type { UserResponse, RegisterResponse } from '@/modules/auth/auth.schema'

export function toUserResponse(user: {
  id: number
  email: string
  name: string | null
  role: string
}): UserResponse {
  return userResponseSchema.parse({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })
}

export function toRegisterResponse(user: UserResponse, token: string): RegisterResponse {
  return registerResponseSchema.parse({ user, token })
}
