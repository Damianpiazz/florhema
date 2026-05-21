import { api } from '@/lib/axios'
import { parseLoginResponse } from './auth.dto'
import type { LoginInput, User } from './auth.schema'

export const authService = {
  async login(input: LoginInput): Promise<User> {
    const { data } = await api.post('/auth/login', input)
    return parseLoginResponse(data)
  },

  async getMe(): Promise<User | null> {
    try {
      const { data } = await api.get('/auth/me')
      return parseLoginResponse(data)
    } catch {
      return null
    }
  }
}
