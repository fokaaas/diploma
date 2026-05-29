import { createFileRoute } from '@tanstack/react-router'
import { AuditScreen } from '../../features/audit/AuditScreen'
import { sessionStore } from '../../lib/auth/session'
import { listAudit, type AuditEntry } from '../../lib/api/audit'

export interface AuditData {
  entries: AuditEntry[]
}

export const Route = createFileRoute('/_app/audit')({
  loader: async (): Promise<AuditData> => {
    const session = sessionStore.getSnapshot()
    const token = session?.accessToken
    const role = session?.user.role
    // The `_app` layout renders AccessDenied for other roles; skip the fetch
    // (which is ADMIN/AUDITOR-only) so it doesn't 403.
    if (!token || (role !== 'admin' && role !== 'auditor')) {
      return { entries: [] }
    }
    return { entries: await listAudit(token) }
  },
  component: AuditScreen,
})
