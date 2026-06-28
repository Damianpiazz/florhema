import { usuarioResponseSchema } from './usuarios.schema'
import type { UsuarioResponse } from './usuarios.schema'

interface UserWithOptionalPassword {
  id: number
  email: string
  name: string | null
  role: string
  createdAt: Date
  password?: string
}

export function toUsuarioResponse(user: UserWithOptionalPassword): UsuarioResponse {
  return usuarioResponseSchema.parse({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  })
}
