import { apiFetch } from './client'

export interface AuditEntry {
  id: string
  occurredAt: string
  actorName: string
  action: string
  targetType: string
  targetId: string
  targetRef: string | null
  summary: string
}

export function listAudit(token: string): Promise<AuditEntry[]> {
  return apiFetch<AuditEntry[]>('/audit', { token })
}
