import * as auditRepository from './audit.repository'
import type { AuditFilters } from './audit.repository'

export async function listar(filters: AuditFilters) {
  return auditRepository.findAll(filters)
}
