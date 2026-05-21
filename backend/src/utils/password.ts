import bcrypt from 'bcrypt'

import { AUTH } from '../config/auth'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH.SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
