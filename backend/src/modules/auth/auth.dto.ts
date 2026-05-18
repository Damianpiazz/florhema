import { userResponseSchema } from '@/modules/auth/auth.schema'
import type { UserResponse } from '@/modules/auth/auth.schema'

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
