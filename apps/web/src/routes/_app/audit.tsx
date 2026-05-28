import { createFileRoute } from '@tanstack/react-router'
import { AuditScreen } from '../../features/audit/AuditScreen'

export const Route = createFileRoute('/_app/audit')({
  component: AuditScreen,
})
