import { env } from '@/config/env'
import { devProfile } from './dev-profile'
import { prodProfile } from './prod-profile'
import { testProfile } from './test-profile'

export type Profile = typeof devProfile

const profileMap: Record<string, Profile> = {
  development: devProfile,
  production: prodProfile,
  test: testProfile,
}

/**
 * Returns the active profile for the current `NODE_ENV`.
 * Falls back to `development` when unset or unknown.
 */
export const profile: Profile = (() => {
  const p = profileMap[env.NODE_ENV]
  if (p) return p

  console.warn(
    `[profiles] Unknown NODE_ENV "${env.NODE_ENV}", falling back to development`,
  )
  return devProfile
})()

/**
 * Convenience export for the most common checks.
 */
export const isDev = env.NODE_ENV === 'development'
export const isProd = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'
