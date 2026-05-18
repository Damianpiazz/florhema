import bcrypt from 'bcrypt'

import { AUTH } from '../config/auth'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH.SALT_ROUNDS)
}
