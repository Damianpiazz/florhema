import { describe, it, expect } from 'vitest'
import { loginSchema, userSchema, loginResponseSchema } from '@/features/auth/auth.schema'

describe('loginSchema', () => {
  it('acepta email valido y password de 6+ caracteres', () => {
    const result = loginSchema.safeParse({ email: 'test@hospital.com', password: '123456' })
    expect(result.success).toBe(true)
  })

  it('rechaza email invalido', () => {
    const result = loginSchema.safeParse({ email: 'invalido', password: '123456' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true)
    }
  })

  it('rechaza password menor a 6 caracteres', () => {
    const result = loginSchema.safeParse({ email: 'test@hospital.com', password: '12345' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('password'))).toBe(true)
    }
  })

  it('rechaza password vacio', () => {
    const result = loginSchema.safeParse({ email: 'test@hospital.com', password: '' })
    expect(result.success).toBe(false)
  })

  it('rechaza email vacio', () => {
    const result = loginSchema.safeParse({ email: '', password: '123456' })
    expect(result.success).toBe(false)
  })

  it('rechaza datos faltantes', () => {
    const result = loginSchema.safeParse({ email: 'test@hospital.com' })
    expect(result.success).toBe(false)
  })
})

describe('userSchema', () => {
  it('acepta un usuario valido', () => {
    const result = userSchema.safeParse({
      id: 1,
      email: 'test@hospital.com',
      name: 'Facundo',
      role: 'ADMIN'
    })
    expect(result.success).toBe(true)
  })

  it('acepta name null', () => {
    const result = userSchema.safeParse({
      id: 1,
      email: 'test@hospital.com',
      name: null,
      role: 'USER'
    })
    expect(result.success).toBe(true)
  })

  it('rechaza rol invalido', () => {
    const result = userSchema.safeParse({
      id: 1,
      email: 'test@hospital.com',
      name: null,
      role: 'SUPER_ADMIN'
    })
    expect(result.success).toBe(false)
  })

  it('rechaza id no numerico', () => {
    const result = userSchema.safeParse({
      id: 'uno',
      email: 'test@hospital.com',
      name: null,
      role: 'USER'
    })
    expect(result.success).toBe(false)
  })
})

describe('loginResponseSchema', () => {
  const validUser = {
    id: 1,
    email: 'test@hospital.com',
    name: 'Facundo',
    role: 'ADMIN'
  }

  it('acepta respuesta valida con usuario', () => {
    const result = loginResponseSchema.safeParse({
      success: true,
      data: { user: validUser }
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data.user.email).toBe('test@hospital.com')
    }
  })

  it('rechaza success false', () => {
    const result = loginResponseSchema.safeParse({
      success: false,
      data: { user: validUser }
    })
    expect(result.success).toBe(false)
  })

  it('rechaza respuesta sin user', () => {
    const result = loginResponseSchema.safeParse({
      success: true,
      data: {}
    })
    expect(result.success).toBe(false)
  })
})
