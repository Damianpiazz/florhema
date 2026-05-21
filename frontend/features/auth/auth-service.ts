import { api } from '@/lib/axios'

export interface User {
  id: number
  email: string
  name: string | null
  role: 'ADMIN' | 'USER' | 'INVITADO'
}

export interface RegisterInput {
  email: string
  password: string
  name?: string
}

export const authService = {
  async register(input: RegisterInput): Promise<User> {
    const { data } = await api.post<{ success: true; data: { user: User } }>(
      '/auth/register',
      input
    )
    return data.data.user
  },

  async getMe(): Promise<User | null> {
    try {
      const { data } = await api.get<{ success: true; data: { user: User | null } }>('/auth/me')
      return data.data.user
    } catch {
      return null
    }
  }
}
