export interface Usuario {
  id: number
  email: string
  name: string | null
  role: 'ADMIN' | 'USER' | 'INVITADO'
  createdAt: string
}

export interface CrearUsuarioInput {
  email: string
  password: string
  name?: string
  role: 'ADMIN' | 'USER' | 'INVITADO'
}

export interface ActualizarUsuarioInput {
  email?: string
  name?: string
  role?: 'ADMIN' | 'USER' | 'INVITADO'
}
