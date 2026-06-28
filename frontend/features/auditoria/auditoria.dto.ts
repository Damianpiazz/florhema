import type { AuditoriaEntry } from './auditoria.schema'

export function parseAuditoriaEntry(data: any): AuditoriaEntry {
  return {
    id: data.id,
    action: data.action,
    entity: data.entity,
    entityId: data.entityId,
    oldValues: data.oldValues ?? null,
    newValues: data.newValues ?? null,
    createdAt: data.createdAt,
    usuario: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name ?? null,
    },
  }
}
