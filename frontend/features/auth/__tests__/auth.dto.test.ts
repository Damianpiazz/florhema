import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod'
import { parseLoginResponse } from '@/features/auth/auth.dto'

describe('parseLoginResponse', () => {
  it('retorna User cuando los datos son validos', () => {
    const result = parseLoginResponse({
      success: true,
      data: {
        user: { id: 1, email: 'test@hospital.com', name: 'Facundo', role: 'ADMIN' }
      }
    })

    expect(result).toEqual({
      id: 1,
      email: 'test@hospital.com',
      name: 'Facundo',
      role: 'ADMIN'
    })
  })

  it('lanza ZodError cuando success no es true', () => {
    expect(() =>
      parseLoginResponse({
        success: false,
        data: { user: { id: 1, email: 'test@hospital.com', name: null, role: 'USER' } }
      })
    ).toThrow(ZodError)
  })

  it('lanza ZodError cuando falta user', () => {
    expect(() =>
      parseLoginResponse({ success: true, data: {} })
    ).toThrow(ZodError)
  })

  it('lanza ZodError cuando el rol es invalido', () => {
    expect(() =>
      parseLoginResponse({
        success: true,
        data: { user: { id: 1, email: 'test@hospital.com', name: null, role: 'SUPER_ADMIN' } }
      })
    ).toThrow(ZodError)
  })

  it('lanza ZodError cuando los datos son null', () => {
    expect(() => parseLoginResponse(null)).toThrow(ZodError)
  })
})
