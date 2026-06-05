import { AsyncLocalStorage } from 'node:async_hooks'

const auditStorage = new AsyncLocalStorage<{ userId: number }>()

export function getCurrentUserId(): number | null {
  const store = auditStorage.getStore()
  return store?.userId ?? null
}

export function runWithAuditContext(userId: number, fn: () => Promise<void>) {
  return auditStorage.run({ userId }, fn)
}

export { auditStorage }
